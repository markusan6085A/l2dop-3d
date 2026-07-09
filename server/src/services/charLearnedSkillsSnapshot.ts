import { canonicalBattleSkillId } from '../data/humanFighterSkillCatalog.legacyIds.js';
import type { LearnedSkillEntry } from '../data/humanFighterSkillCatalog.types.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';
import {
  MYSTIC_SPELLCRAFT_L2_SKILL_ID,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { mysticCatalogEntryForRace } from '../data/mysticSkillCatalog.byRace.js';
import { maxMysticSkillRankForBattleId } from '../data/humanMysticSkillCatalog.learnedRanks.js';
import { maxRaceFighterSkillRankForBattleId } from '../data/fighterSkillCatalog.byRace.js';

/** Вивчений скіл у snapshot — battleId/level + підписи для UI. */
export interface LearnedSkillSnapshotEntry extends LearnedSkillEntry {
  nameUk?: string;
  hintUk?: string;
  l2SkillId?: number;
  kind?: string;
  maxSkillLevel?: number;
}

export function enrichLearnedSkillsForSnapshot(
  entries: LearnedSkillEntry[],
  race: string,
  classBranch: string
): LearnedSkillSnapshotEntry[] {
  const mystic = isMysticClassBranch(classBranch);
  return entries.map((e) => {
    const bid = canonicalBattleSkillId(e.battleId);
    const cat = mystic
      ? mysticCatalogEntryForRace(race, bid)
      : fighterCatalogEntryForRace(race, classBranch, bid);
    if (!cat) return { ...e };
    const maxSkillLevel = mystic
      ? maxMysticSkillRankForBattleId(bid, race)
      : maxRaceFighterSkillRankForBattleId(race, classBranch, bid);
    const hintUk =
      mystic && cat.l2SkillId === MYSTIC_SPELLCRAFT_L2_SKILL_ID
        ? 'Пасив: подвоєння швидкості касту в мантії.'
        : cat.hintUk;
    return {
      ...e,
      battleId: bid,
      nameUk: cat.nameUk,
      hintUk,
      l2SkillId: cat.l2SkillId,
      kind: cat.kind,
      maxSkillLevel,
    };
  });
}
