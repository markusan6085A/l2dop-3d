import type { MapWorldSpawn } from './mapWorldSpawns.js';
import { findSevenSignsDungeonById } from './sevenSignsDungeons.js';
import {
  SEVEN_SIGNS_DUNGEON_MOB_SPAWNS,
  type SevenSignsDungeonMobSpawn,
} from './sevenSignsDungeonMobSpawns.generated.js';

const spawnById = new Map<string, SevenSignsDungeonMobSpawn>();

for (const rows of Object.values(SEVEN_SIGNS_DUNGEON_MOB_SPAWNS)) {
  for (const row of rows) {
    spawnById.set(row.id, row);
  }
}

export function getDungeonMobSpawnById(
  id: string
): SevenSignsDungeonMobSpawn | undefined {
  return spawnById.get(String(id || '').trim());
}

export function getDungeonMobSpawnsForDungeon(
  dungeonId: string
): SevenSignsDungeonMobSpawn[] {
  return SEVEN_SIGNS_DUNGEON_MOB_SPAWNS[dungeonId] ?? [];
}

export function isSevenSignsDungeonMobSpawnId(id: string): boolean {
  return spawnById.has(String(id || '').trim());
}

/** Конвертація для бою / каталогу (worldX/Y = вхід подземелля). */
export function dungeonMobSpawnToMapWorldSpawn(
  spawn: SevenSignsDungeonMobSpawn
): MapWorldSpawn | null {
  const dungeon = findSevenSignsDungeonById(spawn.dungeonId);
  if (!dungeon) return null;
  return {
    id: spawn.id,
    worldX: dungeon.worldX,
    worldY: dungeon.worldY,
    templateId: String(spawn.npcId),
    name: spawn.name,
    level: spawn.level,
    kind: spawn.aggressive ? 'aggressive' : 'passive',
    aggressive: spawn.aggressive,
  };
}

export function resolveMapWorldSpawnById(
  id: string
): MapWorldSpawn | undefined {
  const dSpawn = getDungeonMobSpawnById(id);
  if (dSpawn) {
    return dungeonMobSpawnToMapWorldSpawn(dSpawn) ?? undefined;
  }
  return undefined;
}

export type { SevenSignsDungeonMobSpawn };
