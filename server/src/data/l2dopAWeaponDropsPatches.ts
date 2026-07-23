/**
 * A-grade зброя в магазині дропів — preview з канонічної таблиці `aWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { AWeaponCanonEntry } from './aWeaponCatalog.js';
import { A_WEAPON_BY_SHOP_KEY_LOWER } from './aWeaponCatalog.js';

export type AWeaponDropsPatch = APhysWeaponPatch | AMagicWeaponPatch;

export interface APhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface AMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function toPatch(entry: AWeaponCanonEntry): AWeaponDropsPatch {
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
