import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { HAMMER_CRUSH_MAX_SKILL_RANK } from './hammerCrushTables.js';
import { elvenFighterCatalogEntry } from './elvenFighterSkillCatalog.lookup.js';
import { darkFighterCatalogEntry } from './darkFighterSkillCatalog.lookup.js';
import { orcFighterCatalogEntry } from './orcFighterSkillCatalog.lookup.js';
import { dwarfFighterCatalogEntry } from './dwarfFighterSkillCatalog.lookup.js';
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';
import {
  HEAVY_ARMOR_KNIGHT_MAX_RANK,
  isHeavyArmorKnightFlatCatalogSkill,
} from './heavyArmorMasteryTables.js';

function knightFlatHeavyArmorCatalogMaxRank(c: string): number {
  if (c === 'l2_232') return HEAVY_ARMOR_KNIGHT_MAX_RANK;
  if (c !== 'l2_231') return 0;
  for (const fn of [elvenFighterCatalogEntry, darkFighterCatalogEntry]) {
    const e = fn(c);
    if (
      e &&
      isHeavyArmorKnightFlatCatalogSkill(
        e.l2SkillId,
        e.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
      )
    ) {
      return HEAVY_ARMOR_KNIGHT_MAX_RANK;
    }
  }
  return 0;
}

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
  r = Math.max(r, knightFlatHeavyArmorCatalogMaxRank(c));
  if (c === 'l2_260') r = Math.min(r, HAMMER_CRUSH_MAX_SKILL_RANK);
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
