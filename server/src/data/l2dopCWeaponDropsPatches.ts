/**
 * C-grade зброя в магазині дропів — preview з канонічної таблиці `cWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { CWeaponCanonEntry } from './cWeaponCatalog.js';
import { C_WEAPON_BY_SHOP_KEY_LOWER } from './cWeaponCatalog.js';

export interface CWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: CWeaponCanonEntry): CWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_C_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  CWeaponDropsPatch
> = Object.fromEntries(
  [...C_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function cGradeWeaponDropsPreviewLines(
  patch: CWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
