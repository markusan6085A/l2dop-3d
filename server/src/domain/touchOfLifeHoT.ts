import {
  TOUCH_OF_LIFE_HOT_PER_TICK,
  TOUCH_OF_LIFE_HOT_TICK_SEC,
  TOUCH_OF_LIFE_L2_SKILL_ID,
  touchOfLifeHotTotalRemaining,
} from '../data/touchOfLifeTables.js';
import type { BattleJsonState, BattlePotionHoTEntry } from './battleTypes.js';

export const TOUCH_OF_LIFE_HOT_TICK_MS = TOUCH_OF_LIFE_HOT_TICK_SEC * 1000;

function tickDue(h: BattlePotionHoTEntry, nowMs: number): boolean {
  return h.remaining > 0 && nowMs >= h.nextTickAtMs;
}

export function startTouchOfLifeHoT(
  st: BattleJsonState,
  nowMs: number
): void {
  const total = touchOfLifeHotTotalRemaining();
  if (total <= 0) return;
  st.battleTouchOfLifeHpHoT = {
    remaining: total,
    perTick: TOUCH_OF_LIFE_HOT_PER_TICK,
    nextTickAtMs: nowMs,
    tickMs: TOUCH_OF_LIFE_HOT_TICK_MS,
  };
}

export function clearTouchOfLifeHoT(st: BattleJsonState): void {
  delete st.battleTouchOfLifeHpHoT;
}

export function applyTouchOfLifeHoTTicks(args: {
  nowMs: number;
  st: BattleJsonState;
  playerHp: number;
  maxHpBattle: number;
  healReceivedPct: number;
  log: string[];
}): number {
  let playerHp = args.playerHp;
  const st = args.st;
  const h = st.battleTouchOfLifeHpHoT;
  if (!h) return playerHp;

  const tickMs =
    typeof h.tickMs === 'number' && h.tickMs > 0
      ? Math.floor(h.tickMs)
      : TOUCH_OF_LIFE_HOT_TICK_MS;

  while (tickDue(h, args.nowMs)) {
    const rawStep = Math.min(h.perTick, h.remaining);
    const pct = Math.max(0, Math.min(95, Math.floor(args.healReceivedPct)));
    const step =
      pct > 0
        ? Math.max(1, Math.floor(rawStep * (1 + pct / 100)))
        : rawStep;
    const healed = Math.min(Math.max(0, args.maxHpBattle - playerHp), step);
    playerHp += healed;
    h.remaining -= rawStep;
    h.nextTickAtMs += tickMs;
    if (healed > 0) {
      args.log.push(
        'Дотик життя (341): +' + healed + ' HP (реген).'
      );
    }
    if (h.remaining <= 0) {
      delete st.battleTouchOfLifeHpHoT;
      break;
    }
  }
  return playerHp;
}

export function touchOfLifeHoTIconSkillId(): number {
  return TOUCH_OF_LIFE_L2_SKILL_ID;
}
