/**
 * Focus Attack (317) — лише те, що є в text-rpg (`critDamage` % → множник до critDmgMul).
 * Точність і крит-шанс окремо в даних немає — без додаткових множників.
 */
import {
  canonicalBattleSkillId,
  type LearnedSkillEntry,
} from './humanFighterSkillCatalog.js';
import { textRpgHfBuffPowerAtSkillLevel } from './textRpgHfBuffPower.js';

const FOCUS_L2_SKILL_ID = 317;

export function clampSkillRank15(rank: number): number {
  return Math.max(1, Math.min(5, Math.floor(rank)));
}

/** Жорстка стійка (312): Interlude — до 20 рівнів (l2db); у бою — text-rpg `textRpgHfToggleBattleApply`. */
export function clampViciousStanceRank(rank: number): number {
  return Math.max(1, Math.min(20, Math.floor(rank)));
}

export function focusAttackCritDmgMultiplier(rank: number): number {
  const r = clampSkillRank15(rank);
  const p = textRpgHfBuffPowerAtSkillLevel(FOCUS_L2_SKILL_ID, r);
  return 1 + p / 100;
}

export function focusAttackRankFromLearnedMap(
  learned: Record<string, number> | undefined
): number {
  const lv = learned?.['l2_317'];
  if (typeof lv !== 'number' || !Number.isFinite(lv) || lv < 1) return 1;
  return clampSkillRank15(lv);
}

export function viciousStanceRankFromLearnedMap(
  learned: Record<string, number> | undefined
): number {
  const lv = learned?.['l2_312'];
  if (typeof lv !== 'number' || !Number.isFinite(lv) || lv < 1) return 1;
  return clampViciousStanceRank(lv);
}

export function focusAttackRankFromLearnedEntries(
  learned: LearnedSkillEntry[]
): number {
  const e = learned.find(
    (x) => canonicalBattleSkillId(x.battleId) === 'l2_317'
  );
  return e != null && e.level >= 1 ? clampSkillRank15(e.level) : 1;
}

export function viciousStanceRankFromLearnedEntries(
  learned: LearnedSkillEntry[]
): number {
  const e = learned.find(
    (x) => canonicalBattleSkillId(x.battleId) === 'l2_312'
  );
  return e != null && e.level >= 1 ? clampViciousStanceRank(e.level) : 1;
}
