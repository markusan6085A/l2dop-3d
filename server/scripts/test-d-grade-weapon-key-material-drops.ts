/**
 * D-grade weapon key material live drop/spoil + RB drop (етап 3D.2).
 * npm run test:d-grade-weapon-key-material-drops
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import {
  addItemToBag,
  countBagQty,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID,
  D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS,
} from '../src/data/dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES,
  D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES,
} from '../src/data/dGradeWeaponKeyMaterialMobDropCatalog.js';
import {
  findDGradeWeaponKeyMaterialSource,
  listDGradeWeaponKeyMaterialSourcesForNpc,
  mergeDGradeWeaponKeyMaterialDropOverlay,
} from '../src/data/dGradeWeaponKeyMaterialMobDrops.js';
import {
  RB_LV20_25_EXP_ONLY_NPC_ID,
  findDGradeWeaponKeyMaterialRaidSource,
} from '../src/data/dGradeWeaponKeyMaterialRaidDrops.js';
import {
  D_GRADE_WEAPON_RECIPE_MOB_SOURCES,
} from '../src/data/dGradeWeaponRecipeMobDropCatalog.js';
import { customNpcDropBagForMob } from '../src/data/l2dopRaidBossDropPatches.js';
import {
  RB_LV20_25_BOSSES,
  raidBossLv20_25SpecForNpcId,
} from '../src/data/l2dopRaidBossLv20_25Catalog.js';
import { MOBS_BY_CITY } from '../src/data/mapTeleportMobPools.js';
import { TELEPORT_POOL_OVERRIDES } from '../src/data/mapTeleportPoolOverrides.js';
import { resolveL2dopNpcIdByMobName } from '../src/data/l2dopNpcResolve.js';
import { L2DOP_NPC_LEVEL } from '../src/data/l2dopNpcMeta.generated.js';
import { ensureMobDropBag } from '../src/domain/spawnSyntheticRewards.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import type { DropEntry } from '../src/types/combatDrop.js';
import { getWorldSpawnById } from '../src/data/mapWorldSpawns.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const DWARF_SPOILER_CTX = {
  race: 'dwarf',
  l2Profession: 'dwarf_bounty_hunter',
  skillsLearnedJson: [{ id: 'l2_254', level: 1 }],
} as const;

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function findDrop(
  drops: DropEntry[],
  itemId: number,
): DropEntry | undefined {
  return drops.find((d) => d.l2ItemId === itemId);
}

function rollDropQty(entry: DropEntry, random: number): number {
  const p =
    entry.chancePerMillion != null
      ? entry.chancePerMillion / 1_000_000
      : entry.chance;
  if (!Number.isFinite(p) || p <= 0 || random >= p) return 0;
  return entry.min === entry.max
    ? entry.min
    : entry.min + Math.floor((entry.max - entry.min + 1) * 0);
}

function rollDropQtyWithRollInt(entry: DropEntry, random: number): number {
  const p =
    entry.chancePerMillion != null
      ? entry.chancePerMillion / 1_000_000
      : entry.chance;
  if (!Number.isFinite(p) || p <= 0 || random >= p) return 0;
  return entry.min;
}

function collectLiveSpawnNpcIds(): Set<number> {
  const ids = new Set<number>();
  const allPools = [
    ...Object.values(MOBS_BY_CITY).flat(),
    ...Object.values(TELEPORT_POOL_OVERRIDES).flat(),
  ];
  for (const mob of allPools) {
    const id = resolveL2dopNpcIdByMobName(mob.name);
    if (id != null) ids.add(id);
  }
  return ids;
}

// 1. All 8 itemIds exist
for (const itemId of D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS) {
  assert.ok(D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.has(itemId), `item ${itemId}`);
}
assert.equal(D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS.length, 8);
ok('all 8 key material itemIds exist');

// 2–3. Each item has normal drop + spoil
for (const itemId of D_GRADE_WEAPON_KEY_MATERIAL_ITEM_IDS) {
  const normal = D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.filter(
    (s) => s.itemId === itemId && s.sourceType === 'normal_drop',
  );
  const spoil = D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.filter(
    (s) => s.itemId === itemId && s.sourceType === 'spoil',
  );
  assert.equal(normal.length, 1, `normal drop for ${itemId}`);
  assert.equal(spoil.length, 1, `spoil for ${itemId}`);
}
ok('each item has normal drop and spoil source');

// 4–6. Chances and qty for field mobs
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  if (source.sourceType === 'normal_drop') {
    assert.equal(source.chance, 0.01);
  } else {
    assert.equal(source.chance, 0.08);
  }
  assert.equal(source.minCount, 1);
  assert.equal(source.maxCount, 1);
}
ok('field mob chances 0.01/0.08, qty = 1');

// 7. All mobs exist in npc meta
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  assert.ok(L2DOP_NPC_LEVEL[source.npcId], `npc ${source.npcId} in meta`);
}
ok('all field mobs exist in npc meta');

// 8. All mobs have live spawn in teleport pools
const liveNpcIds = collectLiveSpawnNpcIds();
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  assert.ok(
    liveNpcIds.has(source.npcId),
    `${source.mobNameEn} (${source.npcId}) missing from live teleport pools`,
  );
}
ok('all field mobs have live spawn in teleport pools');

// 16. No duplicate sourceId + itemId + sourceType
const mobKeys = new Set<string>();
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  const key = `${source.npcId}:${source.itemId}:${source.sourceType}`;
  assert.ok(!mobKeys.has(key), `duplicate ${key}`);
  mobKeys.add(key);
}
ok('no duplicate mob sourceId+itemId+sourceType');

// Overlay wired in ensureMobDropBag
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  const bag = ensureMobDropBag(source.npcId, source.level);
  const pool = source.sourceType === 'normal_drop' ? bag.drops : bag.spoil;
  const entry = findDrop(pool, source.itemId);
  assert.ok(entry, `${source.npcId} ${source.sourceType} ${source.itemId}`);
  assert.equal(entry!.chance, source.chance);
  assert.equal(entry!.min, 1);
  assert.equal(entry!.max, 1);
}
ok('overlay present in ensureMobDropBag');

// 9–10. Controlled normal drop roll
const bonebreakerDrop = findDrop(
  ensureMobDropBag(20269, 34).drops,
  4113,
)!;
assert.equal(rollDropQtyWithRollInt(bonebreakerDrop, 0.999), 0);
assert.equal(rollDropQtyWithRollInt(bonebreakerDrop, 0), 1);
ok('normal drop fail/success on controlled random');

// 11–13. Spoil gating + controlled roll
const graniteSpoil = findDrop(ensureMobDropBag(20083, 33).spoil, 4113)!;
assert.equal(rollDropQtyWithRollInt(graniteSpoil, 0.999), 0);
assert.equal(rollDropQtyWithRollInt(graniteSpoil, 0), 1);

const origRandom = Math.random;
try {
  Math.random = () => 0.999;
  const noSpoil = rollKillLoot(20083, 33, emptyInventory(), DWARF_SPOILER_CTX);
  assert.ok(!noSpoil.items.some((i) => i.l2ItemId === 4113));

  Math.random = () => 0;
  const withSpoil = rollKillLoot(20083, 33, emptyInventory(), DWARF_SPOILER_CTX);
  assert.ok(withSpoil.items.some((i) => i.l2ItemId === 4113 && i.spoil));
} finally {
  Math.random = origRandom;
}

const humanLoot = rollKillLoot(20083, 33, emptyInventory(), {
  race: 'human',
  l2Profession: 'fighter',
  skillsLearnedJson: [],
});
assert.ok(!humanLoot.items.some((i) => i.l2ItemId === 4113));
ok('spoil gated + controlled spoil success');

// Normal drop not in spoil pool
assert.equal(findDrop(ensureMobDropBag(20269, 34).spoil, 4113), undefined);
ok('normal drop not in spoil pool');

// 14–15. Inventory + catalog names/icons
let inv = emptyInventory();
inv = addItemToBag(inv, 4113, 1);
assert.equal(countBagQty(parseInventory(inv), 4113), 1);
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES) {
  const bag = ensureMobDropBag(source.npcId, source.level);
  const pool = source.sourceType === 'normal_drop' ? bag.drops : bag.spoil;
  const entry = findDrop(pool, source.itemId)!;
  const catalog = D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(source.itemId)!;
  assert.equal(entry.displayName, catalog.nameUk);
  assert.equal(entry.iconUrl, catalog.iconPath);
}
ok('inventory add + catalog name/icon on drop lines');

// —— Raid Boss tests ——

assert.equal(D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES.length, 14);
ok('14 raid boss key material sources');

for (const source of D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES) {
  const rb = raidBossLv20_25SpecForNpcId(source.raidBossId);
  assert.ok(rb, `RB ${source.raidBossId} in catalog`);
  assert.equal(rb!.level, source.level);
  assert.equal(rb!.nameUk, source.nameUk);

  const bag = customNpcDropBagForMob(source.raidBossId);
  assert.ok(bag, `RB ${source.raidBossId} drop bag`);
  assert.equal(bag!.drops.length, 1, `RB ${source.raidBossId} one drop line`);
  assert.equal(bag!.spoil.length, 0, `RB ${source.raidBossId} no spoil`);

  const line = bag!.drops[0]!;
  assert.equal(line.l2ItemId, source.itemId);
  assert.equal(line.chance, source.chance);
  assert.equal(line.min, 1);
  assert.equal(line.max, 2);
  assert.equal(line.displayName, D_GRADE_WEAPON_KEY_MATERIAL_BY_ITEM_ID.get(source.itemId)!.nameUk);
}
ok('14 RB drop bags with correct chance/qty');

for (const source of D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES) {
  const expected = source.level <= 21 ? 0.11 : 0.13;
  assert.equal(source.chance, expected, `RB ${source.raidBossId} chance tier`);
}
ok('RB tier chances 0.11 (20–21) and 0.13 (23–25)');

// RB 25149 stays EXP-only
const kroolBag = customNpcDropBagForMob(RB_LV20_25_EXP_ONLY_NPC_ID);
assert.ok(kroolBag);
assert.equal(kroolBag!.drops.length, 0);
assert.equal(kroolBag!.spoil.length, 0);
ok('RB Krool (25149) stays EXP-only');

// RB controlled roll
const rbLine = customNpcDropBagForMob(25372)!.drops[0]!;
assert.equal(rollDropQtyWithRollInt(rbLine, 0.999), 0);
assert.equal(rollDropQtyWithRollInt(rbLine, 0), 1);

try {
  Math.random = () => 0;
  const spawn = getWorldSpawnById('l2dop_rb_25372')!;
  const loot = rollKillLoot(25372, spawn.level, emptyInventory(), null, {
    spawnKind: 'raid',
    mobName: spawn.name,
    spawnId: spawn.id,
  });
  const keyDrop = loot.items.find((i) => i.l2ItemId === 4113);
  assert.ok(keyDrop);
  assert.ok(keyDrop!.qty >= 1 && keyDrop!.qty <= 2);
  assert.equal(keyDrop!.spoil, false);
} finally {
  Math.random = origRandom;
}
ok('RB kill loot success qty 1–2, not spoil');

// No duplicate RB + item + sourceType
const rbKeys = new Set<string>();
for (const source of D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES) {
  const key = `${source.raidBossId}:${source.itemId}:${source.sourceType}`;
  assert.ok(!rbKeys.has(key), `duplicate ${key}`);
  rbKeys.add(key);
}
ok('no duplicate RB sourceId+itemId+sourceType');

// Regression: recipe scroll catalog unchanged
assert.equal(D_GRADE_WEAPON_RECIPE_MOB_SOURCES.length, 34);
assert.ok(
  D_GRADE_WEAPON_RECIPE_MOB_SOURCES.some(
    (s) => s.npcId === 20213 && s.itemId === 921005 && s.channel === 'spoil',
  ),
);
assert.ok(
  D_GRADE_WEAPON_RECIPE_MOB_SOURCES.some(
    (s) => s.npcId === 20269 && s.itemId === 921001 && s.channel === 'drop',
  ),
);
ok('recipe scroll drop catalog unchanged');

// Helper exports
assert.ok(findDGradeWeaponKeyMaterialSource(20269, 4113, 'normal_drop'));
assert.ok(findDGradeWeaponKeyMaterialRaidSource(25372));
assert.ok(listDGradeWeaponKeyMaterialSourcesForNpc(20269).length >= 1);
assert.ok(
  mergeDGradeWeaponKeyMaterialDropOverlay({ drops: [], spoil: [] }, 20269).drops.length >= 1,
);

console.log(
  `test:d-grade-weapon-key-material-drops OK (${D_GRADE_WEAPON_KEY_MATERIAL_MOB_SOURCES.length} mob + ${D_GRADE_WEAPON_KEY_MATERIAL_RAID_SOURCES.length} raid sources)`,
);
