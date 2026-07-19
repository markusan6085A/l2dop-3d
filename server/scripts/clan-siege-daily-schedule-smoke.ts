/**
 * Daily clan siege schedule smoke (Europe/Kyiv, 8 slots every day).
 * npm run test:clan-siege-daily-schedule
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { SIEGE_CITY_SLOTS } from '../src/domain/clanSiegeConfig.js';
import { getZonedParts, zonedLocalToUtc } from '../src/domain/clanSiegeTime.js';
import { prisma } from '../src/lib/prisma.js';
import { getSiegeStateForUser } from '../src/services/clanSiege/clanSiegeStateService.js';
import {
  addKyivCalendarDays,
  ensureSiegeScheduleForKyivDate,
  ensureTodaySiegeSchedule,
  resolveDailySiegeWindowsForKyivDate,
  resolveKyivCalendarDate,
  resolveUpcomingDailySiegeWindowForCity,
} from '../src/services/clanSiege/clanSiegeScheduleService.js';
import { runClanSiegeServerTick } from '../src/services/clanSiege/clanSiegeTickService.js';
import {
  CLAN_SIEGE_TEST_ROW_KEY,
} from '../src/services/clanSiege/clanSiegeTestConfig.js';
import {
  ensureClanSiegeTestSiege,
  resetClanSiegeTestScheduleLogForTests,
} from '../src/services/clanSiege/clanSiegeTestService.js';

let passed = 0;
const createdUserIds: string[] = [];

function ok(name: string): void {
  passed += 1;
  console.log('  ✓ ' + name);
}

function findKyivWeekdayDate(weekday: number): {
  year: number;
  month: number;
  day: number;
} {
  for (let i = 0; i < 14; i++) {
    const probe = new Date(Date.UTC(2026, 6, 1 + i));
    const parts = getZonedParts(probe, 'Europe/Kyiv');
    if (parts.weekday === weekday) {
      return { year: parts.year, month: parts.month, day: parts.day };
    }
  }
  throw new Error(`no Kyiv weekday ${weekday} in probe window`);
}

async function createViewer(): Promise<{ userId: string; characterId: string }> {
  const suffix = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const user = await prisma.user.create({
    data: {
      login: `sieged_${suffix}`,
      password: await bcrypt.hash('test123', 8),
      characters: {
        create: {
          name: `SD${suffix.slice(-4)}`.slice(0, 16),
          race: 'Human',
          classBranch: 'fighter',
          level: 20,
        },
      },
    },
    include: { characters: true },
  });
  createdUserIds.push(user.id);
  return { userId: user.id, characterId: user.characters[0]!.id };
}

async function cleanup(): Promise<void> {
  if (createdUserIds.length) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
  }
}

async function assertEightSlotsForDate(
  kyivDate: { year: number; month: number; day: number }
): Promise<void> {
  const dayStart = zonedLocalToUtc(
    kyivDate.year,
    kyivDate.month,
    kyivDate.day,
    17,
    59,
    'Europe/Kyiv'
  );
  const dayEnd = zonedLocalToUtc(
    kyivDate.year,
    kyivDate.month,
    kyivDate.day,
    21,
    0,
    'Europe/Kyiv'
  );
  await prisma.clanSiege.deleteMany({
    where: {
      testKey: null,
      startsAt: { gte: dayStart, lt: dayEnd },
    },
  });
  await ensureSiegeScheduleForKyivDate(kyivDate);
  const count = await prisma.clanSiege.count({
    where: {
      testKey: null,
      startsAt: { gte: dayStart, lt: dayEnd },
    },
  });
  assert.equal(count, 8);
}

async function main(): Promise<void> {
  console.log('clan-siege-daily-schedule smoke\n');

  const viewer = await createViewer();

  await assertEightSlotsForDate(findKyivWeekdayDate(1));
  ok('sieges created on Monday');

  await assertEightSlotsForDate(findKyivWeekdayDate(6));
  ok('sieges created on Saturday');

  await assertEightSlotsForDate(findKyivWeekdayDate(0));
  ok('sieges created on Sunday');

  const anyDay = resolveKyivCalendarDate(
    zonedLocalToUtc(2026, 7, 20, 12, 0, 'Europe/Kyiv').getTime()
  );
  const windows = resolveDailySiegeWindowsForKyivDate(anyDay);
  assert.equal(windows.length, 8);
  assert.equal(windows[0]!.cityId, 'l2dop_oren');
  assert.equal(windows.at(-1)!.cityId, 'l2dop_schuttgart');
  ok('each day has exactly 8 slots');

  const afterLastMs = zonedLocalToUtc(2026, 7, 20, 20, 41, 'Europe/Kyiv').getTime();
  const nextOren = resolveUpcomingDailySiegeWindowForCity('l2dop_oren', afterLastMs);
  assert.ok(nextOren);
  const nextParts = getZonedParts(nextOren!.startsAt, 'Europe/Kyiv');
  assert.equal(nextParts.day, 21);
  assert.equal(nextParts.month, 7);
  assert.equal(nextParts.hour, 18);
  assert.equal(nextParts.minute, 0);
  ok('after last siege of day returns first siege tomorrow');

  const beforeFirstMs = zonedLocalToUtc(2026, 7, 20, 10, 0, 'Europe/Kyiv').getTime();
  const todayOren = resolveUpcomingDailySiegeWindowForCity('l2dop_oren', beforeFirstMs);
  assert.ok(todayOren);
  const todayParts = getZonedParts(todayOren!.startsAt, 'Europe/Kyiv');
  assert.equal(todayParts.day, 20);
  assert.equal(todayParts.hour, 18);
  assert.equal(todayParts.minute, 0);
  const orenView = await getSiegeStateForUser(
    viewer.userId,
    'l2dop_oren',
    viewer.characterId,
    beforeFirstMs
  );
  assert.equal(orenView.state, 'scheduled');
  assert.equal(orenView.startsAt, todayOren!.startsAt.toISOString());
  ok('before first siege returns today Oren');

  const monday = findKyivWeekdayDate(1);
  const monStart = zonedLocalToUtc(monday.year, monday.month, monday.day, 17, 59, 'Europe/Kyiv');
  const monEnd = zonedLocalToUtc(monday.year, monday.month, monday.day, 21, 0, 'Europe/Kyiv');
  await prisma.clanSiege.deleteMany({
    where: { testKey: null, startsAt: { gte: monStart, lt: monEnd } },
  });
  const parallelMs = monStart.getTime() + 60_000;
  await Promise.all([
    ensureTodaySiegeSchedule(parallelMs),
    ensureTodaySiegeSchedule(parallelMs),
    runClanSiegeServerTick(parallelMs),
    runClanSiegeServerTick(parallelMs),
  ]);
  assert.equal(
    await prisma.clanSiege.count({
      where: { testKey: null, startsAt: { gte: monStart, lt: monEnd } },
    }),
    8
  );
  ok('parallel tick/GET schedule does not duplicate rows');

  const winter = zonedLocalToUtc(2026, 1, 15, 18, 0, 'Europe/Kyiv');
  assert.equal(winter.toISOString(), '2026-01-15T16:00:00.000Z');
  const summer = zonedLocalToUtc(2026, 7, 19, 18, 0, 'Europe/Kyiv');
  assert.equal(summer.toISOString(), '2026-07-19T15:00:00.000Z');
  const midnightProbe = zonedLocalToUtc(2026, 3, 29, 23, 30, 'Europe/Kyiv');
  const nextDay = addKyivCalendarDays(resolveKyivCalendarDate(midnightProbe.getTime()), 1);
  const orenNext = resolveUpcomingDailySiegeWindowForCity(
    'l2dop_oren',
    midnightProbe.getTime()
  );
  assert.ok(orenNext);
  const orenDay = getZonedParts(orenNext!.startsAt, 'Europe/Kyiv');
  assert.deepEqual(
    { year: orenDay.year, month: orenDay.month, day: orenDay.day },
    nextDay
  );
  ok('Europe/Kyiv midnight/DST calendar math');

  const prevTestEnabled = process.env.CLAN_SIEGE_TEST_ENABLED;
  const prevTestCity = process.env.CLAN_SIEGE_TEST_CITY_ID;
  process.env.CLAN_SIEGE_TEST_ENABLED = 'true';
  process.env.CLAN_SIEGE_TEST_CITY_ID = 'l2dop_giran';
  resetClanSiegeTestScheduleLogForTests();
  const testNow = Date.now();
  await ensureClanSiegeTestSiege(testNow);
  await ensureClanSiegeTestSiege(testNow + 1000);
  assert.equal(
    await prisma.clanSiege.count({
      where: { cityId: 'l2dop_giran', testKey: CLAN_SIEGE_TEST_ROW_KEY },
    }),
    1
  );
  const dionDaily = resolveUpcomingDailySiegeWindowForCity('l2dop_dion', testNow);
  assert.ok(dionDaily);
  const dionParts = getZonedParts(dionDaily!.startsAt, 'Europe/Kyiv');
  assert.equal(dionParts.hour, 20);
  assert.equal(dionParts.minute, 0);
  ok('test mode does not replace daily schedule for other cities');

  if (prevTestEnabled === undefined) delete process.env.CLAN_SIEGE_TEST_ENABLED;
  else process.env.CLAN_SIEGE_TEST_ENABLED = prevTestEnabled;
  if (prevTestCity === undefined) delete process.env.CLAN_SIEGE_TEST_CITY_ID;
  else process.env.CLAN_SIEGE_TEST_CITY_ID = prevTestCity;
  await prisma.clanSiege.deleteMany({
    where: { cityId: 'l2dop_giran', testKey: CLAN_SIEGE_TEST_ROW_KEY },
  });

  assert.equal(SIEGE_CITY_SLOTS.length, 8);
  console.log(`\n${passed} checks passed.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await cleanup();
    } catch (cleanupErr) {
      console.error('clan-siege-daily-schedule cleanup failed:', cleanupErr);
      process.exitCode = 1;
    }
    await prisma.$disconnect();
    if (process.exitCode) process.exit(process.exitCode);
  });
