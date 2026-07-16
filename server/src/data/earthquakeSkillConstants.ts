import { BATTLE_RANGE } from '../domain/battleTypes.js';
import { PROVOKE_MAX_INTERLUDE_RADIUS } from './provokeTables.js';

/** Interlude Earthquake (347): сила фіз. удару (1 р.). */
export const EARTHQUAKE_SKILL_POWER = 4040;
/** Interlude `skillRadius` навколо себе. */
export const EARTHQUAKE_INTERLUDE_RADIUS = 150;
/** Додаткових цілей поруч (головна + ці). */
export const EARTHQUAKE_EXTRA_MOB_CAP = 3;

export function earthquakeWorldRadius(): number {
  return Math.floor(
    BATTLE_RANGE *
      (EARTHQUAKE_INTERLUDE_RADIUS / PROVOKE_MAX_INTERLUDE_RADIUS)
  );
}

/** Фіз. atk-множник з power (як race-каталог physical_attack). */
export function earthquakePhysAtkFromPower(
  pAtk: number,
  skillPower: number,
  profM: number
): number {
  const pow = Math.max(0, Math.floor(skillPower));
  return Math.max(
    1,
    Math.floor(pAtk * (1.06 + pow / 450) * profM)
  );
}
