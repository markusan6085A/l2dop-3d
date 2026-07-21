/**
 * NG-grade зброя в магазині дропів — preview з канонічної таблиці `ngWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { NgWeaponCanonEntry } from './ngWeaponCatalog.js';
import { NG_WEAPON_BY_SHOP_KEY_LOWER } from './ngWeaponCatalog.js';

export type NgWeaponDropsPatch = NgMagicWeaponPatch | NgPhysWeaponPatch;

export interface NgMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

export interface NgPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

function toPatch(entry: NgWeaponCanonEntry): NgWeaponDropsPatch {
  if (entry.mode === 'magic') {
    return {
      mode: 'magic',
      nameUk: entry.shopNameUk,
      mAtk: entry.mAtk ?? 0,
      speed: entry.atkSpd,
    };
  }
  return {
    mode: 'phys',
    nameUk: entry.shopNameUk,
    pAtk: entry.pAtk ?? 0,
    speed: entry.atkSpd,
    crit: entry.displayCrit ?? 0,
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
  if (patch.mode === 'magic') {
    return [
      {
        labelUk: '',
        valueUk: `M.Atk: ${patch.mAtk} | Speed: ${patch.speed} | Crit: —`,
      },
    ];
  }
  return [
    {
      labelUk: '',
      valueUk: `P.Atk: ${patch.pAtk} | Speed: ${patch.speed} | Crit: ${patch.crit}`,
    },
  ];
}
