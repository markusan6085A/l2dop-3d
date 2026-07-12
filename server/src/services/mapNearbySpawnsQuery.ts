import {
  MAP_NEARBY_LIST_RADIUS,
  stripSpawnDupSuffix,
  type MapSpawnKind,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from '../domain/battle.js';
import { querySpawnsWithinRadius } from '../domain/mapSpawnSpatialIndex.js';
import { filterSpawnsVisibleForPlayer } from '../domain/mobSpawnRespawn.js';
import { mobIconUrlForSpawn } from './spawnCatalogService.js';

const LIST_MAX = 400;
const MARKER_MAX = 500;

/** Найближчі точки мобів з карти; посилання на бій лише якщо inBattleRange. */
export interface NearbySpawnEntry {
  id: string;
  name: string;
  level: number;
  distance: number;
  inBattleRange: boolean;
  kind: MapSpawnKind;
  icon: string;
}

export interface MapMarkerSpawnEntry {
  id: string;
  worldX: number;
  worldY: number;
  name: string;
  level: number;
  kind: MapWorldSpawn['kind'];
  aggressive: boolean;
  icon: string;
}

interface DedupedRow {
  spawn: MapWorldSpawn;
  distance: number;
}

function dedupeNearestSpawnRows(
  worldX: number,
  worldY: number,
  radius: number
): DedupedRow[] {
  const rows = querySpawnsWithinRadius(worldX, worldY, radius);
  const byBase = new Map<string, DedupedRow>();
  for (const row of rows) {
    const base = stripSpawnDupSuffix(row.spawn.id);
    const prev = byBase.get(base);
    if (!prev || row.distance < prev.distance) {
      byBase.set(base, row);
    }
  }
  return [...byBase.values()].sort((a, b) => a.distance - b.distance);
}

function toListEntry(row: DedupedRow): NearbySpawnEntry {
  const d = row.distance;
  return {
    id: row.spawn.id,
    name: row.spawn.name,
    level: row.spawn.level,
    distance: Math.round(d),
    inBattleRange: d <= BATTLE_RANGE,
    kind: row.spawn.kind,
    icon: mobIconUrlForSpawn(row.spawn),
  };
}

function toMarkerEntry(spawn: MapWorldSpawn): MapMarkerSpawnEntry {
  return {
    id: spawn.id,
    worldX: spawn.worldX,
    worldY: spawn.worldY,
    name: spawn.name,
    level: spawn.level,
    kind: spawn.kind,
    aggressive: spawn.aggressive,
    icon: mobIconUrlForSpawn(spawn),
  };
}

/** Один spatial-запит → список «поруч» + маркери на карті. */
export function buildMapNearbySpawnViews(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now(),
  radius: number = MAP_NEARBY_LIST_RADIUS
): { listEntries: NearbySpawnEntry[]; markerEntries: MapMarkerSpawnEntry[] } {
  const deduped = dedupeNearestSpawnRows(worldX, worldY, radius);
  const listSlice = deduped.slice(0, LIST_MAX).map(toListEntry);
  const listEntries = filterSpawnsVisibleForPlayer(
    listSlice,
    mobSpawnHpJson,
    nowMs
  );

  const markerSlice = deduped.slice(0, MARKER_MAX).map((r) => r.spawn);
  const markerVisible = filterSpawnsVisibleForPlayer(
    markerSlice,
    mobSpawnHpJson,
    nowMs
  );
  const markerEntries = markerVisible.map(toMarkerEntry);

  return { listEntries, markerEntries };
}
