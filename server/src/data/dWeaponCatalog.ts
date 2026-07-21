/**
 * Канонічна таблиця D-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

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
  mAtk?: number;
  wpnCrit: number;
  /** Для фізичної зброї — крит у preview магазину. */
  displayCrit?: number;
}

function d(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  wpnCrit: number,
  extra?: { mode?: DWeaponMode; mAtk?: number; displayCrit?: number },
): DWeaponCanonEntry {
  const mode = extra?.mode ?? 'phys';
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
    wpnCrit,
    ...(extra?.mAtk != null ? { mAtk: extra.mAtk } : {}),
    ...(mode === 'phys' ? { displayCrit: extra?.displayCrit ?? wpnCrit } : {}),
  };
}

/** Усі 10 D-grade предметів з магазину дропів. */
export const D_WEAPON_CATALOG: readonly DWeaponCanonEntry[] = [
  d(187, 'atuba_hammer.jpg', 'Молот Атуби D-grade.', 'Atuba Hammer — булава', 'blunt', false, 379, 111, 40),
  d(261, 'baguette_s_dualsword.jpg', 'Подвійний меч Багет D-grade.', "Baguette's Dualsword — dual sword", 'dual', true, 325, 122, 40),
  d(277, 'dark_elven_bow.jpg', 'Лук темних ельфів D-grade.', 'Dark Elven Bow — лук', 'bow', true, 293, 216, 120),
  d(128, 'knight_s_sword.jpg', 'Меч лицаря D-grade.', "Knight's Sword — меч", 'sword', false, 379, 103, 40),
  d(241, 'shilen_knife.jpg', 'Ніж Шілен D-grade.', 'Shilen Knife — кинжал', 'dagger', false, 433, 91, 80),
  d(86, 'tomahawk.jpg', 'Томагавк D-grade.', 'Tomahawk — булава', 'blunt', false, 379, 103, 40),
  d(317, 'tome_of_blood.jpg', 'Том крові D-grade.', 'Tome of Blood — книга', 'sword', false, 379, 9, 40, {
    mode: 'magic',
    mAtk: 80,
  }),
  d(260, 'triple-edged_jamadhr.jpg', 'Тригранний Джамадхр D-grade.', 'Triple-Edged Jamadhr — кастети', 'fist', true, 433, 91, 40),
  d(124, 'two_handed_sword.jpg', 'Дворучний меч D-grade.', 'Two-Handed Sword — двуручний меч', 'bigsword', true, 325, 132, 40),
  d(293, 'war_hammer.jpg', 'Бойовий молот D-grade.', 'War Hammer', 'bigblunt', true, 325, 132, 40),
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
    atkSpd: entry.atkSpd,
    pAtk: entry.pAtk,
    wpnCrit: entry.wpnCrit,
  };
  if (entry.mAtk != null) meta.mAtk = entry.mAtk;
  return meta;
}
