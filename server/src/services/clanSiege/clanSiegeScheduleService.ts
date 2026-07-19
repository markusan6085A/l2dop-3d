import type { ClanSiege } from '@prisma/client';
import {
  SIEGE_CITY_SLOTS,
  SIEGE_DURATION_MINUTES,
  SIEGE_TIME_ZONE,
  SIEGE_WALL_MAX_HP,
  SIEGE_WEEKDAY,
  getSiegeCitySlot,
  type SiegeCitySlot,
} from '../../domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../../domain/clanSiegeConstants.js';
import { getZonedParts, zonedLocalToUtc } from '../../domain/clanSiegeTime.js';
import { prisma } from '../../lib/prisma.js';

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

export function resolveCurrentSiegeKyivDate(nowMs = Date.now()): {
  year: number;
  month: number;
  day: number;
} | null {
  const parts = getZonedParts(new Date(nowMs), SIEGE_TIME_ZONE);
  if (parts.weekday !== SIEGE_WEEKDAY) return null;
  return { year: parts.year, month: parts.month, day: parts.day };
}

export type KyivCalendarDate = {
  year: number;
  month: number;
  day: number;
};

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

/** Найближче майбутнє вікно облоги міста за canonical weekly schedule (без БД). */
export function resolveUpcomingWeeklySiegeWindowForCity(
  cityId: string,
  nowMs = Date.now()
): { startsAt: Date; endsAt: Date } | null {
  const slot = getSiegeCitySlot(cityId);
  if (!slot) return null;

  const parts = getZonedParts(new Date(nowMs), SIEGE_TIME_ZONE);
  const daysToSiegeDay = (SIEGE_WEEKDAY - parts.weekday + 7) % 7;
  let siegeDay = addKyivCalendarDays(
    { year: parts.year, month: parts.month, day: parts.day },
    daysToSiegeDay
  );

  for (let week = 0; week < 4; week++) {
    const window = resolveSiegeWindowForSlotOnKyivDate(slot, siegeDay);
    if (window.endsAt.getTime() > nowMs) {
      return window;
    }
    siegeDay = addKyivCalendarDays(siegeDay, 7);
  }

  return resolveSiegeWindowForSlotOnKyivDate(slot, siegeDay);
}

/** Створити scheduled-рядки на день облог (idempotent upsert). */
export async function ensureSiegeScheduleForKyivDate(
  kyivDate: { year: number; month: number; day: number }
): Promise<void> {
  for (const slot of SIEGE_CITY_SLOTS) {
    const { startsAt, endsAt } = resolveSiegeWindowForSlotOnKyivDate(
      slot,
      kyivDate
    );
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
  }
}

export async function findSiegeRowForCityAtTime(
  cityId: string,
  nowMs = Date.now()
): Promise<ClanSiege | null> {
  const now = new Date(nowMs);
  return prisma.clanSiege.findFirst({
    where: {
      cityId: String(cityId || '').trim(),
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
    where: { cityId: String(cityId || '').trim() },
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
      startsAt: { gt: now },
      state: CLAN_SIEGE_STATE.scheduled,
    },
    orderBy: { startsAt: 'asc' },
  });
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
