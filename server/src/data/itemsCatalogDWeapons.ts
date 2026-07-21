/**
 * D-grade зброя з магазину дропів — дані з канонічної таблиці `dWeaponCatalog.ts`.
 */
import type { ItemMeta } from './itemsCatalog.js';
import {
  D_WEAPON_CATALOG,
  dWeaponToItemMeta,
} from './dWeaponCatalog.js';

/** Канонічні D itemId завжди перезаписують попередній запис (GM тощо). */
export function mergeDropsWeapons(
  target: Record<number, ItemMeta>,
): void {
  for (const entry of D_WEAPON_CATALOG) {
    target[entry.itemId] = dWeaponToItemMeta(entry);
  }
}
