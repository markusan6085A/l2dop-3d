/**
 * Канонічний каталог S-grade броні та щитів (Lineage 2 Interlude).
 */
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export type SGradeArmorCatalogRow = {
  itemId: number;
  name: string;
  grade: 'S';
  armorType: ArmorTypeKind;
  slot: ItemSlotKind;
  pDef?: number;
  shieldDefense?: number;
  shieldBlockRatePct?: number;
};

/** Канонічні S-grade частини броні та щити (фактичні itemId проєкту). */
export const S_GRADE_ARMOR_CATALOG: readonly SGradeArmorCatalogRow[] = [
  // Imperial Crusader Heavy
  {
    itemId: 6373,
    name: 'Imperial Crusader Breastplate',
    grade: 'S',
    armorType: 'heavy',
    slot: 'chest',
    pDef: 205,
  },
  {
    itemId: 6374,
    name: 'Imperial Crusader Gaiters',
    grade: 'S',
    armorType: 'heavy',
    slot: 'legs',
    pDef: 128,
  },
  {
    itemId: 6378,
    name: 'Imperial Crusader Helmet',
    grade: 'S',
    armorType: 'heavy',
    slot: 'head',
    pDef: 83,
  },
  {
    itemId: 6375,
    name: 'Imperial Crusader Gauntlets',
    grade: 'S',
    armorType: 'heavy',
    slot: 'gloves',
    pDef: 55,
  },
  {
    itemId: 6376,
    name: 'Imperial Crusader Boots',
    grade: 'S',
    armorType: 'heavy',
    slot: 'feet',
    pDef: 55,
  },
  {
    itemId: 6377,
    name: 'Imperial Crusader Shield',
    grade: 'S',
    armorType: 'heavy',
    slot: 'lhand',
    shieldDefense: 290,
    shieldBlockRatePct: 20,
  },
  // Draconic Leather Light
  {
    itemId: 6379,
    name: 'Draconic Leather Armor',
    grade: 'S',
    armorType: 'light',
    slot: 'fullarmor',
    pDef: 249,
  },
  {
    itemId: 6382,
    name: 'Draconic Leather Helmet',
    grade: 'S',
    armorType: 'light',
    slot: 'head',
    pDef: 83,
  },
  {
    itemId: 6380,
    name: 'Draconic Leather Gloves',
    grade: 'S',
    armorType: 'light',
    slot: 'gloves',
    pDef: 55,
  },
  {
    itemId: 6381,
    name: 'Draconic Leather Boots',
    grade: 'S',
    armorType: 'light',
    slot: 'feet',
    pDef: 55,
  },
  // Major Arcana Robe
  {
    itemId: 6383,
    name: 'Major Arcana Robe',
    grade: 'S',
    armorType: 'magic',
    slot: 'fullarmor',
    pDef: 166,
  },
  {
    itemId: 6386,
    name: 'Major Arcana Circlet',
    grade: 'S',
    armorType: 'magic',
    slot: 'head',
    pDef: 83,
  },
  {
    itemId: 6384,
    name: 'Major Arcana Gloves',
    grade: 'S',
    armorType: 'magic',
    slot: 'gloves',
    pDef: 55,
  },
  {
    itemId: 6385,
    name: 'Major Arcana Boots',
    grade: 'S',
    armorType: 'magic',
    slot: 'feet',
    pDef: 55,
  },
] as const;

export const S_GRADE_ARMOR_BY_ID: ReadonlyMap<number, SGradeArmorCatalogRow> = new Map(
  S_GRADE_ARMOR_CATALOG.map((r) => [r.itemId, r])
);

export function sGradeArmorCatalogRow(itemId: number): SGradeArmorCatalogRow | undefined {
  return S_GRADE_ARMOR_BY_ID.get(Math.floor(itemId));
}
