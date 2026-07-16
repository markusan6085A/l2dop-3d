/**
 * Quick Step (skill 169) — Human Rogue → Treasure Hunter.
 * Пасив: flat +Speed (швидкість пересування).
 */
export const QUICK_STEP_L2_SKILL_ID = 169;
export const QUICK_STEP_BATTLE_ID = 'l2_169';
export const QUICK_STEP_MAX_RANK = 2;

export const QUICK_STEP_SPEED_FLAT_BY_RANK = [0, 7, 11] as const;

export const QUICK_STEP_LEVEL_ROWS = [
  { level: 1, requiredLevel: 28, spCost: 11_000, speedFlat: 7 },
  { level: 2, requiredLevel: 43, spCost: 41_000, speedFlat: 11 },
] as const;

export const QUICK_STEP_HINT_UK =
  'Пасив: +Speed (швидкість пересування). 1 р. — Rogue, 28 лв (+7); 2 р. — Treasure Hunter, 43 лв (+11). ' +
  'MP у бою не витрачається.';

export function quickStepSpeedFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(QUICK_STEP_MAX_RANK, Math.floor(rank)));
  return QUICK_STEP_SPEED_FLAT_BY_RANK[r] ?? 0;
}

export function quickStepRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return QUICK_STEP_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function quickStepSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = QUICK_STEP_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function quickStepStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(QUICK_STEP_MAX_RANK, Math.floor(rank)));
  const speed = quickStepSpeedFlatAtRank(r);
  const reqLv = QUICK_STEP_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart = r === 1 ? 'Rogue' : r === 2 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Пасив: +' +
    speed +
    ' Speed на р. ' +
    r +
    reqPart +
    '. MP у бою не витрачається.'
  );
}
