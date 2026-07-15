import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

/** Triple Slash (skill 1) — max rank Interlude. */
export const TRIPLE_SLASH_MAX_SKILL_RANK = 37;

/** Sonic Blaster (skill 6) — max rank Interlude. */
export const SONIC_BLASTER_MAX_SKILL_RANK = 37;

/** Кількість ударів Triple Slash за один каст. */
export const TRIPLE_SLASH_HIT_COUNT = 3;

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
    'Дальня звукова атака. Витрачає 2 заряди Sonic Focus. Меч/булава/дуал. ' +
    'З Sonic Mastery — вампіризм. Макс. ' +
    SONIC_BLASTER_MAX_SKILL_RANK +
    ' р. (зараз р. ' +
    r +
    ').'
  );
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
