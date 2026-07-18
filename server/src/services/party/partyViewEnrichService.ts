import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import { buildPartyHudActiveBattle } from './partyBattleHudReadService.js';
import {
  loadPartyMemberStatusEntries,
  resolveCharacterPlayfieldPosition,
  PARTY_MEMBER_STATUS_CHARACTER_SELECT,
  type PartyMemberStatusCharacterRow,
} from './partyMemberStatusReadService.js';
import { findActivePartyBattleParticipantIds } from './partyBattleMemberSyncService.js';
import type { PartyView } from './partyTypes.js';
import { prisma } from '../../lib/prisma.js';

/** Stage D: online/nearby/activeInBattle + activeBattle для party page (read-only). */
export async function enrichPartyViewStageD(
  party: PartyView
): Promise<PartyView> {
  if (!isPartyBattleRewardDistributionReady()) return party;

  const viewer = await prisma.character.findUnique({
    where: { id: party.viewerCharacterId },
    select: PARTY_MEMBER_STATUS_CHARACTER_SELECT,
  });
  if (!viewer) return party;

  const viewerPlayfield = resolveCharacterPlayfieldPosition(
    viewer as unknown as PartyMemberStatusCharacterRow
  );
  const statusEntries = await loadPartyMemberStatusEntries(
    party.id,
    party.viewerCharacterId,
    viewerPlayfield
  );
  const statusById = new Map(statusEntries.map((e) => [e.characterId, e]));

  let activeParticipantIds = new Set<string>();
  const activeBattle = await buildPartyHudActiveBattle(
    party.id,
    party.viewerCharacterId
  );
  if (activeBattle) {
    activeParticipantIds = await findActivePartyBattleParticipantIds(
      activeBattle.partyBattleId
    );
  }

  return {
    ...party,
    activeBattle: activeBattle ?? null,
    members: party.members.map((m) => {
      const st = statusById.get(m.characterId);
      return {
        ...m,
        online: st?.online ?? false,
        nearby: st?.nearby ?? false,
        activeInBattle: activeParticipantIds.has(m.characterId),
      };
    }),
  };
}
