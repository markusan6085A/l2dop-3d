/** Стріли в крамниці дропів — іконки з `server/public/icons/drops/resours/`. */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';

const RES = '/icons/drops/resours';

const ICON_ARROW_NG = `${RES}/etc_wooden_quiver_i00.png`;
const ICON_ARROW_D = `${RES}/etc_bone_quiver_i00.png`;
const ICON_ARROW_C = `${RES}/etc_fine_steel_quiver_i00.png`;
const ICON_ARROW_B = `${RES}/etc_silver_quiver_i00.png`;
const ICON_ARROW_A = `${RES}/etc_mithril_quiver_i00.png`;
const ICON_ARROW_S = `${RES}/etc_shining_quiver_i00.png`;

/** ItemId як у Interlude (Wooden … Shining Arrow). */
export const DROPS_SHOP_ARROW_ROWS: DropsShopCatalogRow[] = [
  {
    shopKey: 'consumable/arrow_ng',
    category: 'consumable',
    grade: 'NG',
    iconUrl: ICON_ARROW_NG,
    nameUk: 'Стріла (без грейду)',
  },
  {
    shopKey: 'consumable/arrow_d',
    category: 'consumable',
    grade: 'D',
    iconUrl: ICON_ARROW_D,
    nameUk: 'Стріла (D-grade)',
  },
  {
    shopKey: 'consumable/arrow_c',
    category: 'consumable',
    grade: 'C',
    iconUrl: ICON_ARROW_C,
    nameUk: 'Стріла (C-grade)',
  },
  {
    shopKey: 'consumable/arrow_b',
    category: 'consumable',
    grade: 'B',
    iconUrl: ICON_ARROW_B,
    nameUk: 'Стріла (B-grade)',
  },
  {
    shopKey: 'consumable/arrow_a',
    category: 'consumable',
    grade: 'A',
    iconUrl: ICON_ARROW_A,
    nameUk: 'Стріла (A-grade)',
  },
  {
    shopKey: 'consumable/arrow_s',
    category: 'consumable',
    grade: 'S',
    iconUrl: ICON_ARROW_S,
    nameUk: 'Стріла (S-grade)',
  },
];
