/**
 * Канонічна таблиця C-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type CWeaponMode = 'phys' | 'magic';

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
  mAtk?: number;
  wpnCrit: number;
  displayCrit?: number;
}

function c(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  wpnCrit: number,
  extra?: { mode?: CWeaponMode; mAtk?: number; displayCrit?: number },
): CWeaponCanonEntry {
  const mode = extra?.mode ?? 'phys';
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
    wpnCrit,
    ...(extra?.mAtk != null ? { mAtk: extra.mAtk } : {}),
    ...(mode === 'phys' ? { displayCrit: extra?.displayCrit ?? wpnCrit } : {}),
  };
}

/** Усі 26 C-grade предметів з магазину дропів. */
export const C_WEAPON_CATALOG: readonly CWeaponCanonEntry[] = [
  c(283, 'akat_long_bow.jpg', 'Довгий лук Акат C-grade.', 'Akat Long Bow', 'bow', true, 293, 413, 120, { mAtk: 84 }),
  c(900225, 'apprentices_spellbook.jpg', 'Заклинання учня C-grade. Магічна зброя.', "Apprentice's Spellbook", 'sword', false, 379, 9, 40, { mode: 'magic', mAtk: 95 }),
  c(900224, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет C-grade.', "Baguette's Dualsword", 'dual', true, 325, 222, 40, { mAtk: 38 }),
  c(160, 'battle_axe.jpg', 'Бойова сокира C-grade.', 'Battle Axe', 'blunt', false, 379, 236, 40, { mAtk: 61 }),
  c(5286, 'berserker_blade.jpg', 'Клинок берсерка C-grade.', 'Berserker Blade', 'bigsword', true, 325, 236, 40, { mAtk: 83 }),
  c(89, 'big_hammer.jpg', 'Великий молот C-grade.', 'Big Hammer', 'blunt', false, 379, 190, 40, { mAtk: 61 }),
  c(228, 'crystal_dagger.jpg', 'Кришталевий кинжал C-grade.', 'Crystal Dagger', 'dagger', false, 433, 161, 80, { mAtk: 83 }),
  c(233, 'dark_screamer.jpg', 'Темний викрик C-grade.', 'Dark Screamer', 'dagger', false, 433, 170, 80, { mAtk: 76 }),
  c(206, 'demon_s_staff.jpg', 'Посох демона C-grade.', "Demon's Staff", 'bigblunt', true, 325, 152, 40, { mode: 'magic', mAtk: 154 }),
  c(7897, 'dwarven_hammer.jpg', 'Дворфський молот C-grade.', 'Dwarven Hammer', 'bigblunt', true, 325, 200, 40, { mAtk: 83 }),
  c(7888, 'ecliptic_sword.jpg', 'Екліптичний меч C-grade.', 'Ecliptic Sword', 'sword', false, 379, 190, 40, { mAtk: 126 }),
  c(286, 'eminence_bow.jpg', 'Лук Еміненс C-grade.', 'Eminence Bow', 'bow', true, 293, 389, 120, { mAtk: 83 }),
  c(265, 'fisted_blade.jpg', 'Клинок-рукавиця C-grade.', 'Fisted Blade', 'fist', true, 433, 161, 40, { mAtk: 76 }),
  c(266, 'great_pata.jpg', 'Велика пата C-grade.', 'Great Pata', 'fist', true, 433, 170, 40, { mAtk: 83 }),
  c(326, 'heathens_book.jpg', 'Книга язичника C-grade.', "Heathen's Book", 'sword', false, 379, 111, 40, { mode: 'magic', mAtk: 120 }),
  c(194, 'heavy_doom_axe.jpg', 'Важка сокира загибелі C-grade.', 'Heavy Doom Axe', 'bigblunt', true, 325, 250, 40, { mAtk: 89 }),
  c(191, 'heavy_doom_hammer.jpg', 'Важкий молот загибелі C-grade.', 'Heavy Doom Hammer', 'bigblunt', true, 325, 210, 40, { mAtk: 89 }),
  c(84, 'homunkulus_s_sword.jpg', 'Меч гомункула C-grade.', "Homunkulus's Sword", 'sword', false, 379, 111, 40, { mode: 'magic', mAtk: 140 }),
  c(4233, 'knuckle_duster.jpg', 'Кастет C-grade.', 'Knuckle Duster', 'fist', true, 433, 153, 40, { mAtk: 68 }),
  c(299, 'orcish_poleaxe.jpg', 'Оркська алебарда C-grade.', 'Orcish Poleaxe', 'pole', true, 325, 236, 40, { mAtk: 83 }),
  c(7882, 'pa_agrian_sword.jpg', 'Меч Паагріан C-grade.', "Pa'agrio Sword", 'bigsword', true, 325, 200, 40, { mAtk: 76 }),
  c(135, 'samurai_longsword.jpg', 'Довгий меч самурая C-grade.', 'Samurai Longsword', 'sword', false, 379, 205, 40, { mAtk: 83 }),
  c(301, 'scorpion.jpg', 'Скорпіон C-grade.', 'Scorpion', 'pole', true, 325, 153, 40, { mAtk: 78 }),
  c(162, 'war_axe.jpg', 'Військова сокира C-grade.', 'War Axe', 'blunt', false, 379, 236, 40, { mAtk: 76 }),
  c(303, 'widow_maker.jpg', 'Творець вдови C-grade.', 'Widow Maker', 'pole', true, 325, 250, 40, { mAtk: 78 }),
  c(2503, 'yaksa_mace.jpg', 'Булава Якса C-grade.', 'Yaksa Mace', 'blunt', false, 379, 205, 40, { mAtk: 83 }),
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
export function cWeaponToItemMeta(
  entry: CWeaponCanonEntry,
  existing?: ItemMeta,
): ItemMeta {
  const meta: ItemMeta = {
    nameUk: entry.nameUk,
    slot: 'rhand',
    weaponType: entry.weaponType,
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    wpnCrit: entry.wpnCrit,
  };
  if (entry.mAtk != null) {
    meta.mAtk = entry.mAtk;
  } else if (existing?.mAtk != null) {
    meta.mAtk = existing.mAtk;
  }
  return meta;
}
