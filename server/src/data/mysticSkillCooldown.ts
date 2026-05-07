const CAST_SPD_BASELINE = 500;
const CAST_SPD_CAP = 3500;
const MYSTIC_CD_AT_BASELINE_SEC = 2;
const MYSTIC_CD_AT_CAP_SEC = 0.4;

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Глобальний CD для активних маг-скілів:
 * 500 castSpd -> 2.0s, 3500 castSpd -> 0.4s (лінійна інтерполяція).
 */
export function mysticGlobalSkillCooldownSec(castSpd: number): number {
  const cspd = clamp(
    Number.isFinite(castSpd) ? Math.floor(castSpd) : CAST_SPD_BASELINE,
    CAST_SPD_BASELINE,
    CAST_SPD_CAP
  );
  const t = (cspd - CAST_SPD_BASELINE) / (CAST_SPD_CAP - CAST_SPD_BASELINE);
  const sec =
    MYSTIC_CD_AT_BASELINE_SEC +
    t * (MYSTIC_CD_AT_CAP_SEC - MYSTIC_CD_AT_BASELINE_SEC);
  return Math.max(MYSTIC_CD_AT_CAP_SEC, Math.round(sec * 100) / 100);
}

/**
 * Множник з пасивок cooldown reduction: 1.10 = 10% швидше (CD ділиться на 1.10).
 */
export function applyCooldownReductionMul(
  cdSec: number,
  cooldownReductionMul: number | undefined
): number {
  const mul =
    typeof cooldownReductionMul === 'number' &&
    Number.isFinite(cooldownReductionMul) &&
    cooldownReductionMul > 0
      ? cooldownReductionMul
      : 1;
  const reduced = cdSec / mul;
  return Math.max(MYSTIC_CD_AT_CAP_SEC, Math.round(reduced * 100) / 100);
}

