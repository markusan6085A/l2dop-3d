/**
 * Smoke: канонічна B-grade зброя — магазин, ITEM_CATALOG, itemId map, Coin of Luck.
 * npm run test:b-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  bGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopBWeaponDropsPatches.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  type InventoryState,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { requiresArrowsForWeaponType } from '../src/data/weaponTypeContract.js';
import { swordBluntMasteryApplies } from '../src/data/swordBluntMasteryTables.js';
import {
  B_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
  B_GRADE_BAGUETTE_DUALSWORD_ITEM_ID,
  B_WEAPON_BY_ITEM_ID,
  B_WEAPON_CANONICAL_COUNT,
  B_WEAPON_CATALOG,
  B_WEAPON_CUSTOM_COUNT,
  B_WEAPON_SHOP_TOTAL,
  type BWeaponCanonEntry,
  type BWeaponCanonSource,
  type BWeaponMode,
} from '../src/data/bWeaponCatalog.js';
import {
  B_WEAPON_ITEM_ID_MIGRATION_MARKER,
  LEGACY_B_WEAPON_ID_MAP,
  mapLegacyBWeaponItemId,
  remapInventoryState,
} from '../src/data/bWeaponItemIdMigration.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';
import { buildDropsShopCatalogForClient } from '../src/services/dropsShopService.js';

type OverrideRow = { itemId?: number; priceAdena?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;
const B_WEAPON_COL_PRICE = colPriceForBasEquipment('B', 'weapon');

type ExpectedBRow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  canonSource: BWeaponCanonSource;
  mode: BWeaponMode;
  weaponType: WeaponKindForEnchant;
  masteryFamily: WeaponKindForEnchant | null;
  blocksShield: boolean;
  requiresArrows: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
};

const EXPECTED_B_WEAPONS: readonly ExpectedBRow[] = [
  { itemId: 78, shopKey: 'weapon_b/great_sword.jpg', nameUk: 'Великий меч B-grade. Дворучна зброя.', shopNameUk: 'Great Sword', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 213, mAtk: 91, wpnCrit: 80 },
  { itemId: 79, shopKey: 'weapon_b/sword_of_damascus.jpg', nameUk: 'Меч Дамаску B-grade.', shopNameUk: 'Sword of Damascus', canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 194, mAtk: 99, wpnCrit: 80 },
  { itemId: 92, shopKey: 'weapon_b/spirit_s_staff.jpg', nameUk: 'Посох спрайта B-grade. Дворучна магічна зброя.', shopNameUk: "Sprite's Staff", canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 170, mAtk: 122, wpnCrit: 40 },
  { itemId: 97, shopKey: 'weapon_b/lance.jpg', nameUk: 'Спіс B-grade. Дворучна зброя.', shopNameUk: 'Lance', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 194, mAtk: 99, wpnCrit: 80 },
  { itemId: 148, shopKey: 'weapon_b/sword_of_valhalla.jpg', nameUk: 'Меч Вальгалли B-grade. Магічна зброя.', shopNameUk: 'Sword of Valhalla', canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 140, mAtk: 122, wpnCrit: 80 },
  { itemId: 171, shopKey: 'weapon_b/deadman_s_glory.jpg', nameUk: 'Слава мертвого B-grade.', shopNameUk: "Deadman's Glory", canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 194, mAtk: 99, wpnCrit: 40 },
  { itemId: 175, shopKey: 'weapon_b/art_of_battle_axe.jpg', nameUk: 'Бойова сокира мистецтва B-grade.', shopNameUk: 'Art of Battle Axe', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 194, mAtk: 99, wpnCrit: 40 },
  { itemId: 210, shopKey: 'weapon_b/staff_of_evil_spirits.jpg', nameUk: 'Посох злих духів B-grade. Дворучна магічна зброя.', shopNameUk: 'Staff of Evil Spirits', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 189, mAtk: 132, wpnCrit: 40 },
  { itemId: 229, shopKey: 'weapon_b/kris.jpg', nameUk: 'Крис B-grade.', shopNameUk: 'Kris', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 153, mAtk: 91, wpnCrit: 120 },
  { itemId: 243, shopKey: 'weapon_b/hell_knife.jpg', nameUk: 'Кинджал пекла B-grade. Магічна зброя.', shopNameUk: 'Hell Knife', canonSource: 'interlude', mode: 'magic', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 122, mAtk: 122, wpnCrit: 120 },
  { itemId: 267, shopKey: 'weapon_b/arthro_nail.jpg', nameUk: 'Кіготь Артро B-grade. Дворучна зброя.', shopNameUk: 'Arthro Nail', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 213, mAtk: 91, wpnCrit: 40 },
  { itemId: 268, shopKey: 'weapon_b/bellion_cestus.jpg', nameUk: 'Цестус Белліона B-grade. Дворучна зброя.', shopNameUk: 'Bellion Cestus', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 236, mAtk: 99, wpnCrit: 40 },
  { itemId: 284, shopKey: 'weapon_b/dark_elven_long_bow.jpg', nameUk: 'Довгий лук темних ельфів B-grade. Дальня атака.', shopNameUk: 'Dark Elven Long Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 227, pAtk: 397, mAtk: 100, wpnCrit: 120 },
  { itemId: 287, shopKey: 'weapon_b/bow_of_peril.jpg', nameUk: 'Лук небезпеки B-grade. Дальня атака.', shopNameUk: 'Bow of Peril', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 293, pAtk: 400, mAtk: 99, wpnCrit: 120 },
  { itemId: 300, shopKey: 'weapon_b/great_axe.jpg', nameUk: 'Велика сокира B-grade. Дворучна зброя.', shopNameUk: 'Great Axe', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 175, mAtk: 91, wpnCrit: 80 },
  { itemId: 7883, shopKey: 'weapon_b/guardian_sword.jpg', nameUk: 'Меч вартового B-grade.', shopNameUk: 'Guardian Sword', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 236, mAtk: 99, wpnCrit: 80 },
  { itemId: 7889, shopKey: 'weapon_b/wizard_s_tear.jpg', nameUk: 'Сльоза чарівника B-grade. Магічна зброя.', shopNameUk: "Wizard's Tear", canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 155, mAtk: 132, wpnCrit: 80 },
  { itemId: 7892, shopKey: 'weapon_b/spell_breaker.jpg', nameUk: 'Руйнівник заклинань B-grade. Магічна зброя.', shopNameUk: 'Spell Breaker', canonSource: 'interlude', mode: 'magic', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 140, mAtk: 122, wpnCrit: 40 },
  { itemId: 7893, shopKey: 'weapon_b/kaim_vanul_s_bones.jpg', nameUk: 'Кістки Каїма Ванула B-grade. Магічна зброя.', shopNameUk: "Kaim Vanul's Bones", canonSource: 'interlude', mode: 'magic', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 155, mAtk: 132, wpnCrit: 40 },
  { itemId: 7900, shopKey: 'weapon_b/ice_storm_hammer.jpg', nameUk: 'Молот крижаної бурі B-grade. Дворучна зброя.', shopNameUk: 'Ice Storm Hammer', canonSource: 'interlude', mode: 'phys', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 213, mAtk: 91, wpnCrit: 40 },
  { itemId: 7901, shopKey: 'weapon_b/star_buster.jpg', nameUk: 'Руйнівник зірок B-grade. Дворучна зброя.', shopNameUk: 'Star Buster', canonSource: 'interlude', mode: 'phys', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 236, mAtk: 99, wpnCrit: 40 },
  { itemId: 910101, shopKey: 'weapon_b/apprentices_spellbook.jpg', nameUk: 'Книга заклинань учня B-grade. Магічна зброя.', shopNameUk: "Apprentice's Spellbook", canonSource: 'custom', mode: 'magic', weaponType: 'sword', masteryFamily: null, blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 9, mAtk: 160, wpnCrit: 80 },
  { itemId: 910102, shopKey: 'weapon_b/baguette_s_dualsword.jpg', nameUk: 'Дворучний меч Багет B-grade. Дворучна зброя.', shopNameUk: "Baguette's Dualsword", canonSource: 'custom', mode: 'phys', weaponType: 'dual', masteryFamily: 'dual', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 312, mAtk: 23, wpnCrit: 80 },
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

function assertCatalogMatchesExpected(expected: ExpectedBRow, entry: BWeaponCanonEntry, errors: string[]): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, entry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} shopKey`, entry.shopKey, expected.shopKey, errors);
  expectEq(`catalog #${id} canonSource`, entry.canonSource, expected.canonSource, errors);
  expectEq(`catalog #${id} weaponType`, entry.weaponType, expected.weaponType, errors);
  expectEq(`catalog #${id} masteryFamily`, entry.masteryFamily, expected.masteryFamily, errors);
  expectEq(`catalog #${id} blocksShield`, entry.blocksShield, expected.blocksShield, errors);
  expectEq(`catalog #${id} atkSpd`, entry.atkSpd, expected.atkSpd, errors);
  expectEq(`catalog #${id} pAtk`, entry.pAtk, expected.pAtk, errors);
  expectEq(`catalog #${id} mAtk`, entry.mAtk, expected.mAtk, errors);
  expectEq(`catalog #${id} wpnCrit`, entry.wpnCrit, expected.wpnCrit, errors);
}

function assertItemCatalogMatchesExpected(expected: ExpectedBRow, errors: string[]): void {
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
  expectEq(`ITEM_CATALOG #${id} masteryFamily`, catalog.masteryFamily ?? null, expected.masteryFamily, errors);
  expectEq(`ITEM_CATALOG #${id} requiresArrows`, catalog.requiresArrows === true, expected.requiresArrows, errors);
  expectEq(`ITEM_CATALOG #${id} shield slot`, itemBlocksShieldSlot(id, catalog.weaponType), expected.blocksShield, errors);
}

function assertPreviewPatchMatchesExpected(expected: ExpectedBRow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  if (expected.mode === 'magic') {
    expectEq(`patch #${expected.itemId} mode`, patch.mode, 'magic', errors);
    if (patch.mode === 'magic') {
      expectEq(`patch #${expected.itemId} mAtk`, patch.mAtk, expected.mAtk, errors);
    }
  } else {
    expectEq(`patch #${expected.itemId} mode`, patch.mode, 'phys', errors);
    if (patch.mode === 'phys') {
      expectEq(`patch #${expected.itemId} pAtk`, patch.pAtk, expected.pAtk, errors);
      expectEq(`patch #${expected.itemId} crit`, patch.crit, expected.wpnCrit, errors);
    }
  }
}

function assertShopColPricing(errors: string[]): void {
  const client = buildDropsShopCatalogForClient();
  for (const g of client.grades) {
    if (g.grade !== 'B') continue;
    for (const s of g.sections) {
      if (s.category !== 'weapon') continue;
      for (const it of s.items) {
        if (!it.purchasable) continue;
        expectEq(`B shop ${it.shopKey} COL`, it.priceCoinOfLuck, 60, errors);
        expectEq(`B shop ${it.shopKey} adena null`, it.priceAdena, null, errors);
      }
    }
  }
}

function assertMigrationLogic(errors: string[]): void {
  const cases: Array<[number, number]> = [
    [7893, 268],
    [8340, 7893],
    [7889, 92],
    [8336, 7889],
    [7895, 78],
    [78, 910101],
  ];
  for (const [from, to] of cases) {
    expectEq(`migrate ${from}`, mapLegacyBWeaponItemId(from), to, errors);
  }
  expectEq('canonical Damascus unchanged', mapLegacyBWeaponItemId(79), 79, errors);
  expectEq('canonical Guardian unchanged', mapLegacyBWeaponItemId(7883), 7883, errors);
  expectEq('canonical Art of Battle unchanged', mapLegacyBWeaponItemId(175), 175, errors);

  const inv: InventoryState = {
    v: 1,
    stacks: [
      { itemId: 8340, qty: 1, enchant: 3 },
      { itemId: 7893, qty: 1, enchant: 5 },
    ],
    eq: { l1: { itemId: 78, enchant: 2 }, l2: 628 },
  };
  const migrated = remapInventoryState(inv);
  expectEq('migrate Kaim stack', migrated.stacks.find((s) => s.itemId === 7893)?.enchant, 3, errors);
  expectEq('migrate Bellion stack', migrated.stacks.find((s) => s.itemId === 268)?.enchant, 5, errors);
  expectEq('migrate spellbook equip', eqItemId(migrated.eq.l1), 910101, errors);
  expectEq('migrate spellbook enchant', (migrated.eq.l1 as { enchant?: number }).enchant, 2, errors);
  expectEq('migrate shield kept', eqItemId(migrated.eq.l2), 628, errors);

  expectEq('migration marker constant', B_WEAPON_ITEM_ID_MIGRATION_MARKER, 'B_WEAPON_ITEM_ID_MIGRATION_V1', errors);
  expectEq('legacy map size', Object.keys(LEGACY_B_WEAPON_ID_MAP).length, 18, errors);
}

function main(): void {
  const errors: string[] = [];

  expectEq('B_WEAPON_SHOP_TOTAL', B_WEAPON_SHOP_TOTAL, 23, errors);
  expectEq('B_WEAPON_CANONICAL_COUNT', B_WEAPON_CANONICAL_COUNT, 21, errors);
  expectEq('B_WEAPON_CUSTOM_COUNT', B_WEAPON_CUSTOM_COUNT, 2, errors);
  expectEq('B_WEAPON_CATALOG length', B_WEAPON_CATALOG.length, 23, errors);
  expectEq('B COL weapon price', B_WEAPON_COL_PRICE, 60, errors);
  expectEq('910101 free', ITEM_CATALOG[910101] == null || B_WEAPON_BY_ITEM_ID.has(910101), true, errors);
  expectEq('910102 free', ITEM_CATALOG[910102] == null || B_WEAPON_BY_ITEM_ID.has(910102), true, errors);
  expectEq('custom spellbook id', B_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID, 910101, errors);
  expectEq('custom dual id', B_GRADE_BAGUETTE_DUALSWORD_ITEM_ID, 910102, errors);

  const ids = B_WEAPON_CATALOG.map((e) => e.itemId);
  if (new Set(ids).size !== ids.length) errors.push('duplicate itemId in B_WEAPON_CATALOG');

  const catalogById = new Map(B_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  const runtimeOverrides = loadDropsShopOverrides();

  for (const expected of EXPECTED_B_WEAPONS) {
    const entry = catalogById.get(expected.itemId);
    if (!entry) {
      errors.push(`B_WEAPON_CATALOG missing itemId ${expected.itemId}`);
      continue;
    }
    assertCatalogMatchesExpected(expected, entry, errors);
    expectEq(`override ${expected.shopKey}`, overrides[expected.shopKey]?.itemId, expected.itemId, errors);
    const runtime = runtimeOverrides[expected.shopKey];
    if (!runtime || runtime.itemId !== expected.itemId) {
      errors.push(`runtime override wrong for ${expected.shopKey}`);
    }
    assertItemCatalogMatchesExpected(expected, errors);
    assertPreviewPatchMatchesExpected(expected, errors);
  }

  assertShopColPricing(errors);
  assertMigrationLogic(errors);

  // Regression
  expectEq('Great Sword stats', ITEM_CATALOG[78]?.pAtk, 213, errors);
  expectEq('Great Sword mAtk', ITEM_CATALOG[78]?.mAtk, 91, errors);
  expectEq('ID 78 is Great Sword', B_WEAPON_BY_ITEM_ID.get(78)?.shopNameUk, 'Great Sword', errors);
  expectEq('ID 78 not custom spellbook', B_WEAPON_BY_ITEM_ID.get(78)?.canonSource, 'interlude', errors);
  expectEq('Deadman blunt', ITEM_CATALOG[171]?.weaponType, 'blunt', errors);
  expectEq('Deadman shield', itemBlocksShieldSlot(171, 'blunt'), false, errors);
  expectEq('Art of Battle Axe', ITEM_CATALOG[175]?.pAtk, 194, errors);
  expectEq('Sprite Staff mAtk', ITEM_CATALOG[92]?.mAtk, 122, errors);
  expectEq('Lance pole', ITEM_CATALOG[97]?.weaponType, 'pole', errors);
  expectEq('Arthro speed', ITEM_CATALOG[267]?.atkSpd, 325, errors);
  expectEq('Bellion speed', ITEM_CATALOG[268]?.atkSpd, 325, errors);
  expectEq('DELB speed', ITEM_CATALOG[284]?.atkSpd, 227, errors);
  expectEq('DELB pAtk', ITEM_CATALOG[284]?.pAtk, 397, errors);
  expectEq('Bow of Peril pAtk', ITEM_CATALOG[287]?.pAtk, 400, errors);
  expectEq('Great Axe pole', ITEM_CATALOG[300]?.weaponType, 'pole', errors);
  expectEq('Hell Knife magic dagger', ITEM_CATALOG[243]?.weaponType, 'dagger', errors);
  expectEq('Hell Knife mode magic mAtk', ITEM_CATALOG[243]?.mAtk, 122, errors);
  expectEq('Kris id', ITEM_CATALOG[229]?.pAtk, 153, errors);
  expectEq('Wizard Tear id', ITEM_CATALOG[7889]?.mAtk, 132, errors);
  expectEq('Kaim id', ITEM_CATALOG[7893]?.mAtk, 132, errors);
  expectEq('Ice Storm', ITEM_CATALOG[7900]?.pAtk, 213, errors);
  expectEq('Star Buster', ITEM_CATALOG[7901]?.pAtk, 236, errors);
  expectFalse('custom spellbook no sword mastery', swordBluntMasteryApplies('sword', 910101), errors);

  let inv1h = emptyInventory();
  inv1h = addItemToBag(inv1h, 628, 1);
  inv1h = addItemToBag(inv1h, 79, 1);
  inv1h = equipFromBag(inv1h, 628, 0);
  inv1h = equipFromBag(inv1h, 79, 0);
  expectEq('Damascus keeps shield', eqItemId(inv1h.eq.l2), 628, errors);

  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, 628, 1);
  inv2h = addItemToBag(inv2h, 78, 1);
  inv2h = equipFromBag(inv2h, 628, 0);
  inv2h = equipFromBag(inv2h, 78, 0);
  expectEq('Great Sword clears shield', eqItemId(inv2h.eq.l2), null, errors);

  if (errors.length > 0) {
    console.error('B weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`B weapons smoke OK (${B_WEAPON_SHOP_TOTAL} items, ${B_WEAPON_CANONICAL_COUNT} interlude + ${B_WEAPON_CUSTOM_COUNT} custom)`);
}

main();
