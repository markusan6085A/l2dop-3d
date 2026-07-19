import type { BattleJsonState } from './battleTypes.js';

/** Контекст PvP-бою: спільне combat core, різні правила режиму. */
export type PlayerCombatMode = 'world' | 'siege' | 'arena' | 'olympiad';

export const PLAYER_COMBAT_MODES = [
  'world',
  'siege',
  'arena',
  'olympiad',
] as const satisfies readonly PlayerCombatMode[];

export function resolvePlayerCombatMode(
  st: Pick<BattleJsonState, 'playerCombatMode' | 'battleMode'>
): PlayerCombatMode {
  const mode = st.playerCombatMode;
  if (
    mode === 'siege' ||
    mode === 'arena' ||
    mode === 'olympiad' ||
    mode === 'world'
  ) {
    return mode;
  }
  return 'world';
}

export function isSiegePlayerCombatMode(
  mode: PlayerCombatMode | undefined
): boolean {
  return mode === 'siege';
}

/** Карма, PK, world aggressor — лише для world PvP на карті. */
export function shouldApplyWorldPvpPkRules(
  st: Pick<
    BattleJsonState,
    'battleMode' | 'pvpTargetCharacterId' | 'playerCombatMode'
  >
): boolean {
  if (st.battleMode !== 'pvp' || !st.pvpTargetCharacterId) return false;
  return resolvePlayerCombatMode(st) === 'world';
}
