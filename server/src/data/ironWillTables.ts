/**
 * Iron Will (skill 72) — Human Paladin / Dark Avenger (+ Phoenix / Hell Knight).
 * Toggle-селф-баф: +M.Def %, поки не вимкнеш. Макс. 3 ранги.
 */
export const IRON_WILL_L2_SKILL_ID = 72;
export const IRON_WILL_BATTLE_ID = 'l2_72';
export const IRON_WILL_MAX_RANK = 3;
export const IRON_WILL_COOLDOWN_SEC = 1;
export const IRON_WILL_CAST_SEC = 4;

/** +M.Def % за рангом (1 → 15%, 2 → 23%, 3 → 30%). */
export const IRON_WILL_MDEF_PCT_BY_RANK = [0, 15, 23, 30] as const;

export const IRON_WILL_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 43,
    mpCost: 38,
    spPaladin: 41_000,
    spDarkAvenger: 38_000,
    mdefPct: 15,
  },
  {
    level: 2,
    requiredLevel: 49,
    mpCost: 44,
    spPaladin: 82_000,
    spDarkAvenger: 70_000,
    mdefPct: 23,
  },
  {
    level: 3,
    requiredLevel: 55,
    mpCost: 50,
    spPaladin: 150_000,
    spDarkAvenger: 170_000,
    mdefPct: 30,
  },
] as const;

export const IRON_WILL_HINT_UK =
  'Toggle: +M.Def % (повторне натискання вимикає). ' +
  '1 р. — 43 лв (+15%), 2 р. — 49 лв (+23%), 3 р. — 55 лв (+30%). ' +
  'Paladin / Dark Avenger. Каст 4 с, відкат 1 с.';

export function ironWillMdefPctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(IRON_WILL_MAX_RANK, Math.floor(rank)));
  return IRON_WILL_MDEF_PCT_BY_RANK[r] ?? 0;
}

export function ironWillMdefMulAtRank(rank: number): number {
  const pct = ironWillMdefPctAtRank(rank);
  return pct > 0 ? 1 + pct / 100 : 1;
}

export function ironWillRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return IRON_WILL_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function ironWillMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(IRON_WILL_MAX_RANK, Math.floor(rank)));
  const mp = IRON_WILL_LEVEL_ROWS[r - 1]?.mpCost;
  return typeof mp === 'number' && mp >= 0 ? mp : null;
}

export function ironWillSpCostAtRank(
  rank: number,
  mappedHumanProf: string
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const row = IRON_WILL_LEVEL_ROWS[r - 1];
  if (!row) return undefined;
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_paladin' || p === 'human_phoenix_knight') {
    return row.spPaladin >= 1 ? row.spPaladin : undefined;
  }
  if (p === 'human_dark_avenger' || p === 'human_hell_knight') {
    return row.spDarkAvenger >= 1 ? row.spDarkAvenger : undefined;
  }
  return undefined;
}

export function ironWillStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(IRON_WILL_MAX_RANK, Math.floor(rank)));
  const pct = ironWillMdefPctAtRank(r);
  const mp = ironWillMpAtRank(r);
  const reqLv = IRON_WILL_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    '+M.Def ' +
    pct +
    '% (toggle), р. ' +
    r +
    reqPart +
    ', MP ' +
    (mp ?? '?') +
    ', каст ' +
    IRON_WILL_CAST_SEC +
    ' с, відкат ' +
    IRON_WILL_COOLDOWN_SEC +
    ' с.'
  );
}

export function ironWillSkillLineUk(rank: number): string {
  const pct = ironWillMdefPctAtRank(rank);
  return 'Залізна воля (72, Iron Will): +M.Def ' + pct + '%.';
}
