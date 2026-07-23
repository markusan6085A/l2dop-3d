/**
 * Smoke: канонічна C-grade зброя — магазин, ITEM_CATALOG, щит, mastery, ціни.
 * npm run test:c-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  cGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopCWeaponDropsPatches.js';
import { assertWeaponShopPreviewLines } from './lib/weaponShopPreviewTestCore.js';
import {
  C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
  ITEM_CATALOG,
} from '../src/data/itemsCatalog.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
} from '../src/data/inventory.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { requiresArrowsForWeaponType } from '../src/data/weaponTypeContract.js';
import { swordBluntMasteryApplies } from '../src/data/swordBluntMasteryTables.js';
import {
  C_WEAPON_BY_ITEM_ID,
  C_WEAPON_CATALOG,
  type CWeaponCanonEntry,
  type CWeaponCanonSource,
  type CWeaponMode,
} from '../src/data/cWeaponCatalog.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';

type OverrideRow = { itemId?: number; priceAdena?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

/** Поточні авторські ціни з dropsShopOverrides — не змінювати кодом. */
const EXPECTED_PRICES: Record<string, number> = Object.fromEntries(
  C_WEAPON_CATALOG.map((e) => {
    const row = overrides[e.shopKey];
    return [e.shopKey, row?.priceAdena ?? -1];
  }),
);

type ExpectedCRow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  canonSource: CWeaponCanonSource;
  mode: CWeaponMode;
  weaponType: WeaponKindForEnchant;
  masteryFamily: WeaponKindForEnchant | null;
  blocksShield: boolean;
  requiresArrows: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
};

const EXPECTED_C_WEAPONS: readonly ExpectedCRow[] = [
  { itemId: 84, shopKey: 'weapon_c/homunkulus_s_sword.jpg', nameUk: 'Меч гомункула C-grade.', shopNameUk: "Homunkulus's Sword", canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 111, mAtk: 101, wpnCrit: 80 },
  { itemId: 89, shopKey: 'weapon_c/big_hammer.jpg', nameUk: 'Великий молот C-grade.', shopNameUk: 'Big Hammer', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 107, mAtk: 61, wpnCrit: 40 },
  { itemId: 135, shopKey: 'weapon_c/samurai_longsword.jpg', nameUk: 'Довгий меч самурая C-grade.', shopNameUk: 'Samurai Longsword', canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 156, mAtk: 83, wpnCrit: 80 },
  { itemId: 160, shopKey: 'weapon_c/battle_axe.jpg', nameUk: 'Бойова сокира C-grade.', shopNameUk: 'Battle Axe', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 107, mAtk: 61, wpnCrit: 40 },
  { itemId: 162, shopKey: 'weapon_c/war_axe.jpg', nameUk: 'Військова сокира C-grade.', shopNameUk: 'War Axe', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 139, mAtk: 76, wpnCrit: 40 },
  { itemId: 191, shopKey: 'weapon_c/heavy_doom_hammer.jpg', nameUk: 'Важкий молот загибелі C-grade.', shopNameUk: 'Heavy Doom Hammer', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 103, mAtk: 81, wpnCrit: 40 },
  { itemId: 194, shopKey: 'weapon_c/heavy_doom_axe.jpg', nameUk: 'Важка сокира загибелі C-grade.', shopNameUk: 'Heavy Doom Axe', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 103, mAtk: 81, wpnCrit: 40 },
  { itemId: 206, shopKey: 'weapon_c/demon_s_staff.jpg', nameUk: 'Посох демона C-grade.', shopNameUk: "Demon's Staff", canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 152, mAtk: 111, wpnCrit: 40 },
  { itemId: 228, shopKey: 'weapon_c/crystal_dagger.jpg', nameUk: 'Кришталевий кинжал C-grade.', shopNameUk: 'Crystal Dagger', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 136, mAtk: 83, wpnCrit: 120 },
  { itemId: 233, shopKey: 'weapon_c/dark_screamer.jpg', nameUk: 'Темний викрик C-grade.', shopNameUk: 'Dark Screamer', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 122, mAtk: 76, wpnCrit: 120 },
  { itemId: 265, shopKey: 'weapon_c/fisted_blade.jpg', nameUk: 'Клинок-рукавиця C-grade.', shopNameUk: 'Fisted Blade', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 169, mAtk: 76, wpnCrit: 40 },
  { itemId: 266, shopKey: 'weapon_c/great_pata.jpg', nameUk: 'Велика пата C-grade.', shopNameUk: 'Great Pata', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 190, mAtk: 83, wpnCrit: 40 },
  { itemId: 283, shopKey: 'weapon_c/akat_long_bow.jpg', nameUk: 'Довгий лук Акат C-grade.', shopNameUk: 'Akat Long Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 227, pAtk: 316, mAtk: 84, wpnCrit: 120 },
  { itemId: 286, shopKey: 'weapon_c/eminence_bow.jpg', nameUk: 'Лук Еміненс C-grade.', shopNameUk: 'Eminence Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 293, pAtk: 323, mAtk: 83, wpnCrit: 120 },
  { itemId: 299, shopKey: 'weapon_c/orcish_poleaxe.jpg', nameUk: 'Оркська алебарда C-grade.', shopNameUk: 'Orcish Poleaxe', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 156, mAtk: 83, wpnCrit: 80 },
  { itemId: 301, shopKey: 'weapon_c/scorpion.jpg', nameUk: 'Скорпіон C-grade.', shopNameUk: 'Scorpion', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 144, mAtk: 78, wpnCrit: 80 },
  { itemId: 303, shopKey: 'weapon_c/widow_maker.jpg', nameUk: 'Творець вдови C-grade.', shopNameUk: 'Widow Maker', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 144, mAtk: 78, wpnCrit: 80 },
  { itemId: 326, shopKey: 'weapon_c/heathens_book.jpg', nameUk: 'Книга язичника C-grade.', shopNameUk: "Heathen's Book", canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: null, blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 111, mAtk: 101, wpnCrit: 80 },
  { itemId: 2503, shopKey: 'weapon_c/yaksa_mace.jpg', nameUk: 'Булава Якса C-grade.', shopNameUk: 'Yaksa Mace', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 156, mAtk: 83, wpnCrit: 40 },
  { itemId: 4233, shopKey: 'weapon_c/knuckle_duster.jpg', nameUk: 'Кастет C-grade.', shopNameUk: 'Knuckle Duster', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 148, mAtk: 68, wpnCrit: 40 },
  { itemId: 5286, shopKey: 'weapon_c/berserker_blade.png', nameUk: 'Клинок Берсерка', shopNameUk: 'Berserker Blade', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 190, mAtk: 83, wpnCrit: 80 },
  { itemId: 7882, shopKey: 'weapon_c/pa_agrian_sword.jpg', nameUk: 'Меч Паагріан C-grade.', shopNameUk: "Pa'agrian Sword", canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 169, mAtk: 76, wpnCrit: 80 },
  { itemId: 7888, shopKey: 'weapon_c/ecliptic_sword.jpg', nameUk: 'Екліптичний меч C-grade.', shopNameUk: 'Ecliptic Sword', canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 125, mAtk: 111, wpnCrit: 80 },
  { itemId: 7897, shopKey: 'weapon_c/dwarven_hammer.jpg', nameUk: 'Дворфський молот C-grade.', shopNameUk: 'Dwarven Hammer', canonSource: 'interlude', mode: 'phys', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 190, mAtk: 83, wpnCrit: 40 },
  { itemId: 900224, shopKey: 'weapon_c/baguette_s_dualsword.jpg', nameUk: 'Дворучний меч Багет C-grade.', shopNameUk: "Baguette's Dualsword", canonSource: 'custom', mode: 'phys', weaponType: 'dual', masteryFamily: 'dual', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 222, mAtk: 38, wpnCrit: 80 },
  { itemId: 900225, shopKey: 'weapon_c/apprentices_spellbook.jpg', nameUk: 'Заклинання учня C-grade. Магічна зброя.', shopNameUk: "Apprentice's Spellbook", canonSource: 'custom', mode: 'magic', weaponType: 'sword', masteryFamily: null, blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 9, mAtk: 95, wpnCrit: 80 },
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
  expected: ExpectedCRow,
  entry: CWeaponCanonEntry,
  errors: string[],
): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, entry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} shopKey`, entry.shopKey, expected.shopKey, errors);
  expectEq(`catalog #${id} nameUk`, entry.nameUk, expected.nameUk, errors);
  expectEq(`catalog #${id} shopNameUk`, entry.shopNameUk, expected.shopNameUk, errors);
  expectEq(`catalog #${id} canonSource`, entry.canonSource, expected.canonSource, errors);
  expectEq(`catalog #${id} mode`, entry.mode, expected.mode, errors);
  expectEq(`catalog #${id} weaponType`, entry.weaponType, expected.weaponType, errors);
  expectEq(`catalog #${id} masteryFamily`, entry.masteryFamily, expected.masteryFamily, errors);
  expectEq(`catalog #${id} blocksShield`, entry.blocksShield, expected.blocksShield, errors);
  expectEq(`catalog #${id} atkSpd`, entry.atkSpd, expected.atkSpd, errors);
  expectEq(`catalog #${id} pAtk`, entry.pAtk, expected.pAtk, errors);
  expectEq(`catalog #${id} mAtk`, entry.mAtk, expected.mAtk, errors);
  expectEq(`catalog #${id} wpnCrit`, entry.wpnCrit, expected.wpnCrit, errors);
}

function assertItemCatalogMatchesExpected(expected: ExpectedCRow, errors: string[]): void {
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
    `ITEM_CATALOG #${id} masteryFamily`,
    catalog.masteryFamily ?? null,
    expected.masteryFamily,
    errors,
  );
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
  expectEq(
    `ITEM_CATALOG #${id} shield slot`,
    itemBlocksShieldSlot(id, catalog.weaponType),
    expected.blocksShield,
    errors,
  );
  if (catalog.rCrit != null && catalog.rCrit !== 0) {
    errors.push(`#${id} unexpected rCrit: ${catalog.rCrit}`);
  }
}

function assertPreviewPatchMatchesExpected(expected: ExpectedCRow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  expectEq(`patch #${expected.itemId} nameUk`, patch.nameUk, expected.shopNameUk, errors);
  expectEq(`patch #${expected.itemId} pAtk`, patch.pAtk, expected.pAtk, errors);
  expectEq(`patch #${expected.itemId} mAtk`, patch.mAtk, expected.mAtk, errors);
  expectEq(`patch #${expected.itemId} speed`, patch.speed, expected.atkSpd, errors);
  expectEq(`patch #${expected.itemId} crit`, patch.crit, expected.wpnCrit, errors);
  assertWeaponShopPreviewLines(
    cGradeWeaponDropsPreviewLines(patch),
    {
      pAtk: expected.pAtk,
      mAtk: expected.mAtk,
      atkSpd: expected.atkSpd,
      wpnCrit: expected.wpnCrit,
    },
    expected.itemId,
    errors,
  );
}

function main(): void {
  const errors: string[] = [];

  if (C_WEAPON_CATALOG.length !== 26) {
    errors.push(`C_WEAPON_CATALOG length: expected 26, got ${C_WEAPON_CATALOG.length}`);
  }
  if (EXPECTED_C_WEAPONS.length !== 26) {
    errors.push(`EXPECTED_C_WEAPONS length: expected 26, got ${EXPECTED_C_WEAPONS.length}`);
  }

  const canonicalCount = C_WEAPON_CATALOG.filter((e) => e.canonSource === 'interlude').length;
  const customCount = C_WEAPON_CATALOG.filter((e) => e.canonSource === 'custom').length;
  expectEq('canonical Interlude count', canonicalCount, 24, errors);
  expectEq('custom count', customCount, 2, errors);

  const ids = C_WEAPON_CATALOG.map((e) => e.itemId);
  if (new Set(ids).size !== ids.length) {
    errors.push('C_WEAPON_CATALOG has duplicate itemId values');
  }

  const shopKeys = C_WEAPON_CATALOG.map((e) => shopKeyNorm(e.shopKey));
  if (new Set(shopKeys).size !== shopKeys.length) {
    errors.push('C_WEAPON_CATALOG has duplicate shopKey values');
  }

  const catalogById = new Map(C_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  const runtimeOverrides = loadDropsShopOverrides();

  for (const expected of EXPECTED_C_WEAPONS) {
    const entry = catalogById.get(expected.itemId);
    if (!entry) {
      errors.push(`C_WEAPON_CATALOG missing itemId ${expected.itemId}`);
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

    const price = override?.priceAdena;
    const expectedPrice = EXPECTED_PRICES[expected.shopKey];
    if (expectedPrice != null && expectedPrice > 0) {
      expectEq(`price ${expected.shopKey}`, price, expectedPrice, errors);
    }

    const runtime = runtimeOverrides[expected.shopKey] ?? runtimeOverrides[shopKeyNorm(expected.shopKey)];
    if (!runtime || runtime.itemId !== expected.itemId) {
      errors.push(`runtime override missing/wrong for ${expected.shopKey}`);
    }

    assertItemCatalogMatchesExpected(expected, errors);
    assertPreviewPatchMatchesExpected(expected, errors);
  }

  // Regression spot checks
  expectEq('Battle Axe pAtk', ITEM_CATALOG[160]?.pAtk, 107, errors);
  expectEq('Battle Axe mAtk', ITEM_CATALOG[160]?.mAtk, 61, errors);
  expectEq('Battle Axe not 236/61', ITEM_CATALOG[160]?.pAtk !== 236, true, errors);

  expectEq('Heavy Doom Hammer pAtk', ITEM_CATALOG[191]?.pAtk, 103, errors);
  expectEq('Heavy Doom Hammer mAtk', ITEM_CATALOG[191]?.mAtk, 81, errors);
  expectEq('Heavy Doom Axe pAtk', ITEM_CATALOG[194]?.pAtk, 103, errors);
  expectEq('Heavy Doom Axe mAtk', ITEM_CATALOG[194]?.mAtk, 81, errors);
  expectEq('Demon Staff pAtk', ITEM_CATALOG[206]?.pAtk, 152, errors);
  expectEq('Demon Staff mAtk', ITEM_CATALOG[206]?.mAtk, 111, errors);

  expectEq('Dark Screamer pAtk', ITEM_CATALOG[233]?.pAtk, 122, errors);
  expectEq('Dark Screamer mAtk', ITEM_CATALOG[233]?.mAtk, 76, errors);

  expectEq('Fisted Blade speed', ITEM_CATALOG[265]?.atkSpd, 325, errors);
  expectEq('Great Pata speed', ITEM_CATALOG[266]?.atkSpd, 325, errors);
  expectEq('Knuckle Duster speed', ITEM_CATALOG[4233]?.atkSpd, 325, errors);

  expectEq('Akat Long Bow pAtk', ITEM_CATALOG[283]?.pAtk, 316, errors);
  expectEq('Akat Long Bow mAtk', ITEM_CATALOG[283]?.mAtk, 84, errors);
  expectEq('Akat Long Bow speed', ITEM_CATALOG[283]?.atkSpd, 227, errors);
  expectEq('Eminence Bow pAtk', ITEM_CATALOG[286]?.pAtk, 323, errors);
  expectEq('Eminence Bow mAtk', ITEM_CATALOG[286]?.mAtk, 83, errors);
  expectEq('Eminence Bow speed', ITEM_CATALOG[286]?.atkSpd, 293, errors);

  expectEq('Orcish Poleaxe pAtk', ITEM_CATALOG[299]?.pAtk, 156, errors);
  expectEq('Orcish Poleaxe mAtk', ITEM_CATALOG[299]?.mAtk, 83, errors);
  expectEq('Scorpion pAtk', ITEM_CATALOG[301]?.pAtk, 144, errors);
  expectEq('Scorpion mAtk', ITEM_CATALOG[301]?.mAtk, 78, errors);
  expectEq('Scorpion pole', ITEM_CATALOG[301]?.weaponType, 'pole', errors);
  expectEq('Widow Maker pAtk', ITEM_CATALOG[303]?.pAtk, 144, errors);
  expectEq('Widow Maker mAtk', ITEM_CATALOG[303]?.mAtk, 78, errors);

  expectEq("Pa'agrian pAtk", ITEM_CATALOG[7882]?.pAtk, 169, errors);
  expectEq("Pa'agrian mAtk", ITEM_CATALOG[7882]?.mAtk, 76, errors);
  expectEq('Ecliptic pAtk', ITEM_CATALOG[7888]?.pAtk, 125, errors);
  expectEq('Ecliptic mAtk', ITEM_CATALOG[7888]?.mAtk, 111, errors);
  expectEq('Dwarven Hammer pAtk', ITEM_CATALOG[7897]?.pAtk, 190, errors);
  expectEq('Dwarven Hammer mAtk', ITEM_CATALOG[7897]?.mAtk, 83, errors);

  expectEq('Heathen pAtk', ITEM_CATALOG[326]?.pAtk, 111, errors);
  expectEq('Heathen mAtk', ITEM_CATALOG[326]?.mAtk, 101, errors);
  expectFalse(
    'Heathen no Sword Mastery',
    swordBluntMasteryApplies('sword', 326),
    errors,
  );
  expectTrue(
    'Homunkulus gets Sword Mastery',
    swordBluntMasteryApplies('sword', 84),
    errors,
  );
  expectFalse(
    'Apprentice Spellbook no Sword Mastery',
    swordBluntMasteryApplies('sword', 900225),
    errors,
  );

  expectEq(
    'Apprentice spellbook id',
    C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
    900225,
    errors,
  );

  // Shield equip: 1H keeps shield (Samurai Longsword)
  let inv1h = emptyInventory();
  inv1h = addItemToBag(inv1h, 628, 1);
  inv1h = addItemToBag(inv1h, 135, 1);
  inv1h = equipFromBag(inv1h, 628, 0);
  inv1h = equipFromBag(inv1h, 135, 0);
  expectEq('Samurai equip l1', eqItemId(inv1h.eq.l1), 135, errors);
  expectEq('Samurai keeps shield l2', eqItemId(inv1h.eq.l2), 628, errors);

  // 2H clears shield (Berserker Blade)
  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, 628, 1);
  inv2h = addItemToBag(inv2h, 5286, 1);
  inv2h = equipFromBag(inv2h, 628, 0);
  inv2h = equipFromBag(inv2h, 5286, 0);
  expectEq('Berserker equip l1', eqItemId(inv2h.eq.l1), 5286, errors);
  expectEq('Berserker clears l2', eqItemId(inv2h.eq.l2), null, errors);
  expectTrue('Berserker returns shield to bag', inv2h.stacks.some((s) => s.itemId === 628), errors);

  if (errors.length > 0) {
    console.error('C weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`C weapons smoke OK (${C_WEAPON_CATALOG.length} items, ${canonicalCount} interlude + ${customCount} custom)`);
}

main();
