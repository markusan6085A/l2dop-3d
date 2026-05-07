/**
 * Одна точка для злиття модифікаторів UI/урону: `resolveDisplayBattleMods(rawBattle, worldModsAfterTick)`.
 * Перший аргумент — об’єкт з `spawnId` (raw `battleJson` або live `st`), не лише вкладений `battleMods`.
 * Другий — `battleMods` після `tickWorldCombatState`, узгоджено з профілем.
 */
import { parseWorldCombatState, tickWorldCombatState } from './worldCombatState.js';
import { resolveDisplayBattleMods } from './battleEffectiveDisplay.js';
import type { BattleBattleMods } from './battleTypes.js';

export type CombatCalculationContext = {
  mode: 'world' | 'battle';
  mods: BattleBattleMods | undefined;
};

function isActiveBattleJsonOrState(raw: unknown): boolean {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return false;
  const spawnId = (raw as Record<string, unknown>).spawnId;
  return typeof spawnId === 'string' && spawnId.length > 0;
}

/**
 * Після одного `tickWorldCombatState` — зліяні моди для кидка урону / відображення.
 * `fallbackBattleMods` — наприклад `st.battleMods`, якщо resolve повернув undefined.
 */
export function mergeDisplayBattleMods(
  rawBattleJsonOrLiveState: unknown,
  worldBattleModsAfterTick: BattleBattleMods | undefined,
  fallbackBattleMods?: BattleBattleMods
): BattleBattleMods | undefined {
  return (
    resolveDisplayBattleMods(
      rawBattleJsonOrLiveState,
      worldBattleModsAfterTick
    ) ?? fallbackBattleMods
  );
}

/**
 * Повний контекст, якщо ще немає готового `worldTicked` (один tick всередині).
 * Не викликати, коли вже є `tickWorldCombatState` вище — інакше подвійний tick.
 */
export function getCombatCalculationContext(args: {
  rawBattleJsonOrLiveState: unknown;
  worldCombatStateJson: unknown;
  maxMp: number;
  nowMs: number;
  regenMpPerSec: number;
  fallbackBattleMods?: BattleBattleMods;
}): CombatCalculationContext {
  const wTick = tickWorldCombatState(
    parseWorldCombatState(args.worldCombatStateJson),
    args.maxMp,
    args.nowMs,
    args.regenMpPerSec
  );
  const mods = mergeDisplayBattleMods(
    args.rawBattleJsonOrLiveState,
    wTick?.battleMods,
    args.fallbackBattleMods
  );
  return {
    mode: isActiveBattleJsonOrState(args.rawBattleJsonOrLiveState)
      ? 'battle'
      : 'world',
    mods,
  };
}
