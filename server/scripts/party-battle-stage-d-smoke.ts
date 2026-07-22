/**
 * Stage D: map radii, party HUD, battle members, reward notice ack.
 * npm run test:party-battle-stage-d
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
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
} from '../src/data/mapWorldSpawns.js';
import { findSevenSignsDungeonById } from '../src/data/sevenSignsDungeons.js';
import { SEVEN_SIGNS_DUNGEON_MOB_SPAWNS } from '../src/data/sevenSignsDungeonMobSpawns.generated.js';
import { serializeDungeonState } from '../src/domain/dungeonState.js';
import { BATTLE_RANGE } from '../src/domain/battleTypes.js';
import { getMapRadiiConfig } from '../src/domain/mapRadiiConfig.js';
import {
  isPartyBattleEngineEnabled,
  isPartyBattleRewardDistributionReady,
  isPartyBattleStageDUiEnabled,
} from '../src/domain/partyBattleFlags.js';
import { isWithinMobBattleRange } from '../src/domain/mapNearbyRadius.js';
import { isInPvpSafeZone } from '../src/domain/pvpSafeZones.js';
import { prisma } from '../src/lib/prisma.js';
import { getMapSyncForUser } from '../src/services/charMapStateService.js';
import { getNearbyHeroesForMap } from '../src/services/mapNearbyHeroesService.js';
import { getPartyHudForUser } from '../src/services/party/partyHudService.js';
import {
  ackPartyRewardNoticeForUser,
  getUnreadPartyRewardNotice,
} from '../src/services/party/partyRewardNoticeService.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { getBattleSyncForUser } from '../src/services/battleServiceSync.js';
import { touchOnlinePresence } from '../src/services/onlinePresenceService.js';
import { recordPartyKillRewardInTx } from '../src/services/party/partyBattleSessionService.js';
import { performPartyBattleLethalAttack } from './partyBattleSmokeLethalHelper.js';
import { spawnSync } from 'node:child_process';

const CANONICAL_SPAWN = MAP_WORLD_SPAWNS[0]!;
const DUNGEON_ID = 'necropolis_of_sacrifice';
const DUNGEON = findSevenSignsDungeonById(DUNGEON_ID)!;
const DUNGEON_MOB = SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
  (m) => m.kind !== 'raid'
)!;
const HUNT_MOB =
  SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[DUNGEON_ID]!.find(
    (m) => m.id === 'sdms_necropolis_of_sacrifice_037'
  ) ?? DUNGEON_MOB;
let passed = 0;
const partyTableQueries: string[] = [];

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

function dungeonStateAt(mapX: number, mapY: number) {
  return serializeDungeonState({
    v: 1,
    dungeonId: DUNGEON_ID,
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
  opts?: { preserveBattle?: boolean }
): Promise<void> {
  const data: Prisma.CharacterUpdateInput = {
    worldX: DUNGEON.worldX,
    worldY: DUNGEON.worldY,
    dungeonStateJson: dungeonStateAt(mapX, mapY),
  };
  if (!opts?.preserveBattle) {
    data.battleJson = Prisma.JsonNull;
  }
  await prisma.character.update({
    where: { id: characterId },
    data,
  });
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

async function createTestAccount(
  label: string,
  pos?: { worldX: number; worldY: number }
): Promise<{ userId: string; characterId: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const login = `pbd_${label}_${suffix}`;
  const name = `D${label}${suffix.slice(-4)}`.slice(0, 16);
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

async function addPartyMember(
  partyId: string,
  characterId: string,
  slotOrder: number
): Promise<void> {
  await prisma.partyMember.create({
    data: { partyId, characterId, slotOrder },
  });
}

async function main(): Promise<void> {
  console.log('party-battle-stage-d-smoke\n');

  resetFlags();
  const radii = getMapRadiiConfig();
  assert.equal(radii.mobInteractionRadius, BATTLE_RANGE);
  assert.equal(radii.playerVisibilityRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(radii.partyRewardRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(radii.pvpInteractionRadius, BATTLE_RANGE);
  assert.equal(MAP_NEARBY_LIST_RADIUS, BATTLE_RANGE);
  ok('map radii canonical (yellow=20000, red=12000)');

  assert.equal(isWithinMobBattleRange(
    { worldX: CANONICAL_SPAWN.worldX, worldY: CANONICAL_SPAWN.worldY },
    { worldX: CANONICAL_SPAWN.worldX + 19000, worldY: CANONICAL_SPAWN.worldY }
  ), true);
  assert.equal(isWithinMobBattleRange(
    { worldX: CANONICAL_SPAWN.worldX, worldY: CANONICAL_SPAWN.worldY },
    { worldX: CANONICAL_SPAWN.worldX + 21000, worldY: CANONICAL_SPAWN.worldY }
  ), false);
  ok('mob battle range boundary 20000');

  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_DUNGEON_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';
  assert.equal(isPartyBattleStageDUiEnabled(), true);

  const leader = await createTestAccount('L');
  const mate = await createTestAccount('M', {
    worldX: CANONICAL_SPAWN.worldX + 500,
    worldY: CANONICAL_SPAWN.worldY,
  });
  const partyRes = await createPartyForUser(leader.userId, leader.characterId);
  const partyId = partyRes.party!.id;
  await addPartyMember(partyId, mate.characterId, 1);
  await touchOnlinePresence(leader.userId);
  await touchOnlinePresence(mate.userId);

  const mapSync = await getMapSyncForUser(leader.userId);
  assert.ok(mapSync);
  assert.equal(mapSync!.mapRadii.mobInteractionRadius, BATTLE_RANGE);
  assert.equal(mapSync!.mapRadii.playerVisibilityRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(mapSync!.mapRadii.partyRewardRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(mapSync!.mapRadii.pvpInteractionRadius, BATTLE_RANGE);
  ok('GET map sync returns mapRadii DTO');

  assert.ok(mapSync!.around.partyNearbyMembers.some((m) => m.characterId === mate.characterId));
  ok('partyNearbyMembers list for «У локації з вами»');

  const wildX = 420000;
  const wildY = 420000;
  assert.equal(isInPvpSafeZone(wildX, wildY), false);
  await prisma.character.update({
    where: { id: leader.characterId },
    data: { worldX: wildX, worldY: wildY },
  });
  await prisma.character.update({
    where: { id: mate.characterId },
    data: { worldX: wildX + 800, worldY: wildY },
  });
  await touchOnlinePresence(leader.userId);
  await touchOnlinePresence(mate.userId);

  const heroesWild = await getNearbyHeroesForMap(
    wildX,
    wildY,
    leader.characterId,
    Date.now(),
    {
      memberIds: new Set([leader.characterId, mate.characterId]),
      leaderCharacterId: leader.characterId,
    }
  );
  const mateHero = heroesWild.find((h) => h.characterId === mate.characterId);
  assert.ok(mateHero);
  assert.equal(mateHero!.isPartyMember, true);
  assert.equal(mateHero!.isPartyLeader, false);
  ok('nearby hero DTO includes isPartyMember/isPartyLeader');

  await placeInDungeon(leader.characterId, DUNGEON_MOB.mapX, DUNGEON_MOB.mapY);
  await placeInDungeon(mate.characterId, DUNGEON_MOB.mapX + 10, DUNGEON_MOB.mapY);
  await touchOnlinePresence(leader.userId);
  await touchOnlinePresence(mate.userId);

  const charL = await prisma.character.findUniqueOrThrow({ where: { id: leader.characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, leader.userId, DUNGEON_MOB.id, charL.revision, {
      characterId: leader.characterId,
    })
  );

  const hud = await getPartyHudForUser(mate.userId, mate.characterId);
  assert.ok(hud.activeBattle);
  assert.equal(hud.activeBattle!.spawnId, DUNGEON_MOB.id);
  assert.equal(hud.activeBattle!.playfield, 'dungeon');
  assert.equal(hud.activeBattle!.dungeonId, DUNGEON_ID);
  assert.equal(typeof hud.activeBattle!.canJoin, 'boolean');
  ok('party HUD activeBattle DTO');

  resetFlags();
  trackPartyBattleQueries();
  await getPartyHudForUser(mate.userId, mate.characterId);
  assert.equal(partyTableQueries.length, 0);
  ok('flag off → HUD 0 party battle table queries');

  process.env.PARTY_BATTLE_ENABLED = 'true';
  process.env.PARTY_BATTLE_DUNGEON_ENABLED = 'true';
  process.env.PARTY_BATTLE_REWARDS_ENABLED = 'true';

  const session = await prisma.partyBattleSession.findFirst({
    where: { activePartyKey: partyId },
  });
  assert.ok(session);

  await prisma.$transaction(async (tx) => {
    await recordPartyKillRewardInTx(tx, {
      partyBattleId: session!.id,
      characterId: mate.characterId,
      expGain: 100,
      spGain: 10,
      adenaGain: 50n,
    });
  });

  const notice = await getUnreadPartyRewardNotice(mate.characterId);
  assert.ok(notice);
  assert.equal(notice!.expGain, 100);
  ok('rewardNotice unread in HUD read path');

  const mateBeforeHud = await prisma.character.findUniqueOrThrow({
    where: { id: mate.characterId },
  });
  await prisma.character.update({
    where: { id: mate.characterId },
    data: { revision: { increment: 1 } },
  });
  const hudReward = await getPartyHudForUser(mate.userId, mate.characterId);
  assert.ok(typeof hudReward.characterRevision === 'number');
  assert.ok(hudReward.characterRevision > mateBeforeHud.revision);
  assert.ok(hudReward.pendingPartyReward);
  assert.equal(hudReward.pendingPartyReward!.expGain, 100);
  assert.equal(hudReward.pendingPartyReward!.spGain, 10);
  assert.equal(String(hudReward.pendingPartyReward!.adenaGain), '50');
  ok('HUD characterRevision + pendingPartyReward for mate');

  await ackPartyRewardNoticeForUser(mate.userId, session!.id, mate.characterId);
  await ackPartyRewardNoticeForUser(mate.userId, session!.id, mate.characterId);
  const afterAck = await getUnreadPartyRewardNotice(mate.characterId);
  assert.equal(afterAck, null);
  const hudAfterAck = await getPartyHudForUser(mate.userId, mate.characterId);
  assert.equal(hudAfterAck.pendingPartyReward ?? null, null);
  ok('reward ack idempotent + pendingPartyReward cleared');

  const charL2 = await prisma.character.findUniqueOrThrow({ where: { id: leader.characterId } });
  const sync = await getBattleSyncForUser(leader.userId, {
    characterId: leader.characterId,
    battleVersion: 0,
  });
  assert.ok(sync?.partyBattle);
  assert.ok(Array.isArray(sync!.partyBattle!.members));
  assert.ok(sync!.partyBattle!.members!.every((m) => m.characterId !== leader.characterId));
  assert.ok(sync!.partyBattle!.members!.length <= 4);
  ok('battle sync members[] excludes viewer, max 4');

  console.log('\n[snapshot] killer lethal — mate passive revision signal');
  const killer2 = await createTestAccount('KL');
  const mate2 = await createTestAccount('ML');
  await createPartyForUser(killer2.userId, killer2.characterId);
  const party2 = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: killer2.characterId },
  });
  await addPartyMember(party2.partyId, mate2.characterId, 1);
  await placeInDungeon(killer2.characterId, HUNT_MOB.mapX, HUNT_MOB.mapY);
  await placeInDungeon(mate2.characterId, HUNT_MOB.mapX + 10, HUNT_MOB.mapY);
  await touchOnlinePresence(killer2.userId);
  await touchOnlinePresence(mate2.userId);

  const mate2Before = await prisma.character.findUniqueOrThrow({
    where: { id: mate2.characterId },
  });
  const hudMateBefore = await getPartyHudForUser(mate2.userId, mate2.characterId);
  assert.equal(hudMateBefore.characterRevision, mate2Before.revision);

  const charK2 = await prisma.character.findUniqueOrThrow({
    where: { id: killer2.characterId },
  });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, killer2.userId, HUNT_MOB.id, charK2.revision, {
      characterId: killer2.characterId,
    })
  );

  const { response: lethalResponse } = await performPartyBattleLethalAttack({
    userId: killer2.userId,
    characterId: killer2.characterId,
    battleSpawnId: HUNT_MOB.id,
  });
  assert.ok(lethalResponse?.partyReward);

  const mate2After = await prisma.character.findUniqueOrThrow({
    where: { id: mate2.characterId },
  });
  assert.ok(Number(mate2After.exp) > Number(mate2Before.exp));
  assert.ok(Number(mate2After.sp) > Number(mate2Before.sp));
  assert.ok(mate2After.revision > mate2Before.revision);
  const mateKillReward = await prisma.partyKillReward.findFirst({
    where: { characterId: mate2.characterId },
    orderBy: { createdAt: 'desc' },
  });
  assert.ok(mateKillReward);
  assert.ok(mateKillReward!.expGain > 0);
  assert.ok(mateKillReward!.spGain > 0);
  if (mateKillReward!.adenaGain > 0n) {
    assert.ok(Number(mate2After.adena) > Number(mate2Before.adena));
  }
  ok('mate gains exp/sp + revision without lethal action');

  const hudMateAfter = await getPartyHudForUser(mate2.userId, mate2.characterId);
  assert.ok(hudMateAfter.characterRevision > hudMateBefore.characterRevision);
  assert.ok(hudMateAfter.pendingPartyReward);
  assert.ok(hudMateAfter.pendingPartyReward!.expGain > 0);
  ok('mate HUD returns higher characterRevision + pendingPartyReward');

  await prisma.user.deleteMany({
    where: { id: { in: [killer2.userId, mate2.userId] } },
  });

  assert.ok(typeof hud.characterRevision === 'number');
  ok('HUD always returns characterRevision');

  console.log('\n[snapshot] expired invite filtered without HUD purge');
  const inviteTarget = await createTestAccount('IT');
  const inviteLeader = await createTestAccount('IL');
  await createPartyForUser(inviteLeader.userId, inviteLeader.characterId);
  const leaderParty = await prisma.partyMember.findUniqueOrThrow({
    where: { characterId: inviteLeader.characterId },
  });
  const expiredInvite = await prisma.partyInvite.create({
    data: {
      partyId: leaderParty.partyId,
      targetCharacterId: inviteTarget.characterId,
      inviterCharacterId: inviteLeader.characterId,
      expiresAt: new Date(Date.now() - 60_000),
    },
  });
  const hudExpired = await getPartyHudForUser(
    inviteTarget.userId,
    inviteTarget.characterId
  );
  assert.equal(hudExpired.invite, null);
  const stillThere = await prisma.partyInvite.findUnique({
    where: { id: expiredInvite.id },
  });
  assert.ok(stillThere);
  ok('expired invite not returned by HUD GET (no DELETE on read)');

  await prisma.user.deleteMany({
    where: { id: { in: [inviteTarget.userId, inviteLeader.userId] } },
  });

  const clientSmoke = spawnSync(
    process.execPath,
    ['server/scripts/party-hud-revision-client-smoke.mjs'],
    { cwd: path.join(__dirname, '../..'), stdio: 'pipe', encoding: 'utf8' }
  );
  if (clientSmoke.status !== 0) {
    throw new Error(
      clientSmoke.stderr || clientSmoke.stdout || 'party-hud-revision-client-smoke failed'
    );
  }
  ok('client revision comparison smoke');

  const pollingSmoke = spawnSync(
    process.execPath,
    ['server/scripts/party-hud-polling-client-smoke.mjs'],
    { cwd: path.join(__dirname, '../..'), stdio: 'pipe', encoding: 'utf8' }
  );
  if (pollingSmoke.status !== 0) {
    throw new Error(
      pollingSmoke.stderr || pollingSmoke.stdout || 'party-hud-polling-client-smoke failed'
    );
  }
  ok('client adaptive polling smoke');

  await prisma.user.deleteMany({
    where: { id: { in: [leader.userId, mate.userId] } },
  });

  resetFlags();
  console.log(`\n${passed} passed`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
