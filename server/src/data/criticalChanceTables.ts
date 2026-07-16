/**
 * Critical Chance (skill 137) — Human Rogue → Treasure Hunter.
 * Пасив: +% до шансу фізичного крита (`addPhysicalCritChancePct`).
 */
export const CRITICAL_CHANCE_L2_SKILL_ID = 137;
export const CRITICAL_CHANCE_BATTLE_ID = 'l2_137';
export const CRITICAL_CHANCE_MAX_RANK = 3;

export const CRITICAL_CHANCE_PCT_BY_RANK = [0, 20, 30, 40] as const;

export const CRITICAL_CHANCE_LEVEL_ROWS = [
  { level: 1, requiredLevel: 28, spCost: 11_000, critChancePct: 20 },
  { level: 2, requiredLevel: 40, spCost: 35_000, critChancePct: 30 },
  { level: 3, requiredLevel: 49, spCost: 89_000, critChancePct: 40 },
] as const;

export const CRITICAL_CHANCE_HINT_UK =
  'Пасив: +% до шансу фізичного крита. 1 р. — Rogue, 28 лв (+20%); ' +
  '2–3 р. — Treasure Hunter, 40–49 лв (+30%/+40%). MP у бою не витрачається.';

export function criticalChancePctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(CRITICAL_CHANCE_MAX_RANK, Math.floor(rank)));
  return CRITICAL_CHANCE_PCT_BY_RANK[r] ?? 0;
}

export function criticalChanceRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return CRITICAL_CHANCE_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function criticalChanceSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = CRITICAL_CHANCE_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function criticalChanceStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(CRITICAL_CHANCE_MAX_RANK, Math.floor(rank)));
  const pct = criticalChancePctAtRank(r);
  const reqLv = CRITICAL_CHANCE_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart = r === 1 ? 'Rogue' : r >= 2 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Пасив: +' +
    pct +
    '% шансу фіз. крита на р. ' +
    r +
    reqPart +
    '. MP у бою не витрачається.'
  );
}
