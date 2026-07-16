/**
 * Bluff (skill 358) — Human Adventurer.
 * Без урону: збиває таргет, розвертає ворога спиною, оглушення.
 */
export const BLUFF_L2_SKILL_ID = 358;
export const BLUFF_BATTLE_ID = 'l2_358';
export const BLUFF_MAX_RANK = 1;
export const BLUFF_COOLDOWN_SEC = 30;
export const BLUFF_CAST_SEC = 1;
export const BLUFF_STUN_DURATION_SEC = 9;
export const BLUFF_BASE_STUN_CHANCE_PCT = 40;
export const BLUFF_LOSE_TARGET_CHANCE_PCT = 40;

export const BLUFF_LEVEL_ROWS = [
  {
    level: 1,
    requiredLevel: 77,
    spCost: 20_000_000,
    mpCost: 35,
  },
] as const;

export const BLUFF_HINT_UK =
  'Активний скіл кинджалом без урону: збиває таргет, розвертає ворога спиною (~' +
  BLUFF_STUN_DURATION_SEC +
  ' с), оглушення на ' +
  BLUFF_STUN_DURATION_SEC +
  ' с (базовий шанс ' +
  BLUFF_BASE_STUN_CHANCE_PCT +
  '%, залежить від CON цілі). ' +
  BLUFF_LOSE_TARGET_CHANCE_PCT +
  '% — ціль припиняє атакувати. Adventurer, 77 лв. Каст ' +
  BLUFF_CAST_SEC +
  ' с, відкат ' +
  BLUFF_COOLDOWN_SEC +
  ' с, ближній бій.';

export function bluffMpAtRank(rank: number): number | null {
  const r = Math.max(1, Math.min(BLUFF_MAX_RANK, Math.floor(rank)));
  const row = BLUFF_LEVEL_ROWS[r - 1];
  return row?.mpCost ?? null;
}

export function bluffRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  return BLUFF_LEVEL_ROWS[r - 1]?.requiredLevel;
}

export function bluffSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  const sp = BLUFF_LEVEL_ROWS[r - 1]?.spCost;
  return typeof sp === 'number' && sp >= 0 ? sp : undefined;
}

export function bluffStunDurationMs(): number {
  return BLUFF_STUN_DURATION_SEC * 1000;
}

export function rollBluffLoseTarget(): boolean {
  return Math.random() * 100 < BLUFF_LOSE_TARGET_CHANCE_PCT;
}

export function bluffStatsNoteUk(rank: number): string {
  const lv = Math.max(1, Math.min(BLUFF_MAX_RANK, Math.floor(rank)));
  const row = BLUFF_LEVEL_ROWS[lv - 1];
  const reqLv = row?.requiredLevel;
  const reqPart =
    typeof reqLv === 'number' && reqLv >= 1 ? ` (Adventurer, ${reqLv} лв)` : '';
  return (
    'MP ' +
    (row?.mpCost ?? 35) +
    '; без урону — таргет збито, спина відкрита ~' +
    BLUFF_STUN_DURATION_SEC +
    ' с, стан ' +
    BLUFF_BASE_STUN_CHANCE_PCT +
    '% (CON цілі), ' +
    BLUFF_LOSE_TARGET_CHANCE_PCT +
    '% припинити атаку' +
    reqPart +
    '. Каст ' +
    BLUFF_CAST_SEC +
    ' с, відкат ' +
    BLUFF_COOLDOWN_SEC +
    ' с. Лише кинджал.'
  );
}

export function bluffSkillLineUk(
  appliedStun: boolean,
  alreadyStunned: boolean,
  loseTarget: boolean,
  effStunPct: number,
  stunBlocked: boolean
): string {
  if (stunBlocked && !appliedStun) {
    return (
      'Блеф (Bluff): ворог розвернутий спиною; стан не діє на РБ/епіків.' +
      (loseTarget ? ' Ціль втратила бажання атакувати.' : '')
    );
  }
  if (alreadyStunned) {
    return (
      'Блеф (Bluff): ворог розвернутий спиною' +
      (loseTarget ? '; ціль втратила бажання атакувати' : '') +
      ' — повторне оглушення не накладено.'
    );
  }
  if (appliedStun) {
    return (
      'Блеф (Bluff): ворог розвернутий спиною й оглушений на ' +
      BLUFF_STUN_DURATION_SEC +
      ' с (~' +
      Math.round(effStunPct) +
      '%).' +
      (loseTarget ? ' Ціль втратила бажання атакувати.' : '')
    );
  }
  return (
    'Блеф (Bluff): ворог розвернутий спиною (~' +
    Math.round(effStunPct) +
    '% стану не спрацювало).' +
    (loseTarget ? ' Ціль втратила бажання атакувати.' : '')
  );
}
