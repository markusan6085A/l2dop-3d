import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';
import { ENCHANT_SCROLL_DEFINITIONS } from './enchantScrollCatalog.js';

export const DROPS_SHOP_ENCHANT_SCROLL_ROWS: DropsShopCatalogRow[] =
  ENCHANT_SCROLL_DEFINITIONS.map((row) => ({
    shopKey: row.shopKey,
    category: 'consumable',
    grade: row.grade,
    iconUrl: row.iconUrl,
    nameUk: row.nameUk,
  }));
