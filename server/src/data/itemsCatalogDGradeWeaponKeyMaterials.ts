import type { L2ItemInventoryTabHint } from './l2dopItemInventoryTab.generated.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_CATALOG,
  type DGradeWeaponKeyMaterialEntry,
} from './dGradeWeaponKeyMaterialsCatalog.js';
import type { ItemMeta } from './itemsCatalog.js';

export function mergeDGradeWeaponKeyMaterials(target: Record<number, ItemMeta>): void {
  for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    target[row.itemId] = keyMaterialItemMeta(row);
  }
}

function keyMaterialItemMeta(row: DGradeWeaponKeyMaterialEntry): ItemMeta {
  return {
    nameUk: row.nameUk,
    slot: 'consumable',
  };
}

export function dGradeWeaponKeyMaterialInventoryTabHints(): Record<
  number,
  L2ItemInventoryTabHint
> {
  const out: Record<number, L2ItemInventoryTabHint> = {};
  for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    out[row.itemId] = row.inventoryTab;
  }
  return out;
}

export function dGradeWeaponKeyMaterialIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    out[row.itemId] = row.iconPath;
  }
  return out;
}

export function dGradeWeaponKeyMaterialNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function dGradeWeaponKeyMaterialNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}
