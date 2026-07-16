/**
 * Stun Shot (skill 101) — Human Rogue → Hawkeye.
 * Актив з лука: урон + оглушення (базовий шанс 50%, CON цілі).
 */
export const STUN_SHOT_L2_SKILL_ID = 101;
export const STUN_SHOT_BATTLE_ID = 'l2_101';
export const STUN_SHOT_MAX_RANK = 40;
export const STUN_SHOT_COOLDOWN_SEC = 10;
export const STUN_SHOT_CAST_SEC = 3;
export const STUN_SHOT_RANGE = 900;
export const STUN_SHOT_BASE_STUN_CHANCE_PCT = 50;
export const STUN_SHOT_STUN_DURATION_SEC = 9;

export const STUN_SHOT_LEVEL_ROWS = [
  { level: 1, requiredLevel: 36, spCost: 10_000, power: 287, mpCost: 69 },
  { level: 2, requiredLevel: 36, spCost: 10_000, power: 306, mpCost: 72 },
  { level: 3, requiredLevel: 36, spCost: 10_000, power: 326, mpCost: 74 },
  { level: 4, requiredLevel: 40, spCost: 16_000, power: 369, mpCost: 80 },
  { level: 5, requiredLevel: 40, spCost: 16_000, power: 392, mpCost: 82 },
  { level: 6, requiredLevel: 40, spCost: 16_000, power: 417, mpCost: 85 },
  { level: 7, requiredLevel: 43, spCost: 19_000, power: 442, mpCost: 85 },
  { level: 8, requiredLevel: 43, spCost: 19_000, power: 469, mpCost: 87 },
  { level: 9, requiredLevel: 43, spCost: 19_000, power: 496, mpCost: 90 },
  { level: 10, requiredLevel: 46, spCost: 22_000, power: 525, mpCost: 93 },
  { level: 11, requiredLevel: 46, spCost: 22_000, power: 555, mpCost: 95 },
  { level: 12, requiredLevel: 46, spCost: 22_000, power: 586, mpCost: 98 },
  { level: 13, requiredLevel: 49, spCost: 41_000, power: 618, mpCost: 101 },
  { level: 14, requiredLevel: 49, spCost: 41_000, power: 651, mpCost: 104 },
  { level: 15, requiredLevel: 49, spCost: 41_000, power: 686, mpCost: 107 },
  { level: 16, requiredLevel: 52, spCost: 63_000, power: 722, mpCost: 109 },
  { level: 17, requiredLevel: 52, spCost: 63_000, power: 758, mpCost: 110 },
  { level: 18, requiredLevel: 52, spCost: 63_000, power: 796, mpCost: 112 },
  { level: 19, requiredLevel: 55, spCost: 90_000, power: 835, mpCost: 115 },
  { level: 20, requiredLevel: 55, spCost: 90_000, power: 875, mpCost: 118 },
  { level: 21, requiredLevel: 55, spCost: 90_000, power: 916, mpCost: 121 },
  { level: 22, requiredLevel: 58, spCost: 93_000, power: 959, mpCost: 124 },
  { level: 23, requiredLevel: 58, spCost: 93_000, power: 1002, mpCost: 126 },
  { level: 24, requiredLevel: 58, spCost: 93_000, power: 1046, mpCost: 129 },
  { level: 25, requiredLevel: 60, spCost: 210_000, power: 1091, mpCost: 132 },
  { level: 26, requiredLevel: 60, spCost: 210_000, power: 1136, mpCost: 135 },
  { level: 27, requiredLevel: 62, spCost: 250_000, power: 1183, mpCost: 135 },
  { level: 28, requiredLevel: 62, spCost: 250_000, power: 1230, mpCost: 138 },
  { level: 29, requiredLevel: 64, spCost: 270_000, power: 1278, mpCost: 140 },
  { level: 30, requiredLevel: 64, spCost: 270_000, power: 1327, mpCost: 143 },
  { level: 31, requiredLevel: 66, spCost: 440_000, power: 1376, mpCost: 145 },
  { level: 32, requiredLevel: 66, spCost: 440_000, power: 1425, mpCost: 148 },
  { level: 33, requiredLevel: 68, spCost: 490_000, power: 1475, mpCost: 150 },
  { level: 34, requiredLevel: 68, spCost: 490_000, power: 1525, mpCost: 153 },
  { level: 35, requiredLevel: 70, spCost: 580_000, power: 1576, mpCost: 155 },
  { level: 36, requiredLevel: 70, spCost: 580_000, power: 1626, mpCost: 157 },
  { level: 37, requiredLevel: 72, spCost: 840_000, power: 1677, mpCost: 160 },
  { level: 38, requiredLevel: 72, spCost: 840_000, power: 1727, mpCost: 162 },
  { level: 39, requiredLevel: 74, spCost: 1_400_000, power: 1777, mpCost: 164 },
  { level: 40, requiredLevel: 74, spCost: 1_400_000, power: 1827, mpCost: 166 },
] as const;

export const STUN_SHOT_HINT_UK =
  'Актив з лука: урон + оглушення цілі на ' +
  STUN_SHOT_STUN_DURATION_SEC +
  ' с (базовий шанс ' +
  STUN_SHOT_BASE_STUN_CHANCE_PCT +
  '%, залежить від CON цілі). Повторне оглушення не накладається, поки діє ефект. ' +
  '1–3 р. — Rogue (36 лв); 4–40 р. — Hawkeye. Каст ' +
  STUN_SHOT_CAST_SEC +
  ' с, відкат ' +
  STUN_SHOT_COOLDOWN_SEC +
  ' с, дальність ' +
  STUN_SHOT_RANGE +
  '. Можливий Over-hit.';

export function stunShotMpPowerAtRank(rank: number): {
  mp: number;
  power: number;
} | null {
  const r = Math.max(1, Math.min(STUN_SHOT_MAX_RANK, Math.floor(rank)));
  const row = STUN_SHOT_LEVEL_ROWS[r - 1];
  if (!row) return null;
  return { mp: row.mpCost, power: row.power };
}

/** Зворотна сумісність з `l2dopHumanFighterBattleSkills`. */
export function stunShotMpAndPower(skillRank: number): {
  mp: number;
  power: number;
} {
  return stunShotMpPowerAtRank(skillRank) ?? { mp: 69, power: 287 };
}

export function stunShotRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return STUN_SHOT_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function stunShotSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = STUN_SHOT_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function stunShotStunDurationMs(): number {
  return STUN_SHOT_STUN_DURATION_SEC * 1000;
}

export function stunShotStatsNoteUk(rank: number): string {
  const row = stunShotMpPowerAtRank(rank);
  const lv = Math.max(1, Math.min(STUN_SHOT_MAX_RANK, Math.floor(rank)));
  const reqLv = STUN_SHOT_LEVEL_ROWS[lv - 1]?.requiredLevel;
  const profPart =
    lv <= 3 ? 'Rogue' : lv >= 4 ? 'Hawkeye' : '';
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1
      ? ` (${profPart}, ${reqLv} лв)`
      : '';
  if (!row) {
    return STUN_SHOT_HINT_UK;
  }
  return (
    'Актив: MP ' +
    row.mp +
    ', power ' +
    row.power +
    ' на р. ' +
    lv +
    reqPart +
    '. Оглушення ~' +
    STUN_SHOT_BASE_STUN_CHANCE_PCT +
    '% на ' +
    STUN_SHOT_STUN_DURATION_SEC +
    ' с (CON цілі). Каст ' +
    STUN_SHOT_CAST_SEC +
    ' с, відкат ' +
    STUN_SHOT_COOLDOWN_SEC +
    ' с, дальність ' +
    STUN_SHOT_RANGE +
    '. Лише лук.'
  );
}

export function stunShotSkillLineUk(
  appliedStun: boolean,
  alreadyStunned: boolean,
  effStunPct: number
): string {
  if (alreadyStunned) {
    return 'Оглушливий постріл (Stun Shot): ціль уже оглушена — повторний стан не накладено.';
  }
  if (appliedStun) {
    return (
      'Оглушливий постріл (Stun Shot): ціль оглушена на ' +
      STUN_SHOT_STUN_DURATION_SEC +
      ' с (~' +
      Math.round(effStunPct) +
      '%).'
    );
  }
  return (
    'Оглушливий постріл (Stun Shot): оглушення не спрацювало (~' +
    Math.round(effStunPct) +
    '%).'
  );
}
