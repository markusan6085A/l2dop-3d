import type { DropEntry } from '../types/combatDrop.js';
import type { ItemMeta } from './itemsCatalog.js';

/** L2 Interlude item_id — каміння печаті Seven Signs. */
export const SEAL_STONE_GREEN_ITEM_ID = 6360;
export const SEAL_STONE_BLUE_ITEM_ID = 6361;
export const SEAL_STONE_RED_ITEM_ID = 6362;

const SEAL_STONE_ICON_BASE = '/icons/drops/resours';

export type SealStoneColorSlug = 'seal-green' | 'seal-blue' | 'seal-red';

export interface SealStoneItemDef {
  itemId: number;
  nameUk: string;
  nameEn: string;
  iconUrl: string;
  colorSlug: SealStoneColorSlug;
}

export const SEAL_STONE_ITEMS: readonly SealStoneItemDef[] = [
  {
    itemId: SEAL_STONE_GREEN_ITEM_ID,
    nameUk: 'Зелений камінь печаті [Green Seal Stone]',
    nameEn: 'Green Seal Stone',
    iconUrl: `${SEAL_STONE_ICON_BASE}/etc_wind_rune_i00.png`,
    colorSlug: 'seal-green',
  },
  {
    itemId: SEAL_STONE_BLUE_ITEM_ID,
    nameUk: 'Синій камінь печаті [Blue Seal Stone]',
    nameEn: 'Blue Seal Stone',
    iconUrl: `${SEAL_STONE_ICON_BASE}/etc_water_rune_i00.png`,
    colorSlug: 'seal-blue',
  },
  {
    itemId: SEAL_STONE_RED_ITEM_ID,
    nameUk: 'Червоний камінь печаті [Red Seal Stone]',
    nameEn: 'Red Seal Stone',
    iconUrl: `${SEAL_STONE_ICON_BASE}/etc_fire_rune_i00.png`,
    colorSlug: 'seal-red',
  },
];

const SEAL_STONE_BY_ID = new Map(SEAL_STONE_ITEMS.map((x) => [x.itemId, x]));

export interface SealStoneQtyRange {
  min: number;
  max: number;
}

export interface DungeonSealStoneDropSpec {
  green?: SealStoneQtyRange;
  blue?: SealStoneQtyRange;
  red?: SealStoneQtyRange;
}

/** Діапазони дропу каміння печаті з моба (усі типи мобів подземелля). */
export const DUNGEON_SEAL_STONE_DROPS: Readonly<
  Record<string, DungeonSealStoneDropSpec>
> = {
  necropolis_of_sacrifice: {
    blue: { min: 6, max: 11 },
    red: { min: 3, max: 6 },
  },
  pilgrims_necropolis: {
    green: { min: 12, max: 19 },
    blue: { min: 8, max: 13 },
    red: { min: 4, max: 7 },
  },
  necropolis_of_worship: {
    green: { min: 16, max: 28 },
    blue: { min: 9, max: 18 },
    red: { min: 7, max: 9 },
  },
  patriots_necropolis: {
    green: { min: 23, max: 30 },
    blue: { min: 11, max: 22 },
    red: { min: 9, max: 13 },
  },
  necropolis_of_devotion: {
    green: { min: 39, max: 42 },
    blue: { min: 16, max: 29 },
    red: { min: 11, max: 16 },
  },
  necropolis_of_martyrdom: {
    green: { min: 43, max: 51 },
    blue: { min: 21, max: 33 },
    red: { min: 13, max: 19 },
  },
  saints_necropolis: {
    green: { min: 50, max: 58 },
    blue: { min: 29, max: 38 },
    red: { min: 17, max: 23 },
  },
  disciples_necropolis: {
    green: { min: 60, max: 78 },
    blue: { min: 33, max: 43 },
    red: { min: 19, max: 29 },
  },
  catacomb_of_the_heretic: {
    green: { min: 8, max: 11 },
    blue: { min: 6, max: 11 },
    red: { min: 2, max: 6 },
  },
  catacomb_of_the_branded: {
    green: { min: 16, max: 22 },
    blue: { min: 7, max: 15 },
    red: { min: 4, max: 9 },
  },
  catacomb_of_the_apostate: {
    green: { min: 21, max: 33 },
    blue: { min: 9, max: 18 },
    red: { min: 9, max: 13 },
  },
  catacomb_of_the_witch: {
    green: { min: 34, max: 42 },
    blue: { min: 12, max: 23 },
    red: { min: 11, max: 18 },
  },
  catacomb_of_dark_omens: {
    green: { min: 49, max: 62 },
    blue: { min: 19, max: 29 },
    red: { min: 16, max: 21 },
  },
  catacomb_of_the_forbidden_path: {
    green: { min: 61, max: 78 },
    blue: { min: 32, max: 41 },
    red: { min: 24, max: 29 },
  },
};

const SEAL_STONE_DROP_KIND: Record<
  keyof DungeonSealStoneDropSpec,
  SealStoneItemDef
> = {
  green: SEAL_STONE_ITEMS[0]!,
  blue: SEAL_STONE_ITEMS[1]!,
  red: SEAL_STONE_ITEMS[2]!,
};

/** Шанс, що камінь печаті випаде з моба (окремо для кожного кольору). */
const SEAL_STONE_DROP_CHANCE: Record<
  keyof DungeonSealStoneDropSpec,
  number
> = {
  green: 0.93,
  blue: 0.82,
  red: 0.72,
};

function sealStoneDropEntry(
  npcId: number,
  kind: keyof DungeonSealStoneDropSpec,
  range: SealStoneQtyRange
): DropEntry {
  const item = SEAL_STONE_DROP_KIND[kind];
  return {
    id: `sdms${npcId}_seal_${kind}`,
    kind: 'resource',
    chance: SEAL_STONE_DROP_CHANCE[kind],
    min: range.min,
    max: range.max,
    l2ItemId: item.itemId,
    displayName: item.nameEn,
    iconUrl: item.iconUrl,
  };
}

export function sealStoneDropEntriesForDungeonMob(
  dungeonId: string,
  npcId: number
): DropEntry[] {
  const spec = DUNGEON_SEAL_STONE_DROPS[dungeonId];
  if (!spec) return [];
  const out: DropEntry[] = [];
  if (spec.green) out.push(sealStoneDropEntry(npcId, 'green', spec.green));
  if (spec.blue) out.push(sealStoneDropEntry(npcId, 'blue', spec.blue));
  if (spec.red) out.push(sealStoneDropEntry(npcId, 'red', spec.red));
  return out;
}

export function sealStoneItemMetaForCatalog(): Record<number, ItemMeta> {
  const out: Record<number, ItemMeta> = {};
  for (const item of SEAL_STONE_ITEMS) {
    out[item.itemId] = { nameUk: item.nameUk, slot: 'consumable' };
  }
  return out;
}

export function sealStoneIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const item of SEAL_STONE_ITEMS) {
    out[item.itemId] = item.iconUrl;
  }
  return out;
}

export function sealStoneNameColorSlugForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const item of SEAL_STONE_ITEMS) {
    out[item.itemId] = item.colorSlug;
  }
  return out;
}

export function sealStoneNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const item of SEAL_STONE_ITEMS) {
    out[item.itemId] = item.nameUk;
  }
  return out;
}

export function sealStoneNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const item of SEAL_STONE_ITEMS) {
    out[item.itemId] = item.nameEn;
  }
  return out;
}

export function sealStoneIconUrlForItemId(itemId: number): string | null {
  return SEAL_STONE_BY_ID.get(itemId)?.iconUrl ?? null;
}
