/**
 * Діапазони рівнів мобів для кожного пункту телепорту (Interlude gatekeeper / l2tools).
 * Резервний каталог — якщо біля точки немає звичайних спавнів.
 * Значення min/max синхронізовані з TELEPORT_POOL_OVERRIDES (l2dopNpcMeta).
 */

import { MAP_TOWNS, getTeleportDestination } from './mapLocalities.js';
import { getMobLevelRangeFromNearbySpawns } from './mapWorldSpawns.js';

export type TeleportMobLevelRange = { min: number; max: number };

/** teleportId → діапазон рівнів мобів у зоні. */
export const TELEPORT_MOB_LEVEL_RANGES: Record<string, TeleportMobLevelRange> = {
  // —— Giran ——
  giran: { min: 31, max: 39 },
  giran_harbor: { min: 25, max: 30 },
  dragon_valley: { min: 46, max: 52 },
  antharas_lair: { min: 59, max: 66 },
  devils_isle: { min: 43, max: 51 },
  brekas_stronghold: { min: 31, max: 39 },

  // —— Gludio ——
  gludio: { min: 5, max: 25 },
  ruins_of_agony: { min: 15, max: 35 },
  ruins_of_despair: { min: 15, max: 32 },
  ant_nest: { min: 30, max: 37 },
  windawood_manor: { min: 22, max: 25 },

  // —— Dion ——
  dion: { min: 22, max: 30 },
  cruma_marshlands: { min: 28, max: 35 },
  cruma_tower: { min: 40, max: 49 },
  fortress_of_resistance: { min: 23, max: 30 },
  plains_of_dion: { min: 20, max: 31 },
  bee_hive: { min: 28, max: 37 },
  tanor_canyon: { min: 40, max: 50 },

  // —— Oren ——
  oren: { min: 15, max: 35 },
  ivory_tower: { min: 40, max: 42 },
  skyshadow_meadow: { min: 54, max: 54 },
  plains_of_the_lizardman: { min: 35, max: 39 },
  outlaw_forest: { min: 50, max: 55 },
  sea_of_spores: { min: 40, max: 42 },

  // —— Hunters Village ——
  hunters: { min: 40, max: 55 },
  enchanted_valley_south: { min: 45, max: 50 },
  enchanted_valley_north: { min: 48, max: 53 },
  forest_of_mirrors: { min: 40, max: 55 },

  // —— Aden ——
  aden: { min: 45, max: 55 },
  coliseum: { min: 44, max: 53 },
  forsaken_plains: { min: 54, max: 60 },
  blazing_swamp: { min: 48, max: 55 },
  fields_of_massacre: { min: 58, max: 65 },
  ancient_battleground: { min: 64, max: 70 },
  silent_valley: { min: 74, max: 79 },
  tower_of_insolence: { min: 60, max: 62 },

  // —— Dark Elven ——
  dark_elf_village: { min: 5, max: 9 },
  dark_elven_forest: { min: 8, max: 20 },
  swampland: { min: 15, max: 40 },
  spider_nest: { min: 15, max: 23 },
  school_of_dark_arts: { min: 12, max: 21 },

  // —— Dwarven ——
  dwarf_village: { min: 5, max: 33 },
  mithril_mines: { min: 6, max: 33 },
  abandoned_coal_mines: { min: 5, max: 13 },
  eastern_mining_zone: { min: 13, max: 61 },

  // —— Elven ——
  elf_village: { min: 3, max: 16 },
  elven_forest: { min: 8, max: 20 },
  neutral_zone: { min: 5, max: 20 },
  elven_fortress: { min: 12, max: 21 },

  // —— Talking Island ——
  talking_island: { min: 4, max: 7 },
  elven_ruins: { min: 12, max: 21 },
  talking_island_harbor: { min: 14, max: 17 },
  cedrics_training_hall: { min: 4, max: 7 },

  // —— Gludin ——
  gludin: { min: 5, max: 28 },
  langk_lizardman_dwelling: { min: 15, max: 35 },
  windmill_hill: { min: 21, max: 31 },
  fellmere_hunting_grounds: { min: 14, max: 18 },
  forgotten_temple: { min: 12, max: 21 },
  orc_barracks: { min: 23, max: 34 },
  windy_hill: { min: 15, max: 35 },
  abandoned_camp: { min: 21, max: 32 },
  wastelands: { min: 15, max: 37 },

  // —— Orc ——
  orc_village: { min: 4, max: 7 },
  immortal_plateau_southern: { min: 8, max: 35 },
  immortal_plateau: { min: 4, max: 24 },
  cave_of_trials: { min: 10, max: 35 },
  frozen_waterfall: { min: 6, max: 24 },

  // —— Heine ——
  heine: { min: 39, max: 45 },
  field_of_silence: { min: 38, max: 48 },
  field_of_whispers: { min: 36, max: 53 },
  alligator_island: { min: 40, max: 45 },
  garden_of_eva: { min: 44, max: 58 },

  // —— Rune ——
  rune: { min: 57, max: 63 },
  wild_beast_pastures: { min: 63, max: 70 },
  valley_of_saints: { min: 67, max: 72 },
  forest_of_the_dead: { min: 55, max: 71 },
  swamp_of_screams: { min: 68, max: 78 },
  monastery_of_silence: { min: 75, max: 80 },

  // —— Goddard ——
  goddard: { min: 72, max: 77 },
  varka_silenos_stronghold: { min: 77, max: 78 },
  ketra_orc_outpost: { min: 77, max: 78 },
  hot_springs: { min: 73, max: 76 },
  wall_of_argos: { min: 71, max: 78 },

  // —— Schuttgart ——
  schuttgart: { min: 69, max: 78 },
  den_of_evil: { min: 66, max: 80 },
  plunderous_plains: { min: 60, max: 70 },
  frozen_labyrinth: { min: 53, max: 63 },
  crypts_of_disgrace: { min: 71, max: 80 },
  pavel_ruins: { min: 46, max: 54 },

  // —— Інше ——
  ancient_tomb_fields: { min: 40, max: 57 },
};

export function getTeleportMobLevelRangeFromCatalog(
  teleportId: string
): TeleportMobLevelRange | null {
  const id = String(teleportId || '').trim();
  if (!id) return null;
  const row = TELEPORT_MOB_LEVEL_RANGES[id];
  if (!row) return null;
  const min = Math.floor(Number(row.min));
  const max = Math.floor(Number(row.max));
  if (!Number.isFinite(min) || !Number.isFinite(max) || min < 1 || max < min) {
    return null;
  }
  return { min, max };
}

function resolveTeleportMobLevelRange(
  teleportId: string
): TeleportMobLevelRange | null {
  const dest = getTeleportDestination(teleportId);
  if (!dest) return null;

  const fromSpawns = getMobLevelRangeFromNearbySpawns(dest.worldX, dest.worldY);
  if (fromSpawns) return fromSpawns;

  return getTeleportMobLevelRangeFromCatalog(teleportId);
}

/** Кеш діапазонів: один раз при старті, не на кожен GET /teleport/locations. */
const TELEPORT_MOB_LEVEL_RANGE_CACHE = new Map<string, TeleportMobLevelRange | null>();

for (const town of MAP_TOWNS) {
  TELEPORT_MOB_LEVEL_RANGE_CACHE.set(
    town.teleportId,
    resolveTeleportMobLevelRange(town.teleportId)
  );
}

/** Діапазон для UI телепорту: з кешу (спавни на карті, обчислені при старті). */
export function getTeleportMobLevelRange(
  teleportId: string
): TeleportMobLevelRange | null {
  const id = String(teleportId || '').trim();
  if (!id) return null;
  if (TELEPORT_MOB_LEVEL_RANGE_CACHE.has(id)) {
    return TELEPORT_MOB_LEVEL_RANGE_CACHE.get(id) ?? null;
  }
  return resolveTeleportMobLevelRange(id);
}
