/**
 * Power Smash (skill 255) — активний удар мечем/булавою.
 * MP / power — l2db Interlude (`L2DB_SKILL_LEVELS_BY_ID`).
 */
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

const POWER_SMASH_LEVELS = L2DB_SKILL_LEVELS_BY_ID[255] ?? [];

export const POWER_SMASH_MAX_RANK = POWER_SMASH_LEVELS.length || 15;

export function powerSmashMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  if (POWER_SMASH_LEVELS.length === 0) return null;
  const r = Math.max(1, Math.min(POWER_SMASH_LEVELS.length, Math.floor(rank)));
  const row = POWER_SMASH_LEVELS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

export const POWER_SMASH_HINT_UK =
  'Актив: потужний удар по одній цілі. Лише меч або булава (1 р. — MP 22 / power 90, 15 р. — MP 37 / power 326). Можливий надудар.';

/** Текст для магістра / UI на конкретному рівні скіла. */
export function powerSmashStatsNoteUk(rank: number): string {
  const row = powerSmashMpPowerAtRank(rank);
  const lv = Math.max(1, Math.floor(rank));
  if (!row) {
    return 'Актив: удар по одній цілі. Лише меч або булава в руці. Можливий надудар.';
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    ' скіла. Лише меч/булавою; можливий надудар.'
  );
}
