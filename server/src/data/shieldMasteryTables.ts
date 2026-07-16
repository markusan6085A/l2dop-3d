/**
 * Shield Mastery (skill 153) — Interlude, лицарські гілки (Human / Elf / Dark Elf).
 * Джерело ефекту: `p_shield_defence_rate` у skill XML (50 / 70 / 85 / 100).
 * Макс. 4 ранги; ранги 3–4 лише на 2-й профі (Paladin / Dark Avenger / Temple / Shillien).
 */
export const SHIELD_MASTERY_MAX_RANK = 4;

/** % ефективності захисту щита при блоці (Interlude XML). */
export const SHIELD_DEFENCE_RATE_PCT_BY_RANK = [0, 50, 70, 85, 100] as const;

export const SHIELD_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 20, spCost: 4100, mpCost: 0, power: 50 },
  { level: 2, requiredLevel: 28, spCost: 12000, mpCost: 0, power: 70 },
  { level: 3, requiredLevel: 40, spCost: 26000, mpCost: 0, power: 85 },
  { level: 4, requiredLevel: 52, spCost: 94000, mpCost: 0, power: 100 },
] as const;

export const SHIELD_MASTERY_HINT_UK =
  'Пасив: підвищує ефективність захисту щита при блоці (Shield Defence Rate). ' +
  '1 р. — 50%, 4 р. (52 лв) — 100%. Ранги 1–2 — Knight; 3–4 — Paladin / Dark Avenger / Temple / Shillien Knight. ' +
  'Працює лише з екіпованим щитом.';

export function shieldMasteryDefenceRatePctAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SHIELD_MASTERY_MAX_RANK, Math.floor(rank)));
  return SHIELD_DEFENCE_RATE_PCT_BY_RANK[r] ?? 0;
}

export function shieldMasteryRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const row = SHIELD_MASTERY_LEVEL_ROWS[r - 1];
  return row?.requiredLevel;
}

export function shieldMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const row = SHIELD_MASTERY_LEVEL_ROWS[r - 1];
  return row?.spCost;
}

/** 1-ша профа лицаря — лише 2 ранги (Interlude). */
export function shieldMasteryMaxRankForMappedProfession(
  mappedHumanProf: string
): number {
  const p = String(mappedHumanProf || '').trim();
  if (p === 'human_paladin' || p === 'human_dark_avenger') {
    return SHIELD_MASTERY_MAX_RANK;
  }
  return Math.min(SHIELD_MASTERY_MAX_RANK, 2);
}

export function shieldMasteryStatsNoteUk(rank: number): string {
  const pct = shieldMasteryDefenceRatePctAtRank(rank);
  const lv = Math.max(1, Math.min(SHIELD_MASTERY_MAX_RANK, Math.floor(rank)));
  if (pct <= 0) return SHIELD_MASTERY_HINT_UK;
  const reqLv = SHIELD_MASTERY_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (з ${reqLv} лв персонажа)` : '';
  return (
    `Shield Defence Rate ${pct}% при блоці — ефективніший захист щита на р. ${lv} скіла${reqPart}. ` +
    'Працює лише з екіпованим щитом. MP у бою не витрачається.'
  );
}
