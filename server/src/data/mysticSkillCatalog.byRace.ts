import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';
import { humanMysticCatalogEntry } from './humanMysticSkillCatalog.lookup.js';
import { elvenMysticCatalogEntry } from './elvenMysticSkillCatalog.lookup.js';
import { darkMysticCatalogEntry } from './darkMysticSkillCatalog.lookup.js';
import { orcMysticCatalogEntry } from './orcMysticSkillCatalog.lookup.js';

function raceIsElf(race: string): boolean {
  return String(race).trim().toLowerCase() === 'elf';
}

function raceIsDarkElf(race: string): boolean {
  return String(race).trim().toLowerCase() === 'dark elf';
}

function raceIsOrc(race: string): boolean {
  return String(race).trim().toLowerCase() === 'orc';
}

export function mysticCatalogEntryForRace(
  race: string,
  battleId: string
): HumanMysticSkillCatalogEntry | undefined {
  const c = canonicalBattleSkillId(battleId);
  if (raceIsElf(race)) return elvenMysticCatalogEntry(c);
  if (raceIsDarkElf(race)) return darkMysticCatalogEntry(c);
  if (raceIsOrc(race)) return orcMysticCatalogEntry(c);
  return humanMysticCatalogEntry(c);
}
