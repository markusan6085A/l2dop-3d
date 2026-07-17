import { ANCIENT_ADENA_ITEM_ID } from '../data/ancientAdenaItem.js';
import {
  addItemToBag,
  countBagQty,
  removeBagQty,
  type InventoryState,
} from '../data/inventory.js';

/** Зняти aa, додати ресурс. Помилки: `insufficient_ancient_adena`. */
export function applyMammonMerchantShopBuy(
  inv: InventoryState,
  offer: { itemId: number; aaPrice: number },
  qty: number
): InventoryState {
  const needAa = qty * offer.aaPrice;
  if (countBagQty(inv, ANCIENT_ADENA_ITEM_ID) < needAa) {
    throw new Error('insufficient_ancient_adena');
  }
  let next = removeBagQty(inv, ANCIENT_ADENA_ITEM_ID, needAa);
  next = addItemToBag(next, offer.itemId, qty);
  return next;
}
