/**
 * Авторські подарункові предмети (не в GM-шопі).
 */
import type { GmShopGrade } from './l2dopGmShopCatalog.generated.js';
import type { GearCatalogRow, ItemMeta } from './itemsCatalog.js';

const DWARVEN_MACE_ICON = '/icons/drops/weapon_ng/weapon_dwarven_mace_i00.png';

/** itemId → метадані (унікальні id поза Interlude-таблицями). */
export const AUTHOR_GIFT_ITEMS: Record<number, ItemMeta> = {
  /** Подарунок для xXx_ShoTnuk_xXx — гномяча булава NG з кастомними статами. */
  9009154: {
    nameUk: 'Гномяча булава ШоТнука',
    slot: 'rhand',
    pAtk: 500,
    mAtk: 1000,
    weaponType: 'blunt',
    atkSpd: 600,
    wpnCrit: 120,
    equipCastSpd: 600,
    equipMCritPct: 60,
  },
};

export function mergeAuthorGiftItems(target: Record<number, ItemMeta>): void {
  for (const [idStr, meta] of Object.entries(AUTHOR_GIFT_ITEMS)) {
    const id = Number(idStr);
    if (!Number.isFinite(id) || id <= 0) continue;
    target[id] = meta;
  }
}

/** Для GET /character/catalog-hints — іконка й стати в сумці. */
export function authorGiftGearCatalogExtras(): GearCatalogRow[] {
  const m = AUTHOR_GIFT_ITEMS[9009154];
  if (!m) return [];
  return [
    {
      itemId: 9009154,
      nameUk: m.nameUk,
      iconUrl: DWARVEN_MACE_ICON,
      slot: 'rhand',
      grade: 'NG' as GmShopGrade,
      weaponType: 'blunt',
      stats: {
        pAtk: m.pAtk,
        mAtk: m.mAtk,
        atkSpd: m.atkSpd,
        wpnCrit: m.wpnCrit,
        castSpd: m.equipCastSpd,
        mCritPct: m.equipMCritPct,
      },
    },
  ];
}
