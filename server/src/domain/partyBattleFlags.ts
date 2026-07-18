/**
 * Feature gates для party battle integration.
 *
 * Production за замовчуванням: обидва false.
 * Stage B automated/dev tests: PARTY_BATTLE_ENABLED=true + PARTY_BATTLE_ALLOW_UNREWARDED_TESTS=true.
 *
 * Не покладатися лише на PARTY_BATTLE_ENABLED без ALLOW_UNREWARDED_TESTS до Stage C —
 * інакше гравці можуть убити моба без EXP/SP/Adena.
 */

function envTruthy(key: string): boolean {
  return process.env[key] === 'true';
}

/** Движок shared HP / session routes (Stage B+). */
export function isPartyBattleEngineEnabled(): boolean {
  return envTruthy('PARTY_BATTLE_ENABLED');
}

/** Дозволити lethal без reward (лише dev/automated tests до Stage C). */
export function isPartyBattleUnrewardedTestsAllowed(): boolean {
  return envTruthy('PARTY_BATTLE_ALLOW_UNREWARDED_TESTS');
}

/** Stage C reward writes ще не реалізовані — завжди false до окремого gate. */
export function isPartyBattleRewardDistributionReady(): boolean {
  return false;
}

/** Чи можна стартувати/join PartyBattleSession через HTTP route. */
export function canStartPartyBattleViaRoute(): boolean {
  if (!isPartyBattleEngineEnabled()) return false;
  if (isPartyBattleRewardDistributionReady()) return true;
  return isPartyBattleUnrewardedTestsAllowed();
}

/** Lethal без solo reward — лише під test gate. */
export function canEndPartyBattleWithoutReward(): boolean {
  return (
    isPartyBattleEngineEnabled() && isPartyBattleUnrewardedTestsAllowed()
  );
}

/** Canonical error для production, коли engine/rewards ще не готові. */
export function assertPartyBattleRuntimeReadyForRoute(): void {
  if (!canStartPartyBattleViaRoute()) {
    throw new Error('party_battle_not_ready');
  }
}
