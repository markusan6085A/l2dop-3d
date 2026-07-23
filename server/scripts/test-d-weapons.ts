/**
 * Smoke: канонічна D-grade зброя — магазин, ITEM_CATALOG, щит, тип зброї.
 * npm run test:d-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  dGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopDWeaponDropsPatches.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
} from '../src/data/inventory.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { requiresArrowsForWeaponType } from '../src/data/weaponTypeContract.js';
import {
  D_WEAPON_BY_ITEM_ID,
  D_WEAPON_CATALOG,
  type DWeaponCanonEntry,
  type DWeaponMode,
} from '../src/data/dWeaponCatalog.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';

type OverrideRow = { itemId?: number; priceAdena?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

type ExpectedDRow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: DWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
  requiresArrows: boolean;
  excludeFromSwordBluntMastery?: boolean;
};

const EXPECTED_D_WEAPONS: readonly ExpectedDRow[] = [
  { itemId: 70, shopKey: 'weapon_d/claymore.png', nameUk: 'Клеймор D-grade.', shopNameUk: 'Claymore', mode: 'phys', weaponType: 'bigsword', blocksShield: true, atkSpd: 325, pAtk: 112, mAtk: 54, wpnCrit: 80, requiresArrows: false },
  { itemId: 86, shopKey: 'weapon_d/tomahawk.jpg', nameUk: 'Томагавк D-grade.', shopNameUk: 'Tomahawk — булава', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 51, mAtk: 32, wpnCrit: 40, requiresArrows: false },
  { itemId: 88, shopKey: 'weapon_d/weapon_morning_star.png', nameUk: 'Ранкова зірка D-grade.', shopNameUk: 'Morning Star', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 79, mAtk: 47, wpnCrit: 40, requiresArrows: false },
  { itemId: 90, shopKey: 'weapon_d/weapon_goathead_staff.png', nameUk: 'Посох козлиної голови D-grade.', shopNameUk: 'Goat Head Staff — посох', mode: 'magic', weaponType: 'bigblunt', blocksShield: true, atkSpd: 325, pAtk: 77, mAtk: 63, wpnCrit: 40, requiresArrows: false },
  { itemId: 124, shopKey: 'weapon_d/two_handed_sword.jpg', nameUk: 'Дворучний меч D-grade.', shopNameUk: 'Two-Handed Sword — двуручний меч', mode: 'phys', weaponType: 'bigsword', blocksShield: true, atkSpd: 325, pAtk: 78, mAtk: 39, wpnCrit: 80, requiresArrows: false },
  { itemId: 128, shopKey: 'weapon_d/knight_s_sword.jpg', nameUk: 'Меч лицаря D-grade.', shopNameUk: "Knight's Sword — меч", mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 51, mAtk: 32, wpnCrit: 80, requiresArrows: false },
  { itemId: 158, shopKey: 'weapon_d/weapon_tarbar.png', nameUk: 'Тарбар D-grade.', shopNameUk: 'Tarbar', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 79, mAtk: 47, wpnCrit: 40, requiresArrows: false },
  { itemId: 159, shopKey: 'weapon_d/bonebreaker.png', nameUk: 'Костолом D-grade.', shopNameUk: 'Bonebreaker', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 92, mAtk: 54, wpnCrit: 40, requiresArrows: false },
  { itemId: 187, shopKey: 'weapon_d/atuba_hammer.jpg', nameUk: 'Молот Атуби D-grade.', shopNameUk: 'Atuba Hammer — булава', mode: 'magic', weaponType: 'bigblunt', blocksShield: true, atkSpd: 325, pAtk: 90, mAtk: 72, wpnCrit: 40, requiresArrows: false },
  { itemId: 189, shopKey: 'weapon_d/weapon_life_stick.png', nameUk: 'Посох життя D-grade.', shopNameUk: 'Staff of Life — rod', mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 74, mAtk: 72, wpnCrit: 40, requiresArrows: false },
  { itemId: 225, shopKey: 'weapon_d/mithril-dagger.png', nameUk: 'Міфриловий кинжал D-grade.', shopNameUk: 'Mithril Dagger', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 80, mAtk: 54, wpnCrit: 120, requiresArrows: false },
  { itemId: 241, shopKey: 'weapon_d/shilen_knife.jpg', nameUk: 'Ніж Шілен D-grade.', shopNameUk: 'Shilen Knife — кинжал', mode: 'magic', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 45, mAtk: 52, wpnCrit: 120, requiresArrows: false },
  { itemId: 2499, shopKey: 'weapon_d/elven-long-sword.png', nameUk: 'Довгий меч ельфів D-grade.', shopNameUk: 'Elven Long Sword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 92, mAtk: 54, wpnCrit: 80, requiresArrows: false },
  { itemId: 260, shopKey: 'weapon_d/triple-edged_jamadhr.jpg', nameUk: 'Тригранний Джамадхр D-grade.', shopNameUk: 'Triple-Edged Jamadhr — кастети', mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 78, mAtk: 39, wpnCrit: 40, requiresArrows: false },
  { itemId: 261, shopKey: 'weapon_d/baguette_s_dualsword.jpg', nameUk: "Біч'Хва D-grade.", shopNameUk: "Bich'Hwa — кастети", mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 96, mAtk: 47, wpnCrit: 40, requiresArrows: false },
  { itemId: 262, shopKey: 'weapon_d/scallop_jamadhr.png', nameUk: 'Джамадхр мушлі D-grade.', shopNameUk: 'Scallop Jamadhr — кастети', mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 112, mAtk: 54, wpnCrit: 40, requiresArrows: false },
  { itemId: 277, shopKey: 'weapon_d/dark_elven_bow.jpg', nameUk: 'Лук темних ельфів D-grade.', shopNameUk: 'Dark Elven Bow — лук', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 105, mAtk: 32, wpnCrit: 120, requiresArrows: true },
  { itemId: 280, shopKey: 'weapon_d/light-crossbow.png', nameUk: 'Легкий арбалет D-grade.', shopNameUk: 'Light Crossbow', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 191, mAtk: 54, wpnCrit: 120, requiresArrows: true },
  { itemId: 293, shopKey: 'weapon_d/war_hammer.jpg', nameUk: 'Бойовий молот D-grade.', shopNameUk: 'War Hammer', mode: 'phys', weaponType: 'pole', blocksShield: true, atkSpd: 325, pAtk: 64, mAtk: 39, wpnCrit: 80, requiresArrows: false },
  { itemId: 297, shopKey: 'weapon_d/glaive.png', nameUk: 'Глефа D-grade.', shopNameUk: 'Glaive', mode: 'phys', weaponType: 'pole', blocksShield: true, atkSpd: 325, pAtk: 92, mAtk: 54, wpnCrit: 80, requiresArrows: false },
  { itemId: 317, shopKey: 'weapon_d/tome_of_blood.jpg', nameUk: 'Том крові D-grade.', shopNameUk: 'Tome of Blood — книга', mode: 'magic', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 51, mAtk: 52, wpnCrit: 80, requiresArrows: false, excludeFromSwordBluntMastery: true },
];

function shopKeyNorm(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

function expectEq<T>(label: string, actual: T, expected: T, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${String(expected)}, got ${String(actual)}`);
  }
}

function expectFalse(label: string, value: boolean, errors: string[]): void {
  if (value) errors.push(`${label}: expected false`);
}

function expectTrue(label: string, value: boolean, errors: string[]): void {
  if (!value) errors.push(`${label}: expected true`);
}

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (slotVal && typeof slotVal === 'object' && 'itemId' in slotVal) {
    const n = Number((slotVal as { itemId: unknown }).itemId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function assertCatalogMatchesExpected(
  expected: ExpectedDRow,
  entry: DWeaponCanonEntry,
  errors: string[],
): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, entry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} shopKey`, entry.shopKey, expected.shopKey, errors);
  expectEq(`catalog #${id} nameUk`, entry.nameUk, expected.nameUk, errors);
  expectEq(`catalog #${id} shopNameUk`, entry.shopNameUk, expected.shopNameUk, errors);
  expectEq(`catalog #${id} mode`, entry.mode, expected.mode, errors);
  expectEq(`catalog #${id} weaponType`, entry.weaponType, expected.weaponType, errors);
  expectEq(`catalog #${id} blocksShield`, entry.blocksShield, expected.blocksShield, errors);
  expectEq(`catalog #${id} atkSpd`, entry.atkSpd, expected.atkSpd, errors);
  expectEq(`catalog #${id} pAtk`, entry.pAtk, expected.pAtk, errors);
  expectEq(`catalog #${id} mAtk`, entry.mAtk, expected.mAtk, errors);
  expectEq(`catalog #${id} wpnCrit`, entry.wpnCrit, expected.wpnCrit, errors);
  if (expected.excludeFromSwordBluntMastery) {
    expectEq(`catalog #${id} excludeFromSwordBluntMastery`, entry.excludeFromSwordBluntMastery, true, errors);
  }
}

function assertItemCatalogMatchesExpected(expected: ExpectedDRow, errors: string[]): void {
  const id = expected.itemId;
  const catalog = ITEM_CATALOG[id];
  if (!catalog) {
    errors.push(`missing ITEM_CATALOG[${id}]`);
    return;
  }
  expectEq(`ITEM_CATALOG #${id} weaponType`, catalog.weaponType, expected.weaponType, errors);
  expectEq(`ITEM_CATALOG #${id} blocksShield`, catalog.blocksShield, expected.blocksShield, errors);
  expectEq(`ITEM_CATALOG #${id} atkSpd`, catalog.atkSpd, expected.atkSpd, errors);
  expectEq(`ITEM_CATALOG #${id} pAtk`, catalog.pAtk, expected.pAtk, errors);
  expectEq(`ITEM_CATALOG #${id} mAtk`, catalog.mAtk, expected.mAtk, errors);
  expectEq(`ITEM_CATALOG #${id} wpnCrit`, catalog.wpnCrit, expected.wpnCrit, errors);
  expectEq(
    `ITEM_CATALOG #${id} requiresArrows`,
    catalog.requiresArrows === true,
    expected.requiresArrows,
    errors,
  );
  expectEq(
    `ITEM_CATALOG #${id} requiresArrows type`,
    requiresArrowsForWeaponType(catalog.weaponType ?? 'sword'),
    expected.requiresArrows,
    errors,
  );
  if (expected.excludeFromSwordBluntMastery) {
    expectEq(`ITEM_CATALOG #${id} excludeFromSwordBluntMastery`, catalog.excludeFromSwordBluntMastery, true, errors);
  }
  expectEq(
    `ITEM_CATALOG #${id} shield slot`,
    itemBlocksShieldSlot(id, catalog.weaponType),
    expected.blocksShield,
    errors,
  );
}

function assertPreviewPatchMatchesExpected(expected: ExpectedDRow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  expectEq(`patch #${expected.itemId} nameUk`, patch.nameUk, expected.shopNameUk, errors);
  expectEq(`patch #${expected.itemId} speed`, patch.speed, expected.atkSpd, errors);
  const previewLines = dGradeWeaponDropsPreviewLines(patch);
  const previewText = previewLines.map((l) => l.valueUk).join(' ');
  if (expected.mode === 'magic') {
    expectEq(`patch #${expected.itemId} mode`, patch.mode, 'magic_book', errors);
    if (patch.mode === 'magic_book') {
      expectEq(`patch #${expected.itemId} mAtk`, patch.mAtk, expected.mAtk, errors);
    }
    if (!previewText.includes(`M.Atk: ${expected.mAtk}`)) {
      errors.push(`#${expected.itemId} shop preview missing M.Atk ${expected.mAtk}`);
    }
    if (!previewText.includes('Crit: —')) {
      errors.push(`#${expected.itemId} magic preview should show Crit: —`);
    }
  } else {
    expectEq(`patch #${expected.itemId} mode`, patch.mode, 'phys', errors);
    if (patch.mode === 'phys') {
      expectEq(`patch #${expected.itemId} pAtk`, patch.pAtk, expected.pAtk, errors);
      expectEq(`patch #${expected.itemId} crit`, patch.crit, expected.wpnCrit, errors);
    }
    if (!previewText.includes(`P.Atk: ${expected.pAtk}`)) {
      errors.push(`#${expected.itemId} shop preview missing P.Atk ${expected.pAtk}`);
    }
    if (!previewText.includes(`Crit: ${expected.wpnCrit}`)) {
      errors.push(`#${expected.itemId} shop preview missing Crit ${expected.wpnCrit}`);
    }
  }
}

function main(): void {
  const errors: string[] = [];

  if (D_WEAPON_CATALOG.length !== 21) {
    errors.push(`D_WEAPON_CATALOG length: expected 21, got ${D_WEAPON_CATALOG.length}`);
  }
  if (EXPECTED_D_WEAPONS.length !== 21) {
    errors.push(`EXPECTED_D_WEAPONS length: expected 21, got ${EXPECTED_D_WEAPONS.length}`);
  }

  const ids = D_WEAPON_CATALOG.map((e) => e.itemId);
  if (new Set(ids).size !== ids.length) {
    errors.push('D_WEAPON_CATALOG has duplicate itemId values');
  }

  const shopKeys = D_WEAPON_CATALOG.map((e) => shopKeyNorm(e.shopKey));
  if (new Set(shopKeys).size !== shopKeys.length) {
    errors.push('D_WEAPON_CATALOG has duplicate shopKey values');
  }
  if (shopKeys.includes('weapon_d/atuba-hammer.png')) {
    errors.push('atuba-hammer.png must not be a separate catalog item');
  }

  const catalogById = new Map(D_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  const runtimeOverrides = loadDropsShopOverrides();

  for (const expected of EXPECTED_D_WEAPONS) {
    const entry = catalogById.get(expected.itemId);
    if (!entry) {
      errors.push(`D_WEAPON_CATALOG missing itemId ${expected.itemId}`);
      continue;
    }
    assertCatalogMatchesExpected(expected, entry, errors);

    const override = overrides[expected.shopKey];
    const overrideItemId =
      override && typeof override.itemId === 'number' ? override.itemId : null;
    expectEq(
      `shopKey ${expected.shopKey} → itemId (json)`,
      overrideItemId,
      expected.itemId,
      errors,
    );

    const runtime = runtimeOverrides[expected.shopKey] ?? runtimeOverrides[shopKeyNorm(expected.shopKey)];
    if (!runtime || runtime.itemId !== expected.itemId) {
      errors.push(`runtime override missing/wrong for ${expected.shopKey}`);
    }

    assertItemCatalogMatchesExpected(expected, errors);
    assertPreviewPatchMatchesExpected(expected, errors);
  }

  // Regression spot checks
  expectEq('#261 BichHwa fist', ITEM_CATALOG[261]?.weaponType, 'fist', errors);
  expectEq('#261 not dual', ITEM_CATALOG[261]?.weaponType !== 'dual', true, errors);
  expectEq('#293 War Hammer pole', ITEM_CATALOG[293]?.weaponType, 'pole', errors);
  expectEq('#293 not bigblunt', ITEM_CATALOG[293]?.weaponType !== 'bigblunt', true, errors);
  expectEq('#280 Light Crossbow bow', ITEM_CATALOG[280]?.weaponType, 'bow', errors);
  expectTrue('#280 requires arrows', ITEM_CATALOG[280]?.requiresArrows === true, errors);
  expectEq('#317 Tome shield allowed', itemBlocksShieldSlot(317, 'sword'), false, errors);
  expectEq('#317 exclude mastery', ITEM_CATALOG[317]?.excludeFromSwordBluntMastery, true, errors);
  expectEq('#90 Goat blocks shield', itemBlocksShieldSlot(90, 'bigblunt'), true, errors);
  expectEq('#187 Atuba blocks shield', itemBlocksShieldSlot(187, 'bigblunt'), true, errors);
  expectEq('#189 Staff of Life shield', itemBlocksShieldSlot(189, 'blunt'), false, errors);

  // Shield equip: 1H keeps shield
  let inv1h = emptyInventory();
  inv1h = addItemToBag(inv1h, 628, 1);
  inv1h = addItemToBag(inv1h, 128, 1);
  inv1h = equipFromBag(inv1h, 628, 0);
  inv1h = equipFromBag(inv1h, 128, 0);
  expectEq('Knight equip l1', eqItemId(inv1h.eq.l1), 128, errors);
  expectEq('Knight keeps shield l2', eqItemId(inv1h.eq.l2), 628, errors);

  // 2H clears shield
  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, 628, 1);
  inv2h = addItemToBag(inv2h, 124, 1);
  inv2h = equipFromBag(inv2h, 628, 0);
  inv2h = equipFromBag(inv2h, 124, 0);
  expectEq('Two-Handed equip l1', eqItemId(inv2h.eq.l1), 124, errors);
  expectEq('Two-Handed clears l2', eqItemId(inv2h.eq.l2), null, errors);
  expectTrue('Two-Handed returns shield to bag', inv2h.stacks.some((s) => s.itemId === 628), errors);

  // Wrong Baguette icon still present (TODO asset)
  const bich = D_WEAPON_BY_ITEM_ID.get(261);
  if (!bich?.shopKey.includes('baguette_s_dualsword.jpg')) {
    errors.push('BichHwa still uses baguette_s_dualsword.jpg shopKey until icon replaced');
  }

  if (errors.length > 0) {
    console.error('D weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`D weapons smoke OK (${D_WEAPON_CATALOG.length} items)`);
}

main();
