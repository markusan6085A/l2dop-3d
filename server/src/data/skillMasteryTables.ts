/**
 * Skill Mastery (skill 330) — пасив 3-ї профи (Dreadnought, Duelist, Sagittarius).
 * Шанс миттєво скинути reuse скіла або подвоїти тривалість бафа/дебафа.
 */
export const SKILL_MASTERY_L2_SKILL_ID = 330;
export const SKILL_MASTERY_BATTLE_ID = 'l2_330';
export const SKILL_MASTERY_MAX_RANK = 1;

export const SKILL_MASTERY_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 77,
    spCost: 20_000_000,
  },
] as const;

/** Dreadnought / Duelist — спрощений фіксований шанс (як у попередній реалізації). */
export const SKILL_MASTERY_MELEE_CD_RESET_CHANCE = 0.08;
export const SKILL_MASTERY_MELEE_DURATION_CHANCE = 0.08;

/** L2 Interlude: STRbonus[i] = floor(pow(1.036, i - 34.845) * 100 + 0.5) / 100 */
const STR_COMPUTE_BASE = 1.036;
const STR_COMPUTE_OFFSET = 34.845;
const STR_BONUS_TABLE_LEN = 120;

const STR_BONUS_TABLE: number[] = (() => {
  const out: number[] = [];
  for (let i = 0; i < STR_BONUS_TABLE_LEN; i++) {
    out.push(
      Math.floor(
        Math.pow(STR_COMPUTE_BASE, i - STR_COMPUTE_OFFSET) * 100 + 0.5
      ) / 100
    );
  }
  return out;
})();

export function skillMasteryStrBonus(str: number): number {
  const idx = Math.max(0, Math.min(STR_BONUS_TABLE_LEN - 1, Math.floor(str)));
  return STR_BONUS_TABLE[idx] ?? 1;
}

/** Базове значення stat SKILL_MASTERY для 1 рангу (як у L2 passive). */
export function skillMasteryBaseValAtRank(rank: number): number {
  const r = Math.max(1, Math.min(SKILL_MASTERY_MAX_RANK, Math.floor(rank)));
  return r >= 1 ? 1 : 0;
}

/** Шанс proc (%), Sagittarius: baseVal * STRbonus[STR], порівняння з Rnd(0..99). */
export function skillMasteryProcChancePct(str: number, rank: number): number {
  const base = skillMasteryBaseValAtRank(rank);
  if (base <= 0) return 0;
  return Math.min(100, base * skillMasteryStrBonus(str));
}

export function skillMasteryRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return SKILL_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function skillMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = SKILL_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export const SKILL_MASTERY_HINT_UK =
  'Пасивний скіл: невеликий шанс при використанні будь-якого уміння ' +
  'миттєво скинути його відкат (reuse) або подвоїти тривалість бафа/дебафа. ' +
  'Шанс залежить від STR (Sagittarius). MP не витрачає. 77 лв, 1 р., Sagittarius. ' +
  'Макс. рівень — 1.';

export function skillMasteryStatsNoteUk(str?: number): string {
  const strPart =
    typeof str === 'number' && Number.isFinite(str) && str > 0
      ? '; шанс ~' + skillMasteryProcChancePct(str, 1).toFixed(1) + '% при STR ' + Math.floor(str)
      : '; шанс росте з STR';
  return (
    'Reuse reset або ×2 тривалість бафа/дебафа' +
    strPart +
    '. MP 0. 77 лв, Sagittarius.'
  );
}
