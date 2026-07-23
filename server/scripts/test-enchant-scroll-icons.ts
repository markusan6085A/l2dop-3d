/**
 * Enchant scroll icons in catalog-hints and /game/item-icon.
 * npm run test:enchant-scroll-icons
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ENCHANT_SCROLL_DEFINITIONS,
  enchantScrollIconHintsForClient,
} from '../src/data/enchantScrollCatalog.js';
import {
  itemInventoryTabHintsForClient,
  itemSlotHintsForClient,
} from '../src/data/itemsCatalog.js';
import {
  resolveItemIconPublicUrl,
  resolveL2dopItemIconFilePath,
} from '../src/services/l2dopItemIconPath.js';
import { buildApp } from '../src/app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

assert.equal(ENCHANT_SCROLL_DEFINITIONS.length, 10);
ok('catalog defines 10 enchant scrolls');

const hints = enchantScrollIconHintsForClient();
assert.equal(Object.keys(hints).length, 10);
ok('enchantScrollIconHintsForClient has 10 entries');

const tabHints = itemInventoryTabHintsForClient();
const slotHints = itemSlotHintsForClient();

for (const row of ENCHANT_SCROLL_DEFINITIONS) {
  const iconPath = path.join(
    repoRoot,
    'server/public',
    row.iconUrl.replace(/^\//, '').replace(/\//g, path.sep),
  );
  assert.equal(fs.existsSync(iconPath), true, `icon file missing: ${row.iconUrl}`);
  assert.equal(hints[row.itemId], row.iconUrl, `hint url ${row.itemId}`);
  assert.equal(
    resolveItemIconPublicUrl(row.itemId),
    row.iconUrl,
    `public url ${row.itemId}`,
  );
  assert.ok(
    resolveL2dopItemIconFilePath(row.itemId),
    `file path ${row.itemId}`,
  );
  assert.equal(tabHints[row.itemId], 'enchantment', `tab ${row.itemId}`);
  assert.equal(slotHints[row.itemId], 'consumable', `slot ${row.itemId}`);
}
ok('all 10 scrolls have icon file, hint, public url, enchantment tab');

async function assertItemIconRoute(): Promise<void> {
  const app = await buildApp();
  for (const row of ENCHANT_SCROLL_DEFINITIONS) {
    const res = await app.inject({
      method: 'GET',
      url: `/game/item-icon/${row.itemId}`,
    });
    assert.equal(res.statusCode, 200, `item-icon status ${row.itemId}`);
    assert.notEqual(
      res.headers.location,
      '/icons/drops/other.svg',
      `item-icon redirect placeholder ${row.itemId}`,
    );
    assert.ok(
      String(res.headers['content-type'] || '').startsWith('image/'),
      `item-icon content-type ${row.itemId}`,
    );
  }
  await app.close();
  ok('/game/item-icon/910510–910519 serve real PNG files');
}

assertItemIconRoute()
  .then(function () {
    console.log('\ntest-enchant-scroll-icons: OK');
  })
  .catch(function (err) {
    console.error(err);
    process.exitCode = 1;
  });
