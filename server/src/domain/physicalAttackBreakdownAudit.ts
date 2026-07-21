import { debugPlayerPhysicalHitBreakdown } from './battlePhysicalHitDebug.js';
import type { BattleBattleMods } from './battleTypes.js';
import type { ReturnTypeOfComputeCombatStats } from './physicalAttackBreakdownTypes.js';

export type BattlePatkDamageAudit = {
  displayedPatk: number;
  battlePatk: number;
  normalDamageCore: number;
  criticalDamageCore: number;
  targetPDef: number;
};

/** Deterministic P.Atk + damage audit (без circular import у breakdown). */
export function auditBattlePatkAndDamage(params: {
  combat: ReturnTypeOfComputeCombatStats;
  battleMods?: BattleBattleMods;
  targetPDef: number;
  learnedSkillLevelByBattleId?: Record<string, number>;
  weaponKind?: string;
  soulshotMul?: number;
}): BattlePatkDamageAudit {
  const dbg = debugPlayerPhysicalHitBreakdown({
    baseCombatPatk: params.combat.pAtk,
    combat: params.combat,
    battleMods: params.battleMods ?? {},
    mobPDef: params.targetPDef,
    learnedSkillLevelByBattleId: params.learnedSkillLevelByBattleId,
    weaponKind: params.weaponKind,
    soulshotMulOverride: params.soulshotMul ?? 1,
  });
  return {
    displayedPatk: dbg.displayedPatkFromSnapshot,
    battlePatk: dbg.attackerPAtk,
    normalDamageCore: dbg.normalHitDamage,
    criticalDamageCore: dbg.damageAfterCrit,
    targetPDef: params.targetPDef,
  };
}
