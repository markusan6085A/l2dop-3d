import { WORLD_BOSS_TICK_MS } from '../domain/worldBossSession.js';
import { runAllWorldBossCombatTicks } from './worldBossSessionService.js';

/** Перевірка due-сесій раз на 1 с (lock лише у due spawn). */
const TICK_MS = WORLD_BOSS_TICK_MS;

/** Фоновий серверний tick автоатаки world РБ/епіків (незалежно від POST /battle/action). */
export function startWorldBossAutoAttackLoop(): void {
  setInterval(() => {
    void runAllWorldBossCombatTicks(Date.now());
  }, TICK_MS);
}
