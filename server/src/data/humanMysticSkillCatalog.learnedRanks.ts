import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanMysticCatalogEntry } from './humanMysticSkillCatalog.lookup.js';
import { elvenMysticCatalogEntry } from './elvenMysticSkillCatalog.lookup.js';
import { darkMysticCatalogEntry } from './darkMysticSkillCatalog.lookup.js';
import { orcMysticCatalogEntry } from './orcMysticSkillCatalog.lookup.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import type {
  HumanMysticSkillCatalogEntry,
} from './humanMysticSkillCatalog.types.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';

/** Макс. ранг з обох каталогів (нормалізація JSON без раси). */
export function maxMysticSkillRankAcrossCatalogs(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  let r = 1;
  const h = humanMysticCatalogEntry(c);
  if (h && h.levels.length >= 1) r = Math.max(r, h.levels.length);
  const el = elvenMysticCatalogEntry(c);
  if (el && el.levels.length >= 1) r = Math.max(r, el.levels.length);
  const d = darkMysticCatalogEntry(c);
  if (d && d.levels.length >= 1) r = Math.max(r, d.levels.length);
  const o = orcMysticCatalogEntry(c);
  if (o && o.levels.length >= 1) r = Math.max(r, o.levels.length);
  return r;
}

export function maxMysticSkillRankForBattleId(
  battleId: string,
  race: string
): number {
  const e = mysticCatalogEntryForRace(race, battleId);
  if (!e || e.levels.length < 1) return 1;
  return e.levels.length;
}

export function minCharLevelForMysticSkillRank(
  entry: HumanMysticSkillCatalogEntry,
  rank: number
): number {
  const r = Math.max(1, Math.floor(rank)) - 1;
  const row = entry.levels[r];
  if (row) return Math.max(1, row.requiredLevel);
  return entry.minLevel + Math.max(0, r);
}

export function spCostForMysticSkillRankUpgrade(
  entry: HumanMysticSkillCatalogEntry,
  targetRank: number
): number {
  const r = Math.max(1, Math.floor(targetRank)) - 1;
  const row = entry.levels[r];
  if (row && row.spCost >= 1) return row.spCost;
  return entry.spCost;
}

export function mysticCatalogEntryMeetsLevel(
  entry: HumanMysticSkillCatalogEntry,
  charLevel: number,
  targetRank: number
): boolean {
  return charLevel >= minCharLevelForMysticSkillRank(entry, targetRank);
}

export function filterLearnedMysticSkillEntriesForProfession(
  entries: LearnedSkillEntry[],
  l2Profession: string,
  race: string
): LearnedSkillEntry[] {
  const p = String(l2Profession || '').trim();
  const out: LearnedSkillEntry[] = [];
  for (const e of entries) {
    if (e.level < 1) continue;
    const bid = canonicalBattleSkillId(e.battleId);
    const cat = mysticCatalogEntryForRace(race, bid);
    if (!cat) continue;
    if (!cat.visibleForProfessions.includes(p)) continue;
    out.push(e);
  }
  return out;
}
