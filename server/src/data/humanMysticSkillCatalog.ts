/**
 * Каталог людини-мага / містика (Human Mystic) — джерело text-rpg `HumanMystic/**`.
 * Регенерація: `npm run gen:hm-skills`.
 */
import type { BattleActionId } from '../domain/battle.js';
import {
  HUMAN_MYSTIC_ACTIVE_L2_IDS,
  HUMAN_MYSTIC_SKILL_CATALOG_GENERATED,
} from './humanMysticSkillCatalog.generated.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from './humanMysticSkillCatalog.professionRules.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';

export type {
  HumanMysticSkillCatalogEntry,
  HumanMysticSkillKind,
} from './humanMysticSkillCatalog.types.js';

export { HUMAN_MYSTIC_SKILL_CATALOG_GENERATED } from './humanMysticSkillCatalog.generated.js';
export {
  humanMysticCatalogEntry,
  humanMysticCatalogHasBattleId,
} from './humanMysticSkillCatalog.lookup.js';
export {
  mysticCatalogEntryVisibleForProfession,
  mysticCatalogEntryAllowsSkillRank,
  mysticCatalogEntryOfferedAtGludioMagister,
} from './humanMysticSkillCatalog.professionRules.js';
export {
  filterLearnedMysticSkillEntriesForProfession,
  maxMysticSkillRankAcrossCatalogs,
  maxMysticSkillRankForBattleId,
  minCharLevelForMysticSkillRank,
  mysticCatalogEntryMeetsLevel,
  spCostForMysticSkillRankUpgrade,
} from './humanMysticSkillCatalog.learnedRanks.js';

/** Усі l2 id (включно з пасивками) — для `normalizeClientBattleAction`. */
export const HUMAN_MYSTIC_ALL_L2_IDS: ReadonlySet<number> = new Set(
  HUMAN_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.l2SkillId)
);

export const HUMAN_MYSTIC_ACTIVE_L2_ID_SET: ReadonlySet<number> = new Set(
  HUMAN_MYSTIC_ACTIVE_L2_IDS
);

export function mysticSkillSkipsMobHpByBattleId(
  battleId: string,
  race: string
): boolean {
  const e = mysticCatalogEntryForRace(race, battleId);
  return e ? e.skipMobHp : false;
}

/** Панель вибору: активні вивчені скіли (не пасивки), каталог за расою. */
export function learnedMysticHotbarPickSkills(
  learnedBattleIds: string[],
  l2Profession: string,
  race: string
): { id: BattleActionId; labelUk: string; l2SkillId: number }[] {
  const prof = String(l2Profession || '').trim();
  const seen = new Set<string>();
  const out: { id: BattleActionId; labelUk: string; l2SkillId: number }[] = [];
  for (const raw of learnedBattleIds) {
    const canon = canonicalBattleSkillId(raw);
    const entry = mysticCatalogEntryForRace(race, canon);
    if (!entry) continue;
    if (!mysticCatalogEntryVisibleForProfession(entry, prof)) continue;
    if (entry.kind === 'passive') continue;
    if (seen.has(canon)) continue;
    seen.add(canon);
    out.push({
      id: canon as BattleActionId,
      labelUk: entry.nameUk,
      l2SkillId: entry.l2SkillId,
    });
  }
  out.sort((a, b) => a.labelUk.localeCompare(b.labelUk, 'uk'));
  return out;
}

/** Людина-маг — зворотна сумісність (каталог Human Mystic). */
export function learnedHumanMysticHotbarPickSkills(
  learnedBattleIds: string[],
  l2Profession: string
): { id: BattleActionId; labelUk: string; l2SkillId: number }[] {
  return learnedMysticHotbarPickSkills(learnedBattleIds, l2Profession, 'Human');
}

export function allHumanMysticLearnableBattleIds(): string[] {
  return HUMAN_MYSTIC_SKILL_CATALOG_GENERATED.map((e) => e.battleId);
}
