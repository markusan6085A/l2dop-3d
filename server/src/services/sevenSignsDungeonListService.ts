import {
  SEVEN_SIGNS_DUNGEONS,
  type SevenSignsDungeonKind,
} from '../data/sevenSignsDungeons.js';

export const SEVEN_SIGNS_DUNGEON_TELEPORT_ADENA_COST = 1;

export interface SevenSignsDungeonListEntry {
  dungeonId: string;
  kind: SevenSignsDungeonKind;
  labelEn: string;
  labelUk: string;
  adenaCost: number;
}

export function listSevenSignsDungeonsForMenu(): {
  dungeons: SevenSignsDungeonListEntry[];
} {
  return {
    dungeons: SEVEN_SIGNS_DUNGEONS.map((d) => ({
      dungeonId: d.id,
      kind: d.kind,
      labelEn: d.labelEn,
      labelUk: d.labelUk,
      adenaCost: SEVEN_SIGNS_DUNGEON_TELEPORT_ADENA_COST,
    })),
  };
}
