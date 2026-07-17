import { ensureMammonSpawnNews } from './serverNewsService.js';

/** Перевірка ротації Маммона для стрічки «Новости» (раз на 15 хв). Нові гравці — одразу при register. */
const MAMMON_NEWS_TICK_MS = 15 * 60 * 1000;

export function startMammonNewsLoop(): void {
  void ensureMammonSpawnNews().catch(() => {});
  setInterval(() => {
    void ensureMammonSpawnNews().catch(() => {});
  }, MAMMON_NEWS_TICK_MS);
}
