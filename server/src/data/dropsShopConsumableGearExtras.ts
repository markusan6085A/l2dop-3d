/**
 * Рядки каталогу для GET /character — щоб у сумці / бою були ті самі iconUrl, що в крамниці дропів.
 */
import type { GearCatalogRow } from './itemsCatalog.js';
import dropsShopOverrides from './dropsShopOverrides.json';
import { DROPS_SHOP_ARROW_ROWS } from './dropsShopArrowsCatalog.js';
import { DROPS_SHOP_CONSUMABLE_ROWS } from './dropsShopConsumablesCatalog.js';
import { DROPS_SHOP_FIGHTER_SOULSHOT_ROWS } from './dropsShopFighterSoulshotsCatalog.js';

type OverrideRow = { itemId?: number };

export function dropsShopConsumableGearCatalogExtras(): GearCatalogRow[] {
  const keys = dropsShopOverrides as Record<string, OverrideRow>;
  const rows = [
    ...DROPS_SHOP_CONSUMABLE_ROWS,
    ...DROPS_SHOP_ARROW_ROWS,
    ...DROPS_SHOP_FIGHTER_SOULSHOT_ROWS,
  ];
  const out: GearCatalogRow[] = [];
  for (const r of rows) {
    const ent = keys[r.shopKey];
    const itemId =
      ent && typeof ent.itemId === 'number' && ent.itemId > 0
        ? Math.floor(ent.itemId)
        : null;
    if (itemId == null) continue;
    out.push({
      itemId,
      nameUk: r.nameUk,
      iconUrl: r.iconUrl,
      slot: 'consumable',
      stats: {},
    });
  }
  return out;
}
