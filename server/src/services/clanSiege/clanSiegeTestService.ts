import {
  SIEGE_WALL_MAX_HP,
  isSiegeCityId,
} from '../../domain/clanSiegeConfig.js';
import { CLAN_SIEGE_STATE } from '../../domain/clanSiegeConstants.js';
import { prisma } from '../../lib/prisma.js';
import {
  CLAN_SIEGE_TEST_ROW_KEY,
  readClanSiegeTestConfig,
} from './clanSiegeTestConfig.js';

let testScheduleLogged = false;

/** Idempotent test override: один рядок на cityId+testKey, без скидання HP. */
export async function ensureClanSiegeTestSiege(nowMs = Date.now()): Promise<void> {
  const cfg = readClanSiegeTestConfig();
  if (!cfg.enabled || !isSiegeCityId(cfg.cityId)) return;

  const existing = await prisma.clanSiege.findUnique({
    where: {
      cityId_testKey: {
        cityId: cfg.cityId,
        testKey: CLAN_SIEGE_TEST_ROW_KEY,
      },
    },
    select: { id: true },
  });

  if (existing) return;

  const startsAt = new Date(nowMs + cfg.startInMinutes * 60_000);
  const endsAt = new Date(startsAt.getTime() + cfg.durationMinutes * 60_000);

  await prisma.clanSiege.create({
    data: {
      cityId: cfg.cityId,
      testKey: CLAN_SIEGE_TEST_ROW_KEY,
      startsAt,
      endsAt,
      state: CLAN_SIEGE_STATE.scheduled,
      wallHp: SIEGE_WALL_MAX_HP,
      wallMaxHp: SIEGE_WALL_MAX_HP,
    },
  });

  if (!testScheduleLogged) {
    testScheduleLogged = true;
    console.log('[ClanSiege] Test siege scheduled:');
    console.log(`city=${cfg.cityId}`);
    console.log(`startsAt=${startsAt.toISOString()}`);
    console.log(`endsAt=${endsAt.toISOString()}`);
  }
}

/** Для smoke: скинути one-shot log guard між тестами. */
export function resetClanSiegeTestScheduleLogForTests(): void {
  testScheduleLogged = false;
}
