import { BATTLE_RANGE } from './battleTypes.js';
import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';

export type MapRadiiConfig = {
  mobInteractionRadius: number;
  playerVisibilityRadius: number;
};

/** Canonical map radii для клієнта (жовте = BATTLE_RANGE, червоне = MAP_NEARBY_HERO_RADIUS). */
export function getMapRadiiConfig(): MapRadiiConfig {
  return {
    mobInteractionRadius: BATTLE_RANGE,
    playerVisibilityRadius: MAP_NEARBY_HERO_RADIUS,
  };
}
