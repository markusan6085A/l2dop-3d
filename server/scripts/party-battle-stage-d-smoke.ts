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
import {
  MAP_NEARBY_HERO_RADIUS,
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
} from '../src/data/mapWorldSpawns.js';
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

const CANONICAL_SPAWN = MAP_WORLD_SPAWNS[0]!;
let passed = 0;
const partyTableQueries: string[] = [];

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function resetFlags(): void {
  delete process.env.PARTY_BATTLE_ENABLED;
  delete process.env.PARTY_BATTLE_REWARDS_ENABLED;
  delete process.env.PARTY_BATTLE_ALLOW_UNREWARDED_TESTS;
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
  assert.equal(MAP_NEARBY_LIST_RADIUS, BATTLE_RANGE);
  ok('map radii canonical (yellow=28000, red=12000)');

  assert.equal(isWithinMobBattleRange(
    { worldX: CANONICAL_SPAWN.worldX, worldY: CANONICAL_SPAWN.worldY },
    { worldX: CANONICAL_SPAWN.worldX + 27000, worldY: CANONICAL_SPAWN.worldY }
  ), true);
  assert.equal(isWithinMobBattleRange(
    { worldX: CANONICAL_SPAWN.worldX, worldY: CANONICAL_SPAWN.worldY },
    { worldX: CANONICAL_SPAWN.worldX + 29000, worldY: CANONICAL_SPAWN.worldY }
  ), false);
  ok('mob battle range boundary 28000');

  process.env.PARTY_BATTLE_ENABLED = 'true';
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

  await prisma.character.update({
    where: { id: leader.characterId },
    data: { worldX: CANONICAL_SPAWN.worldX, worldY: CANONICAL_SPAWN.worldY },
  });
  await prisma.character.update({
    where: { id: mate.characterId },
    data: {
      worldX: CANONICAL_SPAWN.worldX + 500,
      worldY: CANONICAL_SPAWN.worldY,
    },
  });

  const charL = await prisma.character.findUniqueOrThrow({ where: { id: leader.characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, leader.userId, CANONICAL_SPAWN.id, charL.revision, {
      characterId: leader.characterId,
    })
  );

  const hud = await getPartyHudForUser(mate.userId, mate.characterId);
  assert.ok(hud.activeBattle);
  assert.equal(hud.activeBattle!.spawnId, CANONICAL_SPAWN.id);
  assert.equal(typeof hud.activeBattle!.canJoin, 'boolean');
  ok('party HUD activeBattle DTO');

  resetFlags();
  trackPartyBattleQueries();
  await getPartyHudForUser(mate.userId, mate.characterId);
  assert.equal(partyTableQueries.length, 0);
  ok('flag off → HUD 0 party battle table queries');

  process.env.PARTY_BATTLE_ENABLED = 'true';
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

  await ackPartyRewardNoticeForUser(mate.userId, session!.id, mate.characterId);
  await ackPartyRewardNoticeForUser(mate.userId, session!.id, mate.characterId);
  const afterAck = await getUnreadPartyRewardNotice(mate.characterId);
  assert.equal(afterAck, null);
  ok('reward ack idempotent');

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
