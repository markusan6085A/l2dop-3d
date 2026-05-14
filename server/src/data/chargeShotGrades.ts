import type { GmShopGrade } from './l2dopGmShopCatalog.generated.js';

/** Interlude: заряд душі воїна за грейдом зброї. */
export const FIGHTER_SOULSHOT_GRADE_BY_ITEM_ID: Readonly<
  Record<number, GmShopGrade>
> = {
  1835: 'NG',
  1463: 'D',
  1464: 'C',
  1465: 'B',
  1466: 'A',
  1467: 'S',
};

/** Interlude: благословений заряд духу за грейдом зброї мага. */
export const MYSTIC_SPIRITSHOT_GRADE_BY_ITEM_ID: Readonly<
  Record<number, GmShopGrade>
> = {
  3947: 'NG',
  3948: 'D',
  3949: 'C',
  3950: 'B',
  3951: 'A',
  3952: 'S',
};

export function fighterSoulshotGradeForItem(
  chargeItemId: number
): GmShopGrade | undefined {
  return FIGHTER_SOULSHOT_GRADE_BY_ITEM_ID[Math.floor(chargeItemId)];
}

export function mysticSpiritshotGradeForItem(
  chargeItemId: number
): GmShopGrade | undefined {
  return MYSTIC_SPIRITSHOT_GRADE_BY_ITEM_ID[Math.floor(chargeItemId)];
}
