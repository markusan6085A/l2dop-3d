/**
 * Канонічна таблиця S-grade зброї — єдине джерело правди для магазину, ITEM_CATALOG та бою.
 */
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { ItemMeta } from './itemsCatalog.js';

export type SWeaponMode = 'phys' | 'magic';

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
  mAtk?: number;
  wpnCrit: number;
  displayCrit?: number;
}

function s(
  itemId: number,
  shopFile: string,
  nameUk: string,
  shopNameUk: string,
  weaponType: WeaponKindForEnchant,
  blocksShield: boolean,
  atkSpd: number,
  pAtk: number,
  wpnCrit: number,
  extra?: { mode?: SWeaponMode; mAtk?: number; displayCrit?: number },
): SWeaponCanonEntry {
  const mode = extra?.mode ?? 'phys';
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
    wpnCrit,
    ...(extra?.mAtk != null ? { mAtk: extra.mAtk } : {}),
    ...(mode === 'phys' ? { displayCrit: extra?.displayCrit ?? wpnCrit } : {}),
  };
}

/** Усі 13 S-grade предметів з магазину дропів (постійні lineage itemId, не Event). */
export const S_WEAPON_CATALOG: readonly SWeaponCanonEntry[] = [
  s(6367, 'angel_slayer.jpg', 'Вбивця янголів S-grade.', 'Angel Slayer', 'dagger', false, 433, 355, 80, { mAtk: 132 }),
  s(910201, 'apprentices_spellbook.jpg', 'Книга заклинань учня S-grade.', "Apprentice's Spellbook", 'sword', false, 379, 9, 40, { mode: 'magic', mAtk: 340 }),
  s(6579, 'arcana_mace.jpg', 'Булава аркани S-grade.', 'Arcana Mace', 'blunt', false, 379, 225, 40, { mode: 'magic', mAtk: 458 }),
  s(910202, 'baguette_s_dualsword.jpg', 'Дворучний меч Багет S-grade.', "Baguette's Dualsword", 'dual', true, 325, 570, 40, { mAtk: 132 }),
  s(6365, 'basalt_battlehammer.jpg', 'Базальтовий бойовий молот S-grade.', 'Basalt Battlehammer', 'blunt', false, 379, 625, 40, { mAtk: 132 }),
  s(6371, 'demon_splinter.jpg', 'Уламок демона S-grade.', 'Demon Splinter', 'fist', true, 433, 355, 40, { mAtk: 132 }),
  s(7575, 'draconic_bow.jpg', 'Драконічний лук S-grade.', 'Draconic Bow', 'bow', true, 293, 984, 120, { mAtk: 132 }),
  s(6369, 'dragon_hunter_axe.jpg', 'Сокира мисливця на драконів S-grade.', 'Dragon Hunter Axe', 'bigblunt', true, 325, 625, 40, { mAtk: 132 }),
  s(82, 'god_s_blade.jpg', 'Клинок бога S-grade.', "God's Blade", 'sword', false, 379, 519, 40, { mAtk: 124 }),
  s(6372, 'heaven_s_divider.jpg', 'Роздільник небес S-grade.', "Heaven's Divider", 'bigsword', true, 325, 625, 40, { mAtk: 132 }),
  s(6366, 'imperial_staff.jpg', 'Імператорський посох S-grade.', 'Imperial Staff', 'bigblunt', true, 325, 274, 40, { mode: 'magic', mAtk: 458 }),
  s(6370, 'saint_spear.jpg', 'Святий спіс S-grade.', 'Saint Spear', 'pole', true, 325, 625, 40, { mAtk: 132 }),
  s(6368, 'shining_bow.jpg', 'Сяючий лук S-grade.', 'Shining Bow', 'bow', true, 293, 934, 120, { mAtk: 132 }),
] as const;

export const S_WEAPON_ITEM_IDS = new Set<number>(
  S_WEAPON_CATALOG.map((e) => e.itemId),
);

/** Event itemId з lineage XML — не використовувати для постійної S-grade зброї. */
export const S_WEAPON_EVENT_ITEM_IDS = new Set<number>([
  20166, 20167, 20168, 20169, 20170, 20171, 20172, 20173, 20174,
]);

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
export function sWeaponToItemMeta(
  entry: SWeaponCanonEntry,
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
