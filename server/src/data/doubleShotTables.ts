/**
 * Double Shot (skill 19) — Human Hawkeye → Sagittarius.
 * Актив з лука: дві стріли по одній цілі, фізичний урон; можливий Over-hit.
 */
export const DOUBLE_SHOT_L2_SKILL_ID = 19;
export const DOUBLE_SHOT_BATTLE_ID = 'l2_19';
export const DOUBLE_SHOT_MAX_RANK = 37;
export const DOUBLE_SHOT_COOLDOWN_SEC = 25;
export const DOUBLE_SHOT_CAST_SEC = 3;
export const DOUBLE_SHOT_RANGE = 900;

export const DOUBLE_SHOT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 40, spCost: 16_000, power: 984, mpCost: 80 },
  { level: 2, requiredLevel: 40, spCost: 16_000, power: 1046, mpCost: 82 },
  { level: 3, requiredLevel: 40, spCost: 16_000, power: 1110, mpCost: 85 },
  { level: 4, requiredLevel: 43, spCost: 19_000, power: 1178, mpCost: 85 },
  { level: 5, requiredLevel: 43, spCost: 19_000, power: 1249, mpCost: 87 },
  { level: 6, requiredLevel: 43, spCost: 19_000, power: 1322, mpCost: 90 },
  { level: 7, requiredLevel: 46, spCost: 22_000, power: 1399, mpCost: 93 },
  { level: 8, requiredLevel: 46, spCost: 22_000, power: 1479, mpCost: 95 },
  { level: 9, requiredLevel: 46, spCost: 22_000, power: 1562, mpCost: 98 },
  { level: 10, requiredLevel: 49, spCost: 41_000, power: 1647, mpCost: 101 },
  { level: 11, requiredLevel: 49, spCost: 41_000, power: 1736, mpCost: 104 },
  { level: 12, requiredLevel: 49, spCost: 41_000, power: 1828, mpCost: 107 },
  { level: 13, requiredLevel: 52, spCost: 63_000, power: 1923, mpCost: 109 },
  { level: 14, requiredLevel: 52, spCost: 63_000, power: 2021, mpCost: 110 },
  { level: 15, requiredLevel: 52, spCost: 63_000, power: 2123, mpCost: 112 },
  { level: 16, requiredLevel: 55, spCost: 90_000, power: 2227, mpCost: 115 },
  { level: 17, requiredLevel: 55, spCost: 90_000, power: 2333, mpCost: 118 },
  { level: 18, requiredLevel: 55, spCost: 90_000, power: 2443, mpCost: 121 },
  { level: 19, requiredLevel: 58, spCost: 93_000, power: 2555, mpCost: 124 },
  { level: 20, requiredLevel: 58, spCost: 93_000, power: 2670, mpCost: 126 },
  { level: 21, requiredLevel: 58, spCost: 93_000, power: 2788, mpCost: 129 },
  { level: 22, requiredLevel: 60, spCost: 210_000, power: 2908, mpCost: 132 },
  { level: 23, requiredLevel: 60, spCost: 210_000, power: 3030, mpCost: 135 },
  { level: 24, requiredLevel: 62, spCost: 250_000, power: 3154, mpCost: 135 },
  { level: 25, requiredLevel: 62, spCost: 250_000, power: 3280, mpCost: 138 },
  { level: 26, requiredLevel: 64, spCost: 270_000, power: 3408, mpCost: 140 },
  { level: 27, requiredLevel: 64, spCost: 270_000, power: 3537, mpCost: 143 },
  { level: 28, requiredLevel: 66, spCost: 440_000, power: 3668, mpCost: 145 },
  { level: 29, requiredLevel: 66, spCost: 440_000, power: 3800, mpCost: 148 },
  { level: 30, requiredLevel: 68, spCost: 490_000, power: 3933, mpCost: 150 },
  { level: 31, requiredLevel: 68, spCost: 490_000, power: 4067, mpCost: 153 },
  { level: 32, requiredLevel: 70, spCost: 580_000, power: 4201, mpCost: 155 },
  { level: 33, requiredLevel: 70, spCost: 580_000, power: 4336, mpCost: 157 },
  { level: 34, requiredLevel: 72, spCost: 840_000, power: 4470, mpCost: 160 },
  { level: 35, requiredLevel: 72, spCost: 840_000, power: 4604, mpCost: 162 },
  { level: 36, requiredLevel: 74, spCost: 1_400_000, power: 4738, mpCost: 164 },
  { level: 37, requiredLevel: 74, spCost: 1_400_000, power: 4870, mpCost: 166 },
] as const;

export const DOUBLE_SHOT_HINT_UK =
  'Активний фізичний скіл із лука: швидко випускає дві стріли та завдає фізичного урону. ' +
  'Можливий Over-hit. Каст ' +
  DOUBLE_SHOT_CAST_SEC +
  ' с, відкат ' +
  DOUBLE_SHOT_COOLDOWN_SEC +
  ' с, дальність ' +
  DOUBLE_SHOT_RANGE +
  '. Лише з луком. Hawkeye; 37 р. — 74 лв.';

export function doubleShotMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(DOUBLE_SHOT_MAX_RANK, Math.floor(rank)));
  const row = DOUBLE_SHOT_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHumanFighterBattleSkills`. */
export function doubleShotMpAndPower(skillRank: number): {
  mp: number;
  power: number;
} {
  return doubleShotMpPowerAtRank(skillRank) ?? { mp: 80, power: 984 };
}

export function doubleShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return DOUBLE_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function doubleShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = DOUBLE_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function doubleShotStatsNoteUk(rank: number): string {
  const row = doubleShotMpPowerAtRank(rank);
  const lv = Math.max(1, Math.min(DOUBLE_SHOT_MAX_RANK, Math.floor(rank)));
  const reqLv = DOUBLE_SHOT_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Hawkeye, ${reqLv} лв)` : '';
  if (!row) {
    return DOUBLE_SHOT_HINT_UK;
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    reqPart +
    '. Дві стріли по цілі; Over-hit. Каст ' +
    DOUBLE_SHOT_CAST_SEC +
    ' с, відкат ' +
    DOUBLE_SHOT_COOLDOWN_SEC +
    ' с, дальність ' +
    DOUBLE_SHOT_RANGE +
    '. Лише лук.'
  );
}
