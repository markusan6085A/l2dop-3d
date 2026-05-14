/**
 * Фільтр `skillsLearnedJson` за професією: воїн (HF) або людина-містик (HM).
 */
import { isFighterClassBranch } from './l2dopHumanFighterBattleSkills.js';
import { isL2HumanRace, isMysticClassBranch } from './l2dopHumanMysticBattleSkills.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import { filterLearnedSkillEntriesForProfession } from './humanFighterSkillCatalog.professionRules.js';
import { filterLearnedMysticSkillEntriesForProfession } from './humanMysticSkillCatalog.learnedRanks.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { raceFighterCatalogEntryVisibleForProfession } from './raceFighterSkillCatalog.professionRules.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';

export function filterLearnedSkillEntriesForCharacter(
  entries: LearnedSkillEntry[],
  _race: string,
  classBranch: string,
  l2Profession: string
): LearnedSkillEntry[] {
  if (isMysticClassBranch(classBranch)) {
    return filterLearnedMysticSkillEntriesForProfession(
      entries,
      l2Profession,
      _race
    );
  }
  if (
    isFighterClassBranch(classBranch) &&
    !isL2HumanRace(_race)
  ) {
    const p = String(l2Profession || '').trim();
    return entries.filter((e) => {
      if (e.level < 1) return false;
      const cat = fighterCatalogEntryForRace(
        _race,
        classBranch,
        canonicalBattleSkillId(e.battleId)
      );
      if (!cat) return false;
      return raceFighterCatalogEntryVisibleForProfession(cat, p);
    });
  }
  return filterLearnedSkillEntriesForProfession(entries, l2Profession);
}
