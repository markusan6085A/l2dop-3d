/**
 * S-grade зброя в магазині дропів — preview з канonічної таблиці `sWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { SWeaponCanonEntry } from './sWeaponCatalog.js';
import { S_WEAPON_BY_SHOP_KEY_LOWER } from './sWeaponCatalog.js';

export interface SWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: SWeaponCanonEntry): SWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_S_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  SWeaponDropsPatch
> = Object.fromEntries(
  [...S_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function sGradeWeaponDropsPreviewLines(
  patch: SWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
