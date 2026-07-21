/**
 * Пайплайн первинних статів (фаза 1): множники від STR…MEN відносно опорної точки 20,
 * кламп 0.30–3.00; адитивні похідні (крит %, резисти) — окремі капи.
 * STR P.Atk — окремий helper resolveStrPhysicalAttackMultiplier (soft-cap від 64, hard cap 4.00).
 * Бафи застосовуються в `computeCombatStats` після цих кроків.
 */
import { resolveStrPhysicalAttackMultiplier } from '../domain/resolveStrPhysicalAttackMultiplier.js';

export const PRIMARY_STAT_PIVOT = 20;

export function clampStatMultiplier(m: number): number {
  if (!Number.isFinite(m)) return 1;
  return Math.max(0.3, Math.min(3, m));
}

/** Верхня межа множника маг. крит-урону в бою (INT + бафи); вище — ризик ваншотів. */
export const MAGIC_CRIT_DMG_MUL_MAX = 2.5;
export const MAGIC_CRIT_DMG_MUL_MIN = 0.3;

export function clampMagicCritDmgMulForDamage(m: number): number {
  if (!Number.isFinite(m) || m <= 0) return 1;
  return Math.max(
    MAGIC_CRIT_DMG_MUL_MIN,
    Math.min(MAGIC_CRIT_DMG_MUL_MAX, m)
  );
}

export interface SixCore {
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
}

export interface PrimaryStatMultipliers {
  strPAtkMul: number;
  strCritDmgMul: number;
  dexAtkSpeedMul: number;
  conHpMul: number;
  conPDefMul: number;
  intMAtkMul: number;
  intMagicCritDmgMul: number;
  witCastSpeedMul: number;
  menMpMul: number;
  menMDefMul: number;
}

/** Множники від первинок (до бафів). */
export function computePrimaryStatMultipliers(s: SixCore): PrimaryStatMultipliers {
  const d = (x: number) => x - PRIMARY_STAT_PIVOT;
  return {
    strPAtkMul: resolveStrPhysicalAttackMultiplier(s.str).multiplier,
    strCritDmgMul: clampStatMultiplier(1 + d(s.str) * 0.02),
    dexAtkSpeedMul: clampStatMultiplier(1 + d(s.dex) * 0.03),
    conHpMul: clampStatMultiplier(1 + d(s.con) * 0.05),
    conPDefMul: clampStatMultiplier(1 + d(s.con) * 0.01),
    intMAtkMul: clampStatMultiplier(1 + d(s.int) * 0.055),
    intMagicCritDmgMul: clampStatMultiplier(1 + d(s.int) * 0.02),
    witCastSpeedMul: clampStatMultiplier(1 + d(s.wit) * 0.04),
    menMpMul: clampStatMultiplier(1 + d(s.men) * 0.05),
    menMDefMul: clampStatMultiplier(1 + d(s.men) * 0.015),
  };
}

export function conHpMultiplier(con: number): number {
  return clampStatMultiplier(1 + (con - PRIMARY_STAT_PIVOT) * 0.05);
}

export function menMpMultiplier(men: number): number {
  return clampStatMultiplier(1 + (men - PRIMARY_STAT_PIVOT) * 0.05);
}

/** База 10% «від зброї/класу» наближено; +0.5% за кожен DEX понад 20. Кап 5–60%. */
export function physicalCritChancePct(dex: number): number {
  return Math.max(
    5,
    Math.min(60, 10 + (dex - PRIMARY_STAT_PIVOT) * 0.5)
  );
}

/** Мапінг у шкалу finalcritical2 (0–500) для `physicalCritChance()` у hit resolution. */
export function critRateStatFromPhysicalCritPct(pct: number): number {
  const p = Math.max(5, Math.min(60, pct));
  return Math.max(0, Math.min(500, Math.floor((p / 60) * 500)));
}

export function magicCritChancePct(wit: number): number {
  return Math.max(
    1,
    Math.min(30, 1 + (wit - PRIMARY_STAT_PIVOT) * 0.4)
  );
}

export function stunResistPctFromCon(con: number): number {
  return Math.max(
    0,
    Math.min(80, (con - PRIMARY_STAT_PIVOT) * 1)
  );
}

export function debuffResistPctFromMen(men: number): number {
  return Math.max(
    0,
    Math.min(80, (men - PRIMARY_STAT_PIVOT) * 1)
  );
}
