/**
 * Anti Magic (skill 146) — flat +M.Def, Human Mystic → Wizard → Sorcerer (Interlude).
 * Ранги 1–4: human_mage; 5–12: human_wizard; 13–45: 2-га/3-тя профа wizard-гілки.
 */
export const ANTI_MAGIC_L2_SKILL_ID = 146;
export const ANTI_MAGIC_BATTLE_ID = 'l2_146';
export const ANTI_MAGIC_MAX_RANK = 45;

/** Flat +M.Def за рангом скіла (індекс = ранг). */
export const ANTI_MAGIC_MDEF_FLAT_BY_RANK = [
  0, 10, 12, 14, 16, 18, 20, 23, 25, 28, 30, 34, 36, 40, 42, 43, 46, 47, 49,
  52, 54, 56, 59, 61, 63, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 91,
  93, 95, 97, 99, 102, 104, 106, 108,
] as const;

export const ANTI_MAGIC_LEVEL_ROWS = [
  { level: 1, requiredLevel: 7, spCost: 240 },
  { level: 2, requiredLevel: 7, spCost: 240 },
  { level: 3, requiredLevel: 14, spCost: 1100 },
  { level: 4, requiredLevel: 14, spCost: 1100 },
  { level: 5, requiredLevel: 20, spCost: 1400 },
  { level: 6, requiredLevel: 20, spCost: 1400 },
  { level: 7, requiredLevel: 25, spCost: 2800 },
  { level: 8, requiredLevel: 25, spCost: 2800 },
  { level: 9, requiredLevel: 30, spCost: 5300 },
  { level: 10, requiredLevel: 30, spCost: 5300 },
  { level: 11, requiredLevel: 35, spCost: 8800 },
  { level: 12, requiredLevel: 35, spCost: 8800 },
  { level: 13, requiredLevel: 40, spCost: 11000 },
  { level: 14, requiredLevel: 40, spCost: 11000 },
  { level: 15, requiredLevel: 40, spCost: 11000 },
  { level: 16, requiredLevel: 44, spCost: 15000 },
  { level: 17, requiredLevel: 44, spCost: 15000 },
  { level: 18, requiredLevel: 44, spCost: 15000 },
  { level: 19, requiredLevel: 48, spCost: 22000 },
  { level: 20, requiredLevel: 48, spCost: 22000 },
  { level: 21, requiredLevel: 48, spCost: 22000 },
  { level: 22, requiredLevel: 52, spCost: 35000 },
  { level: 23, requiredLevel: 52, spCost: 35000 },
  { level: 24, requiredLevel: 52, spCost: 35000 },
  { level: 25, requiredLevel: 56, spCost: 38000 },
  { level: 26, requiredLevel: 56, spCost: 38000 },
  { level: 27, requiredLevel: 56, spCost: 38000 },
  { level: 28, requiredLevel: 58, spCost: 73000 },
  { level: 29, requiredLevel: 58, spCost: 73000 },
  { level: 30, requiredLevel: 60, spCost: 88000 },
  { level: 31, requiredLevel: 60, spCost: 88000 },
  { level: 32, requiredLevel: 62, spCost: 130000 },
  { level: 33, requiredLevel: 62, spCost: 130000 },
  { level: 34, requiredLevel: 64, spCost: 150000 },
  { level: 35, requiredLevel: 64, spCost: 150000 },
  { level: 36, requiredLevel: 66, spCost: 210000 },
  { level: 37, requiredLevel: 66, spCost: 210000 },
  { level: 38, requiredLevel: 68, spCost: 210000 },
  { level: 39, requiredLevel: 68, spCost: 210000 },
  { level: 40, requiredLevel: 70, spCost: 290000 },
  { level: 41, requiredLevel: 70, spCost: 290000 },
  { level: 42, requiredLevel: 72, spCost: 470000 },
  { level: 43, requiredLevel: 72, spCost: 470000 },
  { level: 44, requiredLevel: 74, spCost: 640000 },
  { level: 45, requiredLevel: 74, spCost: 640000 },
] as const;

export const ANTI_MAGIC_HINT_UK =
  'Пасив: +M.Def (flat). 1–4 р. — Human Mystic; 5–12 — Wizard; 13–45 — Sorcerer.';

const HUMAN_SORCERER_TIER_PROFESSIONS = new Set([
  'human_sorcerer',
  'human_archmage',
  'human_necromancer',
  'human_soultaker',
  'human_warlock',
  'human_arcana_lord',
]);

export function isAntiMagicCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === ANTI_MAGIC_L2_SKILL_ID;
}

export function antiMagicMdefFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(ANTI_MAGIC_MAX_RANK, Math.floor(rank)));
  return ANTI_MAGIC_MDEF_FLAT_BY_RANK[r] ?? 0;
}

export function antiMagicRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(ANTI_MAGIC_MAX_RANK, Math.floor(rank)));
  return ANTI_MAGIC_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function antiMagicSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(ANTI_MAGIC_MAX_RANK, Math.floor(rank)));
  return ANTI_MAGIC_LEVEL_ROWS[r - 1]?.spCost;
}

/** Макс. ранг, який професія може вивчити (human wizard-гілка). */
export function antiMagicMaxLearnRankForProfession(l2Profession: string): number {
  const p = String(l2Profession || '').trim();
  if (p === 'human_mage') return 4;
  if (p === 'human_wizard') return 12;
  if (HUMAN_SORCERER_TIER_PROFESSIONS.has(p)) return ANTI_MAGIC_MAX_RANK;
  return ANTI_MAGIC_MAX_RANK;
}

export function antiMagicAllowsSkillRank(
  l2Profession: string,
  targetRank: number
): boolean {
  const r = Math.max(1, Math.floor(targetRank));
  return r <= antiMagicMaxLearnRankForProfession(l2Profession);
}

export function antiMagicStatsNoteUk(rank: number): string {
  const flat = antiMagicMdefFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) return ANTI_MAGIC_HINT_UK;
  return `+${flat} M.Def (flat) на рівні ${lv} скіла.`;
}
