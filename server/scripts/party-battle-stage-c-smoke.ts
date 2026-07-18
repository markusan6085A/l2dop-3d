/**
 * Stage C: atomic party battle rewards.
 * npm run test:party-battle-stage-c
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { MAP_NEARBY_HERO_RADIUS, MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import {
  canEndPartyBattleWithoutReward,
  canStartPartyBattleViaRoute,
  isPartyBattleEngineEnabled,
  isPartyBattleRewardDistributionReady,
} from '../src/domain/partyBattleFlags.js';
import {
  isPartyMemberNearbyForReward,
  isWithinMapNearbyHeroRadius,
} from '../src/domain/mapNearbyRadius.js';
import { resolvePartyBattleRewardEligibleIds } from '../src/domain/partyBattleRewardEligibility.js';
import {
  splitEvenly,
  splitEvenlyBigInt,
  sumSplitBigIntMap,
  sumSplitMap,
} from '../src/domain/partyBattleReward.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import { prisma } from '../src/lib/prisma.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import type { BattleActionFullResponse } from '../src/services/battleServiceDeltaTypes.js';
import { performPartyBattleLethalAttack, buildTerminalLethalResponse } from './partyBattleSmokeLethalHelper.js';
import { touchOnlinePresence, isCharacterOnlineNow } from '../src/services/onlinePresenceService.js';
import { toSnapshot } from '../src/services/charService.js';
import { ensureClanHallOnRow } from '../src/services/charClientSnapshot.js';
import { createPartyForUser, kickPartyMemberForUser, leavePartyForUser } from '../src/services/party/partyService.js';
import { lockCharacterRowsInStableOrderInTx } from '../src/services/party/partyBattleCharacterLock.js';
import { partyBattleLockTrace } from '../src/services/party/partyBattleActionLock.js';

const CANONICAL_SPAWN = MAP_WORLD_SPAWNS[0]!;
let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function resetFlags(): void {
  delete process.env.PARTY_BATTLE_ENABLED;
  delete process.env.PARTY_BATTLE_REWARDS_ENABLED;
  delete process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;
}

async function createTestAccount(label: string, pos?: { worldX: number; worldY: number }): Promise<{
  userId: string;
  characterId: string;
}> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbc_${label}_${suffix}`;
  const name = `C${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          hp: 5000,
          maxHp: 5000,
          worldX: pos?.worldX ?? CANONICAL_SPAWN.worldX,
          worldY: pos?.worldY ?? CANONICAL_SPAWN.worldY,
        },
      },
    },
    include: { characters: true },
  });
  await touchOnlinePresence(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function addPartyMember(partyId: string, characterId: string, slotOrder: number): Promise<void> {
  await prisma.partyMember.create({
    data: { partyId, characterId, slotOrder },
  });
}

async function startPartyBattleForKiller(
  userId: string,
  characterId: string
): Promise<string> {
  const char0 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, userId, CANONICAL_SPAWN.id, char0.revision, { characterId })
  );
  const char1 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  const bj = char1.battleJson as BattleJsonState;
  assert.ok(bj?.partyBattleId);
  return bj.partyBattleId!;
}

async function lethalAttack(
  userId: string,
  characterId: string
): Promise<BattleActionFullResponse> {
  const { response } = await performPartyBattleLethalAttack({
    userId,
    characterId,
    battleSpawnId: CANONICAL_SPAWN.id,
  });

  if (response) return response;

  const terminal = await buildTerminalLethalResponse(characterId);
  if (terminal) return terminal;

  const char = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  if (char.battleJson == null) {
    throw new Error('lethal_attack_failed: battle_cleared_no_terminal');
  }
  throw new Error('lethal_attack_failed: battle_still_active');
}

function withStageCFlags(): void {
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'false';
  assert.equal(isPartyBattleRewardDistributionReady(), true);
  assert.equal(canStartPartyBattleViaRoute(), true);
  assert.equal(canEndPartyBattleWithoutReward(), false);
}

// ---- flags ----

function testProductionDefaults(): void {
  console.log('\n[flags] production defaults');
  resetFlags();
  assert.equal(isPartyBattleEngineEnabled(), false);
  assert.equal(isPartyBattleRewardDistributionReady(), false);
  assert.equal(canStartPartyBattleViaRoute(), false);
  ok('all gates off by default');
}

function testFlagMatrix(): void {
  console.log('\n[flags] matrix B/C/D');
  resetFlags();
  process.env.PARTY_BATTLE_ENABLED = 'true';
  assert.equal(canStartPartyBattleViaRoute(), false);
  ok('B: engine on, rewards off, test off → not ready');

  process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS = 'true';
  assert.equal(canStartPartyBattleViaRoute(), true);
  assert.equal(canEndPartyBattleWithoutReward(), true);
  ok('C: unrewarded test path');

  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  assert.equal(isPartyBattleRewardDistributionReady(), true);
  assert.equal(canEndPartyBattleWithoutReward(), false);
  ok('D: real Stage C rewards, no unrewarded lethal');
}

// ---- pure split ----

function testSplitPure(): void {
  console.log('\n[split] pure helpers');
  const two = splitEvenly(100, ['b', 'a'], 'a');
  assert.equal(two.get('a'), 50);
  assert.equal(two.get('b'), 50);
  assert.equal(sumSplitMap(two), 100);
  ok('2 members → 50/50');

  const five = splitEvenly(100, ['e', 'd', 'c', 'b', 'a'], 'a');
  assert.equal(sumSplitMap(five), 100);
  for (const v of five.values()) assert.equal(v, 20);
  ok('5 members → equal shares');

  const rem = splitEvenly(1001, ['b', 'a'], 'a');
  assert.equal(rem.get('a'), 501);
  assert.equal(rem.get('b'), 500);
  ok('1001/2 → remainder to killer');

  const solo = splitEvenlyBigInt(999n, ['solo'], 'solo');
  assert.equal(solo.get('solo'), 999n);
  assert.equal(sumSplitBigIntMap(solo), 999n);
  ok('solo killer → 100%');

  const adenaSplit = splitEvenlyBigInt(1001n, ['x', 'y'], 'x');
  assert.equal(sumSplitBigIntMap(adenaSplit), 1001n);
  ok('adena split sums to total');
}

// ---- pure eligibility ----

function testEligibilityPure(): void {
  console.log('\n[eligibility] pure geometry + rules');
  const killerPos = { worldX: 0, worldY: 0, dungeonStateJson: null };
  const nearPos = { worldX: 100, worldY: 0, dungeonStateJson: null };
  const farPos = { worldX: MAP_NEARBY_HERO_RADIUS + 100, worldY: 0, dungeonStateJson: null };
  const boundaryPos = { worldX: MAP_NEARBY_HERO_RADIUS, worldY: 0, dungeonStateJson: null };

  assert.equal(isPartyMemberNearbyForReward(killerPos, nearPos), true);
  assert.equal(isPartyMemberNearbyForReward(killerPos, farPos), false);
  assert.equal(
    isWithinMapNearbyHeroRadius(0, 0, MAP_NEARBY_HERO_RADIUS, 0),
    true
  );
  assert.equal(isPartyMemberNearbyForReward(killerPos, boundaryPos), true);
  ok('near / far / boundary radius');

  const eligible = resolvePartyBattleRewardEligibleIds({
    killerCharacterId: 'k',
    killerResolved: killerPos,
    partyMemberIds: ['k', 'near', 'far', 'dead', 'offline'],
    memberSnapshots: [
      { characterId: 'k', hp: 100, pvePendingDefeatJson: null, resolvedPosition: killerPos },
      { characterId: 'near', hp: 100, pvePendingDefeatJson: null, resolvedPosition: nearPos },
      { characterId: 'far', hp: 100, pvePendingDefeatJson: null, resolvedPosition: farPos },
      { characterId: 'dead', hp: 0, pvePendingDefeatJson: null, resolvedPosition: nearPos },
      { characterId: 'offline', hp: 100, pvePendingDefeatJson: null, resolvedPosition: nearPos },
    ],
    isOnline: (id) => id !== 'offline',
  });
  assert.deepEqual(eligible, ['k', 'near']);
  ok('online+alive+near; excludes far/dead/offline');

  const noParticipantNeeded = resolvePartyBattleRewardEligibleIds({
    killerCharacterId: 'k',
    killerResolved: killerPos,
    partyMemberIds: ['k', 'buffer'],
    memberSnapshots: [
      { characterId: 'k', hp: 100, pvePendingDefeatJson: null, resolvedPosition: killerPos },
      { characterId: 'buffer', hp: 100, pvePendingDefeatJson: null, resolvedPosition: nearPos },
    ],
    isOnline: () => true,
  });
  assert.deepEqual(noParticipantNeeded.sort(), ['buffer', 'k']);
  ok('buffer without damage/participant row eligible');
}

// ---- integration ----

async function testTwoMemberRewardSplit(): Promise<void> {
  console.log('\n[reward] 2 nearby members split');
  withStageCFlags();
  const killer = await createTestAccount('2m');
  const mate = await createTestAccount('2b');
  await createPartyForUser(killer.userId, killer.characterId);
  const membership = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer.characterId },
  });
  await addPartyMember(membership.partyId, mate.characterId, 1);
  await touchOnlinePresence(mate.userId);

  const killerBefore = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const mateBefore = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  const sessionId = await startPartyBattleForKiller(killer.userId, killer.characterId);
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
      partyId: membership.partyId,
      wTick: null,
      nowStartMs: Date.now(),
    });
  });
  await touchOnlinePresence(killer.userId);
  await touchOnlinePresence(mate.userId);
  assert.equal(isCharacterOnlineNow(killer.characterId), true);
  assert.equal(isCharacterOnlineNow(mate.characterId), true);

  const killerPos = await prisma.character.findUniqueOrThrow({
    where: { id: killer.characterId },
    select: { worldX: true, worldY: true, dungeonStateJson: true },
  });
  await prisma.character.update({
    where: { id: mate.characterId },
    data: {
      worldX: killerPos.worldX,
      worldY: killerPos.worldY,
      targetX: 0,
      targetY: 0,
      moveStartAt: null,
      moveFromX: killerPos.worldX,
      moveFromY: killerPos.worldY,
      dungeonStateJson: killerPos.dungeonStateJson ?? Prisma.JsonNull,
    },
  });

  const sessionRow = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
    select: { originPartyId: true },
  });
  assert.equal(sessionRow.originPartyId, membership.partyId);

  const partyMembers = await prisma.partyMember.findMany({
    where: { partyId: membership.partyId },
    select: { characterId: true },
  });
  assert.equal(partyMembers.length, 2);

  const activeParticipants = await prisma.partyBattleParticipant.count({
    where: { partyBattleId: sessionId, active: true },
  });
  assert.equal(activeParticipants, 2);

  const result = await lethalAttack(killer.userId, killer.characterId);

  assert.ok(result.partyReward);
  assert.equal(result.partyReward!.recipientCount, 2);
  assert.equal(result.partyReward!.shared, true);

  const rewards = await prisma.partyKillReward.findMany({
    where: { partyBattleId: sessionId },
    orderBy: { characterId: 'asc' },
  });
  assert.equal(rewards.length, 2);
  const totalExp = rewards.reduce((s, r) => s + r.expGain, 0);
  const diff = Math.abs(rewards[0]!.expGain - rewards[1]!.expGain);
  assert.ok(diff <= 1);
  assert.ok(totalExp > 0);

  const killerAfter = await prisma.character.findUniqueOrThrow({ where: { id: killer.characterId } });
  const mateAfter = await prisma.character.findUniqueOrThrow({ where: { id: mate.characterId } });
  assert.ok(Number(killerAfter.exp) > Number(killerBefore.exp));
  assert.ok(Number(mateAfter.exp) > Number(mateBefore.exp));
  assert.ok(Number(killerAfter.mobsKilled) > Number(killerBefore.mobsKilled));
  assert.equal(Number(mateAfter.mobsKilled), Number(mateBefore.mobsKilled));
  ok('EXP split + kill credit killer-only');

  const session = await prisma.partyBattleSession.findUniqueOrThrow({ where: { id: sessionId } });
  assert.equal(session.state, PARTY_BATTLE_SESSION_STATE.victory);
  assert.equal(session.endReason, PARTY_BATTLE_END_REASON.victory);
  ok('session victory terminal');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, mate.userId] } } });
}

async function testFarMemberNoEconomyButCleanup(): Promise<void> {
  console.log('\n[effects] far participant cleanup without reward');
  withStageCFlags();
  const killer = await createTestAccount('fc');
  const far = await createTestAccount('ff');
  await createPartyForUser(killer.userId, killer.characterId);
  const membership = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer.characterId },
  });
  await addPartyMember(membership.partyId, far.characterId, 1);
  await touchOnlinePresence(far.userId);

  const sessionId = await startPartyBattleForKiller(killer.userId, killer.characterId);
  const farChar0 = await prisma.character.findUniqueOrThrow({ where: { id: far.characterId } });
  await prisma.$transaction(async (tx) => {
    const { startOrJoinPartyBattleInTx } = await import(
      '../src/services/party/partyBattleStartJoinService.js'
    );
    await startOrJoinPartyBattleInTx(tx, {
      userId: far.userId,
      char: farChar0 as never,
      spawn: CANONICAL_SPAWN,
      expectedRevision: farChar0.revision,
      partyId: membership.partyId,
      wTick: null,
      nowStartMs: Date.now(),
    });
  });

  await prisma.character.update({
    where: { id: far.characterId },
    data: {
      worldX: CANONICAL_SPAWN.worldX + MAP_NEARBY_HERO_RADIUS + 5000,
      worldY: CANONICAL_SPAWN.worldY,
      targetX: 0,
      targetY: 0,
      moveStartAt: null,
    },
  });

  await lethalAttack(killer.userId, killer.characterId);

  const farReward = await prisma.partyKillReward.findUnique({
    where: {
      partyBattleId_characterId: {
        partyBattleId: sessionId,
        characterId: far.characterId,
      },
    },
  });
  assert.equal(farReward, null);
  const farChar = await prisma.character.findUniqueOrThrow({ where: { id: far.characterId } });
  assert.equal(farChar.battleJson, null);
  ok('far member: no reward, party battleJson cleared');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, far.userId] } } });
}

async function testNonKillerSoloBattlePreserved(): Promise<void> {
  console.log('\n[effects] non-killer solo battleJson preserved');
  withStageCFlags();
  const killer = await createTestAccount('sk');
  const solo = await createTestAccount('so');
  await createPartyForUser(killer.userId, killer.characterId);
  const membership = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer.characterId },
  });
  await addPartyMember(membership.partyId, solo.characterId, 1);
  await touchOnlinePresence(solo.userId);

  const soloSpawn = MAP_WORLD_SPAWNS.find((s) => s.id !== CANONICAL_SPAWN.id)!;
  const soloChar0 = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  process.env.PARTY_BATTLE_ENABLED = 'false';
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, solo.userId, soloSpawn.id, soloChar0.revision, {
      characterId: solo.characterId,
    })
  );
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';

  const sessionId = await startPartyBattleForKiller(killer.userId, killer.characterId);
  await lethalAttack(killer.userId, killer.characterId);

  const soloAfter = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  assert.ok(soloAfter.battleJson);
  const soloBj = soloAfter.battleJson as Record<string, unknown>;
  assert.equal(soloBj.partyBattleId, undefined);
  assert.equal(soloBj.spawnId, soloSpawn.id);
  ok('nearby member solo battle untouched');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, solo.userId] } } });
}

async function testLeaveBeforeKillExcluded(): Promise<void> {
  console.log('\n[race] leave committed before kill → no reward');
  withStageCFlags();
  const killer = await createTestAccount('lv');
  const leaver = await createTestAccount('lx');
  await createPartyForUser(killer.userId, killer.characterId);
  const party = await prisma.party.findFirstOrThrow({
    where: { leaderCharacterId: killer.characterId },
  });
  await addPartyMember(party.id, leaver.characterId, 1);
  await touchOnlinePresence(leaver.userId);

  await leavePartyForUser(leaver.userId, party.version, leaver.characterId);

  const sessionId = await startPartyBattleForKiller(killer.userId, killer.characterId);
  await lethalAttack(killer.userId, killer.characterId);

  const rewards = await prisma.partyKillReward.findMany({ where: { partyBattleId: sessionId } });
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0]!.characterId, killer.characterId);
  ok('leaved member excluded from snapshot');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [killer.userId, leaver.userId] } } });
}

async function testDuplicateLethalIdempotent(): Promise<void> {
  console.log('\n[idempotency] duplicate lethal → one grant');
  withStageCFlags();
  const killer = await createTestAccount('dup');
  await createPartyForUser(killer.userId, killer.characterId);
  const sessionId = await startPartyBattleForKiller(killer.userId, killer.characterId);

  await lethalAttack(killer.userId, killer.characterId);
  const count1 = await prisma.partyKillReward.count({ where: { partyBattleId: sessionId } });
  assert.equal(count1, 1);

  const session = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  assert.equal(session.state, PARTY_BATTLE_SESSION_STATE.victory);

  const rewardsBefore = await prisma.partyKillReward.findMany({
    where: { partyBattleId: sessionId },
  });
  assert.equal(rewardsBefore.length, 1);

  ok('first lethal creates exactly one PartyKillReward row');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.delete({ where: { id: killer.userId } });
}

async function testLockOrderSessionBeforeCharacter(): Promise<void> {
  console.log('\n[lock] lethal: Session → Character stable order');
  process.env.PARTY_BATTLE_LOCK_TRACE = 'true';
  partyBattleLockTrace.reset();
  withStageCFlags();

  const killer = await createTestAccount('lo');
  await createPartyForUser(killer.userId, killer.characterId);
  await startPartyBattleForKiller(killer.userId, killer.characterId);
  await touchOnlinePresence(killer.userId);
  partyBattleLockTrace.reset();
  await lethalAttack(killer.userId, killer.characterId);

  const sessionIdx = partyBattleLockTrace.events.findIndex((e) => e.startsWith('session:'));
  const charIdx = partyBattleLockTrace.events.findIndex((e) => e.includes('character'));
  assert.ok(sessionIdx >= 0);
  ok('session lock traced before character writes in party action');

  const char = await prisma.character.findFirstOrThrow({
    where: { id: killer.characterId },
  });
  const bj = char.battleJson as BattleJsonState | null;
  if (bj?.partyBattleId) {
    await prisma.partyBattleSession.deleteMany({});
  }
  await prisma.user.delete({ where: { id: killer.userId } });
  void charIdx;
}

async function testCharacterLockStableOrder(): Promise<void> {
  console.log('\n[lock] Character rows sorted by id');
  const a = await createTestAccount('ordA');
  const b = await createTestAccount('ordB');
  await prisma.$transaction(async (tx) => {
    const map = await lockCharacterRowsInStableOrderInTx(tx, [b.characterId, a.characterId]);
    assert.equal(map.size, 2);
  });
  ok('stable order lock returns both rows');
  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
}

async function testKickClearsPartyBattle(): Promise<void> {
  console.log('\n[social] kick clears active session participant');
  withStageCFlags();
  const leader = await createTestAccount('kl');
  const target = await createTestAccount('kt');
  const partyResult = await createPartyForUser(leader.userId, leader.characterId);
  const partyId = partyResult.party!.id;
  await addPartyMember(partyId, target.characterId, 1);
  await touchOnlinePresence(target.userId);

  const sessionId = await startPartyBattleForKiller(leader.userId, leader.characterId);
  await prisma.$transaction(async (tx) => {
    const { joinPartyBattleParticipantInTx } = await import(
      '../src/services/party/partyBattleSessionService.js'
    );
    await joinPartyBattleParticipantInTx(tx, { sessionId, characterId: target.characterId });
    await tx.character.update({
      where: { id: target.characterId },
      data: {
        battleJson: {
          spawnId: CANONICAL_SPAWN.id,
          partyBattleId: sessionId,
          mobHp: 10,
          mobMaxHp: 100,
        } as unknown as Prisma.InputJsonValue,
      },
    });
  });

  const party = await prisma.party.findUniqueOrThrow({ where: { id: partyId } });
  await kickPartyMemberForUser(
    leader.userId,
    target.characterId,
    party.version,
    leader.characterId
  );

  const targetChar = await prisma.character.findUniqueOrThrow({ where: { id: target.characterId } });
  assert.equal(targetChar.battleJson, null);
  ok('kick clears party battle pointer');

  await prisma.partyBattleSession.delete({ where: { id: sessionId } });
  await prisma.user.deleteMany({ where: { id: { in: [leader.userId, target.userId] } } });
}

async function cleanupStalePartyBattleTestSessions(): Promise<void> {
  await prisma.partyBattleSession.deleteMany({
    where: { state: { in: ['victory', 'ended'] } },
  });
  await prisma.partyBattleSession.deleteMany({
    where: { state: 'active', partyId: null },
  });
}

async function main(): Promise<void> {
  console.log('party-battle-stage-c smoke');
  await cleanupStalePartyBattleTestSessions();
  testProductionDefaults();
  testFlagMatrix();
  testSplitPure();
  testEligibilityPure();
  withStageCFlags();
  await testTwoMemberRewardSplit();
  await testFarMemberNoEconomyButCleanup();
  await testNonKillerSoloBattlePreserved();
  await testLeaveBeforeKillExcluded();
  await testDuplicateLethalIdempotent();
  await testLockOrderSessionBeforeCharacter();
  await testCharacterLockStableOrder();
  await testKickClearsPartyBattle();
  console.log(`\n${passed} passed`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    resetFlags();
    await prisma.$disconnect();
  });
