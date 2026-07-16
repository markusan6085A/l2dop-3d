import { skillIconUrlForClient } from '../data/humanFighterSkillCatalog.js';
import { canonicalBattleSkillId } from '../data/humanFighterSkillCatalog.legacyIds.js';
import type { LearnedSkillEntry } from '../data/humanFighterSkillCatalog.types.js';
import { humanFighterCatalogEntry } from '../data/humanFighterSkillCatalog.lookup.js';
import { maxSkillRankForBattleId } from '../data/humanFighterSkillCatalog.learnedRanks.js';
import { fighterCatalogEntryForRace } from '../data/fighterSkillCatalog.byRace.js';
import {
  MYSTIC_SPELLCRAFT_L2_SKILL_ID,
  isL2HumanRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import { isFighterClassBranch } from '../data/l2dopHumanFighterBattleSkills.js';
import { mysticCatalogEntryForRace } from '../data/mysticSkillCatalog.byRace.js';
import { maxMysticSkillRankForBattleId } from '../data/humanMysticSkillCatalog.learnedRanks.js';
import { maxRaceFighterSkillRankForBattleId } from '../data/fighterSkillCatalog.byRace.js';
import type { HumanMysticSkillCatalogEntry } from '../data/humanMysticSkillCatalog.types.js';
import type { HumanFighterSkillCatalogEntry } from '../data/humanFighterSkillCatalog.types.js';

function catalogEntryForLearnedSkillDisplay(
  race: string,
  classBranch: string,
  battleId: string
): HumanMysticSkillCatalogEntry | HumanFighterSkillCatalogEntry | undefined {
  const bid = canonicalBattleSkillId(battleId);
  if (isMysticClassBranch(classBranch)) {
    return mysticCatalogEntryForRace(race, bid);
  }
  if (isFighterClassBranch(classBranch) && isL2HumanRace(race)) {
    return humanFighterCatalogEntry(bid);
  }
  return fighterCatalogEntryForRace(race, classBranch, bid);
}

function maxSkillLevelForLearnedSkillDisplay(
  race: string,
  classBranch: string,
  battleId: string
): number {
  const bid = canonicalBattleSkillId(battleId);
  if (isMysticClassBranch(classBranch)) {
    return maxMysticSkillRankForBattleId(bid, race);
  }
  if (isFighterClassBranch(classBranch) && isL2HumanRace(race)) {
    return maxSkillRankForBattleId(bid);
  }
  return maxRaceFighterSkillRankForBattleId(race, classBranch, bid);
}

/** Вивчений скіл у snapshot — battleId/level + підписи для UI. */
export interface LearnedSkillSnapshotEntry extends LearnedSkillEntry {
  nameUk?: string;
  hintUk?: string;
  l2SkillId?: number;
  iconUrl?: string;
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
    const cat = catalogEntryForLearnedSkillDisplay(race, classBranch, bid);
    if (!cat) return { ...e, battleId: bid };
    const maxSkillLevel = maxSkillLevelForLearnedSkillDisplay(
      race,
      classBranch,
      bid
    );
    const hintUk =
      mystic && cat.l2SkillId === MYSTIC_SPELLCRAFT_L2_SKILL_ID
        ? 'Пасив: у мантії — нормальна швидкість касту; без броні / light / heavy — −50%.'
        : cat.hintUk;
    return {
      ...e,
      battleId: bid,
      nameUk: cat.nameUk,
      hintUk,
      l2SkillId: cat.l2SkillId,
      iconUrl: skillIconUrlForClient(cat.l2SkillId),
      kind: cat.kind,
      maxSkillLevel,
    };
  });
}
