import type { ClanSiege } from '@prisma/client';
import {
  SIEGE_CITY_SLOTS,
  SIEGE_DURATION_MINUTES,
  SIEGE_TIME_ZONE,
  SIEGE_WALL_MAX_HP,
  getSiegeCitySlot,
  type SiegeCitySlot,
} from '../../domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../../domain/clanSiegeConstants.js';
import { getZonedParts, zonedLocalToUtc } from '../../domain/clanSiegeTime.js';
import { prisma } from '../../lib/prisma.js';
import { isPrismaUniqueViolation } from '../party/partyPrismaErrors.js';

export function resolveSiegeWindowForSlotOnKyivDate(
  slot: SiegeCitySlot,
  kyivDate: { year: number; month: number; day: number }
): { startsAt: Date; endsAt: Date } {
  const startsAt = zonedLocalToUtc(
    kyivDate.year,
    kyivDate.month,
    kyivDate.day,
    slot.startHour,
    slot.startMinute,
    SIEGE_TIME_ZONE
  );
  const endsAt = new Date(
    startsAt.getTime() + SIEGE_DURATION_MINUTES * 60_000
  );
  return { startsAt, endsAt };
}

export type KyivCalendarDate = {
  year: number;
  month: number;
  day: number;
};

/** Поточна календарна дата в Europe/Kyiv. */
export function resolveKyivCalendarDate(nowMs = Date.now()): KyivCalendarDate {
  const parts = getZonedParts(new Date(nowMs), SIEGE_TIME_ZONE);
  return { year: parts.year, month: parts.month, day: parts.day };
}

/** @deprecated alias — облоги щоденні, завжди «сьогодні» за Kyiv. */
export function resolveCurrentSiegeKyivDate(nowMs = Date.now()): KyivCalendarDate {
  return resolveKyivCalendarDate(nowMs);
}

/** +N календарних днів у Europe/Kyiv (без зсуву через DST-пастки опівдні). */
export function addKyivCalendarDays(
  date: KyivCalendarDate,
  days: number
): KyivCalendarDate {
  const anchor = zonedLocalToUtc(date.year, date.month, date.day, 12, 0, SIEGE_TIME_ZONE);
  const shifted = new Date(anchor.getTime() + days * 86_400_000);
  const parts = getZonedParts(shifted, SIEGE_TIME_ZONE);
  return { year: parts.year, month: parts.month, day: parts.day };
}

/** Найближче майбутнє вікно облоги міста за щоденним розкладом (без БД). */
export function resolveUpcomingDailySiegeWindowForCity(
  cityId: string,
  nowMs = Date.now()
): { startsAt: Date; endsAt: Date } | null {
  const slot = getSiegeCitySlot(cityId);
  if (!slot) return null;

  const today = resolveKyivCalendarDate(nowMs);
  const todayWindow = resolveSiegeWindowForSlotOnKyivDate(slot, today);
  if (todayWindow.endsAt.getTime() > nowMs) {
    return todayWindow;
  }

  const tomorrow = addKyivCalendarDays(today, 1);
  return resolveSiegeWindowForSlotOnKyivDate(slot, tomorrow);
}

/** @deprecated — використовуй resolveUpcomingDailySiegeWindowForCity. */
export const resolveUpcomingWeeklySiegeWindowForCity =
  resolveUpcomingDailySiegeWindowForCity;

/** Усі 8 слотів одного календарного дня Kyiv. */
export function resolveDailySiegeWindowsForKyivDate(
  kyivDate: KyivCalendarDate
): Array<{ cityId: string; startsAt: Date; endsAt: Date }> {
  return SIEGE_CITY_SLOTS.map((slot) => {
    const window = resolveSiegeWindowForSlotOnKyivDate(slot, kyivDate);
    return { cityId: slot.cityId, ...window };
  });
}

/** Створити scheduled-рядки на день облог (idempotent upsert). */
export async function ensureSiegeScheduleForKyivDate(
  kyivDate: KyivCalendarDate
): Promise<void> {
  for (const slot of SIEGE_CITY_SLOTS) {
    const { startsAt, endsAt } = resolveSiegeWindowForSlotOnKyivDate(
      slot,
      kyivDate
    );
    try {
      await prisma.clanSiege.upsert({
        where: {
          cityId_startsAt: { cityId: slot.cityId, startsAt },
        },
        create: {
          cityId: slot.cityId,
          startsAt,
          endsAt,
          state: CLAN_SIEGE_STATE.scheduled,
          wallHp: SIEGE_WALL_MAX_HP,
          wallMaxHp: SIEGE_WALL_MAX_HP,
        },
        update: {},
      });
    } catch (err) {
      if (!isPrismaUniqueViolation(err)) throw err;
    }
  }
}

/** Idempotent: сьогоднішні 8 слотів (GET/tick). */
export async function ensureTodaySiegeSchedule(nowMs = Date.now()): Promise<void> {
  await ensureSiegeScheduleForKyivDate(resolveKyivCalendarDate(nowMs));
}

export async function findSiegeRowForCityAtTime(
  cityId: string,
  nowMs = Date.now()
): Promise<ClanSiege | null> {
  const now = new Date(nowMs);
  return prisma.clanSiege.findFirst({
    where: {
      cityId: String(cityId || '').trim(),
      testKey: null,
      startsAt: { lte: now },
      endsAt: { gte: now },
    },
    orderBy: { startsAt: 'desc' },
  });
}

export async function findLatestSiegeForCity(
  cityId: string
): Promise<ClanSiege | null> {
  return prisma.clanSiege.findFirst({
    where: {
      cityId: String(cityId || '').trim(),
      testKey: null,
    },
    orderBy: { startsAt: 'desc' },
  });
}

/** Найближча майбутня облога міста (scheduled або поточна). */
export async function findUpcomingSiegeForCity(
  cityId: string,
  nowMs = Date.now()
): Promise<ClanSiege | null> {
  const now = new Date(nowMs);
  const current = await findSiegeRowForCityAtTime(cityId, nowMs);
  if (current) return current;
  return prisma.clanSiege.findFirst({
    where: {
      cityId: String(cityId || '').trim(),
      testKey: null,
      startsAt: { gt: now },
      state: CLAN_SIEGE_STATE.scheduled,
    },
    orderBy: { startsAt: 'asc' },
  });
}

/** Рядок для GET state: поточна / майбутня / завершена в межах вікна. */
export async function resolveSiegeRowForCityView(
  cityId: string,
  nowMs = Date.now()
): Promise<ClanSiege | null> {
  const current = await findSiegeRowForCityAtTime(cityId, nowMs);
  if (current) return current;

  const upcoming = await findUpcomingSiegeForCity(cityId, nowMs);
  if (upcoming) return upcoming;

  const latest = await findLatestSiegeForCity(cityId);
  if (!latest) return null;

  const effective = deriveEffectiveSiegeState(latest, nowMs);
  if (effective !== CLAN_SIEGE_STATE.finished) return latest;
  if (nowMs < latest.endsAt.getTime()) return latest;

  return null;
}

export function deriveEffectiveSiegeState(
  row: Pick<ClanSiege, 'state' | 'startsAt' | 'endsAt' | 'wallHp'>,
  nowMs = Date.now()
): typeof CLAN_SIEGE_STATE[keyof typeof CLAN_SIEGE_STATE] {
  if (row.state === CLAN_SIEGE_STATE.finished) {
    return CLAN_SIEGE_STATE.finished;
  }
  const now = nowMs;
  if (now < row.startsAt.getTime()) {
    return CLAN_SIEGE_STATE.scheduled;
  }
  if (now >= row.endsAt.getTime() || row.wallHp <= 0) {
    return CLAN_SIEGE_STATE.finished;
  }
  if (row.state === CLAN_SIEGE_STATE.active) {
    return CLAN_SIEGE_STATE.active;
  }
  if (now >= row.startsAt.getTime() && now < row.endsAt.getTime()) {
    return CLAN_SIEGE_STATE.active;
  }
  return CLAN_SIEGE_STATE.scheduled;
}
