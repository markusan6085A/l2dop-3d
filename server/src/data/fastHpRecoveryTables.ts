/**
 * Fast HP Recovery (skill 212) — flat бонус до відновлення HP за тік.
 * Канон Interlude / text-rpg HF: одна таблиця для Human Fighter (8 р.).
 */
export const FAST_HP_RECOVERY_FLAT_BY_RANK = [
  0, 1.1, 1.6, 1.7, 2.1, 2.6, 2.7, 3.4, 4.0,
] as const;

export const FAST_HP_RECOVERY_MAX_RANK = FAST_HP_RECOVERY_FLAT_BY_RANK.length - 1;

export function fastHpRecoveryFlatAtRank(rank: number): number {
  const r = Math.max(0, Math.min(FAST_HP_RECOVERY_MAX_RANK, Math.floor(rank)));
  return FAST_HP_RECOVERY_FLAT_BY_RANK[r] ?? 0;
}

/** Текст для магістра / профілю на конкретному рівні скіла. */
export function fastHpRecoveryStatsNoteUk(rank: number): string {
  const flat = fastHpRecoveryFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) return 'Пасив: підвищує відновлення HP.';
  return `+${flat.toFixed(1)} HP/тік (рівень скіла ${lv}).`;
}
