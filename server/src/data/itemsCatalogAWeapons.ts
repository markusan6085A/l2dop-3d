/**
 * A-grade зброя з магазину дропів — дані з канонічної таблиці `aWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  A_WEAPON_CATALOG,
  aWeaponToItemMeta,
} from './aWeaponCatalog.js';

/** Канонічні A itemId завжди перезаписують попередній запис (GM тощо). */
export function mergeAdropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of A_WEAPON_CATALOG) {
    target[entry.itemId] = aWeaponToItemMeta(entry, target[entry.itemId]);
  }
}
