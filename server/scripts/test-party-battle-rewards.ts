/**
 * Regression: party battle EXP/SP/adena split after victory.
 * npm run test:party-battle-rewards
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
  L2DOP_LEVEL_MIN_EXP,
  levelFromTotalExp,
} from '../src/data/l2dopExpgain.js';
import { resolvePartyBattleRewardEligibleIds } from '../src/domain/partyBattleRewardEligibility.js';
import {
  splitEvenly,
  splitEvenlyBigInt,
  sumSplitBigIntMap,
  sumSplitMap,
} from '../src/domain/partyBattleReward.js';
import { isPartyBattleRewardDistributionReady } from '../src/domain/partyBattleFlags.js';
import { shouldStartPartyBattleInTx } from '../src/services/party/partyBattleStartJoinService.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import { touchOnlinePresence } from '../src/services/onlinePresenceService.js';
import {
  buildTerminalLethalResponse,
  performPartyBattleLethalAttack,
} from './partyBattleSmokeLethalHelper.js';

const CANONICAL_SPAWN = MAP_WORLD_SPAWNS[0]!;
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function withRewardFlags(): void {
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  assert.equal(isPartyBattleRewardDistributionReady(), true);
}

async function createTestAccount(label: string): Promise<{ userId: string; characterId: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbr_${label}_${suffix}`;
  const name = `R${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
          level: 39,
          exp: L2DOP_LEVEL_MIN_EXP[38]!,
          hp: 5000,
          maxHp: 5000,
          worldX: CANONICAL_SPAWN.worldX,
          worldY: CANONICAL_SPAWN.worldY,
        },
      },
    },
    include: { characters: true },
  });
  await touchOnlinePresence(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function addPartyMember(partyId: string, characterId: string, slotOrder: number): Promise<void> {
  await prisma.partyMember.create({ data: { partyId, characterId, slotOrder } });
}

async function joinMateToPartyBattle(
  mate: { userId: string; characterId: string },
  partyId: string
): Promise<void> {
  const mateChar0 = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  await prisma.$transaction(async (tx) => {
    const { startOrJoinPartyBattleInTx } = await import(
      '../src/services/party/partyBattleStartJoinService.js'
    );
    await startOrJoinPartyBattleInTx(tx, {
      userId: mate.userId,
      char: mateChar0 as never,
      spawn: CANONICAL_SPAWN,
      expectedRevision: mateChar0.revision,
      partyId,
      wTick: null,
      nowStartMs: Date.now(),
    });
  });
}

async function startPartyBattle(userId: string, characterId: string): Promise<string> {
  const char0 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, userId, CANONICAL_SPAWN.id, char0.revision, { characterId })
  );
  const char1 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  const bj = char1.battleJson as BattleJsonState;
  assert.ok(bj?.partyBattleId);
  return bj.partyBattleId!;
}

async function lethalKill(userId: string, characterId: string): Promise<void> {
  const { response } = await performPartyBattleLethalAttack({
    userId,
    characterId,
    battleSpawnId: CANONICAL_SPAWN.id,
  });
  if (!response) {
    const terminal = await buildTerminalLethalResponse(characterId);
    assert.ok(terminal, 'lethal kill failed');
  }
}

// ---- pure split ----

function testTwoMemberSplitExact(): void {
  console.log('\n[split] two members 1000/100/500');
  const ids = ['a', 'b'];
  const exp = splitEvenlyBigInt(1000n, ids, 'a');
  const sp = splitEvenly(100, ids, 'a');
  const adena = splitEvenlyBigInt(500n, ids, 'a');
  assert.equal(exp.get('a'), 500n);
  assert.equal(exp.get('b'), 500n);
  assert.equal(sp.get('a'), 50);
  assert.equal(sp.get('b'), 50);
  assert.equal(adena.get('a'), 250n);
  assert.equal(adena.get('b'), 250n);
  ok('each member 500 EXP / 50 SP / 250 adena');
}

function testThreeMemberRemainder(): void {
  console.log('\n[split] three members with remainder');
  const ids = ['k', 'b', 'c'];
  const exp = splitEvenlyBigInt(1000n, ids, 'k');
  const sp = splitEvenly(100, ids, 'k');
  const adena = splitEvenlyBigInt(500n, ids, 'k');
  assert.equal(sumSplitBigIntMap(exp), 1000n);
  assert.equal(sumSplitMap(sp), 100);
  assert.equal(sumSplitBigIntMap(adena), 500n);
  assert.equal(exp.get('k'), 334n);
  assert.equal(exp.get('b'), 333n);
  assert.equal(exp.get('c'), 333n);
  ok('totals exact; remainder to killer first then asc');
}

function testInactivePartyMemberExcluded(): void {
  console.log('\n[eligibility] inactive party member excluded');
  const eligible = resolvePartyBattleRewardEligibleIds({
    killerCharacterId: 'k',
    battleParticipantIds: ['k', 'fighter'],
    memberSnapshots: [
      {
        characterId: 'k',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: null },
      },
      {
        characterId: 'fighter',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: null },
      },
      {
        characterId: 'buffer',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: null },
      },
    ],
    isOnline: () => true,
  });
  assert.deepEqual(eligible, ['fighter', 'k']);
  ok('buffer in party but not battle participant → no reward');
}

// ---- integration ----

function testWorldPartyStartHintWhenRewardsOn(): void {
  console.log('\n[start] world mob + party + REWARDS → party battle hint');
  withRewardFlags();
  // Pure flag gate — no DB
  assert.equal(isPartyBattleRewardDistributionReady(), true);
  ok('world party start enabled when PARTY_BATTLE_REWARDS_ENABLED=true');
}

async function testWorldPartyBattleViaBattleStartEndpoint(): Promise<void> {
  console.log('\n[integration] battle.html path — world spawn party split');
  withRewardFlags();
  const killer = await createTestAccount('wk');
  const mate = await createTestAccount('wm');
  const party = await createPartyForUser(killer.userId, killer.characterId);
  await addPartyMember(party.party!.id, mate.characterId, 1);
  await touchOnlinePresence(mate.userId);

  const killerChar0 = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
  });
  const partyHint = await prisma.$transaction((tx) =>
    shouldStartPartyBattleInTx(tx, killer.characterId, CANONICAL_SPAWN.kind, false)
  );
  assert.ok(partyHint);
  assert.equal(partyHint!.dungeon, false);
  ok('shouldStartPartyBattleInTx returns world party hint');

  const sessionId = await startPartyBattle(killer.userId, killer.characterId);
  const killerBj = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
    select: { battleJson: true },
  });
  const bjK = killerBj.battleJson as { partyBattleId?: string; spawnId?: string };
  assert.equal(bjK.partyBattleId, sessionId);
  assert.equal(bjK.spawnId, CANONICAL_SPAWN.id);
  ok('killer battleJson has partyBattleId after /game/battle/start equivalent');

  await joinMateToPartyBattle(mate, party.party!.id);
  const participants = await prisma.partyBattleParticipant.findMany({
    where: { partyBattleId: sessionId, active: true },
  });
  assert.equal(participants.length, 2);
  ok('two active PartyBattleParticipant rows');

  const killerBefore = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
  });
  const mateBefore = await prisma.character.findUniqueOrThrow({
    where: { id: mate.characterId },
  });

  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
    await prisma.$transaction(async (tx) => {
      const char = await tx.character.findUniqueOrThrow({ where: { id: killer.characterId } });
      const bj = char.battleJson as Record<string, unknown>;
      await tx.partyBattleSession.update({
        where: { id: sessionId },
        data: { mobHp: 1 },
      });
      await tx.character.update({
        where: { id: killer.characterId },
        data: {
          battleJson: { ...bj, mobHp: 1 } as unknown as Prisma.InputJsonValue,
        },
      });
      const updated = await tx.character.findUniqueOrThrow({ where: { id: killer.characterId } });
      const result = await performBattleActionInTx(tx, killer.userId, 'attack', updated.revision, {
        characterId: killer.characterId,
        battleSpawnId: CANONICAL_SPAWN.id,
      });
      assert.equal(result.kind, 'full');
      assert.ok(result.partyReward);
      assert.equal(result.partyReward!.recipientCount, 2);
      assert.equal(result.partyReward!.shared, true);
    });
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }

  const rewards = await prisma.partyKillReward.findMany({
    where: { partyBattleId: sessionId },
    orderBy: { characterId: 'asc' },
  });
  assert.equal(rewards.length, 2);
  const totalExp = rewards.reduce((s, r) => s + r.expGain, 0);
  const totalSp = rewards.reduce((s, r) => s + r.spGain, 0);
  const totalAdena = rewards.reduce((s, r) => s + Number(r.adenaGain), 0n);
  assert.ok(totalExp > 0);
  assert.ok(totalSp > 0);
  assert.ok(totalAdena >= 0);
  assert.ok(rewards[0]!.expGain > 0 && rewards[1]!.expGain > 0);
  assert.ok(Math.abs(rewards[0]!.expGain - rewards[1]!.expGain) <= 1);
  assert.ok(rewards[0]!.expGain < totalExp);
  ok('killer did not receive full solo EXP — split between two');

  const killerAfter = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
  });
  const mateAfter = await prisma.character.findUniqueOrThrow({
    where: { id: mate.characterId },
  });
  assert.ok(Number(killerAfter.exp) > Number(killerBefore.exp));
  assert.ok(Number(mateAfter.exp) > Number(mateBefore.exp));
  assert.ok(killerAfter.sp > killerBefore.sp);
  assert.ok(mateAfter.sp > mateBefore.sp);

  const expBeforeSecond = killerAfter.exp;
  try {
    await prisma.$transaction(async (tx) => {
      const row = await tx.character.findUniqueOrThrow({ where: { id: killer.characterId } });
      if (row.battleJson) {
        await performBattleActionInTx(tx, killer.userId, 'attack', row.revision, {
          characterId: killer.characterId,
          battleSpawnId: CANONICAL_SPAWN.id,
        });
      }
    });
  } catch {
    /* battle ended */
  }
  const killerAfterRepeat = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
  });
  assert.equal(killerAfterRepeat.exp, expBeforeSecond);
  assert.equal(
    await prisma.partyKillReward.count({ where: { partyBattleId: sessionId } }),
    2
  );
  ok('repeat action does not double-grant');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, mate.userId] } } });
}

async function testTwoMemberIntegration(): Promise<void> {
  console.log('\n[integration] two battle participants receive economy');
  withRewardFlags();
  const killer = await createTestAccount('2k');
  const mate = await createTestAccount('2m');
  await createPartyForUser(killer.userId, killer.characterId);
  const membership = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer.characterId },
  });
  await addPartyMember(membership.partyId, mate.characterId, 1);
  await touchOnlinePresence(mate.userId);

  const killerBefore = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const mateBefore = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  const sessionId = await startPartyBattle(killer.userId, killer.characterId);
  await joinMateToPartyBattle(mate, membership.partyId);

  await lethalKill(killer.userId, killer.characterId);

  const rewards = await prisma.partyKillReward.findMany({
    where: { partyBattleId: sessionId },
    orderBy: { characterId: 'asc' },
  });
  assert.equal(rewards.length, 2);
  const totalExp = rewards.reduce((s, r) => s + r.expGain, 0);
  const totalSp = rewards.reduce((s, r) => s + r.spGain, 0);
  const totalAdena = rewards.reduce((s, r) => s + Number(r.adenaGain), 0);
  assert.ok(totalExp > 0);
  assert.ok(totalSp > 0);
  assert.ok(totalAdena >= 0);
  assert.ok(Math.abs(rewards[0]!.expGain - rewards[1]!.expGain) <= 1);

  const killerAfter = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const mateAfter = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  assert.ok(Number(killerAfter.exp) > Number(killerBefore.exp));
  assert.ok(Number(mateAfter.exp) > Number(mateBefore.exp));
  assert.ok(killerAfter.sp > killerBefore.sp);
  assert.ok(mateAfter.sp > mateBefore.sp);
  ok('both participants persisted EXP/SP');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, mate.userId] } } });
}

async function testLevelUpOneParticipant(): Promise<void> {
  console.log('\n[integration] level-up only for near-threshold participant');
  withRewardFlags();
  const killer = await createTestAccount('lvk');
  const mate = await createTestAccount('lvm');
  await createPartyForUser(killer.userId, killer.characterId);
  const membership = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer.characterId },
  });
  await addPartyMember(membership.partyId, mate.characterId, 1);
  await touchOnlinePresence(mate.userId);

  const nearLevel40 = L2DOP_LEVEL_MIN_EXP[39]! - 10n;
  await prisma.character.update({
    where: { id: killer.characterId },
    data: { exp: nearLevel40, level: levelFromTotalExp(nearLevel40) },
  });

  const sessionId = await startPartyBattle(killer.userId, killer.characterId);
  await joinMateToPartyBattle(mate, membership.partyId);
  const mateBefore = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  const mateLevelBefore = mateBefore.level;

  await lethalKill(killer.userId, killer.characterId);

  const killerAfter = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const mateAfter = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  assert.ok(killerAfter.level >= 40);
  assert.equal(mateAfter.level, mateLevelBefore);
  assert.ok(Number(mateAfter.exp) > Number(mateBefore.exp));
  ok('killer leveled; mate gained EXP without level-up');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, mate.userId] } } });
}

async function testDoubleVictoryIdempotent(): Promise<void> {
  console.log('\n[integration] duplicate victory grants once');
  withRewardFlags();
  const killer = await createTestAccount('dup');
  await createPartyForUser(killer.userId, killer.characterId);
  const sessionId = await startPartyBattle(killer.userId, killer.characterId);
  const before = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });

  await lethalKill(killer.userId, killer.characterId);
  const afterFirst = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const rewards1 = await prisma.partyKillReward.findMany({ where: { partyBattleId: sessionId } });
  assert.equal(rewards1.length, 1);

  const expAfterFirst = afterFirst.exp;
  const spAfterFirst = afterFirst.sp;
  const adenaAfterFirst = afterFirst.adena;

  await lethalKill(killer.userId, killer.characterId).catch(() => {
    /* battle already ended */
  });
  const afterSecond = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const rewards2 = await prisma.partyKillReward.findMany({ where: { partyBattleId: sessionId } });
  assert.equal(rewards2.length, 1);
  assert.equal(afterSecond.exp, expAfterFirst);
  assert.equal(afterSecond.sp, spAfterFirst);
  assert.equal(afterSecond.adena, adenaAfterFirst);
  assert.ok(Number(afterFirst.exp) > Number(before.exp));
  ok('second victory attempt does not double-grant');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: killer.userId } });
}

async function testSoloBattleUnchanged(): Promise<void> {
  console.log('\n[integration] solo battle still grants rewards');
  withRewardFlags();
  delete process.env.PARTY_BATTLE_ENABLED;
  process.env.PARTY_BATTLE_ENABLED = 'false';

  const solo = await createTestAccount('solo');
  const char0 = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, solo.userId, CANONICAL_SPAWN.id, char0.revision, {
      characterId: solo.characterId,
    })
  );

  const before = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
    const { performBattleActionInTx } = await import(
      '../src/services/battleServicePerformBattleAction.js'
    );
    await prisma.$transaction(async (tx) => {
      const char = await tx.character.findUniqueOrThrow({ where: { id: solo.characterId } });
      const bj = char.battleJson as BattleJsonState;
      await tx.character.update({
        where: { id: solo.characterId },
        data: {
          battleJson: { ...bj, mobHp: 1 } as unknown as Prisma.InputJsonValue,
        },
      });
      const updated = await tx.character.findUniqueOrThrow({ where: { id: solo.characterId } });
      await performBattleActionInTx(tx, solo.userId, 'attack', updated.revision, {
        characterId: solo.characterId,
        battleSpawnId: CANONICAL_SPAWN.id,
      });
    });
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }

  const after = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  assert.ok(Number(after.exp) > Number(before.exp));
  assert.ok(after.sp > before.sp);
  ok('solo EXP/SP granted');

  await prisma.user.delete({ where: { id: solo.userId } });
}

async function main(): Promise<void> {
  console.log('party-battle-rewards regression');
  testTwoMemberSplitExact();
  testThreeMemberRemainder();
  testInactivePartyMemberExcluded();
  testWorldPartyStartHintWhenRewardsOn();
  await testWorldPartyBattleViaBattleStartEndpoint();
  await testTwoMemberIntegration();
  await testLevelUpOneParticipant();
  await testDoubleVictoryIdempotent();
  await testSoloBattleUnchanged();
  console.log(`\n${passed} passed`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    delete process.env.PARTY_BATTLE_ENABLED;
    delete process.env.PARTY_BATTLE_REWARDS_ENABLED;
    await prisma.$disconnect();
  });
