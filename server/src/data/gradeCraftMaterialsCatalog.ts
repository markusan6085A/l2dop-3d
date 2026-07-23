/**
 * Gemstone / Crystal D–S — єдине джерело правди (крафт-матеріали за Adena).
 */

export interface GradeCraftMaterialEntry {
  itemId: number;
  code: string;
  kind: 'gemstone' | 'crystal';
  grade: 'D' | 'C' | 'B' | 'A' | 'S';
  nameUk: string;
  nameEn: string;
  iconUrl: string;
  priceAdena: bigint;
  stackable: true;
}

/** L2 Interlude Gemstone item ids. */
export const GEMSTONE_D_ITEM_ID = 2130;
export const GEMSTONE_C_ITEM_ID = 2131;
export const GEMSTONE_B_ITEM_ID = 2132;
export const GEMSTONE_A_ITEM_ID = 2133;
export const GEMSTONE_S_ITEM_ID = 2134;

/** L2 Interlude Crystal item ids. */
export const CRYSTAL_D_ITEM_ID = 1458;
export const CRYSTAL_C_ITEM_ID = 1459;
export const CRYSTAL_B_ITEM_ID = 1460;
export const CRYSTAL_A_ITEM_ID = 1461;
export const CRYSTAL_S_ITEM_ID = 1462;

const GEM_BASE = '/icons/resources/gemstones';
const CRYSTAL_BASE = '/icons/resources/crystals';

export const GRADE_CRAFT_MATERIAL_CATALOG: readonly GradeCraftMaterialEntry[] = [
  {
    itemId: GEMSTONE_D_ITEM_ID,
    code: 'gemstone_d',
    kind: 'gemstone',
    grade: 'D',
    nameUk: 'Самоцвіт: ранг D',
    nameEn: 'Gemstone D',
    iconUrl: `${GEM_BASE}/gemstone_d_grade.png`,
    priceAdena: 1000n,
    stackable: true,
  },
  {
    itemId: GEMSTONE_C_ITEM_ID,
    code: 'gemstone_c',
    kind: 'gemstone',
    grade: 'C',
    nameUk: 'Самоцвіт: ранг C',
    nameEn: 'Gemstone C',
    iconUrl: `${GEM_BASE}/gemstone_c_grade.png`,
    priceAdena: 3000n,
    stackable: true,
  },
  {
    itemId: GEMSTONE_B_ITEM_ID,
    code: 'gemstone_b',
    kind: 'gemstone',
    grade: 'B',
    nameUk: 'Самоцвіт: ранг B',
    nameEn: 'Gemstone B',
    iconUrl: `${GEM_BASE}/gemstone_b_grade.png`,
    priceAdena: 10000n,
    stackable: true,
  },
  {
    itemId: GEMSTONE_A_ITEM_ID,
    code: 'gemstone_a',
    kind: 'gemstone',
    grade: 'A',
    nameUk: 'Самоцвіт: ранг A',
    nameEn: 'Gemstone A',
    iconUrl: `${GEM_BASE}/gemstone_a_grade.png`,
    priceAdena: 30000n,
    stackable: true,
  },
  {
    itemId: GEMSTONE_S_ITEM_ID,
    code: 'gemstone_s',
    kind: 'gemstone',
    grade: 'S',
    nameUk: 'Самоцвіт: ранг S',
    nameEn: 'Gemstone S',
    iconUrl: `${GEM_BASE}/gemstone_s_grade.png`,
    priceAdena: 100000n,
    stackable: true,
  },
  {
    itemId: CRYSTAL_D_ITEM_ID,
    code: 'crystal_d',
    kind: 'crystal',
    grade: 'D',
    nameUk: 'Кристал: ранг D',
    nameEn: 'Crystal: D-Grade',
    iconUrl: `${CRYSTAL_BASE}/crystal_d_grade.jpg`,
    priceAdena: 650n,
    stackable: true,
  },
  {
    itemId: CRYSTAL_C_ITEM_ID,
    code: 'crystal_c',
    kind: 'crystal',
    grade: 'C',
    nameUk: 'Кристал: ранг C',
    nameEn: 'Crystal: C-Grade',
    iconUrl: `${CRYSTAL_BASE}/crystal_c_grade.png`,
    priceAdena: 3000n,
    stackable: true,
  },
  {
    itemId: CRYSTAL_B_ITEM_ID,
    code: 'crystal_b',
    kind: 'crystal',
    grade: 'B',
    nameUk: 'Кристал: ранг B',
    nameEn: 'Crystal: B-Grade',
    iconUrl: `${CRYSTAL_BASE}/crystal_b_grade.png`,
    priceAdena: 9000n,
    stackable: true,
  },
  {
    itemId: CRYSTAL_A_ITEM_ID,
    code: 'crystal_a',
    kind: 'crystal',
    grade: 'A',
    nameUk: 'Кристал: ранг A',
    nameEn: 'Crystal: A-Grade',
    iconUrl: `${CRYSTAL_BASE}/crystal_a_grade.png`,
    priceAdena: 15000n,
    stackable: true,
  },
  {
    itemId: CRYSTAL_S_ITEM_ID,
    code: 'crystal_s',
    kind: 'crystal',
    grade: 'S',
    nameUk: 'Кристал: ранг S',
    nameEn: 'Crystal: S-Grade',
    iconUrl: `${CRYSTAL_BASE}/crystal_s_grade.png`,
    priceAdena: 25000n,
    stackable: true,
  },
] as const;

export const GRADE_CRAFT_MATERIAL_BY_ITEM_ID = new Map<number, GradeCraftMaterialEntry>(
  GRADE_CRAFT_MATERIAL_CATALOG.map((row) => [row.itemId, row]),
);

export const GRADE_CRAFT_MATERIAL_BY_CODE = new Map<string, GradeCraftMaterialEntry>(
  GRADE_CRAFT_MATERIAL_CATALOG.map((row) => [row.code, row]),
);

export function gradeCraftMaterialShopKey(code: string): string {
  return `consumable/resource_${code}`;
}

export function isGradeCraftMaterialItemId(itemId: number): boolean {
  return GRADE_CRAFT_MATERIAL_BY_ITEM_ID.has(Math.floor(Number(itemId) || 0));
}
