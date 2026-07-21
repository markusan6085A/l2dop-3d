/**
 * Канонічний каталог A-grade броні та щитів (Lineage 2 Interlude).
 * Єдине джерело itemId → { name, grade, armorType, slot, pDef, shieldDefense, shieldBlockRatePct }.
 */
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export type AGradeArmorCatalogRow = {
  itemId: number;
  name: string;
  grade: 'A';
  armorType: ArmorTypeKind;
  slot: ItemSlotKind;
  pDef?: number;
  shieldDefense?: number;
  shieldBlockRatePct?: number;
};

/** Канонічні A-grade частини броні та щити (фактичні itemId проєкту). */
export const A_GRADE_ARMOR_CATALOG: readonly AGradeArmorCatalogRow[] = [
  // Apella Light
  { itemId: 7864, name: 'Apella Brigandine', grade: 'A', armorType: 'light', slot: 'fullarmor', pDef: 209 },
  { itemId: 7860, name: 'Apella Helm', grade: 'A', armorType: 'light', slot: 'head', pDef: 69 },
  { itemId: 7865, name: 'Apella Leather Gloves', grade: 'A', armorType: 'light', slot: 'gloves', pDef: 46 },
  { itemId: 7866, name: 'Apella Boots', grade: 'A', armorType: 'light', slot: 'feet', pDef: 46 },
  // Dark Crystal Heavy
  { itemId: 365, name: 'Dark Crystal Breastplate', grade: 'A', armorType: 'heavy', slot: 'chest', pDef: 171 },
  { itemId: 388, name: 'Dark Crystal Gaiters', grade: 'A', armorType: 'heavy', slot: 'legs', pDef: 107 },
  { itemId: 512, name: 'Dark Crystal Helmet', grade: 'A', armorType: 'heavy', slot: 'head', pDef: 69 },
  {
    itemId: 2472,
    name: 'Dark Crystal Gloves [Heavy Armor]',
    grade: 'A',
    armorType: 'heavy',
    slot: 'gloves',
    pDef: 46,
  },
  {
    itemId: 563,
    name: 'Dark Crystal Boots [Heavy Armor]',
    grade: 'A',
    armorType: 'heavy',
    slot: 'feet',
    pDef: 46,
  },
  // Majestic Robe
  { itemId: 2409, name: 'Majestic Robe', grade: 'A', armorType: 'magic', slot: 'fullarmor', pDef: 147 },
  { itemId: 2419, name: 'Majestic Circlet', grade: 'A', armorType: 'magic', slot: 'head', pDef: 73 },
  {
    itemId: 2482,
    name: 'Majestic Gauntlets [Robe]',
    grade: 'A',
    armorType: 'magic',
    slot: 'gloves',
    pDef: 49,
  },
  {
    itemId: 583,
    name: 'Majestic Boots [Robe]',
    grade: 'A',
    armorType: 'magic',
    slot: 'feet',
    pDef: 49,
  },
  // A-grade shields
  {
    itemId: 641,
    name: 'Dark Crystal Shield',
    grade: 'A',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 243,
    shieldBlockRatePct: 20,
  },
  {
    itemId: 2498,
    name: 'Shield of Nightmare',
    grade: 'A',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 256,
    shieldBlockRatePct: 20,
  },
] as const;

export const A_GRADE_ARMOR_BY_ID: ReadonlyMap<number, AGradeArmorCatalogRow> = new Map(
  A_GRADE_ARMOR_CATALOG.map((r) => [r.itemId, r])
);

export function aGradeArmorCatalogRow(itemId: number): AGradeArmorCatalogRow | undefined {
  return A_GRADE_ARMOR_BY_ID.get(Math.floor(itemId));
}
