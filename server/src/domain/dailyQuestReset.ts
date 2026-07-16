/** Щоденний reset о 23:00 за польським часом (Europe/Warsaw, CET/CEST). */
export const DAILY_QUEST_RESET_HOUR = 23;
export const DAILY_QUEST_TIMEZONE = 'Europe/Warsaw';

type WarsawClock = { y: number; m: number; d: number; hour: number };

function warsawClock(nowMs: number): WarsawClock {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: DAILY_QUEST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    hour12: false,
  });
  const parts: Record<string, string> = Object.create(null);
  for (const p of formatter.formatToParts(new Date(nowMs))) {
    if (p.type !== 'literal') parts[p.type] = p.value;
  }
  let hour = Number(parts.hour) || 0;
  if (hour === 24) hour = 0;
  return {
    y: Number(parts.year) || 1970,
    m: Number(parts.month) || 1,
    d: Number(parts.day) || 1,
    hour,
  };
}

function formatDayKey(y: number, m: number, d: number): string {
  return String(y) + String(m).padStart(2, '0') + String(d).padStart(2, '0');
}

function addCalendarDays(
  y: number,
  m: number,
  d: number,
  delta: number
): { y: number; m: number; d: number } {
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

/** Ключ поточного «дня» щоденок: період від 23:00 до наступної 22:59:59 (Warsaw). */
export function dailyResetDayKey(nowMs: number): string {
  const w = warsawClock(nowMs);
  if (w.hour >= DAILY_QUEST_RESET_HOUR) {
    return formatDayKey(w.y, w.m, w.d);
  }
  const prev = addCalendarDays(w.y, w.m, w.d, -1);
  return formatDayKey(prev.y, prev.m, prev.d);
}

export const DAILY_QUEST_RESET_HINT_UK =
  'Оновлення щодня о 23:00 (за польським часом).';
