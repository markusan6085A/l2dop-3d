/**
 * Діапазони рівнів мобів для кожного пункту телепорту (Interlude gatekeeper / l2tools).
 * Резервний каталог — якщо біля точки немає звичайних спавнів.
 */

import { MAP_TOWNS, getTeleportDestination } from './mapLocalities.js';
import { getMobLevelRangeFromNearbySpawns } from './mapWorldSpawns.js';

export type TeleportMobLevelRange = { min: number; max: number };

/** teleportId → діапазон рівнів мобів у зоні. */
export const TELEPORT_MOB_LEVEL_RANGES: Record<string, TeleportMobLevelRange> = {
  // —— Giran ——
  giran: { min: 35, max: 45 },
  giran_harbor: { min: 25, max: 35 },
  dragon_valley: { min: 45, max: 55 },
  antharas_lair: { min: 70, max: 80 },
  devils_isle: { min: 40, max: 50 },
  brekas_stronghold: { min: 30, max: 40 },

  // —— Gludio ——
  gludio: { min: 20, max: 30 },
  ruins_of_agony: { min: 16, max: 35 },
  ruins_of_despair: { min: 21, max: 34 },
  ant_nest: { min: 27, max: 40 },
  windawood_manor: { min: 20, max: 30 },

  // —— Dion ——
  dion: { min: 25, max: 35 },
  cruma_marshlands: { min: 25, max: 37 },
  cruma_tower: { min: 40, max: 50 },
  fortress_of_resistance: { min: 25, max: 35 },
  plains_of_dion: { min: 23, max: 35 },
  bee_hive: { min: 30, max: 40 },
  tanor_canyon: { min: 35, max: 45 },

  // —— Oren ——
  oren: { min: 35, max: 45 },
  ivory_tower: { min: 40, max: 50 },
  skyshadow_meadow: { min: 54, max: 54 },
  plains_of_the_lizardman: { min: 35, max: 45 },
  outlaw_forest: { min: 40, max: 50 },
  sea_of_spores: { min: 42, max: 52 },

  // —— Hunters Village ——
  hunters: { min: 40, max: 70 },
  enchanted_valley_south: { min: 45, max: 56 },
  enchanted_valley_north: { min: 45, max: 56 },
  forest_of_mirrors: { min: 40, max: 67 },

  // —— Aden ——
  aden: { min: 50, max: 60 },
  coliseum: { min: 40, max: 50 },
  forsaken_plains: { min: 50, max: 60 },
  blazing_swamp: { min: 55, max: 65 },
  fields_of_massacre: { min: 60, max: 70 },
  ancient_battleground: { min: 55, max: 65 },
  silent_valley: { min: 65, max: 75 },
  tower_of_insolence: { min: 70, max: 80 },

  // —— Dark Elven ——
  dark_elf_village: { min: 6, max: 7 },
  dark_elven_forest: { min: 10, max: 22 },
  swampland: { min: 13, max: 39 },
  spider_nest: { min: 16, max: 20 },
  school_of_dark_arts: { min: 10, max: 22 },

  // —— Dwarven ——
  dwarf_village: { min: 2, max: 36 },
  mithril_mines: { min: 19, max: 34 },
  abandoned_coal_mines: { min: 10, max: 19 },
  eastern_mining_zone: { min: 18, max: 25 },

  // —— Elven ——
  elf_village: { min: 4, max: 10 },
  elven_forest: { min: 8, max: 18 },
  neutral_zone: { min: 6, max: 16 },
  elven_fortress: { min: 10, max: 20 },

  // —— Talking Island ——
  talking_island: { min: 1, max: 5 },
  elven_ruins: { min: 9, max: 22 },
  talking_island_harbor: { min: 8, max: 11 },
  cedrics_training_hall: { min: 1, max: 1 },

  // —— Gludin ——
  gludin: { min: 1, max: 15 },
  langk_lizardman_dwelling: { min: 19, max: 30 },
  windmill_hill: { min: 15, max: 33 },
  fellmere_hunting_grounds: { min: 15, max: 24 },
  forgotten_temple: { min: 16, max: 33 },
  orc_barracks: { min: 18, max: 35 },
  windy_hill: { min: 18, max: 30 },
  abandoned_camp: { min: 17, max: 29 },
  wastelands: { min: 19, max: 25 },

  // —— Orc ——
  orc_village: { min: 1, max: 7 },
  immortal_plateau_southern: { min: 10, max: 39 },
  immortal_plateau: { min: 7, max: 17 },
  cave_of_trials: { min: 10, max: 39 },
  frozen_waterfall: { min: 13, max: 17 },

  // —— Heine ——
  heine: { min: 40, max: 50 },
  field_of_silence: { min: 40, max: 50 },
  field_of_whispers: { min: 45, max: 55 },
  alligator_island: { min: 40, max: 50 },
  garden_of_eva: { min: 45, max: 55 },

  // —— Rune ——
  rune: { min: 60, max: 70 },
  wild_beast_pastures: { min: 64, max: 68 },
  valley_of_saints: { min: 60, max: 70 },
  forest_of_the_dead: { min: 60, max: 70 },
  swamp_of_screams: { min: 65, max: 75 },
  monastery_of_silence: { min: 70, max: 80 },

  // —— Goddard ——
  goddard: { min: 70, max: 80 },
  varka_silenos_stronghold: { min: 77, max: 80 },
  ketra_orc_outpost: { min: 77, max: 80 },
  hot_springs: { min: 73, max: 76 },
  wall_of_argos: { min: 70, max: 75 },

  // —— Schuttgart ——
  schuttgart: { min: 70, max: 80 },
  den_of_evil: { min: 70, max: 80 },
  plunderous_plains: { min: 60, max: 70 },
  frozen_labyrinth: { min: 70, max: 80 },
  crypts_of_disgrace: { min: 75, max: 80 },
  pavel_ruins: { min: 70, max: 80 },

  // —— Інше ——
  ancient_tomb_fields: { min: 47, max: 55 },
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
