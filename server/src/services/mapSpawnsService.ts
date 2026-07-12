import { buildMapNearbySpawnViews } from './mapNearbySpawnsQuery.js';

export type { MapMarkerSpawnEntry } from './mapNearbySpawnsQuery.js';

/** Тільки моби в радіусі гравця (для маркерів на карті) + іконка. */
export function getMapWorldSpawnsNearPlayer(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now()
) {
  return buildMapNearbySpawnViews(
    worldX,
    worldY,
    mobSpawnHpJson,
    nowMs
  ).markerEntries;
}
