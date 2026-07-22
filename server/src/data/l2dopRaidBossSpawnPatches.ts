import type { MapWorldSpawn } from './mapWorldSpawns.js';
import {
  RB_LV20_25_BOSSES,
  type RaidBossLv20_25Spec,
} from './l2dopRaidBossLv20_25Catalog.js';

const NAME_BY_SPAWN_ID = new Map<string, string>(
  RB_LV20_25_BOSSES.map((b) => [b.spawnId, b.nameUk])
);

/** Українські назви та рівень для перших 15 РБ 20–25 (поверх generated spawns). */
export function applyRaidBossSpawnPatches(
  spawns: readonly MapWorldSpawn[]
): MapWorldSpawn[] {
  return spawns.map((spawn) => {
    const nameUk = NAME_BY_SPAWN_ID.get(spawn.id);
    if (!nameUk) return spawn;
    const spec = RB_LV20_25_BOSSES.find((b) => b.spawnId === spawn.id);
    if (!spec) return { ...spawn, name: nameUk };
    return {
      ...spawn,
      name: nameUk,
      level: spec.level,
    };
  });
}

export function raidBossLv20_25SpecForSpawnId(
  spawnId: string
): RaidBossLv20_25Spec | undefined {
  return RB_LV20_25_BOSSES.find((b) => b.spawnId === spawnId);
}
