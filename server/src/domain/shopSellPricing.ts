export const SHOP_SELL_BUY_RATIO = 0.5;

/** Fighter soulshot + blessed spiritshot (усі грейди) — ціна продажу 50% від покупки за штуку. */
export const SHOP_SELL_CHARGE_ITEM_IDS = new Set<number>([
  1835, 1463, 1464, 1465, 1466, 1467,
  3947, 3948, 3949, 3950, 3951, 3952,
]);

export function isChargeShotItemId(itemId: number): boolean {
  return SHOP_SELL_CHARGE_ITEM_IDS.has(Math.floor(itemId));
}

export function shopSellUnitAdenaFromBuyPrice(
  itemId: number,
  buyPriceAdena: number
): number {
  const buy = Math.max(0, Math.floor(buyPriceAdena));
  if (buy <= 0) return 0;
  return Math.max(1, Math.floor(buy * SHOP_SELL_BUY_RATIO));
}

export function shopSellTotalAdena(
  itemId: number,
  buyPriceAdena: number,
  qty: number
): number {
  const q = Math.max(1, Math.floor(qty));
  return shopSellUnitAdenaFromBuyPrice(itemId, buyPriceAdena) * q;
}

const RESOURCE_GRADE_BAND: Record<string, [number, number]> = {
  ng: [65, 520],
  d: [520, 980],
  c: [980, 1500],
  b: [1500, 2100],
  a: [2100, 2850],
  s: [2850, 3545],
};

function stableResourceSpread(itemId: number, lo: number, hi: number): number {
  const span = Math.max(1, hi - lo + 1);
  const hash = ((Math.floor(itemId) * 2654435761) >>> 0) % span;
  return lo + hash;
}

/** Ресурси з мобів: 65–3545 залежно від «цінності» (грейд + стабільний розкид). */
export function resourceSellPriceAdena(
  itemId: number,
  gradeKey?: string | null
): number {
  const g = gradeKey != null ? String(gradeKey).trim().toLowerCase() : '';
  const band = RESOURCE_GRADE_BAND[g] ?? [65, 800];
  const price = stableResourceSpread(itemId, band[0], band[1]);
  return Math.max(65, Math.min(3545, price));
}
