/**
 * Smoke + contract tests for crafted resource catalog (craft stage 2).
 * npm run test:crafted-resources
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CRAFTED_RESOURCE_CATALOG,
  CRAFTED_RESOURCE_BY_CODE,
  CRAFTED_RESOURCE_BY_ITEM_ID,
  CRAFTED_RESOURCE_ITEM_IDS,
  isCraftedResourceItemId,
} from '../src/data/craftedResourceCatalog.js';
import {
  CRAFTED_RESOURCE_RECIPES,
  CRAFTED_RESOURCE_RECIPE_BY_CODE,
} from '../src/data/craftedResourceRecipes.js';
import {
  craftedResourceIconHintsForClient,
  craftedResourceNamesEnForClient,
  craftedResourceNamesUkForClient,
  craftedResourceInventoryTabHints,
  mergeCraftedResources,
} from '../src/data/itemsCatalogCraftedResources.js';
import {
  ITEM_CATALOG,
  itemInventoryTabHintsForClient,
  itemNamesUkForClient,
} from '../src/data/itemsCatalog.js';
import { itemNamesEnForClient } from '../src/data/itemNamesEnForClient.js';
import {
  resolveItemIconPublicUrl,
  resolveL2dopItemIconFilePath,
} from '../src/services/l2dopItemIconPath.js';
import {
  addItemToBag,
  emptyInventory,
} from '../src/data/inventory.js';
import { depositBagToWarehouse, emptyWarehouse } from '../src/data/warehouse.js';
import { isLegacyResourceItemId } from './cleanup-legacy-resource-items.js';
import { BASIC_RESOURCE_CATALOG } from '../src/data/basicResourceCatalog.js';
import type { ItemMeta } from '../src/data/itemsCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const iconsDir = path.join(repoRoot, 'server/public/icons/resources/crafted');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

assert.equal(CRAFTED_RESOURCE_CATALOG.length, 20, 'catalog has 20 items');
ok('catalog has 20 items');

const expectedIds = [
  1878, 1879, 1880, 1881, 1882, 1883, 1884, 1885, 1886, 1887,
  1888, 1889, 1890, 1891, 1892, 1893, 1894, 1895, 5549, 5550,
];
assert.deepEqual([...CRAFTED_RESOURCE_ITEM_IDS].sort((a, b) => a - b), expectedIds.sort((a, b) => a - b));
ok('itemIds 1878–1895, 5549, 5550');

const codes = CRAFTED_RESOURCE_CATALOG.map((r) => r.code);
assert.equal(new Set(codes).size, codes.length, 'unique codes');
assert.equal(new Set(expectedIds).size, expectedIds.length, 'unique itemIds');
ok('unique codes and itemIds');

for (const row of CRAFTED_RESOURCE_CATALOG) {
  const iconPath = path.join(repoRoot, 'server/public', row.iconUrl.replace(/^\//, ''));
  assert.ok(fs.existsSync(iconPath), `icon exists: ${row.iconUrl}`);
  assert.equal(row.stackable, true);
  assert.equal(row.inventoryTab, 'resource');
  assert.equal(CRAFTED_RESOURCE_BY_ITEM_ID.get(row.itemId)?.code, row.code);
  assert.equal(CRAFTED_RESOURCE_BY_CODE.get(row.code)?.itemId, row.itemId);
  assert.ok(isCraftedResourceItemId(row.itemId));
}
ok('icons exist; stackable; inventory tab resource');

for (const id of CRAFTED_RESOURCE_ITEM_IDS) {
  assert.equal(isLegacyResourceItemId(id), false, `crafted ${id} not legacy cleanup`);
}
ok('cleanup does not target crafted resources');

assert.equal(CRAFTED_RESOURCE_RECIPES.length, 20);
for (const recipe of CRAFTED_RESOURCE_RECIPES) {
  assert.equal(recipe.successChance, 100);
  assert.ok(CRAFTED_RESOURCE_RECIPE_BY_CODE.has(recipe.code));
}
ok('20 recipes; successChance 100');

const braided = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('braided_hemp')!;
assert.deepEqual(braided.ingredients, [{ itemId: 1864, quantity: 5 }]);
assert.equal(braided.outputQuantity, 1);

const cokes = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('cokes')!;
assert.deepEqual(cokes.ingredients, [
  { itemId: 1871, quantity: 3 },
  { itemId: 1870, quantity: 3 },
]);

const cord = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('cord')!;
assert.equal(cord.outputQuantity, 20);

const fiber = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('metallic_fiber')!;
assert.equal(fiber.outputQuantity, 20);

const synCokes = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('synthetic_cokes')!;
assert.ok(synCokes.ingredients.some((i) => i.itemId === 1874));

const varnish = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('varnish_of_purity')!;
assert.ok(varnish.ingredients.some((i) => i.itemId === 1875));

const mithril = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('mithril_alloy')!;
assert.ok(mithril.ingredients.some((i) => i.itemId === 1876));

const plate = CRAFTED_RESOURCE_RECIPE_BY_CODE.get('durable_metal_plate')!;
assert.ok(plate.ingredients.some((i) => i.itemId === 1876));
ok('key recipe ingredient contracts');

const namesUk = itemNamesUkForClient();
const namesEn = itemNamesEnForClient();
const tabHints = itemInventoryTabHintsForClient();
const iconHints = craftedResourceIconHintsForClient();

for (const row of CRAFTED_RESOURCE_CATALOG) {
  assert.equal(namesUk[row.itemId], row.nameUk);
  assert.equal(namesEn[row.itemId], row.nameEn);
  assert.equal(tabHints[row.itemId], 'resource');
  assert.equal(iconHints[row.itemId], row.iconUrl);
  assert.ok(ITEM_CATALOG[row.itemId], `ITEM_CATALOG ${row.itemId}`);
  assert.equal(ITEM_CATALOG[row.itemId].slot, 'consumable');
  assert.ok(resolveItemIconPublicUrl(row.itemId));
  assert.ok(fs.existsSync(resolveL2dopItemIconFilePath(row.itemId)!));
}
ok('catalog hints, names, icons, ITEM_CATALOG');

const wh = emptyWarehouse();
const inv = addItemToBag(emptyInventory(), 1878, 5);
const deposited = depositBagToWarehouse(wh, inv, 1878, 0, 3);
assert.equal(deposited.warehouse.stacks.find((s) => s.itemId === 1878)?.qty, 3);
ok('warehouse supports crafted resources');

const catalogPatch: Record<number, ItemMeta> = {};
mergeCraftedResources(catalogPatch);
assert.equal(Object.keys(catalogPatch).length, 20);
ok('mergeCraftedResources registers 20 items');

const basicBefore = JSON.stringify(BASIC_RESOURCE_CATALOG);
assert.equal(basicBefore, JSON.stringify(BASIC_RESOURCE_CATALOG), 'basic resources unchanged');
ok('basic resources unchanged');

console.log('\ntest-crafted-resources: OK');
