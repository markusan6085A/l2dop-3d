/**
 * Boost HP (skill 211) — flat бонус до Max HP на поточному рівні скіла.
 * Канон Interlude / la2era: одна таблиця для всіх класів, що вивчають 211.
 */
export const BOOST_HP_FLAT_BY_RANK = [
  0, 60, 100, 150, 200, 250, 300, 350, 400, 440, 480,
] as const;

export const BOOST_HP_MAX_RANK = BOOST_HP_FLAT_BY_RANK.length - 1;

export function boostHpFlatAtRank(rank: number): number {
  const r = Math.max(0, Math.min(BOOST_HP_MAX_RANK, Math.floor(rank)));
  return BOOST_HP_FLAT_BY_RANK[r] ?? 0;
}

/** Текст для магістра / профілю на конкретному рівні скіла. */
export function boostHpStatsNoteUk(rank: number): string {
  const flat = boostHpFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) return 'Пасив: збільшує максимальне HP.';
  return `+${flat} Max. HP (рівень скіла ${lv}).`;
}
