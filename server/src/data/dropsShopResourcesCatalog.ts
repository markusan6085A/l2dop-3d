/** Ресурси в крамниці дропів (підкатегорія «Ресурси» у «Розхідники»). */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';

const RES = '/icons/drops/resours';

export const DROPS_SHOP_RESOURCE_ROWS: DropsShopCatalogRow[] = [
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
