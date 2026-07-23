/**
 * Циклічна міграція itemId 1874/1875/1876 після виправлення Interlude-канону.
 * Кожний id змінюється рівно один раз за ОРИГІНАЛЬНИМ значенням stack/listing.
 */
import type { BagStack, EqSlotValue, InventoryState } from './inventory.js';
import type { WarehouseState } from './warehouse.js';

export const BASIC_RESOURCE_ID_MIGRATION_MARKER =
  'BASIC_RESOURCE_ID_MIGRATION_V1';

/** Старий (неправильний) itemId → новий канонічний itemId. */
export const ORIGINAL_BASIC_RESOURCE_ID_MAP: Readonly<Record<number, number>> = {
  1874: 1875,
  1875: 1876,
  1876: 1874,
};

export const MIGRATED_BASIC_RESOURCE_SOURCE_IDS = Object.keys(
  ORIGINAL_BASIC_RESOURCE_ID_MAP,
).map(Number);

/** Семантика за СТАРИМ (неправильним) itemId — для dry-run звіту. */
export const OLD_BASIC_RESOURCE_SEMANTIC_LABELS: Readonly<
  Record<number, string>
> = {
  1874: 'Stone of Purity',
  1875: 'Mithril Ore',
  1876: 'Oriharukon Ore',
};

export function mapOriginalBasicResourceItemId(originalItemId: number): number {
  const id = Math.floor(Number(originalItemId) || 0);
  return ORIGINAL_BASIC_RESOURCE_ID_MAP[id] ?? id;
}

export function isMigratableBasicResourceItemId(itemId: number): boolean {
  return itemId in ORIGINAL_BASIC_RESOURCE_ID_MAP;
}

function stackKey(itemId: number, enchant: number): string {
  return `${itemId}:${enchant}`;
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function remapBasicResourceBagStacks(stacks: BagStack[]): BagStack[] {
  const merged = new Map<string, BagStack>();
  for (const s of stacks) {
    const nextId = mapOriginalBasicResourceItemId(s.itemId);
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

export function remapBasicResourceEqSlotValue(v: EqSlotValue): EqSlotValue {
  if (typeof v === 'number' && v > 0) {
    return mapOriginalBasicResourceItemId(v);
  }
  if (v && typeof v === 'object' && typeof v.itemId === 'number' && v.itemId > 0) {
    const nextId = mapOriginalBasicResourceItemId(v.itemId);
    if (nextId === v.itemId) return v;
    return { ...v, itemId: nextId };
  }
  return v;
}

export function remapBasicResourceInventoryState(
  inv: InventoryState,
): InventoryState {
  const eq: InventoryState['eq'] = {};
  for (const [slot, val] of Object.entries(inv.eq ?? {})) {
    eq[slot] = remapBasicResourceEqSlotValue(val as EqSlotValue);
  }
  return {
    ...inv,
    stacks: remapBasicResourceBagStacks(inv.stacks ?? []),
    eq,
  };
}

export function remapBasicResourceWarehouseState(
  wh: WarehouseState,
): WarehouseState {
  return {
    ...wh,
    stacks: remapBasicResourceBagStacks(wh.stacks ?? []),
  };
}

export interface BasicResourceIdMigrationPreflight {
  ok: boolean;
  issues: string[];
}

export function preflightBasicResourceIdMigration(): BasicResourceIdMigrationPreflight {
  const issues: string[] = [];
  const targets = new Set(Object.values(ORIGINAL_BASIC_RESOURCE_ID_MAP));
  if (targets.size !== 3) {
    issues.push('ORIGINAL_BASIC_RESOURCE_ID_MAP must be a 3-cycle');
  }
  for (const [fromStr, to] of Object.entries(ORIGINAL_BASIC_RESOURCE_ID_MAP)) {
    const from = Number(fromStr);
    if (mapOriginalBasicResourceItemId(from) !== to) {
      issues.push(`mapOriginalBasicResourceItemId(${from}) !== ${to}`);
    }
    if (mapOriginalBasicResourceItemId(to) === from) {
      issues.push(`reverse collision: ${from} ↔ ${to}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

/** Semantic totals: old wrong id qty → canonical semantic code qty. */
export function semanticQtyTotalsFromCounts(
  counts: Map<number, number>,
): Record<'stone_of_purity' | 'mithril_ore' | 'oriharukon_ore', number> {
  return {
    stone_of_purity: counts.get(1874) ?? 0,
    mithril_ore: counts.get(1875) ?? 0,
    oriharukon_ore: counts.get(1876) ?? 0,
  };
}

export function semanticQtyTotalsAfterMigration(
  counts: Map<number, number>,
): Record<'stone_of_purity' | 'mithril_ore' | 'oriharukon_ore', number> {
  const out = {
    stone_of_purity: 0,
    mithril_ore: 0,
    oriharukon_ore: 0,
  };
  for (const [id, qty] of counts) {
    const mapped = mapOriginalBasicResourceItemId(id);
    if (mapped === 1875) out.stone_of_purity += qty;
    else if (mapped === 1876) out.mithril_ore += qty;
    else if (mapped === 1874) out.oriharukon_ore += qty;
  }
  return out;
}
