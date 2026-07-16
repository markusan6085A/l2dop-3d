/**
 * Weapon Mastery (249) — старт Human Mystic: ранги 1–2, flat + % P.Atk і M.Atk.
 * Ранги 3+ — wizard/cleric-гілки (окремі таблиці / weaponMasteryTables).
 */
import type { L2dopCombatBuffModifiers } from './l2dopCombatBuffModifiers.js';
import { WEAPON_MASTERY_L2_SKILL_ID_MYSTIC } from './weaponMasteryTables.js';

export const MYSTIC_STARTER_WEAPON_MASTERY_L2_SKILL_ID =
  WEAPON_MASTERY_L2_SKILL_ID_MYSTIC;
export const MYSTIC_STARTER_WEAPON_MASTERY_BATTLE_ID = 'l2_249';
export const MYSTIC_STARTER_WEAPON_MASTERY_MAX_RANK = 2;

/** Flat +P.Atk (індекс = ранг). */
export const MYSTIC_STARTER_WEAPON_MASTERY_PATK_FLAT_BY_RANK = [
  0, 1.5, 2.8,
] as const;

/** Множник P.Atk (+45% → 1.45). */
export const MYSTIC_STARTER_WEAPON_MASTERY_PATK_MUL_BY_RANK = [
  0, 1.45, 1.45,
] as const;

/** Flat +M.Atk (індекс = ранг). */
export const MYSTIC_STARTER_WEAPON_MASTERY_MATK_FLAT_BY_RANK = [
  0, 1.9, 3.5,
] as const;

/** Множник M.Atk (+17% → 1.17). */
export const MYSTIC_STARTER_WEAPON_MASTERY_MATK_MUL_BY_RANK = [
  0, 1.17, 1.17,
] as const;

export const MYSTIC_STARTER_WEAPON_MASTERY_LEVEL_ROWS = [
  { level: 1, requiredLevel: 7, spCost: 470 },
  { level: 2, requiredLevel: 14, spCost: 2100 },
] as const;

export const MYSTIC_STARTER_WEAPON_MASTERY_HINT_UK =
  'Пасив: +P.Atk і +M.Atk (flat і %), незалежно від зброї. Human Mystic — макс. 2 р.';

const HUMAN_MYSTIC_WM_EXTENDED_PROFESSIONS = new Set([
  'human_wizard',
  'human_cleric',
  'human_sorcerer',
  'human_necromancer',
  'human_warlock',
  'human_bishop',
  'human_prophet',
  'human_archmage',
  'human_soultaker',
  'human_arcana_lord',
  'human_cardinal',
  'human_hierophant',
]);

function clampStarterRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(MYSTIC_STARTER_WEAPON_MASTERY_MAX_RANK, r);
}

function formatBonus(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function isMysticStarterWeaponMasterySkill(l2SkillId: number): boolean {
  return l2SkillId === MYSTIC_STARTER_WEAPON_MASTERY_L2_SKILL_ID;
}

export function isMysticStarterWeaponMasteryRank(rank: number): boolean {
  const r = Math.floor(rank);
  return r >= 1 && r <= MYSTIC_STARTER_WEAPON_MASTERY_MAX_RANK;
}

export function mysticStarterWeaponMasteryRequiredLevelAtRank(
  rank: number
): number | undefined {
  const r = clampStarterRank(rank);
  if (r <= 0) return undefined;
  return MYSTIC_STARTER_WEAPON_MASTERY_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function mysticStarterWeaponMasterySpCostAtRank(
  rank: number
): number | undefined {
  const r = clampStarterRank(rank);
  if (r <= 0) return undefined;
  return MYSTIC_STARTER_WEAPON_MASTERY_LEVEL_ROWS[r - 1]?.spCost;
}

/** Human Mystic: 1–2; wizard/cleric-гілки: 3+. */
export function humanMysticWeaponMasteryAllowsSkillRank(
  l2Profession: string,
  targetRank: number
): boolean {
  const p = String(l2Profession || '').trim();
  const r = Math.max(1, Math.floor(targetRank));
  if (p === 'human_mage') {
    return r >= 1 && r <= MYSTIC_STARTER_WEAPON_MASTERY_MAX_RANK;
  }
  if (HUMAN_MYSTIC_WM_EXTENDED_PROFESSIONS.has(p)) return r >= 3;
  return false;
}

export function mysticStarterWeaponMasteryCombatDelta(
  rank: number
): Partial<L2dopCombatBuffModifiers> {
  const r = clampStarterRank(rank);
  if (r <= 0) return {};
  const addPatk = MYSTIC_STARTER_WEAPON_MASTERY_PATK_FLAT_BY_RANK[r] ?? 0;
  const buffPatk = MYSTIC_STARTER_WEAPON_MASTERY_PATK_MUL_BY_RANK[r] ?? 0;
  const addMatk = MYSTIC_STARTER_WEAPON_MASTERY_MATK_FLAT_BY_RANK[r] ?? 0;
  const buffMatk = MYSTIC_STARTER_WEAPON_MASTERY_MATK_MUL_BY_RANK[r] ?? 0;
  const out: Partial<L2dopCombatBuffModifiers> = {};
  if (addPatk > 0) out.addPatk = addPatk;
  if (buffPatk > 0) out.buffPatk = buffPatk;
  if (addMatk > 0) out.addMatk = addMatk;
  if (buffMatk > 0) out.buffMatk = buffMatk;
  return out;
}

export function mysticStarterWeaponMasteryStatsNoteUk(rank: number): string {
  const r = clampStarterRank(rank);
  if (r <= 0) return MYSTIC_STARTER_WEAPON_MASTERY_HINT_UK;
  const patkFlat = MYSTIC_STARTER_WEAPON_MASTERY_PATK_FLAT_BY_RANK[r] ?? 0;
  const matkFlat = MYSTIC_STARTER_WEAPON_MASTERY_MATK_FLAT_BY_RANK[r] ?? 0;
  return (
    `+${formatBonus(patkFlat)} і +45% P.Atk, +${formatBonus(matkFlat)} і +17% M.Atk ` +
    `на рівні ${r} скіла.`
  );
}
