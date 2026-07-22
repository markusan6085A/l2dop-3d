import { isPartyBattleDebugEnabled } from '../../domain/partyBattleFlags.js';

export type PartyBattleVictoryTracePayload = {
  characterId: string;
  partyId: string | null;
  partyBattleId: string | null;
  spawnId: string;
  victoryPath: 'solo' | 'party';
  participantIds: string[];
  activeParticipantIds: string[];
  eligibleIds: string[];
  totalExp: string | number | null;
  totalSp: number | null;
  totalAdena: string | number | null;
  rewardRowsCreated: number;
  economyUpdates: number;
};

/** Structured trace для діагностики party vs solo victory (PARTY_BATTLE_DEBUG=true). */
export function logPartyBattleVictoryTrace(
  payload: PartyBattleVictoryTracePayload
): void {
  if (!isPartyBattleDebugEnabled()) return;
  console.log('[party-battle-victory-trace]', {
    characterId: payload.characterId,
    partyId: payload.partyId,
    partyBattleId: payload.partyBattleId,
    spawnId: payload.spawnId,
    victoryPath: payload.victoryPath,
    participantIds: [...payload.participantIds].sort(),
    activeParticipantIds: [...payload.activeParticipantIds].sort(),
    eligibleIds: [...payload.eligibleIds].sort(),
    totalExp: payload.totalExp,
    totalSp: payload.totalSp,
    totalAdena: payload.totalAdena,
    rewardRowsCreated: payload.rewardRowsCreated,
    economyUpdates: payload.economyUpdates,
  });
}
