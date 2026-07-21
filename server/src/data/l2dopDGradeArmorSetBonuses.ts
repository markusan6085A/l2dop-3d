/**
 * Повні сети броні (legacy) — порожньо після міграції S-grade у armorSetCatalog.
 * D/C/B/A-grade staged sets — `armorSetCatalog.ts` / `armorSetResolver.ts`.
 */
import type { InventoryState } from './inventory.js';
import { normalizeEqSlot } from './inventory.js';
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';

type SetPieceSlots = 'l3' | 'l4' | 'lh' | 'lg' | 'lf';

/** `empty` — слот l4 (або інший) має бути без предмета. */
type SetPieceId = number | 'empty';

export type DGradeArmorSetBonusDelta = Partial<L2dopCombatBuffModifiers>;

interface DGradeArmorSetDef {
  /** Для логів / майбутнього UI */
  id: string;
  pieces: Record<SetPieceSlots, SetPieceId>;
  bonus: DGradeArmorSetBonusDelta;
}

const SET_SLOTS: readonly SetPieceSlots[] = [
  'l3',
  'l4',
  'lh',
  'lg',
  'lf',
];

const LEGACY_FULL_ARMOR_SETS: readonly DGradeArmorSetDef[] = [];

function equippedArmorPieceIds(
  inv: InventoryState
): Partial<Record<SetPieceSlots, number>> {
  const eq = inv.eq ?? {};
  const out: Partial<Record<SetPieceSlots, number>> = {};
  for (const s of SET_SLOTS) {
    const n = normalizeEqSlot(eq[s]);
    if (n) out[s] = n.itemId;
  }
  return out;
}

function setMatchesEquipped(
  set: DGradeArmorSetDef,
  worn: Partial<Record<SetPieceSlots, number>>
): boolean {
  for (const s of SET_SLOTS) {
    const exp = set.pieces[s];
    const wornId = worn[s];
    if (exp === 'empty') {
      if (wornId !== undefined) return false;
    } else if (wornId !== exp) {
      return false;
    }
  }
  return true;
}

/** Назва повного сету для UI (профіль). */
const ARMOR_SET_PROFILE_NAME_UK: Record<string, string> = {};

function pctFromMul(v: number): number {
  return Math.round((v - 1) * 100);
}

/** Рядки бонусу сету українською — узгоджено з тим, що вже в `computeCombatStats`. */
export function formatArmorSetBonusLinesUk(
  b: DGradeArmorSetBonusDelta
): string[] {
  if (!b || Object.keys(b).length === 0) return [];
  const lines: string[] = [];
  if (b.buffMaxHp != null && b.buffMaxHp !== 1) {
    lines.push(`Max HP +${pctFromMul(b.buffMaxHp)}%`);
  }
  if (b.buffMaxMp != null && b.buffMaxMp !== 1) {
    lines.push(`Max MP +${pctFromMul(b.buffMaxMp)}%`);
  }
  if (b.buffPdef != null && b.buffPdef !== 1) {
    lines.push(`P.Def +${pctFromMul(b.buffPdef)}%`);
  }
  if (b.buffPatk != null && b.buffPatk !== 1) {
    lines.push(`P.Atk +${pctFromMul(b.buffPatk)}%`);
  }
  if (b.buffMatk != null && b.buffMatk !== 1) {
    lines.push(`M.Atk +${pctFromMul(b.buffMatk)}%`);
  }
  if (b.buffAspd != null && b.buffAspd !== 1) {
    lines.push(`Швидкість атаки +${pctFromMul(b.buffAspd)}%`);
  }
  if (b.buffCast != null && b.buffCast !== 1) {
    lines.push(`Швидкість касту +${pctFromMul(b.buffCast)}%`);
  }
  if (b.buffAcc) {
    lines.push(`Точність +${b.buffAcc}`);
  }
  if (b.buffEva) {
    lines.push(`Ухилення +${b.buffEva}`);
  }
  if (b.addPhysicalCritChancePct) {
    lines.push(`Шанс фіз. крита +${b.addPhysicalCritChancePct}%`);
  }
  if (b.addMCritPct) {
    lines.push(`Шанс маг. крита +${b.addMCritPct}%`);
  }
  if (b.addStunResistPct) {
    lines.push(`Стійкість до станів +${b.addStunResistPct}%`);
  }
  if (b.addDebuffResistPct) {
    lines.push(`Стійкість до дебафів +${b.addDebuffResistPct}%`);
  }
  if (b.addDebuffLandChancePct) {
    lines.push(`Успіх дебафів +${b.addDebuffLandChancePct}%`);
  }
  if (b.skillMpCostMul != null && b.skillMpCostMul !== 1) {
    const saved = Math.round((1 - b.skillMpCostMul) * 100);
    if (saved > 0) {
      lines.push(`Витрата MP на скіли −${saved}%`);
    } else if (saved < 0) {
      lines.push(`Витрата MP на скіли +${-saved}%`);
    }
  }
  return lines;
}

export interface ActiveArmorSetProfile {
  id: string;
  nameUk: string;
  linesUk: string[];
}

/** Активний повний legacy-сет на екіпі (після міграції S-grade — завжди null). */
export function resolveActiveArmorSetProfile(
  inv: InventoryState
): ActiveArmorSetProfile | null {
  const worn = equippedArmorPieceIds(inv);
  for (const set of LEGACY_FULL_ARMOR_SETS) {
    if (!setMatchesEquipped(set, worn)) continue;
    return {
      id: set.id,
      nameUk:
        ARMOR_SET_PROFILE_NAME_UK[set.id] ??
        set.id.replace(/_/g, ' '),
      linesUk: formatArmorSetBonusLinesUk(set.bonus),
    };
  }
  return null;
}

/** Дельта legacy full-set (після міграції S-grade — порожня). */
export function dGradeFullArmorSetBonusDeltaLegacyOnly(
  inv: InventoryState
): DGradeArmorSetBonusDelta {
  const worn = equippedArmorPieceIds(inv);
  for (const set of LEGACY_FULL_ARMOR_SETS) {
    if (setMatchesEquipped(set, worn)) return set.bonus;
  }
  return {};
}

/** @deprecated Use armorSetResolver + legacyOnly for B+. */
export function dGradeFullArmorSetBonusDelta(
  inv: InventoryState
): DGradeArmorSetBonusDelta {
  return dGradeFullArmorSetBonusDeltaLegacyOnly(inv);
}
