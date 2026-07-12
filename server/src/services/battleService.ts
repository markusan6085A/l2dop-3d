/**
 * Бій: точка входу для маршрутів. Реалізація розбита на battleService*.ts.
 */
export {
  getBattleState,
  startBattle,
  leaveBattle,
} from './battleServiceSession.js';
export { startPvpBattle } from './battleServicePvpSession.js';
export { startHuntContinueBattle } from './battleServiceHuntContinue.js';
export { saveBattleHotbar } from './battleServiceHotbar.js';
export { performBattleAction } from './battleServicePerformBattleAction.js';
export type {
  BattleBuffIcon,
  BattleDefeatSummary,
  BattleVictoryItem,
  BattleVictorySummary,
  BattleView,
} from './battleServiceTypes.js';

