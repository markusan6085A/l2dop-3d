import { getDungeonMobSpawnsForDungeon } from '../data/sevenSignsDungeonMobSpawns.js';
import type { HuntNextSpawnResult } from './battleHuntChain.js';
import {
  DUNGEON_BATTLE_RANGE_PX,
  DUNGEON_NEARBY_LIST_RADIUS_PX,
} from './dungeonNearbyMobsQuery.js';
import { isMobSpawnOnRespawn } from './mobSpawnRespawn.js';
import { parseMobSpawnHpState } from './mobSpawnHpState.js';

export interface DungeonHuntSpawnOpts {
  dungeonId: string;
  playerMapX: number;
  playerMapY: number;
  targetLevel: number;
  levelTolerance?: number;
  excludeSpawnId?: string;
  preferredSpawnId?: string;
  mobSpawnHpJson?: unknown;
  nowMs?: number;
}

/** Наступні цілі «Полювати далі» у подземеллі — за mapX/mapY гравця, не worldX/worldY. */
export function listDungeonHuntCandidatesOrdered(
  opts: DungeonHuntSpawnOpts
): HuntNextSpawnResult[] {
  const {
    dungeonId,
    playerMapX,
    playerMapY,
    excludeSpawnId,
    preferredSpawnId,
    mobSpawnHpJson,
    nowMs = Date.now(),
  } = opts;

  const excludeExact = excludeSpawnId ? String(excludeSpawnId).trim() : '';
  const preferredExact = preferredSpawnId
    ? String(preferredSpawnId).trim()
    : '';
  const viewR2 = DUNGEON_NEARBY_LIST_RADIUS_PX * DUNGEON_NEARBY_LIST_RADIUS_PX;
  const state = parseMobSpawnHpState(mobSpawnHpJson, nowMs);
  const hits: HuntNextSpawnResult[] = [];

  for (const sp of getDungeonMobSpawnsForDungeon(dungeonId)) {
    if (isMobSpawnOnRespawn(state, sp.id, nowMs)) continue;
    if (excludeExact && sp.id === excludeExact) continue;

    const dx = sp.mapX - playerMapX;
    const dy = sp.mapY - playerMapY;
    if (dx * dx + dy * dy > viewR2) continue;

    const d = Math.hypot(dx, dy);
    if (d > DUNGEON_BATTLE_RANGE_PX) continue;

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

export function countDungeonHuntSpawnsNearby(opts: DungeonHuntSpawnOpts): number {
  return listDungeonHuntCandidatesOrdered(opts).length;
}

export function findNextDungeonHuntSpawn(
  opts: DungeonHuntSpawnOpts
): HuntNextSpawnResult | null {
  return listDungeonHuntCandidatesOrdered(opts)[0] ?? null;
}
