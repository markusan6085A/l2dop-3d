/**
 * Bow Mastery (skill 208) — Human Rogue → Hawkeye → Sagittarius.
 * Flat +P.Atk лише з луком у руці.
 */
export const BOW_MASTERY_L2_SKILL_ID = 208;
export const BOW_MASTERY_BATTLE_ID = 'l2_208';
export const BOW_MASTERY_MAX_RANK = 52;

export const BOW_MASTERY_PATK_FLAT_BY_RANK = [
  0, 10.3, 11.4, 27.6, 32.8, 35.6, 38.6, 45.2, 48.9, 52.7, 61.1, 65.6, 70.4,
  80.9, 86.5, 92.4, 105.1, 111.9, 178.8, 189.9, 201.4, 213.5, 226, 239.1, 252.7,
  266.7, 281.3, 296.4, 311.9, 328, 344.5, 361.6, 379.1, 397, 415.4, 434.3,
  453.5, 473.2, 493.1, 513.5, 534.2, 555.1, 576.3, 597.8, 619.4, 641.2, 663.1,
  685, 707.1, 729.1, 751, 772.9, 794.6,
] as const;

export const BOW_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 1100 },
  { level: 2, requiredLevel: 20, spCost: 1100 },
  { level: 3, requiredLevel: 20, spCost: 1100 },
  { level: 4, requiredLevel: 24, spCost: 1900 },
  { level: 5, requiredLevel: 24, spCost: 1900 },
  { level: 6, requiredLevel: 24, spCost: 1900 },
  { level: 7, requiredLevel: 28, spCost: 3600 },
  { level: 8, requiredLevel: 28, spCost: 3600 },
  { level: 9, requiredLevel: 28, spCost: 3600 },
  { level: 10, requiredLevel: 32, spCost: 6100 },
  { level: 11, requiredLevel: 32, spCost: 6100 },
  { level: 12, requiredLevel: 32, spCost: 6100 },
  { level: 13, requiredLevel: 36, spCost: 10000 },
  { level: 14, requiredLevel: 36, spCost: 10000 },
  { level: 15, requiredLevel: 36, spCost: 10000 },
  { level: 16, requiredLevel: 40, spCost: 16000 },
  { level: 17, requiredLevel: 40, spCost: 16000 },
  { level: 18, requiredLevel: 40, spCost: 16000 },
  { level: 19, requiredLevel: 43, spCost: 19000 },
  { level: 20, requiredLevel: 43, spCost: 19000 },
  { level: 21, requiredLevel: 43, spCost: 19000 },
  { level: 22, requiredLevel: 46, spCost: 22000 },
  { level: 23, requiredLevel: 46, spCost: 22000 },
  { level: 24, requiredLevel: 46, spCost: 22000 },
  { level: 25, requiredLevel: 49, spCost: 41000 },
  { level: 26, requiredLevel: 49, spCost: 41000 },
  { level: 27, requiredLevel: 49, spCost: 41000 },
  { level: 28, requiredLevel: 52, spCost: 63000 },
  { level: 29, requiredLevel: 52, spCost: 63000 },
  { level: 30, requiredLevel: 52, spCost: 63000 },
  { level: 31, requiredLevel: 55, spCost: 90000 },
  { level: 32, requiredLevel: 55, spCost: 90000 },
  { level: 33, requiredLevel: 55, spCost: 90000 },
  { level: 34, requiredLevel: 58, spCost: 93000 },
  { level: 35, requiredLevel: 58, spCost: 93000 },
  { level: 36, requiredLevel: 58, spCost: 93000 },
  { level: 37, requiredLevel: 60, spCost: 210000 },
  { level: 38, requiredLevel: 60, spCost: 210000 },
  { level: 39, requiredLevel: 62, spCost: 250000 },
  { level: 40, requiredLevel: 62, spCost: 250000 },
  { level: 41, requiredLevel: 64, spCost: 270000 },
  { level: 42, requiredLevel: 64, spCost: 270000 },
  { level: 43, requiredLevel: 66, spCost: 440000 },
  { level: 44, requiredLevel: 66, spCost: 440000 },
  { level: 45, requiredLevel: 68, spCost: 490000 },
  { level: 46, requiredLevel: 68, spCost: 490000 },
  { level: 47, requiredLevel: 70, spCost: 580000 },
  { level: 48, requiredLevel: 70, spCost: 580000 },
  { level: 49, requiredLevel: 72, spCost: 840000 },
  { level: 50, requiredLevel: 72, spCost: 840000 },
  { level: 51, requiredLevel: 74, spCost: 1400000 },
  { level: 52, requiredLevel: 74, spCost: 1400000 },
] as const;

export const BOW_MASTERY_HINT_UK =
  'Пасив: +P.Atk (flat) з луком. 1 р. — +10.3 (20 лв), 52 р. — +794.6 (74 лв). ' +
  'Rogue → Hawkeye. MP у бою не витрачається.';

function formatFlat(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function bowMasteryPatkFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(BOW_MASTERY_MAX_RANK, Math.floor(rank)));
  return BOW_MASTERY_PATK_FLAT_BY_RANK[r] ?? 0;
}

export function bowMasteryRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BOW_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function bowMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BOW_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function bowMasteryStatsNoteUk(rank: number): string {
  const flat = bowMasteryPatkFlatAtRank(rank);
  const lv = Math.max(1, Math.min(BOW_MASTERY_MAX_RANK, Math.floor(rank)));
  const reqLv = BOW_MASTERY_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  if (flat <= 0) {
    return BOW_MASTERY_HINT_UK;
  }
  return (
    'Пасив: +' +
    formatFlat(flat) +
    ' P.Atk (flat) на р. ' +
    lv +
    ' скіла' +
    reqPart +
    '. Лише лук. MP у бою не витрачається.'
  );
}
