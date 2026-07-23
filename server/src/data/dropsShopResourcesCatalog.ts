/** Ресурси в крамниці дропів (підкатегорія «Ресурси» у «Розхідники»). */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';
import {
  GRADE_CRAFT_MATERIAL_CATALOG,
  gradeCraftMaterialShopKey,
} from './gradeCraftMaterialsCatalog.js';

const RES = '/icons/drops/resours';

const LEGACY_RESOURCE_ROWS: DropsShopCatalogRow[] = [
  {
    shopKey: 'consumable/resource_soul_ore',
    category: 'consumable',
    grade: 'NG',
    iconUrl: `${RES}/Soul_Ore.jpg`,
    nameUk: 'Soul Ore',
  },
  {
    shopKey: 'consumable/resource_spirit_ore',
    category: 'consumable',
    grade: 'NG',
    iconUrl: `${RES}/Spirit_Ore.jpg`,
    nameUk: 'Spirit Ore',
  },
  {
    shopKey: 'consumable/resource_fishing_lure',
    category: 'consumable',
    grade: 'NG',
    iconUrl: `${RES}/Etc_gludio_fish_lure_i00_0.jpg`,
    nameUk: 'Наживка',
  },
];

const GRADE_CRAFT_RESOURCE_ROWS: DropsShopCatalogRow[] =
  GRADE_CRAFT_MATERIAL_CATALOG.map((row) => ({
    shopKey: gradeCraftMaterialShopKey(row.code),
    category: 'consumable',
    grade: row.grade,
    iconUrl: row.iconUrl,
    nameUk: row.nameUk,
  }));

export const DROPS_SHOP_RESOURCE_ROWS: DropsShopCatalogRow[] = [
  ...LEGACY_RESOURCE_ROWS,
  ...GRADE_CRAFT_RESOURCE_ROWS,
];
