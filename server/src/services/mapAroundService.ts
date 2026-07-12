import { resolveMapLocality } from '../data/mapLocalities.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import type { CharacterRow } from './charTypes.js';
import {
  getNearbyHeroesForMap,
  type NearbyHeroEntry,
} from './mapNearbyHeroesService.js';
import {
  buildMapNearbySpawnViews,
  type NearbySpawnEntry,
} from './mapNearbySpawnsQuery.js';

export type { NearbyHeroEntry, NearbySpawnEntry };

/** Актуальні worldX/worldY для списку мобів (як у бою / hunt-continue). */
export function resolvedWorldPositionFromCharacterRow(row: CharacterRow): {
  worldX: number;
  worldY: number;
  mobSpawnHpJson: CharacterRow['mobSpawnHpJson'];
} {
  const base = resolveMapMovement(applyPassiveHpRegen(row));
  return {
    worldX: base.worldX,
    worldY: base.worldY,
    mobSpawnHpJson: base.mobSpawnHpJson,
  };
}

export async function getMapAroundAt(
  worldX: number,
  worldY: number,
  mobSpawnHpJson?: unknown,
  nowMs: number = Date.now(),
  excludeCharacterId?: string
) {
  const base = resolveMapLocality(worldX, worldY);
  const { listEntries } = buildMapNearbySpawnViews(
    worldX,
    worldY,
    mobSpawnHpJson,
    nowMs
  );
  const nearbyHeroes = excludeCharacterId
    ? await getNearbyHeroesForMap(worldX, worldY, excludeCharacterId, nowMs)
    : [];
  return {
    ...base,
    nearbySpawns: listEntries,
    nearbyHeroes,
  };
}

export async function getMapAroundForUser(userId: string) {
  const row = await prisma.character.findFirst({
    where: { userId },
  });
  if (!row) return null;
  const pos = resolvedWorldPositionFromCharacterRow(row as CharacterRow);
  const nowMs = Date.now();
  return getMapAroundAt(
    pos.worldX,
    pos.worldY,
    pos.mobSpawnHpJson,
    nowMs,
    row.id
  );
}
