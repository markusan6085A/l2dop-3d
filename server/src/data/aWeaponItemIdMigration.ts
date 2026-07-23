/**
 * Одноразова міграція A-grade itemId (synthetic та помилкові Interlude id).
 * Оригінальний id → next id рівно один раз; next id не проганяється через карту повторно.
 */
import type { BagStack, EqSlotValue, InventoryState } from './inventory.js';
import type { WarehouseState } from './warehouse.js';
import { ITEM_CATALOG } from './itemsCatalog.js';
import { isAWeaponItemId } from './aWeaponCatalog.js';
import { isBWeaponItemId } from './bWeaponCatalog.js';
import { isCWeaponItemId } from './cWeaponCatalog.js';
import { isDWeaponItemId } from './dWeaponCatalog.js';
import { isNgWeaponItemId } from './ngWeaponCatalog.js';
import { isSWeaponItemId } from './sWeaponCatalog.js';

export const A_WEAPON_ITEM_ID_MIGRATION_MARKER = 'A_WEAPON_ITEM_ID_MIGRATION_V1';

/** Старий shop/runtime id → канонічний Interlude id. */
export const LEGACY_A_WEAPON_ID_MAP: Readonly<Record<number, number>> = {
  900203: 8680,
  900204: 8681,
  900205: 269,
  900206: 235,
  900207: 213,
  900209: 288,
  900210: 8688,
  231: 270,
  900211: 81,
  304: 98,
  900212: 7884,
  900213: 8682,
  900214: 8684,
  900215: 8678,
  900216: 8685,
  900217: 236,
  900218: 7894,
  900219: 8679,
  900220: 80,
  900221: 305,
  900222: 8686,
  900223: 8683,
};

export const LEGACY_A_WEAPON_SOURCE_IDS = Object.keys(LEGACY_A_WEAPON_ID_MAP).map(Number);

/** ID з потенційною неоднозначністю (Grace Dagger / Orcish Halberd у справжньому Interlude). */
export const LEGACY_AMBIGUOUS_A_WEAPON_IDS = [231, 304] as const;

export function mapLegacyAWeaponItemId(originalItemId: number): number {
  const mapped = LEGACY_A_WEAPON_ID_MAP[originalItemId];
  return mapped ?? originalItemId;
}

export interface AWeaponMigrationPreflight {
  ambiguous: boolean;
  crossGradeCollision: boolean;
  issues: string[];
}

/** Перевірка перед apply: 231/304 та міжгрейдові колізії. */
export function preflightAWeaponMigration(): AWeaponMigrationPreflight {
  const issues: string[] = [];

  const catalog231 = ITEM_CATALOG[231];
  if (catalog231?.slot === 'rhand' && catalog231.weaponType && catalog231.weaponType !== 'fist') {
    issues.push(
      `itemId 231 у ITEM_CATALOG має weaponType=${catalog231.weaponType}, очікується fist (Dragon Grinder)`,
    );
  }
  const catalog304 = ITEM_CATALOG[304];
  if (catalog304?.slot === 'rhand' && catalog304.weaponType && catalog304.weaponType !== 'pole') {
    issues.push(
      `itemId 304 у ITEM_CATALOG має weaponType=${catalog304.weaponType}, очікується pole (Halberd)`,
    );
  }

  for (const to of new Set(Object.values(LEGACY_A_WEAPON_ID_MAP))) {
    if (!isAWeaponItemId(to)) {
      issues.push(`target itemId ${to} відсутній у A_WEAPON_CATALOG`);
    }
    if (isBWeaponItemId(to)) {
      issues.push(`target itemId ${to} конфліктує з B_WEAPON_CATALOG`);
    }
    if (isCWeaponItemId(to)) {
      issues.push(`target itemId ${to} конфліктує з C_WEAPON_CATALOG`);
    }
    if (isDWeaponItemId(to)) {
      issues.push(`target itemId ${to} конфліктує з D_WEAPON_CATALOG`);
    }
    if (isNgWeaponItemId(to)) {
      issues.push(`target itemId ${to} конфліктує з NG_WEAPON_CATALOG`);
    }
    if (isSWeaponItemId(to)) {
      issues.push(`target itemId ${to} конфліктує з S_WEAPON_CATALOG`);
    }
  }

  const crossGradeCollision = issues.some((i) => i.includes('конфліктує'));
  const ambiguousIssues = issues.filter((i) => i.includes('231') || i.includes('304'));
  return {
    ambiguous: ambiguousIssues.length > 0,
    crossGradeCollision,
    issues,
  };
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
    const nextId = mapLegacyAWeaponItemId(s.itemId);
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
    return mapLegacyAWeaponItemId(v);
  }
  if (v && typeof v === 'object' && typeof v.itemId === 'number' && v.itemId > 0) {
    const nextId = mapLegacyAWeaponItemId(v.itemId);
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
