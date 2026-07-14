import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import { mobNameRewardMult } from './mobNameRewardBonus.js';

/** Респавн чемпіонського моба після кілу (per character). */
export const CHAMPION_MOB_RESPAWN_MS = 10 * 60 * 1000;

/** Множник HP / атаки / захисту чемпіонів відносно звичайного полевого моба. */
export const CHAMPION_COMBAT_STAT_MULT = 2;

/** Множник EXP / SP / адени за кіл чемпіона. */
export const CHAMPION_REWARD_MULT = 10;

export function isChampionSpawnKind(kind: MapSpawnKind | string | undefined): boolean {
  return kind === 'champion';
}

/** Загальний множник нагороди (чемпіон × ім'я моба) — для кіллу й модалки карти. */
export function mobKillRewardMult(opts: {
  spawnKind?: MapSpawnKind | string;
  mobName?: string | null;
}): number {
  const kindMult = isChampionSpawnKind(opts.spawnKind) ? CHAMPION_REWARD_MULT : 1;
  return kindMult * mobNameRewardMult(opts.mobName);
}
