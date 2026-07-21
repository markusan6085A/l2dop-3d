/**
 * Похідні множники/шкали від final base stats (до flat P.Atk/M.Atk від екіпу та % бафів).
 */
import {
  computePrimaryStatMultipliers,
  debuffResistPctFromMen,
  magicCritChancePct,
  physicalCritChancePct,
  stunResistPctFromCon,
  type PrimaryStatMultipliers,
} from '../data/l2dopPrimaryStatPipeline.js';
import type { BaseSix } from '../data/l2dopCombatFormulas.js';

export interface DerivedPrimaryCombatEffects {
  multipliers: PrimaryStatMultipliers;
  physicalCritPct: number;
  magicCritPct: number;
  stunResistPct: number;
  debuffResistPct: number;
}

export function deriveCombatStatsFromBaseStats(
  stats: BaseSix,
): DerivedPrimaryCombatEffects {
  const multipliers = computePrimaryStatMultipliers(stats);
  return {
    multipliers,
    physicalCritPct: physicalCritChancePct(stats.dex),
    magicCritPct: magicCritChancePct(stats.wit),
    stunResistPct: stunResistPctFromCon(stats.con),
    debuffResistPct: debuffResistPctFromMen(stats.men),
  };
}
