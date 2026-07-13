import { getWorldSpawnById, MAP_WORLD_SPAWNS } from '../data/mapWorldSpawns.js';
import { mobIconUrlForSpawn } from './spawnCatalogService.js';

export const RB_TELEPORT_ADENA_COST = 1;
export const RB_LIST_PAGE_SIZE = 15;

const RAID_BOSSES_SORTED = MAP_WORLD_SPAWNS.filter((s) => s.kind === 'raid')
  .slice()
  .sort(
    (a, b) =>
      a.level - b.level ||
      a.name.localeCompare(b.name, 'uk', { sensitivity: 'base' })
  );

export interface RaidBossListRow {
  spawnId: string;
  name: string;
  level: number;
  adenaCost: number;
  icon: string;
}

export function listRaidBossesPage(
  page: number,
  pageSize: number = RB_LIST_PAGE_SIZE
): {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  adenaCost: number;
  bosses: RaidBossListRow[];
} {
  const total = RAID_BOSSES_SORTED.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page) || 1), totalPages);
  const start = (safePage - 1) * pageSize;
  const bosses = RAID_BOSSES_SORTED.slice(start, start + pageSize).map(
    (spawn) => ({
      spawnId: spawn.id,
      name: spawn.name,
      level: spawn.level,
      adenaCost: RB_TELEPORT_ADENA_COST,
      icon: mobIconUrlForSpawn(spawn),
    })
  );
  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
    adenaCost: RB_TELEPORT_ADENA_COST,
    bosses,
  };
}

export function resolveRaidBossSpawnForTeleport(spawnId: string) {
  const id = String(spawnId || '').trim();
  if (!id) return null;
  const spawn = getWorldSpawnById(id);
  if (!spawn || spawn.kind !== 'raid') return null;
  return spawn;
}
