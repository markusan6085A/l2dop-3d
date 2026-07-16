/**
 * Каталог скілів людини-воїна:
 * Fighter → Warrior → (Warlord → Dreadnought | Gladiator → Duelist);
 * Human Knight → (Paladin → Phoenix Knight | Dark Avenger → Hell Knight);
 * Fighter → Rogue → Treasure Hunter → Adventurer;
 * Fighter → Rogue → Hawkeye → Sagittarius (або Rogue → Treasure Hunter → Adventurer), дерево l2db.
 * Формули рангів/SP — з text-rpg (`npm run gen:hf-skills`). Іконки: GET /game/skill-icon/:id
 *
 * battleId у БД — канонічний `l2_<skillId>`. Старі рядки (`power_strike` тощо) нормалізуються при читанні.
 *
 * Дані та допоміжні модулі: `humanFighterSkillCatalog.*.ts` (ліміт рядків на файл).
 */
import type { BattleActionId } from '../domain/battle.js';
import {
  CANONICAL_L2_SKILL_TO_BATTLE_ACTION,
  battleActionNamedFromL2IfMapped,
} from './humanFighterSkillCatalog.battleActionMap.js';
import { HUMAN_FIGHTER_SKILL_CATALOG } from './humanFighterSkillCatalog.entries.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
import { catalogEntryVisibleForProfession } from './humanFighterSkillCatalog.professionRules.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import { raceFighterCatalogEntryVisibleForProfession } from './raceFighterSkillCatalog.professionRules.js';
import { resolvePublicSkillIconWebPath } from '../services/publicSkillIconPath.js';

/**
 * Видалені з гри скіли (l2 id) — не показувати в бою, навіть якщо залишок у кеші/JSON.
 * Зараз: 297 — колишній «Дух дуелянта».
 */
export const BATTLE_BAR_BLOCKED_L2_SKILL_IDS: ReadonlySet<number> = new Set([297]);

const BATTLE_BAR_BLOCKED_ACTION_IDS = new Set<string>(['duelist_spirit']);

/** Останній рубіж перед відправкою `battle.skills` клієнту. */
export function filterBattleSkillBarRows<
  T extends { id: BattleActionId; l2SkillId?: number },
>(rows: T[]): T[] {
  return rows.filter((r) => {
    if (BATTLE_BAR_BLOCKED_ACTION_IDS.has(String(r.id))) return false;
    const n = r.l2SkillId;
    if (typeof n === 'number' && BATTLE_BAR_BLOCKED_L2_SKILL_IDS.has(n)) {
      return false;
    }
    if (
      'labelUk' in r &&
      typeof (r as { labelUk?: unknown }).labelUk === 'string'
    ) {
      const lb = (r as { labelUk: string }).labelUk;
      if (/Дух дуелянта|Duelist Spirit/i.test(lb)) return false;
    }
    return true;
  });
}

export type {
  HumanFighterSkillKind,
  HumanFighterSkillCatalogEntry,
  LearnedSkillEntry,
} from './humanFighterSkillCatalog.types.js';
export { HUMAN_FIGHTER_SKILL_CATALOG } from './humanFighterSkillCatalog.entries.js';
export { HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL } from './humanFighterSkillCatalog.constants.js';
export {
  LEGACY_BATTLE_SKILL_ID_TO_CANONICAL,
  canonicalBattleSkillId,
} from './humanFighterSkillCatalog.legacyIds.js';
export {
  CANONICAL_L2_SKILL_TO_BATTLE_ACTION,
  CANONICAL_BATTLE_ID_FOR_ACTION,
  canonicalBattleIdForAction,
  battleActionNamedFromL2IfMapped,
  l2SkillIdForBattleActionIcon,
} from './humanFighterSkillCatalog.battleActionMap.js';
export { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
export {
  isHumanWarlordTrackProfession,
  isHumanGladiatorTrackProfession,
  isHumanSecondTierWarriorBranchProfession,
  isHumanKnightTrackProfession,
  isHumanPaladinTrackProfession,
  isHumanDarkAvengerTrackProfession,
  isHumanRogueTrackProfession,
  isHumanArcherTrackProfession,
  isHumanWarriorSubclassProfession,
  catalogEntryVisibleForProfession,
  filterLearnedSkillEntriesForProfession,
  catalogEntryOfferedAtGludioMagister,
  catalogEntryMeetsRequirements,
  catalogEntryAllowsSkillRank,
  maxSkillRankForCatalogEntry,
} from './humanFighterSkillCatalog.professionRules.js';
export {
  MAX_SKILL_RANK_BY_BATTLE_ID,
  maxSkillRankForBattleId,
  minCharLevelForSkillRank,
  spCostForSkillRankUpgrade,
  normalizeLearnedSkillsJson,
  learnedBattleIdsFromEntries,
  normalizeLearnedBattleSkillsList,
} from './humanFighterSkillCatalog.learnedRanks.js';

/**
 * Лише для URL іконки в UI: у датапаку арт 141/142 не збігається з назвами скілів — міняємо місцями.
 * `l2SkillId` у каталозі/бою лишається канонічним.
 */
export function skillIconAssetIdForDisplay(l2SkillId: number): number {
  if (l2SkillId === 141) return 142;
  if (l2SkillId === 142) return 141;
  return l2SkillId;
}

export function skillIconUrlForClient(l2SkillId: number): string {
  const displayId = skillIconAssetIdForDisplay(l2SkillId);
  const pub = resolvePublicSkillIconWebPath(displayId);
  if (pub) return pub;
  return `/game/skill-icon/${displayId}`;
}

/**
 * Усі вивчені активні скіли та toggle з каталогу, з мапінгом на BattleActionId.
 * Пасивки не включаються — як text-rpg `useLearnedActive` (category !== passive).
 * Для расових `l2_*` без іменованої дії `id` лишається `l2_<skillId>`.
 */
export function learnedHumanFighterHotbarPickSkills(
  learnedBattleIds: string[],
  l2Profession: string,
  race = 'Human',
  classBranch = 'fighter'
): { id: BattleActionId; labelUk: string; l2SkillId: number }[] {
  const seen = new Set<BattleActionId>();
  const out: { id: BattleActionId; labelUk: string; l2SkillId: number }[] = [];
  for (const raw of learnedBattleIds) {
    const canon = canonicalBattleSkillId(raw);
    const rf = fighterCatalogEntryForRace(race, classBranch, canon);
    if (rf) {
      if (!raceFighterCatalogEntryVisibleForProfession(rf, l2Profession)) {
        continue;
      }
      if (rf.kind !== 'battle' && rf.kind !== 'toggle') continue;
      const mappedAct = battleActionNamedFromL2IfMapped(canon as BattleActionId);
      const action: BattleActionId | undefined =
        (mappedAct !== canon ? mappedAct : undefined) ??
        CANONICAL_L2_SKILL_TO_BATTLE_ACTION[canon] ??
        (/^l2_\d+$/.test(canon) ? (canon as BattleActionId) : undefined);
      if (!action) continue;
      if (seen.has(action)) continue;
      seen.add(action);
      out.push({
        id: action,
        labelUk: rf.nameUk,
        l2SkillId: rf.l2SkillId,
      });
      continue;
    }
    const entry = humanFighterCatalogEntry(canon);
    if (!entry) continue;
    if (!catalogEntryVisibleForProfession(entry, l2Profession)) continue;
    if (entry.kind !== 'battle' && entry.kind !== 'toggle') continue;
    const mappedAct = battleActionNamedFromL2IfMapped(canon as BattleActionId);
    const action: BattleActionId | undefined =
      (mappedAct !== canon ? mappedAct : undefined) ??
      CANONICAL_L2_SKILL_TO_BATTLE_ACTION[canon] ??
      (/^l2_\d+$/.test(canon) ? (canon as BattleActionId) : undefined);
    if (!action) continue;
    if (seen.has(action)) continue;
    seen.add(action);
    out.push({
      id: action,
      labelUk: entry.nameUk,
      l2SkillId: entry.l2SkillId,
    });
  }
  out.sort((a, b) => a.labelUk.localeCompare(b.labelUk, 'uk'));
  return out;
}

export function allHumanFighterLearnableBattleIds(): string[] {
  return HUMAN_FIGHTER_SKILL_CATALOG.map((e) => e.battleId);
}
