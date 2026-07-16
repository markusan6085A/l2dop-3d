/**
 * Boost Attack Speed (skill 168) — Human Rogue → Treasure Hunter.
 * Пасив: +% швидкості фізичної атаки (будь-яка зброя).
 */
export const BOOST_ATTACK_SPEED_L2_SKILL_ID = 168;
export const BOOST_ATTACK_SPEED_BATTLE_ID = 'l2_168';
export const BOOST_ATTACK_SPEED_MAX_RANK = 3;

export const BOOST_ATTACK_SPEED_PCT_BY_RANK = [0, 5, 7, 10] as const;

export const BOOST_ATTACK_SPEED_LEVEL_ROWS = [
  { level: 1, requiredLevel: 36, spCost: 31_000, aspdPct: 5 },
  { level: 2, requiredLevel: 46, spCost: 47_000, aspdPct: 7 },
  { level: 3, requiredLevel: 58, spCost: 200_000, aspdPct: 10 },
] as const;

export const BOOST_ATTACK_SPEED_HINT_UK =
  'Пасив: +% швидкості фізичної атаки (будь-яка зброя). ' +
  '1 р. — Rogue, 36 лв (+5%); 2–3 р. — Treasure Hunter, 46–58 лв (+7%/+10%). ' +
  'MP у бою не витрачається.';

export function boostAttackSpeedPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(BOOST_ATTACK_SPEED_MAX_RANK, Math.floor(rank)));
  return BOOST_ATTACK_SPEED_PCT_BY_RANK[r] ?? 0;
}

export function boostAttackSpeedRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BOOST_ATTACK_SPEED_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function boostAttackSpeedSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BOOST_ATTACK_SPEED_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function boostAttackSpeedStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(BOOST_ATTACK_SPEED_MAX_RANK, Math.floor(rank)));
  const pct = boostAttackSpeedPctAtRank(r);
  const reqLv = BOOST_ATTACK_SPEED_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart = r === 1 ? 'Rogue' : r >= 2 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Пасив: +' +
    pct +
    '% швидкості атаки на р. ' +
    r +
    reqPart +
    '. MP у бою не витрачається.'
  );
}
