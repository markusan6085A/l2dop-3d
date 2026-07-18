/**
 * B0.5: lock order, feature gates, rollback/concurrency prep.
 * Запуск: npm run test:party-battle-stage-b0.5
 *
 * Потребує PARTY_BATTLE_ENABLED=true + PARTY_BATTLE_ALLOW_UNREWARDED_TESTS=true
 * для тестів performBattleAction party path.
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

process.env.PARTY_BATTLE_ENABLED = 'true';
process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'true';
process.env.PARTY_BATTLE_LOCK_TRACE = 'true';

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import {
  canEndPartyBattleWithoutReward,
  canStartPartyBattleViaRoute,
  isPartyBattleEngineEnabled,
  isPartyBattleUnrewardedTestsAllowed,
} from '../src/domain/partyBattleFlags.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import {
  applyPartyBattleSharedDamageInTx,
  lockPartyBattleSessionForActionInTx,
  partyBattleActionWithCharacterMutationInTx,
  partyBattleLockTrace,
} from '../src/services/party/partyBattleActionLock.js';
import {
  cleanupStalePartyBattleSessionsInTx,
  createActivePartyBattleSessionInTx,
  endPartyBattleSessionInTx,
  lockPartyBattleSessionInTx,
} from '../src/services/party/partyBattleSessionService.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';

const CANONICAL_TEST_SPAWN = MAP_WORLD_SPAWNS[0]!;

let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

async function createTestAccount(label: string): Promise<{
  userId: string;
  characterId: string;
}> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pb05_${label}_${suffix}`;
  const name = `P${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
          worldX: CANONICAL_TEST_SPAWN.worldX,
          worldY: CANONICAL_TEST_SPAWN.worldY,
        },
      },
    },
    include: { characters: true },
  });
  return { userId: user.id, characterId: user.characters[0]!.id };
}

function testFeatureGates(): void {
  console.log('\n[gates] feature flags');
  assert.equal(isPartyBattleEngineEnabled(), true);
  assert.equal(isPartyBattleUnrewardedTestsAllowed(), true);
  assert.equal(canStartPartyBattleViaRoute(), true);
  assert.equal(canEndPartyBattleWithoutReward(), true);
  ok('both flags true → route + unrewarded lethal allowed');
}

async function createSessionWithParticipant(
  userId: string,
  characterId: string
): Promise<{ sessionId: string; spawnId: string; partyId: string }> {
  const party = await createPartyForUser(userId);
  const partyId = party.party!.id;
  const spawnId = CANONICAL_TEST_SPAWN.id;
  const session = await prisma.$transaction(async (tx) => {
    const s = await createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId,
      canonicalMobTemplateId: String(CANONICAL_TEST_SPAWN.templateId ?? 'test_mob'),
      mobWorldX: CANONICAL_TEST_SPAWN.worldX,
      mobWorldY: CANONICAL_TEST_SPAWN.worldY,
      mobMaxHp: 500,
      starterCharacterId: characterId,
    });
    return s;
  });
  return { sessionId: session.id, spawnId, partyId };
}

async function testRevisionRollback(): Promise<void> {
  console.log('\n[tx] A revision rollback');
  const { userId, characterId } = await createTestAccount('rb');
  const { sessionId, spawnId } = await createSessionWithParticipant(
    userId,
    characterId
  );

  const before = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  const partBefore = await prisma.partyBattleParticipant.findUniqueOrThrow({
    where: {
      partyBattleId_characterId: { partyBattleId: sessionId, characterId },
    },
  });

  const charRow = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
  });

  let rolledBack = false;
  try {
    await prisma.$transaction(async (tx) => {
      await partyBattleActionWithCharacterMutationInTx(tx, {
        sessionId,
        characterId,
        spawnId,
        charRow,
        expectedRevision: charRow.revision - 1,
        damage: 50,
        buildCharacterPatch: () => ({ battleJson: charRow.battleJson }),
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'revision_conflict') {
      rolledBack = true;
    } else {
      throw err;
    }
  }
  assert.equal(rolledBack, true);

  const after = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  const partAfter = await prisma.partyBattleParticipant.findUniqueOrThrow({
    where: {
      partyBattleId_characterId: { partyBattleId: sessionId, characterId },
    },
  });

  assert.equal(after.mobHp, before.mobHp);
  assert.equal(after.battleVersion, before.battleVersion);
  assert.equal(partAfter.totalDamage, partBefore.totalDamage);
  ok('revision conflict rolls back session mobHp + battleVersion + totalDamage');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({
    where: { characters: { some: { id: characterId } } },
  });
}

async function testNoEarlyCharacterWrite(): Promise<void> {
  console.log('\n[tx] B no early Character write before session lock');
  const { userId, characterId } = await createTestAccount('nowrite');
  const { sessionId, spawnId } = await createSessionWithParticipant(
    userId,
    characterId
  );
  const charRow = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
  });

  partyBattleLockTrace.reset();
  await prisma.$transaction(async (tx) => {
    await lockPartyBattleSessionForActionInTx(tx, {
      sessionId,
      characterId,
      spawnId,
      charRow,
    });
  });

  const lockIdx = partyBattleLockTrace.events.indexOf('session:lock:done');
  const charIdx = partyBattleLockTrace.events.indexOf(
    'character:passive_move:persist:begin'
  );
  assert.ok(lockIdx >= 0, 'session lock traced');
  assert.ok(charIdx >= 0, 'character persist traced');
  assert.ok(lockIdx < charIdx, 'session lock before character write');
  ok('lockPartyBattleSessionForActionInTx: session lock precedes Character update');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({
    where: { characters: { some: { id: characterId } } },
  });
}

async function testConcurrentDifferentAttackers(): Promise<void> {
  console.log('\n[tx] C concurrent different attackers');
  const a = await createTestAccount('ca');
  const b = await createTestAccount('cb');
  const { sessionId, spawnId } = await createSessionWithParticipant(
    a.userId,
    a.characterId
  );

  await prisma.$transaction(async (tx) => {
    await tx.partyBattleParticipant.create({
      data: {
        partyBattleId: sessionId,
        characterId: b.characterId,
        active: true,
      },
    });
  });

  await prisma.character.updateMany({
    where: { id: { in: [a.characterId, b.characterId] } },
    data: { worldX: 1000, worldY: 1000 },
  });

  await Promise.all([
    prisma.$transaction((tx) =>
      applyPartyBattleSharedDamageInTx(tx, {
        sessionId,
        characterId: a.characterId,
        damage: 120,
      })
    ),
    prisma.$transaction((tx) =>
      applyPartyBattleSharedDamageInTx(tx, {
        sessionId,
        characterId: b.characterId,
        damage: 80,
      })
    ),
  ]);

  const session = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  assert.equal(session.mobHp, 500 - 120 - 80);
  assert.equal(session.battleVersion, 3);
  ok('concurrent A+B damage serialized; canonical HP correct');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({
    where: {
      id: { in: [a.userId, b.userId] },
    },
  });
}

async function testDuplicateSameAttackerRevision(): Promise<void> {
  console.log('\n[tx] D duplicate same attacker revision');
  const { userId, characterId } = await createTestAccount('dup');
  const { sessionId } = await createSessionWithParticipant(userId, characterId);

  const charRow = await prisma.character.findUniqueOrThrow({
    where: { id: characterId },
  });
  const expectedRevision = charRow.revision;

  const sessionRow = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });

  const results = await Promise.allSettled([
    prisma.$transaction((tx) =>
      applyPartyBattleSharedDamageInTx(tx, {
        sessionId,
        characterId,
        damage: 40,
      })
    ),
    prisma.$transaction((tx) =>
      partyBattleActionWithCharacterMutationInTx(tx, {
        sessionId,
        characterId,
        spawnId: sessionRow.spawnId,
        charRow,
        expectedRevision,
        damage: 40,
        buildCharacterPatch: () => null,
      })
    ),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled').length;
  assert.ok(fulfilled >= 1);

  const session = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  assert.ok(session.mobHp >= 500 - 80 && session.mobHp <= 500 - 40);
  ok('duplicate concurrent actions: HP reduced once or twice serialized without deadlock');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function testTimeoutActionRace(): Promise<void> {
  console.log('\n[tx] E timeout cleanup vs action race');
  const { userId, characterId } = await createTestAccount('race');
  const { sessionId } = await createSessionWithParticipant(userId, characterId);

  const stale = new Date(Date.now() - 3 * 60 * 1000);
  await prisma.partyBattleSession.update({
    where: { id: sessionId },
    data: { lastActivityAt: stale },
  });

  const results = await Promise.allSettled([
    prisma.$transaction((tx) => cleanupStalePartyBattleSessionsInTx(tx, Date.now())),
    prisma.$transaction(async (tx) => {
      const locked = await lockPartyBattleSessionInTx(tx, sessionId);
      if (!locked || locked.state !== PARTY_BATTLE_SESSION_STATE.active) {
        throw new Error('party_battle_session_not_active');
      }
      return applyPartyBattleSharedDamageInTx(tx, {
        sessionId,
        characterId,
        damage: 10,
      });
    }),
  ]);

  assert.ok(results.every((r) => r.status === 'fulfilled' || r.status === 'rejected'));

  const after = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  if (after.state !== PARTY_BATTLE_SESSION_STATE.active) {
    assert.equal(after.mobHp, 500, 'no damage after terminal cleanup');
    ok('cleanup wins race → no damage after terminal state');
  } else {
    assert.ok(after.mobHp <= 490);
    ok('action wins race → damage or cleanup serialized');
  }

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function testPerformBattleActionPartyLockTrace(): Promise<void> {
  console.log('\n[tx] performBattleActionInTx party path lock order');
  const { userId, characterId } = await createTestAccount('pba');
  const { sessionId, spawnId } = await createSessionWithParticipant(
    userId,
    characterId
  );

  const battleJson: BattleJsonState = {
    spawnId,
    partyBattleId: sessionId,
    mobHp: 500,
    mobMaxHp: 500,
    mobPAtk: 10,
    mobPDef: 10,
    mobMAtk: 10,
    mobMDef: 10,
    log: [],
  };

  const charRow = await prisma.character.update({
    where: { id: characterId },
    data: {
      battleJson,
      worldX: CANONICAL_TEST_SPAWN.worldX,
      worldY: CANONICAL_TEST_SPAWN.worldY,
    },
  });

  partyBattleLockTrace.reset();
  await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, userId, 'attack', charRow.revision, {
      characterId,
      battleSpawnId: spawnId,
    })
  );

  const lockIdx = partyBattleLockTrace.events.indexOf('session:lock:done');
  const charIdx = partyBattleLockTrace.events.indexOf(
    'character:passive_move:persist:begin'
  );
  assert.ok(lockIdx >= 0 && charIdx > lockIdx);
  ok('performBattleAction party path: session lock before Character passive write');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function testStageBTestVictoryEndReason(): Promise<void> {
  console.log('\n[tx] stage_b_test_victory end reason');
  const { userId, characterId } = await createTestAccount('tv');
  const { sessionId } = await createSessionWithParticipant(userId, characterId);

  const ended = await prisma.$transaction((tx) =>
    endPartyBattleSessionInTx(tx, {
      sessionId,
      terminalState: PARTY_BATTLE_SESSION_STATE.victory,
      endReason: PARTY_BATTLE_END_REASON.stage_b_test_victory,
    })
  );
  assert.equal(ended.endReason, PARTY_BATTLE_END_REASON.stage_b_test_victory);
  assert.equal(ended.activePartyKey, null);
  ok('test-only victory endReason + activePartyKey cleared');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: userId } });
}

async function testProductionGatesDefaultOff(): Promise<void> {
  console.log('\n[gates] production defaults (simulate)');
  const prevEnabled = process.env.PARTY_BATTLE_ENABLED;
  const prevAllow = process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;
  delete process.env.PARTY_BATTLE_ENABLED;
  delete process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;

  const mod = await import('../src/domain/partyBattleFlags.js');
  assert.equal(mod.isPartyBattleEngineEnabled(), false);
  assert.equal(mod.canStartPartyBattleViaRoute(), false);

  if (prevEnabled) process.env.PARTY_BATTLE_ENABLED = prevEnabled;
  else process.env.PARTY_BATTLE_ENABLED = 'true';
  if (prevAllow) process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = prevAllow;
  else process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'true';
  ok('without env flags → party battle routes blocked');
}

async function main(): Promise<void> {
  console.log('party-battle-stage-b0.5 smoke');
  testFeatureGates();
  await testProductionGatesDefaultOff();
  await testRevisionRollback();
  await testNoEarlyCharacterWrite();
  await testConcurrentDifferentAttackers();
  await testDuplicateSameAttackerRevision();
  await testTimeoutActionRace();
  await testPerformBattleActionPartyLockTrace();
  await testStageBTestVictoryEndReason();
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
