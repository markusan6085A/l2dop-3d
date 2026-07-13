import { runAllWorldBossCombatTicks } from './worldBossSessionService.js';

const TICK_MS = 2_000;

/** Фоновий серверний tick автоатаки world РБ/епіків (незалежно від POST /battle/action). */
export function startWorldBossAutoAttackLoop(): void {
  setInterval(() => {
    void runAllWorldBossCombatTicks(Date.now());
  }, TICK_MS);
}
