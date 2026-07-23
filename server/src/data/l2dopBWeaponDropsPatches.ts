/**
 * B-grade зброя в магазині дропів — preview з канонічної таблиці `bWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { BWeaponCanonEntry } from './bWeaponCatalog.js';
import { B_WEAPON_BY_SHOP_KEY_LOWER } from './bWeaponCatalog.js';

export type BWeaponDropsPatch = BPhysWeaponPatch | BMagicWeaponPatch;

export interface BPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface BMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function toPatch(entry: BWeaponCanonEntry): BWeaponDropsPatch {
  if (entry.mode === 'magic') {
    return {
      nameUk: entry.shopNameUk,
      mode: 'magic',
      mAtk: entry.mAtk ?? 0,
      speed: entry.atkSpd,
    };
  }
  return {
    nameUk: entry.shopNameUk,
    mode: 'phys',
    pAtk: entry.pAtk,
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
