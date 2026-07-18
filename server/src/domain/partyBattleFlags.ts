/**
 * Feature gates для party battle integration.
 *
 * Production default: PARTY_BATTLE_ENABLED=false, PARTY_BATTLE_ALLOW_UNREWARDED_TESTS=false
 * → zero party battle table access; solo PvE unchanged навіть для членів Party.
 *
 * Stage B dev/tests: обидва true.
 */

function envTruthy(key: string): boolean {
  return process.env[key] === 'true';
}

/** Master switch — без true жодних party battle services/reads. */
export function isPartyBattleEngineEnabled(): boolean {
  return envTruthy('PARTY_BATTLE_ENABLED');
}

/** Lethal без reward / route access до Stage C. */
export function isPartyBattleUnrewardedTestsAllowed(): boolean {
  return envTruthy('PARTY_BATTLE_ALLOW_UNREWARDED_TESTS');
}

/** Stage C reward writes — завжди false до окремого gate. */
export function isPartyBattleRewardDistributionReady(): boolean {
  return false;
}

/**
 * HTTP start/join/action для party battle.
 * ENABLED=false → false (solo flow, без party_battle_not_ready).
 * ENABLED=true + rewards не готові + ALLOW=false → false → party_battle_not_ready при спробі party start.
 */
export function canStartPartyBattleViaRoute(): boolean {
  if (!isPartyBattleEngineEnabled()) return false;
  if (isPartyBattleRewardDistributionReady()) return true;
  return isPartyBattleUnrewardedTestsAllowed();
}

/** Stage B test-only lethal без solo reward. */
export function canEndPartyBattleWithoutReward(): boolean {
  return (
    isPartyBattleEngineEnabled() && isPartyBattleUnrewardedTestsAllowed()
  );
}

/** Лише коли engine ON, але route ще заблокований (ENABLED=true, ALLOW=false). */
export function throwIfPartyBattleRouteBlocked(): void {
  if (isPartyBattleEngineEnabled() && !canStartPartyBattleViaRoute()) {
    throw new Error('party_battle_not_ready');
  }
}
