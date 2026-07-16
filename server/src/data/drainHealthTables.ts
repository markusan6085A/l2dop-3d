/**
 * Drain Health (skill 70) — Interlude, Knight / Dark Avenger / Hell Knight.
 * Джерело рангів: `l2dbSkillLevelsById.generated.ts` (53 р., power 20→108).
 */
import { L2DB_SKILL_LEVELS_BY_ID } from './l2dbSkillLevelsById.generated.js';

export const DRAIN_HEALTH_L2_SKILL_ID = 70;
export const DRAIN_HEALTH_ABSORB_PCT = 20;
export const DRAIN_HEALTH_COOLDOWN_SEC = 4;

const ROWS = L2DB_SKILL_LEVELS_BY_ID[DRAIN_HEALTH_L2_SKILL_ID] ?? [];

export const DRAIN_HEALTH_MAX_RANK = ROWS.length;

export const DRAIN_HEALTH_HINT_UK =
  'Актив: темна магія по одній цілі; відновлює 20% завданого урону як HP. ' +
  '53 р. персонажа — макс. 31 р. скіла (power 72, MP 27). 74 лв — 53 р. (power 108).';

export function drainHealthRowAtRank(rank: number) {
  const r = Math.max(1, Math.min(DRAIN_HEALTH_MAX_RANK, Math.floor(rank)));
  return ROWS[r - 1];
}

export function drainHealthMpAndPowerAtRank(
  rank: number
): { mp: number; power: number } | null {
  const row = drainHealthRowAtRank(rank);
  if (!row) return null;
  const mp = row.mpCost;
  const power = row.power;
  if (!Number.isFinite(mp) || !Number.isFinite(power) || power <= 0) return null;
  return { mp: Math.floor(mp), power: Math.floor(power) };
}

/** Макс. ранг скіла при заданому рівні персонажа (l2db requiredLevel). */
export function drainHealthMaxRankAtCharLevel(charLevel: number): number {
  const lv = Math.max(1, Math.floor(charLevel));
  let max = 0;
  for (const row of ROWS) {
    if (row.requiredLevel <= lv) max = row.level;
    else break;
  }
  return Math.max(1, max || 1);
}

export function drainHealthStatsNoteUk(rank: number, charLevel?: number): string {
  const row = drainHealthMpAndPowerAtRank(rank);
  if (!row) return DRAIN_HEALTH_HINT_UK;
  const lvNote =
    typeof charLevel === 'number' && Number.isFinite(charLevel)
      ? ` (при ${Math.floor(charLevel)} лв персонажа макс. ранг ${drainHealthMaxRankAtCharLevel(charLevel)})`
      : '';
  return (
    `Темний урон по цілі; +${DRAIN_HEALTH_ABSORB_PCT}% урону як HP. ` +
    `Ранг ${Math.max(1, Math.floor(rank))}: power ${row.power}, MP ${row.mp}, відкат ~${DRAIN_HEALTH_COOLDOWN_SEC} с${lvNote}.`
  );
}
