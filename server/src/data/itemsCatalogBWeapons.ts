/**
 * B-grade зброя з магазину дропів — дані з канонічної таблиці `bWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  B_WEAPON_CATALOG,
  bWeaponToItemMeta,
} from './bWeaponCatalog.js';

/** Канонічні B itemId завжди перезаписують попередній запис (GM тощо). */
export function mergeBdropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of B_WEAPON_CATALOG) {
    target[entry.itemId] = bWeaponToItemMeta(entry);
  }
}
