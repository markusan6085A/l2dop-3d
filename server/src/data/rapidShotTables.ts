/**
 * Rapid Shot (skill 99) — Human Rogue → Hawkeye.
 * Селф-баф: +% швидкості атаки з луком (лише bow у бою / профілі).
 */
export const RAPID_SHOT_L2_SKILL_ID = 99;
export const RAPID_SHOT_BATTLE_ID = 'l2_99';
export const RAPID_SHOT_MAX_RANK = 2;
export const RAPID_SHOT_COOLDOWN_SEC = 10;
export const RAPID_SHOT_CAST_SEC = 1.5;
export const RAPID_SHOT_DURATION_SEC = 1200;

export const RAPID_SHOT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 32, spCost: 18_000, aspdPct: 8, mpCost: 28 },
  { level: 2, requiredLevel: 55, spCost: 250_000, aspdPct: 12, mpCost: 50 },
] as const;

export const RAPID_SHOT_HINT_UK =
  'Активний селф-баф на ' +
  RAPID_SHOT_DURATION_SEC / 60 +
  ' хв: +% швидкості атаки лише з луком (з іншою зброєю бонус не діє). ' +
  '1 р. — Rogue, 32 лв (+8%, MP 28); 2 р. — Hawkeye, 55 лв (+12%, MP 50). ' +
  'Каст ' +
  RAPID_SHOT_CAST_SEC +
  ' с, відкат ' +
  RAPID_SHOT_COOLDOWN_SEC +
  ' с.';

export function rapidShotAspdPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(RAPID_SHOT_MAX_RANK, Math.floor(rank)));
  return RAPID_SHOT_LEVEL_ROWS[r - 1]?.aspdPct ?? 8;
}

export function rapidShotAspdMulAtRank(rank: number): number {
  return 1 + rapidShotAspdPctAtRank(rank) / 100;
}

export function rapidShotMpAtRank(rank: number): number {
  const r = Math.max(1, Math.min(RAPID_SHOT_MAX_RANK, Math.floor(rank)));
  return RAPID_SHOT_LEVEL_ROWS[r - 1]?.mpCost ?? 28;
}

export function rapidShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return RAPID_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function rapidShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = RAPID_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function rapidShotStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(RAPID_SHOT_MAX_RANK, Math.floor(rank)));
  const pct = rapidShotAspdPctAtRank(r);
  const mp = rapidShotMpAtRank(r);
  const reqLv = RAPID_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart = r === 1 ? 'Rogue' : r === 2 ? 'Hawkeye' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Селф-баф ' +
    RAPID_SHOT_DURATION_SEC / 60 +
    ' хв: +' +
    pct +
    '% швидкості атаки з луком (MP ' +
    mp +
    ') на р. ' +
    r +
    reqPart +
    '. Каст ' +
    RAPID_SHOT_CAST_SEC +
    ' с, відкат ' +
    RAPID_SHOT_COOLDOWN_SEC +
    ' с.'
  );
}
