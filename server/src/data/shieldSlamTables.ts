/**
 * Shield Slam (skill 353) — Phoenix Knight / Hell Knight.
 * Дебаф щитом: збиття цілі + блок фізичних умінь на 2 хв (без урону).
 */
import type { MapWorldSpawn } from './mapWorldSpawns.js';

export const SHIELD_SLAM_L2_SKILL_ID = 353;
export const SHIELD_SLAM_BATTLE_ID = 'l2_353';
export const SHIELD_SLAM_MAX_RANK = 1;
export const SHIELD_SLAM_BASE_LAND_CHANCE_PCT = 40;
export const SHIELD_SLAM_COOLDOWN_SEC = 60;
export const SHIELD_SLAM_CAST_SEC = 2;
export const SHIELD_SLAM_DURATION_SEC = 120;
export const SHIELD_SLAM_MP_COST = 70;
export const SHIELD_SLAM_SP_COST = 20_000_000;
export const SHIELD_SLAM_REQUIRED_LEVEL = 77;

export const SHIELD_SLAM_HINT_UK =
  'Удар щитом: збиває ціль і блокує фізичні скіли на 2 хв (базовий шанс 40%, залежить від WIT цілі). ' +
  'Потрібен екіпований щит; без урону. Каст 2 с, відкат 60 с, ближній бій. ' +
  'Phoenix Knight / Hell Knight, 77 лв, 1 р.';

/** Епіки та epic_guard — імунітет (як Shield Stun). */
export function spawnBlocksShieldSlam(
  kind: MapWorldSpawn['kind'] | undefined
): boolean {
  return kind === 'epic' || kind === 'epic_guard';
}

export function shieldSlamMpAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(SHIELD_SLAM_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return SHIELD_SLAM_MP_COST;
}

export function shieldSlamRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(SHIELD_SLAM_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return SHIELD_SLAM_REQUIRED_LEVEL;
}

export function shieldSlamSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(SHIELD_SLAM_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return SHIELD_SLAM_SP_COST;
}

export function shieldSlamDurationMs(): number {
  return SHIELD_SLAM_DURATION_SEC * 1000;
}

export function shieldSlamStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.floor(rank));
  return (
    `Удар щитом (Shield Slam): шанс ${SHIELD_SLAM_BASE_LAND_CHANCE_PCT}% (мінус WIT цілі), без урону. ` +
    `Ранг ${r}: MP ${SHIELD_SLAM_MP_COST}, відкат ${SHIELD_SLAM_COOLDOWN_SEC} с. ` +
    `Блокує фізичні скіли цілі на ${SHIELD_SLAM_DURATION_SEC} с. Не діє на епіків.`
  );
}

export function shieldSlamSkillLineUk(
  applied: boolean,
  alreadyBlocked: boolean,
  slamBlocked: boolean,
  durationSec: number
): string {
  if (slamBlocked) {
    return 'Удар щитом (353): на цього ворога не діє.';
  }
  if (alreadyBlocked) {
    return 'Удар щитом (353): фізичні скіли вже заблоковані.';
  }
  if (applied) {
    return (
      `Удар щитом (353): ціль втратила фокус — фізичні скіли заблоковано на ${durationSec} с.`
    );
  }
  return 'Удар щитом (353): не вдалося накласти ефект.';
}
