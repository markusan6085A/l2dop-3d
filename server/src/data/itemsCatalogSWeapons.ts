/**
 * S-grade зброя з магазину дропів — дані з канонічної таблиці `sWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  S_WEAPON_CATALOG,
  sWeaponToItemMeta,
} from './sWeaponCatalog.js';

/** Канонічні S itemId завжди перезаписують попередній запис (GM/Event тощо). */
export function mergeSdropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of S_WEAPON_CATALOG) {
    target[entry.itemId] = sWeaponToItemMeta(entry);
  }
}
