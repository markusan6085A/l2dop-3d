import { resolveMapLocality } from '../data/mapLocalities.js';
import { findSevenSignsDungeonById } from '../data/sevenSignsDungeons.js';
import { parseDungeonStateJson } from './dungeonState.js';
import { isInPvpSafeZone } from './pvpSafeZones.js';

/** Canonical instance bucket for map presence / PvP rules. */
export type MapInstanceType =
  | 'world'
  | 'seven_signs_dungeon'
  | 'shared_dungeon';

export type MapEncounterType =
  | 'none'
  | 'world_open'
  | 'catacomb'
  | 'necropolis'
  | 'party_dungeon';

export type CanonicalMapLocation = {
  /** Stable same-location key (`world:<teleportId>` or `dungeon:<id>`). */
  key: string;
  instanceType: MapInstanceType;
  encounterType: MapEncounterType;
  /** World PvP allowed in this playfield (safe towns / dungeons → false). */
  pvpAllowed: boolean;
  teleportId?: string;
  dungeonId?: string;
};

export type MapPlayfieldInput = {
  worldX: number;
  worldY: number;
  dungeonStateJson?: unknown | null;
};

export function resolveCanonicalMapLocation(
  input: MapPlayfieldInput
): CanonicalMapLocation {
  const dungeon = parseDungeonStateJson(input.dungeonStateJson);
  if (dungeon) {
    const def = findSevenSignsDungeonById(dungeon.dungeonId);
    const kind = def?.kind;
    const encounterType: MapEncounterType =
      kind === 'catacomb'
        ? 'catacomb'
        : kind === 'necropolis'
          ? 'necropolis'
          : 'party_dungeon';
    return {
      key: `dungeon:${dungeon.dungeonId}`,
      instanceType: 'seven_signs_dungeon',
      encounterType,
      pvpAllowed: false,
      dungeonId: dungeon.dungeonId,
    };
  }

  const loc = resolveMapLocality(input.worldX, input.worldY);
  return {
    key: `world:${loc.teleportId}`,
    instanceType: 'world',
    encounterType: 'world_open',
    pvpAllowed: !isInPvpSafeZone(input.worldX, input.worldY),
    teleportId: loc.teleportId,
  };
}

export function isSameCanonicalMapLocation(
  a: CanonicalMapLocation,
  b: CanonicalMapLocation
): boolean {
  return a.key === b.key;
}

/** World-map hero list — лише відкритий світ (не instanced dungeon playfield). */
export function isWorldMapOpenPlayfield(loc: CanonicalMapLocation): boolean {
  return loc.instanceType === 'world';
}

/** Canonical location для instanced dungeon (catacomb / necropolis). */
export function resolveDungeonCanonicalLocation(
  dungeonId: string
): CanonicalMapLocation {
  const id = String(dungeonId || '').trim();
  const def = findSevenSignsDungeonById(id);
  const kind = def?.kind;
  const encounterType: MapEncounterType =
    kind === 'catacomb'
      ? 'catacomb'
      : kind === 'necropolis'
        ? 'necropolis'
        : 'party_dungeon';
  return {
    key: `dungeon:${id}`,
    instanceType: 'seven_signs_dungeon',
    encounterType,
    pvpAllowed: false,
    dungeonId: id,
  };
}
