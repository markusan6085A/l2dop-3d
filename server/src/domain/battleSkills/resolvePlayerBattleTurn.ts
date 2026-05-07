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
import { resolveHumanFighterTurn } from './humanFighterTurn.js';
import { resolveHumanMysticTurn } from './humanMysticTurn.js';
import { resolveLegacyMeleeTurn } from './legacyMeleeTurn.js';

export function resolvePlayerBattleTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn,
  rollBolt: MagicBoltRollFn
): BattleSkillTurnResult {
  if (isFighterClassBranch(ctx.classBranch)) {
    return resolveHumanFighterTurn(ctx, rollPhys);
  }
  if (isMysticClassBranch(ctx.classBranch)) {
    return resolveHumanMysticTurn(ctx, rollPhys, rollBolt);
  }
  return resolveLegacyMeleeTurn(ctx, rollPhys, rollBolt);
}
