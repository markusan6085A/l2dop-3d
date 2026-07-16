import type { InventoryState } from '../data/inventory.js';
import {
  computeCombatStats,
  type ComputeCombatStatsOptions,
} from '../data/l2dopCombatFormulas.js';

/** Стартова мощ героя. */
export const HERO_POWER_BASE = 1000;

const COMBAT_BONUS_KEYS = [
  'pAtk',
  'pDef',
  'mAtk',
  'mDef',
  'accuracy',
  'evasion',
  'critRate',
] as const;

function sumSixStats(stats: {
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
}): number {
  return (
    Math.max(0, Math.floor(stats.str)) +
    Math.max(0, Math.floor(stats.int)) +
    Math.max(0, Math.floor(stats.dex)) +
    Math.max(0, Math.floor(stats.wit)) +
    Math.max(0, Math.floor(stats.con)) +
    Math.max(0, Math.floor(stats.men))
  );
}

/** +1 мощ за кожен 1% приросту бойових статів від екіпу/бафів (vs «голий» build). */
export function heroPowerStatBonusPercent(
  level: number,
  race: string,
  classBranch: string,
  inv: InventoryState,
  options?: ComputeCombatStatsOptions
): number {
  const nakedInv: InventoryState = {
    ...inv,
    stacks: inv.stacks,
    eq: {},
  };
  const naked = computeCombatStats(
    level,
    race,
    classBranch,
    nakedInv,
    options
  );
  const full = computeCombatStats(level, race, classBranch, inv, options);
  let bonusPct = 0;
  for (const key of COMBAT_BONUS_KEYS) {
    const base = Math.max(0, Math.floor(Number(naked[key]) || 0));
    const eq = Math.max(0, Math.floor(Number(full[key]) || 0));
    if (base > 0 && eq > base) {
      bonusPct += Math.floor(((eq - base) / base) * 100);
    }
  }
  return Math.max(0, bonusPct);
}

export function computeHeroPower(args: {
  level: number;
  learnedSkillCount: number;
  str: number;
  int: number;
  dex: number;
  wit: number;
  con: number;
  men: number;
  statBonusPercent: number;
}): number {
  const level = Math.max(1, Math.floor(Number(args.level) || 1));
  const skills = Math.max(0, Math.floor(Number(args.learnedSkillCount) || 0));
  const six = sumSixStats(args);
  const pct = Math.max(0, Math.floor(Number(args.statBonusPercent) || 0));
  return HERO_POWER_BASE + level * 100 + skills + six + pct;
}

export function learnedSkillCountForHeroPower(
  learnedDetail: { level: number }[]
): number {
  if (!Array.isArray(learnedDetail)) return 0;
  let n = 0;
  for (const e of learnedDetail) {
    if (e && Math.floor(Number(e.level) || 0) >= 1) n += 1;
  }
  return n;
}
