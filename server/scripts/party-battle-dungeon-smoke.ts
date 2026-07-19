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
  resolveLiveDungeonMapPosition,
} from '../src/domain/partyBattlePlayfield.js';
import { resolveMapMovement } from '../src/domain/mapMovement.js';
import {
  resolvePartyBattleRewardEligibleIds,
} from '../src/domain/partyBattleRewardEligibility.js';
import {
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../src/domain/partyBattleSessionConstants.js';
import { serializeDungeonState } from '../src/domain/dungeonState.js';
import { L2DOP_LEVEL_MIN_EXP } from '../src/data/l2dopExpgain.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { startHuntContinueBattle } from '../src/services/battleServiceHuntContinue.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import { performDungeonLeave } from '../src/services/dungeonLeaveService.js';
import { getPartyHudForUser } from '../src/services/party/partyHudService.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import {
  applyPartyBattleSharedDamageInTx,
} from '../src/services/party/partyBattleActionLock.js';
import { touchOnlinePresence, isCharacterOnlineNow } from '../src/services/onlinePresenceService.js';
import { buildPartyBattleRewardOnlineCheck } from '../src/services/party/partyBattleRewardOnline.js';
import { preparePartyBattleLethalStrikeInTx } from './partyBattleSmokeLethalHelper.js';
import type { BattleActionFullResponse } from '../src/services/battleServiceDeltaTypes.js';
import { ensureClanHallOnRow } from '../src/services/charClientSnapshot.js';
import { toSnapshot } from '../src/services/charService.js';
import { parseBattleJson } from '../src/services/battleServiceParseBattleJson.js';

const WORLD_SPAWN = MAP_WORLD_SPAWNS[0]!;
const DUNGEON_ID = 'necropolis_of_sacrifice';
const DUNGEON = findSevenSignsDungeonById(DUNGEON_ID)!;
const DUNGEON_MOB = SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
  (m) => m.kind !== 'raid'
)!;
const HUNT_MOB_A =
  SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
    (m) => m.id === 'sdms_necropolis_of_sacrifice_037'
  ) ?? DUNGEON_MOB;
const HUNT_MOB_B =
  SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
    (m) => m.id === 'sdms_necropolis_of_sacrifice_072'
  ) ?? DUNGEON_MOB;
const HUNT_PLAYER_MAP_X = HUNT_MOB_A.mapX;
const HUNT_PLAYER_MAP_Y = HUNT_MOB_A.mapY;
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

async function createTestAccount(
  label: string,
  opts?: { touchPresence?: boolean; level?: number }
): Promise<{
  userId: string;
  characterId: string;
}> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbe_${label}_${suffix}`;
  const name = `E${label}${suffix.slice(-4)}`.slice(0, 16);
  const level = Math.max(1, Math.min(80, Math.floor(opts?.level ?? 40)));
  const exp = L2DOP_LEVEL_MIN_EXP[level - 1]!;
  const user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name,
          race: 'Human',
          classBranch: 'fighter',
          level,
          exp,
          hp: 5000,
          maxHp: 5000,
          worldX: DUNGEON.worldX,
          worldY: DUNGEON.worldY,
        },
      },
    },
    include: { characters: true },
  });
  if (opts?.touchPresence !== false) {
    await touchOnlinePresence(user.id);
  }
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
  dungeonId: string = DUNGEON_ID,
  opts?: { preserveBattle?: boolean }
): Promise<void> {
  const d = findSevenSignsDungeonById(dungeonId)!;
  const data: Prisma.CharacterUpdateInput = {
    worldX: d.worldX,
    worldY: d.worldY,
    dungeonStateJson: dungeonStateAt(mapX, mapY, dungeonId),
  };
  if (!opts?.preserveBattle) {
    data.battleJson = Prisma.JsonNull;
  }
  await prisma.character.update({
    where: { id: characterId },
    data,
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
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, a.userId, DUNGEON_MOB.id, charNear.revision, {
        characterId: a.characterId,
      })
    );
    await placeInDungeon(a.characterId, farX, DUNGEON_MOB.mapY, DUNGEON_ID, {
      preserveBattle: true,
    });
    const charFar = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    const bj = parseBattleJson(charFar.battleJson as never);
    let actionErr = '';
    try {
      await prisma.$transaction((tx) =>
        performBattleActionInTx(tx, a.userId, 'attack', charFar.revision, {
          characterId: a.characterId,
        })
      );
    } catch (e) {
      actionErr = e instanceof Error ? e.message : String(e);
    }
    assert.equal(actionErr, 'battle_out_of_range');
    assert.ok(bj?.partyBattleId);
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

function dungeonEligibilityInput(
  killerMapX: number,
  killerMapY: number,
  memberMapX: number,
  memberMapY: number,
  isOnline: (characterId: string) => boolean = () => true
) {
  const killerDungeon = { dungeonId: DUNGEON_ID, mapX: killerMapX, mapY: killerMapY };
  const memberDungeon = { dungeonId: DUNGEON_ID, mapX: memberMapX, mapY: memberMapY };
  return {
    killerCharacterId: 'k',
    killerResolved: { worldX: 0, worldY: 0, dungeonStateJson: { v: 1, dungeonId: DUNGEON_ID } },
    killerDungeonMap: killerDungeon,
    playfield: 'dungeon' as const,
    partyMemberIds: ['k', 'm'],
    memberSnapshots: [
      {
        characterId: 'k',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: {} },
        dungeonMap: killerDungeon,
      },
      {
        characterId: 'm',
        hp: 100,
        pvePendingDefeatJson: null,
        resolvedPosition: { worldX: 0, worldY: 0, dungeonStateJson: {} },
        dungeonMap: memberDungeon,
      },
    ],
    isOnline,
  };
}

function testDungeonRewardBoundaryPure(): void {
  console.log('\n[reward] dungeon boundary 70px / 71px');
  const at70 = resolvePartyBattleRewardEligibleIds(
    dungeonEligibilityInput(100, 100, 100 + DUNGEON_NEARBY_RADIUS_PX, 100)
  );
  assert.deepEqual(at70.sort(), ['k', 'm']);
  ok('70px boundary included');

  const at71 = resolvePartyBattleRewardEligibleIds(
    dungeonEligibilityInput(100, 100, 100 + DUNGEON_NEARBY_RADIUS_PX + 1, 100)
  );
  assert.deepEqual(at71, ['k']);
  ok('71px boundary excluded');
}

async function soloDungeonLethalAttack(
  userId: string,
  characterId: string,
  battleSpawnId: string
): Promise<void> {
  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
    await prisma.$transaction(async (tx) => {
      const char = await tx.character.findUniqueOrThrow({ where: { id: characterId } });
      const bj = parseBattleJson(char.battleJson as never);
      assert.ok(bj, 'soloDungeonLethalAttack: no battleJson');
      const updated = await tx.character.update({
        where: { id: characterId },
        data: {
          battleJson: { ...bj, mobHp: 1 } as unknown as Prisma.InputJsonValue,
          hp: Math.max(1, char.maxHp),
          skillCooldownsJson: [],
        },
      });
      const r = await performBattleActionInTx(tx, userId, 'attack', updated.revision, {
        characterId,
        battleSpawnId,
      });
      assert.ok(
        r.kind === 'full' ||
          (r.kind === 'delta' &&
            (r.victory != null || r.delta.battleEnded === true || r.delta.mobDead === true)),
        'soloDungeonLethalAttack: no victory'
      );
    });
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }
}

async function dungeonLethalAttack(
  userId: string,
  characterId: string,
  battleSpawnId: string = DUNGEON_MOB.id
): Promise<BattleActionFullResponse> {
  process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL = '1';
  try {
    let response: BattleActionFullResponse | undefined;
    await prisma.$transaction(async (tx) => {
      const { revision } = await preparePartyBattleLethalStrikeInTx(tx, characterId);
      const r = await performBattleActionInTx(tx, userId, 'attack', revision, {
        characterId,
        battleSpawnId,
      });
      if (r.kind === 'full') {
        response = r as BattleActionFullResponse;
        return;
      }
      if (
        r.kind === 'delta' &&
        (r.victory != null || r.delta.battleEnded === true || r.delta.mobDead === true)
      ) {
        const charAfter = await tx.character.findUniqueOrThrow({
          where: { id: characterId },
        });
        response = {
          kind: 'full',
          character: toSnapshot(await ensureClanHallOnRow(charAfter as never, tx)),
          battle: null,
          ...(r.victory ? { victory: r.victory } : {}),
          ...(r.partyReward ? { partyReward: r.partyReward } : {}),
        };
      }
    });
    assert.ok(response, 'dungeonLethalAttack: no response');
    return response!;
  } finally {
    delete process.env.PARTY_BATTLE_SMOKE_GUARANTEED_LETHAL;
  }
}

async function testDungeonNearbyMateRewardIntegration(): Promise<void> {
  console.log('\n[reward] lethal tx — nearby mate without participant row');
  await withStageEFlags(async () => {
    const killer = await createTestAccount('rw');
    const mate = await createTestAccount('rm', { touchPresence: false });
    await createPartyForUser(killer.userId, killer.characterId);
    const membership = await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: killer.characterId },
    });
    await addPartyMember(membership.partyId, mate.characterId, 1);

    const mapX = DUNGEON_MOB.mapX;
    const mapY = DUNGEON_MOB.mapY;
    await placeInDungeon(killer.characterId, mapX, mapY);
    await placeInDungeon(mate.characterId, mapX, mapY);

    const killerBefore = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const mateBefore = await prisma.character.findUniqueOrThrow({
      where: { id: mate.characterId },
    });

    let killerChar = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, killer.userId, DUNGEON_MOB.id, killerChar.revision, {
        characterId: killer.characterId,
      })
    );

    const killerAfterStart = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const bj = parseBattleJson(killerAfterStart.battleJson as never);
    assert.ok(bj?.partyBattleId);
    const sessionId = bj!.partyBattleId!;

    const activeParticipants = await prisma.partyBattleParticipant.count({
      where: { partyBattleId: sessionId, active: true },
    });
    assert.equal(activeParticipants, 1);
    assert.equal(isCharacterOnlineNow(mate.characterId), false);

    const killerSnapRow = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const mateSnapRow = await prisma.character.findUniqueOrThrow({
      where: { id: mate.characterId },
    });
    const nowMs = Date.now();
    const killerResolved = resolveMapMovement(killerSnapRow as never);
    const memberSnapshots = [
      {
        characterId: killer.characterId,
        hp: killerSnapRow.hp,
        pvePendingDefeatJson: killerSnapRow.pvePendingDefeatJson,
        resolvedPosition: {
          worldX: killerResolved.worldX,
          worldY: killerResolved.worldY,
          dungeonStateJson: killerResolved.dungeonStateJson,
        },
        dungeonMap: resolveLiveDungeonMapPosition(killerSnapRow as never, nowMs),
      },
      {
        characterId: mate.characterId,
        hp: mateSnapRow.hp,
        pvePendingDefeatJson: mateSnapRow.pvePendingDefeatJson,
        resolvedPosition: {
          worldX: mateSnapRow.worldX,
          worldY: mateSnapRow.worldY,
          dungeonStateJson: mateSnapRow.dungeonStateJson,
        },
        dungeonMap: resolveLiveDungeonMapPosition(mateSnapRow as never, nowMs),
      },
    ];
    const isOnline = buildPartyBattleRewardOnlineCheck({
      playfield: 'dungeon',
      sessionDungeonId: DUNGEON_ID,
      memberSnapshots,
      activeParticipantIds: new Set([killer.characterId]),
    });
    assert.equal(isOnline(mate.characterId), true);
    const preEligible = resolvePartyBattleRewardEligibleIds({
      killerCharacterId: killer.characterId,
      killerResolved: memberSnapshots[0]!.resolvedPosition,
      killerDungeonMap: memberSnapshots[0]!.dungeonMap,
      playfield: 'dungeon',
      partyMemberIds: [killer.characterId, mate.characterId],
      memberSnapshots,
      isOnline,
    });
    assert.deepEqual(preEligible.sort(), [killer.characterId, mate.characterId].sort());

    const result = await dungeonLethalAttack(killer.userId, killer.characterId);
    assert.ok(result.partyReward);
    assert.equal(result.partyReward!.recipientCount, 2);
    assert.equal(result.partyReward!.shared, true);

    const rewards = await prisma.partyKillReward.findMany({
      where: { partyBattleId: sessionId },
      orderBy: { characterId: 'asc' },
    });
    assert.equal(rewards.length, 2);

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
    ok('both members rewarded in dungeon lethal tx');

    await cleanupCharacter(killer.characterId, killer.userId);
    await cleanupCharacter(mate.characterId, mate.userId);
  });
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

    const sync = await getBattleSyncForUser(a.userId, {
      characterId: a.characterId,
      battleVersion: 0,
    });
    assert.ok(sync?.partyBattle?.members && sync.partyBattle.members.length >= 1);
    const mate = sync.partyBattle.members.find((m) => m.characterId === b.characterId);
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

async function dungeonPartyLethalWithEconomyCheck(
  userId: string,
  killerId: string,
  mateId: string,
  spawnId: string,
  killerBefore: { exp: bigint; sp: number; adena: bigint },
  mateBefore: { exp: bigint; sp: number; adena: bigint }
): Promise<{ sessionId: string; partyRewardRecipientCount: number }> {
  const killerRow = await prisma.character.findUniqueOrThrow({
    where: { id: killerId },
  });
  const bj = parseBattleJson(killerRow.battleJson as never);
  assert.ok(bj?.partyBattleId, 'expected partyBattleId before lethal');
  const sessionId = bj!.partyBattleId!;

  const result = await dungeonLethalAttack(userId, killerId, spawnId);
  assert.ok(result.partyReward, 'expected partyReward on lethal');
  assert.equal(result.partyReward!.shared, true);

  const rewards = await prisma.partyKillReward.findMany({
    where: { partyBattleId: sessionId },
  });
  assert.equal(rewards.length, result.partyReward!.recipientCount);

  const killerAfter = await prisma.character.findUniqueOrThrow({
    where: { id: killerId },
  });
  const mateAfter = await prisma.character.findUniqueOrThrow({
    where: { id: mateId },
  });
  assert.ok(Number(killerAfter.exp) > Number(killerBefore.exp));
  assert.ok(Number(mateAfter.exp) > Number(mateBefore.exp));
  assert.ok(killerAfter.sp > killerBefore.sp);
  assert.ok(mateAfter.sp > mateBefore.sp);

  const session = await prisma.partyBattleSession.findUniqueOrThrow({
    where: { id: sessionId },
  });
  assert.equal(session.playfield, 'dungeon');
  assert.equal(session.dungeonId, DUNGEON_ID);
  assert.equal(session.spawnId, spawnId);

  return {
    sessionId,
    partyRewardRecipientCount: result.partyReward!.recipientCount,
  };
}

async function testDungeonHuntContinuePartyBattle(): Promise<void> {
  console.log('\n[hunt-continue] party battle preserved across two dungeon kills');
  await withStageEFlags(async () => {
    const killer = await createTestAccount('h46', { level: 46 });
    const mate = await createTestAccount('h21', { level: 21, touchPresence: false });
    await touchOnlinePresence(killer.userId);
    await touchOnlinePresence(mate.userId);

    const party = await createPartyForUser(killer.userId, killer.characterId);
    await addPartyMember(party.party.id, mate.characterId, 1);

    await placeInDungeon(killer.characterId, HUNT_PLAYER_MAP_X, HUNT_PLAYER_MAP_Y);
    await placeInDungeon(mate.characterId, HUNT_PLAYER_MAP_X, HUNT_PLAYER_MAP_Y);

    let killerChar = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    await prisma.$transaction((tx) =>
      startBattleInTx(tx, killer.userId, HUNT_MOB_A.id, killerChar.revision, {
        characterId: killer.characterId,
      })
    );

    const killerBefore1 = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const mateBefore1 = await prisma.character.findUniqueOrThrow({
      where: { id: mate.characterId },
    });
    const first = await dungeonPartyLethalWithEconomyCheck(
      killer.userId,
      killer.characterId,
      mate.characterId,
      HUNT_MOB_A.id,
      {
        exp: killerBefore1.exp,
        sp: killerBefore1.sp,
        adena: killerBefore1.adena,
      },
      {
        exp: mateBefore1.exp,
        sp: mateBefore1.sp,
        adena: mateBefore1.adena,
      }
    );
    assert.equal(first.partyRewardRecipientCount, 2);
    ok('first dungeon kill: party session + 2 rewards');

    killerChar = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    assert.equal(killerChar.battleJson, null);

    const hunt = await startHuntContinueBattle(
      killer.userId,
      killerChar.revision,
      HUNT_MOB_A.id,
      undefined,
      HUNT_MOB_A.level,
      { characterId: killer.characterId }
    );
    const killerAfterHunt = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const huntBj = parseBattleJson(killerAfterHunt.battleJson as never);
    assert.ok(huntBj?.partyBattleId, 'hunt-continue must start party battle');
    assert.notEqual(huntBj!.partyBattleId, first.sessionId);
    assert.equal(hunt.battle?.spawnId, HUNT_MOB_B.id);

    const huntSession = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: huntBj!.partyBattleId! },
    });
    assert.equal(huntSession.state, PARTY_BATTLE_SESSION_STATE.active);
    assert.equal(huntSession.playfield, 'dungeon');
    assert.equal(huntSession.spawnId, HUNT_MOB_B.id);
    ok('hunt-continue created fresh dungeon PartyBattleSession');

    const killerBefore2 = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const mateBefore2 = await prisma.character.findUniqueOrThrow({
      where: { id: mate.characterId },
    });
    const second = await dungeonPartyLethalWithEconomyCheck(
      killer.userId,
      killer.characterId,
      mate.characterId,
      HUNT_MOB_B.id,
      {
        exp: killerBefore2.exp,
        sp: killerBefore2.sp,
        adena: killerBefore2.adena,
      },
      {
        exp: mateBefore2.exp,
        sp: mateBefore2.sp,
        adena: mateBefore2.adena,
      }
    );
    assert.equal(second.partyRewardRecipientCount, 2);
    ok('second dungeon kill after hunt-continue: 2 rewards + economy');

    await cleanupCharacter(killer.characterId, killer.userId);
    await cleanupCharacter(mate.characterId, mate.userId);
  });
}

async function testDungeonHuntContinueSoloThenJoinParty(): Promise<void> {
  console.log('\n[hunt-continue] solo first kill → join party → party battle');
  await withStageEFlags(async () => {
    const killer = await createTestAccount('hs', { level: 40 });
    const mate = await createTestAccount('hm', { level: 21, touchPresence: false });
    await touchOnlinePresence(killer.userId);
    await touchOnlinePresence(mate.userId);

    await placeInDungeon(killer.characterId, HUNT_PLAYER_MAP_X, HUNT_PLAYER_MAP_Y);
    await placeInDungeon(mate.characterId, HUNT_PLAYER_MAP_X, HUNT_PLAYER_MAP_Y);

    let killerChar = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const soloStart = await prisma.$transaction((tx) =>
      startBattleInTx(tx, killer.userId, HUNT_MOB_A.id, killerChar.revision, {
        characterId: killer.characterId,
      })
    );
    const soloBj = parseBattleJson(soloStart.character.battleJson as never);
    assert.equal(soloBj?.partyBattleId ?? null, null);
    ok('first battle solo without party');

    await soloDungeonLethalAttack(killer.userId, killer.characterId, HUNT_MOB_A.id);

    const party = await createPartyForUser(killer.userId, killer.characterId);
    await addPartyMember(party.party.id, mate.characterId, 1);

    killerChar = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const hunt = await startHuntContinueBattle(
      killer.userId,
      killerChar.revision,
      HUNT_MOB_A.id,
      undefined,
      HUNT_MOB_A.level,
      { characterId: killer.characterId }
    );
    const killerAfterHunt = await prisma.character.findUniqueOrThrow({
      where: { id: killer.characterId },
    });
    const huntBj = parseBattleJson(killerAfterHunt.battleJson as never);
    assert.ok(huntBj?.partyBattleId, 'after joining party hunt-continue must be party battle');
    const huntSession = await prisma.partyBattleSession.findUniqueOrThrow({
      where: { id: huntBj!.partyBattleId! },
    });
    assert.equal(huntSession.playfield, 'dungeon');
    assert.equal(huntSession.state, PARTY_BATTLE_SESSION_STATE.active);
    ok('hunt-continue after solo + join party uses PartyBattleSession');

    await cleanupCharacter(killer.characterId, killer.userId);
    await cleanupCharacter(mate.characterId, mate.userId);
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
  testDungeonRewardBoundaryPure();
  await testDungeonNearbyMateRewardIntegration();
  await testDungeonExitEndsParticipant();
  await testDungeonHudCanJoin();
  await testBattleSyncNearby();
  await testVictoryKeepsDungeonState();
  await testDungeonHuntContinuePartyBattle();
  await testDungeonHuntContinueSoloThenJoinParty();

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
