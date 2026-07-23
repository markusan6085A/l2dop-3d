import type { DropsShopStatLineUk } from './dropsShopStatsPreviewUk.js';

/** Канонічні бойові характеристики зброї для inline-preview у магазині. */
export interface WeaponShopPreviewStats {
  pAtk: number;
  mAtk: number;
  atkSpd: number;
  wpnCrit: number;
}

/**
 * Два рядки для картки зброї в GM Shop:
 * 1) Фіз. атака + Маг. атака
 * 2) Швидкість + Крит.
 */
export function buildWeaponShopPreviewLinesUk(
  stats: WeaponShopPreviewStats,
): DropsShopStatLineUk[] {
  return [
    {
      labelUk: '',
      valueUk: `Фіз. атака: ${stats.pAtk} | Маг. атака: ${stats.mAtk}`,
    },
    {
      labelUk: '',
      valueUk: `Швидкість: ${stats.atkSpd} | Крит.: ${stats.wpnCrit}`,
    },
  ];
}
