import type { PartyBattleRewardMemberSnapshot } from '../../domain/partyBattleRewardEligibility.js';
import { isCharacterOnlineNow } from '../onlinePresenceService.js';

/** Online для reward: presence/participant або live dungeon state у session dungeon. */
export function buildPartyBattleRewardOnlineCheck(args: {
  playfield: 'world' | 'dungeon';
  sessionDungeonId: string | null;
  memberSnapshots: readonly PartyBattleRewardMemberSnapshot[];
  activeParticipantIds: ReadonlySet<string>;
}): (characterId: string) => boolean {
  const sessionDid = String(args.sessionDungeonId || '').trim();
  const snapshotById = new Map(
    args.memberSnapshots.map((row) => [row.characterId, row] as const)
  );

  return (characterId: string) => {
    if (
      isCharacterOnlineNow(characterId) ||
      args.activeParticipantIds.has(characterId)
    ) {
      return true;
    }
    if (args.playfield !== 'dungeon' || !sessionDid) return false;
    const memberDungeon = snapshotById.get(characterId)?.dungeonMap;
    return memberDungeon != null && memberDungeon.dungeonId === sessionDid;
  };
}
