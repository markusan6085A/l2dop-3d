import { resolveMapLocality } from '../data/mapLocalities.js';
import {
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
  type MapSpawnKind,
} from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from '../domain/battle.js';
import { filterSpawnsVisibleForPlayer } from '../domain/mobSpawnRespawn.js';
import { prisma } from '../lib/prisma.js';
import { mobIconUrlForSpawn } from './spawnCatalogService.js';

/** Найближчі точки мобів з карти; посилання на бій лише якщо inBattleRange (як BATTLE_RANGE у бою). */
export interface NearbySpawnEntry {
  id: string;
  name: string;
  level: number;
  distance: number;
  inBattleRange: boolean;
  kind: MapSpawnKind;
  /** URL іконки (/mobs/N.png) */
  icon: string;
}

function nearbySpawnsForPlayer(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now()
): NearbySpawnEntry[] {
  const R = MAP_NEARBY_LIST_RADIUS;
  const R2 = R * R;
  const candidates: NearbySpawnEntry[] = [];
  for (const s of MAP_WORLD_SPAWNS) {
    const dx = s.worldX - worldX;
    const dy = s.worldY - worldY;
    if (dx * dx + dy * dy > R2) continue;
    const d = Math.hypot(dx, dy);
    candidates.push({
      id: s.id,
      name: s.name,
      level: s.level,
      distance: Math.round(d),
      inBattleRange: d <= BATTLE_RANGE,
      kind: s.kind,
      icon: mobIconUrlForSpawn(s),
    });
  }
  /** Після ×3 спавнів лишаємо найближчу копію на кожну базову точку (без __dup). */
  const byBase = new Map<string, NearbySpawnEntry>();
  for (const e of candidates) {
    const base = stripSpawnDupSuffix(e.id);
    const prev = byBase.get(base);
    if (!prev || e.distance < prev.distance) {
      byBase.set(base, e);
    }
  }
  const out = [...byBase.values()];
  out.sort((a, b) => a.distance - b.distance);
  return filterSpawnsVisibleForPlayer(out.slice(0, 400), mobSpawnHpJson, nowMs);
}

export function getMapAroundAt(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now()
) {
  const base = resolveMapLocality(worldX, worldY);
  return {
    ...base,
    nearbySpawns: nearbySpawnsForPlayer(worldX, worldY, mobSpawnHpJson, nowMs),
  };
}

export async function getMapAroundForUser(userId: string) {
  const row = await prisma.character.findFirst({
    where: { userId },
    select: { worldX: true, worldY: true, mobSpawnHpJson: true },
  });
  if (!row) return null;
  const nowMs = Date.now();
  return getMapAroundAt(row.worldX, row.worldY, row.mobSpawnHpJson, nowMs);
}
