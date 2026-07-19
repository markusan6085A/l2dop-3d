import { getZonedParts } from './clanSiegeTime.js';

/** Щоденний reset о 00:00 за київським часом (Europe/Kyiv). */
export const DAILY_QUEST_TIMEZONE = 'Europe/Kyiv';

function formatDayKey(y: number, m: number, d: number): string {
  return String(y) + String(m).padStart(2, '0') + String(d).padStart(2, '0');
}

/** Ключ поточного «дня» щоденок: календарна доба Europe/Kyiv (reset о 00:00). */
export function dailyResetDayKey(nowMs: number): string {
  const p = getZonedParts(new Date(nowMs), DAILY_QUEST_TIMEZONE);
  return formatDayKey(p.year, p.month, p.day);
}

export const DAILY_QUEST_RESET_HINT_UK =
  'Оновлення щодня о 00:00 за київським часом.';
