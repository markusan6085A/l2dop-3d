/**
 * Канонічний каталог D-grade броні та щитів (Lineage 2 Interlude).
 * Єдине джерело itemId → { name, grade, armorType, slot, pDef, shieldDefense, shieldBlockRatePct }.
 * Ціни не змінюються — лишаються в GM / dropsShopOverrides.
 */
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export type DGradeArmorCatalogRow = {
  itemId: number;
  name: string;
  grade: 'D';
  armorType: ArmorTypeKind;
  slot: ItemSlotKind;
  pDef?: number;
  shieldDefense?: number;
  shieldBlockRatePct?: number;
};

/** Канонічні D-grade частини броні та щити. */
export const D_GRADE_ARMOR_CATALOG: readonly DGradeArmorCatalogRow[] = [
  // Knowledge
  { itemId: 436, name: 'Tunic of Knowledge', grade: 'D', armorType: 'magic', slot: 'chest', pDef: 49 },
  { itemId: 469, name: 'Stockings of Knowledge', grade: 'D', armorType: 'magic', slot: 'legs', pDef: 30 },
  { itemId: 2447, name: 'Gloves of Knowledge', grade: 'D', armorType: 'magic', slot: 'gloves', pDef: 24 },
  { itemId: 41, name: 'Knowledge Helmet', grade: 'D', armorType: 'magic', slot: 'head', pDef: 22 },
  { itemId: 2423, name: 'Boots of Knowledge', grade: 'D', armorType: 'magic', slot: 'feet', pDef: 20 },
  // Reinforced Leather
  { itemId: 394, name: 'Reinforced Leather Shirt', grade: 'D', armorType: 'light', slot: 'chest', pDef: 73 },
  { itemId: 416, name: 'Reinforced Leather Gaiters', grade: 'D', armorType: 'light', slot: 'legs', pDef: 46 },
  { itemId: 2422, name: 'Reinforced Leather Boots', grade: 'D', armorType: 'light', slot: 'feet', pDef: 24 },
  { itemId: 44, name: 'Reinforced Helmet', grade: 'D', armorType: 'light', slot: 'head', pDef: 35 },
  { itemId: 720, name: 'Reinforced Gloves', grade: 'D', armorType: 'light', slot: 'gloves', pDef: 22 },
  // Mithril Heavy
  { itemId: 58, name: 'Mithril Breastplate', grade: 'D', armorType: 'heavy', slot: 'chest', pDef: 95 },
  { itemId: 59, name: 'Mithril Gaiters', grade: 'D', armorType: 'heavy', slot: 'legs', pDef: 61 },
  { itemId: 499, name: 'Mithril Helmet', grade: 'D', armorType: 'heavy', slot: 'head', pDef: 37 },
  { itemId: 61, name: 'Mithril Gloves', grade: 'D', armorType: 'heavy', slot: 'gloves', pDef: 25 },
  { itemId: 62, name: 'Mithril Boots', grade: 'D', armorType: 'heavy', slot: 'feet', pDef: 25 },
  // D-grade shields — shieldDefense єдине бойове значення (без окремого pDef у бою)
  { itemId: 626, name: 'Bronze Shield', grade: 'D', armorType: 'heavy', slot: 'lhand', shieldDefense: 101, shieldBlockRatePct: 20 },
  { itemId: 628, name: 'Hoplon', grade: 'D', armorType: 'heavy', slot: 'lhand', shieldDefense: 128, shieldBlockRatePct: 20 },
  { itemId: 2494, name: 'Plate Shield', grade: 'D', armorType: 'heavy', slot: 'lhand', shieldDefense: 154, shieldBlockRatePct: 20 },
] as const;

export const D_GRADE_ARMOR_BY_ID: ReadonlyMap<number, DGradeArmorCatalogRow> = new Map(
  D_GRADE_ARMOR_CATALOG.map((r) => [r.itemId, r])
);

export function dGradeArmorCatalogRow(itemId: number): DGradeArmorCatalogRow | undefined {
  return D_GRADE_ARMOR_BY_ID.get(Math.floor(itemId));
}
