/**
 * Armor Mastery (skill 244) — flat +P.Def, лише стартова профа mystic (Human Mystic тощо).
 * Після 1-ї зміни професії не вивчається далі (окремі майстерності броні).
 */
export const MYSTIC_ARMOR_MASTERY_L2_SKILL_ID = 244;
export const MYSTIC_ARMOR_MASTERY_BATTLE_ID = 'l2_244';
export const MYSTIC_ARMOR_MASTERY_MAX_RANK = 3;

/** Flat +P.Def за рангом скіла (індекс = ранг). */
export const MYSTIC_ARMOR_MASTERY_PDEF_FLAT_BY_RANK = [0, 6.7, 8, 9.2] as const;

export const MYSTIC_ARMOR_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 7, spCost: 470 },
  { level: 2, requiredLevel: 14, spCost: 1100 },
  { level: 3, requiredLevel: 14, spCost: 1100 },
] as const;

export const MYSTIC_ARMOR_MASTERY_HINT_UK =
  'Пасив: +P.Def (flat), незалежно від типу броні. Лише Human Mystic (макс. 3 р.).';

/** Стартові mystic-профи, що вивчають Armor Mastery (1 ранг = base mage). */
const MYSTIC_ARMOR_MASTERY_LEARN_PROFESSIONS = new Set([
  'human_mage',
  'elf_mage',
  'dark_elf_mage',
]);

export function isMysticArmorMasteryCatalogSkill(l2SkillId: number): boolean {
  return l2SkillId === MYSTIC_ARMOR_MASTERY_L2_SKILL_ID;
}

export function mysticArmorMasteryPdefFlatAtRank(rank: number): number {
  const r = Math.max(1, Math.min(MYSTIC_ARMOR_MASTERY_MAX_RANK, Math.floor(rank)));
  return MYSTIC_ARMOR_MASTERY_PDEF_FLAT_BY_RANK[r] ?? 0;
}

export function mysticArmorMasteryRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = Math.max(1, Math.min(MYSTIC_ARMOR_MASTERY_MAX_RANK, Math.floor(rank)));
  return MYSTIC_ARMOR_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function mysticArmorMasterySpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(MYSTIC_ARMOR_MASTERY_MAX_RANK, Math.floor(rank)));
  return MYSTIC_ARMOR_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
}

export function mysticArmorMasteryMaxLearnRankForProfession(
  l2Profession: string
): number {
  const p = String(l2Profession || '').trim();
  if (MYSTIC_ARMOR_MASTERY_LEARN_PROFESSIONS.has(p)) {
    return MYSTIC_ARMOR_MASTERY_MAX_RANK;
  }
  return 0;
}

export function mysticArmorMasteryAllowsSkillRank(
  l2Profession: string,
  targetRank: number
): boolean {
  const r = Math.max(1, Math.floor(targetRank));
  return r <= mysticArmorMasteryMaxLearnRankForProfession(l2Profession);
}

export function mysticArmorMasteryStatsNoteUk(rank: number): string {
  const flat = mysticArmorMasteryPdefFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) return MYSTIC_ARMOR_MASTERY_HINT_UK;
  const flatText = Number.isInteger(flat) ? String(flat) : flat.toFixed(1);
  return `+${flatText} P.Def (flat) на рівні ${lv} скіла.`;
}
