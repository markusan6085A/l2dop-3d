/**
 * S-grade зброя в магазині дропів — preview з канонічної таблиці `sWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { SWeaponCanonEntry } from './sWeaponCatalog.js';
import { S_WEAPON_BY_SHOP_KEY_LOWER } from './sWeaponCatalog.js';

export type SWeaponDropsPatch = SPhysWeaponPatch | SMagicWeaponPatch;

export interface SPhysWeaponPatch {
  mode: 'phys';
  nameUk: string;
  pAtk: number;
  speed: number;
  crit: number;
}

export interface SMagicWeaponPatch {
  mode: 'magic';
  nameUk: string;
  mAtk: number;
  speed: number;
}

function toPatch(entry: SWeaponCanonEntry): SWeaponDropsPatch {
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
    crit: entry.displayCrit ?? entry.wpnCrit,
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
