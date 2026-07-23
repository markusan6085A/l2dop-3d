/**
 * Доступ до crafted-крафту: професії гнома + рівень Create Item.
 */
import { normalizeLearnedSkillsJson } from '../data/humanFighterSkillCatalog.learnedRanks.js';

export const CREATE_ITEM_BATTLE_ID = 'l2_172';

const CRAFTER_PROFESSIONS = new Set([
  'dwarf_artisan',
  'dwarf_warsmith',
  'dwarf_maestro',
]);

/** Artisan / Warsmith / Maestro — фактичні l2Profession у проєкті. */
export function isDwarfCrafterProfession(
  l2Profession: string | null | undefined,
): boolean {
  const p = String(l2Profession ?? '')
    .trim()
    .toLowerCase();
  return CRAFTER_PROFESSIONS.has(p);
}

function learnedCreateItemRank(skillsLearnedJson: unknown): number {
  const learned = normalizeLearnedSkillsJson(skillsLearnedJson);
  for (const row of learned) {
    if (row.battleId === CREATE_ITEM_BATTLE_ID) {
      return Math.max(0, Math.floor(row.level));
    }
  }
  return 0;
}

/**
 * Ефективний рівень Create Item для crafted-рецептів.
 * Скіл l2_172 у каталозі має лише rank 1; tier 2/4 — від професії крафтера.
 */
export function resolveCreateItemLevel(input: {
  l2Profession?: string | null;
  skillsLearnedJson?: unknown;
}): number {
  if (!isDwarfCrafterProfession(input.l2Profession)) return 0;
  if (learnedCreateItemRank(input.skillsLearnedJson) < 1) return 0;
  const prof = String(input.l2Profession).trim().toLowerCase();
  if (prof === 'dwarf_maestro' || prof === 'dwarf_warsmith') return 4;
  if (prof === 'dwarf_artisan') return 2;
  return 0;
}

export function crafterProfessionLabelUk(): string {
  return 'Artisan, Warsmith і Maestro';
}
