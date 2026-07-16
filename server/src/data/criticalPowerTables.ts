/**
 * Critical Power (skill 193) — Human Rogue → Treasure Hunter.
 * Пасив: flat +урон від фізичного крита (addCritDmg).
 */
export const CRITICAL_POWER_L2_SKILL_ID = 193;
export const CRITICAL_POWER_BATTLE_ID = 'l2_193';
export const CRITICAL_POWER_MAX_RANK = 6;

export const CRITICAL_POWER_FLAT_BY_RANK = [
  0, 32, 56, 93, 177, 295, 384,
] as const;

export const CRITICAL_POWER_LEVEL_ROWS = [
  { level: 1, requiredLevel: 24, spCost: 5_900, critDmgFlat: 32 },
  { level: 2, requiredLevel: 32, spCost: 18_000, critDmgFlat: 56 },
  { level: 3, requiredLevel: 40, spCost: 35_000, critDmgFlat: 93 },
  { level: 4, requiredLevel: 52, spCost: 120_000, critDmgFlat: 177 },
  { level: 5, requiredLevel: 64, spCost: 430_000, critDmgFlat: 295 },
  { level: 6, requiredLevel: 72, spCost: 1_400_000, critDmgFlat: 384 },
] as const;

export const CRITICAL_POWER_HINT_UK =
  'Пасив: +урон від фізичного крита (flat). 1–2 р. — Rogue (24–32 лв); 3–6 р. — Treasure Hunter (40–72 лв). ' +
  '6 р. — +384. MP у бою не витрачається.';

export function criticalPowerFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(CRITICAL_POWER_MAX_RANK, Math.floor(rank)));
  return CRITICAL_POWER_FLAT_BY_RANK[r] ?? 0;
}

export function criticalPowerRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return CRITICAL_POWER_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function criticalPowerSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = CRITICAL_POWER_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function criticalPowerStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(CRITICAL_POWER_MAX_RANK, Math.floor(rank)));
  const flat = criticalPowerFlatAtRank(r);
  const reqLv = CRITICAL_POWER_LEVEL_ROWS[r - 1]?.requiredLevel;
  const profPart =
    r <= 2 ? 'Rogue' : r >= 3 ? 'Treasure Hunter' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  return (
    'Пасив: +' +
    flat +
    ' до критичного урону на р. ' +
    r +
    reqPart +
    '. MP у бою не витрачається.'
  );
}
