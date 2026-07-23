import type { ItemMeta } from '../data/itemsCatalog.js';
import { L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER } from '../data/l2dopCWeaponDropsPatches.js';
import { C_WEAPON_BY_SHOP_KEY_LOWER } from '../data/cWeaponCatalog.js';
import {
  applyBasEquipmentCoinOfLuckPrice,
  type DropsShopCatalogLike,
} from './dropsShopCoinOfLuckPricing.js';
import { cGradeWeaponGmShopPriceAdena } from './gmShopCWeaponPricing.js';
import type { GmShopPurchaseOffer } from './dropsShopGmItemIdByShopKey.js';

export type { DropsShopCatalogLike };

export function applyCGradeWeaponGmShopPrice(
  row: DropsShopCatalogLike,
  offer: GmShopPurchaseOffer
): GmShopPurchaseOffer {
  if (row.category !== 'weapon' || row.grade !== 'C') return offer;
  const keyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
  const entry = C_WEAPON_BY_SHOP_KEY_LOWER.get(keyNorm);
  if (entry?.shopPriceAdena != null) {
    return {
      itemId: offer.itemId,
      priceAdena: entry.shopPriceAdena,
      priceCoinOfLuck: null,
    };
  }
  const patch = L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER[keyNorm];
  if (!patch) return offer;
  const canon = C_WEAPON_BY_SHOP_KEY_LOWER.get(keyNorm);
  if (!canon) return offer;
  return {
    itemId: offer.itemId,
    priceAdena: cGradeWeaponGmShopPriceAdena(canon),
    priceCoinOfLuck: null,
  };
}

export function applyDropsShopPurchasePricing(
  row: DropsShopCatalogLike,
  offer: GmShopPurchaseOffer,
  itemMeta?: ItemMeta
): GmShopPurchaseOffer {
  const afterC = applyCGradeWeaponGmShopPrice(row, offer);
  return applyBasEquipmentCoinOfLuckPrice(row, afterC, itemMeta);
}
