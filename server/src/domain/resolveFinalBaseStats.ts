/**
 * Єдиний серверний helper final STR/DEX/CON/INT/WIT/MEN перед похідними статами.
 * Flat % combat multipliers сюди не входять — лише flat stat modifiers.
 */
import type { InventoryState } from '../data/inventory.js';
import {
  armorSetTotalsToCombatDelta,
  resolveEquippedArmorSetBonuses,
} from '../data/armorSetResolver.js';
import {
  computeBaseSixForLevel,
  raceAndBranchToL2Code,
  type BaseSix,
} from '../data/l2dopCombatFormulas.js';

/** Мінімальне значення базового стату (анти-NaN / overflow guard). */
export const MIN_FINAL_BASE_STAT = 1;

export type SixStatKey = keyof BaseSix;

export type StatModifierSlice = Partial<Record<SixStatKey, number>>;

export interface FinalBaseStatsBreakdown {
  base: BaseSix;
  armorSets: StatModifierSlice;
  dyes: StatModifierSlice;
  passives: StatModifierSlice;
  items: StatModifierSlice;
  other: StatModifierSlice;
}

export interface FinalBaseStatsResult extends BaseSix {
  breakdown: FinalBaseStatsBreakdown;
}

export interface ResolveFinalBaseStatsInput {
  level: number;
  race: string;
  classBranch: string;
  inv: InventoryState;
}

function clampStat(n: number): number {
  if (!Number.isFinite(n)) return MIN_FINAL_BASE_STAT;
  return Math.max(MIN_FINAL_BASE_STAT, Math.floor(n));
}

function applySlice(
  target: BaseSix,
  slice: StatModifierSlice,
): void {
  for (const key of ['str', 'dex', 'con', 'int', 'wit', 'men'] as const) {
    const add = slice[key];
    if (add === undefined) continue;
    target[key] += add;
  }
}

/**
 * Порядок: racial/class base → (future: profession/dyes/items/passives) → armor set flats.
 * Armor set flats застосовуються рівно один раз через armorSetResolver.
 */
export function resolveFinalBaseStats(
  input: ResolveFinalBaseStatsInput,
): FinalBaseStatsResult {
  const code = raceAndBranchToL2Code(input.race, input.classBranch);
  const LVL = Math.max(1, Math.floor(input.level));
  const base = computeBaseSixForLevel(code, input.classBranch, LVL);

  const armorSetResolved = resolveEquippedArmorSetBonuses(input.inv);
  const armorSetCombat = armorSetTotalsToCombatDelta(armorSetResolved.totals);
  const armorSets: StatModifierSlice = {
    str: armorSetCombat.flatStats.strFlat,
    dex: armorSetCombat.flatStats.dexFlat,
    con: armorSetCombat.flatStats.conFlat,
    int: armorSetCombat.flatStats.intFlat,
    wit: armorSetCombat.flatStats.witFlat,
    men: armorSetCombat.flatStats.menFlat,
  };

  const breakdown: FinalBaseStatsBreakdown = {
    base: { ...base },
    armorSets: { ...armorSets },
    dyes: {},
    passives: {},
    items: {},
    other: {},
  };

  const final: BaseSix = { ...base };
  applySlice(final, breakdown.dyes);
  applySlice(final, breakdown.passives);
  applySlice(final, breakdown.items);
  applySlice(final, breakdown.other);
  applySlice(final, breakdown.armorSets);

  return {
    str: clampStat(final.str),
    dex: clampStat(final.dex),
    con: clampStat(final.con),
    int: clampStat(final.int),
    wit: clampStat(final.wit),
    men: clampStat(final.men),
    breakdown,
  };
}
