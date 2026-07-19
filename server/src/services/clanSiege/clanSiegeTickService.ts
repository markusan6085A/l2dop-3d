import { CLAN_SIEGE_STATE } from '../../domain/clanSiegeConstants.js';
import { prisma } from '../../lib/prisma.js';
import { finishExpiredActiveSieges } from './clanSiegeFinishService.js';
import { ensureTodaySiegeSchedule } from './clanSiegeScheduleService.js';

let tickInFlight = false;

/** Активувати scheduled-облоги, завершити прострочені (≤1 раз на tick). */
export async function runClanSiegeServerTick(nowMs = Date.now()): Promise<void> {
  if (tickInFlight) return;
  tickInFlight = true;
  try {
    await ensureTodaySiegeSchedule(nowMs);

    const now = new Date(nowMs);
    await prisma.clanSiege.updateMany({
      where: {
        state: CLAN_SIEGE_STATE.scheduled,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      data: { state: CLAN_SIEGE_STATE.active },
    });

    await finishExpiredActiveSieges(nowMs);
  } finally {
    tickInFlight = false;
  }
}
