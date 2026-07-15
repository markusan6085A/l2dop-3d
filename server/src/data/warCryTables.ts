/**
 * War Cry (skill 78) — селф-баф P.Atk.
 * MP — l2db Interlude; % P.Atk — text-rpg HF (`TEXT_RPG_HF_BUFF_EFFECTS`, 20% / 25%).
 */
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

const WAR_CRY_LEVELS = L2DB_SKILL_LEVELS_BY_ID[78] ?? [];

/** % до P.Atk за рангом скіла (1 → 20%, 2 → 25%). */
const WAR_CRY_PATK_PCT_BY_RANK = [20, 25] as const;

export const WAR_CRY_MAX_RANK = Math.max(
  WAR_CRY_LEVELS.length,
  WAR_CRY_PATK_PCT_BY_RANK.length
);

export function warCryPatkPercentAtRank(rank: number): number {
  const r = Math.max(1, Math.min(WAR_CRY_PATK_PCT_BY_RANK.length, Math.floor(rank)));
  return WAR_CRY_PATK_PCT_BY_RANK[r - 1] ?? 20;
}

export function warCryMpAtRank(rank: number): number | null {
  if (WAR_CRY_LEVELS.length === 0) return null;
  const r = Math.max(1, Math.min(WAR_CRY_LEVELS.length, Math.floor(rank)));
  const row = WAR_CRY_LEVELS[r - 1];
  if (!row) return null;
  return row.mpCost;
}

/** Текст для магістра / UI на конкретному рівні скіла. */
export function warCryStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.floor(rank));
  const pct = warCryPatkPercentAtRank(lv);
  const mp = warCryMpAtRank(lv) ?? 10;
  return (
    'Селф-баф на 5 хв.: +' +
    pct +
    '% до P.Atk (MP ' +
    mp +
    ') на р. ' +
    lv +
    ' скіла. Відкат: 180 с.'
  );
}
