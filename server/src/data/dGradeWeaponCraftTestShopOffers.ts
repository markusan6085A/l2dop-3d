import {
  D_GRADE_WEAPON_KEY_MATERIAL_BY_CODE,
} from './dGradeWeaponKeyMaterialsCatalog.js';
import {
  D_GRADE_WEAPON_RECIPE_ITEM_BY_CODE,
} from './dGradeWeaponRecipeItemsCatalog.js';
import {
  isDGradeWeaponCraftTestShopKey,
} from './dGradeWeaponCraftTestShopCatalog.js';
import type { GmShopPurchaseOffer } from '../domain/dropsShopGmItemIdByShopKey.js';

/** Dev-only GM Shop: itemId + безкоштовна ціна для craft test ключів. */
export function resolveDGradeWeaponCraftTestPurchaseOffer(
  shopKey: string,
): GmShopPurchaseOffer | null {
  if (!isDGradeWeaponCraftTestShopKey(shopKey)) return null;
  const normalized = shopKey.replace(/\\/g, '/').toLowerCase();
  const prefix = 'consumable/craft_test/';
  if (!normalized.startsWith(prefix)) return null;
  const tail = normalized.slice(prefix.length);

  if (tail.startsWith('recipe_')) {
    const code = tail.slice('recipe_'.length);
    const row = D_GRADE_WEAPON_RECIPE_ITEM_BY_CODE.get(code);
    if (!row) return null;
    return { itemId: row.itemId, priceAdena: 0 };
  }
  if (tail.startsWith('key_material_')) {
    const code = tail.slice('key_material_'.length);
    const row = D_GRADE_WEAPON_KEY_MATERIAL_BY_CODE.get(code);
    if (!row) return null;
    return { itemId: row.itemId, priceAdena: 0 };
  }
  return null;
}
