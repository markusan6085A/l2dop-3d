/**
 * Бойові дії людини-воїна (пакет l2dopHumanFighterBattleSkills).
 *
 * Урон по «AoE» скілах (Whirlwind, Sonic Storm, Thunder Storm, Earthquake, …) у цій моделі — по
 * `mobHp` + до 3 сусідніх спавнів у `whirlwindExtras` (разом до 4 цілей); не додається до pAtk/mAtk у профілі
 * (`computeCombatStats` у `performBattleAction` не бачить `battleMods`).
 */
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import {
  applyStandardFighterCooldown,
  maybeApplyDreadnoughtSkillMastery,
} from './humanFighterTurnHelpers.js';
import { resolveHumanFighterTurnCore } from './humanFighterTurnCore.js';

export function resolveHumanFighterTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const masteryResult = maybeApplyDreadnoughtSkillMastery(
    ctx,
    resolveHumanFighterTurnCore(ctx, rollPhys)
  );
  return applyStandardFighterCooldown(ctx, masteryResult);
}
