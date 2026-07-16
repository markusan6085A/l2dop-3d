/**
 * Hamstring Shot (skill 354) — Human Sagittarius.
 * Фіз. урон з лука + сповільнення пересування цілі (−50%, 2 хв).
 */
export const HAMSTRING_SHOT_L2_SKILL_ID = 354;
export const HAMSTRING_SHOT_BATTLE_ID = 'l2_354';
export const HAMSTRING_SHOT_MAX_RANK = 1;
export const HAMSTRING_SHOT_COOLDOWN_SEC = 60;
export const HAMSTRING_SHOT_CAST_SEC = 4;
export const HAMSTRING_SHOT_RANGE = 900;
export const HAMSTRING_SHOT_BASE_LAND_CHANCE_PCT = 40;
export const HAMSTRING_SHOT_SLOW_DURATION_SEC = 120;
/** Множник швидкості пересування цілі (0.5 = −50%). */
export const HAMSTRING_SHOT_RUN_SPEED_MUL = 0.5;

export const HAMSTRING_SHOT_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 77,
    spCost: 20_000_000,
    power: 1973,
    mpCost: 129,
  },
] as const;

export const HAMSTRING_SHOT_HINT_UK =
  'Актив з лука: power ' +
  HAMSTRING_SHOT_LEVEL_ROWS[0]!.power +
  '; −50% швидкості пересування цілі на ' +
  HAMSTRING_SHOT_SLOW_DURATION_SEC +
  ' с (базовий шанс ' +
  HAMSTRING_SHOT_BASE_LAND_CHANCE_PCT +
  '%, залежить від WIT цілі). Можливий крит і over-hit. ' +
  'Sagittarius, 77 лв. Каст ' +
  HAMSTRING_SHOT_CAST_SEC +
  ' с, відкат ' +
  HAMSTRING_SHOT_COOLDOWN_SEC +
  ' с, дальність ' +
  HAMSTRING_SHOT_RANGE +
  '.';

export function hamstringShotMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(HAMSTRING_SHOT_MAX_RANK, Math.floor(rank)));
  const row = HAMSTRING_SHOT_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

export function hamstringShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return HAMSTRING_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function hamstringShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = HAMSTRING_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function hamstringShotDamageAtk(
  pAtk: number,
  power: number,
  profMult: number
): number {
  return Math.floor(pAtk * (1.12 + power / 480) * profMult);
}

export function hamstringShotSlowDurationMs(): number {
  return HAMSTRING_SHOT_SLOW_DURATION_SEC * 1000;
}

export function hamstringShotStatsNoteUk(rank: number): string {
  const row = hamstringShotMpPowerAtRank(rank);
  const reqLv = hamstringShotRequiredLevelAtRank(rank);
  return (
    'Power ' +
    (row?.power ?? 1973) +
    ', MP ' +
    (row?.mp ?? 129) +
    '; −50% Run Speed на ' +
    HAMSTRING_SHOT_SLOW_DURATION_SEC +
    ' с (~' +
    HAMSTRING_SHOT_BASE_LAND_CHANCE_PCT +
    '%, WIT цілі)' +
    (typeof reqLv === 'number' ? ' (Sagittarius, ' + reqLv + ' лв)' : '') +
    '. Каст ' +
    HAMSTRING_SHOT_CAST_SEC +
    ' с, відкат ' +
    HAMSTRING_SHOT_COOLDOWN_SEC +
    ' с, дальність ' +
    HAMSTRING_SHOT_RANGE +
    '. Лише лук.'
  );
}

export function hamstringShotSkillLineUk(
  appliedSlow: boolean,
  effLandPct: number
): string {
  if (appliedSlow) {
    return (
      'Постріл у сухожилля (Hamstring Shot): −50% швидкості пересування на ' +
      HAMSTRING_SHOT_SLOW_DURATION_SEC +
      ' с (~' +
      Math.round(effLandPct) +
      '%).'
    );
  }
  return (
    'Постріл у сухожилля (Hamstring Shot): сповільнення не спрацювало (~' +
    Math.round(effLandPct) +
    '%).'
  );
}
