/**
 * Battle Heal (1015) — Human Mystic ранги 1–3; cleric-гілка продовжує з 4-го.
 */
export const BATTLE_HEAL_L2_SKILL_ID = 1015;
export const BATTLE_HEAL_BATTLE_ID = 'l2_1015';
export const BATTLE_HEAL_STARTER_MAX_RANK = 3;
export const BATTLE_HEAL_RANGE = 600;
export const BATTLE_HEAL_CAST_SEC = 2;
export const BATTLE_HEAL_REUSE_SEC = 3;

/** Flat power лікування (індекс = ранг). */
export const BATTLE_HEAL_HEAL_POWER_BY_RANK = [0, 83, 95, 107] as const;

export const BATTLE_HEAL_STARTER_LEVEL_ROWS = [
  { level: 1, requiredLevel: 14, spCost: 700, mpCost: 25 },
  { level: 2, requiredLevel: 14, spCost: 700, mpCost: 28 },
  { level: 3, requiredLevel: 14, spCost: 700, mpCost: 32 },
] as const;

export const BATTLE_HEAL_STARTER_HINT_UK =
  'Швидке зцілення себе або союзника на дистанції до 600. Каст 2 с, відкат 3 с. Human Mystic — макс. 3 р.';

const HUMAN_BATTLE_HEAL_CLERIC_PROFESSIONS = new Set([
  'human_cleric',
  'human_bishop',
  'human_prophet',
  'human_cardinal',
  'human_hierophant',
]);

function clampStarterRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(BATTLE_HEAL_STARTER_MAX_RANK, r);
}

export function isBattleHealCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === BATTLE_HEAL_L2_SKILL_ID;
}

export function isBattleHealStarterRank(rank: number): boolean {
  const r = Math.floor(rank);
  return r >= 1 && r <= BATTLE_HEAL_STARTER_MAX_RANK;
}

export function battleHealPowerAtRank(rank: number): number {
  const r = clampStarterRank(rank);
  if (r <= 0) return 0;
  return BATTLE_HEAL_HEAL_POWER_BY_RANK[r] ?? 0;
}

export function battleHealStarterRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = clampStarterRank(rank);
  if (r <= 0) return undefined;
  return BATTLE_HEAL_STARTER_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function battleHealStarterSpCostAtRank(rank: number): number | undefined {
  const r = clampStarterRank(rank);
  if (r <= 0) return undefined;
  return BATTLE_HEAL_STARTER_LEVEL_ROWS[r - 1]?.spCost;
}

export function battleHealStarterMpCostAtRank(rank: number): number | undefined {
  const r = clampStarterRank(rank);
  if (r <= 0) return undefined;
  return BATTLE_HEAL_STARTER_LEVEL_ROWS[r - 1]?.mpCost;
}

/** Human Mystic: 1–3; cleric-гілка: 4+ (+ catch-up 1–3 на cleric). */
export function humanBattleHealAllowsSkillRank(
  l2Profession: string,
  targetRank: number,
  currentSkillLevel = 0
): boolean {
  const p = String(l2Profession || '').trim();
  const r = Math.max(1, Math.floor(targetRank));
  const cur = Math.max(0, Math.floor(currentSkillLevel));
  if (p === 'human_mage') {
    return r >= 1 && r <= BATTLE_HEAL_STARTER_MAX_RANK;
  }
  if (HUMAN_BATTLE_HEAL_CLERIC_PROFESSIONS.has(p)) {
    if (cur < BATTLE_HEAL_STARTER_MAX_RANK) {
      return r >= 1 && r <= BATTLE_HEAL_STARTER_MAX_RANK;
    }
    return r >= 4;
  }
  return false;
}

export function battleHealStarterStatsNoteUk(rank: number): string {
  const r = clampStarterRank(rank);
  if (r <= 0) return BATTLE_HEAL_STARTER_HINT_UK;
  const power = battleHealPowerAtRank(r);
  const mp = battleHealStarterMpCostAtRank(r) ?? 0;
  return (
    `+${power} HP (power), MP ${mp}. Дальність ${BATTLE_HEAL_RANGE}, ` +
    `каст ${BATTLE_HEAL_CAST_SEC} с, відкат ${BATTLE_HEAL_REUSE_SEC} с.`
  );
}
