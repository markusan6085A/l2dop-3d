import {
  MAMMON_MERCHANT_LIFE_STONES,
  resolveMammonLifeStoneOffer,
  type MammonLifeStoneOffer,
} from './mammonMerchantLifeStones.js';

export type MammonMerchantShopCategoryId = 'life_stones';

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

/** Gemstone D–S продаються за Adena у звичайному магазині (див. gradeCraftMaterialsCatalog). */
export function getMammonMerchantShopCategories(): MammonMerchantShopCategoryDto[] {
  return [
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
  const category =
    typeof categoryRaw === 'string' ? categoryRaw.trim().toLowerCase() : '';
  const itemKey =
    typeof itemKeyRaw === 'string' ? itemKeyRaw.trim().toLowerCase() : '';

  if (category === 'life_stones') {
    const row = resolveMammonLifeStoneOffer(itemKey);
    return row ? lifeStoneToOffer(row) : null;
  }
  return null;
}

export type MammonMerchantShopOffer = MammonLifeStoneOffer;

export function resolveMammonMerchantShopOfferRow(
  categoryRaw: unknown,
  itemKeyRaw: unknown
): MammonMerchantShopOffer | null {
  const category =
    typeof categoryRaw === 'string' ? categoryRaw.trim().toLowerCase() : '';
  const itemKey =
    typeof itemKeyRaw === 'string' ? itemKeyRaw.trim().toLowerCase() : '';
  if (category === 'life_stones') {
    return resolveMammonLifeStoneOffer(itemKey);
  }
  return null;
}
