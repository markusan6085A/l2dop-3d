/**
 * Smoke: legacy resource craft system fully removed.
 * npm run test:legacy-resource-removal
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import { itemNamesUkForClient } from '../src/data/itemsCatalog.js';
import { rollKillLoot } from '../src/domain/killLoot.js';
import { emptyInventory } from '../src/data/inventory.js';
import { isBasicResourceItemId } from '../src/data/basicResourceCatalog.js';
import {
  isLegacyResourceItemId,
  stripLegacyResourceItemsFromInventory,
} from './cleanup-legacy-resource-items.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

const repoRoot = path.resolve(__dirname, '../..');
const removedFiles = [
  'server/src/data/resourceCraftRecipes.ts',
  'server/src/services/resourceCraftService.ts',
  'server/src/data/resourceCraftItemNamesUk.ts',
  'server/src/routes/gameResourceCraftRoutes.ts',
  'server/src/domain/mobResourceLoot.ts',
  'server/public/craft.html',
  'server/public/craft.js',
  'server/public/craftProfessions.js',
  'server/public/css/l2-craft-page.css',
];

for (const rel of removedFiles) {
  assert.equal(
    fs.existsSync(path.join(repoRoot, rel)),
    false,
    'removed file still exists: ' + rel
  );
}
ok('core legacy craft files deleted');

const runtimeScanRoots = [
  path.join(repoRoot, 'server/src'),
  path.join(repoRoot, 'server/public'),
];
const banned = [
  'RESOURCE_CRAFT_TIERS',
  'resourceCraftService',
  'resourceCraftRecipes',
  'resourceCraftItemNamesUk',
  'craftProfessions',
  '/game/resource-craft',
  'craft.html',
  'mobResourceLoot',
  'rollProceduralResourceLoot',
];
for (const root of runtimeScanRoots) {
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (ent.name === 'node_modules' || ent.name === 'dist') continue;
        stack.push(full);
        continue;
      }
      if (!/\.(ts|js|html|css|mjs)$/.test(ent.name)) continue;
      if (ent.name === 'cleanup-legacy-resource-items.ts') continue;
      if (ent.name === 'test-legacy-resource-removal.ts') continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const token of banned) {
        assert.equal(
          text.includes(token),
          false,
          `${path.relative(repoRoot, full)} still contains ${token}`
        );
      }
    }
  }
}
ok('runtime scan has no legacy craft symbols');

const namesUk = itemNamesUkForClient();
for (const id of [1881, 1884, 1883, 4039, 5220, 5549, 5550, 1899]) {
  assert.equal(namesUk[id], undefined, 'catalog still has legacy item ' + id);
}
assert.equal(namesUk[1864], 'Стебло', 'basic resource Stem in catalog');
assert.equal(namesUk[1867], 'Шкура тварини', 'basic resource Animal Skin in catalog');
ok('itemNamesUk has no legacy resource ids (basic resources allowed)');

for (const id of [1864, 1867, 1877, 920001, 920002, 920003]) {
  assert.equal(isLegacyResourceItemId(id), false, `basic/synthetic ${id} not legacy cleanup`);
}
for (const id of [20166, 20168, 20171, 20173]) {
  assert.equal(isLegacyResourceItemId(id), false, `legacy S weapon ${id} not resource cleanup`);
}
assert.equal(isLegacyResourceItemId(1881), true);
assert.equal(isLegacyResourceItemId(1884), true);
ok('legacy cleanup targets #1881/#1884 but not S weapons or basic resources');

const loot = rollKillLoot(20001, 40, emptyInventory());
for (const line of loot.items) {
  assert.equal(
    isLegacyResourceItemId(line.l2ItemId),
    false,
    'mob loot dropped legacy item ' + line.l2ItemId
  );
}
ok('rollKillLoot never drops legacy-only resource ids');

assert.equal(isLegacyResourceItemId(1864), false, 'Stem is not legacy cleanup id');
assert.equal(isBasicResourceItemId(1864), true, 'Stem is basic resource');

const invWithLegacy = stripLegacyResourceItemsFromInventory({
  v: 1,
  stacks: [
    { itemId: 1883, qty: 10 },
    { itemId: 1881, qty: 7 },
    { itemId: 1884, qty: 3 },
    { itemId: 20166, qty: 1 },
    { itemId: 57, qty: 5 },
    { itemId: 1899, qty: 2 },
    { itemId: 1864, qty: 4 },
    { itemId: 920002, qty: 9 },
  ],
  eq: { l1: 1878 },
});
assert.equal(invWithLegacy.removedQty, 23);
assert.deepEqual(invWithLegacy.next.stacks, [
  { itemId: 20166, qty: 1 },
  { itemId: 57, qty: 5 },
  { itemId: 1864, qty: 4 },
  { itemId: 920002, qty: 9 },
]);
assert.deepEqual(invWithLegacy.next.eq, {});
ok('cleanup strips legacy ids including #1881/#1884, keeps basic + S weapons');

const invClean = stripLegacyResourceItemsFromInventory({
  v: 1,
  stacks: [{ itemId: 1060, qty: 3 }],
  eq: {},
});
assert.equal(invClean.changed, false);
assert.equal(invClean.removedQty, 0);
ok('cleanup leaves other items untouched');

async function assertLegacyEndpoints404(): Promise<void> {
  const app = await buildApp();
  const token = signAccessToken('legacy-resource-removal-smoke-user');
  const bookRes = await app.inject({
    method: 'GET',
    url: '/game/resource-craft/book',
    headers: { authorization: 'Bearer ' + token },
  });
  assert.equal(bookRes.statusCode, 404, 'GET /game/resource-craft/book must 404');
  const postRes = await app.inject({
    method: 'POST',
    url: '/game/resource-craft',
    headers: {
      authorization: 'Bearer ' + token,
      'content-type': 'application/json',
    },
    payload: { tier: 1, recipeIndex: 0, expectedRevision: 1 },
  });
  assert.equal(postRes.statusCode, 404, 'POST /game/resource-craft must 404');
  await app.close();
  ok('legacy craft endpoints return 404');
}

assertLegacyEndpoints404()
  .then(function () {
    console.log('\ntest-legacy-resource-removal: OK');
  })
  .catch(function (err) {
    console.error(err);
    process.exitCode = 1;
  });
