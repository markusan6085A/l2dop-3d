/**
 * C-grade зброя з магазину дропів — дані з канонічної таблиці `cWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  C_WEAPON_CATALOG,
  cWeaponToItemMeta,
} from './cWeaponCatalog.js';

/** Канонічні C itemId завжди перезаписують попередній запис (GM тощо). */
export function mergeCdropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of C_WEAPON_CATALOG) {
    target[entry.itemId] = cWeaponToItemMeta(entry, target[entry.itemId]);
  }
}
