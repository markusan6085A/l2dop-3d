import { parseDungeonStateJson } from './dungeonState.js';
import {
  isCityHubCanonicalLocation,
  isWorldMapOpenPlayfield,
  resolveCanonicalMapLocation,
  type MapPlayfieldInput,
} from './mapPlayfieldContext.js';
import { isInPvpSafeZone } from './pvpSafeZones.js';

/** Чи гравець на відкритому полі світу (не місто/селище, не dungeon). */
export function isCharacterVisibleOnWorldMap(input: MapPlayfieldInput): boolean {
  if (parseDungeonStateJson(input.dungeonStateJson) != null) return false;
  const loc = resolveCanonicalMapLocation(input);
  if (!isWorldMapOpenPlayfield(loc)) return false;
  if (isInPvpSafeZone(input.worldX, input.worldY)) return false;
  if (isCityHubCanonicalLocation(loc)) return false;
  return true;
}
