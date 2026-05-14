import type { CombatStatsSnapshot } from '../../data/l2dopCombatFormulas.js';
import type {
  BattleSkillResolveContext,
  PhysicalRollFn,
} from './types.js';

/** Спільний пакет для ланцюгів у `humanFighterTurnCore*`. */
export type FighterTurnCoreArgs = {
  ctx: BattleSkillResolveContext;
  rollPhys: PhysicalRollFn;
  action: string;
  combat: CombatStatsSnapshot;
  preLevel: number;
  l2Profession: string;
  profM: number;
  rank: number;
};
