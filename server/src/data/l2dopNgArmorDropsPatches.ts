/**
 * NG-grade броня в магазині дропів: shopKey, синтетичний itemId (без колізій з D/C GM),
 * P.Def, частина сету для фільтра UI.
 */
import type { DropsShopArmorPiece } from '../domain/dropsShopGearSubtypes.js';
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { ArmorTypeKind, ItemSlotKind } from './itemsCatalog.js';

export interface NgArmorDropsPatch {
  nameUk: string;
  itemId: number;
  pDef: number;
  armorPiece: DropsShopArmorPiece;
  slot: ItemSlotKind;
  armorType: ArmorTypeKind;
}

function pathKey(segment: string): string {
  return segment.replace(/\\/g, '/').toLowerCase();
}

/** Синтетичні id 9002261–9002270 — не перетинаються з GM D/C armor (44, 436, 439, 441…). */
const RAW: Array<[string, NgArmorDropsPatch]> = [
  [
    'arrom_ng/devotion_halmet.jpg',
    {
      nameUk: 'Devotion Helmet',
      itemId: 9002261,
      pDef: 12,
      armorPiece: 'head',
      slot: 'head',
      armorType: 'magic',
    },
  ],
  [
    'arrom_ng/native helmet.jpg',
    {
      nameUk: 'Native helmet',
      itemId: 9002262,
      pDef: 12,
      armorPiece: 'head',
      slot: 'head',
      armorType: 'light',
    },
  ],
  [
    'arrom_ng/tunic of devotion.jpg',
    {
      nameUk: 'Tunic of devotion',
      itemId: 9002263,
      pDef: 39,
      armorPiece: 'torso',
      slot: 'chest',
      armorType: 'magic',
    },
  ],
  [
    'arrom_ng/native tunic.jpg',
    {
      nameUk: 'Native tunic',
      itemId: 9002264,
      pDef: 39,
      armorPiece: 'torso',
      slot: 'chest',
      armorType: 'light',
    },
  ],
  [
    'arrom_ng/stockings of devotion.jpg',
    {
      nameUk: 'Stockings of devotion',
      itemId: 9002265,
      pDef: 23,
      armorPiece: 'legs',
      slot: 'legs',
      armorType: 'magic',
    },
  ],
  [
    'arrom_ng/native pants.jpg',
    {
      nameUk: 'Native pants',
      itemId: 9002266,
      pDef: 23,
      armorPiece: 'legs',
      slot: 'legs',
      armorType: 'light',
    },
  ],
  [
    'arrom_ng/devotion gloves.jpg',
    {
      nameUk: 'Devotion gloves',
      itemId: 9002267,
      pDef: 4,
      armorPiece: 'gloves',
      slot: 'gloves',
      armorType: 'magic',
    },
  ],
  [
    'arrom_ng/native gloves.jpg',
    {
      nameUk: 'Native gloves',
      itemId: 9002268,
      pDef: 4,
      armorPiece: 'gloves',
      slot: 'gloves',
      armorType: 'light',
    },
  ],
  [
    'arrom_ng/devotion_bots.jpg',
    {
      nameUk: 'Devotion Bots',
      itemId: 9002269,
      pDef: 6,
      armorPiece: 'feet',
      slot: 'feet',
      armorType: 'magic',
    },
  ],
  [
    'arrom_ng/native_bots.jpg',
    {
      nameUk: 'Native Bots',
      itemId: 9002270,
      pDef: 6,
      armorPiece: 'feet',
      slot: 'feet',
      armorType: 'light',
    },
  ],
];

export const L2DOP_NG_DROPS_ARMOR_BY_SHOP_KEY_LOWER: Readonly<
  Record<string, NgArmorDropsPatch>
> = RAW.reduce(
  (acc, [segment, patch]) => {
    acc[pathKey(segment)] = patch;
    return acc;
  },
  {} as Record<string, NgArmorDropsPatch>,
);

export function ngArmorDropsPreviewLines(pDef: number): DropsShopStatLineUk[] {
  return [{ labelUk: 'Def', valueUk: String(pDef) }];
}
