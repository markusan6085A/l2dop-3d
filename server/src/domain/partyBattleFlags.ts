/**
 * Feature gates для party battle integration.
 *
 * Production defaults (усі false):
 * - PARTY_BATTLE_ENABLED=false → solo PvE, zero party battle table access
 * - PARTY_BATTLE_REWARDS_ENABLED=false
 * - PARTY_BATTLE_ALLOW_UNREWARDED_TESTS=false
 */

function envTruthy(key: string): boolean {
  return process.env[key] === 'true';
}

/** Master switch — без true жодних party battle services/reads. */
export function isPartyBattleEngineEnabled(): boolean {
  return envTruthy('PARTY_BATTLE_ENABLED');
}

/** Stage C: atomic EXP/SP/adena split + PartyKillReward. */
export function isPartyBattleRewardDistributionReady(): boolean {
  return (
    isPartyBattleEngineEnabled() &&
    envTruthy('PARTY_BATTLE_REWARDS_ENABLED')
  );
}

/** Lethal без reward / route access до Stage C rewards. */
export function isPartyBattleUnrewardedTestsAllowed(): boolean {
  return envTruthy('PARTY_BATTLE_ALLOW_UNREWARDED_TESTS');
}

/**
 * HTTP start/join/action для party battle.
 * A: ENABLED=false → false (solo flow).
 * B: ENABLED=true, REWARDS=false, ALLOW=false → false → party_battle_not_ready.
 * C: ENABLED=true, REWARDS=false, ALLOW=true → Stage B test-only.
 * D: ENABLED=true, REWARDS=true → real party battle.
 */
export function canStartPartyBattleViaRoute(): boolean {
  if (!isPartyBattleEngineEnabled()) return false;
  if (isPartyBattleRewardDistributionReady()) return true;
  return isPartyBattleUnrewardedTestsAllowed();
}

/** Stage B test-only lethal без solo reward (не коли REWARDS enabled). */
export function canEndPartyBattleWithoutReward(): boolean {
  return (
    isPartyBattleEngineEnabled() &&
    isPartyBattleUnrewardedTestsAllowed() &&
    !isPartyBattleRewardDistributionReady()
  );
}

/** Лише коли engine ON, але route ще заблокований. */
export function throwIfPartyBattleRouteBlocked(): void {
  if (isPartyBattleEngineEnabled() && !canStartPartyBattleViaRoute()) {
    throw new Error('party_battle_not_ready');
  }
}
