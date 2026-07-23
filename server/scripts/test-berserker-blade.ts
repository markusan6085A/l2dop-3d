/**
 * Berserker Blade (C-grade bigsword) — shop, equip, pricing.
 * npm run test:berserker-blade
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { config } from 'dotenv';
import { prisma } from '../src/lib/prisma.js';
import { buildApp } from '../src/app.js';
import { signAccessToken } from '../src/lib/jwt.js';
import {
  addItemToBag,
  countBagQty,
  emptyInventory,
  equipFromBag,
  parseInventory,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { C_WEAPON_BY_ITEM_ID } from '../src/data/cWeaponCatalog.js';
import { DROPS_SHOP_CATALOG } from '../src/data/dropsShopCatalog.generated.js';
import { resolveDropsShopWeaponSubtype } from '../src/domain/dropsShopWeaponSubtype.js';
import { applyCGradeWeaponGmShopPrice } from '../src/domain/dropsShopPurchasePrice.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { gmShopGradeForWeaponItemId } from '../src/data/l2dopItemGradeRank.js';
import { applyDropsShopPurchase } from '../src/services/dropsShopService.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { resolveL2dopItemIconFilePath } from '../src/services/l2dopItemIconPath.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
config({ path: path.join(__dirname, '../.env') });

const ITEM_ID = 5286;
const SHOP_KEY = 'weapon_c/berserker_blade.png';
const SHOP_PRICE = 865_588;
const ICON_PATH = '/icons/drops/weapon_c/berserker_blade.png';

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

assert.equal(C_WEAPON_BY_ITEM_ID.get(ITEM_ID)?.itemId, ITEM_ID);
assert.equal(C_WEAPON_BY_ITEM_ID.get(ITEM_ID)?.shopKey, SHOP_KEY);
assert.equal(C_WEAPON_BY_ITEM_ID.get(ITEM_ID)?.shopPriceAdena, SHOP_PRICE);
ok('catalog entry canonical');

const allIds = Object.keys(ITEM_CATALOG).map(Number);
assert.equal(allIds.filter((id) => id === ITEM_ID).length, 1);
ok('itemId 5286 unique in ITEM_CATALOG');

const iconFile = path.join(repoRoot, 'server/public', ICON_PATH.replace(/^\//, ''));
assert.ok(fs.existsSync(iconFile), `icon exists: ${ICON_PATH}`);
assert.ok(resolveL2dopItemIconFilePath(ITEM_ID));
ok('icon berserker_blade.png exists');

const meta = ITEM_CATALOG[ITEM_ID]!;
assert.equal(meta.pAtk, 190);
assert.equal(meta.mAtk, 83);
assert.equal(meta.weaponType, 'bigsword');
assert.equal(meta.blocksShield, true);
assert.equal(meta.atkSpd, 325);
ok('stats and bigsword type');

assert.equal(gmShopGradeForWeaponItemId(ITEM_ID), 'C');
ok('grade C');

const shopRow = DROPS_SHOP_CATALOG.find((r) => r.shopKey === SHOP_KEY);
assert.ok(shopRow, 'shop row present');
assert.equal(shopRow!.grade, 'C');
assert.equal(shopRow!.category, 'weapon');
const subtype = resolveDropsShopWeaponSubtype(
  shopRow!,
  SHOP_KEY.toLowerCase(),
  meta,
  'Berserker Blade',
);
assert.equal(subtype, 'bigsword');
ok('C-grade weapon shop / bigsword subtype');

const priced = applyCGradeWeaponGmShopPrice(shopRow!, {
  itemId: ITEM_ID,
  priceAdena: SHOP_PRICE,
});
assert.equal(priced.priceAdena, SHOP_PRICE);
ok('shop price 865588');

assert.equal(shopRow!.iconUrl, ICON_PATH);
ok('shop iconUrl uses png path');

// equip / shield conflict
let inv = emptyInventory();
inv = addItemToBag(inv, 628, 1);
inv = addItemToBag(inv, ITEM_ID, 1);
inv = equipFromBag(inv, 628, 0);
inv = equipFromBag(inv, ITEM_ID, 0);
assert.equal(inv.eq.l1, ITEM_ID);
assert.equal(inv.eq.l2, undefined);
assert.ok(inv.stacks.some((s) => s.itemId === 628));
assert.ok(itemBlocksShieldSlot(ITEM_ID, meta.weaponType));
ok('2H clears shield on equip');

inv = emptyInventory();
inv = addItemToBag(inv, ITEM_ID, 1);
inv = equipFromBag(inv, ITEM_ID, 0);
const combatEquipped = computeCombatStats(40, 'Human', 'fighter', inv, {});
assert.ok(combatEquipped.pAtk >= 190);
inv = emptyInventory();
const combatBare = computeCombatStats(40, 'Human', 'fighter', inv, {});
assert.ok(combatEquipped.pAtk > combatBare.pAtk);
ok('equip applies P.Atk');

async function dbAvailable(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

async function runDbTests(): Promise<void> {
  if (!(await dbAvailable())) {
    console.log('  (skip DB purchase tests — PostgreSQL unavailable)');
    return;
  }

  const login = `bb_${Date.now()}`;
  let user;
  try {
    user = await prisma.user.create({
    data: {
      login,
      password: await bcrypt.hash('test', 10),
      characters: {
        create: {
          name: `BB${Math.floor(Math.random() * 10000)}`,
          adena: BigInt(SHOP_PRICE - 1),
          inventoryJson: emptyInventory() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
    });
  } catch (err) {
    const code = err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';
    if (code === 'P2022') {
      console.log('  (skip DB purchase tests — schema drift, run prisma migrate deploy)');
      return;
    }
    throw err;
  }
  const char = user.characters[0]!;
  const token = signAccessToken(user.id);

  try {
    await assert.rejects(
      () => applyDropsShopPurchase(user.id, SHOP_KEY, char.revision),
      (e: unknown) => e instanceof Error && e.message === 'drops_shop_no_adena',
    );
    ok('insufficient adena — no changes');

    await prisma.character.update({
      where: { id: char.id },
      data: { adena: BigInt(SHOP_PRICE) },
    });
    const ready = await prisma.character.findUniqueOrThrow({ where: { id: char.id } });
    const snap = await applyDropsShopPurchase(user.id, SHOP_KEY, ready.revision);
    assert.equal(countBagQty(parseInventory(snap.inventory), ITEM_ID), 1);
    assert.equal(BigInt(snap.adena), 0n);
    ok('purchase adds 1 weapon and spends 865588');

    const app = await buildApp();
    await app.ready();
    const conflict = await app.inject({
      method: 'POST',
      url: '/game/drops-shop/buy',
      headers: { authorization: `Bearer ${token}` },
      payload: { shopKey: SHOP_KEY, expectedRevision: ready.revision },
    });
    assert.equal(conflict.statusCode, 409);
    await app.close();
    ok('409 on stale expectedRevision');

    const after = await prisma.character.findUniqueOrThrow({ where: { id: char.id } });
    assert.equal(countBagQty(parseInventory(after.inventoryJson), ITEM_ID), 1);
    ok('conflict did not duplicate item');
  } finally {
    await prisma.character.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function main(): Promise<void> {
  await runDbTests();
  console.log('\nBerserker Blade tests OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
