/**
 * Focus Mind (skill 191) — Human Knight → Dark Avenger.
 * Пасив: flat +MP/тік до природної регенерації MP.
 */
export const FOCUS_MIND_L2_SKILL_ID = 191;
export const FOCUS_MIND_BATTLE_ID = 'l2_191';
export const FOCUS_MIND_MAX_RANK = 6;

export const FOCUS_MIND_MP_REGEN_FLAT_BY_RANK = [
  0, 1.1, 1.5, 1.9, 2.3, 2.7, 3.1,
] as const;

export const FOCUS_MIND_LEVEL_ROWS = [
  { level: 1, requiredLevel: 36, spCost: 39_000, mpRegenFlat: 1.1 },
  { level: 2, requiredLevel: 43, spCost: 38_000, mpRegenFlat: 1.5 },
  { level: 3, requiredLevel: 49, spCost: 70_000, mpRegenFlat: 1.9 },
  { level: 4, requiredLevel: 55, spCost: 170_000, mpRegenFlat: 2.3 },
  { level: 5, requiredLevel: 64, spCost: 370_000, mpRegenFlat: 2.7 },
  { level: 6, requiredLevel: 72, spCost: 1_200_000, mpRegenFlat: 3.1 },
] as const;

export const FOCUS_MIND_HINT_UK =
  'Пасивний скіл: прискорює природне відновлення MP (+MP/тік за рангом). ' +
  'MP у бою не витрачає. Гілка Human Knight → Dark Avenger. ' +
  '6 р. — 36–72 лв (макс. ранг на 72 лв).';

export function focusMindMpRegenFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(FOCUS_MIND_MAX_RANK, Math.floor(rank)));
  return FOCUS_MIND_MP_REGEN_FLAT_BY_RANK[r] ?? 0;
}

export function focusMindRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return FOCUS_MIND_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function focusMindSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = FOCUS_MIND_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function focusMindStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(FOCUS_MIND_MAX_RANK, Math.floor(rank)));
  const flat = focusMindMpRegenFlatAtRank(r);
  const reqLv = FOCUS_MIND_LEVEL_ROWS[r - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (макс. на ${reqLv} лв)` : '';
  return (
    '+' +
    flat.toFixed(1) +
    ' MP/тік на р. ' +
    r +
    reqPart +
    '. Пасив — MP у бою не витрачається.'
  );
}
