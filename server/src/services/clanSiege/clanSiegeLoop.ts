import { SIEGE_SERVER_TICK_MS } from '../../domain/clanSiegeConfig.js';
import { ensureClanSiegeTestSiege } from './clanSiegeTestService.js';
import { runClanSiegeServerTick } from './clanSiegeTickService.js';

let started = false;

/** Фоновий tick облог (один interval на Node-процес). */
export function startClanSiegeLoop(): void {
  if (started) return;
  started = true;
  void ensureClanSiegeTestSiege(Date.now());
  setInterval(() => {
    void runClanSiegeServerTick(Date.now());
  }, SIEGE_SERVER_TICK_MS);
  void runClanSiegeServerTick(Date.now());
}
