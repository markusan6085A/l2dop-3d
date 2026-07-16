import {
  INTERLUDE_HF_MAX_RANK_BY_BATTLE_ID,
  INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK,
  INTERLUDE_HF_SP_BY_RANK,
} from './l2dbInterludeHumanFighterSkillLevels.generated.js';
import {
  l2dbMinCharLevelForSkillRank,
  l2dbMaxRankForSkillId,
  l2dbSpCostForSkillRank,
  sonicBlasterMinCharLevelForRank,
  sonicBusterMinCharLevelForRank,
} from './sonicGladiatorTables.js';
import { humanFighterCatalogEntry } from './humanFighterSkillCatalog.lookup.js';
import {
  shieldMasteryRequiredLevelAtRank,
  shieldMasterySpCostAtRank,
} from './shieldMasteryTables.js';
import {
  majestyRequiredLevelAtRank,
  majestySpCostAtRank,
} from './majestyTables.js';
import {
  shieldStunRequiredLevelAtRank,
  shieldStunSpCostAtRank,
} from './shieldStunTables.js';
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import { humanFighterCatalogHasBattleId } from './humanFighterSkillCatalog.lookup.js';
import { humanMysticCatalogHasBattleId } from './humanMysticSkillCatalog.lookup.js';
import { elvenMysticCatalogHasBattleId } from './elvenMysticSkillCatalog.lookup.js';
import { darkMysticCatalogHasBattleId } from './darkMysticSkillCatalog.lookup.js';
import { orcMysticCatalogHasBattleId } from './orcMysticSkillCatalog.lookup.js';
import {
  maxMysticSkillRankAcrossCatalogs,
} from './humanMysticSkillCatalog.learnedRanks.js';
import {
  maxRaceFighterSkillRankAcrossCatalogs,
  raceFighterCatalogHasBattleId,
} from './fighterSkillCatalog.learnedRanks.js';
import type {
  HumanFighterSkillCatalogEntry,
  LearnedSkillEntry,
} from './humanFighterSkillCatalog.types.js';

/**
 * Макс. ранг для скіла — зліплення text-rpg HumanFighter (+ l2db SP для 312).
 * Перегенерація: `node server/scripts/gen-interlude-hf-skill-tables.mjs` (потрібен `../text-rpg`).
 */
export const MAX_SKILL_RANK_BY_BATTLE_ID: Record<string, number> = {
  ...INTERLUDE_HF_MAX_RANK_BY_BATTLE_ID,
  /** Dark Avenger — text-rpg рівні. */
  l2_65: 13,
  l2_86: 3,
  l2_103: 4,
  l2_127: 14,
  l2_283: 7,
  l2_291: 11,
  l2_322: 6,
  l2_342: 1,
  l2_4: 2,
  l2_12: 14,
  l2_27: 14,
  l2_30: 37,
  l2_51: 1,
  l2_60: 1,
  l2_101: 3,
  l2_111: 2,
  l2_113: 2,
  l2_137: 1,
  l2_168: 1,
  l2_169: 2,
  l2_208: 15,
  l2_209: 7,
  l2_221: 1,
  l2_225: 3,
  l2_263: 37,
  l2_344: 1,
  l2_356: 1,
  l2_357: 1,
  l2_358: 1,
  /** Sagittarius — у text-rpg окремого Skill_0333 немає; один ранг у каталозі. */
  l2_333: 1,
  /**
   * Rapid Shot (99): у грі **два ранги** (1 → 2); у text-rpg Rogue має рівень 1, Hawkeye — рівень 2 (різні MP/power).
   */
  l2_99: 2,
  /**
   * Gladiator/Duelist sonic-скіли. Кількість рангів — з l2dop XML
   * (`l2dopSkillXmlLevels.generated.ts`), що збігається з L2 Interlude.
   * Min-level для рангу повертається фолбеком `entry.minLevel + (r - 1)`,
   * бо окремих таблиць в `INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK` для цих
   * скілів немає. SP fallback — `entry.spCost` (див. магістр).
   */
  l2_1: 37,
  l2_5: 31,
  l2_6: 37,
  l2_7: 28,
  l2_8: 7,
  l2_9: 34,
  l2_190: 37,
  l2_260: 19,
  l2_261: 22,
  /** Dual Weapon Mastery — Gladiator/Duelist (l2db Interlude, 37 р.). */
  l2_144: 37,
  /** War Cry: 2 р. лише Gladiator/Duelist (2-й — з 43 лвл). */
  l2_78: 2,
  /** Lionheart — лише 1 р. (Warrior → Gladiator / Warlord). */
  l2_287: 1,
  l2_442: 1,
  l2_451: 2,
  /** Magic Resistance — Knight / Paladin / Dark Avenger (l2db, 51 р.). */
  l2_147: 51,
  /** Shield Mastery — Knight / Paladin / Dark Avenger (Interlude, 4 р.). */
  l2_153: 4,
  /** Majesty — Knight (1 р.) / Paladin / Dark Avenger (3 р.). */
  l2_82: 3,
  /** Shield Stun — Knight → Paladin (Interlude, 52 р.). */
  l2_92: 52,
};

export function maxSkillRankForBattleId(battleId: string): number {
  const c = canonicalBattleSkillId(battleId);
  const n = MAX_SKILL_RANK_BY_BATTLE_ID[c];
  if (typeof n === 'number' && n >= 1) return n;
  const entry = humanFighterCatalogEntry(c);
  if (entry) {
    const fromL2db = l2dbMaxRankForSkillId(entry.l2SkillId);
    if (fromL2db != null && fromL2db >= 1) return fromL2db;
  }
  return 1;
}

/**
 * Мін. рівень персонажа для рангу rank (1-based) — таблиці з `*.generated.ts`;
 * якщо рангу немає в таблиці — +1 рівень на ранг від `entry.minLevel`.
 */
export function minCharLevelForSkillRank(
  entry: HumanFighterSkillCatalogEntry,
  rank: number
): number {
  const r = Math.max(1, Math.floor(rank));
  const c = canonicalBattleSkillId(entry.battleId);
  if (c === 'l2_1') {
    const fromL2db = l2dbMinCharLevelForSkillRank(entry.l2SkillId, r);
    if (fromL2db !== undefined) return fromL2db;
  }
  if (c === 'l2_6') {
    const fromSonic = sonicBlasterMinCharLevelForRank(r);
    if (fromSonic !== undefined) return fromSonic;
  }
  if (c === 'l2_9') {
    const fromSonic = sonicBusterMinCharLevelForRank(r);
    if (fromSonic !== undefined) return fromSonic;
  }
  if (c === 'l2_147') {
    const fromL2db = l2dbMinCharLevelForSkillRank(147, r);
    if (fromL2db !== undefined) return fromL2db;
  }
  if (c === 'l2_153') {
    const fromTable = shieldMasteryRequiredLevelAtRank(r);
    if (fromTable !== undefined) return fromTable;
  }
  if (c === 'l2_82') {
    const fromMajesty = majestyRequiredLevelAtRank(r);
    if (fromMajesty !== undefined) return fromMajesty;
  }
  if (c === 'l2_92') {
    const fromShieldStun = shieldStunRequiredLevelAtRank(r);
    if (fromShieldStun !== undefined) return fromShieldStun;
  }
  const fromL2db = l2dbMinCharLevelForSkillRank(entry.l2SkillId, r);
  if (fromL2db !== undefined) return fromL2db;
  const tbl = INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK[c];
  if (tbl != null && r < tbl.length) {
    const v = tbl[r];
    if (typeof v === 'number' && v >= 1) return v;
  }
  return entry.minLevel + (r - 1);
}

/**
 * SP за перехід на ранг `targetRank` (1 = перше вивчення).
 * З таблиці Interlude; якщо немає — використовується `entry.spCost` у магістрі.
 */
export function spCostForSkillRankUpgrade(
  battleId: string,
  targetRank: number,
  mappedHumanProf?: string
): number | undefined {
  const c = canonicalBattleSkillId(battleId);
  const r = Math.max(1, Math.floor(targetRank));
  if (c === 'l2_1') {
    const sp = l2dbSpCostForSkillRank(1, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_6') {
    const sp = l2dbSpCostForSkillRank(6, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_9') {
    const sp = l2dbSpCostForSkillRank(9, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_147') {
    const sp = l2dbSpCostForSkillRank(147, r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_153') {
    const sp = shieldMasterySpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_82' && mappedHumanProf) {
    const sp = majestySpCostAtRank(r, mappedHumanProf);
    if (sp !== undefined) return sp;
  }
  if (c === 'l2_92') {
    const sp = shieldStunSpCostAtRank(r);
    if (sp !== undefined) return sp;
  }
  const fromL2dbSp = l2dbSpCostForSkillRank(
    humanFighterCatalogEntry(c)?.l2SkillId ?? 0,
    r
  );
  if (fromL2dbSp !== undefined) return fromL2dbSp;
  const tbl = INTERLUDE_HF_SP_BY_RANK[c];
  if (tbl != null && r < tbl.length && typeof tbl[r] === 'number') {
    const v = tbl[r];
    /** У згенерованих таблицях часто `0` замість «немає даних» — тоді беремо `entry.spCost` у магістрі. */
    if (v >= 1) return v;
  }
  return undefined;
}

/** Видалені з гри скіли — прибираємо з JSON навіть якщо запис лишився в БД. */
const REMOVED_LEARNED_SKILL_BATTLE_IDS = new Set<string>(['l2_1320']);

/**
 * Нормалізує skillsLearnedJson: legacy `["l2_3"]` → рівень 1; новий формат `{ battleId, level }`.
 */
function catalogHasLearnableBattleId(c: string): boolean {
  return (
    humanFighterCatalogHasBattleId(c) ||
    raceFighterCatalogHasBattleId(c) ||
    humanMysticCatalogHasBattleId(c) ||
    elvenMysticCatalogHasBattleId(c) ||
    darkMysticCatalogHasBattleId(c) ||
    orcMysticCatalogHasBattleId(c)
  );
}

function maxLearnableRankForBattleId(c: string): number {
  let m = 1;
  if (humanFighterCatalogHasBattleId(c)) {
    m = Math.max(m, maxSkillRankForBattleId(c));
  }
  if (raceFighterCatalogHasBattleId(c)) {
    m = Math.max(m, maxRaceFighterSkillRankAcrossCatalogs(c));
  }
  if (
    humanMysticCatalogHasBattleId(c) ||
    elvenMysticCatalogHasBattleId(c) ||
    darkMysticCatalogHasBattleId(c) ||
    orcMysticCatalogHasBattleId(c)
  ) {
    m = Math.max(m, maxMysticSkillRankAcrossCatalogs(c));
  }
  return m;
}

export function normalizeLearnedSkillsJson(raw: unknown): LearnedSkillEntry[] {
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const byId = new Map<string, number>();
  for (const x of raw) {
    if (typeof x === 'string' && x.trim()) {
      const c = canonicalBattleSkillId(x.trim());
      if (REMOVED_LEARNED_SKILL_BATTLE_IDS.has(c)) continue;
      if (!catalogHasLearnableBattleId(c)) continue;
      byId.set(c, Math.max(byId.get(c) ?? 0, 1));
    } else if (x && typeof x === 'object' && !Array.isArray(x)) {
      const o = x as Record<string, unknown>;
      const bid =
        typeof o.battleId === 'string'
          ? o.battleId
          : typeof o.id === 'string'
            ? o.id
            : '';
      if (!String(bid).trim()) continue;
      const c = canonicalBattleSkillId(String(bid).trim());
      if (REMOVED_LEARNED_SKILL_BATTLE_IDS.has(c)) continue;
      if (!catalogHasLearnableBattleId(c)) continue;
      let lv =
        typeof o.level === 'number' && Number.isFinite(o.level)
          ? Math.floor(o.level)
          : 1;
      const maxR = maxLearnableRankForBattleId(c);
      lv = Math.max(0, Math.min(maxR, lv));
      byId.set(c, Math.max(byId.get(c) ?? 0, lv));
    }
  }
  return Array.from(byId.entries())
    .map(([battleId, level]) => ({ battleId, level }))
    .sort((a, b) => a.battleId.localeCompare(b.battleId));
}

export function learnedBattleIdsFromEntries(entries: LearnedSkillEntry[]): string[] {
  return entries.filter((e) => e.level >= 1).map((e) => e.battleId);
}

/** Legacy: масив рядків; повний JSON — normalizeLearnedSkillsJson. */
export function normalizeLearnedBattleSkillsList(raw: string[]): string[] {
  return learnedBattleIdsFromEntries(normalizeLearnedSkillsJson(raw));
}
