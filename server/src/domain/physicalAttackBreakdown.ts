/**
 * Єдиний breakdown P.Atk для audit/tests (обгортка над computePatkFromFinalStr).
 */
import type { InventoryState } from '../data/inventory.js';
import {
  buildCombatBuffModifiers,
  computePatkFromFinalStr,
  type ComputeCombatStatsOptions,
} from '../data/l2dopCombatFormulas.js';
import { resolveFinalBaseStats } from './resolveFinalBaseStats.js';
import type { StrPhysicalAttackMultiplierResult } from './resolveStrPhysicalAttackMultiplier.js';

export type PhysicalAttackBreakdown = {
  weaponItemId: number | null;
  weaponPAtk: number;
  lvlMod: number;
  necklacePatk: number;
  masteryPatk: number;
  buffPatk: number;
  addPatk: number;
  preStrPAtk: number;
  finalStr: number;
  strBreakdown: StrPhysicalAttackMultiplierResult;
  patkAfterStr: number;
  gradeMul: number;
  canonicalPatk: number;
};

export type PhysicalAttackBreakdownInput = {
  level: number;
  race: string;
  classBranch: string;
  inv: InventoryState;
  options?: ComputeCombatStatsOptions;
  finalStrOverride?: number;
};

export function computePhysicalAttackBreakdown(
  input: PhysicalAttackBreakdownInput,
): PhysicalAttackBreakdown {
  const B = buildCombatBuffModifiers(input.inv, input.race, input.options);
  const finalBase = resolveFinalBaseStats({
    level: input.level,
    race: input.race,
    classBranch: input.classBranch,
    inv: input.inv,
  });
  const finalStr =
    input.finalStrOverride != null
      ? Math.max(1, Math.floor(input.finalStrOverride))
      : finalBase.str;
  const patk = computePatkFromFinalStr({
    level: input.level,
    race: input.race,
    classBranch: input.classBranch,
    inv: input.inv,
    B,
    finalStr,
    gradeOk:
      input.options?.weaponGradeMatchesArmor !== undefined
        ? input.options.weaponGradeMatchesArmor
        : undefined,
  });
  return {
    ...patk,
    finalStr,
    canonicalPatk: patk.pAtk,
  };
}
