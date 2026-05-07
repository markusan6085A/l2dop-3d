import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import {
  isL2DarkElfRace,
  isL2ElfRace,
  isL2HumanRace,
  isL2OrcRace,
} from './l2dopHumanMysticBattleSkills.js';
import { elvenFighterCatalogEntry } from './elvenFighterSkillCatalog.lookup.js';
import { darkFighterCatalogEntry } from './darkFighterSkillCatalog.lookup.js';
import { orcFighterCatalogEntry } from './orcFighterSkillCatalog.lookup.js';
import { dwarfFighterCatalogEntry } from './dwarfFighterSkillCatalog.lookup.js';

export function fighterCatalogEntryForRace(
  race: string,
  classBranch: string,
  battleId: string
): HumanMysticSkillCatalogEntry | undefined {
  if (String(classBranch).toLowerCase().trim() !== 'fighter') return undefined;
  if (isL2HumanRace(race)) return undefined;
  const c = canonicalBattleSkillId(battleId);
  if (isL2ElfRace(race)) return elvenFighterCatalogEntry(c);
  if (isL2DarkElfRace(race)) return darkFighterCatalogEntry(c);
  if (isL2OrcRace(race)) return orcFighterCatalogEntry(c);
  if (String(race ?? '').trim().toLowerCase() === 'dwarf') {
    return dwarfFighterCatalogEntry(c);
  }
  return undefined;
}

export function maxRaceFighterSkillRankForBattleId(
  race: string,
  classBranch: string,
  battleId: string
): number {
  const e = fighterCatalogEntryForRace(race, classBranch, battleId);
  if (!e || e.levels.length < 1) return 1;
  return e.levels.length;
}
