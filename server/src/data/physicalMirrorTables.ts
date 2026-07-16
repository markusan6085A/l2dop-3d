/**
 * Physical Mirror (skill 350) — Phoenix Knight / Hell Knight.
 * Шанс відбити фізичний / магічний скіл назад; потрібен щит.
 */
export const PHYSICAL_MIRROR_L2_SKILL_ID = 350;
export const PHYSICAL_MIRROR_BATTLE_ID = 'l2_350';
export const PHYSICAL_MIRROR_MAX_RANK = 1;
export const PHYSICAL_MIRROR_PHYS_SKILL_REFLECT_CHANCE_PCT = 30;
export const PHYSICAL_MIRROR_MAGIC_REFLECT_CHANCE_PCT = 10;
export const PHYSICAL_MIRROR_MP_COST = 71;
export const PHYSICAL_MIRROR_SP_COST = 32_000_000;
export const PHYSICAL_MIRROR_REQUIRED_LEVEL = 78;
export const PHYSICAL_MIRROR_COOLDOWN_SEC = 600;
export const PHYSICAL_MIRROR_CAST_SEC = 2;
export const PHYSICAL_MIRROR_DURATION_SEC = 300;

export const PHYSICAL_MIRROR_HINT_UK =
  'Селф-баф на 5 хв: 30% шанс відбити фізичний скіл назад у противника, ' +
  '10% — відбити магію. Потрібен екіпований щит; без урону. ' +
  'Каст 2 с, відкат 10 хв. Phoenix Knight / Hell Knight, 78 лв, 1 р.';

export function physicalMirrorMpAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(PHYSICAL_MIRROR_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return PHYSICAL_MIRROR_MP_COST;
}

export function physicalMirrorRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(PHYSICAL_MIRROR_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return PHYSICAL_MIRROR_REQUIRED_LEVEL;
}

export function physicalMirrorSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(PHYSICAL_MIRROR_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return PHYSICAL_MIRROR_SP_COST;
}

export function physicalMirrorStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.floor(rank));
  return (
    'Фізичне дзеркало: 30% відбиття фіз. скіла, 10% — магії на ' +
    PHYSICAL_MIRROR_DURATION_SEC / 60 +
    ' хв (р. ' +
    r +
    ', MP ' +
    PHYSICAL_MIRROR_MP_COST +
    ', каст ' +
    PHYSICAL_MIRROR_CAST_SEC +
    ' с, відкат ' +
    PHYSICAL_MIRROR_COOLDOWN_SEC / 60 +
    ' хв). Потрібен щит.'
  );
}

export function physicalMirrorSkillLineUk(rank: number): string {
  const r = Math.max(1, Math.min(PHYSICAL_MIRROR_MAX_RANK, Math.floor(rank)));
  return (
    'Фізичне дзеркало (350): 30% відбиття фіз. скіла, 10% — магії на ' +
    PHYSICAL_MIRROR_DURATION_SEC / 60 +
    ' хв (р. ' +
    r +
    ').'
  );
}
