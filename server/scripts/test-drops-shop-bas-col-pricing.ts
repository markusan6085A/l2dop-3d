/**
 * B/A/S shop equipment — Coin of Luck pricing + purchase flow.
 * npm run test:drops-shop-bas-col
 */
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import {
  addItemToBag,
  emptyInventory,
} from '../src/data/inventory.js';
import { emptyWarehouse } from '../src/data/warehouse.js';
import { COIN_OF_LUCK_ITEM_ID } from '../src/domain/dailyQuestRewards.js';
import {
  COL_EQUIPMENT_PRICE_A,
  COL_EQUIPMENT_PRICE_B,
  COL_EQUIPMENT_PRICE_S,
  colPriceForBasEquipment,
} from '../src/domain/dropsShopCoinOfLuckPricing.js';
import {
  applyDropsShopPurchase,
  buildDropsShopCatalogForClient,
} from '../src/services/dropsShopService.js';
import { GameConflictError } from '../src/services/charErrors.js';

type ShopItem = {
  shopKey: string;
  category: string;
  grade: string;
  itemId: number | null;
  priceAdena: number | null;
  priceCoinOfLuck: number | null;
  purchasable: boolean;
  armorPiece?: string;
  jewelrySubtype?: string;
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
          armorPiece: it.armorPiece,
          jewelrySubtype: it.jewelrySubtype,
        });
      }
    }
  }
  return out;
}

function findPurchasable(
  grade: string,
  category: string,
  extra?: (it: ShopItem) => boolean
): ShopItem {
  const hit = flattenClientItems().find(
    (it) =>
      it.grade === grade &&
      it.category === category &&
      it.purchasable &&
      (!extra || extra(it))
  );
  assert.ok(hit, `${grade} ${category} purchasable item must exist`);
  return hit!;
}

function assertPriceTable(): void {
  assert.equal(colPriceForBasEquipment('B', 'weapon'), 60);
  assert.equal(colPriceForBasEquipment('A', 'weapon'), 110);
  assert.equal(colPriceForBasEquipment('S', 'weapon'), 200);
  assert.equal(colPriceForBasEquipment('B', 'chest'), 30);
  assert.equal(colPriceForBasEquipment('A', 'chest'), 55);
  assert.equal(colPriceForBasEquipment('S', 'chest'), 100);

  for (const slot of Object.keys(COL_EQUIPMENT_PRICE_B) as Array<
    keyof typeof COL_EQUIPMENT_PRICE_B
  >) {
    assert.equal(colPriceForBasEquipment('B', slot), COL_EQUIPMENT_PRICE_B[slot]);
    assert.equal(colPriceForBasEquipment('A', slot), COL_EQUIPMENT_PRICE_A[slot]);
    assert.equal(colPriceForBasEquipment('S', slot), COL_EQUIPMENT_PRICE_S[slot]);
  }
}

function assertClientCatalogPricing(): void {
  const items = flattenClientItems();
  const bWeapon = findPurchasable('B', 'weapon');
  const aWeapon = findPurchasable('A', 'weapon');
  const sWeapon = findPurchasable('S', 'weapon');
  assert.equal(bWeapon.priceCoinOfLuck, 60);
  assert.equal(aWeapon.priceCoinOfLuck, 110);
  assert.equal(sWeapon.priceCoinOfLuck, 200);
  assert.equal(bWeapon.priceAdena, null);

  const bChest = findPurchasable('B', 'armor', (it) => it.armorPiece === 'torso');
  const aChest = findPurchasable('A', 'armor', (it) => it.armorPiece === 'torso');
  const sChest = findPurchasable('S', 'armor', (it) => it.armorPiece === 'torso');
  assert.equal(bChest.priceCoinOfLuck, 30);
  assert.equal(aChest.priceCoinOfLuck, 55);
  assert.equal(sChest.priceCoinOfLuck, 100);

  for (const grade of ['B', 'A', 'S'] as const) {
    const gradeItems = items.filter(
      (it) => it.grade === grade && it.category !== 'consumable' && it.purchasable
    );
    assert.ok(gradeItems.length > 0, `${grade} equipment must be purchasable`);
    for (const it of gradeItems) {
      assert.ok(
        it.priceCoinOfLuck != null && it.priceCoinOfLuck > 0,
        `${it.shopKey} must use Coin of Luck`
      );
      assert.equal(it.priceAdena, null, `${it.shopKey} must not use Adena`);
    }
  }

  for (const grade of ['D', 'C'] as const) {
    const eq = items.filter(
      (it) =>
        it.grade === grade &&
        it.category !== 'consumable' &&
        it.purchasable &&
        it.priceAdena != null
    );
    assert.ok(eq.length > 0, `${grade} equipment must stay on Adena`);
    for (const it of eq) {
      assert.equal(it.priceCoinOfLuck, null, `${it.shopKey} must not use CoL`);
    }
  }

  const scroll = items.find(
    (it) => it.category === 'consumable' && it.shopKey.includes('enchant_scroll')
  );
  if (scroll) {
    assert.equal(scroll.priceAdena, 1);
    assert.equal(scroll.priceCoinOfLuck, null);
  }
}

async function createShopUser(coinQty: number): Promise<{ userId: string; charId: string }> {
  const login = `shop_col_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  let inv = emptyInventory();
  if (coinQty > 0) {
    inv = addItemToBag(inv, COIN_OF_LUCK_ITEM_ID, coinQty);
  }
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `ShopCol${Math.floor(Math.random() * 1000)}`,
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          adena: 5_000_000n,
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
          warehouseJson: emptyWarehouse() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  assert.ok(char?.id);
  return { userId: user.id, charId: char.id };
}

async function runDbTests(): Promise<void> {
  const target = findPurchasable('B', 'weapon');
  const price = target.priceCoinOfLuck!;
  assert.equal(price, 60);

  const poorUser = await createShopUser(0);
  const richUser = await createShopUser(price + 5);
  try {
    const char = await prisma.character.findFirst({ where: { userId: poorUser.userId } });
    assert.ok(char);
    await assert.rejects(
      () => applyDropsShopPurchase(poorUser.userId, target.shopKey, char!.revision, 1),
      /drops_shop_no_coin_of_luck/
    );

    const richChar = await prisma.character.findFirst({ where: { userId: richUser.userId } });
    assert.ok(richChar);
    const adenaBefore = richChar!.adena;
    const snap = await applyDropsShopPurchase(
      richUser.userId,
      target.shopKey,
      richChar!.revision,
      1
    );
    assert.equal(snap.coinOfLuck, 5);
    assert.equal(String(snap.adena), String(adenaBefore));
    const bought = (snap.inventory.stacks || []).some(
      (s) => Number(s.itemId) === Number(target.itemId) && Number(s.qty) > 0
    );
    assert.equal(bought, true);

    const charAfter = await prisma.character.findFirst({ where: { userId: richUser.userId } });
    assert.ok(charAfter);
    const rev = charAfter!.revision;
    const [a, b] = await Promise.allSettled([
      applyDropsShopPurchase(richUser.userId, target.shopKey, rev, 1),
      applyDropsShopPurchase(richUser.userId, target.shopKey, rev, 1),
    ]);
    const statuses = [a.status, b.status].sort().join(',');
    assert.equal(statuses, 'fulfilled,rejected');
    const rejected = a.status === 'rejected' ? a.reason : b.status === 'rejected' ? b.reason : null;
    assert.ok(rejected instanceof GameConflictError);
  } finally {
    await prisma.character.deleteMany({ where: { userId: poorUser.userId } });
    await prisma.user.delete({ where: { id: poorUser.userId } });
    await prisma.character.deleteMany({ where: { userId: richUser.userId } });
    await prisma.user.delete({ where: { id: richUser.userId } });
  }
}

async function run() {
  assertPriceTable();
  assertClientCatalogPricing();

  if (!process.env.DATABASE_URL) {
    console.log('test:drops-shop-bas-col WARN: DATABASE_URL missing, DB checks skipped');
    console.log('test:drops-shop-bas-col OK (catalog/pricing only)');
    return;
  }

  await runDbTests();
  console.log('test:drops-shop-bas-col OK');
}

run()
  .catch((err) => {
    console.error('test:drops-shop-bas-col FAIL');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
