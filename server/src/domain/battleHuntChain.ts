import {
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
  stripSpawnDupSuffix,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from './battleTypes.js';
import {
  filterSpawnsVisibleForPlayer,
  isMobSpawnOnRespawn,
  isRegularMobRespawnKind,
} from './mobSpawnRespawn.js';
import { parseMobSpawnHpState } from './mobSpawnHpState.js';

/** Допуск рівня моба відносно рівня персонажа для «Полювати далі». */
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
  /** Рівень персонажа (або інший якір); шукаємо мобів у `[targetLevel ± levelTolerance]`. */
  targetLevel: number;
  /** Діапазон рівнів, наприклад 5 для ±5 від targetLevel. */
  levelTolerance?: number;
  excludeSpawnId?: string;
  mobSpawnHpJson?: unknown;
  nowMs?: number;
}

/** Найближчий доступний моб того ж рівня в радіусі огляду + досяжності бою. */
function sameLevelHuntCandidates(
  opts: FindNextHuntSpawnOpts
): MapWorldSpawn[] {
  const {
    worldX,
    worldY,
    targetLevel,
    levelTolerance = HUNT_LEVEL_TOLERANCE,
    excludeSpawnId,
    mobSpawnHpJson,
    nowMs = Date.now(),
  } = opts;

  const lvl = Math.max(1, Math.floor(targetLevel));
  const tol = Math.max(0, Math.min(10, Math.floor(levelTolerance)));
  const excludeExact = excludeSpawnId ? String(excludeSpawnId).trim() : '';

  const viewR2 = MAP_NEARBY_LIST_RADIUS * MAP_NEARBY_LIST_RADIUS;
  const state = parseMobSpawnHpState(mobSpawnHpJson, nowMs);
  const bestByBase = new Map<string, { sp: MapWorldSpawn; d: number }>();

  for (const sp of MAP_WORLD_SPAWNS) {
    if (Math.abs(sp.level - lvl) > tol) continue;
    if (!isRegularMobRespawnKind(sp.kind)) continue;
    if (isMobSpawnOnRespawn(state, sp.id, nowMs)) continue;

    const base = stripSpawnDupSuffix(sp.id);
    if (excludeExact && sp.id === excludeExact) continue;

    const dx = sp.worldX - worldX;
    const dy = sp.worldY - worldY;
    const d2 = dx * dx + dy * dy;
    if (d2 > viewR2) continue;

    const d = Math.hypot(dx, dy);
    if (d > BATTLE_RANGE) continue;

    const prev = bestByBase.get(base);
    if (!prev || d < prev.d) bestByBase.set(base, { sp, d });
  }

  const merged = [...bestByBase.values()].map((x) => x.sp);
  return filterSpawnsVisibleForPlayer(merged, state, nowMs);
}

export function findNextSameLevelHuntSpawn(
  opts: FindNextHuntSpawnOpts
): HuntNextSpawnResult | null {
  const visible = sameLevelHuntCandidates(opts);
  if (visible.length === 0) return null;

  const { worldX, worldY } = opts;
  let best: { sp: MapWorldSpawn; d: number } | null = null;
  for (const sp of visible) {
    const d = Math.hypot(sp.worldX - worldX, sp.worldY - worldY);
    if (!best || d < best.d) best = { sp, d };
  }
  if (!best) return null;

  return {
    spawnId: best.sp.id,
    name: best.sp.name,
    level: best.sp.level,
    distance: Math.round(best.d),
  };
}

/** Скільки ще мобів цього рівня доступно для полювання поруч (після respawn-фільтра). */
export function countSameLevelHuntSpawnsNearby(
  opts: FindNextHuntSpawnOpts
): number {
  return sameLevelHuntCandidates(opts).length;
}
