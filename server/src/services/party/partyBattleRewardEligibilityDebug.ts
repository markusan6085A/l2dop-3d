import type { PartyBattleSession } from '@prisma/client';
import { isPartyBattleDebugEnabled } from '../../domain/partyBattleFlags.js';
import {
  explainPartyBattleRewardEligibility,
  type PartyBattleRewardEligibilityInput,
  type PartyBattleRewardMemberSnapshot,
} from '../../domain/partyBattleRewardEligibility.js';

export function logPartyBattleRewardEligibilityDebug(args: {
  session: Pick<PartyBattleSession, 'id' | 'playfield' | 'dungeonId'>;
  killerCharacterId: string;
  partyMemberIds: readonly string[];
  participantIds: readonly string[];
  memberSnapshots: readonly PartyBattleRewardMemberSnapshot[];
  eligibilityInput: PartyBattleRewardEligibilityInput;
}): void {
  if (!isPartyBattleDebugEnabled()) return;

  const activeParticipantIds = new Set(args.participantIds);
  const explained = explainPartyBattleRewardEligibility(
    args.eligibilityInput,
    activeParticipantIds
  );

  console.log('[party-battle-reward-eligibility]', {
    partyBattleId: args.session.id,
    playfield: args.session.playfield,
    sessionDungeonId: args.session.dungeonId,
    killerCharacterId: args.killerCharacterId,
    partyMemberIds: [...args.partyMemberIds].sort(),
    participantIds: [...args.participantIds].sort(),
    eligibleIds: explained.eligibleIds,
    members: explained.members.map((m) => ({
      characterId: m.characterId,
      online: m.online,
      activeParticipant: m.activeParticipant,
      hp: m.hp,
      pvePendingDefeat: m.pvePendingDefeat,
      dungeonId: m.dungeonId,
      mapX: m.mapX,
      mapY: m.mapY,
      distanceFromKiller: m.distanceFromKiller,
      eligible: m.eligible,
      reason: m.reason,
    })),
  });
}
