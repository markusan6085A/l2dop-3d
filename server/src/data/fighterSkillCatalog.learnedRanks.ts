import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { elvenFighterCatalogEntry } from './elvenFighterSkillCatalog.lookup.js';
import { darkFighterCatalogEntry } from './darkFighterSkillCatalog.lookup.js';
import { orcFighterCatalogEntry } from './orcFighterSkillCatalog.lookup.js';
import { dwarfFighterCatalogEntry } from './dwarfFighterSkillCatalog.lookup.js';
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

export function maxRaceFighterSkillRankAcrossCatalogs(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  const skillId = Number.parseInt(c.replace(/^l2_/, ''), 10);
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
  const l2dbRows =
    Number.isFinite(skillId) && skillId > 0
      ? L2DB_SKILL_LEVELS_BY_ID[skillId]
      : undefined;
  if (l2dbRows && l2dbRows.length >= 1) r = Math.max(r, l2dbRows.length);
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
