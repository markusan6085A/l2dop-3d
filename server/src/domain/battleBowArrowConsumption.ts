import { countBagQty, removeBagQty, type InventoryState } from '../data/inventory.js';
import {
  equippedWeaponKind,
  equippedWeaponGmGrade,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { isMysticClassBranch } from '../data/l2dopHumanMysticBattleSkills.js';
import { mysticSkillSkipsMobHpByBattleId } from '../data/humanMysticSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';
import { bowArrowItemIdForGrade } from '../data/bowArrowItems.js';
import { BATTLE_ACTIONS_NO_MOB_HP, type BattleActionId } from './battle.js';

function battleActionSkipsMobHpLocal(
  action: BattleActionId,
  race: string,
  classBranch: string,
): boolean {
  if (BATTLE_ACTIONS_NO_MOB_HP.has(action)) return true;
  if (typeof action === 'string' && /^l2_\d+$/.test(action)) {
    if (mysticSkillSkipsMobHpByBattleId(action, race)) return true;
    const fe = fighterCatalogEntryForRace(race, classBranch, action);
    if (fe && fe.skipMobHp) return true;
  }
  return false;
}

/** Скільки стріл потрібно для дії з луком, або null якщо лук/стріл не застосовуються. */
export function bowArrowNeedForAction(
  action: BattleActionId,
  inv: InventoryState,
  race: string,
  classBranch: string,
): { arrowItemId: number; qty: number } | null {
  if (equippedWeaponKind(inv) !== 'bow') return null;
  const grade = equippedWeaponGmGrade(inv);
  if (!grade) {
    throw new Error('battle_bow_no_weapon_grade');
  }
  const arrowItemId = bowArrowItemIdForGrade(grade);

  if (action === 'attack') {
    return { arrowItemId, qty: 1 };
  }
  if (battleActionSkipsMobHpLocal(action, race, classBranch)) return null;
  if (isMysticClassBranch(classBranch)) return null;
  return { arrowItemId, qty: 2 };
}

export function assertBowArrowsForBattleAction(
  action: BattleActionId,
  inv: InventoryState,
  race: string,
  classBranch: string,
): void {
  const need = bowArrowNeedForAction(action, inv, race, classBranch);
  if (!need) return;
  if (countBagQty(inv, need.arrowItemId) < need.qty) {
    throw new Error('battle_no_arrows');
  }
}

export function consumeBowArrowsOnHit(
  inv: InventoryState,
  action: BattleActionId,
  race: string,
  classBranch: string,
): { inv: InventoryState; consumed: number } {
  const need = bowArrowNeedForAction(action, inv, race, classBranch);
  if (!need) return { inv, consumed: 0 };
  const have = countBagQty(inv, need.arrowItemId);
  const take = Math.min(have, need.qty);
  if (take <= 0) return { inv, consumed: 0 };
  return {
    inv: removeBagQty(inv, need.arrowItemId, take),
    consumed: take,
  };
}
