/**
 * Dash (skill 4) — Human Rogue → Treasure Hunter.
 * Селф-баф: +швидкість бігу на 15 с, без урону.
 */
export const DASH_L2_SKILL_ID = 4;
export const DASH_BATTLE_ID = 'l2_4';
export const DASH_MAX_RANK = 2;
export const DASH_COOLDOWN_SEC = 25;
export const DASH_CAST_SEC = 1;
export const DASH_DURATION_SEC = 15;

export const DASH_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 3_400, runSpeedFlat: 90, mpCost: 19 },
  { level: 2, requiredLevel: 46, spCost: 47_000, runSpeedFlat: 160, mpCost: 41 },
] as const;

export const DASH_HINT_UK =
  'Селф-баф на ' +
  DASH_DURATION_SEC +
  ' с: різко збільшує швидкість пересування (без урону). ' +
  '1 р. — Rogue, 20 лв (+90 Speed, MP 19); 2 р. — Treasure Hunter, 46 лв (+160 Speed, MP 41). ' +
  'Каст ' +
  DASH_CAST_SEC +
  ' с, відкат ' +
  DASH_COOLDOWN_SEC +
  ' с.';

export function dashRunSpeedFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(DASH_MAX_RANK, Math.floor(rank)));
  return DASH_LEVEL_ROWS[r - 1]?.runSpeedFlat ?? 90;
}

export function dashMpAtRank(rank: number): number {
  const r = Math.max(1, Math.min(DASH_MAX_RANK, Math.floor(rank)));
  return DASH_LEVEL_ROWS[r - 1]?.mpCost ?? 19;
}

export function dashRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DASH_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function dashSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DASH_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function dashStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(DASH_MAX_RANK, Math.floor(rank)));
  const speed = dashRunSpeedFlatAtRank(r);
  const mp = dashMpAtRank(r);
  const reqLv = DASH_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart =
    r === 1 ? 'Rogue' : r === 2 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (${profPart}, ${reqLv} лв)` : '';
  return (
    'Селф-баф ' +
    DASH_DURATION_SEC +
    ' с: +' +
    speed +
    ' Speed (MP ' +
    mp +
    ') на р. ' +
    r +
    reqPart +
    '. Каст ' +
    DASH_CAST_SEC +
    ' с, відкат ' +
    DASH_COOLDOWN_SEC +
    ' с.'
  );
}
