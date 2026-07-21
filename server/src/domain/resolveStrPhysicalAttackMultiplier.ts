/** Опорна точка STR для P.Atk (авторська формула фази 4.1). */
export const STR_PATK_MUL_PIVOT = 20;

/** Коефіцієнт STR → P.Atk multiplier. */
export const STR_PATK_MUL_COEFF = 0.045;

/** Нижня межа STR-множника P.Atk (без верхнього cap). */
export const STR_PATK_MUL_FLOOR = 0.1;

export type StrPhysicalAttackMultiplierResult = {
  finalStr: number;
  multiplier: number;
  formula: string;
};

/**
 * Канонічний STR-множник фіз. атаки:
 * max(0.10, 1 + (finalSTR - 20) × 0.045)
 */
export function resolveStrPhysicalAttackMultiplier(
  finalStr: number,
): StrPhysicalAttackMultiplierResult {
  const s = Math.max(0, Math.floor(finalStr));
  const raw = 1 + (s - STR_PATK_MUL_PIVOT) * STR_PATK_MUL_COEFF;
  const multiplier = Math.max(STR_PATK_MUL_FLOOR, raw);
  return {
    finalStr: s,
    multiplier,
    formula: `max(${STR_PATK_MUL_FLOOR}, 1 + (${s} - ${STR_PATK_MUL_PIVOT}) * ${STR_PATK_MUL_COEFF})`,
  };
}
