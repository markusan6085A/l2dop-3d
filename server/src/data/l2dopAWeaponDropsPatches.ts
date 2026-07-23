/**
 * A-grade зброя в магазині дропів — preview з канonічної таблиці `aWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import { buildWeaponShopPreviewLinesUk } from '../domain/weaponShopPreviewUk.js';
import type { AWeaponCanonEntry } from './aWeaponCatalog.js';
import { A_WEAPON_BY_SHOP_KEY_LOWER } from './aWeaponCatalog.js';

export interface AWeaponDropsPatch {
  nameUk: string;
  pAtk: number;
  mAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: AWeaponCanonEntry): AWeaponDropsPatch {
  return {
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk,
    mAtk: entry.mAtk,
    speed: entry.atkSpd,
    crit: entry.wpnCrit,
  };
}

export const L2DOP_A_DROPS_WEAPON_BY_SHOP_KEY_LOWER: Record<
  string,
  AWeaponDropsPatch
> = Object.fromEntries(
  [...A_WEAPON_BY_SHOP_KEY_LOWER.entries()].map(([key, entry]) => [
    key,
    toPatch(entry),
  ]),
);

export function aGradeWeaponDropsPreviewLines(
  patch: AWeaponDropsPatch,
): DropsShopStatLineUk[] {
  return buildWeaponShopPreviewLinesUk({
    pAtk: patch.pAtk,
    mAtk: patch.mAtk,
    atkSpd: patch.speed,
    wpnCrit: patch.crit,
  });
}
