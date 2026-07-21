/**
 * D-grade зброя в магазині дропів — preview з канонічної таблиці `dWeaponCatalog.ts`.
 */
import type { DropsShopStatLineUk } from '../domain/dropsShopStatsPreviewUk.js';
import type { DWeaponCanonEntry } from './dWeaponCatalog.js';
import { D_WEAPON_BY_SHOP_KEY_LOWER } from './dWeaponCatalog.js';

export type DWeaponDropsPatch = DWeaponPhysPatch | DWeaponMagicBookPatch;

export interface DWeaponPhysPatch {
  nameUk: string;
  mode: 'phys';
  pAtk: number;
  speed: number;
  crit: number;
}

export interface DWeaponMagicBookPatch {
  nameUk: string;
  mode: 'magic_book';
  mAtk: number;
  speed: number;
}

function toPatch(entry: DWeaponCanonEntry): DWeaponDropsPatch {
  if (entry.mode === 'magic') {
    return {
      nameUk: entry.shopNameUk,
      mode: 'magic_book',
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
  if (patch.mode === 'magic_book') {
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
