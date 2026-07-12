import { MAP_TOWNS, type MapTownRef } from '../data/mapLocalities.js';

/**
 * Стартові селища / міста з телепорту — без PvP/PK.
 * Список узгоджений з teleport.html (безкоштовні пункти до 40 рівня).
 */
export const PVP_SAFE_TELEPORT_IDS: readonly string[] = [
  'talking_island',
  'elf_village',
  'dark_elf_village',
  'orc_village',
  'dwarf_village',
  'gludin',
  'gludio',
  'dion',
  'giran',
  'oren',
  'aden',
  'goddard',
  'rune',
  'schuttgart',
  'heine',
  'hunters',
] as const;

const SAFE_TOWN_REFS: MapTownRef[] = PVP_SAFE_TELEPORT_IDS.map((id) => {
  const t = MAP_TOWNS.find((row) => row.teleportId === id);
  if (!t) throw new Error('pvp_safe_town_missing:' + id);
  return t;
});

/** Радіус безпечної зони навколо центру міста (світові одиниці). */
export const PVP_SAFE_ZONE_RADIUS = 18_000;

const SAFE_R2 = PVP_SAFE_ZONE_RADIUS * PVP_SAFE_ZONE_RADIUS;

export function isInPvpSafeZone(worldX: number, worldY: number): boolean {
  for (const t of SAFE_TOWN_REFS) {
    const dx = worldX - t.worldX;
    const dy = worldY - t.worldY;
    if (dx * dx + dy * dy <= SAFE_R2) return true;
  }
  return false;
}

export function nearestPvpSafeTown(
  worldX: number,
  worldY: number
): MapTownRef | null {
  let best: MapTownRef | null = null;
  let bestD = Infinity;
  for (const t of SAFE_TOWN_REFS) {
    const dx = worldX - t.worldX;
    const dy = worldY - t.worldY;
    const d = dx * dx + dy * dy;
    if (d <= SAFE_R2 && d < bestD) {
      bestD = d;
      best = t;
    }
  }
  return best;
}
