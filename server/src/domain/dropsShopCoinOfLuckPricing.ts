import type { DropsShopCategory, DropsShopGradeUk } from '../data/dropsShopCatalog.generated.js';
import type { ItemMeta } from '../data/itemsCatalog.js';
import {
  resolveDropsShopArmorPiece,
  resolveDropsShopJewelrySubtype,
  resolveDropsShopJewelrySubtypeFromShopKey,
} from './dropsShopGearSubtypes.js';
import type { GmShopPurchaseOffer } from './dropsShopGmItemIdByShopKey.js';

/** Ключ ціни B/A/S екіпіровки в Coin of Luck (canonical). */
export type ColEquipmentSlotKind =
  | 'weapon'
  | 'chest'
  | 'legs'
  | 'helmet'
  | 'gloves'
  | 'boots'
  | 'shield'
  | 'necklace'
  | 'earring'
  | 'ring';

export type DropsShopCatalogLike = {
  shopKey: string;
  category: DropsShopCategory;
  grade: DropsShopGradeUk;
};

const BAS_GRADES = new Set<DropsShopGradeUk>(['B', 'A', 'S']);

export const COL_EQUIPMENT_PRICE_B: Readonly<Record<ColEquipmentSlotKind, number>> = {
  weapon: 60,
  chest: 30,
  legs: 22,
  helmet: 15,
  gloves: 12,
  boots: 12,
  shield: 20,
  necklace: 15,
  earring: 10,
  ring: 8,
};

export const COL_EQUIPMENT_PRICE_A: Readonly<Record<ColEquipmentSlotKind, number>> = {
  weapon: 110,
  chest: 55,
  legs: 40,
  helmet: 27,
  gloves: 22,
  boots: 22,
  shield: 35,
  necklace: 27,
  earring: 18,
  ring: 15,
};

export const COL_EQUIPMENT_PRICE_S: Readonly<Record<ColEquipmentSlotKind, number>> = {
  weapon: 200,
  chest: 100,
  legs: 75,
  helmet: 50,
  gloves: 40,
  boots: 40,
  shield: 65,
  necklace: 50,
  earring: 35,
  ring: 28,
};

export function colPriceTableForGrade(
  grade: DropsShopGradeUk
): Readonly<Record<ColEquipmentSlotKind, number>> | null {
  if (grade === 'B') return COL_EQUIPMENT_PRICE_B;
  if (grade === 'A') return COL_EQUIPMENT_PRICE_A;
  if (grade === 'S') return COL_EQUIPMENT_PRICE_S;
  return null;
}

export function colPriceForBasEquipment(
  grade: DropsShopGradeUk,
  slotKind: ColEquipmentSlotKind
): number | null {
  const table = colPriceTableForGrade(grade);
  if (!table) return null;
  const price = table[slotKind];
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function resolveColEquipmentSlotKind(
  category: DropsShopCategory,
  itemMeta: ItemMeta | undefined,
  shopKey: string
): ColEquipmentSlotKind | null {
  if (category === 'weapon') return 'weapon';
  if (category === 'shield') return 'shield';
  if (category === 'armor') {
    const piece = resolveDropsShopArmorPiece(itemMeta?.slot);
    if (piece === 'head') return 'helmet';
    if (piece === 'torso') return 'chest';
    if (piece === 'legs') return 'legs';
    if (piece === 'gloves') return 'gloves';
    if (piece === 'feet') return 'boots';
    return null;
  }
  if (category === 'earring') {
    const fromKey = resolveDropsShopJewelrySubtypeFromShopKey(shopKey);
    const fromSlot = resolveDropsShopJewelrySubtype(itemMeta?.slot);
    const jp = fromKey ?? fromSlot;
    if (jp === 'neck') return 'necklace';
    if (jp === 'earring') return 'earring';
    if (jp === 'ring') return 'ring';
    return null;
  }
  return null;
}

export function isBasShopEquipmentRow(row: DropsShopCatalogLike): boolean {
  return BAS_GRADES.has(row.grade) && row.category !== 'consumable';
}

/** B/A/S екіпіровка — лише Coin of Luck; D/C/consumables без змін. */
export function applyBasEquipmentCoinOfLuckPrice(
  row: DropsShopCatalogLike,
  offer: GmShopPurchaseOffer,
  itemMeta?: ItemMeta
): GmShopPurchaseOffer {
  if (!isBasShopEquipmentRow(row)) return offer;
  const slotKind = resolveColEquipmentSlotKind(row.category, itemMeta, row.shopKey);
  if (!slotKind) return offer;
  const col = colPriceForBasEquipment(row.grade, slotKind);
  if (col == null) return offer;
  return {
    itemId: offer.itemId,
    priceAdena: null,
    priceCoinOfLuck: col,
  };
}
