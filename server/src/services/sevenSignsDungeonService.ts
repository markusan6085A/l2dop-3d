import {
  findSevenSignsDungeonById,
  findNearbySevenSignsDungeonEntrance,
  type SevenSignsDungeon,
} from '../data/sevenSignsDungeons.js';
import {
  buildDungeonNearbyMobViews,
  type DungeonNearbyMobEntry,
} from '../domain/dungeonNearbyMobsQuery.js';
import type { CharacterMapStatePayload } from './charMapStateService.js';

export interface DungeonEntrancePayload {
  id: string;
  kind: SevenSignsDungeon['kind'];
  labelEn: string;
  labelUk: string;
  worldX: number;
  worldY: number;
}

export type DungeonMobViewEntry = DungeonNearbyMobEntry;

export interface DungeonViewPayload {
  id: string;
  kind: SevenSignsDungeon['kind'];
  labelEn: string;
  labelUk: string;
  mapImageUrl: string;
  nearbyMobs: DungeonMobViewEntry[];
  mobMarkers: DungeonMobViewEntry[];
}

export function getDungeonEntranceAt(
  playerX: number,
  playerY: number
): DungeonEntrancePayload | null {
  const d = findNearbySevenSignsDungeonEntrance(playerX, playerY);
  if (!d) return null;
  return {
    id: d.id,
    kind: d.kind,
    labelEn: d.labelEn,
    labelUk: d.labelUk,
    worldX: d.worldX,
    worldY: d.worldY,
  };
}

export function getDungeonViewForPlayer(
  _mapState: CharacterMapStatePayload,
  dungeonId: string,
  playerMapX: number,
  playerMapY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now()
): DungeonViewPayload | null {
  const dungeon = findSevenSignsDungeonById(dungeonId);
  if (!dungeon) return null;

  const mobViews = buildDungeonNearbyMobViews(
    dungeonId,
    playerMapX,
    playerMapY,
    mobSpawnHpJson,
    nowMs
  );

  return {
    id: dungeon.id,
    kind: dungeon.kind,
    labelEn: dungeon.labelEn,
    labelUk: dungeon.labelUk,
    mapImageUrl: dungeon.mapImageUrl,
    nearbyMobs: mobViews.listEntries,
    mobMarkers: mobViews.markerEntries,
  };
}

