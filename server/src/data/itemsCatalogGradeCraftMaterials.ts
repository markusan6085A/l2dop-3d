import type { L2ItemInventoryTabHint } from './l2dopItemInventoryTab.generated.js';
import {
  GRADE_CRAFT_MATERIAL_CATALOG,
  type GradeCraftMaterialEntry,
} from './gradeCraftMaterialsCatalog.js';
import type { ItemMeta } from './itemsCatalog.js';

export function mergeGradeCraftMaterials(target: Record<number, ItemMeta>): void {
  for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
    target[row.itemId] = gradeCraftMaterialItemMeta(row);
  }
}

function gradeCraftMaterialItemMeta(row: GradeCraftMaterialEntry): ItemMeta {
  return {
    nameUk: row.nameUk,
    slot: 'consumable',
  };
}

export function gradeCraftMaterialInventoryTabHints(): Record<
  number,
  L2ItemInventoryTabHint
> {
  const out: Record<number, L2ItemInventoryTabHint> = {};
  for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
    out[row.itemId] = 'resource';
  }
  return out;
}

export function gradeCraftMaterialIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
    out[row.itemId] = row.iconUrl;
  }
  return out;
}

export function gradeCraftMaterialNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function gradeCraftMaterialNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of GRADE_CRAFT_MATERIAL_CATALOG) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}
