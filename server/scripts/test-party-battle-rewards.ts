/**
 * L2 world party kill rewards — solo battle, shared economy split.
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
import {
  MAP_NEARBY_HERO_RADIUS,
  MAP_WORLD_SPAWNS,
} from '../src/data/mapWorldSpawns.js';
import { resolveWorldPartyRewardEligibleIds } from '../src/domain/worldPartyRewardEligibility.js';
import {
  splitEvenly,
  splitEvenlyBigInt,
  sumSplitBigIntMap,
  sumSplitMap,
} from '../src/domain/partyBattleReward.js';
import { isPartyBattleRewardDistributionReady } from '../src/domain/partyBattleFlags.js';
import { shouldStartPartyBattleInTx } from '../src/services/party/partyBattleStartJoinService.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import type { BattleJsonState } from '../src/domain/battleTypes.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import { touchOnlinePresence, isCharacterOnlineNow } from '../src/services/onlinePresenceService.js';

import { prisma } from '../src/lib/prisma.js';

const SPAWN_A = MAP_WORLD_SPAWNS[0]!;
const SPAWN_B =
  MAP_WORLD_SPAWNS.find(
    (s) => s.id !== SPAWN_A.id && s.kind !== 'raid' && s.kind !== 'epic'
  ) ?? SPAWN_A;
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

async function createTestAccount(
  label: string,
  pos?: { worldX: number; worldY: number }
): Promise<{ userId: string; characterId: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `wpr_${label}_${suffix}`;
  const name = `W${label}${suffix.slice(-4)}`.slice(0, 16);
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
          worldX: pos?.worldX ?? SPAWN_A.worldX,
          worldY: pos?.worldY ?? SPAWN_A.worldY,
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

async function startSoloBattle(userId: string, characterId: string, spawnId: string): Promise<number> {
  const char0 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, userId, spawnId, char0.revision, { characterId })
  );
  const char1 = await prisma.character.findUniqueOrThrow({ where: { id: characterId } });
  const bj = char1.battleJson as BattleJsonState;
  assert.ok(bj?.spawnId === spawnId);
  assert.equal(bj.partyBattleId, undefined);
  return char1.revision;
}

async function lethalKill(
  userId: string,
  characterId: string,
  spawnId: string
): Promise<{ killRevision: number; partyReward?: { recipientCount: number; shared: boolean } }> {
  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
    let killRevision = 0;
    let partyReward: { recipientCount: number; shared: boolean } | undefined;
    await prisma.$transaction(async (tx) => {
      const char = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
      const bj = char.battleJson as Record<string, unknown>;
      assert.ok(bj, 'no battleJson');
      killRevision = char.revision;
      await tx.character.update({
        where: { id: characterId },
        data: {
          battleJson: { ...bj, mobHp: 1 } as unknown as Prisma.InputJsonValue,
        },
      });
      const updated = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
      const result = await performBattleActionInTx(tx, userId, 'attack', updated.revision, {
        characterId,
        battleSpawnId: spawnId,
      });
      assert.equal(result.kind, 'full');
      if (result.partyReward) {
        partyReward = {
          recipientCount: result.partyReward.recipientCount,
          shared: result.partyReward.shared,
        };
      }
    });
    return { killRevision, partyReward };
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }
}

function testSplitPure(): void {
  console.log('\n[split] pure');
  const ids = ['k', 'b'];
  assert.equal(splitEvenlyBigInt(1000n, ids, 'k').get('k'), 500n);
  assert.equal(splitEvenly(100, ids, 'k').get('b'), 50);
  assert.equal(sumSplitBigIntMap(splitEvenlyBigInt(1000n, ['k', 'b', 'c'], 'k')), 1000n);
  assert.equal(sumSplitMap(splitEvenly(100, ['k', 'b', 'c'], 'k')), 100);
  ok('even split + remainder');
}

function testWorldStartNoSharedSession(): void {
  console.log('\n[start] world mob → no shared party battle');
  withRewardFlags();
  ok('flags on — shouldStartPartyBattle returns null for world (checked in integration)');
}

function testEligibilityPure(): void {
  console.log('\n[eligibility] nearby vs far');
  const killerPos = { worldX: 0, worldY: 0, dungeonStateJson: null };
  const nearPos = { worldX: 100, worldY: 0, dungeonStateJson: null };
  const farPos = { worldX: MAP_NEARBY_HERO_RADIUS + 500, worldY: 0, dungeonStateJson: null };
  const eligible = resolveWorldPartyRewardEligibleIds({
    killerCharacterId: 'k',
    killerResolved: killerPos,
    partyMemberIds: ['k', 'near', 'far', 'dead'],
    memberSnapshots: [
      { characterId: 'k', hp: 100, pvePendingDefeatJson: null, resolvedPosition: killerPos },
      { characterId: 'near', hp: 100, pvePendingDefeatJson: null, resolvedPosition: nearPos },
      { characterId: 'far', hp: 100, pvePendingDefeatJson: null, resolvedPosition: farPos },
      { characterId: 'dead', hp: 0, pvePendingDefeatJson: null, resolvedPosition: nearPos },
    ],
    isOnline: () => true,
  });
  assert.deepEqual(eligible, ['k', 'near']);
  ok('near party member eligible without battle page');
}

async function testMateStandsNearbyGetsReward(): Promise<void> {
  console.log('\n[integration] mate stands nearby — no battle page');
  withRewardFlags();
  const a = await createTestAccount('sa');
  const b = await createTestAccount('sb');
  const party = await createPartyForUser(a.userId, a.characterId);
  await addPartyMember(party.party!.id, b.characterId, 1);
  await touchOnlinePresence(b.userId);
  assert.equal(isCharacterOnlineNow(b.characterId), true);

  const aBefore = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  const bBefore = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });

  await startSoloBattle(a.userId, a.characterId, SPAWN_A.id);
  assert.equal((await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } })).battleJson, null);

  const { killRevision, partyReward } = await lethalKill(a.userId, a.characterId, SPAWN_A.id);
  assert.ok(partyReward?.shared);
  assert.equal(partyReward?.recipientCount, 2);

  const rewards = await prisma.worldPartyKillReward.findMany({
    where: { killerCharacterId: a.characterId, spawnId: SPAWN_A.id, killRevision },
  });
  assert.equal(rewards.length, 2);

  const aAfter = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  const bAfter = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  assert.ok(Number(aAfter.exp) > Number(aBefore.exp));
  assert.ok(Number(bAfter.exp) > Number(bBefore.exp));
  assert.ok(bAfter.sp > bBefore.sp);
  ok('both received EXP/SP without shared battleJson');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
}

async function testMateFightsDifferentMob(): Promise<void> {
  console.log('\n[integration] mate fights different mob');
  withRewardFlags();
  const a = await createTestAccount('da');
  const b = await createTestAccount('db');
  const party = await createPartyForUser(a.userId, a.characterId);
  await addPartyMember(party.party!.id, b.characterId, 1);
  await touchOnlinePresence(b.userId);

  await prisma.character.update({
    where: { id: b.characterId },
    data: { worldX: SPAWN_B.worldX, worldY: SPAWN_B.worldY },
  });

  const bBefore = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  await startSoloBattle(a.userId, a.characterId, SPAWN_A.id);
  if (SPAWN_B.id !== SPAWN_A.id) {
    await startSoloBattle(b.userId, b.characterId, SPAWN_B.id);
  }

  const bBj = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  assert.ok(bBj.battleJson);
  const aBj = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  assert.ok(aBj.battleJson);
  assert.notEqual(
    (aBj.battleJson as BattleJsonState).spawnId,
    SPAWN_B.id === SPAWN_A.id ? SPAWN_A.id : (bBj.battleJson as BattleJsonState).spawnId
  );

  const { killRevision } = await lethalKill(a.userId, a.characterId, SPAWN_A.id);
  const rewards = await prisma.worldPartyKillReward.findMany({
    where: { killerCharacterId: a.characterId, spawnId: SPAWN_A.id, killRevision },
  });
  assert.equal(rewards.length, 2);

  const bAfter = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  assert.ok(Number(bAfter.exp) > Number(bBefore.exp));
  ok('mate on other spawn still gets kill-A split');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
}

async function testSimultaneousDifferentKills(): Promise<void> {
  console.log('\n[integration] two independent kills same party');
  withRewardFlags();
  if (SPAWN_B.id === SPAWN_A.id) {
    ok('skipped — need two distinct spawns');
    return;
  }
  const a = await createTestAccount('simA');
  const b = await createTestAccount('simB');
  const party = await createPartyForUser(a.userId, a.characterId);
  await addPartyMember(party.party!.id, b.characterId, 1);
  await touchOnlinePresence(b.userId);

  await prisma.character.update({
    where: { id: a.characterId },
    data: { worldX: SPAWN_A.worldX, worldY: SPAWN_A.worldY },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { worldX: SPAWN_A.worldX, worldY: SPAWN_A.worldY },
  });

  await startSoloBattle(a.userId, a.characterId, SPAWN_A.id);
  await startSoloBattle(b.userId, b.characterId, SPAWN_B.id);

  const killA = await lethalKill(a.userId, a.characterId, SPAWN_A.id);
  const killB = await lethalKill(b.userId, b.characterId, SPAWN_B.id);

  const rewardsA = await prisma.worldPartyKillReward.count({
    where: { killerCharacterId: a.characterId, spawnId: SPAWN_A.id, killRevision: killA.killRevision },
  });
  const rewardsB = await prisma.worldPartyKillReward.count({
    where: { killerCharacterId: b.characterId, spawnId: SPAWN_B.id, killRevision: killB.killRevision },
  });
  assert.equal(rewardsA, 2);
  assert.equal(rewardsB, 2);
  ok('each kill split once between A and B');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
}

async function testFarMemberExcluded(): Promise<void> {
  console.log('\n[integration] far member excluded');
  withRewardFlags();
  const a = await createTestAccount('fa');
  const b = await createTestAccount('fb');
  const party = await createPartyForUser(a.userId, a.characterId);
  await addPartyMember(party.party!.id, b.characterId, 1);
  await touchOnlinePresence(b.userId);

  await prisma.character.update({
    where: { id: b.characterId },
    data: {
      worldX: SPAWN_A.worldX + MAP_NEARBY_HERO_RADIUS + 5000,
      worldY: SPAWN_A.worldY,
    },
  });

  const bBefore = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  await startSoloBattle(a.userId, a.characterId, SPAWN_A.id);
  const { killRevision } = await lethalKill(a.userId, a.characterId, SPAWN_A.id);

  const rewards = await prisma.worldPartyKillReward.findMany({
    where: { killerCharacterId: a.characterId, spawnId: SPAWN_A.id, killRevision },
  });
  assert.equal(rewards.length, 1);
  assert.equal(rewards[0]!.recipientCharacterId, a.characterId);

  const bAfter = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
  assert.equal(Number(bAfter.exp), Number(bBefore.exp));
  ok('far mate gets nothing');

  await prisma.user.deleteMany({ where: { id: { in: [a.userId, b.userId] } } });
}

async function testSoloNoPartyFullReward(): Promise<void> {
  console.log('\n[integration] solo character 100%');
  withRewardFlags();
  const solo = await createTestAccount('solo');
  const before = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  await startSoloBattle(solo.userId, solo.characterId, SPAWN_A.id);
  await lethalKill(solo.userId, solo.characterId, SPAWN_A.id);

  const worldRewards = await prisma.worldPartyKillReward.count({
    where: { killerCharacterId: solo.characterId },
  });
  assert.equal(worldRewards, 0);
  const after = await prisma.character.findUniqueOrThrow({ where: { id: solo.characterId } });
  assert.ok(Number(after.exp) > Number(before.exp));
  ok('solo full reward, no WorldPartyKillReward rows');

  await prisma.user.delete({ where: { id: solo.userId } });
}

async function testDoubleKillIdempotent(): Promise<void> {
  console.log('\n[integration] duplicate victory idempotent');
  withRewardFlags();
  const a = await createTestAccount('dup');
  await createPartyForUser(a.userId, a.characterId);
  await startSoloBattle(a.userId, a.characterId, SPAWN_A.id);
  const { killRevision } = await lethalKill(a.userId, a.characterId, SPAWN_A.id);
  const afterFirst = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });

  try {
    await lethalKill(a.userId, a.characterId, SPAWN_A.id);
  } catch {
    /* battle ended */
  }
  const count = await prisma.worldPartyKillReward.count({
    where: { killerCharacterId: a.characterId, spawnId: SPAWN_A.id, killRevision },
  });
  assert.equal(count, 1);
  ok('one WorldPartyKillReward ledger per kill');

  await prisma.user.delete({ where: { id: a.userId } });
  void afterFirst;
}

async function testShouldStartNullForWorld(): Promise<void> {
  console.log('\n[start] shouldStartPartyBattleInTx null for world');
  withRewardFlags();
  const a = await createTestAccount('hint');
  await createPartyForUser(a.userId, a.characterId);
  const hint = await prisma.$transaction((tx) =>
    shouldStartPartyBattleInTx(tx, a.characterId, SPAWN_A.kind, false)
  );
  assert.equal(hint, null);
  ok('world farm does not create PartyBattleSession');
  await prisma.user.delete({ where: { id: a.userId } });
}

async function main(): Promise<void> {
  console.log('world party kill rewards (L2-style)');
  testSplitPure();
  testEligibilityPure();
  testWorldStartNoSharedSession();
  await testShouldStartNullForWorld();
  await testMateStandsNearbyGetsReward();
  await testMateFightsDifferentMob();
  await testSimultaneousDifferentKills();
  await testFarMemberExcluded();
  await testSoloNoPartyFullReward();
  await testDoubleKillIdempotent();
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
