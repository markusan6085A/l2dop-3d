/**
 * World map player visibility + PK eligibility + PvP start smoke.
 * npm run test:world-pk-map
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { parseInventory } from '../src/data/inventory.js';
import {
  L2DOP_LEVEL_MIN_EXP,
  levelFromTotalExp,
} from '../src/data/l2dopExpgain.js';
import { isInPvpSafeZone } from '../src/domain/pvpSafeZones.js';
import { BATTLE_RANGE } from '../src/domain/battle.js';
import { serializeDungeonState } from '../src/domain/dungeonState.js';
import { resolveMapLocality, getTeleportDestination, nearestMapTown, getCityHubTeleportDestination } from '../src/data/mapLocalities.js';
import {
  canCharactersFightWorldPvp,
  MAX_WORLD_PVP_LEVEL_DIFFERENCE,
  WORLD_PVP_LEVEL_DIFF_BLOCKED_REASON_UK,
  resolveWorldPvpMapEligibility,
} from '../src/domain/worldPvpEligibility.js';
import { resolveCanonicalMapLocation } from '../src/domain/mapPlayfieldContext.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { performBattleActionInTx } from '../src/services/battleServicePerformBattleAction.js';
import { startPvpBattleInTx } from '../src/services/battleServicePvpSession.js';
import { getMapSyncForUser } from '../src/services/charMapStateService.js';
import { getNearbyHeroesForMap } from '../src/services/mapNearbyHeroesService.js';
import { performReturnToNearestTown } from '../src/services/charWorldMutations.js';
import { ackPvpPendingDefeatForUser } from '../src/services/pvpPendingDefeatAckService.js';
import { parsePvpPendingDefeat } from '../src/domain/pvpPendingDefeat.js';
import { getNearbyHeroesForDungeon } from '../src/services/dungeonNearbyHeroesService.js';
import {
  getOnlinePresenceSnapshot,
  setOnlinePresenceCachedLevelForSmoke,
  touchOnlinePresence,
} from '../src/services/onlinePresenceService.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import { combatOptsFromRow } from '../src/services/charService.js';
import type { CharacterRow } from '../src/services/charTypes.js';

const SMOKE_RUN_SLOT = Date.now() % 10000;
const WILD_X = 420_000 + SMOKE_RUN_SLOT * 10_000;
const WILD_Y = 420_000 + SMOKE_RUN_SLOT * 10_000;
const FAR_X = 520_000;
const FAR_Y = 520_000;
const CATACOMB_ID = 'catacomb_of_the_heretic';
const NECROPOLIS_ID = 'necropolis_of_devotion';
const NECROPOLIS_SACRIFICE_ID = 'necropolis_of_sacrifice';
const CANONICAL_SPAWN = MAP_WORLD_SPAWNS.find((s) => s.kind === 'passive')!;

let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; name: string };

let heroPairSlot = 0;

async function createAccount(label: string, pos?: { worldX: number; worldY: number }): Promise<Acc> {
  return createAccountAtLevel(label, 29, pos);
}

async function createAccountAtLevel(
  label: string,
  level: number,
  pos?: { worldX: number; worldY: number }
): Promise<Acc> {
  const lv = Math.max(1, Math.min(80, Math.floor(level)));
  const exp = L2DOP_LEVEL_MIN_EXP[lv - 1]!;
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const charName = `W${suffix.replace(/[^a-zA-Z0-9]/g, '')}`.slice(0, 16);
  const user = await prisma.user.create({
    data: {
      login: `wpk_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: charName,
          race: 'Human',
          classBranch: 'fighter',
          level: lv,
          exp,
          cityId: 'l2dop_giran',
          worldX: pos?.worldX ?? WILD_X,
          worldY: pos?.worldY ?? WILD_Y,
        },
      },
    },
    include: { characters: true },
  });
  const c = user.characters[0]!;
  return { userId: user.id, characterId: c.id, name: c.name };
}

async function placeOnline(acc: Acc, x: number, y: number): Promise<void> {
  await prisma.character.update({
    where: { id: acc.characterId },
    data: { worldX: x, worldY: y, battleJson: null },
  });
  await touchOnlinePresence(acc.userId);
}

function dungeonState(dungeonId: string, mapX = 400, mapY = 400) {
  return serializeDungeonState({
    v: 1,
    dungeonId,
    mapX,
    mapY,
    targetMapX: mapX,
    targetMapY: mapY,
    moveStartAt: null,
    moveFromMapX: mapX,
    moveFromMapY: mapY,
    pathPts: [],
  });
}

function findDifferentZonePairWithinBattleRange():
  | { ax: number; ay: number; bx: number; by: number }
  | null {
  const samples = MAP_WORLD_SPAWNS.filter(
    (s) => !isInPvpSafeZone(s.worldX, s.worldY)
  );
  for (let i = 0; i < samples.length; i++) {
    for (let j = i + 1; j < samples.length; j++) {
      const s1 = samples[i]!;
      const s2 = samples[j]!;
      const d = Math.hypot(s1.worldX - s2.worldX, s1.worldY - s2.worldY);
      if (d > BATTLE_RANGE) continue;
      const l1 = resolveMapLocality(s1.worldX, s1.worldY);
      const l2 = resolveMapLocality(s2.worldX, s2.worldY);
      if (l1.teleportId !== l2.teleportId) {
        return {
          ax: s1.worldX,
          ay: s1.worldY,
          bx: s2.worldX,
          by: s2.worldY,
        };
      }
    }
  }
  return null;
}

async function expectPvpStartError(
  attacker: Acc,
  targetId: string,
  code: string
): Promise<void> {
  const row = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await assert.rejects(
    () =>
      prisma.$transaction((tx) =>
        startPvpBattleInTx(tx, attacker.userId, targetId, row.revision)
      ),
    (e: unknown) => e instanceof Error && e.message === code
  );
}

async function expectPvpStartBlockedNoMutation(
  attacker: Acc,
  targetId: string,
  code: string
): Promise<void> {
  const [atkBefore, tgtBefore] = await Promise.all([
    prisma.character.findUniqueOrThrow({ where: { id: attacker.characterId } }),
    prisma.character.findUniqueOrThrow({ where: { id: targetId } }),
  ]);
  await expectPvpStartError(attacker, targetId, code);
  const [atkAfter, tgtAfter] = await Promise.all([
    prisma.character.findUniqueOrThrow({ where: { id: attacker.characterId } }),
    prisma.character.findUniqueOrThrow({ where: { id: targetId } }),
  ]);
  assert.equal(atkAfter.revision, atkBefore.revision);
  assert.equal(atkAfter.hp, atkBefore.hp);
  assert.equal(atkAfter.battleJson, atkBefore.battleJson);
  assert.equal(tgtAfter.revision, tgtBefore.revision);
  assert.equal(tgtAfter.hp, tgtBefore.hp);
  assert.equal(tgtAfter.battleJson, tgtBefore.battleJson);
}

async function heroesPairAtLevels(
  viewerLevel: number,
  targetLevel: number
): Promise<{ viewer: Acc; target: Acc; hero: Awaited<ReturnType<typeof getNearbyHeroesForMap>>[number] }> {
  heroPairSlot += 1;
  const baseX = WILD_X + heroPairSlot * 50_000;
  const baseY = WILD_Y + heroPairSlot * 50_000;
  const viewer = await createAccountAtLevel(`lv${viewerLevel}`, viewerLevel);
  const target = await createAccountAtLevel(`lv${targetLevel}`, targetLevel);
  await placeOnline(viewer, baseX, baseY);
  await placeOnline(target, baseX + 400, baseY);
  const heroes = await getNearbyHeroesForMap(baseX, baseY, viewer.characterId);
  const hero = heroes.find((h) => h.characterId === target.characterId);
  assert.ok(hero, `target level ${targetLevel} should be visible to level ${viewerLevel}`);
  return { viewer, target, hero: hero! };
}

function assertMapPlayerRowUiContract(): void {
  const mapJs = readFileSync(
    path.join(__dirname, '../public/map.js'),
    'utf8'
  );
  const renderJs = readFileSync(
    path.join(__dirname, '../public/mapHeroRowRender.js'),
    'utf8'
  );
  const dungeonJs = readFileSync(
    path.join(__dirname, '../public/dungeon.js'),
    'utf8'
  );
  assert.doesNotMatch(mapJs, /\[профіль\]/, 'map.js must not render separate [профіль] button');
  assert.doesNotMatch(dungeonJs, /\[профіль\]/, 'dungeon.js must not render separate [профіль] button');
  assert.match(mapJs, /L2MapHeroRowRender/, 'map.js uses shared mapHeroRowRender module');
  assert.match(renderJs, /renderHeroList/, 'mapHeroRowRender defines renderHeroList');
  assert.match(renderJs, /normalizeNearbyHeroes/, 'mapHeroRowRender normalizes sync heroes');
  assert.match(renderJs, /heroShowsPkButton/, 'mapHeroRowRender defines heroShowsPkButton');
  assert.match(renderJs, /\[PK\]/, 'mapHeroRowRender renders [PK] label');
  assert.match(mapJs, /normalizeSyncNearbyHeroes/, 'map.js normalizes nearbyHeroes from sync');
}

async function testWorldPkLevelRange(): Promise<void> {
  console.log('\n[world PK level range]');

  assert.equal(MAX_WORLD_PVP_LEVEL_DIFFERENCE, 20);
  assert.equal(canCharactersFightWorldPvp(52, 32), true);
  assert.equal(canCharactersFightWorldPvp(32, 52), true);
  assert.equal(canCharactersFightWorldPvp(52, 31), false);
  assert.equal(canCharactersFightWorldPvp(40, 20), true);
  assert.equal(canCharactersFightWorldPvp(40, 19), false);
  assert.equal(canCharactersFightWorldPvp(30, 50), true);
  assert.equal(canCharactersFightWorldPvp(30, 51), false);
  assert.equal(canCharactersFightWorldPvp(22, 10), true);
  assert.equal(canCharactersFightWorldPvp(22, 2), true);
  assert.equal(canCharactersFightWorldPvp(22, 1), false);
  ok('canCharactersFightWorldPvp boundary table');

  const allowed2210 = await heroesPairAtLevels(22, 10);
  assert.equal(allowed2210.hero.showPkButton, true);
  assert.equal(allowed2210.hero.profileOnNameClick, false);
  assert.equal(allowed2210.hero.pvpEligibilityCode, null);
  assert.equal(allowed2210.hero.activeBattle, false);
  assert.equal(allowed2210.hero.viewerLevelUsed, 22);
  assert.ok(allowed2210.hero.targetLocationKey.startsWith('world:'));
  ok('22 vs 10: showPkButton true, profileOnNameClick false');

  const allowed222 = await heroesPairAtLevels(22, 2);
  assert.equal(allowed222.hero.showPkButton, true);
  assert.equal(allowed222.hero.profileOnNameClick, false);
  ok('22 vs 2: allowed (diff 20)');

  const blocked221 = await heroesPairAtLevels(22, 1);
  assert.equal(blocked221.hero.showPkButton, false);
  assert.equal(blocked221.hero.pvpEligibilityCode, 'pvp_level_difference_too_high');
  assert.equal(blocked221.hero.profileOnNameClick, true);
  ok('22 vs 1: blocked (diff 21)');

  const blocked521 = await heroesPairAtLevels(52, 21);
  assert.equal(blocked521.hero.showPkButton, false);
  assert.equal(blocked521.hero.pvpEligibilityCode, 'pvp_level_difference_too_high');
  assert.equal(blocked521.hero.pvpBlockedReasonUk, WORLD_PVP_LEVEL_DIFF_BLOCKED_REASON_UK);
  assert.equal(blocked521.hero.profileOnNameClick, true);
  ok('52 vs 21: visible, no PK, profile via nick');

  const allowed5232 = await heroesPairAtLevels(52, 32);
  assert.equal(allowed5232.hero.showPkButton, true);
  assert.equal(allowed5232.hero.profileOnNameClick, false);
  ok('52 vs 32: showPkButton true, nick not profile link');

  const allowed3252 = await heroesPairAtLevels(32, 52);
  assert.equal(allowed3252.hero.showPkButton, true);
  assert.equal(allowed3252.hero.profileOnNameClick, false);
  ok('32 vs 52: allowed');

  const blocked5231 = await heroesPairAtLevels(52, 31);
  assert.equal(blocked5231.hero.showPkButton, false);
  assert.equal(blocked5231.hero.pvpEligibilityCode, 'pvp_level_difference_too_high');
  ok('52 vs 31: blocked');

  const exact20 = await heroesPairAtLevels(40, 20);
  assert.equal(exact20.hero.showPkButton, true);
  ok('level difference exactly 20: allowed');

  const diff21 = await heroesPairAtLevels(40, 19);
  assert.equal(diff21.hero.showPkButton, false);
  assert.equal(diff21.hero.pvpEligibilityCode, 'pvp_level_difference_too_high');
  ok('level difference 21: blocked');

  await expectPvpStartBlockedNoMutation(
    diff21.viewer,
    diff21.target.characterId,
    'pvp_level_difference_too_high'
  );
  ok('direct POST with level diff 21 blocked without mutation');

  const partyViewer = await createAccountAtLevel('pLv', 52);
  const partyMate = await createAccountAtLevel('pMt', 40);
  await placeOnline(partyViewer, WILD_X, WILD_Y);
  await placeOnline(partyMate, WILD_X + 400, WILD_Y);
  await createPartyForUser(partyViewer.userId, partyViewer.characterId);
  const partyId = (
    await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: partyViewer.characterId },
    })
  ).partyId;
  await prisma.partyMember.create({
    data: { partyId, characterId: partyMate.characterId, slotOrder: 1 },
  });
  const partyHeroes = await getNearbyHeroesForMap(
    WILD_X,
    WILD_Y,
    partyViewer.characterId,
    Date.now(),
    {
      memberIds: new Set([partyViewer.characterId, partyMate.characterId]),
      leaderCharacterId: partyViewer.characterId,
    }
  );
  const partyHero = partyHeroes.find((h) => h.characterId === partyMate.characterId);
  assert.ok(partyHero);
  assert.equal(partyHero!.showPkButton, false);
  assert.equal(partyHero!.profileOnNameClick, true);
  ok('party member: no PK, profile via nick');

  await prisma.character.update({
    where: { id: partyViewer.characterId },
    data: { dungeonStateJson: dungeonState(CATACOMB_ID) },
  });
  await prisma.character.update({
    where: { id: partyMate.characterId },
    data: {
      dungeonStateJson: dungeonState(CATACOMB_ID),
      worldX: WILD_X + 400,
      worldY: WILD_Y,
    },
  });
  await touchOnlinePresence(partyViewer.userId);
  await touchOnlinePresence(partyMate.userId);
  const catHeroes = await getNearbyHeroesForDungeon(
    CATACOMB_ID,
    400,
    400,
    partyViewer.characterId
  );
  const foreignCat = catHeroes.find((h) => h.characterId === partyMate.characterId);
  assert.ok(foreignCat);
  assert.equal(foreignCat!.showPkButton, false);
  assert.equal(foreignCat!.profileOnNameClick, true);
  ok('forbidden zone: no PK, profile via nick');

  assertMapPlayerRowUiContract();
  ok('nearby-player row has no separate [профіль] button in map/dungeon JS');
}

async function testCanonicalLevelIgnoresStalePresence(): Promise<void> {
  console.log('\n[canonical level vs stale presence]');

  heroPairSlot += 1;
  const baseX = WILD_X + heroPairSlot * 50_000;
  const baseY = WILD_Y + heroPairSlot * 50_000;

  const viewer = await createAccountAtLevel('staleV', 22);
  const target = await createAccountAtLevel('staleT', 10);

  await prisma.character.update({
    where: { id: target.characterId },
    data: { level: 7 },
  });

  await placeOnline(viewer, baseX, baseY);
  await placeOnline(target, baseX + 400, baseY);

  assert.equal(
    setOnlinePresenceCachedLevelForSmoke(target.characterId, 7),
    true,
    'presence cache should contain target before stale inject'
  );

  const snapshot = await getOnlinePresenceSnapshot('level');
  const onlinePlayer = snapshot.players.find((p) => p.characterId === target.characterId);
  assert.ok(onlinePlayer, 'target should appear in /online snapshot');
  assert.equal(
    onlinePlayer!.level,
    10,
    '/online must use canonical exp level, not stale presence cache'
  );

  const heroes = await getNearbyHeroesForMap(baseX, baseY, viewer.characterId);
  const hero = heroes.find((h) => h.characterId === target.characterId);
  assert.ok(hero, 'target should appear in nearbyHeroes');
  assert.equal(hero!.level, 10, 'nearbyHeroes must expose canonical target level');
  assert.equal(hero!.viewerLevelUsed, 22);
  assert.equal(hero!.showPkButton, true, '22 vs 10 must allow PK with canonical levels');
  assert.equal(hero!.pvpEligibilityCode, null);

  ok('stale presence level 7 ignored; canonical level 10 for /online, nearbyHeroes, PK');
}

async function testMapSyncPayloadPkFields(): Promise<void> {
  console.log('\n[map sync payload PK fields]');

  heroPairSlot += 1;
  const baseX = WILD_X + heroPairSlot * 50_000;
  const baseY = WILD_Y + heroPairSlot * 50_000;

  const viewer = await createAccountAtLevel('syncV', 22);
  const target = await createAccountAtLevel('syncT', 10);
  await placeOnline(viewer, baseX, baseY);
  await placeOnline(target, baseX + 400, baseY);

  const sync = await getMapSyncForUser(viewer.userId);
  assert.ok(sync, 'getMapSyncForUser must return payload');
  const hero = sync!.around.nearbyHeroes.find((h) => h.characterId === target.characterId);
  assert.ok(hero, 'KofOnline-equivalent target must appear in /game/map/sync nearbyHeroes');

  assert.equal(hero!.name, target.name);
  assert.equal(hero!.level, 10);
  assert.equal(hero!.showPkButton, true);
  assert.equal(hero!.profileOnNameClick, false);
  assert.equal(hero!.pvpEligibilityCode, null);
  assert.equal(hero!.pvpBlockedReasonUk, null);
  assert.equal(hero!.pvpAllowed, true);
  assert.equal(hero!.activeBattle, false);
  assert.equal(hero!.viewerLevelUsed, 22);
  assert.ok(hero!.targetLocationKey.startsWith('world:'));
  assert.equal(hero!.isPartyMember, false);

  ok('map sync nearbyHeroes: showPkButton true for 22 vs 10 (production path)');
}

async function testWorldPvpZoneClassification(): Promise<void> {
  console.log('\n[world PvP zone classification]');

  const fod = getTeleportDestination('forest_of_the_dead');
  assert.ok(fod, 'forest_of_the_dead teleport must exist');
  const fodLoc = resolveCanonicalMapLocation({
    worldX: fod!.worldX,
    worldY: fod!.worldY,
  });
  assert.equal(fodLoc.key, 'world:forest_of_the_dead');
  assert.equal(fodLoc.pvpAllowed, true);
  assert.equal(isInPvpSafeZone(fod!.worldX, fod!.worldY), false);
  ok('world:forest_of_the_dead → pvpAllowed true');

  const ti = getTeleportDestination('talking_island');
  assert.ok(ti, 'talking_island teleport must exist');
  const tiLoc = resolveCanonicalMapLocation({
    worldX: ti!.worldX,
    worldY: ti!.worldY,
  });
  assert.equal(tiLoc.key, 'world:talking_island');
  assert.equal(tiLoc.pvpAllowed, true);
  ok('world:talking_island → pvpAllowed true');

  const catLoc = resolveCanonicalMapLocation({
    worldX: WILD_X,
    worldY: WILD_Y,
    dungeonStateJson: dungeonState(CATACOMB_ID),
  });
  assert.equal(catLoc.key, `dungeon:${CATACOMB_ID}`);
  assert.equal(catLoc.encounterType, 'catacomb');
  assert.equal(catLoc.pvpAllowed, false);
  ok('catacomb_of_the_heretic → pvpAllowed false');

  const necLoc = resolveCanonicalMapLocation({
    worldX: WILD_X,
    worldY: WILD_Y,
    dungeonStateJson: dungeonState(NECROPOLIS_SACRIFICE_ID),
  });
  assert.equal(necLoc.key, `dungeon:${NECROPOLIS_SACRIFICE_ID}`);
  assert.equal(necLoc.encounterType, 'necropolis');
  assert.equal(necLoc.pvpAllowed, false);
  ok('necropolis_of_sacrifice → pvpAllowed false');

  const partyLoc = resolveCanonicalMapLocation({
    worldX: WILD_X,
    worldY: WILD_Y,
    dungeonStateJson: dungeonState('party_dungeon_instance'),
  });
  assert.equal(partyLoc.encounterType, 'party_dungeon');
  assert.equal(partyLoc.pvpAllowed, false);
  ok('party dungeon instance → pvpAllowed false');

  const fodEligibility = resolveWorldPvpMapEligibility({
    viewerLocation: fodLoc,
    targetLocation: fodLoc,
    viewerLevel: 22,
    targetLevel: 10,
    targetIsPartyMember: false,
    inBattleRange: true,
    targetOnline: true,
    targetCanPkAttack: true,
  });
  assert.equal(fodEligibility.showPkButton, true);
  assert.equal(fodEligibility.profileOnNameClick, false);
  assert.equal(fodEligibility.pvpEligibilityCode, null);
  ok('forest_of_the_dead eligibility: showPkButton true for 22 vs 10');

  heroPairSlot += 1;
  const viewer = await createAccountAtLevel('fodV', 22, {
    worldX: fod!.worldX,
    worldY: fod!.worldY,
  });
  const target = await createAccountAtLevel('fodT', 10, {
    worldX: fod!.worldX + 400,
    worldY: fod!.worldY,
  });
  await placeOnline(viewer, fod!.worldX, fod!.worldY);
  await placeOnline(target, fod!.worldX + 400, fod!.worldY);

  const heroes = await getNearbyHeroesForMap(
    fod!.worldX,
    fod!.worldY,
    viewer.characterId
  );
  const hero = heroes.find((h) => h.characterId === target.characterId);
  assert.ok(hero, 'target in forest_of_the_dead must be visible');
  assert.equal(hero!.level, 10);
  assert.equal(hero!.pvpAllowed, true);
  assert.equal(hero!.showPkButton, true);
  assert.equal(hero!.profileOnNameClick, false);
  assert.equal(hero!.pvpEligibilityCode, null);
  assert.equal(hero!.targetLocationKey, 'world:forest_of_the_dead');
  ok('forest_of_the_dead nearbyHeroes: pvpAllowed true, showPkButton true');
}

async function testPlayerMapVisibility(): Promise<void> {
  console.log('\n[player map visibility]');

  const a = await createAccount('visA');
  const b = await createAccount('visB');
  await placeOnline(a, WILD_X, WILD_Y);
  await placeOnline(b, WILD_X + 800, WILD_Y);

  const heroes = await getNearbyHeroesForMap(WILD_X, WILD_Y, a.characterId);
  assert.ok(heroes.some((h) => h.characterId === b.characterId));
  ok('two players in same world location see each other');

  await prisma.character.update({
    where: { id: b.characterId },
    data: { worldX: FAR_X, worldY: FAR_Y },
  });
  await touchOnlinePresence(b.userId);
  const heroesFar = await getNearbyHeroesForMap(WILD_X, WILD_Y, a.characterId);
  assert.ok(!heroesFar.some((h) => h.characterId === b.characterId));
  ok('players in different locations do not see each other');

  await placeOnline(b, WILD_X + 500, WILD_Y);
  await prisma.character.update({
    where: { id: b.characterId },
    data: { dungeonStateJson: dungeonState(CATACOMB_ID) },
  });
  const heroesDungeon = await getNearbyHeroesForMap(WILD_X, WILD_Y, a.characterId);
  assert.ok(!heroesDungeon.some((h) => h.characterId === b.characterId));
  ok('world viewer does not see dungeon playfield player');
}

async function testPkEligibility(): Promise<void> {
  console.log('\n[PK eligibility]');

  const a = await createAccount('pkA');
  const b = await createAccount('pkB');
  await placeOnline(a, WILD_X, WILD_Y);
  await placeOnline(b, WILD_X + 500, WILD_Y);

  const heroes = await getNearbyHeroesForMap(WILD_X, WILD_Y, a.characterId);
  const target = heroes.find((h) => h.characterId === b.characterId);
  assert.ok(target);
  assert.equal(target!.showPkButton, true);
  assert.equal(target!.profileOnNameClick, false);
  ok('PK button available for foreign player in PvP zone');

  await createPartyForUser(a.userId, a.characterId);
  await prisma.partyMember.create({
    data: {
      partyId: (
        await prisma.partyMember.findUniqueOrThrow({
          where: { characterId: a.characterId },
        })
      ).partyId,
      characterId: b.characterId,
      slotOrder: 1,
    },
  });

  const partyHeroes = await getNearbyHeroesForMap(WILD_X, WILD_Y, a.characterId, Date.now(), {
    memberIds: new Set([a.characterId, b.characterId]),
    leaderCharacterId: a.characterId,
  });
  const mate = partyHeroes.find((h) => h.characterId === b.characterId);
  assert.ok(mate);
  assert.equal(mate!.showPkButton, false);
  assert.equal(mate!.profileOnNameClick, true);
  assert.equal(mate!.isPartyMember, true);
  ok('no PK button for party member');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: dungeonState(CATACOMB_ID) },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: {
      dungeonStateJson: dungeonState(CATACOMB_ID),
      worldX: WILD_X,
      worldY: WILD_Y,
    },
  });
  await touchOnlinePresence(a.userId);
  await touchOnlinePresence(b.userId);

  const catHeroes = await getNearbyHeroesForDungeon(
    CATACOMB_ID,
    400,
    400,
    a.characterId
  );
  const catTarget = catHeroes.find((h) => h.characterId === b.characterId);
  assert.ok(catTarget);
  assert.equal(catTarget!.showPkButton, false);
  ok('no PK in Catacomb');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: dungeonState(NECROPOLIS_ID) },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { dungeonStateJson: dungeonState(NECROPOLIS_ID) },
  });
  const necHeroes = await getNearbyHeroesForDungeon(
    NECROPOLIS_ID,
    400,
    400,
    a.characterId
  );
  const necTarget = necHeroes.find((h) => h.characterId === b.characterId);
  assert.ok(necTarget);
  assert.equal(necTarget!.showPkButton, false);
  ok('no PK in Necropolis');
}

async function testPkBattleStart(): Promise<void> {
  console.log('\n[PK battle start]');

  const a = await createAccount('startA');
  const b = await createAccount('startB');
  await placeOnline(a, WILD_X, WILD_Y);
  await placeOnline(b, WILD_X + 400, WILD_Y);

  await expectPvpStartError(a, a.characterId, 'pvp_self');
  ok('cannot attack self');

  const rowA = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  const started = await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, a.userId, b.characterId, rowA.revision)
  );
  assert.equal(started.battle.battleMode, 'pvp');
  assert.ok(started.battle.mobMaxHp > 0);
  ok('world PK start succeeds in open zone');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { battleJson: null },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { battleJson: null },
  });

  await placeOnline(b, WILD_X + 400, WILD_Y);
  await prisma.character.update({
    where: { id: b.characterId },
    data: { dungeonStateJson: dungeonState(CATACOMB_ID) },
  });
  await touchOnlinePresence(b.userId);
  const rowA2b = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await expectPvpStartError(a, b.characterId, 'pvp_forbidden_zone');
  ok('direct POST blocked when target is in Catacomb');

  const zonePair = findDifferentZonePairWithinBattleRange();
  assert.ok(zonePair, 'fixture: need two world coords in range with different teleportId');
  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: null, worldX: zonePair!.ax, worldY: zonePair!.ay },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { dungeonStateJson: null, worldX: zonePair!.bx, worldY: zonePair!.by },
  });
  await touchOnlinePresence(a.userId);
  await touchOnlinePresence(b.userId);
  const rowA2 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await expectPvpStartError(a, b.characterId, 'pvp_location_mismatch');
  ok('cannot attack player in another location');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: null, worldX: WILD_X, worldY: WILD_Y },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { dungeonStateJson: null, worldX: WILD_X + 400, worldY: WILD_Y },
  });
  await touchOnlinePresence(a.userId);
  await touchOnlinePresence(b.userId);

  await createPartyForUser(a.userId, a.characterId);
  const partyId = (
    await prisma.partyMember.findUniqueOrThrow({
      where: { characterId: a.characterId },
    })
  ).partyId;
  await prisma.partyMember.create({
    data: { partyId, characterId: b.characterId, slotOrder: 1 },
  });
  const rowA4 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await expectPvpStartError(a, b.characterId, 'pvp_party_member');
  ok('cannot attack party member');

  await prisma.partyMember.deleteMany({ where: { partyId } });
  await prisma.party.delete({ where: { id: partyId } });

  await placeOnline(a, CANONICAL_SPAWN.worldX, CANONICAL_SPAWN.worldY);
  await placeOnline(b, CANONICAL_SPAWN.worldX + 400, CANONICAL_SPAWN.worldY);

  const mobRow = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await prisma.$transaction((tx) =>
    startBattleInTx(tx, a.userId, CANONICAL_SPAWN.id, mobRow.revision, {
      characterId: a.characterId,
    })
  );
  await expectPvpStartError(a, b.characterId, 'already_in_battle');
  ok('world mob battle blocks PK start');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { battleJson: null },
  });

  await placeOnline(a, WILD_X, WILD_Y);
  await placeOnline(b, WILD_X + 400, WILD_Y);

  const buffRow = await prisma.character.update({
    where: { id: b.characterId },
    data: {
      activeBuffsJson: [{ skillId: 1068, expiresAtMs: Date.now() + 600_000 }],
    },
    include: { clan: { select: { emblemId: true } } },
  });
  const effLv = levelFromTotalExp(buffRow.exp);
  const inv = parseInventory(buffRow.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    buffRow.race,
    buffRow.classBranch,
    inv,
    combatOptsFromRow(buffRow as CharacterRow)
  );
  assert.ok(combat.pAtk > 0);

  const rowA5 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  const pvpWithBuffs = await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, a.userId, b.characterId, rowA5.revision)
  );
  assert.equal(pvpWithBuffs.battle.battleMode, 'pvp');
  assert.ok(pvpWithBuffs.battle.mobMaxHp > 0);
  ok('PvP uses canonical combat pipeline for opponent stats');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { battleJson: null, dungeonStateJson: null, worldX: WILD_X, worldY: WILD_Y },
  });
  await prisma.character.update({
    where: { id: b.characterId },
    data: { battleJson: null, worldX: WILD_X + 400, worldY: WILD_Y },
  });
  await touchOnlinePresence(a.userId);
  await touchOnlinePresence(b.userId);

  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: dungeonState(CATACOMB_ID) },
  });
  const rowA6 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await expectPvpStartError(a, b.characterId, 'pvp_forbidden_zone');
  ok('direct POST blocked in Catacomb');

  await prisma.character.update({
    where: { id: a.characterId },
    data: { dungeonStateJson: null, worldX: WILD_X, worldY: WILD_Y },
  });

  const farLoc = resolveMapLocality(FAR_X, FAR_Y);
  const wildLoc = resolveMapLocality(WILD_X, WILD_Y);
  if (farLoc.teleportId !== wildLoc.teleportId) {
    await placeOnline(b, FAR_X, FAR_Y);
    const rowA7 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
    await expectPvpStartError(a, b.characterId, 'pvp_location_mismatch');
    ok('POST blocked across canonical zones');
  } else {
    ok('POST blocked across canonical zones (skipped — same teleport anchor in fixture)');
  }

  const distBlocked = BATTLE_RANGE + 5000;
  await placeOnline(b, WILD_X + distBlocked, WILD_Y);
  const rowA8 = await prisma.character.findUniqueOrThrow({ where: { id: a.characterId } });
  await expectPvpStartError(a, b.characterId, 'pvp_too_far');
  ok('cannot attack out of battle range');
}

async function testWorldPkDeathRespawnFlow(): Promise<void> {
  console.log('\n[world PK death respawn]');

  const fod = getTeleportDestination('forest_of_the_dead');
  assert.ok(fod, 'forest_of_the_dead teleport must exist');
  const ax = Math.floor(fod.worldX) + 1200;
  const ay = Math.floor(fod.worldY) + 900;

  const attacker = await createAccountAtLevel('pkA', 22);
  const victim = await createAccountAtLevel('pkV', 10);
  await placeOnline(attacker, ax, ay);
  await placeOnline(victim, ax + 400, ay);

  await prisma.character.update({
    where: { id: victim.characterId },
    data: { hp: 1 },
  });

  const atk0 = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  await prisma.$transaction((tx) =>
    startPvpBattleInTx(tx, attacker.userId, victim.characterId, atk0.revision)
  );

  let atkRow = await prisma.character.findUniqueOrThrow({
    where: { id: attacker.characterId },
  });
  let res = await prisma.$transaction((tx) =>
    performBattleActionInTx(tx, attacker.userId, 'attack', atkRow.revision, {
      characterId: attacker.characterId,
    })
  );
  for (let attempt = 0; attempt < 16 && (!res.victory || res.kind !== 'full'); attempt++) {
    await new Promise((r) => setTimeout(r, 400));
    atkRow = await prisma.character.findUniqueOrThrow({
      where: { id: attacker.characterId },
    });
    if (!atkRow.battleJson) break;
    res = await prisma.$transaction((tx) =>
      performBattleActionInTx(tx, attacker.userId, 'attack', atkRow.revision, {
        characterId: attacker.characterId,
      })
    );
  }
  assert.equal(res.kind, 'full');
  assert.ok(res.victory, 'attacker must win world PK');

  const victimRow = await prisma.character.findUniqueOrThrow({
    where: { id: victim.characterId },
  });
  assert.equal(victimRow.battleJson, null);
  const pending = parsePvpPendingDefeat(victimRow.pvpPendingDefeatJson);
  assert.ok(pending, 'victim must have pending world PK defeat');
  assert.equal(pending!.scope, 'world');
  ok('victim marked dead/defeated after world PK kill');

  const heroesAfterKill = await getNearbyHeroesForMap(
    ax,
    ay,
    attacker.characterId
  );
  assert.ok(
    !heroesAfterKill.some((h) => h.characterId === victim.characterId),
    'defeated victim must not appear in nearbyHeroes'
  );
  ok('victim absent from attacker nearbyHeroes while pending defeat');

  await expectPvpStartBlockedNoMutation(
    attacker,
    victim.characterId,
    'pvp_target_dead'
  );
  ok('repeat PK start blocked for defeated target');

  assert.ok(pending!.deathEventId);
  await ackPvpPendingDefeatForUser(
    victim.userId,
    pending!.deathEventId,
    victim.characterId
  );
  const victimAfterAck = await prisma.character.findUniqueOrThrow({
    where: { id: victim.characterId },
  });
  assert.ok(
    parsePvpPendingDefeat(victimAfterAck.pvpPendingDefeatJson),
    'ack must not clear pending before return-to-town'
  );
  ok('pvp defeat ack leaves pending until respawn');

  const victimBeforeRespawn = await prisma.character.findUniqueOrThrow({
    where: { id: victim.characterId },
  });
  const respawnSnap = await performReturnToNearestTown(
    victim.userId,
    victimBeforeRespawn.revision
  );
  assert.equal(respawnSnap.pvpDefeat, null);
  assert.ok(respawnSnap.worldX != null && respawnSnap.worldY != null);

  const victimAfterRespawn = await prisma.character.findUniqueOrThrow({
    where: { id: victim.characterId },
  });
  assert.equal(victimAfterRespawn.pvpPendingDefeatJson, null);
  const near = nearestMapTown(ax, ay);
  const hub =
    getCityHubTeleportDestination(near.cityId) ??
    getTeleportDestination(near.teleportId);
  assert.ok(hub);
  assert.equal(victimAfterRespawn.worldX, Math.floor(hub!.worldX));
  assert.equal(victimAfterRespawn.worldY, Math.floor(hub!.worldY));
  assert.equal(victimAfterRespawn.cityId, hub!.cityId);
  ok('return-to-town sets canonical city hub and clears pending');

  const presence = await getOnlinePresenceSnapshot('name');
  const onlineVictim = presence.players.find(
    (p) => p.characterId === victim.characterId
  );
  assert.ok(onlineVictim, 'victim must remain online after respawn');
  assert.equal(onlineVictim!.cityId, hub!.cityId);
  ok('presence reflects city location immediately after respawn');

  const heroesAfterRespawn = await getNearbyHeroesForMap(
    ax,
    ay,
    attacker.characterId
  );
  assert.ok(
    !heroesAfterRespawn.some((h) => h.characterId === victim.characterId),
    'respawned victim must not appear on old map sync'
  );
  ok('attacker nearbyHeroes still excludes respawned victim');

  const syncAttacker = await getMapSyncForUser(attacker.userId);
  assert.ok(syncAttacker);
  assert.ok(
    !syncAttacker!.around.nearbyHeroes.some(
      (h) => h.characterId === victim.characterId
    )
  );
  ok('attacker /game/map/sync excludes respawned victim');

  await expectPvpStartBlockedNoMutation(
    attacker,
    victim.characterId,
    'pvp_location_mismatch'
  );
  ok('repeat POST attack on respawned victim blocked (location mismatch)');

  await prisma.user.deleteMany({
    where: { id: { in: [attacker.userId, victim.userId] } },
  });
}

async function main(): Promise<void> {
  console.log('world-pk-map smoke\n');
  await testPlayerMapVisibility();
  await testWorldPkLevelRange();
  await testCanonicalLevelIgnoresStalePresence();
  await testMapSyncPayloadPkFields();
  await testWorldPvpZoneClassification();
  await testPkEligibility();
  await testPkBattleStart();
  await testWorldPkDeathRespawnFlow();
  console.log('\n' + passed + ' passed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
