/**
 * Smoke + contract tests for basic resource system (craft stage 1).
 * npm run test:basic-resources
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASIC_RESOURCE_CATALOG,
  BASIC_RESOURCE_BY_CODE,
  BASIC_RESOURCE_BY_ITEM_ID,
  BASIC_RESOURCE_ITEM_IDS,
  isBasicResourceItemId,
  isBasicResourcePieceItemId,
} from '../src/data/basicResourceCatalog.js';
import {
  mergeBasicResources,
} from '../src/data/itemsCatalogBasicResources.js';
import {
  BASIC_RESOURCE_TIER_ROLL_SPEC,
  buildBasicResourceDropOverlay,
  pieceQtyMultiplierForTier,
  resolveStableBasicResourcePoolCodes,
  resolveStableBasicResourcePoolItemIds,
  shouldApplyBasicResourceDropOverlay,
} from '../src/data/basicResourceMobDrops.js';
import {
  ITEM_CATALOG,
  itemInventoryTabHintsForClient,
  itemNamesUkForClient,
  type ItemMeta,
} from '../src/data/itemsCatalog.js';
import { resolveEquipSlotKey } from '../src/data/inventory.js';
import {
  addItemToBag,
  emptyInventory,
  parseInventoryRaw,
  removeBagQty,
} from '../src/data/inventory.js';
import {
  depositBagToWarehouse,
  emptyWarehouse,
} from '../src/data/warehouse.js';
import { ensureMobDropBag } from '../src/domain/spawnSyntheticRewards.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import { hasCustomNpcDropBag } from '../src/data/npcDropsResolved.js';
import { customSevenSignsDungeonDropBagForMob } from '../src/data/l2dopSevenSignsDungeonMobRewards.js';
import { L2DOP_GM_SHOP_WEAPONS } from '../src/data/l2dopGmShopCatalog.generated.js';
import { D_WEAPON_CATALOG } from '../src/data/dWeaponCatalog.js';
import { C_WEAPON_CATALOG } from '../src/data/cWeaponCatalog.js';
import { B_WEAPON_CATALOG } from '../src/data/bWeaponCatalog.js';
import { A_WEAPON_CATALOG } from '../src/data/aWeaponCatalog.js';
import { S_WEAPON_CATALOG } from '../src/data/sWeaponCatalog.js';
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import { COIN_OF_LUCK_ITEM_ID } from '../src/domain/dailyQuestRewards.js';
import { ANCIENT_ADENA_ITEM_ID } from '../src/data/ancientAdenaItem.js';
import {
  SEAL_STONE_GREEN_ITEM_ID,
  SEAL_STONE_BLUE_ITEM_ID,
  SEAL_STONE_RED_ITEM_ID,
} from '../src/data/sevenSignsSealStoneItems.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const iconsDir = path.join(repoRoot, 'server/public/icons/resources/basic');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function collectGlobalItemIdBindings(): Map<number, string[]> {
  const map = new Map<number, string[]>();
  const add = (id: number, source: string) => {
    if (!Number.isFinite(id) || id <= 0) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id)!.push(source);
  };

  for (const id of Object.keys(ITEM_CATALOG)) add(Number(id), 'ITEM_CATALOG');
  for (const row of BASIC_RESOURCE_CATALOG) {
    add(row.itemId, `basicResource:${row.code}`);
  }
  for (const row of L2DOP_GM_SHOP_WEAPONS) add(row.itemId, `gmWeapon:${row.nameUk}`);
  for (const row of D_WEAPON_CATALOG) add(row.itemId, `dWeapon:${row.code}`);
  for (const row of C_WEAPON_CATALOG) add(row.itemId, `cWeapon:${row.code}`);
  for (const row of B_WEAPON_CATALOG) add(row.itemId, `bWeapon:${row.code}`);
  for (const row of A_WEAPON_CATALOG) add(row.itemId, `aWeapon:${row.code}`);
  for (const row of S_WEAPON_CATALOG) add(row.itemId, `sWeapon:${row.code}`);

  for (const [shopKey, row] of Object.entries(dropsShopOverrides)) {
    const itemId = (row as { itemId?: number }).itemId;
    if (typeof itemId === 'number') add(itemId, `dropsShop:${shopKey}`);
  }

  add(COIN_OF_LUCK_ITEM_ID, 'coin_of_luck');
  add(ANCIENT_ADENA_ITEM_ID, 'ancient_adena');
  add(SEAL_STONE_GREEN_ITEM_ID, 'seal_stone_green');
  add(SEAL_STONE_BLUE_ITEM_ID, 'seal_stone_blue');
  add(SEAL_STONE_RED_ITEM_ID, 'seal_stone_red');

  return map;
}

// 1–4 catalog shape
assert.equal(BASIC_RESOURCE_CATALOG.length, 17, 'catalog must have 17 resources');
ok('catalog contains exactly 17 resources');

const itemIds = BASIC_RESOURCE_CATALOG.map((r) => r.itemId);
assert.equal(new Set(itemIds).size, 17, 'itemId must be unique');
ok('all itemId unique');

const codes = BASIC_RESOURCE_CATALOG.map((r) => r.code);
assert.equal(new Set(codes).size, 17, 'code must be unique');
ok('all code unique');

for (const row of BASIC_RESOURCE_CATALOG) {
  assert.equal(row.stackable, true, `${row.code} must be stackable`);
  const iconPath = path.join(
    repoRoot,
    'server/public',
    row.iconUrl.replace(/^\//, '').replace(/\//g, path.sep),
  );
  assert.equal(fs.existsSync(iconPath), true, `icon missing: ${row.iconUrl}`);
}
ok('all iconUrl files exist');

// 5–8 item behavior
const probe: Record<number, ItemMeta> = {};
mergeBasicResources(probe);
for (const row of BASIC_RESOURCE_CATALOG) {
  const m = probe[row.itemId];
  assert.ok(m, `mergeBasicResources missing ${row.code}`);
  assert.equal(m.slot, 'consumable', `${row.code} slot`);
  assert.equal(resolveEquipSlotKey(row.itemId, {}), null, `${row.code} not equippable`);
}
ok('resources stackable catalog meta, not equippable');

for (const row of BASIC_RESOURCE_CATALOG) {
  assert.ok(ITEM_CATALOG[row.itemId], `ITEM_CATALOG missing ${row.code}`);
}
ok('ITEM_CATALOG contains all 17');

const tabHints = itemInventoryTabHintsForClient();
for (const row of BASIC_RESOURCE_CATALOG) {
  assert.equal(tabHints[row.itemId], 'resource', `${row.code} inventory tab`);
}
ok('all resources in «Ресурси» tab');

// 9–10 global collisions
const bindings = collectGlobalItemIdBindings();
for (const row of BASIC_RESOURCE_CATALOG) {
  const sources = bindings.get(row.itemId) ?? [];
  const external = sources.filter(
    (s) => !s.startsWith('basicResource:') && s !== 'ITEM_CATALOG',
  );
  assert.equal(
    external.length,
    0,
    `itemId ${row.itemId} (${row.code}) collision: ${external.join(', ')}`,
  );
}
ok('no global itemId collisions for basic resources');

// 11–12 RB / Seven Signs unchanged
const rbNpcId = 25001;
assert.equal(hasCustomNpcDropBag(rbNpcId), true);
const rbOverlay = buildBasicResourceDropOverlay({
  npcId: rbNpcId,
  level: 30,
  spawnId: 'rb_test',
  hasCustomDropBag: true,
  isRaidBoss: true,
});
assert.deepEqual(rbOverlay, { drops: [], spoil: [] });
ok('normal drop overlay skipped for Raid Boss');

const sdNpcId = 21208;
const sdSpawnId = 'sdms_necropolis_of_sacrifice_001';
assert.ok(customSevenSignsDungeonDropBagForMob(sdNpcId, sdSpawnId));
const sdOverlay = buildBasicResourceDropOverlay({
  npcId: sdNpcId,
  level: 45,
  spawnId: sdSpawnId,
  hasCustomDropBag: true,
});
assert.deepEqual(sdOverlay, { drops: [], spoil: [] });
ok('normal drop overlay skipped for Seven Signs custom mobs');

// 13–14 existing drops / spoil preserved
const npcId = 20001;
const level = 40;
const spawnId = 'world_20001_test';
const before = ensureMobDropBag(npcId, level, spawnId, { spawnKind: 'passive' });
assert.ok(before.drops.some((d) => d.kind === 'adena'), 'adena drop preserved');
const basicNormal = before.drops.filter((d) => d.exclusiveGroup === 'basic_resource_normal');
const basicSpoil = before.spoil.filter((d) => d.exclusiveGroup === 'basic_resource_spoil');
assert.ok(basicNormal.length > 0, 'basic normal overlay appended');
assert.ok(basicSpoil.length > 0, 'basic spoil overlay appended');
ok('existing drops kept; basic overlay appended');

// 15–16 max one roll per group (structure)
assert.equal(
  new Set(basicNormal.map((d) => d.exclusiveGroup)).size,
  1,
  'single normal exclusive group',
);
assert.equal(
  new Set(basicSpoil.map((d) => d.exclusiveGroup)).size,
  1,
  'single spoil exclusive group',
);
ok('at most one basic-resource normal/spoil roll group');

// 17 piece multiplier
assert.equal(pieceQtyMultiplierForTier(3, 920001), 3);
assert.equal(pieceQtyMultiplierForTier(4, 920002), 5);
assert.equal(pieceQtyMultiplierForTier(6, 920003), 12);
assert.equal(pieceQtyMultiplierForTier(6, 1869), 1);
ok('piece multiplier only for piece resources T3–T6');

// 18 stable pool
const poolA = resolveStableBasicResourcePoolItemIds(npcId, level, spawnId);
const poolB = resolveStableBasicResourcePoolItemIds(npcId, level, spawnId);
assert.deepEqual(poolA, poolB);
const poolOther = resolveStableBasicResourcePoolItemIds(npcId, level, spawnId + '_x');
assert.notDeepEqual(poolA, poolOther);
ok('stable pool for npcId/level/spawnId');

// 19–22 inventory / warehouse / market readiness
let inv = emptyInventory();
inv = addItemToBag(inv, 1864, 5);
inv = addItemToBag(inv, 1864, 3);
assert.equal(
  inv.stacks.filter((s) => s.itemId === 1864).length,
  1,
  'same itemId stacks merge',
);
assert.equal(inv.stacks[0]!.qty, 8);
ok('inventoryJson stack merge by itemId');

const whMove = depositBagToWarehouse(emptyWarehouse(), inv, 1864, 0, 8);
assert.equal(whMove.inventory.stacks.length, 0);
assert.equal(whMove.warehouse.stacks[0]!.qty, 8);
ok('warehouse deposit works');

const namesUk = itemNamesUkForClient();
assert.equal(namesUk[920001], 'Уламок зброї');
assert.ok(ITEM_CATALOG[920001], 'market-eligible catalog row');
ok('resource listed in catalog for market/inventory UI');

// 23–25 qty guards
let badInv = addItemToBag(emptyInventory(), 1864, 5);
assert.throws(() => removeBagQty(badInv, 1864, 999), /insufficient_materials/);
badInv = removeBagQty(badInv, 1864, 2);
assert.equal(badInv.stacks[0]!.qty, 3);
assert.doesNotThrow(() => parseInventoryRaw(JSON.parse(JSON.stringify(badInv))));
assert.throws(
  () => depositBagToWarehouse(emptyWarehouse(), badInv, 1864, 0, -1),
  /invalid_qty/,
);
const parsedWh = parseInventoryRaw({
  v: 1,
  stacks: [{ itemId: 1864, qty: Number.NaN }],
  eq: {},
});
assert.equal(parsedWh.stacks.length, 0, 'NaN qty stripped on parse');
ok('quantity guards: overflow, negative, NaN blocked');

// tier roll spec sanity
for (const tier of [1, 2, 3, 4, 5, 6] as const) {
  const spec = BASIC_RESOURCE_TIER_ROLL_SPEC[tier];
  assert.ok(spec.normalChance > 0 && spec.normalChance <= 1);
  assert.ok(spec.spoilChance >= spec.normalChance);
  assert.ok(spec.spoilQty.min >= spec.normalQty.min);
}

// Example mob levels for report
const exampleLevels = [10, 25, 40, 55, 68, 80];
console.log('\nExample drop pools (npc 20001, spawn example):');
for (const lv of exampleLevels) {
  const codes = resolveStableBasicResourcePoolCodes(20001, lv, 'example_spawn');
  const tier = lv <= 20 ? 1 : lv <= 35 ? 2 : lv <= 50 ? 3 : lv <= 60 ? 4 : lv <= 75 ? 5 : 6;
  const spec = BASIC_RESOURCE_TIER_ROLL_SPEC[tier as 1 | 2 | 3 | 4 | 5 | 6];
  console.log(
    `  L${lv} T${tier}: pool=${codes.length} normal=${(spec.normalChance * 100).toFixed(0)}% qty ${spec.normalQty.min}-${spec.normalQty.max}`,
  );
}

// Simulated kill: basic resources possible for normal mob
let sawBasic = false;
for (let i = 0; i < 200; i++) {
  const loot = rollKillLoot(20001, 40, emptyInventory(), {
    race: 'dwarf',
    l2Profession: 'scavenger',
    skillsLearnedJson: [{ id: 254, level: 1 }],
  });
  if (loot.items.some((x) => isBasicResourceItemId(x.l2ItemId))) {
    sawBasic = true;
    break;
  }
}
assert.equal(sawBasic, true, 'expected basic resource from mob after many rolls');
ok('rollKillLoot can drop basic resources');

console.log('\ntest-basic-resources: OK');
