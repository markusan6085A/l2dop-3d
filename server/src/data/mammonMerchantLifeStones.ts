import type { ItemMeta } from './itemsCatalog.js';

const ICON_BASE = '/icons/drops/resours';

export type MammonLifeStoneGrade = 'general' | 'rare' | 'special' | 'unique';

export interface MammonLifeStoneOffer {
  grade: MammonLifeStoneGrade;
  itemId: number;
  nameEn: string;
  nameUk: string;
  iconUrl: string;
  aaPrice: number;
}

/** Life Stones у Торговця Маммона. */
export const MAMMON_MERCHANT_LIFE_STONES: readonly MammonLifeStoneOffer[] = [
  {
    grade: 'general',
    itemId: 10409,
    nameEn: 'General Life Stone',
    nameUk: 'General Life Stone',
    iconUrl: `${ICON_BASE}/Etc_mineral_general_i03_0.jpg`,
    aaPrice: 129_600,
  },
  {
    grade: 'rare',
    itemId: 10410,
    nameEn: 'Rare Life Stone',
    nameUk: 'Rare Life Stone',
    iconUrl: `${ICON_BASE}/Etc_mineral_rare_i03_0.jpg`,
    aaPrice: 259_200,
  },
  {
    grade: 'special',
    itemId: 10411,
    nameEn: 'Special Life Stone',
    nameUk: 'Special Life Stone',
    iconUrl: `${ICON_BASE}/Etc_mineral_special_i03_0.jpg`,
    aaPrice: 518_400,
  },
  {
    grade: 'unique',
    itemId: 10412,
    nameEn: 'Unique Life Stone',
    nameUk: 'Unique Life Stone',
    iconUrl: `${ICON_BASE}/Etc_mineral_unique_i03_0.jpg`,
    aaPrice: 1_036_800,
  },
];

const BY_GRADE = new Map(
  MAMMON_MERCHANT_LIFE_STONES.map((o) => [o.grade, o] as const)
);

export function resolveMammonLifeStoneOffer(
  gradeRaw: unknown
): MammonLifeStoneOffer | null {
  if (typeof gradeRaw !== 'string') return null;
  const g = gradeRaw.trim().toLowerCase();
  if (g !== 'general' && g !== 'rare' && g !== 'special' && g !== 'unique') {
    return null;
  }
  return BY_GRADE.get(g) ?? null;
}

export function mammonLifeStoneItemMetaForCatalog(): Record<number, ItemMeta> {
  const out: Record<number, ItemMeta> = {};
  for (const row of MAMMON_MERCHANT_LIFE_STONES) {
    out[row.itemId] = { nameUk: row.nameUk, slot: 'consumable' };
  }
  return out;
}

export function mammonLifeStoneIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_LIFE_STONES) {
    out[row.itemId] = row.iconUrl;
  }
  return out;
}

export function mammonLifeStoneNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_LIFE_STONES) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}

export function mammonLifeStoneNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_LIFE_STONES) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function mammonLifeStoneInventoryTabHints(): Record<number, 'resource'> {
  const out: Record<number, 'resource'> = {};
  for (const row of MAMMON_MERCHANT_LIFE_STONES) {
    out[row.itemId] = 'resource';
  }
  return out;
}
