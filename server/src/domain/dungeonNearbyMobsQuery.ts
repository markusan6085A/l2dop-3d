import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import { filterSpawnsVisibleForPlayer } from './mobSpawnRespawn.js';
import { mobIconUrlForSpawn } from '../services/spawnCatalogService.js';
import {
  getDungeonMobSpawnsForDungeon,
  dungeonMobSpawnToMapWorldSpawn,
  type SevenSignsDungeonMobSpawn,
} from '../data/sevenSignsDungeonMobSpawns.js';

/** Радіус списку/маркерів мобів на карті подземелля (px). */
export const DUNGEON_NEARBY_LIST_RADIUS_PX = 320;

/** Радіус атаки моба на карті подземелля (px). */
export const DUNGEON_BATTLE_RANGE_PX = 140;

const LIST_MAX = 40;

export interface DungeonNearbyMobEntry {
  id: string;
  name: string;
  level: number;
  mapX: number;
  mapY: number;
  distance: number;
  inBattleRange: boolean;
  aggressive: boolean;
  kind: MapSpawnKind;
  icon: string;
}

function toEntry(
  spawn: SevenSignsDungeonMobSpawn,
  playerMapX: number,
  playerMapY: number
): DungeonNearbyMobEntry {
  const dist = Math.hypot(spawn.mapX - playerMapX, spawn.mapY - playerMapY);
  const mapSpawn = dungeonMobSpawnToMapWorldSpawn(spawn);
  return {
    id: spawn.id,
    name: spawn.name,
    level: spawn.level,
    mapX: spawn.mapX,
    mapY: spawn.mapY,
    distance: Math.round(dist),
    inBattleRange: dist <= DUNGEON_BATTLE_RANGE_PX,
    aggressive: spawn.kind === 'raid' ? true : spawn.aggressive,
    kind:
      spawn.kind === 'raid'
        ? 'raid'
        : spawn.aggressive
          ? 'aggressive'
          : 'passive',
    icon: mapSpawn ? mobIconUrlForSpawn(mapSpawn) : '/mobs/1.png',
  };
}

export function buildDungeonNearbyMobViews(
  dungeonId: string,
  playerMapX: number,
  playerMapY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now(),
  radius: number = DUNGEON_NEARBY_LIST_RADIUS_PX
): { listEntries: DungeonNearbyMobEntry[]; markerEntries: DungeonNearbyMobEntry[] } {
  const rows = getDungeonMobSpawnsForDungeon(dungeonId)
    .map((spawn) => toEntry(spawn, playerMapX, playerMapY))
    .filter((row) => row.distance <= radius)
    .sort((a, b) => a.distance - b.distance);

  const listSlice = rows.slice(0, LIST_MAX);
  const listEntries = filterSpawnsVisibleForPlayer(
    listSlice,
    mobSpawnHpJson,
    nowMs
  ) as DungeonNearbyMobEntry[];

  const markerEntries = filterSpawnsVisibleForPlayer(
    rows,
    mobSpawnHpJson,
    nowMs
  ) as DungeonNearbyMobEntry[];

  return { listEntries, markerEntries };
}

export function dungeonMobBattleDistancePx(
  spawn: SevenSignsDungeonMobSpawn,
  playerMapX: number,
  playerMapY: number
): number {
  return Math.hypot(spawn.mapX - playerMapX, spawn.mapY - playerMapY);
}
