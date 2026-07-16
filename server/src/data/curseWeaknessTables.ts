/**
 * Curse: Weakness (1164) — Human Mystic 1, Wizard 2–5, Necromancer 6–19 (Interlude).
 */
export const CURSE_WEAKNESS_L2_SKILL_ID = 1164;
export const CURSE_WEAKNESS_BATTLE_ID = 'l2_1164';
export const CURSE_WEAKNESS_MAX_RANK = 19;
export const CURSE_WEAKNESS_MYSTIC_MAX_RANK = 1;
export const CURSE_WEAKNESS_WIZARD_MAX_RANK = 5;
export const CURSE_WEAKNESS_RANGE = 600;
export const CURSE_WEAKNESS_CAST_SEC = 1.5;
export const CURSE_WEAKNESS_REUSE_SEC = 8;
export const CURSE_WEAKNESS_LAND_CHANCE = 0.8;

/** Множник P.Atk моба після дебафа (індекс = ранг). */
export const CURSE_WEAKNESS_PATK_MUL_BY_RANK = [
  0, 0.83, 0.8, 0.8, 0.8, 0.8, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
  0.77, 0.77, 0.77, 0.77, 0.77, 0.77,
] as const;

/** Тривалість дебафа, сек (індекс = ранг). */
export const CURSE_WEAKNESS_DURATION_SEC_BY_RANK = [
  0, 5, 10, 10, 10, 10, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15,
] as const;

export const CURSE_WEAKNESS_LEVEL_ROWS = [
  { level: 1, requiredLevel: 14, spCost: 2100, mpCost: 3, patkCutPct: 17, durationSec: 5 },
  { level: 2, requiredLevel: 20, spCost: 2900, mpCost: 10, patkCutPct: 20, durationSec: 10 },
  { level: 3, requiredLevel: 25, spCost: 5500, mpCost: 12, patkCutPct: 20, durationSec: 10 },
  { level: 4, requiredLevel: 30, spCost: 11000, mpCost: 14, patkCutPct: 20, durationSec: 10 },
  { level: 5, requiredLevel: 35, spCost: 18000, mpCost: 15, patkCutPct: 20, durationSec: 10 },
  { level: 6, requiredLevel: 40, spCost: 32000, mpCost: 35, patkCutPct: 23, durationSec: 15 },
  { level: 7, requiredLevel: 44, spCost: 35000, mpCost: 39, patkCutPct: 23, durationSec: 15 },
  { level: 8, requiredLevel: 48, spCost: 55000, mpCost: 44, patkCutPct: 23, durationSec: 15 },
  { level: 9, requiredLevel: 52, spCost: 78000, mpCost: 48, patkCutPct: 23, durationSec: 15 },
  { level: 10, requiredLevel: 56, spCost: 83000, mpCost: 52, patkCutPct: 23, durationSec: 15 },
  { level: 11, requiredLevel: 58, spCost: 100000, mpCost: 54, patkCutPct: 23, durationSec: 15 },
  { level: 12, requiredLevel: 60, spCost: 130000, mpCost: 55, patkCutPct: 23, durationSec: 15 },
  { level: 13, requiredLevel: 62, spCost: 180000, mpCost: 58, patkCutPct: 23, durationSec: 15 },
  { level: 14, requiredLevel: 64, spCost: 200000, mpCost: 60, patkCutPct: 23, durationSec: 15 },
  { level: 15, requiredLevel: 66, spCost: 300000, mpCost: 62, patkCutPct: 23, durationSec: 15 },
  { level: 16, requiredLevel: 68, spCost: 330000, mpCost: 64, patkCutPct: 23, durationSec: 15 },
  { level: 17, requiredLevel: 70, spCost: 410000, mpCost: 65, patkCutPct: 23, durationSec: 15 },
  { level: 18, requiredLevel: 72, spCost: 610000, mpCost: 67, patkCutPct: 23, durationSec: 15 },
  { level: 19, requiredLevel: 74, spCost: 920000, mpCost: 69, patkCutPct: 23, durationSec: 15 },
] as const;

export const CURSE_WEAKNESS_HINT_UK =
  'Дебаф P.Atk ворога без урону. Дальність 600, каст 1,5 с, відкат 8 с. Mystic 1 р., Wizard 2–5 р., Necromancer 6–19 р.';

const HUMAN_CURSE_WEAKNESS_NECROMANCER_PROFESSIONS = new Set([
  'human_necromancer',
  'human_soultaker',
]);

function clampRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(CURSE_WEAKNESS_MAX_RANK, r);
}

export function isCurseWeaknessCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === CURSE_WEAKNESS_L2_SKILL_ID;
}

export function curseWeaknessPatkMulAtRank(rank: number): number {
  const r = clampRank(rank);
  if (r <= 0) return 1;
  return CURSE_WEAKNESS_PATK_MUL_BY_RANK[r] ?? 1;
}

export function curseWeaknessDurationSecAtRank(rank: number): number {
  const r = clampRank(rank);
  if (r <= 0) return 0;
  return CURSE_WEAKNESS_DURATION_SEC_BY_RANK[r] ?? 0;
}

export function curseWeaknessRequiredLevelAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return CURSE_WEAKNESS_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function curseWeaknessSpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return CURSE_WEAKNESS_LEVEL_ROWS[r - 1]?.spCost;
}

export function curseWeaknessMpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return CURSE_WEAKNESS_LEVEL_ROWS[r - 1]?.mpCost;
}

export function curseWeaknessPatkCutPctAtRank(rank: number): number {
  const r = clampRank(rank);
  if (r <= 0) return 0;
  return CURSE_WEAKNESS_LEVEL_ROWS[r - 1]?.patkCutPct ?? 0;
}

/** Human Mystic: 1; Wizard: 2–5; Necromancer-гілка: 6–19. */
export function humanCurseWeaknessAllowsSkillRank(
  l2Profession: string,
  targetRank: number
): boolean {
  const p = String(l2Profession || '').trim();
  const r = Math.max(1, Math.floor(targetRank));
  if (p === 'human_mage') return r === 1;
  if (p === 'human_wizard') {
    return r >= 2 && r <= CURSE_WEAKNESS_WIZARD_MAX_RANK;
  }
  if (HUMAN_CURSE_WEAKNESS_NECROMANCER_PROFESSIONS.has(p)) {
    return r >= CURSE_WEAKNESS_WIZARD_MAX_RANK + 1 && r <= CURSE_WEAKNESS_MAX_RANK;
  }
  return false;
}

export function curseWeaknessStatsNoteUk(rank: number): string {
  const r = clampRank(rank);
  if (r <= 0) return CURSE_WEAKNESS_HINT_UK;
  const cut = curseWeaknessPatkCutPctAtRank(r);
  const dur = curseWeaknessDurationSecAtRank(r);
  const mp = curseWeaknessMpCostAtRank(r) ?? 0;
  return (
    `−${cut}% P.Atk моба, ${dur} с. MP ${mp}, дальність ${CURSE_WEAKNESS_RANGE}. ` +
    `80% шанс (WIT цілі), каст ${CURSE_WEAKNESS_CAST_SEC} с, відкат ${CURSE_WEAKNESS_REUSE_SEC} с.`
  );
}

export function curseWeaknessDebuffExpiresAtMs(rank: number, nowMs: number): number | undefined {
  const sec = curseWeaknessDurationSecAtRank(rank);
  if (sec <= 0) return undefined;
  return nowMs + Math.floor(sec * 1000);
}
