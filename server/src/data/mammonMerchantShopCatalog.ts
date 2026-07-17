import {
  MAMMON_MERCHANT_GEMSTONES,
  resolveMammonGemstoneOffer,
  type MammonGemstoneOffer,
} from './mammonMerchantGemstones.js';
import {
  MAMMON_MERCHANT_LIFE_STONES,
  resolveMammonLifeStoneOffer,
  type MammonLifeStoneOffer,
} from './mammonMerchantLifeStones.js';

export type MammonMerchantShopCategoryId = 'gemstones' | 'life_stones';

export interface MammonMerchantShopOfferBase {
  categoryId: MammonMerchantShopCategoryId;
  itemKey: string;
  itemId: number;
  nameEn: string;
  nameUk: string;
  iconUrl: string;
  aaPrice: number;
}

export interface MammonMerchantShopCategoryDto {
  categoryId: MammonMerchantShopCategoryId;
  categoryUk: string;
  items: MammonMerchantShopOfferBase[];
}

function gemstoneToOffer(row: MammonGemstoneOffer): MammonMerchantShopOfferBase {
  return {
    categoryId: 'gemstones',
    itemKey: row.grade,
    itemId: row.itemId,
    nameEn: row.nameEn,
    nameUk: row.nameUk,
    iconUrl: row.iconUrl,
    aaPrice: row.aaPrice,
  };
}

function lifeStoneToOffer(row: MammonLifeStoneOffer): MammonMerchantShopOfferBase {
  return {
    categoryId: 'life_stones',
    itemKey: row.grade,
    itemId: row.itemId,
    nameEn: row.nameEn,
    nameUk: row.nameUk,
    iconUrl: row.iconUrl,
    aaPrice: row.aaPrice,
  };
}

export function getMammonMerchantShopCategories(): MammonMerchantShopCategoryDto[] {
  return [
    {
      categoryId: 'gemstones',
      categoryUk: 'Ресурси',
      items: MAMMON_MERCHANT_GEMSTONES.map(gemstoneToOffer),
    },
    {
      categoryId: 'life_stones',
      categoryUk: 'Life Stones',
      items: MAMMON_MERCHANT_LIFE_STONES.map(lifeStoneToOffer),
    },
  ];
}

export function resolveMammonMerchantShopOffer(
  categoryRaw: unknown,
  itemKeyRaw: unknown
): MammonMerchantShopOfferBase | null {
  let category =
    typeof categoryRaw === 'string' ? categoryRaw.trim().toLowerCase() : '';
  let itemKey =
    typeof itemKeyRaw === 'string' ? itemKeyRaw.trim().toLowerCase() : '';

  /** Legacy: `{ grade: "d" }` без category. */
  if (!category && itemKey) {
    category = 'gemstones';
  }
  if (category === 'gemstones') {
    const row = resolveMammonGemstoneOffer(itemKey);
    return row ? gemstoneToOffer(row) : null;
  }
  if (category === 'life_stones') {
    const row = resolveMammonLifeStoneOffer(itemKey);
    return row ? lifeStoneToOffer(row) : null;
  }
  return null;
}

export type MammonMerchantShopOffer =
  | MammonGemstoneOffer
  | MammonLifeStoneOffer;

export function resolveMammonMerchantShopOfferRow(
  categoryRaw: unknown,
  itemKeyRaw: unknown
): MammonMerchantShopOffer | null {
  let category =
    typeof categoryRaw === 'string' ? categoryRaw.trim().toLowerCase() : '';
  let itemKey =
    typeof itemKeyRaw === 'string' ? itemKeyRaw.trim().toLowerCase() : '';
  if (!category && itemKey) category = 'gemstones';
  if (category === 'gemstones') {
    return resolveMammonGemstoneOffer(itemKey);
  }
  if (category === 'life_stones') {
    return resolveMammonLifeStoneOffer(itemKey);
  }
  return null;
}
