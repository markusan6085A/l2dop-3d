/**
 * Smoke: канонічна S-grade зброя — магазин, ITEM_CATALOG, RB, міграція, Coin of Luck.
 * npm run test:s-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  sGradeWeaponDropsPreviewLines,
} from '../src/data/l2dopSWeaponDropsPatches.js';
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
  S_WEAPON_BY_ITEM_ID,
  S_WEAPON_CATALOG,
  S_WEAPON_CUSTOM_COUNT,
  S_WEAPON_EVENT_ITEM_IDS,
  S_WEAPON_INTERLUDE_COUNT,
  S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID,
  S_WEAPON_SHOP_TOTAL,
  type SWeaponCanonEntry,
  type SWeaponCanonSource,
  type SWeaponMode,
} from '../src/data/sWeaponCatalog.js';
import {
  LEGACY_S_WEAPON_ID_MAP,
  mapLegacySWeaponItemId,
  preflightSWeaponMigration,
  remapInventoryState,
  S_WEAPON_ITEM_ID_MIGRATION_MARKER,
} from '../src/data/sWeaponItemIdMigration.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';
import { colPriceForBasEquipment } from '../src/domain/dropsShopCoinOfLuckPricing.js';
import { RB_DROP_ITEM_S } from '../src/data/l2dopRaidBossDropSharedS.js';
import { loadDropsShopOverrides } from '../src/services/dropsShopService.js';
import { buildDropsShopCatalogForClient } from '../src/services/dropsShopService.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;
const S_WEAPON_COL_PRICE = colPriceForBasEquipment('S', 'weapon');

type ExpectedSRow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  canonSource: SWeaponCanonSource;
  mode: SWeaponMode;
  weaponType: WeaponKindForEnchant;
  masteryFamily: WeaponKindForEnchant | null;
  blocksShield: boolean;
  requiresArrows: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
};

const EXPECTED_S_WEAPONS: readonly ExpectedSRow[] = [
  { itemId: 910201, shopKey: 'weapon_s/apprentices_spellbook.jpg', nameUk: 'Книга заклинань учня S-grade. Магічна зброя.', shopNameUk: "Apprentice's Spellbook", canonSource: 'custom', mode: 'magic', weaponType: 'sword', masteryFamily: null, blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 9, mAtk: 340, wpnCrit: 80 },
  { itemId: 910202, shopKey: 'weapon_s/baguette_s_dualsword.jpg', nameUk: 'Дворучний меч Багет S-grade. Дворучна зброя.', shopNameUk: "Baguette's Dualsword", canonSource: 'custom', mode: 'phys', weaponType: 'dual', masteryFamily: 'dual', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 570, mAtk: 132, wpnCrit: 80 },
  { itemId: 6367, shopKey: 'weapon_s/angel_slayer.jpg', nameUk: 'Вбивця янголів S-grade.', shopNameUk: 'Angel Slayer', canonSource: 'interlude', mode: 'phys', weaponType: 'dagger', masteryFamily: 'dagger', blocksShield: false, requiresArrows: false, atkSpd: 433, pAtk: 246, mAtk: 132, wpnCrit: 120 },
  { itemId: 6579, shopKey: 'weapon_s/arcana_mace.jpg', nameUk: 'Булава аркани S-grade. Магічна зброя.', shopNameUk: 'Arcana Mace', canonSource: 'interlude', mode: 'magic', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 225, mAtk: 175, wpnCrit: 40 },
  { itemId: 6365, shopKey: 'weapon_s/basalt_battlehammer.jpg', nameUk: 'Базальтовий бойовий молот S-grade.', shopNameUk: 'Basalt Battlehammer', canonSource: 'interlude', mode: 'phys', weaponType: 'blunt', masteryFamily: 'blunt', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 281, mAtk: 132, wpnCrit: 40 },
  { itemId: 6371, shopKey: 'weapon_s/demon_splinter.jpg', nameUk: 'Уламок демона S-grade. Дворучна зброя.', shopNameUk: 'Demon Splinter', canonSource: 'interlude', mode: 'phys', weaponType: 'fist', masteryFamily: 'fist', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 342, mAtk: 132, wpnCrit: 40 },
  { itemId: 7575, shopKey: 'weapon_s/draconic_bow.jpg', nameUk: 'Драконічний лук S-grade. Дальня атака.', shopNameUk: 'Draconic Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 293, pAtk: 581, mAtk: 132, wpnCrit: 120 },
  { itemId: 6369, shopKey: 'weapon_s/dragon_hunter_axe.jpg', nameUk: 'Сокира мисливця на драконів S-grade. Дворучна зброя.', shopNameUk: 'Dragon Hunter Axe', canonSource: 'interlude', mode: 'phys', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 342, mAtk: 132, wpnCrit: 40 },
  { itemId: 82, shopKey: 'weapon_s/god_s_blade.jpg', nameUk: 'Клинок бога S-grade.', shopNameUk: "God's Blade", canonSource: 'interlude', mode: 'phys', weaponType: 'sword', masteryFamily: 'sword', blocksShield: false, requiresArrows: false, atkSpd: 379, pAtk: 257, mAtk: 124, wpnCrit: 80 },
  { itemId: 6372, shopKey: 'weapon_s/heaven_s_divider.jpg', nameUk: 'Роздільник небес S-grade. Дворучна зброя.', shopNameUk: "Heaven's Divider", canonSource: 'interlude', mode: 'phys', weaponType: 'bigsword', masteryFamily: 'bigsword', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 342, mAtk: 132, wpnCrit: 80 },
  { itemId: 6366, shopKey: 'weapon_s/imperial_staff.jpg', nameUk: 'Імператорський посох S-grade. Дворучна магічна зброя.', shopNameUk: 'Imperial Staff', canonSource: 'interlude', mode: 'magic', weaponType: 'bigblunt', masteryFamily: 'bigblunt', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 274, mAtk: 175, wpnCrit: 40 },
  { itemId: 6370, shopKey: 'weapon_s/saint_spear.jpg', nameUk: 'Святий спіс S-grade. Дворучна зброя.', shopNameUk: 'Saint Spear', canonSource: 'interlude', mode: 'phys', weaponType: 'pole', masteryFamily: 'pole', blocksShield: true, requiresArrows: false, atkSpd: 325, pAtk: 281, mAtk: 132, wpnCrit: 80 },
  { itemId: 6368, shopKey: 'weapon_s/shining_bow.jpg', nameUk: 'Сяючий лук S-grade. Дальня атака.', shopNameUk: 'Shining Bow', canonSource: 'interlude', mode: 'phys', weaponType: 'bow', masteryFamily: 'bow', blocksShield: true, requiresArrows: true, atkSpd: 293, pAtk: 581, mAtk: 132, wpnCrit: 120 },
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

function assertCatalogMatchesExpected(expected: ExpectedSRow, entry: SWeaponCanonEntry, errors: string[]): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, entry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} canonSource`, entry.canonSource, expected.canonSource, errors);
  expectEq(`catalog #${id} weaponType`, entry.weaponType, expected.weaponType, errors);
  expectEq(`catalog #${id} masteryFamily`, entry.masteryFamily, expected.masteryFamily, errors);
  expectEq(`catalog #${id} blocksShield`, entry.blocksShield, expected.blocksShield, errors);
  expectEq(`catalog #${id} atkSpd`, entry.atkSpd, expected.atkSpd, errors);
  expectEq(`catalog #${id} pAtk`, entry.pAtk, expected.pAtk, errors);
  expectEq(`catalog #${id} mAtk`, entry.mAtk, expected.mAtk, errors);
  expectEq(`catalog #${id} wpnCrit`, entry.wpnCrit, expected.wpnCrit, errors);
}

function assertItemCatalogMatchesExpected(expected: ExpectedSRow, errors: string[]): void {
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

function assertPreviewPatchMatchesExpected(expected: ExpectedSRow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  expectEq(`patch #${expected.itemId} pAtk`, patch.pAtk, expected.pAtk, errors);
  expectEq(`patch #${expected.itemId} mAtk`, patch.mAtk, expected.mAtk, errors);
  expectEq(`patch #${expected.itemId} speed`, patch.speed, expected.atkSpd, errors);
  expectEq(`patch #${expected.itemId} crit`, patch.crit, expected.wpnCrit, errors);
  assertWeaponShopPreviewLines(
    sGradeWeaponDropsPreviewLines(patch),
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
    ['angelSlayer', 6367],
    ['arcanaMace', 6579],
    ['basaltBattlehammer', 6365],
    ['demonSplinter', 6371],
    ['draconicBow', 7575],
    ['dragonHunterAxe', 6369],
    ['godsBlade', 82],
    ['heavensDivider', 6372],
    ['imperialStaff', 6366],
    ['saintSpear', 6370],
    ['shiningBow', 6368],
    ['apprenticesSpellbook', 910201],
    ['baguettesDualsword', 910202],
  ] as const;
  for (const [key, expectedId] of rbWeaponKeys) {
    const def = RB_DROP_ITEM_S[key];
    expectEq(`RB S ${key}`, def.l2ItemId, expectedId, errors);
  }
}

function assertShopColPricing(errors: string[]): void {
  const client = buildDropsShopCatalogForClient();
  for (const g of client.grades) {
    if (g.grade !== 'S') continue;
    for (const s of g.sections) {
      if (s.category !== 'weapon') continue;
      for (const it of s.items) {
        if (!it.purchasable) continue;
        expectEq(`S shop ${it.shopKey} COL`, it.priceCoinOfLuck, 200, errors);
        expectEq(`S shop ${it.shopKey} adena null`, it.priceAdena, null, errors);
      }
    }
  }
}

function assertMigrationLogic(errors: string[]): void {
  const cases: Array<[number, number]> = [
    [20166, 6372],
    [20167, 6367],
    [20168, 6365],
    [20169, 6369],
    [20170, 6579],
    [20171, 6366],
    [20172, 6371],
    [20173, 7575],
    [20174, 6370],
    [910203, 6368],
  ];
  for (const [from, to] of cases) {
    expectEq(`migrate ${from}`, mapLegacySWeaponItemId(from), to, errors);
  }
  expectEq('God\'s Blade unchanged', mapLegacySWeaponItemId(82), 82, errors);
  expectEq('custom spellbook unchanged', mapLegacySWeaponItemId(910201), 910201, errors);

  const preflight = preflightSWeaponMigration();
  expectFalse('preflight event ambiguity', preflight.eventAmbiguity, errors);
  expectFalse('preflight cross-grade collision', preflight.crossGradeCollision, errors);

  const inv: InventoryState = {
    v: 1,
    stacks: [
      { itemId: 20173, qty: 1, enchant: 5 },
      { itemId: 910203, qty: 2, enchant: 3 },
    ],
    eq: { l1: { itemId: 20167, enchant: 4 }, l2: 628 },
  };
  const migrated = remapInventoryState(inv);
  expectEq('migrate Draconic Bow stack', migrated.stacks.find((s) => s.itemId === 7575)?.enchant, 5, errors);
  expectEq('migrate Shining Bow stack', migrated.stacks.find((s) => s.itemId === 6368)?.enchant, 3, errors);
  expectEq('migrate Angel Slayer equip', eqItemId(migrated.eq.l1), 6367, errors);
  expectEq('migrate Angel Slayer enchant', (migrated.eq.l1 as { enchant?: number }).enchant, 4, errors);
  expectEq('migrate shield kept', eqItemId(migrated.eq.l2), 628, errors);

  expectEq('migration marker constant', S_WEAPON_ITEM_ID_MIGRATION_MARKER, 'S_WEAPON_ITEM_ID_MIGRATION_V1', errors);
  expectEq('legacy map size', Object.keys(LEGACY_S_WEAPON_ID_MAP).length, 10, errors);
}

function main(): void {
  const errors: string[] = [];

  expectEq('S_WEAPON_SHOP_TOTAL', S_WEAPON_SHOP_TOTAL, 13, errors);
  expectEq('S_WEAPON_INTERLUDE_COUNT', S_WEAPON_INTERLUDE_COUNT, 11, errors);
  expectEq('S_WEAPON_CUSTOM_COUNT', S_WEAPON_CUSTOM_COUNT, 2, errors);
  expectEq('S COL weapon price', S_WEAPON_COL_PRICE, 200, errors);

  const ids = S_WEAPON_CATALOG.map((e) => e.itemId);
  if (new Set(ids).size !== ids.length) errors.push('duplicate itemId in S_WEAPON_CATALOG');

  const shopKeys = S_WEAPON_CATALOG.map((e) => shopKeyNorm(e.shopKey));
  if (new Set(shopKeys).size !== shopKeys.length) errors.push('duplicate shopKey in S_WEAPON_CATALOG');

  expectEq('no Forgotten Blade 6364', S_WEAPON_BY_ITEM_ID.has(6364), false, errors);
  expectEq("God's Blade id 82", S_WEAPON_BY_ITEM_ID.get(82)?.shopNameUk, "God's Blade", errors);

  const catalogById = new Map(S_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  const runtimeOverrides = loadDropsShopOverrides();

  for (const expected of EXPECTED_S_WEAPONS) {
    const entry = catalogById.get(expected.itemId);
    if (!entry) {
      errors.push(`S_WEAPON_CATALOG missing itemId ${expected.itemId}`);
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

  assertRbDropMapping(errors);
  assertShopColPricing(errors);
  assertMigrationLogic(errors);

  // Regression
  expectEq('Angel Slayer stats', ITEM_CATALOG[6367]?.pAtk, 246, errors);
  expectEq('Angel Slayer crit', ITEM_CATALOG[6367]?.wpnCrit, 120, errors);
  expectEq('Arcana Mace mAtk', ITEM_CATALOG[6579]?.mAtk, 175, errors);
  expectEq('Basalt stats', ITEM_CATALOG[6365]?.pAtk, 281, errors);
  expectEq('Demon Splinter speed', ITEM_CATALOG[6371]?.atkSpd, 325, errors);
  expectEq('Demon Splinter stats', ITEM_CATALOG[6371]?.pAtk, 342, errors);
  expectEq('Draconic Bow stats', ITEM_CATALOG[7575]?.pAtk, 581, errors);
  expectEq('Dragon Hunter stats', ITEM_CATALOG[6369]?.pAtk, 342, errors);
  expectEq("God's Blade stats", ITEM_CATALOG[82]?.pAtk, 257, errors);
  expectEq("God's Blade crit", ITEM_CATALOG[82]?.wpnCrit, 80, errors);
  expectEq("Heaven's Divider stats", ITEM_CATALOG[6372]?.pAtk, 342, errors);
  expectEq("Heaven's Divider crit", ITEM_CATALOG[6372]?.wpnCrit, 80, errors);
  expectEq('Imperial Staff mAtk', ITEM_CATALOG[6366]?.mAtk, 175, errors);
  expectEq('Saint Spear crit', ITEM_CATALOG[6370]?.wpnCrit, 80, errors);
  expectEq('Shining Bow stats', ITEM_CATALOG[6368]?.pAtk, 581, errors);
  expectEq('Spellbook mastery null', ITEM_CATALOG[910201]?.masteryFamily ?? null, null, errors);
  expectEq('Spellbook crit', ITEM_CATALOG[910201]?.wpnCrit, 80, errors);
  expectEq('Baguette crit', ITEM_CATALOG[910202]?.wpnCrit, 80, errors);

  for (const entry of S_WEAPON_CATALOG.filter((e) => e.weaponType === 'dagger' || e.weaponType === 'bow')) {
    expectEq(`#${entry.itemId} crit 120`, entry.wpnCrit, 120, errors);
  }
  for (const entry of S_WEAPON_CATALOG.filter((e) =>
    e.weaponType === 'sword' || e.weaponType === 'bigsword' || e.weaponType === 'dual' || e.weaponType === 'pole',
  )) {
    expectEq(`#${entry.itemId} crit 80`, entry.wpnCrit, 80, errors);
  }
  for (const entry of S_WEAPON_CATALOG.filter((e) =>
    e.weaponType === 'blunt' || e.weaponType === 'bigblunt' || e.weaponType === 'fist',
  )) {
    if (entry.canonSource === 'custom') continue;
    expectEq(`#${entry.itemId} crit 40`, entry.wpnCrit, 40, errors);
  }

  expectEq('Draconic vs Shining distinct ids', 7575 !== 6368, true, errors);
  expectEq('Draconic Bow id', ITEM_CATALOG[7575] && S_WEAPON_BY_ITEM_ID.get(7575)?.shopNameUk, 'Draconic Bow', errors);
  expectEq('Shining Bow id', ITEM_CATALOG[6368] && S_WEAPON_BY_ITEM_ID.get(6368)?.shopNameUk, 'Shining Bow', errors);

  expectFalse('custom spellbook no sword mastery', swordBluntMasteryApplies('sword', 910201), errors);

  let inv1h = emptyInventory();
  inv1h = addItemToBag(inv1h, 628, 1);
  inv1h = addItemToBag(inv1h, 82, 1);
  inv1h = equipFromBag(inv1h, 628, 0);
  inv1h = equipFromBag(inv1h, 82, 0);
  expectEq("God's Blade keeps shield", eqItemId(inv1h.eq.l2), 628, errors);

  let inv2h = emptyInventory();
  inv2h = addItemToBag(inv2h, 628, 1);
  inv2h = addItemToBag(inv2h, 6371, 1);
  inv2h = equipFromBag(inv2h, 628, 0);
  inv2h = equipFromBag(inv2h, 6371, 0);
  expectEq('Demon Splinter clears shield', eqItemId(inv2h.eq.l2), null, errors);

  const eventIds = [...S_WEAPON_EVENT_ITEM_IDS, S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID];
  for (const [shopKey, row] of Object.entries(overrides)) {
    if (!shopKey.startsWith('weapon_s/')) continue;
    if (row.itemId != null && eventIds.includes(row.itemId)) {
      errors.push(`dropsShopOverrides ${shopKey} uses legacy itemId ${row.itemId}`);
    }
  }
  for (const def of Object.values(RB_DROP_ITEM_S)) {
    if (!def.iconUrl.includes('/weapon_s/')) continue;
    if (eventIds.includes(def.l2ItemId)) {
      errors.push(`RB_DROP_ITEM_S ${def.displayName} uses legacy itemId ${def.l2ItemId}`);
    }
  }

  const wrongIds: Array<[string, number]> = [
    ['weapon_s/heaven_s_divider.jpg', 20166],
    ['weapon_s/angel_slayer.jpg', 20167],
    ['weapon_s/basalt_battlehammer.jpg', 20168],
    ['weapon_s/dragon_hunter_axe.jpg', 20169],
    ['weapon_s/arcana_mace.jpg', 20170],
    ['weapon_s/imperial_staff.jpg', 20171],
    ['weapon_s/demon_splinter.jpg', 20172],
    ['weapon_s/draconic_bow.jpg', 20173],
    ['weapon_s/saint_spear.jpg', 20174],
    ['weapon_s/shining_bow.jpg', 910203],
  ];
  for (const [shopKey, badId] of wrongIds) {
    if (overrides[shopKey]?.itemId === badId) {
      errors.push(`${shopKey} must not use legacy itemId ${badId}`);
    }
  }

  if (errors.length > 0) {
    console.error('S weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`S weapons smoke OK (${S_WEAPON_SHOP_TOTAL} items, ${S_WEAPON_INTERLUDE_COUNT} interlude + ${S_WEAPON_CUSTOM_COUNT} custom)`);
}

main();
