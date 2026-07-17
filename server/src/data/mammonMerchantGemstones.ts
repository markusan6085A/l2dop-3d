import type { ItemMeta } from './itemsCatalog.js';

/** L2 Interlude — Gemstone item ids. */
export const GEMSTONE_D_ITEM_ID = 2130;
export const GEMSTONE_C_ITEM_ID = 2131;
export const GEMSTONE_B_ITEM_ID = 2132;
export const GEMSTONE_A_ITEM_ID = 2133;
export const GEMSTONE_S_ITEM_ID = 2134;

const ICON_BASE = '/icons/drops/resours';

export type MammonGemstoneGrade = 'd' | 'c' | 'b' | 'a' | 's';

export interface MammonGemstoneOffer {
  grade: MammonGemstoneGrade;
  itemId: number;
  nameEn: string;
  nameUk: string;
  iconUrl: string;
  /** Ціна за 1 шт. у Ancient Adena. */
  aaPrice: number;
}

/** Каміння у Торговця Маммона (Interlude, aa). */
export const MAMMON_MERCHANT_GEMSTONES: readonly MammonGemstoneOffer[] = [
  {
    grade: 'd',
    itemId: GEMSTONE_D_ITEM_ID,
    nameEn: 'Gemstone D',
    nameUk: 'Gemstone D',
    iconUrl: `${ICON_BASE}/Gemstone_D.jpg`,
    aaPrice: 4200,
  },
  {
    grade: 'c',
    itemId: GEMSTONE_C_ITEM_ID,
    nameEn: 'Gemstone C',
    nameUk: 'Gemstone C',
    iconUrl: `${ICON_BASE}/Gemstone_C.jpg`,
    aaPrice: 6300,
  },
  {
    grade: 'b',
    itemId: GEMSTONE_B_ITEM_ID,
    nameEn: 'Gemstone B',
    nameUk: 'Gemstone B',
    iconUrl: `${ICON_BASE}/Gemstone_B.jpg`,
    aaPrice: 12600,
  },
  {
    grade: 'a',
    itemId: GEMSTONE_A_ITEM_ID,
    nameEn: 'Gemstone A',
    nameUk: 'Gemstone A',
    iconUrl: `${ICON_BASE}/Gemstone_A.jpg`,
    aaPrice: 21000,
  },
  {
    grade: 's',
    itemId: GEMSTONE_S_ITEM_ID,
    nameEn: 'Gemstone S',
    nameUk: 'Gemstone S',
    iconUrl: `${ICON_BASE}/Gemstone_S.jpg`,
    aaPrice: 42000,
  },
];

const BY_GRADE = new Map(
  MAMMON_MERCHANT_GEMSTONES.map((o) => [o.grade, o] as const)
);

export function resolveMammonGemstoneOffer(
  gradeRaw: unknown
): MammonGemstoneOffer | null {
  if (typeof gradeRaw !== 'string') return null;
  const g = gradeRaw.trim().toLowerCase();
  if (g !== 'd' && g !== 'c' && g !== 'b' && g !== 'a' && g !== 's') return null;
  return BY_GRADE.get(g) ?? null;
}

export function mammonGemstoneItemMetaForCatalog(): Record<number, ItemMeta> {
  const out: Record<number, ItemMeta> = {};
  for (const row of MAMMON_MERCHANT_GEMSTONES) {
    out[row.itemId] = { nameUk: row.nameUk, slot: 'consumable' };
  }
  return out;
}

export function mammonGemstoneIconHintsForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_GEMSTONES) {
    out[row.itemId] = row.iconUrl;
  }
  return out;
}

export function mammonGemstoneNamesEnForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_GEMSTONES) {
    out[row.itemId] = row.nameEn;
  }
  return out;
}

export function mammonGemstoneNamesUkForClient(): Record<number, string> {
  const out: Record<number, string> = {};
  for (const row of MAMMON_MERCHANT_GEMSTONES) {
    out[row.itemId] = row.nameUk;
  }
  return out;
}

export function mammonGemstoneInventoryTabHints(): Record<number, 'resource'> {
  const out: Record<number, 'resource'> = {};
  for (const row of MAMMON_MERCHANT_GEMSTONES) {
    out[row.itemId] = 'resource';
  }
  return out;
}
