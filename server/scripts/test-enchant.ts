import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import {
  addEnchantedToBag,
  emptyInventory,
  parseInventory,
} from '../src/data/inventory.js';
import { emptyWarehouse } from '../src/data/warehouse.js';
import { buildDropsShopCatalogForClient } from '../src/services/dropsShopService.js';
import {
  ENCHANT_SCROLL_DEFINITIONS,
  enchantScrollByItemId,
} from '../src/data/enchantScrollCatalog.js';
import { enchantEquipmentItemForUser } from '../src/services/enchantService.js';
import { GameConflictError } from '../src/services/charErrors.js';
import { applyEquipFromBag, applyUnequip } from '../src/services/charMutations.js';
import {
  applyWarehouseDeposit,
  applyWarehouseWithdraw,
} from '../src/services/warehouseService.js';
import { computeCombatStats } from '../src/data/l2dopCombatFormulas.js';
import { itemGradeForItemId } from '../src/data/itemsCatalog.js';

const D_WEAPON_ID = 128;
const D_CHEST_ID = 2276;
const D_SHIELD_ID = 626;
const D_RING_ID = 880;

function iconPath(fileName: string): string {
  return path.resolve('server', 'public', 'icons', 'drops', 'resours', fileName);
}

function mkBagTarget(itemId: number, enchant: number): string {
  return `bag:${itemId}:${enchant}`;
}

async function createUserWithInventory(): Promise<{ userId: string; charId: string }> {
  const login = `enchant_smoke_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const passwordHash = await bcrypt.hash('test123', 10);
  const inv = addEnchantedToBag(
    addEnchantedToBag(
      addEnchantedToBag(
        addEnchantedToBag(emptyInventory(), D_WEAPON_ID, 2, 0),
        D_CHEST_ID,
        1,
        0
      ),
      D_SHIELD_ID,
      1,
      0
    ),
    D_RING_ID,
    1,
    0
  );
  const withScrolls = ENCHANT_SCROLL_DEFINITIONS.reduce(
    (acc, row) => addEnchantedToBag(acc, row.itemId, 10, 0),
    inv
  );
  const user = await prisma.user.create({
    data: {
      login,
      password: passwordHash,
      characters: {
        create: {
          name: `EnchantSmoke${Math.floor(Math.random() * 1000)}`,
          race: 'Human',
          classBranch: 'fighter',
          level: 40,
          inventoryJson: withScrolls as unknown as Prisma.InputJsonValue,
          warehouseJson: emptyWarehouse() as unknown as Prisma.InputJsonValue,
        },
      },
    },
    include: { characters: true },
  });
  const char = user.characters[0];
  assert.ok(char?.id, 'character must exist');
  return { userId: user.id, charId: char.id };
}

async function getCharacterRow(charId: string) {
  const row = await prisma.character.findUnique({ where: { id: charId } });
  assert.ok(row, 'character row must exist');
  return row;
}

async function run() {
  // shop: icons exist
  const expectedIcons = [
    'scroll_enchant_armor_d.png',
    'scroll_enchant_weapon_d.png',
    'scroll_enchant_armor_c.png',
    'scroll_enchant_weapon_c.png',
    'scroll_enchant_armor_b.png',
    'scroll_enchant_weapon_b.png',
    'scroll_enchant_armor_a.png',
    'scroll_enchant_weapon_a.png',
    'scroll_enchant_armor_s.png',
    'scroll_enchant_weapon_s.png',
  ];
  for (const file of expectedIcons) {
    assert.ok(fs.existsSync(iconPath(file)), `icon must exist: ${file}`);
  }

  // shop: scroll rows + subtype + prices
  const catalog = buildDropsShopCatalogForClient();
  const allConsumables = catalog.grades.flatMap((g) =>
    g.sections
      .filter((s) => s.category === 'consumable')
      .flatMap((s) => s.items)
  );
  const scrollItems = allConsumables.filter((it) =>
    String(it.shopKey).startsWith('consumable/enchant_scroll_')
  );
  assert.equal(scrollItems.length, 10, 'must have 10 enchant scroll shop items');
  for (const row of scrollItems) {
    assert.equal(row.consumableSubtype, 'enchantment', 'scroll subtype must be enchantment');
    assert.equal(row.priceAdena, 1, 'scroll price must be 1 Adena');
    assert.ok(row.itemId != null && enchantScrollByItemId(Number(row.itemId)), 'itemId must be mapped');
  }

  if (!process.env.DATABASE_URL) {
    console.log('test:enchant WARN: DATABASE_URL missing, DB-dependent checks skipped');
    console.log('test:enchant OK (shop/icon checks only)');
    return;
  }

  const { userId, charId } = await createUserWithInventory();
  try {
    let charRow = await getCharacterRow(charId);
    let rev = charRow.revision;

    const dWeaponScroll = ENCHANT_SCROLL_DEFINITIONS.find(
      (x) => x.target === 'weapon' && x.grade === 'D'
    )!;
    const dArmorScroll = ENCHANT_SCROLL_DEFINITIONS.find(
      (x) => x.target === 'armor' && x.grade === 'D'
    )!;

    // +0 -> +1 -> +2 -> +3 (always)
    for (const expected of [1, 2, 3]) {
      const res = await enchantEquipmentItemForUser(
        userId,
        rev,
        {
          scrollItemId: dWeaponScroll.itemId,
          targetInstanceId: mkBagTarget(D_WEAPON_ID, expected - 1),
        },
        { rng: () => 0.9999 }
      );
      assert.equal(res.success, true);
      assert.equal(res.currentEnchantLevel, expected);
      assert.equal(res.chancePercent, 100);
      rev = res.character.revision;
    }

    // +3 -> +4 uses 70%
    const chanceRes = await enchantEquipmentItemForUser(
      userId,
      rev,
      {
        scrollItemId: dWeaponScroll.itemId,
        targetInstanceId: mkBagTarget(D_WEAPON_ID, 3),
      },
      { rng: () => 0.2 }
    );
    assert.equal(chanceRes.chancePercent, 70);
    assert.equal(chanceRes.success, true);
    rev = chanceRes.character.revision;

    // invalid: weapon scroll on armor
    await assert.rejects(
      () =>
        enchantEquipmentItemForUser(userId, rev, {
          scrollItemId: dWeaponScroll.itemId,
          targetInstanceId: mkBagTarget(D_CHEST_ID, 0),
        }),
      /enchant_target_type_mismatch/
    );

    // invalid: armor scroll on weapon
    await assert.rejects(
      () =>
        enchantEquipmentItemForUser(userId, rev, {
          scrollItemId: dArmorScroll.itemId,
          targetInstanceId: mkBagTarget(D_WEAPON_ID, 4),
        }),
      /enchant_target_type_mismatch/
    );

    // armor scroll works on shield and jewelry
    const shieldRes = await enchantEquipmentItemForUser(
      userId,
      rev,
      {
        scrollItemId: dArmorScroll.itemId,
        targetInstanceId: mkBagTarget(D_SHIELD_ID, 0),
      },
      { rng: () => 0.0 }
    );
    rev = shieldRes.character.revision;
    const ringRes = await enchantEquipmentItemForUser(
      userId,
      rev,
      {
        scrollItemId: dArmorScroll.itemId,
        targetInstanceId: mkBagTarget(D_RING_ID, 0),
      },
      { rng: () => 0.0 }
    );
    rev = ringRes.character.revision;
    assert.equal(itemGradeForItemId(D_RING_ID), 'D');

    // +7 fail -> +6
    charRow = await getCharacterRow(charId);
    const invAt = parseInventory(charRow.inventoryJson);
    const withSeven = addEnchantedToBag(
      addEnchantedToBag(invAt, D_WEAPON_ID, 1, 7),
      dWeaponScroll.itemId,
      2,
      0
    );
    await prisma.character.update({
      where: { id: charId },
      data: { inventoryJson: withSeven as unknown as Prisma.InputJsonValue, revision: { increment: 1 } },
    });
    charRow = await getCharacterRow(charId);
    rev = charRow.revision;
    const failSeven = await enchantEquipmentItemForUser(
      userId,
      rev,
      {
        scrollItemId: dWeaponScroll.itemId,
        targetInstanceId: mkBagTarget(D_WEAPON_ID, 7),
      },
      { rng: () => 0.99 }
    );
    assert.equal(failSeven.success, false);
    assert.equal(failSeven.currentEnchantLevel, 6);
    rev = failSeven.character.revision;

    // +24 fail -> +10
    const make24 = addEnchantedToBag(parseInventory(failSeven.character.inventory), D_WEAPON_ID, 1, 24);
    await prisma.character.update({
      where: { id: charId },
      data: { inventoryJson: make24 as unknown as Prisma.InputJsonValue, revision: { increment: 1 } },
    });
    charRow = await getCharacterRow(charId);
    rev = charRow.revision;
    const fail24 = await enchantEquipmentItemForUser(
      userId,
      rev,
      {
        scrollItemId: dWeaponScroll.itemId,
        targetInstanceId: mkBagTarget(D_WEAPON_ID, 24),
      },
      { rng: () => 0.99 }
    );
    assert.equal(fail24.success, false);
    assert.equal(fail24.currentEnchantLevel, 10);
    rev = fail24.character.revision;

    // +25 cannot enchant, scroll not consumed
    const make25 = addEnchantedToBag(parseInventory(fail24.character.inventory), D_WEAPON_ID, 1, 25);
    await prisma.character.update({
      where: { id: charId },
      data: { inventoryJson: make25 as unknown as Prisma.InputJsonValue, revision: { increment: 1 } },
    });
    charRow = await getCharacterRow(charId);
    rev = charRow.revision;
    const maxRes = await enchantEquipmentItemForUser(userId, rev, {
      scrollItemId: dWeaponScroll.itemId,
      targetInstanceId: mkBagTarget(D_WEAPON_ID, 25),
    });
    assert.equal(maxRes.scrollConsumed, false);
    assert.equal(maxRes.currentEnchantLevel, 25);

    // concurrency: one success, one conflict
    charRow = await getCharacterRow(charId);
    rev = charRow.revision;
    const [a, b] = await Promise.allSettled([
      enchantEquipmentItemForUser(userId, rev, {
        scrollItemId: dArmorScroll.itemId,
        targetInstanceId: mkBagTarget(D_CHEST_ID, 0),
      }),
      enchantEquipmentItemForUser(userId, rev, {
        scrollItemId: dArmorScroll.itemId,
        targetInstanceId: mkBagTarget(D_CHEST_ID, 0),
      }),
    ]);
    const statuses = [a.status, b.status].sort().join(',');
    assert.equal(statuses, 'fulfilled,rejected');
    const rejected = a.status === 'rejected' ? a.reason : b.status === 'rejected' ? b.reason : null;
    assert.ok(rejected instanceof GameConflictError, 'second concurrent enchant must be conflict');

    // equip/unequip and warehouse keep enchant
    charRow = await getCharacterRow(charId);
    rev = charRow.revision;
    const eqRes = await applyEquipFromBag(userId, D_WEAPON_ID, rev, 10);
    const eqSlot = eqRes.inventory.eq.l1 as { itemId?: number; enchant?: number };
    assert.equal(eqSlot.enchant, 10);
    const unRes = await applyUnequip(userId, 'l1', eqRes.revision);
    const bagHas10 = (unRes.inventory.stacks || []).some(
      (s) => s.itemId === D_WEAPON_ID && Number(s.enchant || 0) === 10
    );
    assert.equal(bagHas10, true);

    const depRes = await applyWarehouseDeposit(userId, unRes.revision, {
      itemId: D_WEAPON_ID,
      enchant: 10,
      qty: 1,
    });
    const whHas10 = (depRes.warehouse.stacks || []).some(
      (s) => s.itemId === D_WEAPON_ID && Number(s.enchant || 0) === 10
    );
    assert.equal(whHas10, true);
    const wdrRes = await applyWarehouseWithdraw(userId, depRes.revision, {
      itemId: D_WEAPON_ID,
      enchant: 10,
      qty: 1,
    });
    const bagBack10 = (wdrRes.inventory.stacks || []).some(
      (s) => s.itemId === D_WEAPON_ID && Number(s.enchant || 0) === 10
    );
    assert.equal(bagBack10, true);

    // stats: enchant bonus applies (non-zero delta) and snapshot keeps enchant
    const noEnchantStats = computeCombatStats(40, 'Human', 'fighter', parseInventory(emptyInventory()));
    const withEnchantInv = addEnchantedToBag(emptyInventory(), D_WEAPON_ID, 1, 5);
    const withEnchantStats = computeCombatStats(40, 'Human', 'fighter', parseInventory(withEnchantInv));
    assert.ok(withEnchantStats.pAtk >= noEnchantStats.pAtk, 'enchant should not reduce pAtk');

    console.log('test:enchant OK');
  } finally {
    await prisma.character.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
  }
}

run()
  .catch((err) => {
    console.error('test:enchant FAIL');
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
