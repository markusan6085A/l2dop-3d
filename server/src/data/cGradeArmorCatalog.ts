/**
 * Канонічний каталог C-grade броні та щитів (Lineage 2 Interlude).
 * Єдине джерело itemId → { name, grade, armorType, slot, pDef, shieldDefense, shieldBlockRatePct }.
 * Ціни не змінюються — лишаються в GM / dropsShopOverrides.
 */
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export type CGradeArmorCatalogRow = {
  itemId: number;
  name: string;
  grade: 'C';
  armorType: ArmorTypeKind;
  slot: ItemSlotKind;
  pDef?: number;
  shieldDefense?: number;
  shieldBlockRatePct?: number;
};

/** Канонічні C-grade частини броні та щити. */
export const C_GRADE_ARMOR_CATALOG: readonly CGradeArmorCatalogRow[] = [
  // Karmian
  { itemId: 439, name: 'Karmian Tunic', grade: 'C', armorType: 'magic', slot: 'chest', pDef: 60 },
  { itemId: 471, name: 'Karmian Stockings', grade: 'C', armorType: 'magic', slot: 'legs', pDef: 37 },
  { itemId: 2454, name: 'Karmian Gloves', grade: 'C', armorType: 'magic', slot: 'gloves', pDef: 32 },
  { itemId: 2430, name: 'Karmian Boots', grade: 'C', armorType: 'magic', slot: 'feet', pDef: 32 },
  { itemId: 20002, name: 'Karmian Helmet', grade: 'C', armorType: 'magic', slot: 'head', pDef: 33 },
  // Demon's
  { itemId: 441, name: "Demon's Tunic", grade: 'C', armorType: 'magic', slot: 'chest', pDef: 69 },
  { itemId: 472, name: "Demon's Stockings", grade: 'C', armorType: 'magic', slot: 'legs', pDef: 43 },
  { itemId: 2459, name: "Demon's Gloves", grade: 'C', armorType: 'magic', slot: 'gloves', pDef: 36 },
  { itemId: 2435, name: "Demon's Boots", grade: 'C', armorType: 'magic', slot: 'feet', pDef: 36 },
  { itemId: 20001, name: "Demon's Helmet", grade: 'C', armorType: 'magic', slot: 'head', pDef: 33 },
  // Plated Leather
  { itemId: 398, name: 'Plated Leather', grade: 'C', armorType: 'light', slot: 'chest', pDef: 94 },
  { itemId: 418, name: 'Plated Leather Gaiters', grade: 'C', armorType: 'light', slot: 'legs', pDef: 59 },
  { itemId: 2431, name: 'Plated Leather Boots', grade: 'C', armorType: 'light', slot: 'feet', pDef: 32 },
  { itemId: 2455, name: 'Plated Leather Gloves', grade: 'C', armorType: 'light', slot: 'gloves', pDef: 33 },
  { itemId: 20003, name: 'Plated Leather Helmet', grade: 'C', armorType: 'light', slot: 'head', pDef: 52 },
  // C-grade shields — shieldDefense єдине бойове значення (без окремого pDef у бою)
  {
    itemId: 107,
    name: 'Composite Shield',
    grade: 'C',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 190,
    shieldBlockRatePct: 20,
  },
  {
    itemId: 2497,
    name: 'Full Plate Shield',
    grade: 'C',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 203,
    shieldBlockRatePct: 20,
  },
] as const;

export const C_GRADE_ARMOR_BY_ID: ReadonlyMap<number, CGradeArmorCatalogRow> = new Map(
  C_GRADE_ARMOR_CATALOG.map((r) => [r.itemId, r])
);

export function cGradeArmorCatalogRow(itemId: number): CGradeArmorCatalogRow | undefined {
  return C_GRADE_ARMOR_BY_ID.get(Math.floor(itemId));
}
