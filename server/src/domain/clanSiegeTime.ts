import { SIEGE_TIME_ZONE } from './clanSiegeConfig.js';

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: number;
};

const WEEKDAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

/** Локальні компоненти дати/часу в IANA timezone (Europe/Kyiv). */
export function getZonedParts(date: Date, timeZone = SIEGE_TIME_ZONE): ZonedParts {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const hourRaw = Number(get('hour'));
  return {
    year: Number(get('year')),
    month: Number(get('month')),
    day: Number(get('day')),
    hour: hourRaw === 24 ? 0 : hourRaw,
    minute: Number(get('minute')),
    second: Number(get('second')),
    weekday: WEEKDAY_MAP[get('weekday')] ?? 0,
  };
}

/** Локальний час у timezone → UTC Date (ітеративна корекція через Intl). */
export function zonedLocalToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone = SIEGE_TIME_ZONE
): Date {
  let utcMs = Date.UTC(year, month - 1, day, hour, minute, 0);
  for (let i = 0; i < 8; i++) {
    const p = getZonedParts(new Date(utcMs), timeZone);
    if (
      p.year === year &&
      p.month === month &&
      p.day === day &&
      p.hour === hour &&
      p.minute === minute &&
      p.second === 0
    ) {
      return new Date(utcMs - p.second * 1000);
    }
    const desiredLocalAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
    const actualLocalAsUtc = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour,
      p.minute,
      p.second
    );
    utcMs += desiredLocalAsUtc - actualLocalAsUtc;
  }
  throw new Error(
    `zonedLocalToUtc failed ${year}-${month}-${day} ${hour}:${minute} ${timeZone}`
  );
}
