import type { BattleActionId } from '../domain/battle.js';
import type { InventoryState } from '../data/inventory.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { battleActionAllowed } from './battleServiceBattleUi.js';

/** Базова атака для auto_hunt: маг — bolt (fallback attack), воїн/ін. — attack. */
export function resolveAutoHuntPrimaryAction(args: {
  level: number;
  race: string;
  classBranch: string;
  learnedBattle: string[];
  l2Profession: string;
  inv: InventoryState;
}): BattleActionId | null {
  const candidates: BattleActionId[] = isMysticClassBranch(args.classBranch)
    ? ['bolt', 'attack']
    : ['attack'];
  for (const action of candidates) {
    if (
      battleActionAllowed(
        action,
        args.level,
        args.race,
        args.classBranch,
        args.learnedBattle,
        args.l2Profession,
        args.inv
      )
    ) {
      return action;
    }
  }
  return null;
}
