/**
 * Stage E: dungeon party battle.
 * npm run test:party-battle-dungeon
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
import { findSevenSignsDungeonById } from '../src/data/sevenSignsDungeons.js';
import {
  SEVEN_SIGNS_DUNGEON_MOB_SPAWNS,
} from '../src/data/sevenSignsDungeonMobSpawns.generated.js';
import { DUNGEON_NEARBY_RADIUS_PX } from '../src/domain/dungeonNearbyMobsQuery.js';
import {
  isPartyBattleDungeonEnabled,
  isPartyBattleEngineEnabled,
} from '../src/domain/partyBattleFlags.js';
import {
  isWithinDungeonMemberRadius,
  isWithinDungeonPartyBattleRadius,
} from '../src/domain/partyBattlePlayfield.js';
import {
  resolvePartyBattleRewardEligibleIds,
} from '../src/domain/partyBattleRewardEligibility.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import { serializeDungeonState } from '../src/domain/dungeonState.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import { performDungeonLeave } from '../src/services/dungeonLeaveService.js';
import { getPartyHudForUser } from '../src/services/party/partyHudService.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import {
  applyPartyBattleSharedDamageInTx,
} from '../src/services/party/partyBattleActionLock.js';
import { touchOnlinePresence } from '../src/services/onlinePresenceService.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';

const WORLD_SPAWN = MAP_WORLD_SPAWNS[0]!;
const DUNGEON_ID = 'necropolis_of_sacrifice';
const DUNGEON = findSevenSignsDungeonById(DUNGEON_ID)!;
const DUNGEON_MOB = SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
  (m) => m.kind !== 'raid'
)!;
const OTHER_DUNGEON_ID = 'necropolis_of_devotion';
const OTHER_DUNGEON_MOB = SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[OTHER_DUNGEON_ID]![0]!;

let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function resetFlags(): void {
  delete process.env.PARTY_BATTLE_ENABLED;
  delete process.env.PARTY_BATTLE_DUNGEON_ENABLED;
  delete process.env.PARTY_BATTLE_REWARDS_ENABLED;
  delete process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;
}

function withStageEFlags(fn: () => Promise<void>): Promise<void> {
  resetFlags();
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_DUNGEON_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  return fn().finally(resetFlags);
}

async function createTestAccount(label: string): Promise<{
  userId: string;
  characterId: string;
}> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbe_${label}_${suffix}`;
  const name = `E${label}${suffix.slice(-4)}`.slice(0, 16);
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
          worldX: DUNGEON.worldX,
          worldY: DUNGEON.worldY,
        },
      },
    },
    include: { characters: true },
  });
  await touchOnlinePresence(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function addPartyMember(
  partyId: string,
  characterId: string,
  slotOrder: number
): Promise<void> {
  await prisma.partyMember.create({
    data: { partyId, characterId, slotOrder },
  });
}

function dungeonStateAt(mapX: number, mapY: number, dungeonId: string = DUNGEON_ID) {
  return serializeDungeonState({
    v: 1,
    dungeonId,
    mapX,
    mapY,
    targetMapX: 0,
    targetMapY: 0,
    moveStartAt: null,
    moveFromMapX: mapX,
    moveFromMapY: mapY,
    pathPts: [],
  });
}

async function placeInDungeon(
  characterId: string,
  mapX: number,
  mapY: number,
  dungeonId: string = DUNGEON_ID
): Promise<void> {
  const d = findSevenSignsDungeonById(dungeonId)!;
  await prisma.character.update({
    where: { id: characterId },
    data: {
      worldX: d.worldX,
      worldY: d.worldY,
      dungeonStateJson: dungeonStateAt(mapX, mapY, dungeonId),
      battleJson: Prisma.JsonNull,
    },
  });
}

async function cleanupCharacter(characterId: string, userId: string): Promise<void> {
  await prisma.partyBattleParticipant.deleteMany({ where: { characterId } });
  await prisma.partyKillReward.deleteMany({ where: { characterId } });
  await prisma.partyMember.deleteMany({ where: { characterId } });
  await prisma.partyBattleSession.deleteMany({
    where: { participants: { some: { characterId } } },
  });
  await prisma.user.delete({ where: { id: userId } }).catch(() => {});
}

async function testFlags(): Promise<void> {
  console.log('\n[flags] PARTY_BATTLE_DUNGEON_ENABLED');
  resetFlags();
  assert.equal(isPartyBattleDungeonEnabled(), false);
  process.env.PARTY_BATTLE_ENABLED = 'true';
  assert.equal(isPartyBattleDungeonEnabled(), false);
  process.env.PARTY_BATTLE_DUNGEON_ENABLED = 'true';
  assert.equal(isPartyBattleDungeonEnabled(), true);
  ok('dungeon flag requires engine + dungeon flag');
  resetFlags();
}

async function testDungeonRadiusPure(): Promise<void> {
  console.log('\n[pure] dungeon 70px radius');
  assert.equal(
    isWithinDungeonPartyBattleRadius(0, 0, DUNGEON_NEARBY_RADIUS_PX, 0),
    true
  );
  assert.equal(
    isWithinDungeonPartyBattleRadius(0, 0, DUNGEON_NEARBY_RADIUS_PX + 1, 0),
    false
  );
  assert.equal(isWithinDungeonMemberRadius(0, 0, 50, 0), true);
  ok('boundary 70px allowed/denied');
}

async function testDungeonFlagOffSolo(): Promise<void> {
  console.log('\n[solo] dungeon flag off → solo battle');
  resetFlags();
  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  const a = await createTestAccount('solo');
  await createPartyForUser(a.userId, a.characterId);
  await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
  const char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  const result = await prisma.$transaction((tx) =>
    startBattleInTx(tx, a.userId, DUNGEON_MOB.id, char.revision, {
      characterId: a.characterId,
    })
  );
  assert.ok(result.battle);
  const bj = parseBattleJson(result.character.battleJson as never);
  assert.equal(bj?.partyBattleId ?? null, null);
  ok('solo dungeon battle without partyBattleId');
  await cleanupCharacter(a.characterId, a.userId);
  resetFlags();
}

async function testDungeonStartJoin(): Promise<void> {
  console.log('\n[dungeon] two members start/join same mob');
  await withStageEFlags(async () => {
    const a = await createTestAccount('st');
    const b = await createTestAccount('jn');
    const party = await createPartyForUser(a.userId, a.characterId);
    await addPartyMember(party.party.id, b.characterId, 1);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    await placeInDungeon(b.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);

    const charA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charA.revision, {
        characterId: a.characterId,
      })
    );

    const charB = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, b.userId, DUNGEON_MOB.id, charB.revision, {
        characterId: b.characterId,
      })
    );

    const sessions = await prisma.partyBattleSession.findMany({
      where: { originPartyId: party.party.id, state: PARTY_BATTLE_SESSION_STATE.active },
    });
    assert.equal(sessions.length, 1);
    assert.equal(sessions[0]!.playfield, 'dungeon');
    assert.equal(sessions[0]!.dungeonId, DUNGEON_ID);
    assert.equal(sessions[0]!.mobMapX, DUNGEON_MOB.mapX);
    assert.equal(sessions[0]!.mobWorldX, null);
    ok('one dungeon session, correct playfield coords');

    await cleanupCharacter(a.characterId, a.userId);
    await cleanupCharacter(b.characterId, b.userId);
  });
}

async function testWrongDungeonJoin(): Promise<void> {
  console.log('\n[dungeon] wrong dungeonId → party_battle_wrong_spawn');
  await withStageEFlags(async () => {
    const a = await createTestAccount('wd');
    const party = await createPartyForUser(a.userId, a.characterId);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    const charA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charA.revision, {
        characterId: a.characterId,
      })
    );

    await placeInDungeon(a.characterId, OTHER_DUNGEON_MOB.mapX, OTHER_DUNGEON_MOB.mapY, OTHER_DUNGEON_ID);
    const charB = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    let errMsg = '';
    try {
      await prisma.$transaction((tx) =>
        startBattleInTx(tx, a.userId, OTHER_DUNGEON_MOB.id, charB.revision, {
          characterId: a.characterId,
        })
      );
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }
    assert.equal(errMsg, 'party_battle_wrong_spawn');
    ok('different dungeon mob rejected');

    await cleanupCharacter(a.characterId, a.userId);
  });
}

async function testOutOfRange(): Promise<void> {
  console.log('\n[dungeon] >70px join/action denied');
  await withStageEFlags(async () => {
    const a = await createTestAccount('rg');
    await createPartyForUser(a.userId, a.characterId);
    const farX = DUNGEON_MOB.mapX + DUNGEON_NEARBY_RADIUS_PX + 20;
    await placeInDungeon(a.characterId, farX, DUNGEON_MOB.mapY);
    const char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    let errMsg = '';
    try {
      await prisma.$transaction((tx) =>
        startBattleInTx(tx, a.userId, DUNGEON_MOB.id, char.revision, {
          characterId: a.characterId,
        })
      );
    } catch (e) {
      errMsg = e instanceof Error ? e.message : String(e);
    }
    assert.equal(errMsg, 'battle_too_far');
    ok('start denied when far from mob');

    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    const charNear = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    const started = await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charNear.revision, {
        characterId: a.characterId,
      })
    );
    const bj = parseBattleJson(started.character.battleJson as never)!;
    await placeInDungeon(a.characterId, farX, DUNGEON_MOB.mapY);
    const charFar = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    let actionErr = '';
    try {
      await prisma.$transaction((tx) =>
        performBattleActionInTx(tx, a.userId, {
          action: 'attack',
          expectedRevision: charFar.revision,
        })
      );
    } catch (e) {
      actionErr = e instanceof Error ? e.message : String(e);
    }
    assert.equal(actionErr, 'battle_out_of_range');
    assert.ok(bj.partyBattleId);
    ok('action denied when moved >70px from mob');

    await cleanupCharacter(a.characterId, a.userId);
  });
}

async function testSharedHp(): Promise<void> {
  console.log('\n[dungeon] shared HP from two attackers');
  await withStageEFlags(async () => {
    const a = await createTestAccount('hp');
    const b = await createTestAccount('hp2');
    const party = await createPartyForUser(a.userId, a.characterId);
    await addPartyMember(party.party.id, b.characterId, 1);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    await placeInDungeon(b.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);

    let charA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charA.revision, {
        characterId: a.characterId,
      })
    );
    let charB = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, b.userId, DUNGEON_MOB.id, charB.revision, {
        characterId: b.characterId,
      })
    );

    const session = await prisma.partyBattleSession.findFirstOrThrow({
      where: { originPartyId: party.party.id, state: PARTY_BATTLE_SESSION_STATE.active },
    });
    const hp0 = session.mobHp;

    await prisma.$transaction(async (tx) => {
      await applyPartyBattleSharedDamageInTx(tx, {
        sessionId: session.id,
        characterId: a.characterId,
        damage: 100,
      });
      await applyPartyBattleSharedDamageInTx(tx, {
        sessionId: session.id,
        characterId: b.characterId,
        damage: 150,
      });
    });

    const after = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: session.id },
    });
    assert.equal(after.mobHp, hp0 - 250);
    assert.equal(after.battleVersion, session.battleVersion + 2);
    ok('shared mobHp decrements from both');

    await cleanupCharacter(a.characterId, a.userId);
    await cleanupCharacter(b.characterId, b.userId);
  });
}

async function testRewardEligibilityDungeon(): Promise<void> {
  console.log('\n[reward] dungeon 70px eligibility');
  const killerDungeon = { dungeonId: DUNGEON_ID, mapX: 100, mapY: 100 };
  const nearDungeon = { dungeonId: DUNGEON_ID, mapX: 120, mapY: 100 };
  const farDungeon = { dungeonId: DUNGEON_ID, mapX: 200, mapY: 100 };
  const eligible = resolvePartyBattleRewardEligibleIds({
    killerCharacterId: 'k',
    killerResolved: { worldX: 0, worldY: 0, dungeonStateJson: { v: 1, dungeonId: DUNGEON_ID } },
    killerDungeonMap: killerDungeon,
    playfield: 'dungeon',
    partyMemberIds: ['k', 'near', 'far'],
    memberSnapshots: [
      {
        characterId: 'k',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: {} },
        dungeonMap: killerDungeon,
      },
      {
        characterId: 'near',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 999, worldY: 999, dungeonStateJson: {} },
        dungeonMap: nearDungeon,
      },
      {
        characterId: 'far',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: {} },
        dungeonMap: farDungeon,
      },
    ],
    isOnline: () => true,
  });
  assert.deepEqual(eligible.sort(), ['k', 'near']);
  ok('near member eligible without damage; far excluded; world coords ignored');
}

async function testDungeonExitEndsParticipant(): Promise<void> {
  console.log('\n[exit] leave dungeon during battle');
  await withStageEFlags(async () => {
    const a = await createTestAccount('ex');
    await createPartyForUser(a.userId, a.characterId);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    let char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, char.revision, {
        characterId: a.characterId,
      })
    );
    char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    assert.ok(parseBattleJson(char.battleJson as never)?.partyBattleId);

    await performDungeonLeave(a.userId, char.revision);
    char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    assert.equal(char.dungeonStateJson, null);
    assert.equal(char.battleJson, null);

    const participant = await prisma.partyBattleParticipant.findFirst({
      where: { characterId: a.characterId },
      orderBy: { joinedAt: 'desc' },
    });
    assert.equal(participant?.active, false);

    const session = await prisma.partyBattleSession.findFirst({
      where: { originPartyId: (await prisma.partyMember.findUniqueOrThrow({ where: { characterId: a.characterId } })).partyId },
      orderBy: { createdAt: 'desc' },
    });
    assert.equal(session?.state, PARTY_BATTLE_SESSION_STATE.ended);
    assert.equal(session?.endReason, PARTY_BATTLE_END_REASON.dungeon_exit);
    ok('dungeon exit clears battle, ends session');

    await cleanupCharacter(a.characterId, a.userId);
  });
}

async function testDungeonHudCanJoin(): Promise<void> {
  console.log('\n[hud] activeBattle dungeon canJoin');
  await withStageEFlags(async () => {
    const a = await createTestAccount('hd');
    const b = await createTestAccount('hd2');
    const party = await createPartyForUser(a.userId, a.characterId);
    await addPartyMember(party.party.id, b.characterId, 1);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    await placeInDungeon(b.characterId, DUNGEON_MOB.mapX + 10, DUNGEON_MOB.mapY);

    let charA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charA.revision, {
        characterId: a.characterId,
      })
    );

    const hud = await getPartyHudForUser(b.userId);
    assert.ok(hud.activeBattle);
    assert.equal(hud.activeBattle!.playfield, 'dungeon');
    assert.equal(hud.activeBattle!.dungeonId, DUNGEON_ID);
    assert.equal(hud.activeBattle!.canJoin, true);
    assert.equal(hud.activeBattle!.mobInBattleRange, true);
    ok('HUD shows dungeon activeBattle with canJoin');

    await cleanupCharacter(a.characterId, a.userId);
    await cleanupCharacter(b.characterId, b.userId);
  });
}

async function testBattleSyncNearby(): Promise<void> {
  console.log('\n[sync] battle members nearby via dungeon coords');
  await withStageEFlags(async () => {
    const a = await createTestAccount('sy');
    const b = await createTestAccount('sy2');
    const party = await createPartyForUser(a.userId, a.characterId);
    await addPartyMember(party.party.id, b.characterId, 1);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    await placeInDungeon(b.characterId, DUNGEON_MOB.mapX + 5, DUNGEON_MOB.mapY);

    let charA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charA.revision, {
        characterId: a.characterId,
      })
    );
    let charB = await prisma.character.findUniqueOrThrow({ where: { id: b.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, b.userId, DUNGEON_MOB.id, charB.revision, {
        characterId: b.characterId,
      })
    );

    const sync = await getBattleSyncForUser(a.userId);
    assert.ok(sync.members && sync.members.length >= 1);
    const mate = sync.members!.find((m) => m.characterId === b.characterId);
    assert.ok(mate);
    assert.equal(mate!.nearby, true);
    ok('battle sync marks party member nearby in dungeon');

    await cleanupCharacter(a.characterId, a.userId);
    await cleanupCharacter(b.characterId, b.userId);
  });
}

async function testVictoryKeepsDungeonState(): Promise<void> {
  console.log('\n[victory] dungeonStateJson preserved after party win');
  await withStageEFlags(async () => {
    const a = await createTestAccount('vc');
    await createPartyForUser(a.userId, a.characterId);
    await placeInDungeon(a.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
    let char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, char.revision, {
        characterId: a.characterId,
      })
    );

    char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    const bj = parseBattleJson(char.battleJson as never)!;
    const session = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: bj.partyBattleId! },
    });

    await prisma.$transaction(async (tx) => {
      await tx.partyBattleSession.update({
        where: { id: session.id },
        data: {
          mobHp: 0,
          state: PARTY_BATTLE_SESSION_STATE.victory,
          activePartyKey: null,
          endReason: PARTY_BATTLE_END_REASON.victory,
        },
      });
      await tx.character.update({
        where: { id: a.characterId },
        data: { battleJson: Prisma.JsonNull },
      });
    });

    char = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    assert.ok(char.dungeonStateJson != null);
    ok('dungeonStateJson remains after victory clear battle');

    await cleanupCharacter(a.characterId, a.userId);
  });
}

async function main(): Promise<void> {
  console.log('party-battle-dungeon-smoke\n');
  assert.ok(isPartyBattleEngineEnabled() === false, 'engine off by default');

  await testFlags();
  await testDungeonRadiusPure();
  await testDungeonFlagOffSolo();
  await testDungeonStartJoin();
  await testWrongDungeonJoin();
  await testOutOfRange();
  await testSharedHp();
  await testRewardEligibilityDungeon();
  await testDungeonExitEndsParticipant();
  await testDungeonHudCanJoin();
  await testBattleSyncNearby();
  await testVictoryKeepsDungeonState();

  console.log(`\n${passed} checks passed`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
