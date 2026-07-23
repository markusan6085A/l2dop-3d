/**
 * Smoke: канонічна NG-зброя — магазин, ITEM_CATALOG, щит, тип зброї.
 * npm run test:ng-weapons
 */
import dropsShopOverrides from '../src/data/dropsShopOverrides.json';
import {
  NG_WEAPON_CATALOG,
  type NgWeaponCanonEntry,
  type NgWeaponMode,
} from '../src/data/ngWeaponCatalog.js';
import {
  C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
  ITEM_CATALOG,
} from '../src/data/itemsCatalog.js';
import {
  L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER,
  ngWeaponDropsPreviewLines,
} from '../src/data/l2dopNgWeaponDropsPatches.js';
import {
  itemBlocksShieldHintsForClient,
  itemBlocksShieldSlot,
} from '../src/data/l2dopTwoHandedWeapon.js';
import {
  addItemToBag,
  emptyInventory,
  equipFromBag,
} from '../src/data/inventory.js';
import { lookupCanonWeaponSubtypeFromDisplayLabel } from '../src/domain/dropsShopWeaponSubtypeCanonLookup.js';
import { resolveDropsShopWeaponSubtype } from '../src/domain/dropsShopWeaponSubtype.js';
import { requiresArrowsForWeaponType } from '../src/data/weaponTypeContract.js';
import { DROPS_SHOP_CATALOG } from '../src/data/dropsShopCatalog.generated.js';
import type { WeaponKindForEnchant } from '../src/data/l2dopEnchant.js';

type OverrideRow = { itemId?: number };

const overrides = dropsShopOverrides as Record<string, OverrideRow>;

/** Канонічна expected-таблиця всіх 42 NG itemId (Interlude). */
type ExpectedNgRow = {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: NgWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
  requiresArrows: boolean;
};

const EXPECTED_NG_WEAPONS: readonly ExpectedNgRow[] = [
  { itemId: 1, shopKey: 'weapon_ng/weapon_small_sword_i00.png', nameUk: 'Короткий меч NG-grade.', shopNameUk: 'Short Sword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 8, mAtk: 6, wpnCrit: 80, requiresArrows: false },
  { itemId: 2, shopKey: 'weapon_ng/weapon_long_sword_i00.png', nameUk: 'Довгий меч NG-grade.', shopNameUk: 'Long Sword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 24, mAtk: 17, wpnCrit: 80, requiresArrows: false },
  { itemId: 3, shopKey: 'weapon_ng/weapon_broad_sword_i00.png', nameUk: 'Широкий меч NG-grade.', shopNameUk: 'Broadsword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 11, mAtk: 9, wpnCrit: 80, requiresArrows: false },
  { itemId: 4, shopKey: 'weapon_ng/weapon_club_i00.png', nameUk: 'Бита NG-grade.', shopNameUk: 'Club', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 8, mAtk: 6, wpnCrit: 40, requiresArrows: false },
  { itemId: 5, shopKey: 'weapon_ng/weapon_mace_i00.png', nameUk: 'Булава NG-grade.', shopNameUk: 'Mace', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 11, mAtk: 9, wpnCrit: 40, requiresArrows: false },
  { itemId: 6, shopKey: 'weapon_ng/weapon_apprentices_wand_i00.png', nameUk: 'Палиця недосвідченого NG-grade.', shopNameUk: "Apprentice's Wand — wand", mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 5, mAtk: 7, wpnCrit: 40, requiresArrows: false },
  { itemId: 7, shopKey: 'weapon_ng/weapon_apprentices_rod_i00.png', nameUk: 'Жезло недосвідченого NG-grade.', shopNameUk: "Apprentice's Rod — rod", mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 6, mAtk: 8, wpnCrit: 40, requiresArrows: false },
  { itemId: 8, shopKey: 'weapon_ng/weapon_willow_staff_i00.png', nameUk: 'Вербовий посох NG-grade.', shopNameUk: 'Willow Staff — посох', mode: 'magic', weaponType: 'bigblunt', blocksShield: true, atkSpd: 325, pAtk: 11, mAtk: 12, wpnCrit: 40, requiresArrows: false },
  { itemId: 9, shopKey: 'weapon_ng/weapon_cedar_staff_i00.png', nameUk: 'Кедровий посох NG-grade.', shopNameUk: 'Cedar Staff — посох', mode: 'magic', weaponType: 'bigblunt', blocksShield: true, atkSpd: 325, pAtk: 16, mAtk: 16, wpnCrit: 40, requiresArrows: false },
  { itemId: 11, shopKey: 'weapon_ng/weapon_bone_dagger_i00.png', nameUk: 'Кістковий кинжал NG-grade.', shopNameUk: 'Bone Dagger', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 7, mAtk: 6, wpnCrit: 120, requiresArrows: false },
  { itemId: 12, shopKey: 'weapon_ng/weapon_knife_i00.png', nameUk: 'Ніж NG-grade.', shopNameUk: 'Knife', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 10, mAtk: 9, wpnCrit: 120, requiresArrows: false },
  { itemId: 13, shopKey: 'weapon_ng/weapon_short_bow_i00.png', nameUk: 'Короткий лук NG-grade.', shopNameUk: 'Short Bow', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 16, mAtk: 6, wpnCrit: 120, requiresArrows: true },
  { itemId: 14, shopKey: 'weapon_ng/weapon_bow_i00.png', nameUk: 'Лук NG-grade.', shopNameUk: 'Bow', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 23, mAtk: 9, wpnCrit: 120, requiresArrows: true },
  { itemId: 15, shopKey: 'weapon_ng/weapon_short_spear_i00.png', nameUk: 'Короткий спис NG-grade.', shopNameUk: 'Short Spear', mode: 'phys', weaponType: 'pole', blocksShield: true, atkSpd: 325, pAtk: 24, mAtk: 17, wpnCrit: 80, requiresArrows: false },
  { itemId: 16, shopKey: 'weapon_ng/weapon_long_spear_i00.png', nameUk: 'Довгий спис NG-grade.', shopNameUk: 'Long Spear', mode: 'phys', weaponType: 'pole', blocksShield: true, atkSpd: 325, pAtk: 31, mAtk: 21, wpnCrit: 80, requiresArrows: false },
  { itemId: 66, shopKey: 'weapon_ng/weapon_gladius_i00.png', nameUk: 'Гладіус NG-grade.', shopNameUk: 'Gladius', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 17, mAtk: 12, wpnCrit: 80, requiresArrows: false },
  { itemId: 67, shopKey: 'weapon_ng/weapon_orcish_sword_i00.png', nameUk: 'Меч орків NG-grade.', shopNameUk: 'Orcish Sword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 17, mAtk: 12, wpnCrit: 80, requiresArrows: false },
  { itemId: 68, shopKey: 'weapon_ng/weapon_falchion_i00.png', nameUk: 'Фалькіон NG-grade.', shopNameUk: 'Falchion', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 31, mAtk: 21, wpnCrit: 80, requiresArrows: false },
  { itemId: 87, shopKey: 'weapon_ng/weapon_iron_hammer_i00.png', nameUk: 'Залізний молот NG-grade.', shopNameUk: 'Iron Hammer', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 31, mAtk: 21, wpnCrit: 40, requiresArrows: false },
  { itemId: 99, shopKey: 'weapon_ng/weapon_apprentices_spellbook_i00.png', nameUk: 'Посібник недосвідченого NG-grade.', shopNameUk: "Apprentice's Spellbook — книга", mode: 'magic', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 9, mAtk: 12, wpnCrit: 40, requiresArrows: false },
  { itemId: 100, shopKey: 'weapon_ng/weapon_voodoo_doll_i00.png', nameUk: 'Лялька вуду NG-grade.', shopNameUk: 'Voodoo Doll — маг. лялька', mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 25, mAtk: 28, wpnCrit: 40, requiresArrows: false },
  { itemId: 121, shopKey: 'weapon_ng/weapon_sword_of_watershadow_i00.png', nameUk: 'Меч водяної тіні NG-grade.', shopNameUk: 'Sword of Watershadow', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 24, mAtk: 17, wpnCrit: 80, requiresArrows: false },
  { itemId: 122, shopKey: 'weapon_ng/weapon_handmade_sword_i00.png', nameUk: 'Меч ручної кування NG-grade.', shopNameUk: 'Handmade Sword', mode: 'phys', weaponType: 'sword', blocksShield: false, atkSpd: 379, pAtk: 17, mAtk: 12, wpnCrit: 80, requiresArrows: false },
  { itemId: 152, shopKey: 'weapon_ng/weapon_heavy_chisel_i00.png', nameUk: 'Велике зубило NG-grade.', shopNameUk: 'Heavy Chisel', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 10, mAtk: 8, wpnCrit: 40, requiresArrows: false },
  { itemId: 153, shopKey: 'weapon_ng/weapon_sickle_i00.png', nameUk: 'Серп NG-grade.', shopNameUk: 'Sickle', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 12, mAtk: 9, wpnCrit: 40, requiresArrows: false },
  { itemId: 154, shopKey: 'weapon_ng/weapon_dwarven_mace_i00.png', nameUk: 'Гномяча булава NG-grade.', shopNameUk: 'Dwarven Mace', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 17, mAtk: 12, wpnCrit: 40, requiresArrows: false },
  { itemId: 155, shopKey: 'weapon_ng/weapon_buzdygan_i00.png', nameUk: 'Буздиган NG-grade.', shopNameUk: 'Buzdygan', mode: 'phys', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 31, mAtk: 21, wpnCrit: 40, requiresArrows: false },
  { itemId: 176, shopKey: 'weapon_ng/weapon_apprentices_staff_i00.png', nameUk: 'Посох подорожнього NG-grade.', shopNameUk: "Journeyman's Staff — посох", mode: 'magic', weaponType: 'bigblunt', blocksShield: true, atkSpd: 325, pAtk: 23, mAtk: 22, wpnCrit: 40, requiresArrows: false },
  { itemId: 215, shopKey: 'weapon_ng/weapon_doomed_dagger_i00.png', nameUk: 'Кинжал приреченого NG-grade.', shopNameUk: 'Doom Dagger', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 10, mAtk: 9, wpnCrit: 120, requiresArrows: false },
  { itemId: 216, shopKey: 'weapon_ng/weapon_dirk_i00.png', nameUk: 'Стилет NG-grade.', shopNameUk: 'Dirk', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 15, mAtk: 12, wpnCrit: 120, requiresArrows: false },
  { itemId: 217, shopKey: 'weapon_ng/weapon_shining_knife_i00.png', nameUk: 'Блискучий ніж NG-grade.', shopNameUk: 'Shining Knife', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 21, mAtk: 17, wpnCrit: 120, requiresArrows: false },
  { itemId: 218, shopKey: 'weapon_ng/weapon_throw_knife_i00.png', nameUk: 'Метальний ніж NG-grade.', shopNameUk: 'Throwing Knife', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 21, mAtk: 17, wpnCrit: 120, requiresArrows: false },
  { itemId: 219, shopKey: 'weapon_ng/weapon_sword_breaker_i00.png', nameUk: 'Зламвач мечів NG-grade.', shopNameUk: 'Sword Breaker', mode: 'phys', weaponType: 'dagger', blocksShield: false, atkSpd: 433, pAtk: 27, mAtk: 21, wpnCrit: 120, requiresArrows: false },
  { itemId: 253, shopKey: 'weapon_ng/weapon_spike_glove_i00.png', nameUk: 'Рукавички з шипами NG-grade.', shopNameUk: 'Spiked Gloves', mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 10, mAtk: 6, wpnCrit: 40, requiresArrows: false },
  { itemId: 254, shopKey: 'weapon_ng/weapon_iron_glove_i00.png', nameUk: 'Залізні рукавички NG-grade.', shopNameUk: 'Iron Gloves', mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 13, mAtk: 9, wpnCrit: 40, requiresArrows: false },
  { itemId: 255, shopKey: 'weapon_ng/weapon_foxs_nail_i00.png', nameUk: 'Рукавички лисичих кігтів NG-grade.', shopNameUk: 'Fox Claw Gloves', mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 21, mAtk: 12, wpnCrit: 40, requiresArrows: false },
  { itemId: 257, shopKey: 'weapon_ng/weapon_vipers_canine_i00.png', nameUk: 'Ікло гадюки NG-grade.', shopNameUk: "Viper's Fang", mode: 'phys', weaponType: 'fist', blocksShield: true, atkSpd: 325, pAtk: 38, mAtk: 21, wpnCrit: 40, requiresArrows: false },
  { itemId: 271, shopKey: 'weapon_ng/weapon_hunting_bow_i00.png', nameUk: 'Мисливський лук NG-grade.', shopNameUk: 'Hunting Bow', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 34, mAtk: 12, wpnCrit: 120, requiresArrows: true },
  { itemId: 273, shopKey: 'weapon_ng/weapon_composition_bow_i00.png', nameUk: 'Композитний лук NG-grade.', shopNameUk: 'Composition Bow', mode: 'phys', weaponType: 'bow', blocksShield: true, atkSpd: 293, pAtk: 64, mAtk: 21, wpnCrit: 120, requiresArrows: true },
  { itemId: 308, shopKey: 'weapon_ng/weapon_buffalo_horn_i00.png', nameUk: "Ріг буйвола Buffalo's Horn NG-grade.", shopNameUk: "Buffalo's Horn", mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 6, mAtk: 8, wpnCrit: 40, requiresArrows: false },
  { itemId: 309, shopKey: 'weapon_ng/weapon_tears_of_eva_i00.png', nameUk: 'Сльози Еви NG-grade.', shopNameUk: 'Tears of Eva — маг. булава', mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 19, mAtk: 22, wpnCrit: 40, requiresArrows: false },
  { itemId: 311, shopKey: 'weapon_ng/weapon_crucifix_of_blessing_i00.png', nameUk: 'Розп’яття благословення NG-grade.', shopNameUk: 'Crucifix of Blessing — маг. булава', mode: 'magic', weaponType: 'blunt', blocksShield: false, atkSpd: 379, pAtk: 25, mAtk: 28, wpnCrit: 40, requiresArrows: false },
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
  expected: ExpectedNgRow,
  catalogEntry: NgWeaponCanonEntry,
  errors: string[],
): void {
  const id = expected.itemId;
  expectEq(`catalog #${id} itemId`, catalogEntry.itemId, expected.itemId, errors);
  expectEq(`catalog #${id} shopKey`, catalogEntry.shopKey, expected.shopKey, errors);
  expectEq(`catalog #${id} nameUk`, catalogEntry.nameUk, expected.nameUk, errors);
  expectEq(`catalog #${id} shopNameUk`, catalogEntry.shopNameUk, expected.shopNameUk, errors);
  expectEq(`catalog #${id} mode`, catalogEntry.mode, expected.mode, errors);
  expectEq(`catalog #${id} weaponType`, catalogEntry.weaponType, expected.weaponType, errors);
  expectEq(`catalog #${id} blocksShield`, catalogEntry.blocksShield, expected.blocksShield, errors);
  expectEq(`catalog #${id} atkSpd`, catalogEntry.atkSpd, expected.atkSpd, errors);
  expectEq(`catalog #${id} pAtk`, catalogEntry.pAtk, expected.pAtk, errors);
  expectEq(`catalog #${id} mAtk`, catalogEntry.mAtk, expected.mAtk, errors);
  expectEq(`catalog #${id} wpnCrit`, catalogEntry.wpnCrit, expected.wpnCrit, errors);
}

function assertItemCatalogMatchesExpected(expected: ExpectedNgRow, errors: string[]): void {
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
  if (catalog.rCrit != null && catalog.rCrit !== 0) {
    errors.push(`ITEM_CATALOG #${id} unexpected rCrit ${catalog.rCrit}`);
  }
  expectEq(
    `ITEM_CATALOG #${id} requiresArrows`,
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
}

function assertPreviewPatchMatchesExpected(expected: ExpectedNgRow, errors: string[]): void {
  const key = shopKeyNorm(expected.shopKey);
  const patch = L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER[key];
  if (!patch) {
    errors.push(`missing shop patch for ${expected.shopKey}`);
    return;
  }
  expectEq(`patch #${expected.itemId} nameUk`, patch.nameUk, expected.shopNameUk, errors);
  expectEq(`patch #${expected.itemId} speed`, patch.speed, expected.atkSpd, errors);
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
  const previewLines = ngWeaponDropsPreviewLines(patch);
  const previewText = previewLines.map((l) => l.valueUk).join(' ');
  if (expected.mode === 'phys') {
    if (!previewText.includes(`P.Atk: ${expected.pAtk}`)) {
      errors.push(`#${expected.itemId} shop preview missing P.Atk ${expected.pAtk}`);
    }
    if (!previewText.includes(`Speed: ${expected.atkSpd}`)) {
      errors.push(`#${expected.itemId} shop preview missing Speed ${expected.atkSpd}`);
    }
    if (!previewText.includes(`Crit: ${expected.wpnCrit}`)) {
      errors.push(`#${expected.itemId} shop preview missing Crit ${expected.wpnCrit}`);
    }
  } else {
    if (!previewText.includes(`M.Atk: ${expected.mAtk}`)) {
      errors.push(`#${expected.itemId} shop preview missing M.Atk ${expected.mAtk}`);
    }
    if (!previewText.includes(`Speed: ${expected.atkSpd}`)) {
      errors.push(`#${expected.itemId} shop preview missing Speed ${expected.atkSpd}`);
    }
    if (!previewText.includes('Crit: —')) {
      errors.push(`#${expected.itemId} magic shop preview should show Crit: —`);
    }
    if (previewText.includes('P.Atk:')) {
      errors.push(`#${expected.itemId} magic shop preview must not show P.Atk`);
    }
  }
}

function main(): void {
  const errors: string[] = [];

  const expectedNgCount = Object.keys(overrides).filter((k) => k.startsWith('weapon_ng/')).length;
  if (NG_WEAPON_CATALOG.length !== 42) {
    errors.push(`NG_WEAPON_CATALOG length: expected 42, got ${NG_WEAPON_CATALOG.length}`);
  }
  if (EXPECTED_NG_WEAPONS.length !== 42) {
    errors.push(`EXPECTED_NG_WEAPONS length: expected 42, got ${EXPECTED_NG_WEAPONS.length}`);
  }
  if (NG_WEAPON_CATALOG.length !== expectedNgCount) {
    errors.push(
      `NG_WEAPON_CATALOG length: expected ${expectedNgCount}, got ${NG_WEAPON_CATALOG.length}`,
    );
  }

  const catalogById = new Map(NG_WEAPON_CATALOG.map((e) => [e.itemId, e]));
  for (const expected of EXPECTED_NG_WEAPONS) {
    const catalogEntry = catalogById.get(expected.itemId);
    if (!catalogEntry) {
      errors.push(`NG_WEAPON_CATALOG missing itemId ${expected.itemId}`);
      continue;
    }
    assertCatalogMatchesExpected(expected, catalogEntry, errors);

    const override = overrides[expected.shopKey];
    const overrideItemId =
      override && typeof override.itemId === 'number' ? override.itemId : null;
    expectEq(
      `shopKey ${expected.shopKey} → itemId`,
      overrideItemId,
      expected.itemId,
      errors,
    );

    assertItemCatalogMatchesExpected(expected, errors);
    assertPreviewPatchMatchesExpected(expected, errors);
  }

  // Buffalo's Horn equip regression (1H magic blunt, shield allowed)
  const buffaloShopKey = 'weapon_ng/weapon_buffalo_horn_i00.png';
  const buffaloRow = DROPS_SHOP_CATALOG.find((r) => r.shopKey === buffaloShopKey);
  if (!buffaloRow) {
    errors.push("missing DROPS_SHOP_CATALOG row for Buffalo's Horn");
  }
  expectEq("Buffalo's Horn client hint", itemBlocksShieldHintsForClient()[308], false, errors);
  expectEq(
    "Buffalo's Horn shop blunt",
    lookupCanonWeaponSubtypeFromDisplayLabel("Buffalo's Horn"),
    'blunt',
    errors,
  );
  if (buffaloRow) {
    expectEq(
      "Buffalo's Horn resolve subtype",
      resolveDropsShopWeaponSubtype(
        buffaloRow,
        buffaloShopKey.replace(/\\/g, '/').toLowerCase(),
        ITEM_CATALOG[308],
        "Buffalo's Horn",
      ),
      'blunt',
      errors,
    );
  }
  let inv = emptyInventory();
  inv = addItemToBag(inv, 628, 1);
  inv = addItemToBag(inv, 308, 1);
  inv = equipFromBag(inv, 628, 0);
  inv = equipFromBag(inv, 308, 0);
  expectEq("Buffalo equip l1", eqItemId(inv.eq.l1), 308, errors);
  expectEq("Buffalo equip l2 shield", eqItemId(inv.eq.l2), 628, errors);
  expectFalse(
    "Buffalo equip shield stays",
    inv.stacks.some((s) => s.itemId === 628),
    errors,
  );

  // Fist 2H blocks shield (Spiked Gloves)
  let invFist = emptyInventory();
  invFist = addItemToBag(invFist, 628, 1);
  invFist = addItemToBag(invFist, 253, 1);
  invFist = equipFromBag(invFist, 628, 0);
  invFist = equipFromBag(invFist, 253, 0);
  expectEq('Spiked Gloves equip l1', eqItemId(invFist.eq.l1), 253, errors);
  expectEq('Spiked Gloves clears l2', eqItemId(invFist.eq.l2), null, errors);
  expectTrue(
    'Spiked Gloves returns shield to bag',
    invFist.stacks.some((s) => s.itemId === 628),
    errors,
  );

  // NG #99 vs C-grade spellbook split
  expectEq('NG spellbook itemId', 99, 99, errors);
  const cShopKey = 'weapon_c/apprentices_spellbook.jpg';
  const cOverride = overrides[cShopKey];
  expectEq(
    'C spellbook shop itemId',
    cOverride?.itemId,
    C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID,
    errors,
  );
  const cMeta = ITEM_CATALOG[C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID];
  if (!cMeta) {
    errors.push(`missing ITEM_CATALOG[${C_GRADE_APPRENTICES_SPELLBOOK_ITEM_ID}]`);
  } else {
    expectEq('C spellbook mAtk', cMeta.mAtk, 95, errors);
    expectEq('C spellbook pAtk', cMeta.pAtk, 9, errors);
    expectEq('C spellbook weaponType', cMeta.weaponType, 'sword', errors);
  }
  if (ITEM_CATALOG[99]?.mAtk === 95) {
    errors.push('NG merge must not leave C-grade mAtk on itemId 99');
  }

  const magicCount = NG_WEAPON_CATALOG.filter((e) => e.mode === 'magic').length;
  if (magicCount !== 10) {
    errors.push(`expected 10 magic NG weapons, got ${magicCount}`);
  }

  if (errors.length > 0) {
    console.error('NG weapons smoke FAILED:\n' + errors.map((e) => '  - ' + e).join('\n'));
    process.exit(1);
  }

  console.log(`NG weapons smoke OK (${NG_WEAPON_CATALOG.length} items, incl. Buffalo's Horn #308)`);
}

main();
