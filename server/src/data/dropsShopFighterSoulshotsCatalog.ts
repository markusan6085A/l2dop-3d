/**
 * Крамниця дропів: заряди душі (соски) для воїна — окремо від магів і від загального consumables.
 * Іконки: `server/public/icons/drops/resours/` (див. константи `FIGHTER_SOULSHOT_ICON_*`).
 * Логіка бою / дроп — пізніше; зараз лише покупка тих самих itemId, що в Interlude.
 *
 * Для магів згодом: окремий файл на кшталт `dropsShopMysticSoulshotsCatalog.ts` + дроп у npc / процедурний лут.
 */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';

/** База під статику з `server/public`. */
const RES = '/icons/drops/resours';

export const FIGHTER_SOULSHOT_ICON_NG = `${RES}/etc_spirit_bullet_white_i00.png`;
export const FIGHTER_SOULSHOT_ICON_D = `${RES}/Etc_spirit_bullet_blue_i00_0.jpg`;
export const FIGHTER_SOULSHOT_ICON_C = `${RES}/Etc_spirit_bullet_green_i00_0.jpg`;
export const FIGHTER_SOULSHOT_ICON_B = `${RES}/Etc_spirit_bullet_red_i00_0.jpg`;
export const FIGHTER_SOULSHOT_ICON_A = `${RES}/Etc_spirit_bullet_silver_i00_0.jpg`;
export const FIGHTER_SOULSHOT_ICON_S = `${RES}/Etc_spirit_bullet_gold_i00_0.jpg`;

export const DROPS_SHOP_FIGHTER_SOULSHOT_ROWS: DropsShopCatalogRow[] = [
  {
    shopKey: 'consumable/fighter_soulshot_ng',
    category: 'consumable',
    grade: 'NG',
    iconUrl: FIGHTER_SOULSHOT_ICON_NG,
    nameUk: 'Заряд душі воїна',
  },
  {
    shopKey: 'consumable/fighter_soulshot_d',
    category: 'consumable',
    grade: 'D',
    iconUrl: FIGHTER_SOULSHOT_ICON_D,
    nameUk: 'Заряд душі воїна',
  },
  {
    shopKey: 'consumable/fighter_soulshot_c',
    category: 'consumable',
    grade: 'C',
    iconUrl: FIGHTER_SOULSHOT_ICON_C,
    nameUk: 'Заряд душі воїна',
  },
  {
    shopKey: 'consumable/fighter_soulshot_b',
    category: 'consumable',
    grade: 'B',
    iconUrl: FIGHTER_SOULSHOT_ICON_B,
    nameUk: 'Заряд душі воїна',
  },
  {
    shopKey: 'consumable/fighter_soulshot_a',
    category: 'consumable',
    grade: 'A',
    iconUrl: FIGHTER_SOULSHOT_ICON_A,
    nameUk: 'Заряд душі воїна',
  },
  {
    shopKey: 'consumable/fighter_soulshot_s',
    category: 'consumable',
    grade: 'S',
    iconUrl: FIGHTER_SOULSHOT_ICON_S,
    nameUk: 'Заряд душі воїна',
  },
];
