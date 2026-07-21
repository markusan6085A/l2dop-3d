/**
 * NG-grade зброя з магазину дропів — дані з канонічної таблиці `ngWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  NG_WEAPON_CATALOG,
  ngWeaponToItemMeta,
} from './ngWeaponCatalog.js';

/** Канонічні NG itemId завжди перезаписують попередній запис (GM/C-grade тощо). */
export function mergeNgDropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of NG_WEAPON_CATALOG) {
    target[entry.itemId] = ngWeaponToItemMeta(entry);
  }
}
