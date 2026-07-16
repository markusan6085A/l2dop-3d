import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

/** Triple Slash (skill 1) — max rank Interlude. */
export const TRIPLE_SLASH_MAX_SKILL_RANK = 37;

/** Sonic Blaster (skill 6) — max rank Interlude. */
export const SONIC_BLASTER_MAX_SKILL_RANK = 37;

/** Sonic Storm (skill 7) — max rank у нашій гілці Gladiator (l2db має 28; Duelist-опис — 12). */
export const SONIC_STORM_MAX_SKILL_RANK = 28;

/** До скількох цілей вражає Sonic Storm / Вихор: головна + 2 поруч. */
export const SONIC_STORM_MAX_TARGETS = 3;

/** Sonic Buster (skill 9) — max rank Interlude (Gladiator / Duelist). */
export const SONIC_BUSTER_MAX_SKILL_RANK = 34;

/** Кількість ударів Triple Slash за один каст. */
export const TRIPLE_SLASH_HIT_COUNT = 3;

/**
 * Мін. рівень персонажа для рангу Sonic Blaster (узгоджено з Triple Slash / Interlude).
 * Індекс 0 не використовується; ранги 1..37.
 */
export const SONIC_BLASTER_MIN_CHAR_LEVEL_BY_RANK: readonly number[] = [
  0,
  40, 40, 40,
  43, 43, 43,
  46, 46, 46,
  49, 49, 49,
  52, 52, 52,
  55, 55, 55,
  58, 58, 58,
  60, 60, 60,
  62, 62,
  64, 64,
  66, 66,
  68, 68,
  70, 70,
  72, 72,
  74,
];

/**
 * Мін. рівень персонажа для рангу Sonic Buster (Interlude Gladiator).
 * Індекс 0 не використовується; ранги 1..34.
 */
export const SONIC_BUSTER_MIN_CHAR_LEVEL_BY_RANK: readonly number[] = [
  0,
  55, 55, 55,
  58, 58, 58,
  60, 60,
  62, 62,
  64, 64,
  66, 66,
  68, 68,
  70, 70,
  72, 72,
  74, 74,
  76, 76,
  78, 78,
  80, 80,
  81, 81,
  83, 83,
  85, 85,
];

export function tripleSlashStatsNoteUk(_skillRank: number): string {
  return (
    'Потрібен дуальний меч. ' +
    TRIPLE_SLASH_HIT_COUNT +
    ' швидких удари по цілі; over-hit/крит. Макс. ' +
    TRIPLE_SLASH_MAX_SKILL_RANK +
    ' р.'
  );
}

export function sonicBlasterStatsNoteUk(skillRank: number): string {
  const r = Math.max(1, Math.min(SONIC_BLASTER_MAX_SKILL_RANK, Math.floor(skillRank)));
  return (
    'Дальня звукова атака; over-hit/крит. Потрібно ≥2 заряди Sonic Focus (витрата 2). ' +
    'Меч/булава/дуал. З Sonic Mastery — вампіризм. Макс. ' +
    SONIC_BLASTER_MAX_SKILL_RANK +
    ' р. (зараз р. ' +
    r +
    ').'
  );
}

export function sonicBusterStatsNoteUk(skillRank: number): string {
  const r = Math.max(1, Math.min(SONIC_BUSTER_MAX_SKILL_RANK, Math.floor(skillRank)));
  return (
    'AoE-хвиля по ворогах попереду; крит. Потрібно ≥2 заряди Sonic Focus (витрата 2). ' +
    'Меч/булава/дуал. З Sonic Mastery — вампіризм. Макс. ' +
    SONIC_BUSTER_MAX_SKILL_RANK +
    ' р. (зараз р. ' +
    r +
    ').'
  );
}

export function sonicStormStatsNoteUk(skillRank: number): string {
  const r = Math.max(1, Math.min(SONIC_STORM_MAX_SKILL_RANK, Math.floor(skillRank)));
  return (
    'Дальня AoE: до ' +
    SONIC_STORM_MAX_TARGETS +
    ' цілей (головна + 2 поруч на карті). Потрібно ≥2 заряди Sonic Focus (витрата 3). ' +
    'Меч/булава/дуал. З Sonic Mastery — вампіризм. Макс. ' +
    SONIC_STORM_MAX_SKILL_RANK +
    ' р. (зараз р. ' +
    r +
    ').'
  );
}

function minCharLevelFromTable(
  tbl: readonly number[],
  rank: number
): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  if (r >= tbl.length) return undefined;
  const v = tbl[r];
  return typeof v === 'number' && v >= 1 ? v : undefined;
}

export function sonicBlasterMinCharLevelForRank(rank: number): number | undefined {
  return minCharLevelFromTable(SONIC_BLASTER_MIN_CHAR_LEVEL_BY_RANK, rank);
}

export function sonicBusterMinCharLevelForRank(rank: number): number | undefined {
  return minCharLevelFromTable(SONIC_BUSTER_MIN_CHAR_LEVEL_BY_RANK, rank);
}

export function l2dbMinCharLevelForSkillRank(
  l2SkillId: number,
  rank: number
): number | undefined {
  const row = L2DB_SKILL_LEVELS_BY_ID[l2SkillId]?.[Math.max(1, Math.floor(rank)) - 1];
  if (!row) return undefined;
  return Math.max(1, row.requiredLevel);
}

export function l2dbSpCostForSkillRank(
  l2SkillId: number,
  targetRank: number
): number | undefined {
  const row = L2DB_SKILL_LEVELS_BY_ID[l2SkillId]?.[Math.max(1, Math.floor(targetRank)) - 1];
  if (!row || row.spCost < 1) return undefined;
  return row.spCost;
}

export function l2dbMaxRankForSkillId(l2SkillId: number): number | undefined {
  const rows = L2DB_SKILL_LEVELS_BY_ID[l2SkillId];
  const n = rows?.length;
  return typeof n === 'number' && n >= 1 ? n : undefined;
}
