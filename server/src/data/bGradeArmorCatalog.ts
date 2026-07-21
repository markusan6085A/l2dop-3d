/**
 * Канонічний каталог B-grade броні та щитів (Lineage 2 Interlude).
 * Єдине джерело itemId → { name, grade, armorType, slot, pDef, shieldDefense, shieldBlockRatePct }.
 * Ціни Coin of Luck не змінюються — лишаються в dropsShopCoinOfLuckPricing / overrides.
 */
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export type BGradeArmorCatalogRow = {
  itemId: number;
  name: string;
  grade: 'B';
  armorType: ArmorTypeKind;
  slot: ItemSlotKind;
  pDef?: number;
  shieldDefense?: number;
  shieldBlockRatePct?: number;
};

/** Канонічні B-grade частини броні та щити. */
export const B_GRADE_ARMOR_CATALOG: readonly BGradeArmorCatalogRow[] = [
  // Avadon Robe Set
  { itemId: 30002, name: 'Avadon Robe', grade: 'B', armorType: 'magic', slot: 'fullarmor', pDef: 127 },
  { itemId: 30001, name: 'Avadon Circlet', grade: 'B', armorType: 'magic', slot: 'head', pDef: 62 },
  { itemId: 30003, name: 'Avadon Gloves', grade: 'B', armorType: 'magic', slot: 'gloves', pDef: 41 },
  { itemId: 30004, name: 'Avadon Boots', grade: 'B', armorType: 'magic', slot: 'feet', pDef: 41 },
  // Blue Wolf Heavy Set
  { itemId: 358, name: 'Blue Wolf Breastplate', grade: 'B', armorType: 'heavy', slot: 'chest', pDef: 166 },
  { itemId: 2380, name: 'Blue Wolf Gaiters', grade: 'B', armorType: 'heavy', slot: 'legs', pDef: 104 },
  { itemId: 2416, name: 'Blue Wolf Helmet', grade: 'B', armorType: 'heavy', slot: 'head', pDef: 66 },
  { itemId: 2487, name: 'Blue Wolf Gloves', grade: 'B', armorType: 'heavy', slot: 'gloves', pDef: 44 },
  { itemId: 2439, name: 'Blue Wolf Boots', grade: 'B', armorType: 'heavy', slot: 'feet', pDef: 44 },
  // Doom Light Set
  { itemId: 30009, name: 'Leather Armor of Doom', grade: 'B', armorType: 'light', slot: 'fullarmor', pDef: 202 },
  { itemId: 30008, name: 'Doom Helmet', grade: 'B', armorType: 'light', slot: 'head', pDef: 66 },
  { itemId: 30010, name: 'Doom Gloves', grade: 'B', armorType: 'light', slot: 'gloves', pDef: 44 },
  { itemId: 30011, name: 'Doom Boots', grade: 'B', armorType: 'light', slot: 'feet', pDef: 44 },
  // B-grade shields — shieldDefense єдине бойове значення (без окремого pDef у бою)
  {
    itemId: 673,
    name: 'Avadon Shield',
    grade: 'B',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 216,
    shieldBlockRatePct: 20,
  },
  {
    itemId: 110,
    name: 'Doom Shield',
    grade: 'B',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 230,
    shieldBlockRatePct: 20,
  },
  {
    itemId: 111,
    name: 'Shield of Pledge',
    grade: 'B',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 216,
    shieldBlockRatePct: 20,
  },
] as const;

export const B_GRADE_ARMOR_BY_ID: ReadonlyMap<number, BGradeArmorCatalogRow> = new Map(
  B_GRADE_ARMOR_CATALOG.map((r) => [r.itemId, r])
);

export function bGradeArmorCatalogRow(itemId: number): BGradeArmorCatalogRow | undefined {
  return B_GRADE_ARMOR_BY_ID.get(Math.floor(itemId));
}
