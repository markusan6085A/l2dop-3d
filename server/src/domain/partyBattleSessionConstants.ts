/** Неактивна session без учасників / без дій — abandoned cleanup. */
export const PARTY_BATTLE_SESSION_TIMEOUT_MS = 2 * 60 * 1000;

export const PARTY_BATTLE_SESSION_STATE = {
  active: 'active',
  victory: 'victory',
  ended: 'ended',
} as const;

export type PartyBattleSessionStateValue =
  (typeof PARTY_BATTLE_SESSION_STATE)[keyof typeof PARTY_BATTLE_SESSION_STATE];

export const PARTY_BATTLE_END_REASON = {
  victory: 'victory',
  timeout: 'timeout',
  no_participants: 'no_participants',
  party_disbanded: 'party_disbanded',
  /** Stage B test-only lethal (ALLOW_UNREWARDED_TESTS); без solo reward flow. */
  stage_b_test_victory: 'stage_b_test_victory',
} as const;

export type PartyBattleEndReasonValue =
  (typeof PARTY_BATTLE_END_REASON)[keyof typeof PARTY_BATTLE_END_REASON];

export function isPartyBattleSessionTerminal(
  state: PartyBattleSessionStateValue
): boolean {
  return (
    state === PARTY_BATTLE_SESSION_STATE.victory ||
    state === PARTY_BATTLE_SESSION_STATE.ended
  );
}
