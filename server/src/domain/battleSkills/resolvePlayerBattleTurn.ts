/**
 * Точка входу: одна дія гравця → результат туру (до запису в БД).
 */
import { isFighterClassBranch } from '../../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../../data/l2dopHumanMysticBattleSkills.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  MagicBoltRollFn,
  PhysicalRollFn,
} from './types.js';
import { battleActionNamedFromL2IfMapped } from '../../data/humanFighterSkillCatalog.js';
import { applyStandardFighterCooldown } from './humanFighterTurnHelpers.js';
import { resolveHammerCrushTurn } from './hammerCrushTurn.js';
import { resolveHumanFighterTurn } from './humanFighterTurn.js';
import { resolveHumanMysticTurn } from './humanMysticTurn.js';
import { resolveLegacyMeleeTurn } from './legacyMeleeTurn.js';

export function resolvePlayerBattleTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn,
  rollBolt: MagicBoltRollFn
): BattleSkillTurnResult {
  const action = battleActionNamedFromL2IfMapped(ctx.action);
  if (action === 'hammer_crush') {
    const result = resolveHammerCrushTurn({ ...ctx, action: 'hammer_crush' }, rollPhys);
    if (isFighterClassBranch(ctx.classBranch)) {
      return applyStandardFighterCooldown(ctx, result);
    }
    return result;
  }
  if (isFighterClassBranch(ctx.classBranch)) {
    return resolveHumanFighterTurn(ctx, rollPhys);
  }
  if (isMysticClassBranch(ctx.classBranch)) {
    return resolveHumanMysticTurn(ctx, rollPhys, rollBolt);
  }
  return resolveLegacyMeleeTurn(ctx, rollPhys, rollBolt);
}
