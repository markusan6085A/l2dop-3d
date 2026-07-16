/**
 * Burst Shot (skill 24) — Human Hawkeye → Sagittarius.
 * Актив з лука: урон по цілі + AoE радіус 150 навколо неї; можливий Over-hit.
 */
export const BURST_SHOT_L2_SKILL_ID = 24;
export const BURST_SHOT_BATTLE_ID = 'l2_24';
export const BURST_SHOT_MAX_RANK = 31;
export const BURST_SHOT_COOLDOWN_SEC = 25;
export const BURST_SHOT_CAST_SEC = 3.2;
export const BURST_SHOT_RANGE = 500;
export const BURST_SHOT_AOE_RADIUS = 150;

export const BURST_SHOT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 46, spCost: 22_000, power: 350, mpCost: 139 },
  { level: 2, requiredLevel: 46, spCost: 22_000, power: 370, mpCost: 143 },
  { level: 3, requiredLevel: 46, spCost: 22_000, power: 391, mpCost: 147 },
  { level: 4, requiredLevel: 49, spCost: 41_000, power: 412, mpCost: 151 },
  { level: 5, requiredLevel: 49, spCost: 41_000, power: 434, mpCost: 155 },
  { level: 6, requiredLevel: 49, spCost: 41_000, power: 457, mpCost: 160 },
  { level: 7, requiredLevel: 52, spCost: 63_000, power: 481, mpCost: 164 },
  { level: 8, requiredLevel: 52, spCost: 63_000, power: 506, mpCost: 164 },
  { level: 9, requiredLevel: 52, spCost: 63_000, power: 531, mpCost: 168 },
  { level: 10, requiredLevel: 55, spCost: 90_000, power: 557, mpCost: 173 },
  { level: 11, requiredLevel: 55, spCost: 90_000, power: 584, mpCost: 177 },
  { level: 12, requiredLevel: 55, spCost: 90_000, power: 611, mpCost: 181 },
  { level: 13, requiredLevel: 58, spCost: 93_000, power: 639, mpCost: 185 },
  { level: 14, requiredLevel: 58, spCost: 93_000, power: 668, mpCost: 189 },
  { level: 15, requiredLevel: 58, spCost: 93_000, power: 697, mpCost: 194 },
  { level: 16, requiredLevel: 60, spCost: 210_000, power: 727, mpCost: 198 },
  { level: 17, requiredLevel: 60, spCost: 210_000, power: 758, mpCost: 202 },
  { level: 18, requiredLevel: 62, spCost: 250_000, power: 789, mpCost: 202 },
  { level: 19, requiredLevel: 62, spCost: 250_000, power: 820, mpCost: 206 },
  { level: 20, requiredLevel: 64, spCost: 270_000, power: 852, mpCost: 210 },
  { level: 21, requiredLevel: 64, spCost: 270_000, power: 885, mpCost: 214 },
  { level: 22, requiredLevel: 66, spCost: 440_000, power: 917, mpCost: 218 },
  { level: 23, requiredLevel: 66, spCost: 440_000, power: 950, mpCost: 222 },
  { level: 24, requiredLevel: 68, spCost: 490_000, power: 984, mpCost: 225 },
  { level: 25, requiredLevel: 68, spCost: 490_000, power: 1017, mpCost: 229 },
  { level: 26, requiredLevel: 70, spCost: 580_000, power: 1051, mpCost: 232 },
  { level: 27, requiredLevel: 70, spCost: 580_000, power: 1084, mpCost: 236 },
  { level: 28, requiredLevel: 72, spCost: 840_000, power: 1118, mpCost: 239 },
  { level: 29, requiredLevel: 72, spCost: 840_000, power: 1151, mpCost: 243 },
  { level: 30, requiredLevel: 74, spCost: 1_400_000, power: 1185, mpCost: 246 },
  { level: 31, requiredLevel: 74, spCost: 1_400_000, power: 1218, mpCost: 249 },
] as const;

export const BURST_SHOT_HINT_UK =
  'Активний масовий фізичний скіл із лука: стріляє по цілі та завдає урону всім ворогам у радіусі ' +
  BURST_SHOT_AOE_RADIUS +
  ' навколо неї. Дальність ' +
  BURST_SHOT_RANGE +
  ', можливий Over-hit. Лише з луком. Hawkeye; 31 р. — 74 лв. ' +
  'Каст ' +
  BURST_SHOT_CAST_SEC +
  ' с, відкат ' +
  BURST_SHOT_COOLDOWN_SEC +
  ' с.';

export function burstShotMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(BURST_SHOT_MAX_RANK, Math.floor(rank)));
  const row = BURST_SHOT_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHumanFighterBattleSkills`. */
export function burstShotMpAndPower(skillRank: number): {
  mp: number;
  power: number;
} {
  return burstShotMpPowerAtRank(skillRank) ?? { mp: 139, power: 350 };
}

export function burstShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BURST_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function burstShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BURST_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function burstShotStatsNoteUk(rank: number): string {
  const row = burstShotMpPowerAtRank(rank);
  const lv = Math.max(1, Math.min(BURST_SHOT_MAX_RANK, Math.floor(rank)));
  const reqLv = BURST_SHOT_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Hawkeye, ${reqLv} лв)` : '';
  if (!row) {
    return BURST_SHOT_HINT_UK;
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    reqPart +
    '. AoE радіус ' +
    BURST_SHOT_AOE_RADIUS +
    ', дальність ' +
    BURST_SHOT_RANGE +
    '; Over-hit. Каст ' +
    BURST_SHOT_CAST_SEC +
    ' с, відкат ' +
    BURST_SHOT_COOLDOWN_SEC +
    ' с. Лише лук.'
  );
}
