import { HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ } from './l2dopHumanFighterBattleSkills.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { raceFighterCatalogEntryVisibleForProfession } from './raceFighterSkillCatalog.professionRules.js';

const BASE_FIGHTER_PROFS = new Set([
  'human_fighter',
  'elf_fighter',
  'dark_elf_fighter',
  'orc_fighter',
  'dwarf_fighter',
]);

export function raceFighterCatalogEntryOfferedAtGludioMagister(
  entry: HumanMysticSkillCatalogEntry,
  l2Profession: string
): boolean {
  if (!raceFighterCatalogEntryVisibleForProfession(entry, l2Profession)) {
    return false;
  }
  const p = String(l2Profession || '').trim();
  if (!HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ && BASE_FIGHTER_PROFS.has(p)) {
    if (entry.hideAtBaseFighterUntilFirstProf) return false;
  }
  return true;
}
