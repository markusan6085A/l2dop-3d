import { jsonFiniteNum } from './battleModsJson.js';
import type { BattleJsonState } from './battle.js';

/** Моб/РБ під Shock/Stun — не може бити, поки не минув `mobStunUntilMs`. */
export function isMobStunnedNow(st: BattleJsonState, nowMs: number): boolean {
  const until = jsonFiniteNum(st.battleMods?.mobStunUntilMs);
  return until !== undefined && until > nowMs;
}

/** Моб під Sleep — не атакує, поки не минув `mobSleepUntilMs`. */
export function isMobSleepingNow(st: BattleJsonState, nowMs: number): boolean {
  const until = jsonFiniteNum(st.battleMods?.mobSleepUntilMs);
  return until !== undefined && until > nowMs;
}

/** Shield Slam (353): моб не може використовувати фізичні скіли / контратакувати. */
export function isMobPhysSkillsBlockedNow(
  st: BattleJsonState,
  nowMs: number
): boolean {
  const until = jsonFiniteNum(st.battleMods?.mobPhysSkillsBlockedUntilMs);
  return until !== undefined && until > nowMs;
}

/** Контроль (stun/sleep/блок фіз. скілів): ціль не може контратакувати. */
export function isMobUnableToAttackNow(
  st: BattleJsonState,
  nowMs: number
): boolean {
  return (
    isMobStunnedNow(st, nowMs) ||
    isMobSleepingNow(st, nowMs) ||
    isMobPhysSkillsBlockedNow(st, nowMs)
  );
}

/** Коли моб під контролем — наступна спроба автоатаки РБ після закінчення стану. */
export function mobControlResumeAtMs(
  st: BattleJsonState,
  nowMs: number
): number | null {
  if (!isMobUnableToAttackNow(st, nowMs)) return null;
  const stunUntil = jsonFiniteNum(st.battleMods?.mobStunUntilMs) ?? 0;
  const sleepUntil = jsonFiniteNum(st.battleMods?.mobSleepUntilMs) ?? 0;
  const physBlockUntil =
    jsonFiniteNum(st.battleMods?.mobPhysSkillsBlockedUntilMs) ?? 0;
  return Math.max(nowMs + 200, stunUntil, sleepUntil, physBlockUntil);
}
