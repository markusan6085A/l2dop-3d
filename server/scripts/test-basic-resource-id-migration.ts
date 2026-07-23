/**
 * Interlude itemId fix for 1874/1875/1876 + one-pass migration contract.
 * npm run test:basic-resource-id-migration
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  BASIC_RESOURCE_BY_CODE,
  BASIC_RESOURCE_BY_ITEM_ID,
  BASIC_RESOURCE_CATALOG,
  BASIC_RESOURCE_ITEM_IDS,
} from '../src/data/basicResourceCatalog.js';
import {
  mapOriginalBasicResourceItemId,
  ORIGINAL_BASIC_RESOURCE_ID_MAP,
  preflightBasicResourceIdMigration,
  remapBasicResourceBagStacks,
  remapBasicResourceInventoryState,
  semanticQtyTotalsAfterMigration,
  semanticQtyTotalsFromCounts,
  BASIC_RESOURCE_ID_MIGRATION_MARKER,
} from '../src/data/basicResourceItemIdMigration.js';
import {
  resolveStableBasicResourcePoolItemIds,
} from '../src/data/basicResourceMobDrops.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { isLegacyResourceItemId } from '../scripts/cleanup-legacy-resource-items.js';
import { emptyInventory } from '../src/data/inventory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const iconsDir = path.join(repoRoot, 'server/public/icons/resources/basic');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function rowById(id: number) {
  const row = BASIC_RESOURCE_BY_ITEM_ID.get(id);
  assert.ok(row, `missing catalog row ${id}`);
  return row!;
}

// 1–7 canonical catalog rows
const o1874 = rowById(1874);
assert.equal(o1874.code, 'oriharukon_ore');
assert.equal(o1874.nameEn, 'Oriharukon Ore');
assert.equal(o1874.nameUk, 'Руда оріхарукону');
assert.equal(o1874.iconUrl, '/icons/resources/basic/oriharukon_ore.jpg');
assert.equal(o1874.tier, 4);
ok('1874 = Oriharukon Ore');

const s1875 = rowById(1875);
assert.equal(s1875.code, 'stone_of_purity');
assert.equal(s1875.nameEn, 'Stone of Purity');
assert.equal(s1875.nameUk, 'Камінь чистоти');
assert.equal(s1875.iconUrl, '/icons/resources/basic/stone_of_purity.jpg');
assert.equal(s1875.tier, 3);
ok('1875 = Stone of Purity');

const m1876 = rowById(1876);
assert.equal(m1876.code, 'mithril_ore');
assert.equal(m1876.nameEn, 'Mithril Ore');
assert.equal(m1876.nameUk, 'Міфрилова руда');
assert.equal(m1876.iconUrl, '/icons/resources/basic/mithril_ore.jpg');
assert.equal(m1876.tier, 3);
ok('1876 = Mithril Ore');

for (const row of [o1874, s1875, m1876]) {
  const iconPath = path.join(
    repoRoot,
    'server/public',
    row.iconUrl.replace(/^\//, '').replace(/\//g, path.sep),
  );
  assert.equal(fs.existsSync(iconPath), true, `icon ${row.iconUrl}`);
}
ok('icons exist for 1874–1876');

// 8–11 one-pass map
assert.deepEqual(ORIGINAL_BASIC_RESOURCE_ID_MAP, {
  1874: 1875,
  1875: 1876,
  1876: 1874,
});
assert.equal(mapOriginalBasicResourceItemId(1874), 1875);
assert.equal(mapOriginalBasicResourceItemId(1875), 1876);
assert.equal(mapOriginalBasicResourceItemId(1876), 1874);
assert.equal(preflightBasicResourceIdMigration().ok, true);
ok('one-pass ORIGINAL_ID_MAP preflight OK');

// 12–13 quantity preserved, no semantic mix
const inv = {
  v: 1 as const,
  stacks: [
    { itemId: 1874, qty: 11 },
    { itemId: 1875, qty: 22 },
    { itemId: 1876, qty: 33 },
  ],
  eq: {},
};
const remapped = remapBasicResourceInventoryState(inv);
assert.deepEqual(remapped.stacks, [
  { itemId: 1875, qty: 11 },
  { itemId: 1876, qty: 22 },
  { itemId: 1874, qty: 33 },
]);
const before = new Map<number, number>([
  [1874, 11],
  [1875, 22],
  [1876, 33],
]);
assert.deepEqual(semanticQtyTotalsFromCounts(before), {
  stone_of_purity: 11,
  mithril_ore: 22,
  oriharukon_ore: 33,
});
assert.deepEqual(semanticQtyTotalsAfterMigration(before), {
  stone_of_purity: 11,
  mithril_ore: 22,
  oriharukon_ore: 33,
});
ok('quantity preserved; three resources stay distinct');

// one-pass: 1874 must not chain through 1875→1876
const single = remapBasicResourceBagStacks([{ itemId: 1874, qty: 99 }]);
assert.deepEqual(single, [{ itemId: 1875, qty: 99 }]);
ok('1874 old maps once to 1875 (no chain)');

// 16 cleanup preserves 1864–1877
for (const id of BASIC_RESOURCE_ITEM_IDS) {
  assert.equal(isLegacyResourceItemId(id), false, `basic ${id} not legacy`);
}
ok('cleanup does not target 1864–1877 or 920001–920003');

// 17 drop resolver by code
const pool = resolveStableBasicResourcePoolItemIds(20001, 55, 'test_spawn');
assert.ok(pool.includes(BASIC_RESOURCE_BY_CODE.get('stone_of_purity')!.itemId));
assert.equal(BASIC_RESOURCE_BY_CODE.get('stone_of_purity')!.itemId, 1875);
assert.equal(BASIC_RESOURCE_BY_CODE.get('mithril_ore')!.itemId, 1876);
assert.equal(BASIC_RESOURCE_BY_CODE.get('oriharukon_ore')!.itemId, 1874);
ok('drop pool resolves correct itemId by code');

// 18 ITEM_CATALOG
for (const row of BASIC_RESOURCE_CATALOG) {
  assert.ok(ITEM_CATALOG[row.itemId], `ITEM_CATALOG ${row.itemId}`);
  assert.equal(ITEM_CATALOG[row.itemId]!.nameUk, row.nameUk);
}
ok('ITEM_CATALOG contains all basic resources with correct names');

// 20 no global collisions among basic ids
assert.equal(new Set(BASIC_RESOURCE_ITEM_IDS).size, 17);
ok('no itemId collisions in basic resource catalog');

assert.equal(BASIC_RESOURCE_ID_MIGRATION_MARKER, 'BASIC_RESOURCE_ID_MIGRATION_V1');
ok('migration marker constant defined');

// dry-run contract: pure remap does not drop items
const empty = remapBasicResourceInventoryState(emptyInventory());
assert.deepEqual(empty.stacks, []);
ok('dry-run remap helper leaves empty inventory unchanged');

console.log('\ntest-basic-resource-id-migration: OK');
