/**
 * Touch of Life (skill 341) — Phoenix Knight / Eva's Templar.
 * Миттєве зцілення 50% max HP + захисний ефект 2 хв (HoT, резисти).
 */
export const TOUCH_OF_LIFE_L2_SKILL_ID = 341;
export const TOUCH_OF_LIFE_BATTLE_ID = 'l2_341';
export const TOUCH_OF_LIFE_MAX_RANK = 1;
export const TOUCH_OF_LIFE_HP_COST = 1621;
export const TOUCH_OF_LIFE_INSTANT_HEAL_MAX_HP_PCT = 50;
export const TOUCH_OF_LIFE_SP_COST = 32_000_000;
export const TOUCH_OF_LIFE_REQUIRED_LEVEL = 78;
export const TOUCH_OF_LIFE_COOLDOWN_SEC = 1200;
export const TOUCH_OF_LIFE_CAST_SEC = 1.8;
export const TOUCH_OF_LIFE_DURATION_SEC = 120;
export const TOUCH_OF_LIFE_HOT_PER_TICK = 250;
export const TOUCH_OF_LIFE_HOT_TICK_SEC = 5;
export const TOUCH_OF_LIFE_CANCEL_RESIST_PCT = 60;
export const TOUCH_OF_LIFE_DEBUFF_RESIST_PCT = 30;
export const TOUCH_OF_LIFE_HEAL_RECEIVED_PCT = 30;

export const TOUCH_OF_LIFE_HINT_UK =
  'Зцілює 50% max HP цілі (−' +
  TOUCH_OF_LIFE_HP_COST +
  ' HP витрати) і на 2 хв: +' +
  TOUCH_OF_LIFE_HOT_PER_TICK +
  ' HP кожні ' +
  TOUCH_OF_LIFE_HOT_TICK_SEC +
  ' с, Cancel +' +
  TOUCH_OF_LIFE_CANCEL_RESIST_PCT +
  '%, дебаф +' +
  TOUCH_OF_LIFE_DEBUFF_RESIST_PCT +
  '%, лікування +' +
  TOUCH_OF_LIFE_HEAL_RECEIVED_PCT +
  '%. Себе або союзника поруч. Каст ' +
  TOUCH_OF_LIFE_CAST_SEC +
  ' с, відкат ' +
  TOUCH_OF_LIFE_COOLDOWN_SEC / 60 +
  ' хв. Phoenix Knight / Eva\'s Templar, 78 лв, 1 р.';

export function touchOfLifeHpCostAtRank(_rank: number): number {
  return TOUCH_OF_LIFE_HP_COST;
}

export function touchOfLifeRequiredLevelAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.floor(rank));
  if (r < 1) return undefined;
  return TOUCH_OF_LIFE_REQUIRED_LEVEL;
}

export function touchOfLifeSpCostAtRank(rank: number): number | undefined {
  const r = Math.max(1, Math.min(TOUCH_OF_LIFE_MAX_RANK, Math.floor(rank)));
  if (r < 1) return undefined;
  return TOUCH_OF_LIFE_SP_COST;
}

export function touchOfLifeInstantHealAmount(maxHp: number): number {
  const cap = Math.max(1, Math.floor(maxHp));
  return Math.max(1, Math.floor(cap * (TOUCH_OF_LIFE_INSTANT_HEAL_MAX_HP_PCT / 100)));
}

export function touchOfLifeHotTotalRemaining(): number {
  const ticks = Math.floor(TOUCH_OF_LIFE_DURATION_SEC / TOUCH_OF_LIFE_HOT_TICK_SEC);
  return Math.max(0, ticks * TOUCH_OF_LIFE_HOT_PER_TICK);
}

export function touchOfLifeActiveBuffDelta(): {
  addDebuffResistPct: number;
  addCancelResistPct: number;
  addHealReceivedPct: number;
} {
  return {
    addDebuffResistPct: TOUCH_OF_LIFE_DEBUFF_RESIST_PCT,
    addCancelResistPct: TOUCH_OF_LIFE_CANCEL_RESIST_PCT,
    addHealReceivedPct: TOUCH_OF_LIFE_HEAL_RECEIVED_PCT,
  };
}

export function touchOfLifeStatsNoteUk(rank: number): string {
  const r = Math.max(1, Math.floor(rank));
  return (
    'Дотик життя: 50% max HP, −' +
    TOUCH_OF_LIFE_HP_COST +
    ' HP; 2 хв — +' +
    TOUCH_OF_LIFE_HOT_PER_TICK +
    ' HP/' +
    TOUCH_OF_LIFE_HOT_TICK_SEC +
    ' с, Cancel +' +
    TOUCH_OF_LIFE_CANCEL_RESIST_PCT +
    '%, дебаф +' +
    TOUCH_OF_LIFE_DEBUFF_RESIST_PCT +
    '%, лікування +' +
    TOUCH_OF_LIFE_HEAL_RECEIVED_PCT +
    '% (р. ' +
    r +
    ', відкат ' +
    TOUCH_OF_LIFE_COOLDOWN_SEC / 60 +
    ' хв).'
  );
}

export function touchOfLifeSkillLineUk(rank: number): string {
  const r = Math.max(1, Math.min(TOUCH_OF_LIFE_MAX_RANK, Math.floor(rank)));
  return (
    'Дотик життя (341): 50% max HP + захист на ' +
    TOUCH_OF_LIFE_DURATION_SEC / 60 +
    ' хв (р. ' +
    r +
    ').'
  );
}

export function amplifyHealByReceivedPct(
  heal: number,
  healReceivedPct: number
): number {
  const base = Math.max(0, Math.floor(heal));
  if (base <= 0) return 0;
  const pct = Math.max(0, Math.min(95, Math.floor(healReceivedPct)));
  if (pct <= 0) return base;
  return Math.max(1, Math.floor(base * (1 + pct / 100)));
}
