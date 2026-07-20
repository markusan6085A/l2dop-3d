export const SAFE_ENCHANT_MAX_LEVEL = 3;
export const MAX_ENCHANT_LEVEL = 25;
export const ENCHANT_FAIL_RESET_TO_LEVEL = 10;
export const ENCHANT_FAIL_RESET_FROM_LEVEL = 11;

export function clampEnchantLevel(raw: unknown): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(MAX_ENCHANT_LEVEL, n));
}

export function getEnchantSuccessChance(currentEnchantLevel: number): number {
  const current = clampEnchantLevel(currentEnchantLevel);
  if (current <= 2) return 100;
  if (current === 3) return 70;
  if (current === 4) return 65;
  if (current === 5) return 60;
  if (current === 6) return 55;
  if (current === 7) return 50;
  if (current === 8) return 45;
  if (current === 9) return 40;
  if (current >= 10 && current <= 14) return 30;
  if (current >= 15 && current <= 19) return 20;
  return 10; // 20..24
}

export function getEnchantFailLevel(currentEnchantLevel: number): number {
  const current = clampEnchantLevel(currentEnchantLevel);
  if (current <= SAFE_ENCHANT_MAX_LEVEL) return SAFE_ENCHANT_MAX_LEVEL;
  if (current <= ENCHANT_FAIL_RESET_TO_LEVEL) return current - 1;
  return ENCHANT_FAIL_RESET_TO_LEVEL;
}

export function canAttemptEnchant(currentEnchantLevel: number): boolean {
  return clampEnchantLevel(currentEnchantLevel) < MAX_ENCHANT_LEVEL;
}
