import {
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from './battleTypes.js';
import {
  isMobSpawnOnRespawn,
  isRegularMobRespawnKind,
} from './mobSpawnRespawn.js';
import { parseMobSpawnHpState } from './mobSpawnHpState.js';

/** Допуск рівня моба відносно вбитого моба для «Полювати далі». */
export const HUNT_LEVEL_TOLERANCE = 5;

export interface HuntNextSpawnResult {
  spawnId: string;
  name: string;
  level: number;
  distance: number;
}

export interface FindNextHuntSpawnOpts {
  worldX: number;
  worldY: number;
  /** Рівень вбитого моба (або інший якір); шукаємо мобів у `[targetLevel ± levelTolerance]`. */
  targetLevel: number;
  /** Діапазон рівнів, наприклад 5 для ±5 від targetLevel. */
  levelTolerance?: number;
  excludeSpawnId?: string;
  /** Якщо задано — перевірити цю ціль першою (наприклад з summary перемоги). */
  preferredSpawnId?: string;
  mobSpawnHpJson?: unknown;
  nowMs?: number;
}

function huntCandidateDistance(
  sp: MapWorldSpawn,
  worldX: number,
  worldY: number
): number {
  return Math.hypot(sp.worldX - worldX, sp.worldY - worldY);
}

/** Усі доступні точки спавну (кожен __dup окремо), відсортовані за відстанню. */
export function listHuntCandidatesOrdered(
  opts: FindNextHuntSpawnOpts
): HuntNextSpawnResult[] {
  const {
    worldX,
    worldY,
    targetLevel,
    levelTolerance = HUNT_LEVEL_TOLERANCE,
    excludeSpawnId,
    preferredSpawnId,
    mobSpawnHpJson,
    nowMs = Date.now(),
  } = opts;

  const lvl = Math.max(1, Math.floor(targetLevel));
  const tol = Math.max(0, Math.min(10, Math.floor(levelTolerance)));
  const excludeExact = excludeSpawnId ? String(excludeSpawnId).trim() : '';
  const preferredExact = preferredSpawnId
    ? String(preferredSpawnId).trim()
    : '';

  const viewR2 = MAP_NEARBY_LIST_RADIUS * MAP_NEARBY_LIST_RADIUS;
  const state = parseMobSpawnHpState(mobSpawnHpJson, nowMs);
  const hits: HuntNextSpawnResult[] = [];

  for (const sp of MAP_WORLD_SPAWNS) {
    if (Math.abs(sp.level - lvl) > tol) continue;
    if (!isRegularMobRespawnKind(sp.kind)) continue;
    if (isMobSpawnOnRespawn(state, sp.id, nowMs)) continue;
    if (excludeExact && sp.id === excludeExact) continue;

    const dx = sp.worldX - worldX;
    const dy = sp.worldY - worldY;
    if (dx * dx + dy * dy > viewR2) continue;

    const d = huntCandidateDistance(sp, worldX, worldY);
    if (d > BATTLE_RANGE) continue;

    hits.push({
      spawnId: sp.id,
      name: sp.name,
      level: sp.level,
      distance: Math.round(d),
    });
  }

  hits.sort((a, b) => a.distance - b.distance);
  if (!preferredExact) return hits;

  const prefIdx = hits.findIndex((h) => h.spawnId === preferredExact);
  if (prefIdx <= 0) return hits;
  const pref = hits[prefIdx];
  const rest = hits.filter((_, i) => i !== prefIdx);
  return [pref, ...rest];
}

export function findNextSameLevelHuntSpawn(
  opts: FindNextHuntSpawnOpts
): HuntNextSpawnResult | null {
  return listHuntCandidatesOrdered(opts)[0] ?? null;
}

/** Скільки ще підходящих мобів доступно поруч (після respawn-фільтра). */
export function countSameLevelHuntSpawnsNearby(
  opts: FindNextHuntSpawnOpts
): number {
  return listHuntCandidatesOrdered(opts).length;
}
