/**
 * Dagger Mastery (skill 209) — Human Rogue → Treasure Hunter → Adventurer.
 * Flat +P.Atk лише з кинджалом у руці.
 */
export const DAGGER_MASTERY_L2_SKILL_ID = 209;
export const DAGGER_MASTERY_BATTLE_ID = 'l2_209';
export const DAGGER_MASTERY_MAX_RANK = 45;

export const DAGGER_MASTERY_PATK_FLAT_BY_RANK = [
  0, 3.6, 6, 7.4, 9, 10.8, 12.8, 15.1, 17.6, 20.3, 21.8, 23.4, 25, 26.6, 28.4,
  30.2, 32.1, 34.1, 36.1, 38.2, 40.4, 42.7, 45, 47.4, 49.9, 52.4, 55, 57.7,
  60.4, 63.2, 66.1, 69, 71.9, 74.9, 78, 81.1, 84.2, 87.3, 90.5, 93.7, 96.8,
  100, 103.2, 106.4, 109.6, 112.8,
] as const;

export const DAGGER_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 3400 },
  { level: 2, requiredLevel: 24, spCost: 5900 },
  { level: 3, requiredLevel: 28, spCost: 5500 },
  { level: 4, requiredLevel: 28, spCost: 5500 },
  { level: 5, requiredLevel: 32, spCost: 9100 },
  { level: 6, requiredLevel: 32, spCost: 9100 },
  { level: 7, requiredLevel: 36, spCost: 16000 },
  { level: 8, requiredLevel: 36, spCost: 16000 },
  { level: 9, requiredLevel: 40, spCost: 12000 },
  { level: 10, requiredLevel: 40, spCost: 12000 },
  { level: 11, requiredLevel: 40, spCost: 12000 },
  { level: 12, requiredLevel: 43, spCost: 14000 },
  { level: 13, requiredLevel: 43, spCost: 14000 },
  { level: 14, requiredLevel: 43, spCost: 14000 },
  { level: 15, requiredLevel: 46, spCost: 15000 },
  { level: 16, requiredLevel: 46, spCost: 15000 },
  { level: 17, requiredLevel: 46, spCost: 15000 },
  { level: 18, requiredLevel: 49, spCost: 30000 },
  { level: 19, requiredLevel: 49, spCost: 30000 },
  { level: 20, requiredLevel: 49, spCost: 30000 },
  { level: 21, requiredLevel: 52, spCost: 38000 },
  { level: 22, requiredLevel: 52, spCost: 38000 },
  { level: 23, requiredLevel: 52, spCost: 38000 },
  { level: 24, requiredLevel: 55, spCost: 56000 },
  { level: 25, requiredLevel: 55, spCost: 56000 },
  { level: 26, requiredLevel: 55, spCost: 56000 },
  { level: 27, requiredLevel: 58, spCost: 67000 },
  { level: 28, requiredLevel: 58, spCost: 67000 },
  { level: 29, requiredLevel: 58, spCost: 67000 },
  { level: 30, requiredLevel: 60, spCost: 160000 },
  { level: 31, requiredLevel: 60, spCost: 160000 },
  { level: 32, requiredLevel: 62, spCost: 220000 },
  { level: 33, requiredLevel: 62, spCost: 220000 },
  { level: 34, requiredLevel: 64, spCost: 220000 },
  { level: 35, requiredLevel: 64, spCost: 220000 },
  { level: 36, requiredLevel: 66, spCost: 390000 },
  { level: 37, requiredLevel: 66, spCost: 390000 },
  { level: 38, requiredLevel: 68, spCost: 390000 },
  { level: 39, requiredLevel: 68, spCost: 390000 },
  { level: 40, requiredLevel: 70, spCost: 520000 },
  { level: 41, requiredLevel: 70, spCost: 520000 },
  { level: 42, requiredLevel: 72, spCost: 680000 },
  { level: 43, requiredLevel: 72, spCost: 680000 },
  { level: 44, requiredLevel: 74, spCost: 1300000 },
  { level: 45, requiredLevel: 74, spCost: 1300000 },
] as const;

export const DAGGER_MASTERY_HINT_UK =
  'Пасив: +P.Atk (flat) з кинджалом. 1 р. — +3.6 (20 лв), 45 р. — +112.8 (74 лв). ' +
  'Rogue → Treasure Hunter. MP у бою не витрачається.';

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function daggerMasteryPatkFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(DAGGER_MASTERY_MAX_RANK, Math.floor(rank)));
  return DAGGER_MASTERY_PATK_FLAT_BY_RANK[r] ?? 0;
}

export function daggerMasteryRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DAGGER_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function daggerMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DAGGER_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function daggerMasteryStatsNoteUk(rank: number): string {
  const flat = daggerMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.min(DAGGER_MASTERY_MAX_RANK, Math.floor(rank)));
  const reqLv = DAGGER_MASTERY_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  if (flat <= 0) {
    return DAGGER_MASTERY_HINT_UK;
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P.Atk (flat) на р. ' +
    lv +
    ' скіла' +
    reqPart +
    '. Лише кинджал. MP у бою не витрачається.'
  );
}
