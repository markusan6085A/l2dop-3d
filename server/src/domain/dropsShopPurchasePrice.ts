import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopCWeaponDropsPatches.js';
import { cGradeWeaponGmShopPriceAdena } from './gmShopCWeaponPricing.js';
import type { GmShopPurchaseOffer } from './dropsShopGmItemIdByShopKey.js';

export type DropsShopCatalogLike = {
  shopKey: string;
  category: string;
  grade: string;
};

export function applyCGradeWeaponGmShopPrice(
  row: DropsShopCatalogLike,
  offer: GmShopPurchaseOffer
): GmShopPurchaseOffer {
  if (row.category !== 'weapon' || row.grade !== 'C') return offer;
  const keyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const patch = L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
  if (!patch) return offer;
  return {
    itemId: offer.itemId,
    priceAdena: cGradeWeaponGmShopPriceAdena(patch),
  };
}
