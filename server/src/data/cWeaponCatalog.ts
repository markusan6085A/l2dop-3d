/**
 * Канонічна таблиця C-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude (+ 2 custom shop items).
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';

export type CWeaponMode = 'phys' | 'magic';
export type CWeaponCanonSource = 'interlude' | 'custom';

export interface CWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: CWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
  masteryFamily: WeaponKindForEnchant | null;
  canonSource: CWeaponCanonSource;
}

function c(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: CWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
  masteryFamily: WeaponKindForEnchant | null,
  canonSource: CWeaponCanonSource,
): CWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_c/${shopFile}`,
    nameUk,
    shopNameUk,
    mode,
    weaponType,
    blocksShield,
    atkSpd,
    pAtk,
    mAtk,
    wpnCrit,
    masteryFamily,
    canonSource,
  };
}

/** Усі 26 C-grade предметів з магазину дропів (24 Interlude + 2 custom). */
export const C_WEAPON_CATALOG: readonly CWeaponCanonEntry[] = [
  c(84, 'homunkulus_s_sword.jpg', 'Меч гомункула C-grade.', "Homunkulus's Sword", 'magic', 'sword', false, 379, 111, 101, 80, 'sword', 'interlude'),
  c(89, 'big_hammer.jpg', 'Великий молот C-grade.', 'Big Hammer', 'phys', 'blunt', false, 379, 107, 61, 40, 'blunt', 'interlude'),
  c(135, 'samurai_longsword.jpg', 'Довгий меч самурая C-grade.', 'Samurai Longsword', 'phys', 'sword', false, 379, 156, 83, 80, 'sword', 'interlude'),
  c(160, 'battle_axe.jpg', 'Бойова сокира C-grade.', 'Battle Axe', 'phys', 'blunt', false, 379, 107, 61, 40, 'blunt', 'interlude'),
  c(162, 'war_axe.jpg', 'Військова сокира C-grade.', 'War Axe', 'phys', 'blunt', false, 379, 139, 76, 40, 'blunt', 'interlude'),
  c(191, 'heavy_doom_hammer.jpg', 'Важкий молот загибелі C-grade.', 'Heavy Doom Hammer', 'magic', 'bigblunt', true, 325, 103, 81, 40, 'bigblunt', 'interlude'),
  c(194, 'heavy_doom_axe.jpg', 'Важка сокира загибелі C-grade.', 'Heavy Doom Axe', 'magic', 'bigblunt', true, 325, 103, 81, 40, 'bigblunt', 'interlude'),
  c(206, 'demon_s_staff.jpg', 'Посох демона C-grade.', "Demon's Staff", 'magic', 'bigblunt', true, 325, 152, 111, 40, 'bigblunt', 'interlude'),
  c(228, 'crystal_dagger.jpg', 'Кришталевий кинжал C-grade.', 'Crystal Dagger', 'phys', 'dagger', false, 433, 136, 83, 120, 'dagger', 'interlude'),
  c(233, 'dark_screamer.jpg', 'Темний викрик C-grade.', 'Dark Screamer', 'phys', 'dagger', false, 433, 122, 76, 120, 'dagger', 'interlude'),
  c(265, 'fisted_blade.jpg', 'Клинок-рукавиця C-grade.', 'Fisted Blade', 'phys', 'fist', true, 325, 169, 76, 40, 'fist', 'interlude'),
  c(266, 'great_pata.jpg', 'Велика пата C-grade.', 'Great Pata', 'phys', 'fist', true, 325, 190, 83, 40, 'fist', 'interlude'),
  c(283, 'akat_long_bow.jpg', 'Довгий лук Акат C-grade.', 'Akat Long Bow', 'phys', 'bow', true, 227, 316, 84, 120, 'bow', 'interlude'),
  c(286, 'eminence_bow.jpg', 'Лук Еміненс C-grade.', 'Eminence Bow', 'phys', 'bow', true, 293, 323, 83, 120, 'bow', 'interlude'),
  c(299, 'orcish_poleaxe.jpg', 'Оркська алебарда C-grade.', 'Orcish Poleaxe', 'phys', 'pole', true, 325, 156, 83, 80, 'pole', 'interlude'),
  c(301, 'scorpion.jpg', 'Скорпіон C-grade.', 'Scorpion', 'phys', 'pole', true, 325, 144, 78, 80, 'pole', 'interlude'),
  c(303, 'widow_maker.jpg', 'Творець вдови C-grade.', 'Widow Maker', 'phys', 'pole', true, 325, 144, 78, 80, 'pole', 'interlude'),
  c(326, 'heathens_book.jpg', 'Книга язичника C-grade.', "Heathen's Book", 'magic', 'sword', false, 379, 111, 101, 80, null, 'interlude'),
  c(2503, 'yaksa_mace.jpg', 'Булава Якса C-grade.', 'Yaksa Mace', 'phys', 'blunt', false, 379, 156, 83, 40, 'blunt', 'interlude'),
  c(4233, 'knuckle_duster.jpg', 'Кастет C-grade.', 'Knuckle Duster', 'phys', 'fist', true, 325, 148, 68, 40, 'fist', 'interlude'),
  c(5286, 'berserker_blade.jpg', 'Клинок берсерка C-grade.', 'Berserker Blade', 'phys', 'bigsword', true, 325, 190, 83, 80, 'bigsword', 'interlude'),
  c(7882, 'pa_agrian_sword.jpg', 'Меч Паагріан C-grade.', "Pa'agrian Sword", 'phys', 'bigsword', true, 325, 169, 76, 80, 'bigsword', 'interlude'),
  c(7888, 'ecliptic_sword.jpg', 'Екліптичний меч C-grade.', 'Ecliptic Sword', 'magic', 'sword', false, 379, 125, 111, 80, 'sword', 'interlude'),
  c(7897, 'dwarven_hammer.jpg', 'Дворфський молот C-grade.', 'Dwarven Hammer', 'phys', 'bigblunt', true, 325, 190, 83, 40, 'bigblunt', 'interlude'),
  c(900224, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет C-grade.', "Baguette's Dualsword", 'phys', 'dual', true, 325, 222, 38, 80, 'dual', 'custom'),
  c(900225, 'apprentices_spellbook.jpg', 'Заклинання учня C-grade. Магічна зброя.', "Apprentice's Spellbook", 'magic', 'sword', false, 379, 9, 95, 80, null, 'custom'),
] as const;

export const C_WEAPON_ITEM_IDS = new Set<number>(
  C_WEAPON_CATALOG.map((e) => e.itemId),
);

export function isCWeaponItemId(itemId: number): boolean {
  return C_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const C_WEAPON_BY_ITEM_ID: ReadonlyMap<number, CWeaponCanonEntry> =
  new Map(C_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const C_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, CWeaponCanonEntry> =
  new Map(C_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function cWeaponToItemMeta(entry: CWeaponCanonEntry): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    blocksShield: entry.blocksShield,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    wpnCrit: entry.wpnCrit,
    masteryFamily: entry.masteryFamily,
  };
  if (requiresArrowsForWeaponType(entry.weaponType)) {
    meta.requiresArrows = true;
  }
  return meta;
}
