/**
 * Catalog version endpoint + catalog-hints payload contract.
 * npm run test:client-catalog-cache
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { CHARACTER_CATALOG_VERSION } from '../src/data/characterCatalogVersion.js';
import { BASIC_RESOURCE_CATALOG } from '../src/data/basicResourceCatalog.js';
import { CRAFTED_RESOURCE_CATALOG } from '../src/data/craftedResourceCatalog.js';
import { ENCHANT_SCROLL_DEFINITIONS } from '../src/data/enchantScrollCatalog.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });
const repoRoot = path.resolve(__dirname, '../..');
const commonJsPath = path.join(repoRoot, 'server/public/common.js');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

assert.equal(
  CHARACTER_CATALOG_VERSION,
  '20260723-crafted-resource-craft-v1',
  'server catalog version bumped',
);
ok('CHARACTER_CATALOG_VERSION matches cache bump');

const commonJs = fs.readFileSync(commonJsPath, 'utf8');
assert.ok(
  commonJs.includes("APP_DATA_VERSION = '20260723-crafted-resource-craft-v1'"),
  'APP_DATA_VERSION in common.js',
);
assert.ok(
  commonJs.includes('/character/catalog-version'),
  'ensureCatalogHintsLoaded uses catalog-version endpoint',
);
assert.ok(
  commonJs.includes('ITEM_ICON_HINTS_CACHE_KEY'),
  'item icon session cache key present',
);
assert.ok(
  commonJs.includes('isPlaceholderIconUrl'),
  'placeholder icon filter present',
);
assert.ok(
  commonJs.includes('clearCatalogHintMemoryMaps'),
  'memory map clear on invalidation',
);
ok('common.js cache invalidation hooks present');

async function runRouteTests(): Promise<void> {
  const app = await buildApp();
  const token = signAccessToken('client-catalog-cache-smoke-user');

  const verRes = await app.inject({
    method: 'GET',
    url: '/character/catalog-version',
    headers: { authorization: 'Bearer ' + token },
  });
  assert.equal(verRes.statusCode, 200);
  const verBody = verRes.json() as { catalogVersion?: string };
  assert.equal(verBody.catalogVersion, CHARACTER_CATALOG_VERSION);
  ok('GET /character/catalog-version returns catalogVersion only');

  const hintsRes = await app.inject({
    method: 'GET',
    url: '/character/catalog-hints',
    headers: { authorization: 'Bearer ' + token },
  });
  assert.equal(hintsRes.statusCode, 200);
  const hints = hintsRes.json() as {
    catalogVersion?: string;
    itemNamesEn?: Record<string, string>;
    itemNamesUk?: Record<string, string>;
    itemInventoryTabHints?: Record<string, string>;
    itemIconHintByItemId?: Record<string, string>;
    itemSlotHints?: Record<string, string>;
  };
  assert.equal(hints.catalogVersion, CHARACTER_CATALOG_VERSION);

  for (const row of BASIC_RESOURCE_CATALOG) {
    const id = String(row.itemId);
    assert.ok(hints.itemNamesEn?.[id], `itemNamesEn ${row.itemId}`);
    assert.ok(hints.itemNamesUk?.[id], `itemNamesUk ${row.itemId}`);
    assert.equal(
      hints.itemInventoryTabHints?.[id],
      'resource',
      `inventory tab ${row.itemId}`,
    );
    assert.equal(
      hints.itemIconHintByItemId?.[id],
      row.iconUrl,
      `icon hint ${row.itemId}`,
    );
    assert.equal(
      hints.itemSlotHints?.[id],
      'consumable',
      `slot hint ${row.itemId}`,
    );
    assert.notEqual(hints.itemNamesEn?.[id], `#${row.itemId}`);
    assert.notEqual(hints.itemNamesUk?.[id], `#${row.itemId}`);
  }
  ok('all 17 basic resources present in catalog-hints with names/icons/tabs');

  for (const row of CRAFTED_RESOURCE_CATALOG) {
    const id = String(row.itemId);
    assert.ok(hints.itemNamesEn?.[id], `crafted itemNamesEn ${row.itemId}`);
    assert.ok(hints.itemNamesUk?.[id], `crafted itemNamesUk ${row.itemId}`);
    assert.equal(hints.itemInventoryTabHints?.[id], 'resource');
    assert.equal(hints.itemIconHintByItemId?.[id], row.iconUrl);
  }
  ok('all 20 crafted resources present in catalog-hints');

  for (const row of ENCHANT_SCROLL_DEFINITIONS) {
    const id = String(row.itemId);
    assert.equal(
      hints.itemIconHintByItemId?.[id],
      row.iconUrl,
      `scroll icon ${row.itemId}`,
    );
    assert.equal(
      hints.itemInventoryTabHints?.[id],
      'enchantment',
      `scroll tab ${row.itemId}`,
    );
  }
  ok('enchant scroll icons/tabs in catalog-hints');

  await app.close();
}

runRouteTests()
  .then(function () {
    console.log('\ntest-client-catalog-cache: OK');
  })
  .catch(function (err) {
    console.error(err);
    process.exitCode = 1;
  });
