/**
 * Канонічна таблиця D-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';

export type DWeaponMode = 'phys' | 'magic';

export interface DWeaponCanonEntry {
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
  /** Interlude ETC — не отримує Sword/Blunt Mastery попри runtime sword. */
  excludeFromSwordBluntMastery?: boolean;
}

function d(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: DWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
  extra?: { excludeFromSwordBluntMastery?: boolean },
): DWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_d/${shopFile}`,
    nameUk,
    shopNameUk,
    mode,
    weaponType,
    blocksShield,
    atkSpd,
    pAtk,
    mAtk,
    wpnCrit,
    ...(extra?.excludeFromSwordBluntMastery ? { excludeFromSwordBluntMastery: true } : {}),
  };
}

/** Усі 21 D-grade предмет з магазину дропів. */
export const D_WEAPON_CATALOG: readonly DWeaponCanonEntry[] = [
  d(70, 'claymore.png', 'Клеймор D-grade.', 'Claymore', 'phys', 'bigsword', true, 325, 112, 54, 80),
  d(86, 'tomahawk.jpg', 'Томагавк D-grade.', 'Tomahawk — булава', 'phys', 'blunt', false, 379, 51, 32, 40),
  d(88, 'weapon_morning_star.png', 'Ранкова зірка D-grade.', 'Morning Star', 'phys', 'blunt', false, 379, 79, 47, 40),
  d(90, 'weapon_goathead_staff.png', 'Посох козлиної голови D-grade.', 'Goat Head Staff — посох', 'magic', 'bigblunt', true, 325, 77, 63, 40),
  d(124, 'two_handed_sword.jpg', 'Дворучний меч D-grade.', 'Two-Handed Sword — двуручний меч', 'phys', 'bigsword', true, 325, 78, 39, 80),
  d(128, 'knight_s_sword.jpg', 'Меч лицаря D-grade.', "Knight's Sword — меч", 'phys', 'sword', false, 379, 51, 32, 80),
  d(158, 'weapon_tarbar.png', 'Тарбар D-grade.', 'Tarbar', 'phys', 'blunt', false, 379, 79, 47, 40),
  d(159, 'bonebreaker.png', 'Костолом D-grade.', 'Bonebreaker', 'phys', 'blunt', false, 379, 92, 54, 40),
  d(187, 'atuba_hammer.jpg', 'Молот Атуби D-grade.', 'Atuba Hammer — булава', 'magic', 'bigblunt', true, 325, 90, 72, 40),
  d(189, 'weapon_life_stick.png', 'Посох життя D-grade.', 'Staff of Life — rod', 'magic', 'blunt', false, 379, 74, 72, 40),
  d(225, 'mithril-dagger.png', 'Міфриловий кинжал D-grade.', 'Mithril Dagger', 'phys', 'dagger', false, 433, 80, 54, 120),
  d(241, 'shilen_knife.jpg', 'Ніж Шілен D-grade.', 'Shilen Knife — кинжал', 'magic', 'dagger', false, 433, 45, 52, 120),
  d(2499, 'elven-long-sword.png', 'Довгий меч ельфів D-grade.', 'Elven Long Sword', 'phys', 'sword', false, 379, 92, 54, 80),
  // TODO: shopKey baguette_s_dualsword.jpg — неправильна іконка; замінити на Bich'Hwa, коли буде asset.
  d(261, 'baguette_s_dualsword.jpg', "Біч'Хва D-grade.", "Bich'Hwa — кастети", 'phys', 'fist', true, 325, 96, 47, 40),
  d(260, 'triple-edged_jamadhr.jpg', 'Тригранний Джамадхр D-grade.', 'Triple-Edged Jamadhr — кастети', 'phys', 'fist', true, 325, 78, 39, 40),
  d(262, 'scallop_jamadhr.png', 'Джамадхр мушлі D-grade.', 'Scallop Jamadhr — кастети', 'phys', 'fist', true, 325, 112, 54, 40),
  d(277, 'dark_elven_bow.jpg', 'Лук темних ельфів D-grade.', 'Dark Elven Bow — лук', 'phys', 'bow', true, 293, 105, 32, 120),
  d(280, 'light-crossbow.png', 'Легкий арбалет D-grade.', 'Light Crossbow', 'phys', 'bow', true, 293, 191, 54, 120),
  d(293, 'war_hammer.jpg', 'Бойовий молот D-grade.', 'War Hammer', 'phys', 'pole', true, 325, 64, 39, 80),
  d(297, 'glaive.png', 'Глефа D-grade.', 'Glaive', 'phys', 'pole', true, 325, 92, 54, 80),
  // Interlude source type: ETC (runtime sword, 1H, shield allowed; без Sword/Blunt Mastery)
  d(317, 'tome_of_blood.jpg', 'Том крові D-grade.', 'Tome of Blood — книга', 'magic', 'sword', false, 379, 51, 52, 80, {
    excludeFromSwordBluntMastery: true,
  }),
] as const;

export const D_WEAPON_ITEM_IDS = new Set<number>(
  D_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isDWeaponItemId(itemId: number): boolean {
  return D_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const D_WEAPON_BY_ITEM_ID: ReadonlyMap<number, DWeaponCanonEntry> =
  new Map(D_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const D_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, DWeaponCanonEntry> =
  new Map(D_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function dWeaponToItemMeta(entry: DWeaponCanonEntry): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    wpnCrit: entry.wpnCrit,
  };
  if (entry.excludeFromSwordBluntMastery) {
    meta.excludeFromSwordBluntMastery = true;
  }
  if (requiresArrowsForWeaponType(entry.weaponType)) {
    meta.requiresArrows = true;
  }
  return meta;
}
