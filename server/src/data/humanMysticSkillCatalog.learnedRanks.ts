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
  antiMagicRequiredLevelAtRank,
  antiMagicSpCostAtRank,
  ANTI_MAGIC_MAX_RANK,
  isAntiMagicCatalogSkill,
} from './antiMagicTables.js';
import {
  isMysticArmorMasteryCatalogSkill,
  mysticArmorMasteryRequiredLevelAtRank,
  mysticArmorMasterySpCostAtRank,
  MYSTIC_ARMOR_MASTERY_MAX_RANK,
} from './mysticArmorMasteryTables.js';
import {
  battleHealStarterRequiredLevelAtRank,
  battleHealStarterSpCostAtRank,
  isBattleHealCatalogSkill,
  isBattleHealStarterRank,
} from './battleHealTables.js';
import {
  groupHealRequiredLevelAtRank,
  groupHealSpCostAtRank,
  GROUP_HEAL_MAX_RANK,
  isGroupHealCatalogSkill,
} from './groupHealTables.js';
import {
  iceBoltRequiredLevelAtRank,
  iceBoltSpCostAtRank,
  ICE_BOLT_MAX_RANK,
  isIceBoltCatalogSkill,
} from './iceBoltTables.js';
import {
  curseWeaknessRequiredLevelAtRank,
  curseWeaknessSpCostAtRank,
  CURSE_WEAKNESS_MAX_RANK,
  isCurseWeaknessCatalogSkill,
} from './curseWeaknessTables.js';
import {
  isMysticStarterWeaponMasteryRank,
  isMysticStarterWeaponMasterySkill,
  mysticStarterWeaponMasteryRequiredLevelAtRank,
  mysticStarterWeaponMasterySpCostAtRank,
} from './mysticStarterWeaponMasteryTables.js';
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
  const e0 = humanMysticCatalogEntry(c);
  if (e0 && isAntiMagicCatalogSkill(e0.l2SkillId)) {
    r = Math.max(r, ANTI_MAGIC_MAX_RANK);
  }
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
  if (e && isAntiMagicCatalogSkill(e.l2SkillId)) {
    max = Math.max(max, ANTI_MAGIC_MAX_RANK);
  }
  if (e && isMysticArmorMasteryCatalogSkill(e.l2SkillId)) {
    max = Math.max(max, MYSTIC_ARMOR_MASTERY_MAX_RANK);
  }
  if (e && isGroupHealCatalogSkill(e.l2SkillId)) {
    max = Math.max(max, GROUP_HEAL_MAX_RANK);
  }
  if (e && isIceBoltCatalogSkill(e.l2SkillId)) {
    max = Math.max(max, ICE_BOLT_MAX_RANK);
  }
  if (e && isCurseWeaknessCatalogSkill(e.l2SkillId)) {
    max = Math.max(max, CURSE_WEAKNESS_MAX_RANK);
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
  if (isAntiMagicCatalogSkill(entry.l2SkillId)) {
    const fromAm = antiMagicRequiredLevelAtRank(rank);
    if (fromAm !== undefined) return fromAm;
  }
  if (isMysticArmorMasteryCatalogSkill(entry.l2SkillId)) {
    const fromArm = mysticArmorMasteryRequiredLevelAtRank(rank);
    if (fromArm !== undefined) return fromArm;
  }
  if (
    isMysticStarterWeaponMasterySkill(entry.l2SkillId) &&
    isMysticStarterWeaponMasteryRank(rank)
  ) {
    const fromWm = mysticStarterWeaponMasteryRequiredLevelAtRank(rank);
    if (fromWm !== undefined) return fromWm;
  }
  if (isBattleHealCatalogSkill(entry.l2SkillId) && isBattleHealStarterRank(rank)) {
    const fromBh = battleHealStarterRequiredLevelAtRank(rank);
    if (fromBh !== undefined) return fromBh;
  }
  if (isGroupHealCatalogSkill(entry.l2SkillId)) {
    const fromGh = groupHealRequiredLevelAtRank(rank);
    if (fromGh !== undefined) return fromGh;
  }
  if (isIceBoltCatalogSkill(entry.l2SkillId)) {
    const fromIb = iceBoltRequiredLevelAtRank(rank);
    if (fromIb !== undefined) return fromIb;
  }
  if (isCurseWeaknessCatalogSkill(entry.l2SkillId)) {
    const fromCw = curseWeaknessRequiredLevelAtRank(rank);
    if (fromCw !== undefined) return fromCw;
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
  if (isAntiMagicCatalogSkill(entry.l2SkillId)) {
    const sp = antiMagicSpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (isMysticArmorMasteryCatalogSkill(entry.l2SkillId)) {
    const sp = mysticArmorMasterySpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (
    isMysticStarterWeaponMasterySkill(entry.l2SkillId) &&
    isMysticStarterWeaponMasteryRank(targetRank)
  ) {
    const sp = mysticStarterWeaponMasterySpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (
    isBattleHealCatalogSkill(entry.l2SkillId) &&
    isBattleHealStarterRank(targetRank)
  ) {
    const sp = battleHealStarterSpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (isGroupHealCatalogSkill(entry.l2SkillId)) {
    const sp = groupHealSpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (isIceBoltCatalogSkill(entry.l2SkillId)) {
    const sp = iceBoltSpCostAtRank(targetRank);
    if (sp !== undefined) return sp;
  }
  if (isCurseWeaknessCatalogSkill(entry.l2SkillId)) {
    const sp = curseWeaknessSpCostAtRank(targetRank);
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
    const keepLearnedArmorMastery =
      isMysticArmorMasteryCatalogSkill(cat.l2SkillId) && e.level >= 1;
    const keepLearnedWeaponMastery =
      isMysticStarterWeaponMasterySkill(cat.l2SkillId) && e.level >= 1;
    if (
      !keepLearnedArmorMastery &&
      !keepLearnedWeaponMastery &&
      !mysticCatalogEntryVisibleForProfession(cat, p)
    ) {
      continue;
    }
    out.push(e);
  }
  return out;
}
