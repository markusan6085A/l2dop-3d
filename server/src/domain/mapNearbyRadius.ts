import { MAP_NEARBY_HERO_RADIUS } from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from './battleTypes.js';
import { parseDungeonStateJson } from './dungeonState.js';

export { BATTLE_RANGE, MAP_NEARBY_HERO_RADIUS };

/** Позиція для перевірок playfield (world map v1). */
export type PlayfieldPosition = {
  worldX: number;
  worldY: number;
  dungeonStateJson?: unknown | null;
};

export type MobWorldPosition = {
  worldX: number;
  worldY: number;
};

/** Той самий радіус, що для PvP / «герої поруч» на map.html (червоне коло). */
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

/** Canonical mob battle/join range — BATTLE_RANGE (20_000), не MAP_NEARBY_LIST_RADIUS. */
export function isWithinMobBattleRange(
  character: PlayfieldPosition,
  mob: MobWorldPosition
): boolean {
  return isWithinMapNearbyHeroRadius(
    character.worldX,
    character.worldY,
    mob.worldX,
    mob.worldY,
    BATTLE_RANGE
  );
}

/** Червоний player-radius між двома позиціями (без membership/online/alive). */
export function isWithinPlayerVisibilityRadius(
  viewer: PlayfieldPosition,
  target: PlayfieldPosition
): boolean {
  return isWithinMapNearbyHeroRadius(
    viewer.worldX,
    viewer.worldY,
    target.worldX,
    target.worldY
  );
}

/** v1: обидва на світовій карті (dungeonStateJson фактично порожній). */
export function isSameWorldPlayfield(
  a: Pick<PlayfieldPosition, 'dungeonStateJson'>,
  b: Pick<PlayfieldPosition, 'dungeonStateJson'>
): boolean {
  return (
    parseDungeonStateJson(a.dungeonStateJson) == null &&
    parseDungeonStateJson(b.dungeonStateJson) == null
  );
}

/**
 * Геометрія reward proximity: same world playfield + червоний радіус від killer.
 * Membership / online / alive — окремою eligibility-функцією (Етап C).
 */
export function isPartyMemberNearbyForReward(
  killer: PlayfieldPosition,
  member: PlayfieldPosition
): boolean {
  if (!isSameWorldPlayfield(killer, member)) return false;
  return isWithinPlayerVisibilityRadius(killer, member);
}
