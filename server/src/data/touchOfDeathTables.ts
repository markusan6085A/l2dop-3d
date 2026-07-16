/**
 * Touch of Death (skill 342) — Human Hell Knight.
 * Дебаф по цілі: без урону, −HP кастера, CP/резисти/лікування цілі.
 */
import type { MapWorldSpawn } from './mapWorldSpawns.js';

export const TOUCH_OF_DEATH_L2_SKILL_ID = 342;
export const TOUCH_OF_DEATH_BATTLE_ID = 'l2_342';
export const TOUCH_OF_DEATH_MAX_RANK = 1;
export const TOUCH_OF_DEATH_HP_COST = 1338;
export const TOUCH_OF_DEATH_SP_COST = 32_000_000;
export const TOUCH_OF_DEATH_REQUIRED_LEVEL = 78;
export const TOUCH_OF_DEATH_COOLDOWN_SEC = 600;
export const TOUCH_OF_DEATH_CAST_SEC = 1.8;
export const TOUCH_OF_DEATH_DURATION_SEC = 120;
export const TOUCH_OF_DEATH_BASE_LAND_CHANCE_PCT = 40;
export const TOUCH_OF_DEATH_CANCEL_BUFFS_CHANCE_PCT = 25;
export const TOUCH_OF_DEATH_CP_DRAIN_PCT = 90;
export const TOUCH_OF_DEATH_MAX_CP_REDUCE_PCT = 90;
export const TOUCH_OF_DEATH_DEBUFF_RESIST_PENALTY_PCT = 30;
export const TOUCH_OF_DEATH_HEAL_RECEIVED_PENALTY_PCT = 30;
/** Каст лише при HP персонажа ≤ 75% max. */
export const TOUCH_OF_DEATH_MAX_SELF_HP_RATIO = 0.75;

export const TOUCH_OF_DEATH_HINT_UK =
  'Дебаф по цілі в ближньому бою (без урону): −' +
  TOUCH_OF_DEATH_HP_COST +
  ' HP, шанс 40% (CON цілі); 2 хв — −90% CP, −30% резист дебафів і лікування; 25% зняти всі бафи. ' +
  'Лише при HP ≤ 75%. Hell Knight, 78 лв, 1 р. Каст ' +
  TOUCH_OF_DEATH_CAST_SEC +
  ' с, відкат ' +
  TOUCH_OF_DEATH_COOLDOWN_SEC / 60 +
  ' хв.';

export function touchOfDeathHpCostAtRank(_rank: number): number {
  return TOUCH_OF_DEATH_HP_COST;
}

export function touchOfDeathRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  if (r < 1) return undefined;
  return TOUCH_OF_DEATH_REQUIRED_LEVEL;
}

export function touchOfDeathSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(TOUCH_OF_DEATH_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return TOUCH_OF_DEATH_SP_COST;
}

export function touchOfDeathDurationMs(): number {
  return TOUCH_OF_DEATH_DURATION_SEC * 1000;
}

/** Епіки/epic_guard — імунітет (як Shield Slam). */
export function spawnBlocksTouchOfDeath(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return kind === 'epic' || kind === 'epic_guard';
}

export function touchOfDeathStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.min(TOUCH_OF_DEATH_MAX_RANK, Math.floor(rank)));
  return (
    'Дебаф 2 хв (шанс ' +
    TOUCH_OF_DEATH_BASE_LAND_CHANCE_PCT +
    '%, CON цілі): −' +
    TOUCH_OF_DEATH_CP_DRAIN_PCT +
    '% CP, max CP −' +
    TOUCH_OF_DEATH_MAX_CP_REDUCE_PCT +
    '%, резист дебафів −' +
    TOUCH_OF_DEATH_DEBUFF_RESIST_PENALTY_PCT +
    '%, лікування −' +
    TOUCH_OF_DEATH_HEAL_RECEIVED_PENALTY_PCT +
    '%; 25% зняти бафи. −' +
    TOUCH_OF_DEATH_HP_COST +
    ' HP, лише при HP ≤ 75%, ближній бій, р. ' +
    r +
    ', каст ' +
    TOUCH_OF_DEATH_CAST_SEC +
    ' с, відкат ' +
    TOUCH_OF_DEATH_COOLDOWN_SEC / 60 +
    ' хв.'
  );
}

export function touchOfDeathSkillLineUk(
  applied: boolean,
  blocked: boolean,
  cancelBuffsProc: boolean,
  durationSec: number
): string {
  if (blocked) {
    return 'Дотик смерті (342): ціль імунна (епік).';
  }
  if (!applied) {
    return 'Дотик смерті (342): не вдалося накласти (CON цілі).';
  }
  let line =
    'Дотик смерті (342): дебаф на ' +
    durationSec / 60 +
    ' хв — −' +
    TOUCH_OF_DEATH_CP_DRAIN_PCT +
    '% CP, max CP −' +
    TOUCH_OF_DEATH_MAX_CP_REDUCE_PCT +
    '%, резист −' +
    TOUCH_OF_DEATH_DEBUFF_RESIST_PENALTY_PCT +
    '%, лікування −' +
    TOUCH_OF_DEATH_HEAL_RECEIVED_PENALTY_PCT +
    '%.';
  if (cancelBuffsProc) {
    line += ' З цілі знято всі бафи (25%).';
  }
  return line;
}
