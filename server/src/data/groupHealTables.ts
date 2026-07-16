/**
 * Group Heal (1027) — Human Mystic 1–3, Cleric 4–15 (Interlude).
 */
export const GROUP_HEAL_L2_SKILL_ID = 1027;
export const GROUP_HEAL_BATTLE_ID = 'l2_1027';
export const GROUP_HEAL_MAX_RANK = 15;
export const GROUP_HEAL_STARTER_MAX_RANK = 3;
export const GROUP_HEAL_RADIUS = 1000;
export const GROUP_HEAL_CAST_SEC = 7;
export const GROUP_HEAL_REUSE_SEC = 25;

/** Flat power лікування (індекс = ранг). */
export const GROUP_HEAL_HEAL_POWER_BY_RANK = [
  0, 66, 76, 86, 97, 108, 121, 141, 148, 156, 179, 188, 196, 222, 231, 241,
] as const;

export const GROUP_HEAL_LEVEL_ROWS = [
  { level: 1, requiredLevel: 14, spCost: 700, mpCost: 33 },
  { level: 2, requiredLevel: 14, spCost: 700, mpCost: 38 },
  { level: 3, requiredLevel: 14, spCost: 700, mpCost: 43 },
  { level: 4, requiredLevel: 20, spCost: 1100, mpCost: 48 },
  { level: 5, requiredLevel: 20, spCost: 1100, mpCost: 53 },
  { level: 6, requiredLevel: 20, spCost: 1100, mpCost: 59 },
  { level: 7, requiredLevel: 25, spCost: 2300, mpCost: 65 },
  { level: 8, requiredLevel: 25, spCost: 2300, mpCost: 69 },
  { level: 9, requiredLevel: 25, spCost: 2300, mpCost: 72 },
  { level: 10, requiredLevel: 30, spCost: 4400, mpCost: 83 },
  { level: 11, requiredLevel: 30, spCost: 4400, mpCost: 87 },
  { level: 12, requiredLevel: 30, spCost: 4400, mpCost: 88 },
  { level: 13, requiredLevel: 35, spCost: 7300, mpCost: 95 },
  { level: 14, requiredLevel: 35, spCost: 7300, mpCost: 99 },
  { level: 15, requiredLevel: 35, spCost: 7300, mpCost: 103 },
] as const;

export const GROUP_HEAL_HINT_UK =
  'Масове зцілення групи в радіусі 1000. Каст 7 с, відкат 25 с. Mystic 1–3 р., Cleric 4–15 р.';

const HUMAN_GROUP_HEAL_CLERIC_PROFESSIONS = new Set([
  'human_cleric',
  'human_bishop',
  'human_prophet',
  'human_cardinal',
  'human_hierophant',
]);

function clampRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(GROUP_HEAL_MAX_RANK, r);
}

export function isGroupHealCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === GROUP_HEAL_L2_SKILL_ID;
}

export function isGroupHealStarterRank(rank: number): boolean {
  const r = Math.floor(rank);
  return r >= 1 && r <= GROUP_HEAL_STARTER_MAX_RANK;
}

export function groupHealPowerAtRank(rank: number): number {
  const r = clampRank(rank);
  if (r <= 0) return 0;
  return GROUP_HEAL_HEAL_POWER_BY_RANK[r] ?? 0;
}

export function groupHealRequiredLevelAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return GROUP_HEAL_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function groupHealSpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return GROUP_HEAL_LEVEL_ROWS[r - 1]?.spCost;
}

export function groupHealMpCostAtRank(rank: number): number | undefined {
  const r = clampRank(rank);
  if (r <= 0) return undefined;
  return GROUP_HEAL_LEVEL_ROWS[r - 1]?.mpCost;
}

/** Human Mystic: 1–3; cleric-гілка: 4–15 (+ catch-up 1–3 на cleric). */
export function humanGroupHealAllowsSkillRank(
  l2Profession: string,
  targetRank: number,
  currentSkillLevel = 0
): boolean {
  const p = String(l2Profession || '').trim();
  const r = Math.max(1, Math.floor(targetRank));
  const cur = Math.max(0, Math.floor(currentSkillLevel));
  if (p === 'human_mage') {
    return r >= 1 && r <= GROUP_HEAL_STARTER_MAX_RANK;
  }
  if (HUMAN_GROUP_HEAL_CLERIC_PROFESSIONS.has(p)) {
    if (cur < GROUP_HEAL_STARTER_MAX_RANK) {
      return r >= 1 && r <= GROUP_HEAL_STARTER_MAX_RANK;
    }
    return r >= 4;
  }
  return false;
}

export function groupHealStatsNoteUk(rank: number): string {
  const r = clampRank(rank);
  if (r <= 0) return GROUP_HEAL_HINT_UK;
  const power = groupHealPowerAtRank(r);
  const mp = groupHealMpCostAtRank(r) ?? 0;
  return (
    `+${power} HP (power) собі та групі, радіус ${GROUP_HEAL_RADIUS}. MP ${mp}, ` +
    `каст ${GROUP_HEAL_CAST_SEC} с, відкат ${GROUP_HEAL_REUSE_SEC} с.`
  );
}
