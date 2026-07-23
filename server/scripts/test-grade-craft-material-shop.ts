/**
 * Gemstone / Crystal D–S у магазині за Adena.
 * npm run test:grade-craft-material-shop
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import {
  GRADE_CRAFT_MATERIAL_CATALOG,
  GRADE_CRAFT_MATERIAL_BY_ITEM_ID,
  GEMSTONE_D_ITEM_ID,
  GEMSTONE_A_ITEM_ID,
  GEMSTONE_S_ITEM_ID,
  CRYSTAL_D_ITEM_ID,
  CRYSTAL_S_ITEM_ID,
  gradeCraftMaterialShopKey,
} from '../src/data/gradeCraftMaterialsCatalog.js';
import { DROPS_SHOP_RESOURCE_ROWS } from '../src/data/dropsShopResourcesCatalog.js';
import {
  ITEM_CATALOG,
  itemInventoryTabHintsForClient,
} from '../src/data/itemsCatalog.js';
import { resolveEquipSlotKey } from '../src/data/inventory.js';
import {
  addItemToBag,
  countBagQty,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import { emptyWarehouse } from '../src/data/warehouse.js';
import {
  applyDropsShopPurchase,
  buildDropsShopCatalogForClient,
  clearDropsShopOverridesCache,
} from '../src/services/dropsShopService.js';
import { getMammonMerchantShopCategories } from '../src/data/mammonMerchantShopCatalog.js';
import { BASIC_RESOURCE_ITEM_IDS } from '../src/data/basicResourceCatalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });
const repoRoot = path.resolve(__dirname, '../..');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

type ShopItem = {
  shopKey: string;
  category: string;
  grade: string;
  itemId: number | null;
  priceAdena: number | null;
  priceCoinOfLuck: number | null;
  purchasable: boolean;
  consumableSubtype?: string;
};

function flattenClientItems(): ShopItem[] {
  const out: ShopItem[] = [];
  const client = buildDropsShopCatalogForClient();
  for (const g of client.grades) {
    for (const s of g.sections) {
      for (const it of s.items) {
        out.push({
          shopKey: it.shopKey,
          category: s.category,
          grade: g.grade,
          itemId: it.itemId,
          priceAdena: it.priceAdena,
          priceCoinOfLuck: it.priceCoinOfLuck,
          purchasable: it.purchasable,
          consumableSubtype: it.consumableSubtype,
        });
      }
    }
  }
  return out;
}

function findShopItem(shopKey: string): ShopItem {
  const hit = flattenClientItems().find((it) => it.shopKey === shopKey);
  assert.ok(hit, `shop item missing: ${shopKey}`);
  return hit!;
}

clearDropsShopOverridesCache();

// 1–4 catalog
assert.equal(GRADE_CRAFT_MATERIAL_CATALOG.length, 10);
ok('catalog contains exactly 10 materials');

assert.equal(GEMSTONE_D_ITEM_ID, 2130);
assert.equal(GEMSTONE_S_ITEM_ID, 2134);
assert.equal(CRYSTAL_D_ITEM_ID, 1458);
assert.equal(CRYSTAL_S_ITEM_ID, 1462);
ok('itemId ranges for Gemstone and Crystal');

const itemIds = GRADE_CRAFT_MATERIAL_CATALOG.map((r) => r.itemId);
assert.equal(new Set(itemIds).size, 10);
ok('all itemId unique');

const shopKeys = GRADE_CRAFT_MATERIAL_CATALOG.map((r) =>
  gradeCraftMaterialShopKey(r.code),
);
assert.equal(new Set(shopKeys).size, 10);
ok('all shopKey unique');

// 6 icons
for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
  const iconPath = path.join(
    repoRoot,
    'server/public',
    row.iconUrl.replace(/^\//, '').replace(/\//g, path.sep),
  );
  assert.equal(fs.existsSync(iconPath), true, `icon missing: ${row.iconUrl}`);
}
ok('all icon files exist');

// 7–8 inventory
const tabs = itemInventoryTabHintsForClient();
for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
  assert.equal(row.stackable, true);
  assert.ok(ITEM_CATALOG[row.itemId], `ITEM_CATALOG missing ${row.code}`);
  assert.equal(tabs[row.itemId], 'resource', `${row.code} tab`);
  assert.equal(resolveEquipSlotKey(row.itemId, {}), null, `${row.code} not equippable`);
}
ok('stackable, resource tab, not equippable');

// 9–10 adena only
for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
  const shop = findShopItem(gradeCraftMaterialShopKey(row.code));
  assert.equal(shop.purchasable, true, shop.shopKey);
  assert.equal(shop.priceAdena, Number(row.priceAdena), shop.shopKey);
  assert.equal(shop.priceCoinOfLuck, null, shop.shopKey);
}
ok('all sold for Adena only');

// 11 grade filter
for (const grade of ['D', 'C', 'B', 'A', 'S'] as const) {
  const inGrade = flattenClientItems().filter(
    (it) =>
      it.category === 'consumable' &&
      it.consumableSubtype === 'resources' &&
      it.grade === grade &&
      it.shopKey.startsWith('consumable/resource_gemstone_'),
  );
  assert.equal(inGrade.length, 1, `one gemstone in grade ${grade}`);
  const crystals = flattenClientItems().filter(
    (it) =>
      it.category === 'consumable' &&
      it.consumableSubtype === 'resources' &&
      it.grade === grade &&
      it.shopKey.startsWith('consumable/resource_crystal_'),
  );
  assert.equal(crystals.length, 1, `one crystal in grade ${grade}`);
}
ok('D/C/B/A/S grade filtering correct');

// 12 consumable subtype
for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
  const shop = findShopItem(gradeCraftMaterialShopKey(row.code));
  assert.equal(shop.consumableSubtype, 'resources', shop.shopKey);
  assert.equal(shop.category, 'consumable');
}
ok('consumable subtype resources');

// 13–14 pricing math
assert.equal(94 * 30000, 2_820_000);
assert.equal(225 * 15000, 3_375_000);
assert.equal(2_820_000 + 3_375_000, 6_195_000);
const gemA = findShopItem('consumable/resource_gemstone_a');
const cryA = findShopItem('consumable/resource_crystal_a');
assert.equal(gemA.priceAdena! * 94, 2_820_000);
assert.equal(cryA.priceAdena! * 225, 3_375_000);
ok('bulk price examples ×94 and ×225');

// 23 legacy NG resources preserved
const legacyKeys = [
  'consumable/resource_soul_ore',
  'consumable/resource_spirit_ore',
  'consumable/resource_fishing_lure',
];
for (const key of legacyKeys) {
  assert.ok(
    DROPS_SHOP_RESOURCE_ROWS.some((r) => r.shopKey === key),
    `${key} in resource rows`,
  );
  assert.ok(findShopItem(key).purchasable, `${key} purchasable`);
}
ok('Soul Ore, Spirit Ore, Наживка preserved');

// 24 client catalog rows
const craftRows = DROPS_SHOP_RESOURCE_ROWS.filter((r) =>
  r.shopKey.startsWith('consumable/resource_gemstone_') ||
  r.shopKey.startsWith('consumable/resource_crystal_'),
);
assert.equal(craftRows.length, 10);
ok('resource catalog contains 10 craft material rows');

// 20 Mammon no gemstones
const mammonCats = getMammonMerchantShopCategories();
assert.equal(
  mammonCats.some((c) => c.categoryId === 'gemstones'),
  false,
  'no gemstones category',
);
for (const cat of mammonCats) {
  for (const item of cat.items) {
    assert.equal(
      GRADE_CRAFT_MATERIAL_BY_ITEM_ID.has(item.itemId),
      false,
      `Mammon must not sell craft material ${item.itemId}`,
    );
  }
}
ok('Mammon no longer sells Gemstone D–S');

// 22 no collision with basic resources
for (const id of itemIds) {
  assert.equal(
    BASIC_RESOURCE_ITEM_IDS.includes(id),
    false,
    `collision with basic resource ${id}`,
  );
}
ok('no itemId collision with basic resources');

async function createAdenaUser(adena: bigint): Promise<{
  userId: string;
  revision: number;
}> {
  const login = `gcm_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `Gcm${Math.floor(Math.random() * 1000)}`,
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          adena,
          inventoryJson: emptyInventory() as unknown as Prisma.InputJsonValue,
          warehouseJson: emptyWarehouse() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const ch = user.characters[0]!;
  return { userId: user.id, revision: ch.revision };
}

async function runPurchaseTests(): Promise<void> {
  // 15 stack merge (pure, без БД)
  let inv = emptyInventory();
  inv = addItemToBag(inv, GEMSTONE_A_ITEM_ID, 40);
  inv = addItemToBag(inv, GEMSTONE_A_ITEM_ID, 54);
  assert.equal(countBagQty(inv, GEMSTONE_A_ITEM_ID), 94);
  ok('purchase stack merge by itemId (40+54=94)');

  // 21 старі Gemstone в інвентарі
  inv = addItemToBag(emptyInventory(), GEMSTONE_D_ITEM_ID, 77);
  assert.equal(countBagQty(inv, GEMSTONE_D_ITEM_ID), 77);
  ok('legacy Gemstone stacks remain valid in inventory');

  if (!process.env.DATABASE_URL) {
    console.log('  ~ purchase DB tests skipped (DATABASE_URL not set)');
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.log('  ~ purchase DB tests skipped (database unreachable)');
    return;
  }

  const rich = await createAdenaUser(10_000_000n);
  const poor = await createAdenaUser(100n);
  try {
    const snap1 = await applyDropsShopPurchase(
      rich.userId,
      'consumable/resource_gemstone_a',
      rich.revision,
      40,
    );
    const snap2 = await applyDropsShopPurchase(
      rich.userId,
      'consumable/resource_gemstone_a',
      snap1.revision,
      54,
    );
    assert.equal(countBagQty(parseInventory(snap2.inventory), GEMSTONE_A_ITEM_ID), 94);
    ok('applyDropsShopPurchase merges stack via DB');

    await assert.rejects(
      () =>
        applyDropsShopPurchase(
          poor.userId,
          'consumable/resource_gemstone_a',
          poor.revision,
          1,
        ),
      /drops_shop_no_adena/,
    );
    ok('insufficient Adena blocks purchase');

    await assert.rejects(
      () =>
        applyDropsShopPurchase(
          rich.userId,
          'consumable/resource_crystal_a',
          snap2.revision,
          1.5 as unknown as number,
        ),
      /drops_shop_bad_qty/,
    );
    ok('fractional quantity blocked');

    await assert.rejects(
      () =>
        applyDropsShopPurchase(
          rich.userId,
          'consumable/resource_crystal_a',
          snap2.revision,
          -3,
        ),
      /drops_shop_bad_qty/,
    );
    ok('negative quantity blocked');

    await assert.rejects(
      () =>
        applyDropsShopPurchase(
          rich.userId,
          'consumable/resource_gemstone_s',
          snap2.revision,
          9999,
        ),
      /drops_shop_no_adena/,
    );
    ok('overflow purchase blocked by insufficient Adena');
  } finally {
    await prisma.user.deleteMany({
      where: { id: { in: [rich.userId, poor.userId] } },
    });
  }
}

async function main(): Promise<void> {
  await runPurchaseTests();
  console.log('\ntest-grade-craft-material-shop: OK');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
