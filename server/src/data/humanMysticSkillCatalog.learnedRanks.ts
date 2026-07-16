import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { HAMMER_CRUSH_MAX_SKILL_RANK } from './hammerCrushTables.js';
import { humanMysticCatalogEntry } from './humanMysticSkillCatalog.lookup.js';
import { elvenMysticCatalogEntry } from './elvenMysticSkillCatalog.lookup.js';
import { darkMysticCatalogEntry } from './darkMysticSkillCatalog.lookup.js';
import { orcMysticCatalogEntry } from './orcMysticSkillCatalog.lookup.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from './humanMysticSkillCatalog.professionRules.js';
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';
import {
  heavyArmorKnightRequiredLevelAtRank,
  heavyArmorKnightSpCostAtRank,
  HEAVY_ARMOR_KNIGHT_MAX_RANK,
  isHeavyArmorKnightFlatCatalogSkill,
} from './heavyArmorMasteryTables.js';
import type {
  HumanMysticSkillCatalogEntry,
} from './humanMysticSkillCatalog.types.js';
import type { LearnedSkillEntry } from './humanFighterSkillCatalog.types.js';

/** Макс. ранг з обох каталогів (нормалізація JSON без раси). */
export function maxMysticSkillRankAcrossCatalogs(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  const skillId = Number.parseInt(c.replace(/^l2_/, ''), 10);
  let r = 1;
  const h = humanMysticCatalogEntry(c);
  if (h && h.levels.length >= 1) r = Math.max(r, h.levels.length);
  const el = elvenMysticCatalogEntry(c);
  if (el && el.levels.length >= 1) r = Math.max(r, el.levels.length);
  const d = darkMysticCatalogEntry(c);
  if (d && d.levels.length >= 1) r = Math.max(r, d.levels.length);
  const o = orcMysticCatalogEntry(c);
  if (o && o.levels.length >= 1) r = Math.max(r, o.levels.length);
  const l2dbRows =
    Number.isFinite(skillId) && skillId > 0
      ? L2DB_SKILL_LEVELS_BY_ID[skillId]
      : undefined;
  if (l2dbRows && l2dbRows.length >= 1) r = Math.max(r, l2dbRows.length);
  if (c === 'l2_260') r = Math.min(r, HAMMER_CRUSH_MAX_SKILL_RANK);
  return r;
}

export function maxMysticSkillRankForBattleId(
  battleId: string,
  race: string
): number {
  const e = mysticCatalogEntryForRace(race, battleId);
  const l2dbRows =
    e && e.l2SkillId > 0 ? L2DB_SKILL_LEVELS_BY_ID[e.l2SkillId] : undefined;
  const local = !e || e.levels.length < 1 ? 1 : e.levels.length;
  const remote = l2dbRows && l2dbRows.length >= 1 ? l2dbRows.length : 1;
  let max = Math.max(local, remote);
  if (
    e &&
    isHeavyArmorKnightFlatCatalogSkill(
      e.l2SkillId,
      e.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
    )
  ) {
    max = Math.max(max, HEAVY_ARMOR_KNIGHT_MAX_RANK);
  }
  return max;
}

export function minCharLevelForMysticSkillRank(
  entry: HumanMysticSkillCatalogEntry,
  rank: number
): number {
  if (
    isHeavyArmorKnightFlatCatalogSkill(
      entry.l2SkillId,
      entry.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
    )
  ) {
    const fromHa = heavyArmorKnightRequiredLevelAtRank(rank);
    if (fromHa !== undefined) return fromHa;
  }
  const r = Math.max(1, Math.floor(rank)) - 1;
  const row = entry.levels[r];
  if (row) return Math.max(1, row.requiredLevel);
  const l2dbRow = L2DB_SKILL_LEVELS_BY_ID[entry.l2SkillId]?.[r];
  if (l2dbRow) return Math.max(1, l2dbRow.requiredLevel);
  return entry.minLevel + Math.max(0, r);
}

export function spCostForMysticSkillRankUpgrade(
  entry: HumanMysticSkillCatalogEntry,
  targetRank: number
): number {
  if (
    isHeavyArmorKnightFlatCatalogSkill(
      entry.l2SkillId,
      entry.effects.map((fx) => ({ stat: fx.stat, mode: fx.mode }))
    )
  ) {
    const sp = heavyArmorKnightSpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  const r = Math.max(1, Math.floor(targetRank)) - 1;
  const row = entry.levels[r];
  if (row && row.spCost >= 1) return row.spCost;
  const l2dbRow = L2DB_SKILL_LEVELS_BY_ID[entry.l2SkillId]?.[r];
  if (l2dbRow && l2dbRow.spCost >= 1) return l2dbRow.spCost;
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
    if (!mysticCatalogEntryVisibleForProfession(cat, p)) continue;
    out.push(e);
  }
  return out;
}
