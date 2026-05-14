import {
  BATTLE_ACTIONS_NO_MOB_HP,
  type BattleActionId,
  type BattleBattleMods,
} from '../domain/battle.js';
import { mysticSkillSkipsMobHpByBattleId } from '../data/humanMysticSkillCatalog.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';

export const BATTLE_REGEN_TICK_SECONDS = 2;

export function randomMobRetaliationWindowHits(): number {
  return 1 + Math.floor(Math.random() * 3);
}

export function battleActionSkipsMobHp(
  action: BattleActionId,
  race: string,
  classBranch: string
): boolean {
  if (BATTLE_ACTIONS_NO_MOB_HP.has(action)) return true;
  if (typeof action === 'string' && /^l2_\d+$/.test(action)) {
    if (mysticSkillSkipsMobHpByBattleId(action, race)) return true;
    const fe = fighterCatalogEntryForRace(race, classBranch, action);
    if (fe && fe.skipMobHp) return true;
    return false;
  }
  return false;
}

/**
 * Прибрати legacy-поля `battleMods`, пов’язані з уніфікованими self-buffs
 * (War Cry 78, Battle Roar 121, Thrill Fight 130). Використовується при касті
 * in-battle, щоб не було подвійного застосування з `combatBuffsFromActiveJson`.
 */
export function stripLegacyBattleModsInPlace(
  bm: BattleBattleMods | undefined,
  skillId: number
): void {
  if (!bm) return;
  const fields: readonly (keyof BattleBattleMods)[] =
    skillId === 78
      ? ['warCryPatkMul']
      : skillId === 121
        ? ['battleRoarMaxHpMul']
        : skillId === 130
          ? ['thrillFightPatkMul']
          : [];
  for (const f of fields) {
    if (f in bm) {
      delete (bm as Record<string, unknown>)[f as string];
    }
  }
}
