import type { CWeaponDropsPatch } from '../data/l2dopCWeaponDropsPatches.js';

/** GM Shop: C-grade зброя — 600 000 … 900 000 аден за статами. */
export const C_GRADE_GM_WEAPON_PRICE_MIN = 600_000;
export const C_GRADE_GM_WEAPON_PRICE_MAX = 900_000;

const PHYS_P_ATK_MIN = 153;
const PHYS_P_ATK_MAX = 413;
const MAGIC_M_ATK_MIN = 95;
const MAGIC_M_ATK_MAX = 154;

function clampCGradeWeaponPrice(value: number): number {
  const rounded = Math.round(value / 1000) * 1000;
  return Math.max(
    C_GRADE_GM_WEAPON_PRICE_MIN,
    Math.min(C_GRADE_GM_WEAPON_PRICE_MAX, rounded)
  );
}

/** Швидкість (менше = швидше у L2) — невеликий бонус до ціни. */
function speedPriceBonus(speed: number): number {
  return Math.max(0, 450 - speed) * 100;
}

/**
 * Фіз. зброя: база від P.Atk, + Crit понад 40, + швидкість.
 * Маг.: база від M.Atk (верхня межа нижча за луки), + швидкість.
 */
export function cGradeWeaponGmShopPriceAdena(patch: CWeaponDropsPatch): number {
  if (patch.mode === 'magic') {
    const span = Math.max(1, MAGIC_M_ATK_MAX - MAGIC_M_ATK_MIN);
    const magicTop = 750_000;
    const base =
      C_GRADE_GM_WEAPON_PRICE_MIN +
      ((patch.mAtk - MAGIC_M_ATK_MIN) / span) * (magicTop - C_GRADE_GM_WEAPON_PRICE_MIN);
    return clampCGradeWeaponPrice(base + speedPriceBonus(patch.speed));
  }

  const span = Math.max(1, PHYS_P_ATK_MAX - PHYS_P_ATK_MIN);
  const base =
    C_GRADE_GM_WEAPON_PRICE_MIN +
    ((patch.pAtk - PHYS_P_ATK_MIN) / span) *
      (C_GRADE_GM_WEAPON_PRICE_MAX - C_GRADE_GM_WEAPON_PRICE_MIN);
  const critBonus = Math.max(0, patch.crit - 40) * 550;
  return clampCGradeWeaponPrice(base + critBonus + speedPriceBonus(patch.speed));
}
