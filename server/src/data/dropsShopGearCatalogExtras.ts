/**
 * Зброя / броня / щити / аксесуари з магазину дропів — ті самі iconUrl, що в GM-шопі.
 */
import type { DropsShopGradeUk } from './dropsShopCatalog.generated.js';
import { DROPS_SHOP_CATALOG } from './dropsShopCatalog.generated.js';
import dropsShopOverrides from './dropsShopOverrides.json';
import { dropsGmPurchaseByShopKeyLower } from '../domain/dropsShopGmItemIdByShopKey.js';
import type { GmShopGrade } from './l2dopGmShopCatalog.generated.js';
import type { WeaponKindForEnchant } from './l2dopEnchant.js';
import type { GearCatalogRow } from './itemsCatalog.js';
import { ITEM_CATALOG, wpnCritForWeaponKind } from './itemsCatalog.js';

type OverrideRow = { itemId?: number };

const GEAR_CATEGORIES = new Set(['weapon', 'shield', 'armor', 'earring']);

function gearRowFromCatalogItem(
  itemId: number,
  nameUk: string,
  iconUrl: string,
  grade?: DropsShopGradeUk
): GearCatalogRow | null {
  const m = ITEM_CATALOG[itemId];
  if (!m?.slot) return null;
  const stats: GearCatalogRow['stats'] = {};
  if (m.pAtk != null) stats.pAtk = m.pAtk;
  if (m.mAtk != null) stats.mAtk = m.mAtk;
  if (m.pDef != null) stats.pDef = m.pDef;
  if (m.atkSpd != null) stats.atkSpd = m.atkSpd;
  if (typeof m.wpnCrit === 'number') {
    stats.wpnCrit = m.wpnCrit;
  } else if (m.weaponType) {
    stats.wpnCrit = wpnCritForWeaponKind(m.weaponType as WeaponKindForEnchant);
  }
  if (m.rCrit != null && m.rCrit > 0) stats.rCrit = m.rCrit;

  return {
    itemId,
    nameUk: m.nameUk || nameUk,
    iconUrl,
    slot: m.slot,
    grade: grade as GmShopGrade | undefined,
    ...(m.weaponType ? { weaponType: m.weaponType } : {}),
    ...(m.armorType ? { armorType: m.armorType } : {}),
    stats,
  };
}

/** Для GET /character/catalog-hints — іконки предметів з крамниці дропів у сумці. */
export function dropsShopGearCatalogExtras(): GearCatalogRow[] {
  const overrides = dropsShopOverrides as Record<string, OverrideRow>;
  const gm = dropsGmPurchaseByShopKeyLower();
  const out: GearCatalogRow[] = [];
  const seen = new Set<number>();

  for (const row of DROPS_SHOP_CATALOG) {
    if (!GEAR_CATEGORIES.has(row.category)) continue;
    const keyNorm = row.shopKey.replace(/\\/g, '/').toLowerCase();
    const override = overrides[row.shopKey];
    const itemId =
      override && typeof override.itemId === 'number' && override.itemId > 0
        ? Math.floor(override.itemId)
        : (gm.get(keyNorm)?.itemId ?? null);
    if (itemId == null || itemId <= 0 || seen.has(itemId)) continue;
    const gear = gearRowFromCatalogItem(
      itemId,
      row.nameUk,
      row.iconUrl,
      row.grade
    );
    if (!gear) continue;
    seen.add(itemId);
    out.push(gear);
  }
  return out;
}
