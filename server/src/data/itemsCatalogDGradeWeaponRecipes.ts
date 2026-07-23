import type { L2ItemInventoryTabHint } from './l2dopItemInventoryTab.generated.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_CATALOG,
  type DGradeWeaponRecipeItemEntry,
} from './dGradeWeaponRecipeItemsCatalog.js';
import type { ItemMeta } from './itemsCatalog.js';

export function mergeDGradeWeaponRecipeItems(target: Record<number, ItemMeta>): void {
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    target[row.itemId] = recipeItemMeta(row);
  }
}

function recipeItemMeta(row: DGradeWeaponRecipeItemEntry): ItemMeta {
  return {
    nameUk: row.nameUk,
    slot: 'consumable',
  };
}

export function dGradeWeaponRecipeItemInventoryTabHints(): Record<
  number,
  L2ItemInventoryTabHint
> {
  const out: Record<number, L2ItemInventoryTabHint> = {};
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    out[row.itemId] = row.inventoryTab;
  }
  return out;
}

export function dGradeWeaponRecipeItemIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    out[row.itemId] = row.iconPath;
  }
  return out;
}

export function dGradeWeaponRecipeItemNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function dGradeWeaponRecipeItemNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}

export function dGradeWeaponRecipeItemUseActionHintsForClient(): Record<
  number,
  string
> {
  const out: Record<number, string> = {};
  for (const row of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    out[row.itemId] = row.useAction;
  }
  return out;
}
