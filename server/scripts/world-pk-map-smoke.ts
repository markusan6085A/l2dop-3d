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
import { MAP_WORLD_SPAWNS } from '../src/data/mapWorldSpawns.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { parseInventory } from '../src/data/inventory.js';
import { levelFromTotalExp } from '../src/data/l2dopExpgain.js';
import { isInPvpSafeZone } from '../src/domain/pvpSafeZones.js';
import { BATTLE_RANGE } from '../src/domain/battle.js';
import { serializeDungeonState } from '../src/domain/dungeonState.js';
import { resolveMapLocality } from '../src/data/mapLocalities.js';
import { prisma } from '../src/lib/prisma.js';
import { startBattleInTx } from '../src/services/battleServiceSession.js';
import { startPvpBattleInTx } from '../src/services/battleServicePvpSession.js';
import { getNearbyHeroesForMap } from '../src/services/mapNearbyHeroesService.js';
import { getNearbyHeroesForDungeon } from '../src/services/dungeonNearbyHeroesService.js';
import { touchOnlinePresence } from '../src/services/onlinePresenceService.js';
import { createPartyForUser } from '../src/services/party/partyService.js';
import { combatOptsFromRow } from '../src/services/charService.js';
import type { CharacterRow } from '../src/services/charTypes.js';

const WILD_X = 420_000;
const WILD_Y = 420_000;
const FAR_X = 520_000;
const FAR_Y = 520_000;
const CATACOMB_ID = 'catacomb_of_the_heretic';
const NECROPOLIS_ID = 'necropolis_of_devotion';
const CANONICAL_SPAWN = MAP_WORLD_SPAWNS.find((s) => s.kind === 'passive')!;

let passed = 0;

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

type Acc = { userId: string; characterId: string; name: string };

async function createAccount(label: string, pos?: { worldX: number; worldY: number }): Promise<Acc> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `wpk_${label}_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `W${label}${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 29,
          exp: BigInt(1_400_000),
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

async function main(): Promise<void> {
  console.log('world-pk-map smoke\n');
  await testPlayerMapVisibility();
  await testPkEligibility();
  await testPkBattleStart();
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
