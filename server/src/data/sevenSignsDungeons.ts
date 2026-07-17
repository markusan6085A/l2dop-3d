import { MAMMON_BLACKSMITH_CATACOMBS } from './mammonBlacksmithCatacombs.js';
import { MAMMON_MERCHANT_NECROPOLISES } from './mammonMerchantNecropolises.js';
import { isWithinMapNearbyHeroRadius } from '../domain/mapNearbyRadius.js';

/** PNG подземель (id.png) — server/public/assets/maps/catacombs/ */
export const SEVEN_SIGNS_DUNGEON_MAP_BASE = '/assets/maps/catacombs';

export type SevenSignsDungeonKind = 'necropolis' | 'catacomb';

export interface SevenSignsDungeon {
  id: string;
  kind: SevenSignsDungeonKind;
  labelEn: string;
  labelUk: string;
  worldX: number;
  worldY: number;
  mapImageUrl: string;
}

function dungeonMapUrl(id: string): string {
  return `${SEVEN_SIGNS_DUNGEON_MAP_BASE}/${id}.png`;
}

/** Усі 14 Seven Signs подземель (8 некрополів + 6 катакомб). */
export const SEVEN_SIGNS_DUNGEONS: SevenSignsDungeon[] = [
  ...MAMMON_MERCHANT_NECROPOLISES.map((d) => ({
    id: d.id,
    kind: 'necropolis' as const,
    labelEn: d.labelEn,
    labelUk: d.labelUk,
    worldX: d.worldX,
    worldY: d.worldY,
    mapImageUrl: dungeonMapUrl(d.id),
  })),
  ...MAMMON_BLACKSMITH_CATACOMBS.map((d) => ({
    id: d.id,
    kind: 'catacomb' as const,
    labelEn: d.labelEn,
    labelUk: d.labelUk,
    worldX: d.worldX,
    worldY: d.worldY,
    mapImageUrl: dungeonMapUrl(d.id),
  })),
];

export function findSevenSignsDungeonById(id: string): SevenSignsDungeon | null {
  const key = String(id || '').trim();
  if (!key) return null;
  return SEVEN_SIGNS_DUNGEONS.find((d) => d.id === key) ?? null;
}

/** Найближчий вхід у радіусі PvP / «герої поруч» (MAP_NEARBY_HERO_RADIUS). */
export function findNearbySevenSignsDungeonEntrance(
  playerX: number,
  playerY: number
): SevenSignsDungeon | null {
  let best: SevenSignsDungeon | null = null;
  let bestDistSq = Infinity;
  for (const d of SEVEN_SIGNS_DUNGEONS) {
    if (!isWithinMapNearbyHeroRadius(playerX, playerY, d.worldX, d.worldY)) {
      continue;
    }
    const dx = playerX - d.worldX;
    const dy = playerY - d.worldY;
    const distSq = dx * dx + dy * dy;
    if (distSq < bestDistSq) {
      bestDistSq = distSq;
      best = d;
    }
  }
  return best;
}
