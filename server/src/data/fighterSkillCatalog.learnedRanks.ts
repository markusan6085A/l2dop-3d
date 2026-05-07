import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { elvenFighterCatalogEntry } from './elvenFighterSkillCatalog.lookup.js';
import { darkFighterCatalogEntry } from './darkFighterSkillCatalog.lookup.js';
import { orcFighterCatalogEntry } from './orcFighterSkillCatalog.lookup.js';
import { dwarfFighterCatalogEntry } from './dwarfFighterSkillCatalog.lookup.js';

export function maxRaceFighterSkillRankAcrossCatalogs(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  let r = 1;
  for (const fn of [
    elvenFighterCatalogEntry,
    darkFighterCatalogEntry,
    orcFighterCatalogEntry,
    dwarfFighterCatalogEntry,
  ]) {
    const e = fn(c);
    if (e && e.levels.length >= 1) r = Math.max(r, e.levels.length);
  }
  return r;
}

export function raceFighterCatalogHasBattleId(battleId: string): boolean {
  const c = canonicalBattleSkillId(battleId);
  return !!(
    elvenFighterCatalogEntry(c) ||
    darkFighterCatalogEntry(c) ||
    orcFighterCatalogEntry(c) ||
    dwarfFighterCatalogEntry(c)
  );
}
