/**
 * Розгалуження усіх скілів fighter (урон, бафи, контроль).
 */
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import { battleActionNamedFromL2IfMapped } from '../../data/humanFighterSkillCatalog.js';
import { tryResolveFighterRaceCatalogTurn } from './fighterRaceCatalogTurn.js';
import { resolveHumanFighterGapSkillsTurn } from './humanFighterGapSkillsTurn.js';
import { skillRankForCurrentAction } from './humanFighterTurnHelpers.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';
import { tryResolveHumanFighterTurnBasics } from './humanFighterTurnCoreBasics.js';
import { tryResolveHumanFighterTurnDetections } from './humanFighterTurnCoreDetections.js';
import { tryResolveHumanFighterTurnStances } from './humanFighterTurnCoreStances.js';
import { tryResolveHumanFighterTurnSonic } from './humanFighterTurnCoreSonic.js';

export function resolveHumanFighterTurnCore(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult {
  const { combat, preLevel, l2Profession } = ctx;
  const action = battleActionNamedFromL2IfMapped(ctx.action);
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);
  const rank = skillRankForCurrentAction(ctx);
  const args: FighterTurnCoreArgs = {
    ctx,
    rollPhys,
    action,
    combat,
    preLevel,
    l2Profession,
    profM,
    rank,
  };

  const b = tryResolveHumanFighterTurnBasics(args);
  if (b) return b;
  const d = tryResolveHumanFighterTurnDetections(args);
  if (d) return d;
  const s = tryResolveHumanFighterTurnStances(args);
  if (s) return s;
  const so = tryResolveHumanFighterTurnSonic(args);
  if (so) return so;

  const raceCat = tryResolveFighterRaceCatalogTurn(ctx, rollPhys);
  if (raceCat) return raceCat;

  const gap = resolveHumanFighterGapSkillsTurn(ctx, rollPhys);
  if (gap) return gap;

  throw new Error('battle_skill_not_allowed');
}
