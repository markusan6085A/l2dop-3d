/**
 * Для екрану магазину дропів: shopKey (як у DROPS_SHOP_CATALOG) → item_id та ціна
 * із згенерованого GM-каталогу за полем iconUrl (/icons/drops/…).
 * Перший рядок з даним relPath виграє (як раніше для itemId).
 */
import {
  L2DOP_GM_SHOP_ARMOR,
  L2DOP_GM_SHOP_JEWELRY,
  L2DOP_GM_SHOP_WEAPONS,
} from '../data/l2dopGmShopCatalog.generated.js';

export interface GmShopPurchaseOffer {
  itemId: number;
  priceAdena: number;
}

let memoPurchase: Map<string, GmShopPurchaseOffer> | undefined;
let memoId: Map<string, number> | undefined;

/** Нормалізований ключ: каталог нижній регістр, `'weapon_d/atuba.jpg'`. */
export function dropsShopRelPathFromGmIcon(iconUrl?: string): string | null {
  const s = String(iconUrl || '')
    .replace(/\\/g, '/')
    .trim();
  if (!s) return null;
  const m = /\/icons\/drops\/(.+)/i.exec(s);
  return m ? m[1]!.replace(/^\/+/u, '').toLowerCase() : null;
}

function buildPurchaseMap(): Map<string, GmShopPurchaseOffer> {
  const m = new Map<string, GmShopPurchaseOffer>();
  const put = (
    iconUrl?: string,
    itemId?: number,
    priceAdena?: number
  ): void => {
    const id =
      typeof itemId === 'number' && itemId > 0 ? Math.floor(itemId) : NaN;
    const price =
      typeof priceAdena === 'number' && Number.isFinite(priceAdena)
        ? Math.max(0, Math.floor(priceAdena))
        : NaN;
    if (!Number.isFinite(id) || !Number.isFinite(price)) return;
    const rel = dropsShopRelPathFromGmIcon(iconUrl);
    if (!rel || m.has(rel)) return;
    m.set(rel, { itemId: id, priceAdena: price });
  };
  for (const r of L2DOP_GM_SHOP_WEAPONS)
    put(r.iconUrl, r.itemId, r.priceAdena);
  for (const r of L2DOP_GM_SHOP_ARMOR)
    put(r.iconUrl, r.itemId, r.priceAdena);
  for (const r of L2DOP_GM_SHOP_JEWELRY)
    put(r.iconUrl, r.itemId, r.priceAdena);
  return m;
}

export function dropsGmPurchaseByShopKeyLower(): ReadonlyMap<
  string,
  GmShopPurchaseOffer
> {
  if (!memoPurchase) memoPurchase = buildPurchaseMap();
  return memoPurchase;
}

/** Лише itemId (прев’ю), сумісно з попереднім API. */
export function dropsGmItemIdByShopKeyLower(): ReadonlyMap<string, number> {
  if (!memoId) {
    memoId = new Map();
    for (const [k, v] of dropsGmPurchaseByShopKeyLower()) {
      memoId.set(k, v.itemId);
    }
  }
  return memoId;
}
