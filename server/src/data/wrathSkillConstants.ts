/**
 * Гнів (Wrath, l2 320): зона дії та зняття CP від max CP цілі за рангом скіла.
 * Радіус узгоджено з «поруч» на карті (`MAP_NEARBY_LIST_RADIUS`).
 */
import { MAP_NEARBY_LIST_RADIUS } from './mapWorldSpawns.js';

export const WRATH_EFFECT_RADIUS_WORLD = MAP_NEARBY_LIST_RADIUS;

/** Від max CP цілі знімається стільки відсотків (рівні скіла 1–10). */
export const WRATH_CP_DRAIN_PERCENT_BY_LEVEL: readonly number[] = [
  7, 10, 12, 15, 17, 20, 22, 25, 27, 30,
];

export function wrathCpDrainPercentForSkillLevel(level: number): number {
  const lv = Math.min(10, Math.max(1, Math.floor(level)));
  return WRATH_CP_DRAIN_PERCENT_BY_LEVEL[lv - 1]!;
}

/** Max CP моба в PvE-бою як частка від його max HP (другий «бачок» поруч із HP). */
export const MOB_MAX_CP_RATIO_OF_MAX_HP = 0.4;

export function mobMaxCpFromMobMaxHp(mobMaxHp: number): number {
  return Math.max(0, Math.floor(mobMaxHp * MOB_MAX_CP_RATIO_OF_MAX_HP));
}
