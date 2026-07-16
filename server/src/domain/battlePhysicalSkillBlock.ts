import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { BATTLE_ACTIONS_NO_MOB_HP, type BattleActionId } from './battle.js';

/**
 * Чи дія — «фізичне уміння» для Shield Slam (353) та дзеркального дебафа на гравця.
 * Автоатака (`attack`), тогли/стійки, селф-бафи/хіли/дебафи без прямого фіз. удару — дозволені.
 */
export function isPhysicalBattleSkillAction(
  action: BattleActionId,
  classBranch: string
): boolean {
  if (action === 'attack') return false;
  if (
    action === 'fighter_soulshot_toggle' ||
    action === 'mystic_spiritshot_toggle' ||
    action === 'battle_potion_use'
  ) {
    return false;
  }
  if (isMysticClassBranch(classBranch)) {
    if (action === 'bolt' || action === 'power' || action === 'stun') return false;
    const s = String(action);
    if (/^l2_\d+$/.test(s)) return false;
  }
  if (BATTLE_ACTIONS_NO_MOB_HP.has(action)) return false;
  return true;
}
