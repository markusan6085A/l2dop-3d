import {
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
} from '../data/mapWorldSpawns.js';
import { filterSpawnsVisibleForPlayer } from '../domain/mobSpawnRespawn.js';
import { mobIconUrlForSpawn } from './spawnCatalogService.js';

const MAP_MARKER_MAX = 500;

/** Тільки моби в радіусі гравця (для маркерів на карті) + іконка; дедуп як у списку «поруч». */
export function getMapWorldSpawnsNearPlayer(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now()
) {
  const R = MAP_NEARBY_LIST_RADIUS;
  const R2 = R * R;
  type Row = {
    s: (typeof MAP_WORLD_SPAWNS)[number];
    d: number;
  };
  const rows: Row[] = [];
  for (const s of MAP_WORLD_SPAWNS) {
    const dx = s.worldX - worldX;
    const dy = s.worldY - worldY;
    if (dx * dx + dy * dy > R2) continue;
    rows.push({ s, d: Math.hypot(dx, dy) });
  }
  const byBase = new Map<string, Row>();
  for (const row of rows) {
    const base = stripSpawnDupSuffix(row.s.id);
    const prev = byBase.get(base);
    if (!prev || row.d < prev.d) {
      byBase.set(base, row);
    }
  }
  const merged = [...byBase.values()].sort((a, b) => a.d - b.d);
  const slice = merged.slice(0, MAP_MARKER_MAX);
  const visible = filterSpawnsVisibleForPlayer(
    slice.map(({ s }) => s),
    mobSpawnHpJson,
    nowMs
  );
  return visible.map((s) => ({
    id: s.id,
    worldX: s.worldX,
    worldY: s.worldY,
    name: s.name,
    level: s.level,
    kind: s.kind,
    aggressive: s.aggressive,
    icon: mobIconUrlForSpawn(s),
  }));
}
