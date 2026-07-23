/**
 * Одноразова міграція B-grade itemId (перехресні колізії).
 * Оригінальний id → next id рівно один раз; next id не проганяється через карту повторно.
 */
import type { BagStack, EqSlotValue, InventoryState } from './inventory.js';
import type { WarehouseState } from './warehouse.js';

export const B_WEAPON_ITEM_ID_MIGRATION_MARKER = 'B_WEAPON_ITEM_ID_MIGRATION_V1';

/** Старий shop/runtime id → канонічний Interlude/custom id. */
export const LEGACY_B_WEAPON_ID_MAP: Readonly<Record<number, number>> = {
  78: 910101,
  7792: 910102,
  7834: 175,
  7788: 267,
  7893: 268,
  7891: 287,
  7890: 284,
  7791: 171,
  7894: 300,
  7895: 78,
  7813: 243,
  8340: 7893,
  7783: 229,
  7784: 97,
  7889: 92,
  7896: 210,
  7722: 148,
  8336: 7889,
};

export const LEGACY_B_WEAPON_SOURCE_IDS = Object.keys(LEGACY_B_WEAPON_ID_MAP).map(Number);

export function mapLegacyBWeaponItemId(originalItemId: number): number {
  const mapped = LEGACY_B_WEAPON_ID_MAP[originalItemId];
  return mapped ?? originalItemId;
}

function stackKey(itemId: number, enchant: number): string {
  return `${itemId}:${enchant}`;
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/** Перетворити stacks: qty сумується лише для однакових (itemId, enchant) після remap. */
export function remapBagStacks(stacks: BagStack[]): BagStack[] {
  const merged = new Map<string, BagStack>();
  for (const s of stacks) {
    const nextId = mapLegacyBWeaponItemId(s.itemId);
    const en = normEnchant(s.enchant);
    const key = stackKey(nextId, en);
    const prev = merged.get(key);
    if (prev) {
      prev.qty += s.qty;
      continue;
    }
    const row: BagStack = { itemId: nextId, qty: s.qty };
    if (en > 0) row.enchant = en;
    merged.set(key, row);
  }
  return [...merged.values()];
}

export function remapEqSlotValue(v: EqSlotValue): EqSlotValue {
  if (typeof v === 'number' && v > 0) {
    return mapLegacyBWeaponItemId(v);
  }
  if (v && typeof v === 'object' && typeof v.itemId === 'number' && v.itemId > 0) {
    const nextId = mapLegacyBWeaponItemId(v.itemId);
    if (nextId === v.itemId) return v;
    return { ...v, itemId: nextId };
  }
  return v;
}

export function remapInventoryState(inv: InventoryState): InventoryState {
  const eq: InventoryState['eq'] = {};
  for (const [slot, val] of Object.entries(inv.eq ?? {})) {
    eq[slot] = remapEqSlotValue(val as EqSlotValue);
  }
  return {
    ...inv,
    stacks: remapBagStacks(inv.stacks ?? []),
    eq,
  };
}

export function remapWarehouseState(wh: WarehouseState): WarehouseState {
  return {
    ...wh,
    stacks: remapBagStacks(wh.stacks ?? []),
  };
}

export type ItemIdChange = { from: number; to: number; count: number };

export function countItemIdChanges(
  before: Array<{ itemId: number; qty?: number }>,
  after: Array<{ itemId: number; qty?: number }>,
): ItemIdChange[] {
  const countBy = (rows: Array<{ itemId: number; qty?: number }>): Map<number, number> => {
    const m = new Map<number, number>();
    for (const r of rows) {
      const q = typeof r.qty === 'number' && r.qty > 0 ? r.qty : 1;
      m.set(r.itemId, (m.get(r.itemId) ?? 0) + q);
    }
    return m;
  };
  const b = countBy(before);
  const a = countBy(after);
  const out: ItemIdChange[] = [];
  for (const [from, count] of b) {
    const to = mapLegacyBWeaponItemId(from);
    if (to !== from) out.push({ from, to, count });
  }
  void a;
  return out.sort((x, y) => x.from - y.from);
}
