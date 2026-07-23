/**
 * Канонічна таблиця S-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 * Характеристики: Lineage 2 Interlude (+ 2 custom shop items).
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';
import { requiresArrowsForWeaponType } from './weaponTypeContract.js';

export type SWeaponMode = 'phys' | 'magic';
export type SWeaponCanonSource = 'interlude' | 'custom';

export interface SWeaponCanonEntry {
  itemId: number;
  shopKey: string;
  nameUk: string;
  shopNameUk: string;
  mode: SWeaponMode;
  weaponType: WeaponKindForEnchant;
  blocksShield: boolean;
  atkSpd: number;
  pAtk: number;
  mAtk: number;
  wpnCrit: number;
  masteryFamily: WeaponKindForEnchant | null;
  canonSource: SWeaponCanonSource;
}

function s(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  mode: SWeaponMode,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  mAtk: number,
  wpnCrit: number,
  masteryFamily: WeaponKindForEnchant | null,
  canonSource: SWeaponCanonSource,
): SWeaponCanonEntry {
  return {
    itemId,
    shopKey: `weapon_s/${shopFile}`,
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

/** Усі 13 S-grade предметів з магазину дропів (11 Interlude + 2 custom). */
export const S_WEAPON_CATALOG: readonly SWeaponCanonEntry[] = [
  s(910201, 'apprentices_spellbook.jpg', 'Книга заклинань учня S-grade. Магічна зброя.', "Apprentice's Spellbook", 'magic', 'sword', false, 379, 9, 340, 80, null, 'custom'),
  s(910202, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет S-grade. Дворучна зброя.', "Baguette's Dualsword", 'phys', 'dual', true, 325, 570, 132, 80, 'dual', 'custom'),
  s(6367, 'angel_slayer.jpg', 'Вбивця янголів S-grade.', 'Angel Slayer', 'phys', 'dagger', false, 433, 246, 132, 120, 'dagger', 'interlude'),
  s(6579, 'arcana_mace.jpg', 'Булава аркани S-grade. Магічна зброя.', 'Arcana Mace', 'magic', 'blunt', false, 379, 225, 175, 40, 'blunt', 'interlude'),
  s(6365, 'basalt_battlehammer.jpg', 'Базальтовий бойовий молот S-grade.', 'Basalt Battlehammer', 'phys', 'blunt', false, 379, 281, 132, 40, 'blunt', 'interlude'),
  s(6371, 'demon_splinter.jpg', 'Уламок демона S-grade. Дворучна зброя.', 'Demon Splinter', 'phys', 'fist', true, 325, 342, 132, 40, 'fist', 'interlude'),
  s(7575, 'draconic_bow.jpg', 'Драконічний лук S-grade. Дальня атака.', 'Draconic Bow', 'phys', 'bow', true, 293, 581, 132, 120, 'bow', 'interlude'),
  s(6369, 'dragon_hunter_axe.jpg', 'Сокира мисливця на драконів S-grade. Дворучна зброя.', 'Dragon Hunter Axe', 'phys', 'bigblunt', true, 325, 342, 132, 40, 'bigblunt', 'interlude'),
  s(82, 'god_s_blade.jpg', 'Клинок бога S-grade.', "God's Blade", 'phys', 'sword', false, 379, 257, 124, 80, 'sword', 'interlude'),
  s(6372, 'heaven_s_divider.jpg', 'Роздільник небес S-grade. Дворучна зброя.', "Heaven's Divider", 'phys', 'bigsword', true, 325, 342, 132, 80, 'bigsword', 'interlude'),
  s(6366, 'imperial_staff.jpg', 'Імператорський посох S-grade. Дворучна магічна зброя.', 'Imperial Staff', 'magic', 'bigblunt', true, 325, 274, 175, 40, 'bigblunt', 'interlude'),
  s(6370, 'saint_spear.jpg', 'Святий спіс S-grade. Дворучна зброя.', 'Saint Spear', 'phys', 'pole', true, 325, 281, 132, 80, 'pole', 'interlude'),
  s(6368, 'shining_bow.jpg', 'Сяючий лук S-grade. Дальня атака.', 'Shining Bow', 'phys', 'bow', true, 293, 581, 132, 120, 'bow', 'interlude'),
] as const;

export const S_WEAPON_SHOP_TOTAL = S_WEAPON_CATALOG.length;
export const S_WEAPON_INTERLUDE_COUNT = S_WEAPON_CATALOG.filter((e) => e.canonSource === 'interlude').length;
export const S_WEAPON_CUSTOM_COUNT = S_WEAPON_CATALOG.filter((e) => e.canonSource === 'custom').length;

export const S_WEAPON_ITEM_IDS = new Set<number>(
  S_WEAPON_CATALOG.map((e) => e.itemId),
);

/** Event itemId з lineage XML — не використовувати для постійної S-grade зброї. */
export const S_WEAPON_EVENT_ITEM_IDS = new Set<number>([
  20166, 20167, 20168, 20169, 20170, 20171, 20172, 20173, 20174,
]);

/** Старий synthetic Shining Bow — не використовувати в активних джерелах. */
export const S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID = 910203;

export function isSWeaponItemId(itemId: number): boolean {
  return S_WEAPON_ITEM_IDS.has(itemId);
}

function shopKeyLower(shopKey: string): string {
  return shopKey.replace(/\\/g, '/').toLowerCase();
}

export const S_WEAPON_BY_ITEM_ID: ReadonlyMap<number, SWeaponCanonEntry> =
  new Map(S_WEAPON_CATALOG.map((e) => [e.itemId, e]));

export const S_WEAPON_BY_SHOP_KEY_LOWER: ReadonlyMap<string, SWeaponCanonEntry> =
  new Map(S_WEAPON_CATALOG.map((e) => [shopKeyLower(e.shopKey), e]));

/** Запис для ITEM_CATALOG / інвентаря / бою. */
export function sWeaponToItemMeta(entry: SWeaponCanonEntry): ItemMeta {
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
