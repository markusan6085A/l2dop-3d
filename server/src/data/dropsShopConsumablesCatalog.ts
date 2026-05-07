/** Категорія «Розхідники» в крамниці дропів — поза сканом icons/drops (синтетичний shopKey). */
import type { DropsShopCatalogRow } from './dropsShopCatalog.generated.js';

export const DROPS_SHOP_CONSUMABLE_ROWS: DropsShopCatalogRow[] = [
  {
    shopKey: 'consumable/greater_healing_potion',
    category: 'consumable',
    grade: 'NG',
    iconUrl: '/game/item-icon/1539',
    nameUk: 'Зілля великого зцілення',
  },
  {
    shopKey: 'consumable/soulshot_ng',
    category: 'consumable',
    grade: 'NG',
    iconUrl: '/game/item-icon/1835',
    nameUk: 'Заряд душі (без грейду)',
  },
];
