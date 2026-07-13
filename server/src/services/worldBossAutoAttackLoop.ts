import { WORLD_BOSS_AUTO_ATTACK_MS } from '../domain/worldBossSession.js';
import { runAllWorldBossCombatTicks } from './worldBossSessionService.js';

/** Вирівняно з WORLD_BOSS_AUTO_ATTACK_MS — без зайвих tick-ів між автоатаками. */
const TICK_MS = WORLD_BOSS_AUTO_ATTACK_MS;

/** Фоновий серверний tick автоатаки world РБ/епіків (незалежно від POST /battle/action). */
export function startWorldBossAutoAttackLoop(): void {
  setInterval(() => {
    void runAllWorldBossCombatTicks(Date.now());
  }, TICK_MS);
}
