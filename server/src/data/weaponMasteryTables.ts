/**
 * Weapon Mastery — flat P.Atk (воїни, skill 142) / M.Atk (маги, skill 249 або elf 142).
 * Індекс масиву = рівень скіла (1…40).
 */
export const WEAPON_MASTERY_L2_SKILL_ID_FIGHTER = 142;
export const WEAPON_MASTERY_L2_SKILL_ID_MYSTIC = 249;

/** Flat P.Atk на рівні скіла (Human Fighter та інші воїни). */
export const WEAPON_MASTERY_WARRIOR_PATK_BY_RANK: readonly number[] = [
  0,
  1.5, 2.8, 4.5, 5.7, 6.7, 11.6, 13.3, 16.0, 17.0, 18.1, 20.4, 21.6, 22.8, 25.5, 26.9, 28.3,
  31.4, 33.0, 34.6, 38.0, 39.8, 41.7, 43.5, 45.4, 47.4, 49.4, 51.4, 53.5, 55.6, 57.7, 59.8,
  62.0, 64.1, 66.3, 68.5, 70.7, 72.9, 75.2, 77.5, 79.4,
];

/** Flat M.Atk на рівні скіла (Human / Dark Elf mystic тощо). */
export const WEAPON_MASTERY_MAGE_MATK_BY_RANK: readonly number[] = [
  0,
  1.9, 3.5, 5.7, 7.2, 8.3, 14.6, 16.6, 20.0, 21.3, 22.6, 25.4, 26.9, 28.5, 31.8, 33.6, 35.4,
  39.2, 41.2, 43.2, 47.5, 49.8, 52.1, 54.4, 56.8, 59.2, 61.7, 64.3, 66.8, 69.4, 72.1, 74.8,
  77.4, 80.2, 82.9, 85.6, 88.4, 91.1, 94.0, 96.8, 99.3,
];

export const WEAPON_MASTERY_MAX_RANK = 40;

export const WEAPON_MASTERY_FIGHTER_HINT_UK =
  'Пасив: +P. Atk (flat) за рівнем скіла (1 р. — +1.5, 40 р. — +79.4).';

export const WEAPON_MASTERY_MYSTIC_HINT_UK =
  'Пасив: +M. Atk (flat) за рівнем скіла (1 р. — +1.9, 40 р. — +99.3).';

function formatWeaponMasteryBonus(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

/** Текст для магістра / UI: бонус на конкретному рівні скіла. */
export function weaponMasteryFighterStatsNoteUk(rank: number): string {
  const r = clampWeaponMasteryRank(rank);
  const v = weaponMasteryPatkAtRank(r);
  if (v <= 0) {
    return 'Пасив: підвищує P. Atk (flat). MP у бою не витрачається.';
  }
  return (
    'Пасив: +' +
    formatWeaponMasteryBonus(v) +
    ' P. Atk (flat) на рівні ' +
    r +
    ' скіла. MP у бою не витрачається.'
  );
}

export function weaponMasteryMysticStatsNoteUk(rank: number): string {
  const r = clampWeaponMasteryRank(rank);
  const v = weaponMasteryMatkAtRank(r);
  if (v <= 0) {
    return 'Пасив: підвищує M. Atk (flat). MP у бою не витрачається.';
  }
  return (
    'Пасив: +' +
    formatWeaponMasteryBonus(v) +
    ' M. Atk (flat) на рівні ' +
    r +
    ' скіла. MP у бою не витрачається.'
  );
}

function clampWeaponMasteryRank(rank: number): number {
  const r = Math.floor(rank);
  if (!Number.isFinite(r) || r < 1) return 0;
  return Math.min(WEAPON_MASTERY_MAX_RANK, r);
}

export function weaponMasteryPatkAtRank(rank: number): number {
  const r = clampWeaponMasteryRank(rank);
  if (r <= 0) return 0;
  return WEAPON_MASTERY_WARRIOR_PATK_BY_RANK[r] ?? 0;
}

export function weaponMasteryMatkAtRank(rank: number): number {
  const r = clampWeaponMasteryRank(rank);
  if (r <= 0) return 0;
  return WEAPON_MASTERY_MAGE_MATK_BY_RANK[r] ?? 0;
}

export function isMysticWeaponMasterySkill(args: {
  l2SkillId: number;
  nameUk?: string | null;
  effectStats?: readonly string[];
}): boolean {
  const id = args.l2SkillId;
  if (id === WEAPON_MASTERY_L2_SKILL_ID_FIGHTER) return true;
  if (id !== WEAPON_MASTERY_L2_SKILL_ID_MYSTIC) return false;
  const stats = args.effectStats ?? [];
  if (stats.some((s) => s === 'mAtk' || s === 'pAtk')) return true;
  const n = String(args.nameUk ?? '').toLowerCase();
  return n.includes('збро') || n.includes('weapon mastery');
}
