/**
 * Stage B: shared HP, feature gates, sync.
 * npm run test:party-battle-stage-b
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import {
  isPartyBattleEngineEnabled,
  canStartPartyBattleViaRoute,
  isPartyBattleRewardDistributionReady,
} from '../src/domain/partyBattleFlags.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import {
  startOrJoinPartyBattleInTx,
  shouldStartPartyBattleInTx,
} from '../src/services/party/partyBattleStartJoinService.js';
import {
  applyPartyBattleSharedDamageInTx,
  partyBattleLockTrace,
} from '../src/services/party/partyBattleActionLock.js';
import {
  createActivePartyBattleSessionInTx,
} from '../src/services/party/partyBattleSessionService.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import { performPartyBattleLethalAttack } from './partyBattleSmokeLethalHelper.js';

const CANONICAL_SPAWN = MAP_WORLD_SPAWNS[0]!;

let passed = 0;
const partyTableQueries: string[] = [];

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function trackPartyBattleQueries(): void {
  partyTableQueries.length = 0;
  const models = ['PartyBattleSession', 'PartyBattleParticipant', 'PartyKillReward'] as const;
  for (const model of models) {
    const delegate = (prisma as Record<string, unknown>)[
      model.charAt(0).toLowerCase() + model.slice(1)
    ] as Record<string, Function>;
    for (const method of Object.keys(delegate)) {
      if (typeof delegate[method] !== 'function' || method.startsWith('_')) continue;
      const orig = delegate[method].bind(delegate);
      delegate[method] = (...args: unknown[]) => {
        partyTableQueries.push(`${model}.${method}`);
        return orig(...args);
      };
    }
  }
}

async function createTestAccount(label: string): Promise<{
  userId: string;
  characterId: string;
}> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbb_${label}_${suffix}`;
  const name = `S${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
          worldX: CANONICAL_SPAWN.worldX,
          worldY: CANONICAL_SPAWN.worldY,
        },
      },
    },
    include: { characters: true },
  });
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function testFlagOffNoPartyTableQueries(): Promise<void> {
  console.log('\n[gate] flag off → 0 party battle table queries');
  delete process.env.PARTY_BATTLE_ENABLED;
  delete process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;
  assert.equal(isPartyBattleEngineEnabled(), false);

  trackPartyBattleQueries();
  const { userId, characterId } = await createTestAccount('off');
  const party = await createPartyForUser(userId, characterId);

  await prisma.$transaction(async (tx) => {
    const hint = await shouldStartPartyBattleInTx(
      tx,
      characterId,
      CANONICAL_SPAWN.kind,
      false
    );
    assert.equal(hint, null);
  });

  assert.equal(partyTableQueries.length, 0, partyTableQueries.join(', '));
  ok('shouldStartPartyBattleInTx → null, 0 queries');

  partyTableQueries.length = 0;
  const char = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  await prisma.$transaction(async (tx) => {
    await startBattleInTx(tx, userId, CANONICAL_SPAWN.id, char.revision, {
      characterId,
    });
  });

  assert.equal(partyTableQueries.length, 0);
  const after = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  const bj = after.battleJson as Record<string, unknown> | null;
  assert.ok(bj);
  assert.equal(bj!.partyBattleId, undefined);
  ok('party member solo start — no partyBattleId, 0 queries');

  await prisma.user.delete({ where: { id: userId } });
  await prisma.party.deleteMany({ where: { id: party.party!.id } });
}

async function withFlags<T>(
  fn: () => Promise<T>
): Promise<T> {
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'false';
  assert.equal(canStartPartyBattleViaRoute(), true);
  assert.equal(isPartyBattleRewardDistributionReady(), false);
  try {
    return await fn();
  } finally {
    /* keep flags for rest of suite */
  }
}

async function testPartyMembersSeparateWorldBattles(): Promise<void> {
  console.log('\n[party] world farm — separate solo battles per member');
  await withFlags(async () => {
    const a = await createTestAccount('wf');
    const b = await createTestAccount('wf2');
    await createPartyForUser(a.userId, a.characterId);
    const membership = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });
    await prisma.partyMember.create({
      data: {
        partyId: membership.partyId,
        characterId: b.characterId,
        slotOrder: 1,
      },
    });

    const spawnA = CANONICAL_SPAWN;
    const spawnB =
      MAP_WORLD_SPAWNS.find(
        (s) => s.id !== spawnA.id && s.kind !== 'raid' && s.kind !== 'epic'
      ) ?? spawnA;

    await prisma.character.update({
      where: { id: a.characterId },
      data: { worldX: spawnA.worldX, worldY: spawnA.worldY },
    });
    await prisma.character.update({
      where: { id: b.characterId },
      data: { worldX: spawnB.worldX, worldY: spawnB.worldY },
    });

    const charA = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    const charB = await prisma.character.findUniqueOrThrow({
      where: { id: b.characterId },
    });

    const hint = await prisma.$transaction((tx) =>
      shouldStartPartyBattleInTx(tx, a.characterId, spawnA.kind, false)
    );
    assert.equal(hint, null);
    ok('shouldStartPartyBattleInTx → null for world mob');

    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, spawnA.id, charA.revision, {
        characterId: a.characterId,
      })
    );
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, b.userId, spawnB.id, charB.revision, {
        characterId: b.characterId,
      })
    );

    const afterA = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    const afterB = await prisma.character.findUniqueOrThrow({
      where: { id: b.characterId },
    });
    const bjA = afterA.battleJson as Record<string, unknown> | null;
    const bjB = afterB.battleJson as Record<string, unknown> | null;
    assert.ok(bjA?.spawnId);
    assert.ok(bjB?.spawnId);
    assert.equal(bjA!.partyBattleId, undefined);
    assert.equal(bjB!.partyBattleId, undefined);
    if (spawnB.id !== spawnA.id) {
      assert.notEqual(bjA!.spawnId, bjB!.spawnId);
    }

    const sessions = await prisma.partyBattleSession.findMany({
      where: {
        originPartyId: membership.partyId,
        state: PARTY_BATTLE_SESSION_STATE.active,
      },
    });
    assert.equal(sessions.length, 0);
    ok('two party members — separate world battles, no party session');

    let errMsg = '';
    try {
      await prisma.$transaction((tx) =>
        startBattleInTx(tx, a.userId, spawnB.id, afterA.revision, {
          characterId: a.characterId,
        })
      );
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }
    assert.notEqual(errMsg, 'party_battle_wrong_spawn');
    ok('second world mob while in battle — not party_battle_wrong_spawn');

    await prisma.user.delete({ where: { id: a.userId } });
    await prisma.user.delete({ where: { id: b.userId } });
  });
}

async function testWrongSpawnError(): Promise<void> {
  console.log('\n[party] wrong spawn → party_battle_wrong_spawn');
  await withFlags(async () => {
    const a = await createTestAccount('ws');
    await createPartyForUser(a.userId, a.characterId);
    const party = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });

    await prisma.$transaction(async (tx) => {
      await createActivePartyBattleSessionInTx(tx, {
        partyId: party.partyId,
        spawnId: CANONICAL_SPAWN.id,
        canonicalMobTemplateId: CANONICAL_SPAWN.templateId,
        mobWorldX: CANONICAL_SPAWN.worldX,
        mobWorldY: CANONICAL_SPAWN.worldY,
        mobMaxHp: 500,
        starterCharacterId: a.characterId,
      });
    });

    const otherSpawn = MAP_WORLD_SPAWNS.find((s) => s.id !== CANONICAL_SPAWN.id)!;
    const char = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });

    let errMsg = '';
    try {
      await prisma.$transaction(async (tx) => {
        await startOrJoinPartyBattleInTx(tx, {
          userId: a.userId,
          char: { ...char, worldX: otherSpawn.worldX, worldY: otherSpawn.worldY } as typeof char,
          spawn: otherSpawn,
          expectedRevision: char.revision,
          partyId: party.partyId,
          wTick: null,
          nowStartMs: Date.now(),
        });
      });
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }
    assert.equal(errMsg, 'party_battle_wrong_spawn');
    ok('join different spawn rejected');

    await prisma.partyBattleSession.deleteMany({ where: { originPartyId: party.partyId } });
    await prisma.user.delete({ where: { id: a.userId } });
  });
}

async function testSharedHpTwoAttackers(): Promise<void> {
  console.log('\n[party] A+B simultaneous shared HP');
  await withFlags(async () => {
    const a = await createTestAccount('sh');
    const b = await createTestAccount('sh2');
    await createPartyForUser(a.userId, a.characterId);
    const membership = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });
    await prisma.partyMember.create({
      data: {
        partyId: membership.partyId,
        characterId: b.characterId,
        slotOrder: 1,
      },
    });

    const session = await prisma.$transaction(async (tx) => {
      const s = await createActivePartyBattleSessionInTx(tx, {
        partyId: membership.partyId,
        spawnId: CANONICAL_SPAWN.id,
        canonicalMobTemplateId: CANONICAL_SPAWN.templateId,
        mobWorldX: CANONICAL_SPAWN.worldX,
        mobWorldY: CANONICAL_SPAWN.worldY,
        mobMaxHp: 500,
        starterCharacterId: a.characterId,
      });
      await tx.partyBattleParticipant.upsert({
        where: {
          partyBattleId_characterId: {
            partyBattleId: s.id,
            characterId: b.characterId,
          },
        },
        create: {
          partyBattleId: s.id,
          characterId: b.characterId,
          active: true,
        },
        update: { active: true, leftAt: null },
      });
      return s;
    });

    await Promise.all([
      prisma.$transaction((tx) =>
        applyPartyBattleSharedDamageInTx(tx, {
          sessionId: session.id,
          characterId: a.characterId,
          damage: 100,
        })
      ),
      prisma.$transaction((tx) =>
        applyPartyBattleSharedDamageInTx(tx, {
          sessionId: session.id,
          characterId: b.characterId,
          damage: 80,
        })
      ),
    ]);

    const after = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: session.id },
    });
    assert.equal(after.mobHp, 320);
    assert.ok(after.mobHp >= 0);
    ok('shared HP 500-100-80=320');

    await prisma.partyBattleSession.delete({ where: { id: session.id } });
    await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
  });
}

async function testSyncReadOnly(): Promise<void> {
  console.log('\n[sync] read-only partyBattle DTO');
  await withFlags(async () => {
    const a = await createTestAccount('sy');
    await createPartyForUser(a.userId, a.characterId);
    const party = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });
    const char0 = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    await prisma.$transaction((tx) =>
      startOrJoinPartyBattleInTx(tx, {
        userId: a.userId,
        char: char0 as typeof char0,
        spawn: CANONICAL_SPAWN,
        expectedRevision: char0.revision,
        partyId: party.partyId,
        wTick: null,
        nowStartMs: Date.now(),
      })
    );

    const char1 = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    const bj = char1.battleJson as BattleJsonState;
    assert.ok(bj.partyBattleId);

    const sessionBefore = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: bj.partyBattleId! },
    });
    const bvBefore = sessionBefore.battleVersion;
    const activityBefore = sessionBefore.lastActivityAt.getTime();

    const sync = await getBattleSyncForUser(a.userId, {
      characterId: a.characterId,
      battleVersion: bj.battleVersion,
    });
    assert.ok(sync);
    assert.ok(sync!.partyBattle);
    assert.equal(sync!.partyBattle!.mobHp, sessionBefore.mobHp);

    const sessionAfter = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: bj.partyBattleId! },
    });
    assert.equal(sessionAfter.battleVersion, bvBefore);
    assert.equal(sessionAfter.lastActivityAt.getTime(), activityBefore);
    assert.equal(char1.revision, (await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    })).revision);
    ok('sync read-only — no lastActivityAt/battleVersion/revision bump');

    await prisma.partyBattleSession.delete({ where: { id: bj.partyBattleId! } });
    await prisma.user.delete({ where: { id: a.userId } });
  });
}

async function testLethalZeroEconomy(): Promise<void> {
  console.log('\n[lethal] test victory — 0 economy');
  await withFlags(async () => {
    const a = await createTestAccount('lt');
    await createPartyForUser(a.userId, a.characterId);
    const party = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });
    const char0 = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    await prisma.$transaction((tx) =>
      startOrJoinPartyBattleInTx(tx, {
        userId: a.userId,
        char: char0 as typeof char0,
        spawn: CANONICAL_SPAWN,
        expectedRevision: char0.revision,
        partyId: party.partyId,
        wTick: null,
        nowStartMs: Date.now(),
      })
    );

    let char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    const expBefore = char.exp;
    const adenaBefore = char.adena;
    const sessionId = (char.battleJson as BattleJsonState).partyBattleId!;
    assert.ok(sessionId);

    await performPartyBattleLethalAttack({
      userId: a.userId,
      characterId: a.characterId,
      battleSpawnId: CANONICAL_SPAWN.id,
    });

    char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    assert.equal(Number(char.exp), Number(expBefore));
    assert.equal(char.adena, adenaBefore);
    assert.equal(char.battleJson, null);

    const session = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: sessionId },
    });
    assert.equal(session.endReason, PARTY_BATTLE_END_REASON.stage_b_test_victory);
    assert.equal(session.activePartyKey, null);
    ok('lethal test — no exp/adena, battleJson cleared');

    await prisma.partyBattleSession.delete({ where: { id: sessionId } });
    await prisma.user.delete({ where: { id: a.userId } });
  });
}

function parseBattleJsonLocal(raw: unknown): BattleJsonState | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.spawnId !== 'string') return null;
  return raw as BattleJsonState;
}

async function testSessionLockBeforeCharacterWrite(): Promise<void> {
  console.log('\n[lock] session before Character write');
  process.env.PARTY_BATTLE_LOCK_TRACE = 'true';
  partyBattleLockTrace.reset();
  try {
    await withFlags(async () => {
    const a = await createTestAccount('lk');
    await createPartyForUser(a.userId, a.characterId);
    const party = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    });
    const char0 = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    await prisma.$transaction((tx) =>
      startOrJoinPartyBattleInTx(tx, {
        userId: a.userId,
        char: char0 as typeof char0,
        spawn: CANONICAL_SPAWN,
        expectedRevision: char0.revision,
        partyId: party.partyId,
        wTick: null,
        nowStartMs: Date.now(),
      })
    );

    const char = await prisma.character.findUniqueOrThrow({
      where: { id: a.characterId },
    });
    partyBattleLockTrace.reset();
    await prisma.$transaction((tx) =>
      performBattleActionInTx(tx, a.userId, 'attack', char.revision, {
        characterId: a.characterId,
        battleSpawnId: CANONICAL_SPAWN.id,
      })
    );

    const lockIdx = partyBattleLockTrace.events.indexOf('session:lock:done');
    const charIdx = partyBattleLockTrace.events.indexOf(
      'character:passive_move:persist:begin'
    );
    assert.ok(lockIdx >= 0 && charIdx > lockIdx);
    ok('performBattleAction: session lock before Character write');

    const bj = char.battleJson as BattleJsonState;
    if (bj?.partyBattleId) {
      await prisma.partyBattleSession.delete({ where: { id: bj.partyBattleId } });
    }
    await prisma.user.delete({ where: { id: a.userId } });
    });
  } finally {
    delete process.env.PARTY_BATTLE_LOCK_TRACE;
    partyBattleLockTrace.reset();
  }
}

async function main(): Promise<void> {
  console.log('party-battle-stage-b smoke');
  await testFlagOffNoPartyTableQueries();
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'false';
  await testPartyMembersSeparateWorldBattles();
  await testWrongSpawnError();
  await testSharedHpTwoAttackers();
  await testSyncReadOnly();
  await testLethalZeroEconomy();
  await testSessionLockBeforeCharacterWrite();
  console.log(`\n${passed} passed`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
