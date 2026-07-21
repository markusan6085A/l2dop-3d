/**
 * Повні сети броні (l3/l4/lh/lg/lf, без щита l2).
 * D/C/B-grade staged sets — `armorSetCatalog.ts` / `armorSetResolver.ts`.
 * A-grade — Apella Brigandine / Dark Crystal / Majestic Robe.
 * S-grade — Draconic Leather / Imperial Crusader / Major Arcana.
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

/** A-grade — Apella Brigandine: танк / PvP utility — без DPS-статів. */
const A_APELLA_BRIGANDINE: DGradeArmorSetDef = {
  id: 'a_apella_brigandine',
  pieces: {
    l3: 7864,
    l4: 'empty',
    lh: 7860,
    lg: 7865,
    lf: 7866,
  },
  bonus: {
    buffMaxHp: 1.12,
    buffPdef: 1.06,
    addStunResistPct: 15,
    addDebuffResistPct: 10,
  },
};

/** Dark Crystal: фіз DPS + легке HP (без raw PATK / crit damage %). */
const A_DARK_CRYSTAL: DGradeArmorSetDef = {
  id: 'a_dark_crystal',
  pieces: {
    l3: 365,
    l4: 388,
    lh: 512,
    lg: 2472,
    lf: 563,
  },
  bonus: {
    buffAspd: 1.07,
    buffAcc: 4,
    addPhysicalCritChancePct: 3,
    buffMaxHp: 1.05,
  },
};

/** Majestic Robe: каст + mCrit + MP + успіх дебафу (без INT / % M.Atk). */
const A_MAJESTIC_ROBE: DGradeArmorSetDef = {
  id: 'a_majestic_robe',
  pieces: {
    l3: 2409,
    l4: 'empty',
    lh: 2419,
    lg: 2482,
    lf: 583,
  },
  bonus: {
    buffCast: 1.08,
    addMCritPct: 4,
    buffMaxMp: 1.12,
    addDebuffLandChancePct: 8,
  },
};

/** Draconic Leather: топ light фіз-DPS (aspd/crit/hit/evasion), без PATK і crit dmg %. */
const S_DRACONIC_LEATHER: DGradeArmorSetDef = {
  id: 's_draconic_leather',
  pieces: {
    l3: 6379,
    l4: 'empty',
    lh: 6382,
    lg: 6380,
    lf: 6381,
  },
  bonus: {
    buffAspd: 1.08,
    addPhysicalCritChancePct: 4,
    buffAcc: 5,
    buffEva: 3,
  },
};

/** Imperial Crusader: важкий танк — лише живучість і стійкість до контролю. */
const S_IMPERIAL_CRUSADER: DGradeArmorSetDef = {
  id: 's_imperial_crusader',
  pieces: {
    l3: 6373,
    l4: 6374,
    lh: 6378,
    lg: 6375,
    lf: 6376,
  },
  bonus: {
    buffMaxHp: 1.15,
    buffPdef: 1.08,
    addStunResistPct: 20,
    addDebuffResistPct: 15,
  },
};

/** Major Arcana Robe: endgame маг — каст/mCrit/MP/land, без INT і без % M.Atk. */
const S_MAJOR_ARCANA_ROBE: DGradeArmorSetDef = {
  id: 's_major_arcana_robe',
  pieces: {
    l3: 6383,
    l4: 'empty',
    lh: 6386,
    lg: 6384,
    lf: 6385,
  },
  bonus: {
    buffCast: 1.09,
    addMCritPct: 5,
    buffMaxMp: 1.15,
    addDebuffLandChancePct: 10,
  },
};

const LEGACY_FULL_ARMOR_SETS: readonly DGradeArmorSetDef[] = [
  A_APELLA_BRIGANDINE,
  A_DARK_CRYSTAL,
  A_MAJESTIC_ROBE,
  S_DRACONIC_LEATHER,
  S_IMPERIAL_CRUSADER,
  S_MAJOR_ARCANA_ROBE,
];

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
const ARMOR_SET_PROFILE_NAME_UK: Record<string, string> = {
  a_apella_brigandine: 'Apella Brigandine (A)',
  a_dark_crystal: 'Dark Crystal (A)',
  a_majestic_robe: 'Majestic Robe (A)',
  s_draconic_leather: 'Draconic Leather (S)',
  s_imperial_crusader: 'Imperial Crusader (S)',
  s_major_arcana_robe: 'Major Arcana (S)',
};

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

/** Активний повний сет B+ на екіпі — для профілю (D/C-grade — armorSetResolver). */
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

/** Дельта B+ повних сетів (D/C-grade — armorSetResolver). */
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
