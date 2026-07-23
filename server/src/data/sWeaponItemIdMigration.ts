/**
 * Одноразова міграція S-grade itemId (Event та synthetic legacy id).
 * Оригінальний id → next id рівно один раз; next id не проганяється через карту повторно.
 */
import type { BagStack, EqSlotValue, InventoryState } from './inventory.js';
import type { WarehouseState } from './warehouse.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import {
  isAWeaponItemId,
} from './aWeaponCatalog.js';
import { isBWeaponItemId } from './bWeaponCatalog.js';
import { isCWeaponItemId } from './cWeaponCatalog.js';
import { isDWeaponItemId } from './dWeaponCatalog.js';
import { isNgWeaponItemId } from './ngWeaponCatalog.js';
import {
  isSWeaponItemId,
  S_WEAPON_EVENT_ITEM_IDS,
  S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID,
} from './sWeaponCatalog.js';

export const S_WEAPON_ITEM_ID_MIGRATION_MARKER = 'S_WEAPON_ITEM_ID_MIGRATION_V1';

/** Event/synthetic shop id → постійний canonical id. */
export const LEGACY_S_WEAPON_ID_MAP: Readonly<Record<number, number>> = {
  20166: 6372,
  20167: 6367,
  20168: 6365,
  20169: 6369,
  20170: 6579,
  20171: 6366,
  20172: 6371,
  20173: 7575,
  20174: 6370,
  910203: 6368,
};

export const LEGACY_S_WEAPON_SOURCE_IDS = Object.keys(LEGACY_S_WEAPON_ID_MAP).map(Number);

export const LEGACY_S_WEAPON_EVENT_IDS = [...S_WEAPON_EVENT_ITEM_IDS] as const;

export function mapLegacySWeaponItemId(originalItemId: number): number {
  const mapped = LEGACY_S_WEAPON_ID_MAP[originalItemId];
  return mapped ?? originalItemId;
}

export interface SWeaponMigrationPreflight {
  eventAmbiguity: boolean;
  crossGradeCollision: boolean;
  issues: string[];
}

/** Перевірка перед apply: Event id та міжгрейдові колізії. */
export function preflightSWeaponMigration(): SWeaponMigrationPreflight {
  const issues: string[] = [];

  for (const legacyId of LEGACY_S_WEAPON_SOURCE_IDS) {
    const catalog = ITEM_CATALOG[legacyId];
    if (catalog?.slot === 'rhand' && catalog.weaponType) {
      const target = LEGACY_S_WEAPON_ID_MAP[legacyId];
      const targetEntry = ITEM_CATALOG[target];
      if (targetEntry && targetEntry.weaponType !== catalog.weaponType) {
        issues.push(
          `legacy itemId ${legacyId} у ITEM_CATALOG має weaponType=${catalog.weaponType}, target ${target} має ${targetEntry.weaponType}`,
        );
      }
    }
  }

  if (isSWeaponItemId(S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID)) {
    issues.push(`synthetic id ${S_WEAPON_LEGACY_SYNTHETIC_SHINING_BOW_ID} зайнятий у S_WEAPON_CATALOG`);
  }

  for (const to of new Set(Object.values(LEGACY_S_WEAPON_ID_MAP))) {
    if (!isSWeaponItemId(to)) {
      issues.push(`target itemId ${to} відсутній у S_WEAPON_CATALOG`);
    }
    if (isBWeaponItemId(to)) issues.push(`target itemId ${to} конфліктує з B_WEAPON_CATALOG`);
    if (isCWeaponItemId(to)) issues.push(`target itemId ${to} конфліктує з C_WEAPON_CATALOG`);
    if (isDWeaponItemId(to)) issues.push(`target itemId ${to} конфліктує з D_WEAPON_CATALOG`);
    if (isAWeaponItemId(to)) issues.push(`target itemId ${to} конфліктує з A_WEAPON_CATALOG`);
    if (isNgWeaponItemId(to)) issues.push(`target itemId ${to} конфліктує з NG_WEAPON_CATALOG`);
  }

  const eventAmbiguity = issues.some(
    (i) => i.includes('legacy itemId 201') || i.includes('910203'),
  );
  const crossGradeCollision = issues.some((i) => i.includes('конфліктує'));
  return { eventAmbiguity, crossGradeCollision, issues };
}

function stackKey(itemId: number, enchant: number): string {
  return `${itemId}:${enchant}`;
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function remapBagStacks(stacks: BagStack[]): BagStack[] {
  const merged = new Map<string, BagStack>();
  for (const s of stacks) {
    const nextId = mapLegacySWeaponItemId(s.itemId);
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
    return mapLegacySWeaponItemId(v);
  }
  if (v && typeof v === 'object' && typeof v.itemId === 'number' && v.itemId > 0) {
    const nextId = mapLegacySWeaponItemId(v.itemId);
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
