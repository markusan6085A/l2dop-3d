/**
 * C-grade зброя в магазині дропів — preview з канонічної таблиці `cWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { CWeaponCanonEntry } from './cWeaponCatalog.js';
import { C_WEAPON_BY_SHOP_KEY_LOWER } from './cWeaponCatalog.js';

export type CWeaponDropsPatch = CPhysWeaponPatch | CMagicWeaponPatch;

export interface CPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface CMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function toPatch(entry: CWeaponCanonEntry): CWeaponDropsPatch {
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
