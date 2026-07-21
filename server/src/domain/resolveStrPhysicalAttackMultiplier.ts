/** Опорна точка STR для P.Atk (авторська формула). */
export const STR_PATK_MUL_PIVOT = 20;

/** STR до soft-cap: множник за 1 STR. */
export const STR_FIRST_SLOPE = 0.045;

/** STR після soft-cap: зменшений slope (diminishing returns). */
export const STR_AFTER_CAP_SLOPE = 0.02;

/** STR, з якого починається soft-cap (2.98 = 1 + (64−20)×0.045). */
export const STR_SOFT_CAP_START = 64;

/** Нижня межа STR-множника P.Atk. */
export const STR_PATK_MUL_FLOOR = 0.3;

/** Верхня межа STR-множника P.Atk (hard cap). */
export const STR_PATK_MUL_HARD_CAP = 4.0;

export type StrPhysicalAttackMultiplierResult = {
  finalStr: number;
  multiplier: number;
  rawMultiplier: number;
  softCapStart: number;
  hardCap: number;
  formula: string;
};

/**
 * Канонічний STR-множник фіз. атаки з soft-cap:
 * STR ≤ 64: 1 + (STR − 20) × 0.045
 * STR > 64: 2.98 + (STR − 64) × 0.02
 * clamp(raw, 0.30, 4.00)
 */
export function resolveStrPhysicalAttackMultiplier(
  finalStr: number,
): StrPhysicalAttackMultiplierResult {
  const str = Math.max(1, Number.isFinite(finalStr) ? finalStr : 1);
  const raw =
    str <= STR_SOFT_CAP_START
      ? 1 + (str - STR_PATK_MUL_PIVOT) * STR_FIRST_SLOPE
      : 2.98 + (str - STR_SOFT_CAP_START) * STR_AFTER_CAP_SLOPE;
  const multiplier = Math.max(
    STR_PATK_MUL_FLOOR,
    Math.min(STR_PATK_MUL_HARD_CAP, raw),
  );
  const formula =
    str <= STR_SOFT_CAP_START
      ? `clamp(1 + (${str} - ${STR_PATK_MUL_PIVOT}) * ${STR_FIRST_SLOPE}, ${STR_PATK_MUL_FLOOR}, ${STR_PATK_MUL_HARD_CAP})`
      : `clamp(2.98 + (${str} - ${STR_SOFT_CAP_START}) * ${STR_AFTER_CAP_SLOPE}, ${STR_PATK_MUL_FLOOR}, ${STR_PATK_MUL_HARD_CAP})`;
  return {
    finalStr: str,
    multiplier,
    rawMultiplier: raw,
    softCapStart: STR_SOFT_CAP_START,
    hardCap: STR_PATK_MUL_HARD_CAP,
    formula,
  };
}
