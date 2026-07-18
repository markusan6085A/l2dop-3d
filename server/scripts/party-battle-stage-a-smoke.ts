/**
 * Етап A: PartyBattleSession foundation (без battle routes).
 * Запуск: npm run test:party-battle-stage-a
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
  BATTLE_RANGE,
  isPartyMemberNearbyForReward,
  isSameWorldPlayfield,
  isWithinMapNearbyHeroRadius,
  isWithinMobBattleRange,
  isWithinPlayerVisibilityRadius,
  MAP_NEARBY_HERO_RADIUS,
} from '../src/domain/mapNearbyRadius.js';
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
import { createPartyForUser } from '../src/services/party/partyService.js';
import {
  cleanupStalePartyBattleSessionsInTx,
  createActivePartyBattleSessionInTx,
  endActivePartyBattleSessionForPartyDisbandInTx,
  endPartyBattleSessionInTx,
  findActivePartyBattleSessionByPartyIdInTx,
  joinPartyBattleParticipantInTx,
  leavePartyBattleParticipantInTx,
  recordPartyKillRewardInTx,
} from '../src/services/party/partyBattleSessionService.js';

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
  const login = `pb_${label}_${suffix}`;
  const name = `B${label}${suffix.slice(-4)}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
        },
      },
    },
    include: { characters: true },
  });
  return { userId: user.id, characterId: user.characters[0]!.id };
}

function testPureRadiusAndSplit(): void {
  console.log('\n[pure] radius + split');

  assert.equal(
    isWithinMapNearbyHeroRadius(0, 0, MAP_NEARBY_HERO_RADIUS, 0),
    true
  );
  assert.equal(
    isWithinMapNearbyHeroRadius(0, 0, MAP_NEARBY_HERO_RADIUS + 1, 0),
    false
  );
  ok('red radius boundary');

  assert.equal(
    isWithinMobBattleRange({ worldX: 0, worldY: 0 }, { worldX: BATTLE_RANGE, worldY: 0 }),
    true
  );
  assert.equal(
    isWithinMobBattleRange(
      { worldX: 0, worldY: 0 },
      { worldX: BATTLE_RANGE + 1, worldY: 0 }
    ),
    false
  );
  ok('mob battle range boundary');

  const worldA = { worldX: 100, worldY: 100, dungeonStateJson: null };
  const worldB = { worldX: 200, worldY: 200, dungeonStateJson: null };
  const dungeonA = {
    worldX: 100,
    worldY: 100,
    dungeonStateJson: { v: 1, dungeonId: 'd1', mapX: 1, mapY: 1, targetMapX: 1, targetMapY: 1, moveFromMapX: 1, moveFromMapY: 1, moveStartAt: null, pathPts: [] },
  };
  assert.equal(isSameWorldPlayfield(worldA, worldB), true);
  assert.equal(isSameWorldPlayfield(worldA, dungeonA), false);
  ok('same world playfield');

  const killer = { worldX: 0, worldY: 0, dungeonStateJson: null };
  const near = { worldX: 1000, worldY: 0, dungeonStateJson: null };
  const far = { worldX: MAP_NEARBY_HERO_RADIUS + 500, worldY: 0, dungeonStateJson: null };
  assert.equal(isWithinPlayerVisibilityRadius(killer, near), true);
  assert.equal(isPartyMemberNearbyForReward(killer, near), true);
  assert.equal(isPartyMemberNearbyForReward(killer, far), false);
  ok('party member nearby for reward geometry');

  const s2 = splitEvenly(1000, ['a', 'b'], 'a');
  assert.equal(s2.get('a'), 500);
  assert.equal(s2.get('b'), 500);
  assert.equal(sumSplitMap(s2), 1000);
  ok('split 1000 / 2');

  const s21 = splitEvenly(1001, ['a', 'b'], 'a');
  assert.equal(s21.get('a'), 501);
  assert.equal(s21.get('b'), 500);
  assert.equal(sumSplitMap(s21), 1001);
  ok('split 1001 / 2 killer first remainder');

  const ids5 = ['e', 'b', 'c', 'd', 'a'];
  const s5 = splitEvenly(1003, ids5, 'c');
  assert.equal(sumSplitMap(s5), 1003);
  for (const id of ids5) {
    const v = s5.get(id)!;
    assert.ok(v === 200 || v === 201);
  }
  ok('split between 5 with remainder');

  const adena = splitEvenlyBigInt(1001n, ['x', 'y'], 'x');
  assert.equal(adena.get('x'), 501n);
  assert.equal(adena.get('y'), 500n);
  assert.equal(sumSplitBigIntMap(adena), 1001n);
  ok('bigint split sum equals total');
}

async function testSessionLifecycle(): Promise<void> {
  console.log('\n[db] session lifecycle');

  const a = await createTestAccount('life');
  const party = await createPartyForUser(a.userId);
  const partyId = party.party!.id;

  const session = await prisma.$transaction((tx) =>
    createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId: 'test_spawn_1',
      canonicalMobTemplateId: 'mob_tpl_1',
      mobWorldX: 1000,
      mobWorldY: 2000,
      mobMaxHp: 500,
      starterCharacterId: a.characterId,
    })
  );
  assert.equal(session.activePartyKey, partyId);
  assert.equal(session.originPartyId, partyId);
  assert.equal(session.partyId, partyId);
  assert.equal(session.mobHp, 500);
  assert.equal(session.state, PARTY_BATTLE_SESSION_STATE.active);
  ok('create active session');

  const dup = await prisma.$transaction(async (tx) => {
    try {
      await createActivePartyBattleSessionInTx(tx, {
        partyId,
        spawnId: 'test_spawn_2',
        canonicalMobTemplateId: 'mob_tpl_2',
        mobWorldX: 0,
        mobWorldY: 0,
        mobMaxHp: 100,
        starterCharacterId: a.characterId,
      });
      return false;
    } catch (err) {
      return err instanceof Error && err.message === 'party_battle_session_already_active';
    }
  });
  assert.equal(dup, true);
  ok('only one active session per originPartyId');

  const ended = await prisma.$transaction((tx) =>
    endPartyBattleSessionInTx(tx, {
      sessionId: session.id,
      terminalState: PARTY_BATTLE_SESSION_STATE.victory,
      endReason: PARTY_BATTLE_END_REASON.victory,
    })
  );
  assert.equal(ended.activePartyKey, null);
  assert.equal(ended.state, PARTY_BATTLE_SESSION_STATE.victory);
  assert.ok(ended.endedAt);
  ok('after victory activePartyKey cleared');

  const reEnded = await prisma.$transaction((tx) =>
    endPartyBattleSessionInTx(tx, {
      sessionId: session.id,
      terminalState: PARTY_BATTLE_SESSION_STATE.ended,
      endReason: PARTY_BATTLE_END_REASON.timeout,
    })
  );
  assert.equal(reEnded.state, PARTY_BATTLE_SESSION_STATE.victory);
  assert.equal(reEnded.endReason, PARTY_BATTLE_END_REASON.victory);
  ok('repeat end is idempotent');

  const session2 = await prisma.$transaction((tx) =>
    createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId: 'test_spawn_3',
      canonicalMobTemplateId: 'mob_tpl_3',
      mobWorldX: 10,
      mobWorldY: 20,
      mobMaxHp: 300,
      starterCharacterId: a.characterId,
    })
  );
  assert.equal(session2.activePartyKey, partyId);
  ok('new session after previous ended');

  await prisma.partyBattleSession.deleteMany({
    where: { originPartyId: partyId },
  });
  await prisma.party.delete({ where: { id: partyId } });
  await prisma.user.delete({ where: { id: a.userId } });
}

async function testParticipants(): Promise<void> {
  console.log('\n[db] participants');

  const leader = await createTestAccount('pt');
  const member = await createTestAccount('pm');
  const party = await createPartyForUser(leader.userId);
  const partyId = party.party!.id;

  const session = await prisma.$transaction((tx) =>
    createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId: 'spawn_p',
      canonicalMobTemplateId: 'tpl_p',
      mobWorldX: 0,
      mobWorldY: 0,
      mobMaxHp: 100,
      starterCharacterId: leader.characterId,
    })
  );

  await prisma.$transaction((tx) =>
    joinPartyBattleParticipantInTx(tx, {
      sessionId: session.id,
      characterId: member.characterId,
    })
  );
  await prisma.$transaction((tx) =>
    joinPartyBattleParticipantInTx(tx, {
      sessionId: session.id,
      characterId: member.characterId,
    })
  );
  const count = await prisma.partyBattleParticipant.count({
    where: { partyBattleId: session.id },
  });
  assert.equal(count, 2);
  ok('participant not duplicated on re-join');

  await prisma.$transaction((tx) =>
    leavePartyBattleParticipantInTx(tx, {
      sessionId: session.id,
      characterId: member.characterId,
    })
  );
  await prisma.$transaction((tx) =>
    leavePartyBattleParticipantInTx(tx, {
      sessionId: session.id,
      characterId: member.characterId,
    })
  );
  const left = await prisma.partyBattleParticipant.findUnique({
    where: {
      partyBattleId_characterId: {
        partyBattleId: session.id,
        characterId: member.characterId,
      },
    },
  });
  assert.equal(left?.active, false);
  assert.ok(left?.leftAt);
  ok('participant leave idempotent');

  await prisma.partyBattleSession.deleteMany({ where: { id: session.id } });
  await prisma.party.delete({ where: { id: partyId } });
  await prisma.user.deleteMany({
    where: { id: { in: [leader.userId, member.userId] } },
  });
}

async function testDisbandHistory(): Promise<void> {
  console.log('\n[db] disband + reward history');

  const a = await createTestAccount('dis');
  const party = await createPartyForUser(a.userId);
  const partyId = party.party!.id;

  const session = await prisma.$transaction((tx) =>
    createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId: 'spawn_d',
      canonicalMobTemplateId: 'tpl_d',
      mobWorldX: 1,
      mobWorldY: 2,
      mobMaxHp: 50,
      starterCharacterId: a.characterId,
    })
  );

  await prisma.$transaction((tx) =>
    recordPartyKillRewardInTx(tx, {
      partyBattleId: session.id,
      characterId: a.characterId,
      expGain: 10,
      spGain: 1,
      adenaGain: 5n,
    })
  );

  await prisma.$transaction((tx) =>
    endActivePartyBattleSessionForPartyDisbandInTx(tx, partyId)
  );

  await prisma.party.delete({ where: { id: partyId } });

  const hist = await prisma.partyBattleSession.findUnique({
    where: { id: session.id },
    include: { rewards: true },
  });
  assert.ok(hist);
  assert.equal(hist!.partyId, null);
  assert.equal(hist!.originPartyId, partyId);
  assert.equal(hist!.endReason, PARTY_BATTLE_END_REASON.party_disbanded);
  assert.equal(hist!.rewards.length, 1);
  ok('disband does not delete historical session');

  assert.equal(hist!.rewards[0]!.expGain, 10);
  ok('PartyKillReward survives Party delete');

  await prisma.partyBattleSession.delete({ where: { id: session.id } });
  await prisma.user.delete({ where: { id: a.userId } });
}

async function testCleanupTimeout(): Promise<void> {
  console.log('\n[db] cleanup timeout');

  const a = await createTestAccount('to');
  const party = await createPartyForUser(a.userId);
  const partyId = party.party!.id;

  const old = new Date(Date.now() - 3 * 60 * 1000);
  const session = await prisma.partyBattleSession.create({
    data: {
      partyId,
      originPartyId: partyId,
      activePartyKey: partyId,
      spawnId: 'spawn_t',
      canonicalMobTemplateId: 'tpl_t',
      mobWorldX: 0,
      mobWorldY: 0,
      mobHp: 10,
      mobMaxHp: 10,
      state: PARTY_BATTLE_SESSION_STATE.active,
      lastActivityAt: old,
      participants: {
        create: {
          characterId: a.characterId,
          joinedAt: old,
          lastActivityAt: old,
          active: true,
        },
      },
    },
  });

  const n = await prisma.$transaction((tx) =>
    cleanupStalePartyBattleSessionsInTx(tx, Date.now())
  );
  assert.ok(n >= 1);

  const after = await prisma.partyBattleSession.findUnique({
    where: { id: session.id },
  });
  assert.equal(after?.state, PARTY_BATTLE_SESSION_STATE.ended);
  assert.equal(after?.activePartyKey, null);
  assert.equal(after?.endReason, PARTY_BATTLE_END_REASON.timeout);
  ok('timeout ends session and clears activePartyKey');

  const session2 = await prisma.$transaction((tx) =>
    createActivePartyBattleSessionInTx(tx, {
      partyId,
      spawnId: 'spawn_t2',
      canonicalMobTemplateId: 'tpl_t2',
      mobWorldX: 0,
      mobWorldY: 0,
      mobMaxHp: 20,
      starterCharacterId: a.characterId,
    })
  );
  assert.ok(session2.activePartyKey);
  ok('new session allowed after timeout cleanup');

  await prisma.partyBattleSession.deleteMany({ where: { originPartyId: partyId } });
  await prisma.party.delete({ where: { id: partyId } });
  await prisma.user.delete({ where: { id: a.userId } });
}

async function testConcurrentCreate(): Promise<void> {
  console.log('\n[db] concurrent session create');

  const a = await createTestAccount('cc');
  const party = await createPartyForUser(a.userId);
  const partyId = party.party!.id;

  const args = {
    partyId,
    spawnId: 'spawn_cc',
    canonicalMobTemplateId: 'tpl_cc',
    mobWorldX: 0,
    mobWorldY: 0,
    mobMaxHp: 100,
    starterCharacterId: a.characterId,
  };

  const results = await Promise.allSettled([
    prisma.$transaction((tx) => createActivePartyBattleSessionInTx(tx, args)),
    prisma.$transaction((tx) => createActivePartyBattleSessionInTx(tx, args)),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter(
    (r) =>
      r.status === 'rejected' &&
      r.reason instanceof Error &&
      r.reason.message === 'party_battle_session_already_active'
  );
  assert.equal(fulfilled.length, 1);
  assert.equal(rejected.length, 1);
  ok('concurrent create — exactly one succeeds');

  const active = await findActivePartyBattleSessionByPartyIdInTx(
    prisma,
    partyId
  );
  assert.ok(active);
  assert.equal(active!.activePartyKey, partyId);

  await prisma.partyBattleSession.deleteMany({ where: { originPartyId: partyId } });
  await prisma.party.delete({ where: { id: partyId } });
  await prisma.user.delete({ where: { id: a.userId } });
}

async function main(): Promise<void> {
  console.log('party-battle stage A smoke');
  testPureRadiusAndSplit();
  await testSessionLifecycle();
  await testParticipants();
  await testDisbandHistory();
  await testCleanupTimeout();
  await testConcurrentCreate();
  console.log('\n' + passed + ' passed');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
