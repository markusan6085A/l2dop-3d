import { MAMMON_MERCHANT_ROTATION_MS } from '../domain/mammonMerchantRotation.js';
import { ensureMammonSpawnNews } from './serverNewsService.js';

/** Перевірка ротації Маммона для стрічки «Новости» (раз на хвилину). */
export function startMammonNewsLoop(): void {
  const tickMs = Math.min(60_000, MAMMON_MERCHANT_ROTATION_MS);
  void ensureMammonSpawnNews().catch(() => {});
  setInterval(() => {
    void ensureMammonSpawnNews().catch(() => {});
  }, tickMs);
}
