/**
 * Sonic Focus charges (Gladiator/Duelist — L2 Interlude): лічильник зарядів, які
 * генеруються Sonic Focus (id 8) і витрачаються іншими sonic-скілами:
 * Sonic Blaster (6) = 1, Sonic Buster (9) = 1, Sonic Storm (7) = 3,
 * Double Sonic Slash (5) = 2, Triple Sonic Slash (261) = 3, Sonic Guard (442) = 5.
 *
 * В L2 Interlude максимум — 7. За бажанням гравця в нашій реалізації ліміт
 * піднято до `SONIC_MAX_CHARGES_DEFAULT` (ефективно 10), щоб було комфортно
 * накопичувати заряди для «важких» скілів.
 *
 * Плата зарядами — у момент виконання скіла (після перевірки mp/cd).
 */

/** Максимум, якщо `st.maxSonicCharges` не задано (гравець ще не налаштовував). */
export const SONIC_MAX_CHARGES_DEFAULT = 10;

/** Заряди, які має Sonic Focus (8) додати за один каст (base). */
export const SONIC_FOCUS_GAIN_PER_CAST = 1;

/**
 * Витрати зарядів для кожного sonic-скіла (L2 Interlude). Якщо ключ відсутній —
 * скіл не зачіпає зарядів (наприклад, Fatal Strike / Hammer Crush / Triple Slash).
 */
export const SONIC_CHARGE_COST_BY_SKILL_ID: Readonly<
  Record<number, number>
> = {
  5: 2, // Double Sonic Slash
  6: 1, // Sonic Blaster
  7: 3, // Sonic Storm
  9: 1, // Sonic Buster
  261: 3, // Triple Sonic Slash
  442: 5, // Sonic Guard
};

/** Вимога мінімуму зарядів (дорівнює витраті, якщо не задано інакше). */
export function sonicChargeRequirementForSkillId(
  skillId: number
): number {
  return SONIC_CHARGE_COST_BY_SKILL_ID[skillId] ?? 0;
}

export function clampSonicCharges(
  value: number,
  max: number
): number {
  const m = Math.max(0, Math.floor(max));
  const v = Math.max(0, Math.floor(value));
  return Math.min(m, v);
}

/**
 * Патч зарядів, який повертає хендлер скіла. `delta` додаємо до поточного
 * `sonicCharges` (додатні — після Sonic Focus; від'ємні — витрата). `maxSet` —
 * одноразово ініціалізувати/оновити максимум (зазвичай не потрібно, бо
 * `SONIC_MAX_CHARGES_DEFAULT` ставиться при першому касті Sonic Focus).
 */
export interface SonicChargesPatch {
  delta?: number;
  maxSet?: number;
}
