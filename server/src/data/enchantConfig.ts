export const SAFE_ENCHANT_MAX_LEVEL = 3;
export const MAX_ENCHANT_LEVEL = 25;
/** Нижня межа рівня при невдачі (+3…+15). */
export const ENCHANT_FAIL_FLOOR_LEVEL = 3;
/** Скидання при невдачі з +21…+24. */
export const ENCHANT_FAIL_RESET_TO_LEVEL = 20;
export const ENCHANT_FAIL_RESET_FROM_LEVEL = 21;

/** Шанс успіху для спроби current → current+1 (canonical, server + client mirror). */
export const ENCHANT_SUCCESS_CHANCE_BY_LEVEL: Readonly<Record<number, number>> = {
  0: 100,
  1: 100,
  2: 100,
  3: 90,
  4: 85,
  5: 80,
  6: 75,
  7: 70,
  8: 65,
  9: 60,
  10: 55,
  11: 50,
  12: 45,
  13: 40,
  14: 35,
  15: 30,
  16: 27,
  17: 24,
  18: 21,
  19: 18,
  20: 15,
  21: 12,
  22: 10,
  23: 8,
  24: 6,
};

export function clampEnchantLevel(raw: unknown): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_ENCHANT_LEVEL, n));
}

export function getEnchantSuccessChance(currentEnchantLevel: number): number {
  const current = clampEnchantLevel(currentEnchantLevel);
  if (current >= MAX_ENCHANT_LEVEL) return 0;
  return ENCHANT_SUCCESS_CHANCE_BY_LEVEL[current] ?? 0;
}

export function getEnchantFailLevel(currentEnchantLevel: number): number {
  const current = clampEnchantLevel(currentEnchantLevel);
  if (current <= ENCHANT_FAIL_FLOOR_LEVEL) return ENCHANT_FAIL_FLOOR_LEVEL;
  if (current <= 15) return current - 1;
  if (current <= 20) return current - 2;
  if (current <= 24) return ENCHANT_FAIL_RESET_TO_LEVEL;
  return current;
}

export function canAttemptEnchant(currentEnchantLevel: number): boolean {
  return clampEnchantLevel(currentEnchantLevel) < MAX_ENCHANT_LEVEL;
}
