/**
 * Канонічна таблиця NG-зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type NgWeaponMode = 'magic' | 'phys';

export interface NgWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  /** Українська назва для ITEM_CATALOG / інвентаря. */
  nameUk: string;
  /** Назва в списку магазину дропів (може бути латиницею). */
  shopNameUk: string;
  mode: NgWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  /** Базовий крит зброї ($WpnCrt): 40 / 80 / 120 за типом. */
  wpnCrit: number;
}

function ng(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: NgWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
): NgWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_ng/${shopFile}`,
    nameUk,
    shopNameUk,
    mode,
    weaponType,
    blocksShield,
    atkSpd,
    pAtk,
    mAtk,
    wpnCrit,
  };
}

/** Усі 42 NG-предмети з магазину дропів (включно з Buffalo's Horn). */
export const NG_WEAPON_CATALOG: readonly NgWeaponCanonEntry[] = [
  ng(1, 'weapon_small_sword_i00.png', 'Короткий меч NG-grade.', 'Short Sword', 'phys', 'sword', false, 379, 8, 6, 80),
  ng(2, 'weapon_long_sword_i00.png', 'Довгий меч NG-grade.', 'Long Sword', 'phys', 'sword', false, 379, 24, 17, 80),
  ng(3, 'weapon_broad_sword_i00.png', 'Широкий меч NG-grade.', 'Broadsword', 'phys', 'sword', false, 379, 11, 9, 80),
  ng(4, 'weapon_club_i00.png', 'Бита NG-grade.', 'Club', 'phys', 'blunt', false, 379, 8, 6, 40),
  ng(5, 'weapon_mace_i00.png', 'Булава NG-grade.', 'Mace', 'phys', 'blunt', false, 379, 11, 9, 40),
  ng(6, 'weapon_apprentices_wand_i00.png', 'Палиця недосвідченого NG-grade.', "Apprentice's Wand — wand", 'magic', 'blunt', false, 379, 5, 7, 40),
  ng(7, 'weapon_apprentices_rod_i00.png', 'Жезло недосвідченого NG-grade.', "Apprentice's Rod — rod", 'magic', 'blunt', false, 379, 6, 8, 40),
  ng(8, 'weapon_willow_staff_i00.png', 'Вербовий посох NG-grade.', 'Willow Staff — посох', 'magic', 'bigblunt', true, 325, 11, 12, 40),
  ng(9, 'weapon_cedar_staff_i00.png', 'Кедровий посох NG-grade.', 'Cedar Staff — посох', 'magic', 'bigblunt', true, 325, 16, 16, 40),
  ng(11, 'weapon_bone_dagger_i00.png', 'Кістковий кинжал NG-grade.', 'Bone Dagger', 'phys', 'dagger', false, 433, 7, 6, 120),
  ng(12, 'weapon_knife_i00.png', 'Ніж NG-grade.', 'Knife', 'phys', 'dagger', false, 433, 10, 9, 120),
  ng(13, 'weapon_short_bow_i00.png', 'Короткий лук NG-grade.', 'Short Bow', 'phys', 'bow', true, 293, 16, 6, 120),
  ng(14, 'weapon_bow_i00.png', 'Лук NG-grade.', 'Bow', 'phys', 'bow', true, 293, 23, 9, 120),
  ng(15, 'weapon_short_spear_i00.png', 'Короткий спис NG-grade.', 'Short Spear', 'phys', 'pole', true, 325, 24, 17, 80),
  ng(16, 'weapon_long_spear_i00.png', 'Довгий спис NG-grade.', 'Long Spear', 'phys', 'pole', true, 325, 31, 21, 80),
  ng(66, 'weapon_gladius_i00.png', 'Гладіус NG-grade.', 'Gladius', 'phys', 'sword', false, 379, 17, 12, 80),
  ng(67, 'weapon_orcish_sword_i00.png', 'Меч орків NG-grade.', 'Orcish Sword', 'phys', 'sword', false, 379, 17, 12, 80),
  ng(68, 'weapon_falchion_i00.png', 'Фалькіон NG-grade.', 'Falchion', 'phys', 'sword', false, 379, 31, 21, 80),
  ng(87, 'weapon_iron_hammer_i00.png', 'Залізний молот NG-grade.', 'Iron Hammer', 'phys', 'blunt', false, 379, 31, 21, 40),
  // Interlude source type: etc (runtime sword, 1H, shield allowed)
  ng(99, 'weapon_apprentices_spellbook_i00.png', 'Посібник недосвідченого NG-grade.', "Apprentice's Spellbook — книга", 'magic', 'sword', false, 379, 9, 12, 40),
  // Interlude source type: etc (runtime blunt, 1H, shield allowed)
  ng(100, 'weapon_voodoo_doll_i00.png', 'Лялька вуду NG-grade.', 'Voodoo Doll — маг. лялька', 'magic', 'blunt', false, 379, 25, 28, 40),
  ng(121, 'weapon_sword_of_watershadow_i00.png', 'Меч водяної тіні NG-grade.', 'Sword of Watershadow', 'phys', 'sword', false, 379, 24, 17, 80),
  ng(122, 'weapon_handmade_sword_i00.png', 'Меч ручної кування NG-grade.', 'Handmade Sword', 'phys', 'sword', false, 379, 17, 12, 80),
  ng(152, 'weapon_heavy_chisel_i00.png', 'Велике зубило NG-grade.', 'Heavy Chisel', 'phys', 'blunt', false, 379, 10, 8, 40),
  ng(153, 'weapon_sickle_i00.png', 'Серп NG-grade.', 'Sickle', 'phys', 'blunt', false, 379, 12, 9, 40),
  ng(154, 'weapon_dwarven_mace_i00.png', 'Гномяча булава NG-grade.', 'Dwarven Mace', 'phys', 'blunt', false, 379, 17, 12, 40),
  ng(155, 'weapon_buzdygan_i00.png', 'Буздиган NG-grade.', 'Buzdygan', 'phys', 'blunt', false, 379, 31, 21, 40),
  ng(176, 'weapon_apprentices_staff_i00.png', 'Посох подорожнього NG-grade.', "Journeyman's Staff — посох", 'magic', 'bigblunt', true, 325, 23, 22, 40),
  ng(215, 'weapon_doomed_dagger_i00.png', 'Кинжал приреченого NG-grade.', 'Doom Dagger', 'phys', 'dagger', false, 433, 10, 9, 120),
  ng(216, 'weapon_dirk_i00.png', 'Стилет NG-grade.', 'Dirk', 'phys', 'dagger', false, 433, 15, 12, 120),
  ng(217, 'weapon_shining_knife_i00.png', 'Блискучий ніж NG-grade.', 'Shining Knife', 'phys', 'dagger', false, 433, 21, 17, 120),
  ng(218, 'weapon_throw_knife_i00.png', 'Метальний ніж NG-grade.', 'Throwing Knife', 'phys', 'dagger', false, 433, 21, 17, 120),
  ng(219, 'weapon_sword_breaker_i00.png', 'Зламвач мечів NG-grade.', 'Sword Breaker', 'phys', 'dagger', false, 433, 27, 21, 120),
  ng(253, 'weapon_spike_glove_i00.png', 'Рукавички з шипами NG-grade.', 'Spiked Gloves', 'phys', 'fist', true, 325, 10, 6, 40),
  ng(254, 'weapon_iron_glove_i00.png', 'Залізні рукавички NG-grade.', 'Iron Gloves', 'phys', 'fist', true, 325, 13, 9, 40),
  ng(255, 'weapon_foxs_nail_i00.png', 'Рукавички лисичих кігтів NG-grade.', 'Fox Claw Gloves', 'phys', 'fist', true, 325, 21, 12, 40),
  ng(257, 'weapon_vipers_canine_i00.png', 'Ікло гадюки NG-grade.', "Viper's Fang", 'phys', 'fist', true, 325, 38, 21, 40),
  ng(271, 'weapon_hunting_bow_i00.png', 'Мисливський лук NG-grade.', 'Hunting Bow', 'phys', 'bow', true, 293, 34, 12, 120),
  ng(273, 'weapon_composition_bow_i00.png', 'Композитний лук NG-grade.', 'Composition Bow', 'phys', 'bow', true, 293, 64, 21, 120),
  // Interlude source type: etc (runtime blunt, 1H, shield allowed)
  ng(308, 'weapon_buffalo_horn_i00.png', "Ріг буйвола Buffalo's Horn NG-grade.", "Buffalo's Horn", 'magic', 'blunt', false, 379, 6, 8, 40),
  // Interlude source type: etc (runtime blunt, 1H, shield allowed)
  ng(309, 'weapon_tears_of_eva_i00.png', 'Сльози Еви NG-grade.', 'Tears of Eva — маг. булава', 'magic', 'blunt', false, 379, 19, 22, 40),
  // Interlude source type: etc (runtime blunt, 1H, shield allowed)
  ng(311, 'weapon_crucifix_of_blessing_i00.png', 'Розп’яття благословення NG-grade.', 'Crucifix of Blessing — маг. булава', 'magic', 'blunt', false, 379, 25, 28, 40),
] as const;

export const NG_WEAPON_ITEM_IDS = new Set<number>(
  NG_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isNgWeaponItemId(itemId: number): boolean {
  return NG_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const NG_WEAPON_BY_ITEM_ID: ReadonlyMap<number, NgWeaponCanonEntry> =
  new Map(NG_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const NG_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, NgWeaponCanonEntry> =
  new Map(NG_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function ngWeaponToItemMeta(
  entry: NgWeaponCanonEntry,
  _existing?: ItemMeta,
): ItemMeta {
  return {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    wpnCrit: entry.wpnCrit,
  };
}
