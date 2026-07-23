/**
 * GM Shop (dev-only): D-grade weapon craft test items.
 */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';
import {
  D_GRADE_WEAPON_KEY_MATERIAL_CATALOG,
} from './dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_CATALOG,
} from './dGradeWeaponRecipeItemsCatalog.js';

export const D_GRADE_WEAPON_CRAFT_TEST_SHOP_SECTION_UK =
  'D-grade Weapon Craft Test';

export function dGradeWeaponCraftTestShopKey(
  kind: 'recipe' | 'key_material',
  code: string,
): string {
  return `consumable/craft_test/${kind}_${code}`;
}

export function buildDGradeWeaponCraftTestShopRows(): DropsShopCatalogRow[] {
  const rows: DropsShopCatalogRow[] = [];
  for (const recipe of D_GRADE_WEAPON_RECIPE_ITEM_CATALOG) {
    rows.push({
      shopKey: dGradeWeaponCraftTestShopKey('recipe', recipe.code),
      category: 'consumable',
      grade: 'D',
      iconUrl: recipe.iconPath,
      nameUk: recipe.nameUk,
    });
  }
  for (const mat of D_GRADE_WEAPON_KEY_MATERIAL_CATALOG) {
    rows.push({
      shopKey: dGradeWeaponCraftTestShopKey('key_material', mat.code),
      category: 'consumable',
      grade: 'D',
      iconUrl: mat.iconPath,
      nameUk: mat.nameUk,
    });
  }
  return rows;
}

export function isDGradeWeaponCraftTestShopKey(shopKey: string): boolean {
  const k = String(shopKey ?? '').replace(/\\/g, '/').toLowerCase();
  return k.startsWith('consumable/craft_test/');
}

export function minPurchaseQtyForCraftTestShopKey(shopKey: string): number {
  const k = String(shopKey ?? '').replace(/\\/g, '/').toLowerCase();
  if (k.includes('/craft_test/recipe_')) return 1;
  if (k.includes('/craft_test/key_material_')) return 100;
  return 1;
}

export function defaultPurchaseQtyForCraftTestShopKey(shopKey: string): number {
  return minPurchaseQtyForCraftTestShopKey(shopKey);
}
