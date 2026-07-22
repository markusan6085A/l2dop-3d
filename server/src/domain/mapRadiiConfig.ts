import { BATTLE_RANGE } from './battleTypes.js';
import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';

export type MapRadiiConfig = {
  /** Жовте коло: список мобів, start/join/attack PvE, дистанція PvP-кому на commit. */
  mobInteractionRadius: number;
  /** Червоне коло: видимість інших гравців на map sync. */
  playerVisibilityRadius: number;
  /** Радіус участі члена паті в EXP/SP/адені/дропі (world party kill). */
  partyRewardRadius: number;
  /** Радіус старту world PvP/PK (commit distance). */
  pvpInteractionRadius: number;
};

/** Canonical map radii для GET /game/map/sync → map.js (без хардкоду на клієнті). */
export function getMapRadiiConfig(): MapRadiiConfig {
  return {
    mobInteractionRadius: BATTLE_RANGE,
    playerVisibilityRadius: MAP_NEARBY_HERO_RADIUS,
    partyRewardRadius: MAP_NEARBY_HERO_RADIUS,
    pvpInteractionRadius: BATTLE_RANGE,
  };
}
