/**
 * B-grade зброя в магазині дропів — preview з канонічної таблиці `bWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { BWeaponCanonEntry } from './bWeaponCatalog.js';
import { B_WEAPON_BY_SHOP_KEY_LOWER } from './bWeaponCatalog.js';

export interface BWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: BWeaponCanonEntry): BWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_B_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  BWeaponDropsPatch
> = Object.fromEntries(
  [...B_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function bGradeWeaponDropsPreviewLines(
  patch: BWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
