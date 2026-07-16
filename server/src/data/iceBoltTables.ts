/**
 * Ice Bolt (1184) — Human Mystic 1–4, Wizard 5–6 (Interlude).
 */
export const ICE_BOLT_L2_SKILL_ID = 1184;
export const ICE_BOLT_BATTLE_ID = 'l2_1184';
export const ICE_BOLT_MAX_RANK = 6;
export const ICE_BOLT_STARTER_MAX_RANK = 4;
export const ICE_BOLT_RANGE = 600;
export const ICE_BOLT_CAST_SEC = 3.1;
export const ICE_BOLT_REUSE_SEC = 8;
export const ICE_BOLT_SLOW_BASE_CHANCE = 0.6;
export const ICE_BOLT_SLOW_PCT = 30;
export const ICE_BOLT_SLOW_DURATION_SEC = 120;
/** Множник швидкості бігу моба (−30% → ×0.7). */
export const ICE_BOLT_RUN_SPEED_MUL = 0.7;

/** Flat power магічного bolt (індекс = ранг). */
export const ICE_BOLT_POWER_BY_RANK = [0, 8, 9, 11, 13, 14, 16] as const;

export const ICE_BOLT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 7, spCost: 240, mpCost: 9 },
  { level: 2, requiredLevel: 7, spCost: 240, mpCost: 10 },
  { level: 3, requiredLevel: 14, spCost: 1100, mpCost: 14 },
  { level: 4, requiredLevel: 14, spCost: 1100, mpCost: 15 },
  { level: 5, requiredLevel: 20, spCost: 1400, mpCost: 18 },
  { level: 6, requiredLevel: 20, spCost: 1400, mpCost: 20 },
] as const;

export const ICE_BOLT_HINT_UK =
  'Магічна атака водою. Дальність 600, каст 3,1 с, відкат 8 с. Mystic 1–4 р., Wizard 5–6 р.';

const HUMAN_ICE_BOLT_WIZARD_PROFESSIONS = new Set([
  'human_wizard',
  'human_sorcerer',
  'human_archmage',
  'human_necromancer',
  'human_soultaker',
  'human_warlock',
  'human_arcana_lord',
]);

function clampRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(ICE_BOLT_MAX_RANK, r);
}

export function isIceBoltCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === ICE_BOLT_L2_SKILL_ID;
}

export function iceBoltPowerAtRank(rank: number): number {
  const r = clampRank(rank);
  if (r <= 0) return 0;
  return ICE_BOLT_POWER_BY_RANK[r] ?? 0;
}

export function iceBoltRequiredLevelAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return ICE_BOLT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function iceBoltSpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return ICE_BOLT_LEVEL_ROWS[r - 1]?.spCost;
}

export function iceBoltMpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return ICE_BOLT_LEVEL_ROWS[r - 1]?.mpCost;
}

/** Human Mystic: 1–4; wizard-гілка: 5–6 (+ catch-up 1–4, якщо пропустили на mage). */
export function humanIceBoltAllowsSkillRank(
  l2Profession: string,
  targetRank: number,
  currentSkillLevel = 0
): boolean {
  const p = String(l2Profession || '').trim();
  const r = Math.max(1, Math.floor(targetRank));
  const cur = Math.max(0, Math.floor(currentSkillLevel));
  if (p === 'human_mage') {
    return r >= 1 && r <= ICE_BOLT_STARTER_MAX_RANK;
  }
  if (HUMAN_ICE_BOLT_WIZARD_PROFESSIONS.has(p)) {
    if (cur < ICE_BOLT_STARTER_MAX_RANK) {
      return r >= 1 && r <= ICE_BOLT_STARTER_MAX_RANK;
    }
    return r >= ICE_BOLT_STARTER_MAX_RANK + 1 && r <= ICE_BOLT_MAX_RANK;
  }
  return false;
}

export function iceBoltStatsNoteUk(rank: number): string {
  const r = clampRank(rank);
  if (r <= 0) return ICE_BOLT_HINT_UK;
  const power = iceBoltPowerAtRank(r);
  const mp = iceBoltMpCostAtRank(r) ?? 0;
  return (
    `Power ${power}, MP ${mp}. Дальність ${ICE_BOLT_RANGE}. ` +
    `60% сповільнення −${ICE_BOLT_SLOW_PCT}% на ${ICE_BOLT_SLOW_DURATION_SEC / 60} хв. ` +
    `Каст ${ICE_BOLT_CAST_SEC} с, відкат ${ICE_BOLT_REUSE_SEC} с.`
  );
}

export function iceBoltSlowDurationMs(): number {
  return ICE_BOLT_SLOW_DURATION_SEC * 1000;
}
