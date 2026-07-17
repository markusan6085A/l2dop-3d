import { ANCIENT_ADENA_ITEM_ID } from '../data/ancientAdenaItem.js';
import {
  addItemToBag,
  countBagQty,
  removeBagQty,
  type InventoryState,
} from '../data/inventory.js';
import {
  SEAL_STONE_BLUE_ITEM_ID,
  SEAL_STONE_GREEN_ITEM_ID,
  SEAL_STONE_RED_ITEM_ID,
} from '../data/sevenSignsSealStoneItems.js';

export type AncientTraderStoneSlug = 'green' | 'blue' | 'red';

export interface AncientTraderRate {
  stone: AncientTraderStoneSlug;
  stoneItemId: number;
  aaPerStone: number;
}

export const ANCIENT_TRADER_RATES: readonly AncientTraderRate[] = [
  {
    stone: 'green',
    stoneItemId: SEAL_STONE_GREEN_ITEM_ID,
    aaPerStone: 5,
  },
  {
    stone: 'blue',
    stoneItemId: SEAL_STONE_BLUE_ITEM_ID,
    aaPerStone: 3,
  },
  {
    stone: 'red',
    stoneItemId: SEAL_STONE_RED_ITEM_ID,
    aaPerStone: 10,
  },
];

const RATE_BY_STONE = new Map(
  ANCIENT_TRADER_RATES.map((r) => [r.stone, r] as const)
);

export function resolveAncientTraderRate(
  stoneRaw: unknown
): AncientTraderRate | null {
  if (typeof stoneRaw !== 'string') return null;
  const stone = stoneRaw.trim().toLowerCase();
  if (stone !== 'green' && stone !== 'blue' && stone !== 'red') return null;
  return RATE_BY_STONE.get(stone) ?? null;
}

export function normalizeAncientTraderQty(qtyRaw: unknown): number | null {
  const q = Math.floor(Number(qtyRaw));
  if (!Number.isFinite(q) || q < 1 || q > 100_000) return null;
  return q;
}

/** Зняти каміння печаті, додати Ancient Adena. Помилка — `insufficient_materials`. */
export function applyAncientTraderExchange(
  inv: InventoryState,
  rate: AncientTraderRate,
  qty: number
): InventoryState {
  const needStones = qty;
  if (countBagQty(inv, rate.stoneItemId) < needStones) {
    throw new Error('insufficient_materials');
  }
  let next = removeBagQty(inv, rate.stoneItemId, needStones);
  const aaGain = qty * rate.aaPerStone;
  next = addItemToBag(next, ANCIENT_ADENA_ITEM_ID, aaGain);
  return next;
}
