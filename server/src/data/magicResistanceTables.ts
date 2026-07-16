/**
 * Magic Resistance (skill 147) — flat +M.Def за рангом (Interlude, усі раси з цим скілом).
 * Ранги 1–14 — Human Knight (text-rpg); 15–51 — спільна таблиця (Elf/Dark/Orc каталоги).
 */
export const MAGIC_RESISTANCE_MDEF_FLAT_BY_RANK = [
  0, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 35, 36, 37, 40, 42, 43, 44,
  46, 47, 49, 51, 52, 54, 56, 57, 59, 61, 63, 64, 66, 68, 70, 72, 74, 76, 78,
  80, 82, 84, 86, 88, 91, 93, 95, 97, 99, 102, 104, 106, 108,
] as const;

export const MAGIC_RESISTANCE_MAX_RANK =
  MAGIC_RESISTANCE_MDEF_FLAT_BY_RANK.length - 1;

export const MAGIC_RESISTANCE_HINT_UK =
  'Пасив: +M.Def (flat). 1 р. — +19, 51 р. (74 лв) — +108. Knight / Paladin / Dark Avenger та Elf/Dark Elf лицарі.';

export function magicResistanceMdefFlatAtRank(rank: number): number {
  const r = Math.max(
    1,
    Math.min(MAGIC_RESISTANCE_MAX_RANK, Math.floor(rank))
  );
  return MAGIC_RESISTANCE_MDEF_FLAT_BY_RANK[r] ?? 0;
}

export function magicResistanceStatsNoteUk(rank: number): string {
  const flat = magicResistanceMdefFlatAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (flat <= 0) return MAGIC_RESISTANCE_HINT_UK;
  return `+${flat} M.Def (flat) на рівні ${lv} скіла.`;
}
