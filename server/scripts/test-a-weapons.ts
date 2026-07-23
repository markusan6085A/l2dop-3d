/**
 * Smoke: канонічна A-grade зброя — магазин, ITEM_CATALOG, RB, міграція, Coin of Luck.
 * npm run test:a-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  aGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopAWeaponDropsPatches.js';
import { assertWeaponShopPreviewLines } from './lib/weaponShopPreviewTestCore.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
  type InventoryState,
} from '../src/data/inventory.js';
import { ITEM_CATALOG } from '../src/data/itemsCatalog.js';
import { itemBlocksShieldSlot } from '../src/data/l2dopTwoHandedWeapon.js';
import { swordBluntMasteryApplies } from '../src/data/swordBluntMasteryTables.js';
import {
  A_WEAPON_BY_ITEM_ID,
  A_WEAPON_CANONICAL_COUNT,
  A_WEAPON_CATALOG,
  A_WEAPON_CUSTOM_COUNT,
  A_WEAPON_SHOP_TOTAL,
  type AWeaponCanonEntry,
  type AWeaponCanonSource,
  type AWeaponMode,
} from '../src/data/aWeaponCatalog.js';
import {
  A_WEAPON_ITEM_ID_MIGRATION_MARKER,
  LEGACY_A_WEAPON_ID_MAP,
  mapLegacyAWeaponItemId,
  preflightAWeaponMigration,
  remapInventoryState,
} from '../src/data/aWeaponItemIdMigration.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { RB_DROP_ITEM_A } from '../src/data/l2dopRaidBossDropSharedA.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';
import { buildDropsShopCatalogForClient } from '../src/services/dropsShopService.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;
const A_WEAPON_COL_PRICE = colPriceForBasEquipment('A', 'weapon');

type ExpectedARow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  canonSource: AWeaponCanonSource;
  mode: AWeaponMode;
  weaponType: WeaponKindForEnchant;
  masteryFamily: WeaponKindForEnchant | null;
  blocksShield: boolean;
  requiresArrows: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
};

const EXPECTED_A_WEAPONS: readonly ExpectedARow[] = [
  { itemId: 900201, shopKey: 'weapon_a/apprentices_spellbook.jpg', nameUk: 'Книга заклинань учня A-grade. Магічна зброя.', shopNameUk: "Apprentice's Spellbook", canonSource: 'custom', mode: 'magic', weaponType: 'sword', masteryFamily: null, blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 9, mAtk: 260, wpnCrit: 80 },
  { itemId: 900202, shopKey: 'weapon_a/baguette_s_dualsword.jpg', nameUk: 'Дворучний меч Багет A-grade. Дворучна зброя.', shopNameUk: "Baguette's Dualsword", canonSource: 'custom', mode: 'phys', weaponType: 'dual', masteryFamily: 'dual', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 402, mAtk: 31, wpnCrit: 80 },
  { itemId: 8680, shopKey: 'weapon_a/barakiel_s_axe.jpg', nameUk: 'Сокира Баракіеля A-grade.', shopNameUk: "Barakiel's Axe", canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 251, mAtk: 121, wpnCrit: 40 },
  { itemId: 8681, shopKey: 'weapon_a/behemoth_s_tuning_fork.jpg', nameUk: 'Камертон Бегемота A-grade. Дворучна зброя.', shopNameUk: "Behemoth's Tuning Fork", canonSource: 'interlude', mode: 'phys', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 305, mAtk: 121, wpnCrit: 40 },
  { itemId: 269, shopKey: 'weapon_a/blood_tornado.jpg', nameUk: 'Кривавий торнадо A-grade. Дворучна зброя.', shopNameUk: 'Blood Tornado', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 259, mAtk: 107, wpnCrit: 40 },
  { itemId: 235, shopKey: 'weapon_a/bloody_orchid.jpg', nameUk: 'Кривава орхідея A-grade.', shopNameUk: 'Bloody Orchid', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 186, mAtk: 107, wpnCrit: 120 },
  { itemId: 213, shopKey: 'weapon_a/branch_of_the_mother_tree.jpg', nameUk: 'Гілка материнського дерева A-grade. Дворучна магічна зброя.', shopNameUk: 'Branch of the Mother Tree', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 226, mAtk: 152, wpnCrit: 40 },
  { itemId: 288, shopKey: 'weapon_a/carnage_bow.jpg', nameUk: 'Лук різанини A-grade. Дальня атака.', shopNameUk: 'Carnage Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 293, pAtk: 440, mAtk: 107, wpnCrit: 120 },
  { itemId: 8688, shopKey: 'weapon_a/daimon_crystal.jpg', nameUk: 'Кристал Даймона A-grade. Дворучна магічна зброя.', shopNameUk: 'Daimon Crystal', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 245, mAtk: 161, wpnCrit: 40 },
  { itemId: 2500, shopKey: 'weapon_a/dark_legion_s_edge.jpg', nameUk: 'Клинок темного легіону A-grade.', shopNameUk: "Dark Legion's Edge", canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 232, mAtk: 114, wpnCrit: 80 },
  { itemId: 212, shopKey: 'weapon_a/dasparion_s_staff.jpg', nameUk: 'Посох Даспаріона A-grade. Дворучна магічна зброя.', shopNameUk: "Dasparion's Staff", canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 207, mAtk: 143, wpnCrit: 40 },
  { itemId: 270, shopKey: 'weapon_a/dragon_grinder.jpg', nameUk: 'Подрібнювач дракона A-grade. Дворучна зброя.', shopNameUk: 'Dragon Grinder', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 282, mAtk: 114, wpnCrit: 40 },
  { itemId: 81, shopKey: 'weapon_a/dragon_slayer.jpg', nameUk: 'Вбивця драконів A-grade. Дворучна зброя.', shopNameUk: 'Dragon Slayer', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 282, mAtk: 114, wpnCrit: 80 },
  { itemId: 164, shopKey: 'weapon_a/elysian.jpg', nameUk: 'Елізій A-grade.', shopNameUk: 'Elysian', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 232, mAtk: 114, wpnCrit: 40 },
  { itemId: 98, shopKey: 'weapon_a/halberd.jpg', nameUk: 'Алебарда A-grade. Дворучна зброя.', shopNameUk: 'Halberd', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 213, mAtk: 107, wpnCrit: 80 },
  { itemId: 7884, shopKey: 'weapon_a/infernal_master.jpg', nameUk: 'Інфернальний майстер A-grade. Дворучна зброя.', shopNameUk: 'Infernal Master', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 259, mAtk: 107, wpnCrit: 80 },
  { itemId: 2504, shopKey: 'weapon_a/meteor_shower.jpg', nameUk: 'Метеорний дощ A-grade.', shopNameUk: 'Meteor Shower', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 213, mAtk: 107, wpnCrit: 40 },
  { itemId: 8682, shopKey: 'weapon_a/naga_storm.jpg', nameUk: 'Буря наги A-grade.', shopNameUk: 'Naga Storm', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 220, mAtk: 121, wpnCrit: 120 },
  { itemId: 8684, shopKey: 'weapon_a/shyeed_s_bow.jpg', nameUk: 'Лук Шіда A-grade. Дальня атака.', shopNameUk: "Shyeed's Bow", canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 227, pAtk: 570, mAtk: 133, wpnCrit: 120 },
  { itemId: 8678, shopKey: 'weapon_a/sirra_s_blade.jpg', nameUk: 'Клинок Сірри A-grade.', shopNameUk: "Sirra's Blade", canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 251, mAtk: 121, wpnCrit: 80 },
  { itemId: 8685, shopKey: 'weapon_a/sobekk_s_hurricane.jpg', nameUk: 'Ураган Собекка A-grade. Дворучна зброя.', shopNameUk: "Sobekk's Hurricane", canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 305, mAtk: 121, wpnCrit: 40 },
  { itemId: 289, shopKey: 'weapon_a/soul_bow.jpg', nameUk: 'Лук душі A-grade. Дальня атака.', shopNameUk: 'Soul Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 227, pAtk: 528, mAtk: 125, wpnCrit: 120 },
  { itemId: 236, shopKey: 'weapon_a/soul_separator.jpg', nameUk: 'Роздільник душ A-grade.', shopNameUk: 'Soul Separator', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 203, mAtk: 114, wpnCrit: 120 },
  { itemId: 7894, shopKey: 'weapon_a/spiritual_eye.jpg', nameUk: 'Духовне око A-grade. Магічна зброя.', shopNameUk: 'Spiritual Eye', canonSource: 'interlude', mode: 'magic', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 170, mAtk: 143, wpnCrit: 40 },
  { itemId: 8679, shopKey: 'weapon_a/sword_of_ipos.jpg', nameUk: 'Меч Іпоса A-grade. Дворучна зброя.', shopNameUk: 'Sword of Ipos', canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 305, mAtk: 121, wpnCrit: 80 },
  { itemId: 151, shopKey: 'weapon_a/sword_of_miracles.jpg', nameUk: 'Меч див A-grade. Магічна зброя.', shopNameUk: 'Sword of Miracles', canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 186, mAtk: 152, wpnCrit: 80 },
  { itemId: 80, shopKey: 'weapon_a/tallum_blade.jpg', nameUk: 'Клинок Таллума A-grade.', shopNameUk: 'Tallum Blade', canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 213, mAtk: 107, wpnCrit: 80 },
  { itemId: 305, shopKey: 'weapon_a/tallum_glaive.jpg', nameUk: 'Глефа Таллума A-grade. Дворучна зброя.', shopNameUk: 'Tallum Glaive', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 232, mAtk: 114, wpnCrit: 80 },
  { itemId: 8686, shopKey: 'weapon_a/themis_tongue.jpg', nameUk: 'Язик Теміди A-grade. Магічна зброя.', shopNameUk: "Themis' Tongue", canonSource: 'interlude', mode: 'magic', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 202, mAtk: 161, wpnCrit: 80 },
  { itemId: 8683, shopKey: 'weapon_a/tiphon_s_spear.jpg', nameUk: 'Спіс Тіфона A-grade. Дворучна зброя.', shopNameUk: "Tiphon's Spear", canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 251, mAtk: 121, wpnCrit: 80 },
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

function eqItemId(slotVal: unknown): number | null {
  if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
  if (slotVal && typeof slotVal === 'object' && 'itemId' in slotVal) {
    const n = Number((slotVal as { itemId: unknown }).itemId);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  return null;
}

function assertCatalogMatchesExpected(expected: ExpectedARow, entry: AWeaponCanonEntry, errors: string[]): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, entry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} shopKey`, entry.shopKey, expected.shopKey, errors);
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

function assertItemCatalogMatchesExpected(expected: ExpectedARow, errors: string[]): void {
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
  if (catalog.rCrit != null && catalog.rCrit !== 0) {
    errors.push(`#${id} unexpected rCrit: ${catalog.rCrit}`);
  }
}

function assertPreviewPatchMatchesExpected(expected: ExpectedARow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  expectEq(`patch #${expected.itemId} pAtk`, patch.pAtk, expected.pAtk, errors);
  expectEq(`patch #${expected.itemId} mAtk`, patch.mAtk, expected.mAtk, errors);
  expectEq(`patch #${expected.itemId} speed`, patch.speed, expected.atkSpd, errors);
  expectEq(`patch #${expected.itemId} crit`, patch.crit, expected.wpnCrit, errors);
  assertWeaponShopPreviewLines(
    aGradeWeaponDropsPreviewLines(patch),
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

function assertRbDropMapping(errors: string[]): void {
  const rbWeaponKeys = [
    ['barakielsAxe', 8680],
    ['behemothsTuningFork', 8681],
    ['bloodTornado', 269],
    ['bloodyOrchid', 235],
    ['branchOfMotherTree', 213],
    ['carnageBow', 288],
    ['daimonCrystal', 8688],
    ['dragonGrinder', 270],
    ['dragonSlayer', 81],
    ['infernalMaster', 7884],
    ['nagaStorm', 8682],
    ['shyeedsBow', 8684],
    ['sirrasBlade', 8678],
    ['sobekksHurricane', 8685],
    ['soulSeparator', 236],
    ['spiritualEye', 7894],
    ['swordOfIpos', 8679],
    ['tallumBlade', 80],
    ['tallumGlaive', 305],
    ['themisTongue', 8686],
    ['tiphonsSpear', 8683],
  ] as const;
  for (const [key, expectedId] of rbWeaponKeys) {
    const def = RB_DROP_ITEM_A[key];
    expectEq(`RB A ${key}`, def.l2ItemId, expectedId, errors);
  }
}

function assertShopColPricing(errors: string[]): void {
  const client = buildDropsShopCatalogForClient();
  for (const g of client.grades) {
    if (g.grade !== 'A') continue;
    for (const s of g.sections) {
      if (s.category !== 'weapon') continue;
      for (const it of s.items) {
        if (!it.purchasable) continue;
        expectEq(`A shop ${it.shopKey} COL`, it.priceCoinOfLuck, 110, errors);
        expectEq(`A shop ${it.shopKey} adena null`, it.priceAdena, null, errors);
      }
    }
  }
}

function assertMigrationLogic(errors: string[]): void {
  const cases: Array<[number, number]> = [
    [900203, 8680],
    [900217, 236],
    [900218, 7894],
    [231, 270],
    [304, 98],
    [900220, 80],
    [900211, 81],
  ];
  for (const [from, to] of cases) {
    expectEq(`migrate ${from}`, mapLegacyAWeaponItemId(from), to, errors);
  }
  expectEq('Dark Legion unchanged', mapLegacyAWeaponItemId(2500), 2500, errors);
  expectEq('Miracles unchanged', mapLegacyAWeaponItemId(151), 151, errors);
  expectEq('custom spellbook unchanged', mapLegacyAWeaponItemId(900201), 900201, errors);

  const preflight = preflightAWeaponMigration();
  expectFalse('preflight ambiguous 231/304', preflight.ambiguous, errors);
  expectFalse('preflight cross-grade collision', preflight.crossGradeCollision, errors);

  const inv: InventoryState = {
    v: 1,
    stacks: [
      { itemId: 900218, qty: 1, enchant: 4 },
      { itemId: 231, qty: 1, enchant: 6 },
    ],
    eq: { l1: { itemId: 900217, enchant: 3 }, l2: 628 },
  };
  const migrated = remapInventoryState(inv);
  expectEq('migrate Spiritual Eye stack', migrated.stacks.find((s) => s.itemId === 7894)?.enchant, 4, errors);
  expectEq('migrate Dragon Grinder stack', migrated.stacks.find((s) => s.itemId === 270)?.enchant, 6, errors);
  expectEq('migrate Soul Separator equip', eqItemId(migrated.eq.l1), 236, errors);
  expectEq('migrate Soul Separator enchant', (migrated.eq.l1 as { enchant?: number }).enchant, 3, errors);
  expectEq('migrate shield kept', eqItemId(migrated.eq.l2), 628, errors);

  expectEq('migration marker constant', A_WEAPON_ITEM_ID_MIGRATION_MARKER, 'A_WEAPON_ITEM_ID_MIGRATION_V1', errors);
  expectEq('legacy map size', Object.keys(LEGACY_A_WEAPON_ID_MAP).length, 22, errors);
}

function main(): void {
  const errors: string[] = [];

  expectEq('A_WEAPON_SHOP_TOTAL', A_WEAPON_SHOP_TOTAL, 30, errors);
  expectEq('A_WEAPON_CANONICAL_COUNT', A_WEAPON_CANONICAL_COUNT, 28, errors);
  expectEq('A_WEAPON_CUSTOM_COUNT', A_WEAPON_CUSTOM_COUNT, 2, errors);
  expectEq('A COL weapon price', A_WEAPON_COL_PRICE, 110, errors);

  const ids = A_WEAPON_CATALOG.map((e) => e.itemId);
  if (new Set(ids).size !== ids.length) errors.push('duplicate itemId in A_WEAPON_CATALOG');

  const catalogById = new Map(A_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  const runtimeOverrides = loadDropsShopOverrides();

  for (const expected of EXPECTED_A_WEAPONS) {
    const entry = catalogById.get(expected.itemId);
    if (!entry) {
      errors.push(`A_WEAPON_CATALOG missing itemId ${expected.itemId}`);
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
    if (A_WEAPON_BY_ITEM_ID.get(expected.itemId) !== entry) {
      errors.push(`#${expected.itemId} missing from A_WEAPON_BY_ITEM_ID`);
    }
  }

  assertRbDropMapping(errors);
  assertShopColPricing(errors);
  assertMigrationLogic(errors);

  // Regression spot checks
  expectEq('Barakiel stats', ITEM_CATALOG[8680]?.pAtk, 251, errors);
  expectEq('Barakiel mAtk', ITEM_CATALOG[8680]?.mAtk, 121, errors);
  expectEq('Behemoth phys', A_WEAPON_BY_ITEM_ID.get(8681)?.mode, 'phys', errors);
  expectEq('Behemoth stats', ITEM_CATALOG[8681]?.pAtk, 305, errors);
  expectEq('Behemoth mAtk', ITEM_CATALOG[8681]?.mAtk, 121, errors);
  expectEq('Blood Tornado speed', ITEM_CATALOG[269]?.atkSpd, 325, errors);
  expectEq('Blood Tornado stats', ITEM_CATALOG[269]?.pAtk, 259, errors);
  expectEq('Bloody Orchid stats', ITEM_CATALOG[235]?.pAtk, 186, errors);
  expectEq('Branch stats', ITEM_CATALOG[213]?.pAtk, 226, errors);
  expectEq('Carnage Bow speed', ITEM_CATALOG[288]?.atkSpd, 293, errors);
  expectEq('Carnage Bow stats', ITEM_CATALOG[288]?.pAtk, 440, errors);
  expectEq('Daimon stats', ITEM_CATALOG[8688]?.mAtk, 161, errors);
  expectEq('Dark Legion stats', ITEM_CATALOG[2500]?.pAtk, 232, errors);
  expectEq('Dasparion stats', ITEM_CATALOG[212]?.pAtk, 207, errors);
  expectEq('Dragon Grinder id', ITEM_CATALOG[270]?.weaponType, 'fist', errors);
  expectEq('Dragon Grinder not 231', A_WEAPON_BY_ITEM_ID.has(231), false, errors);
  expectEq('Dragon Slayer stats', ITEM_CATALOG[81]?.pAtk, 282, errors);
  expectEq('Elysian stats', ITEM_CATALOG[164]?.pAtk, 232, errors);
  expectEq('Halberd id 98', ITEM_CATALOG[98]?.weaponType, 'pole', errors);
  expectEq('Halberd not 304', A_WEAPON_BY_ITEM_ID.has(304), false, errors);
  expectEq('Infernal Master stats', ITEM_CATALOG[7884]?.pAtk, 259, errors);
  expectEq('Meteor Shower stats', ITEM_CATALOG[2504]?.pAtk, 213, errors);
  expectEq('Naga Storm stats', ITEM_CATALOG[8682]?.pAtk, 220, errors);
  expectEq('Shyeed speed', ITEM_CATALOG[8684]?.atkSpd, 227, errors);
  expectEq('Shyeed stats', ITEM_CATALOG[8684]?.pAtk, 570, errors);
  expectEq('Sirra stats', ITEM_CATALOG[8678]?.pAtk, 251, errors);
  expectEq('Sobekk speed', ITEM_CATALOG[8685]?.atkSpd, 325, errors);
  expectEq('Soul Bow speed', ITEM_CATALOG[289]?.atkSpd, 227, errors);
  expectEq('Soul Bow stats', ITEM_CATALOG[289]?.pAtk, 528, errors);
  expectEq('Soul Separator id', ITEM_CATALOG[236]?.weaponType, 'dagger', errors);
  expectEq('Spiritual Eye stats', ITEM_CATALOG[7894]?.pAtk, 170, errors);
  expectEq('Spiritual Eye on 7894', A_WEAPON_BY_ITEM_ID.get(7894)?.shopNameUk, 'Spiritual Eye', errors);
  expectEq('Sword of Ipos stats', ITEM_CATALOG[8679]?.pAtk, 305, errors);
  expectEq('Miracles stats', ITEM_CATALOG[151]?.pAtk, 186, errors);
  expectEq('Tallum Blade stats', ITEM_CATALOG[80]?.pAtk, 213, errors);
  expectEq('Tallum Glaive stats', ITEM_CATALOG[305]?.pAtk, 232, errors);
  expectEq('Themis stats', ITEM_CATALOG[8686]?.pAtk, 202, errors);
  expectEq('Tiphon stats', ITEM_CATALOG[8683]?.pAtk, 251, errors);

  for (const entry of A_WEAPON_CATALOG.filter((e) => e.weaponType === 'fist')) {
    expectEq(`fist #${entry.itemId} speed 325`, entry.atkSpd, 325, errors);
  }
  for (const entry of A_WEAPON_CATALOG.filter((e) => e.weaponType === 'dagger')) {
    expectEq(`dagger #${entry.itemId} speed 433`, entry.atkSpd, 433, errors);
  }

  expectFalse('custom spellbook no sword mastery', swordBluntMasteryApplies('sword', 900201), errors);

  let inv1h = emptyInventory();
  inv1h = addItemToBag(inv1h, 628, 1);
  inv1h = addItemToBag(inv1h, 8678, 1);
  inv1h = equipFromBag(inv1h, 628, 0);
  inv1h = equipFromBag(inv1h, 8678, 0);
  expectEq('Sirra keeps shield', eqItemId(inv1h.eq.l2), 628, errors);

  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, 628, 1);
  inv2h = addItemToBag(inv2h, 81, 1);
  inv2h = equipFromBag(inv2h, 628, 0);
  inv2h = equipFromBag(inv2h, 81, 0);
  expectEq('Dragon Slayer clears shield', eqItemId(inv2h.eq.l2), null, errors);

  const wrongIds: Array<[string, number]> = [
    ['weapon_a/elysian.jpg', 290],
    ['weapon_a/soul_bow.jpg', 7575],
    ['weapon_a/dasparion_s_staff.jpg', 210],
    ['weapon_a/sword_of_miracles.jpg', 88],
    ['weapon_a/soul_separator.jpg', 900217],
    ['weapon_a/dragon_grinder.jpg', 231],
    ['weapon_a/halberd.jpg', 304],
  ];
  for (const [shopKey, badId] of wrongIds) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`${shopKey} must not use legacy itemId ${badId}`);
    }
  }

  if (errors.length > 0) {
    console.error('A weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`A weapons smoke OK (${A_WEAPON_SHOP_TOTAL} items, ${A_WEAPON_CANONICAL_COUNT} interlude + ${A_WEAPON_CUSTOM_COUNT} custom)`);
}

main();
