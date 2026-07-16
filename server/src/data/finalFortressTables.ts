/**
 * Final Fortress (skill 291) — Human Paladin → Phoenix Knight.
 * Пасив: +P.Def (flat), коли HP <= 20% від максимуму. MP не витрачає.
 */
export const FINAL_FORTRESS_L2_SKILL_ID = 291;
export const FINAL_FORTRESS_BATTLE_ID = 'l2_291';
export const FINAL_FORTRESS_MAX_RANK = 11;
/** Поріг HP (частка max HP), нижче якого діє бонус (включно з 20%). */
export const FINAL_FORTRESS_HP_RATIO_MAX = 0.2;

export const FINAL_FORTRESS_LEVEL_ROWS = [
  { level: 1, requiredLevel: 52, spCost: 120_000, pdefFlat: 116.875 },
  { level: 2, requiredLevel: 55, spCost: 150_000, pdefFlat: 129 },
  { level: 3, requiredLevel: 58, spCost: 200_000, pdefFlat: 141.625 },
  { level: 4, requiredLevel: 60, spCost: 270_000, pdefFlat: 150.375 },
  { level: 5, requiredLevel: 62, spCost: 330_000, pdefFlat: 159.25 },
  { level: 6, requiredLevel: 64, spCost: 370_000, pdefFlat: 168.375 },
  { level: 7, requiredLevel: 66, spCost: 580_000, pdefFlat: 177.625 },
  { level: 8, requiredLevel: 68, spCost: 650_000, pdefFlat: 187 },
  { level: 9, requiredLevel: 70, spCost: 780_000, pdefFlat: 196.5 },
  { level: 10, requiredLevel: 72, spCost: 1_200_000, pdefFlat: 206.125 },
  { level: 11, requiredLevel: 74, spCost: 1_900_000, pdefFlat: 215.75 },
] as const;

export const FINAL_FORTRESS_HINT_UK =
  'Пасив: автоматично +P.Def (flat), коли HP <= 20%. ' +
  '1 р. — 52 лв (+116.9) … 11 р. — 74 лв (+215.8). Paladin / Phoenix Knight. MP у бою не витрачається.';

export function finalFortressPdefFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FINAL_FORTRESS_MAX_RANK, Math.floor(rank)));
  return FINAL_FORTRESS_LEVEL_ROWS[r - 1]?.pdefFlat ?? 0;
}

export function finalFortressRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FINAL_FORTRESS_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function finalFortressSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FINAL_FORTRESS_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function finalFortressStatsNoteUk(
  rank: number,
  currentPdef?: number
): string {
  const r = Math.max(1, Math.min(FINAL_FORTRESS_MAX_RANK, Math.floor(rank)));
  const flat = finalFortressPdefFlatAtRank(r);
  const reqLv = FINAL_FORTRESS_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (на ${reqLv} лв)` : '';
  const basePdef =
    typeof currentPdef === 'number' && currentPdef > 0 ? currentPdef : null;
  const pct =
    basePdef != null && flat > 0 ? (flat / basePdef) * 100 : 0;
  const pctText = pct > 0 ? pct.toFixed(1) : '0.0';
  const pctPart =
    basePdef != null
      ? ' (прибл. +' + pctText + '% від твоєї поточної базової P.Def)'
      : '';
  return (
    'Пасив (<=20% HP): на р. ' +
    r +
    reqPart +
    ' +' +
    flat +
    ' P.Def' +
    pctPart +
    '.'
  );
}
