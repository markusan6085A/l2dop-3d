/**
 * D-grade зброя в магазині дропів — preview з канонічної таблиці `dWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { DWeaponCanonEntry } from './dWeaponCatalog.js';
import { D_WEAPON_BY_SHOP_KEY_LOWER } from './dWeaponCatalog.js';

export interface DWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: DWeaponCanonEntry): DWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_D_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  DWeaponDropsPatch
> = Object.fromEntries(
  [...D_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function dGradeWeaponDropsPreviewLines(
  patch: DWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
