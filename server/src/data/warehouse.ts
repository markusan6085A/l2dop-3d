import type { BagStack } from './inventory.js';
import {
  addEnchantedToBag,
  bagNeedsNewSlot,
  bagOccupiedSlots,
  removeEnchantedFromBag,
  type InventoryState,
} from './inventory.js';

export const DEFAULT_WAREHOUSE_MAX_SLOTS = 100;
export const DEFAULT_BAG_MAX_SLOTS = 80;

export interface WarehouseState {
  v: number;
  stacks: BagStack[];
  /** Максимум слотів; за замовчуванням 100. */
  maxSlots?: number;
}

export interface WarehouseSnapshot {
  stacks: BagStack[];
  usedSlots: number;
  maxSlots: number;
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, n));
}

export function emptyWarehouse(): WarehouseState {
  return { v: 1, stacks: [] };
}

export function warehouseMaxSlots(wh: WarehouseState): number {
  const n = Number(wh.maxSlots);
  if (Number.isFinite(n) && n > 0) return Math.floor(n);
  return DEFAULT_WAREHOUSE_MAX_SLOTS;
}

export function warehouseUsedSlots(wh: WarehouseState): number {
  return wh.stacks.length;
}

export function warehouseToSnapshot(wh: WarehouseState): WarehouseSnapshot {
  return {
    stacks: wh.stacks.map((s) => ({ ...s })),
    usedSlots: warehouseUsedSlots(wh),
    maxSlots: warehouseMaxSlots(wh),
  };
}

export function parseWarehouse(raw: unknown): WarehouseState {
  if (raw == null || typeof raw !== 'object') return emptyWarehouse();
  const o = raw as Record<string, unknown>;
  const stacksRaw = o.stacks;
  if (!Array.isArray(stacksRaw)) return emptyWarehouse();
  const stacks: BagStack[] = [];
  for (const row of stacksRaw) {
    if (!row || typeof row !== 'object') continue;
    const r = row as Record<string, unknown>;
    const itemId = Number(r.itemId);
    const qty = Number(r.qty);
    if (Number.isFinite(itemId) && itemId > 0 && Number.isFinite(qty) && qty > 0) {
      const b: BagStack = { itemId, qty };
      const en = normEnchant(r.enchant);
      if (en > 0) b.enchant = en;
      stacks.push(b);
    }
  }
  const maxRaw = o.maxSlots;
  const maxSlots =
    typeof maxRaw === 'number' && Number.isFinite(maxRaw) && maxRaw > 0
      ? Math.floor(maxRaw)
      : undefined;
  return { v: 1, stacks, maxSlots };
}

function cloneWh(wh: WarehouseState): WarehouseState {
  return {
    v: wh.v,
    maxSlots: wh.maxSlots,
    stacks: wh.stacks.map((s) => ({ ...s })),
  };
}

function addWhStack(
  stacks: BagStack[],
  itemId: number,
  qty: number,
  enchant: number
) {
  const e = normEnchant(enchant);
  const ex = stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (ex) ex.qty += qty;
  else {
    const row: BagStack = { itemId, qty };
    if (e > 0) row.enchant = e;
    stacks.push(row);
  }
}

function removeWhStack(
  stacks: BagStack[],
  itemId: number,
  qty: number,
  enchant: number
) {
  const e = normEnchant(enchant);
  const idx = stacks.findIndex(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (idx < 0) throw new Error('not_in_warehouse');
  const row = stacks[idx];
  if (row.qty < qty) throw new Error('not_in_warehouse');
  row.qty -= qty;
  if (row.qty <= 0) stacks.splice(idx, 1);
}

function whNeedsNewSlot(
  wh: WarehouseState,
  itemId: number,
  enchant: number
): boolean {
  const e = normEnchant(enchant);
  return !wh.stacks.some(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
}

/** Забрати зі складу в сумку (весь стек або частину qty). */
export function withdrawWarehouseToBag(
  wh: WarehouseState,
  inv: InventoryState,
  itemId: number,
  enchant: number,
  qty: number
): { warehouse: WarehouseState; inventory: InventoryState } {
  if (qty <= 0) throw new Error('invalid_qty');
  const e = normEnchant(enchant);
  const src = wh.stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (!src || src.qty < qty) throw new Error('not_in_warehouse');

  if (
    bagNeedsNewSlot(inv, itemId, e) &&
    bagOccupiedSlots(inv) >= DEFAULT_BAG_MAX_SLOTS
  ) {
    throw new Error('bag_full');
  }

  const nextWh = cloneWh(wh);
  removeWhStack(nextWh.stacks, itemId, qty, e);
  const nextInv = addEnchantedToBag(inv, itemId, qty, e);
  return { warehouse: nextWh, inventory: nextInv };
}

/** Покласти з сумки на склад (весь стек або частину qty). */
export function depositBagToWarehouse(
  wh: WarehouseState,
  inv: InventoryState,
  itemId: number,
  enchant: number,
  qty: number
): { warehouse: WarehouseState; inventory: InventoryState } {
  if (qty <= 0) throw new Error('invalid_qty');
  const e = normEnchant(enchant);
  const src = inv.stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (!src || src.qty < qty) throw new Error('not_in_bag');

  if (
    whNeedsNewSlot(wh, itemId, e) &&
    warehouseUsedSlots(wh) >= warehouseMaxSlots(wh)
  ) {
    throw new Error('warehouse_full');
  }

  const nextInv = removeEnchantedFromBag(inv, itemId, qty, e);
  const nextWh = cloneWh(wh);
  addWhStack(nextWh.stacks, itemId, qty, e);
  return { warehouse: nextWh, inventory: nextInv };
}
