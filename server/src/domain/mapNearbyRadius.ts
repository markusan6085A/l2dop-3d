import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';

/** Той самий радіус, що для PvP / «герої поруч» на map.html. */
export function isWithinMapNearbyHeroRadius(
  playerX: number,
  playerY: number,
  targetX: number,
  targetY: number,
  radius: number = MAP_NEARBY_HERO_RADIUS
): boolean {
  const dx = playerX - targetX;
  const dy = playerY - targetY;
  return dx * dx + dy * dy <= radius * radius;
}
