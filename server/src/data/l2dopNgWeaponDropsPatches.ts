/**
 * NG-grade зброя в магазині дропів — preview з канонічної таблиці `ngWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { NgWeaponCanonEntry } from './ngWeaponCatalog.js';
import { NG_WEAPON_BY_SHOP_KEY_LOWER } from './ngWeaponCatalog.js';

export interface NgWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: NgWeaponCanonEntry): NgWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_NG_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  NgWeaponDropsPatch
> = Object.fromEntries(
  [...NG_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function ngWeaponDropsPreviewLines(
  patch: NgWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
