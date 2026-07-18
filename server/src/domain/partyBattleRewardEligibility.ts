import {
  isPartyMemberNearbyForReward,
  type PlayfieldPosition,
} from './mapNearbyRadius.js';
import { parsePvePendingDefeat } from './pvePendingDefeat.js';

/** Поля для pure eligibility (без DB write). */
export type PartyBattleRewardMemberSnapshot = {
  characterId: string;
  hp: number;
  pvePendingDefeatJson: unknown;
  resolvedPosition: PlayfieldPosition;
};

export type PartyBattleRewardEligibilityInput = {
  killerCharacterId: string;
  killerResolved: PlayfieldPosition;
  partyMemberIds: readonly string[];
  memberSnapshots: readonly PartyBattleRewardMemberSnapshot[];
  isOnline: (characterId: string) => boolean;
};

function snapshotById(
  snapshots: readonly PartyBattleRewardMemberSnapshot[]
): Map<string, PartyBattleRewardMemberSnapshot> {
  const map = new Map<string, PartyBattleRewardMemberSnapshot>();
  for (const s of snapshots) {
    map.set(s.characterId, s);
  }
  return map;
}

/**
 * Eligible = PartyMember на момент snapshot + червоний радіус + online + alive + no pvePendingDefeat.
 * Killer завжди включається, якщо досі у partyMemberIds.
 */
export function resolvePartyBattleRewardEligibleIds(
  input: PartyBattleRewardEligibilityInput
): string[] {
  const memberSet = new Set(
    input.partyMemberIds.map((id) => String(id).trim()).filter(Boolean)
  );
  const killerId = String(input.killerCharacterId || '').trim();
  if (!killerId || !memberSet.has(killerId)) return [];

  const byId = snapshotById(input.memberSnapshots);
  const eligible: string[] = [];

  for (const memberId of [...memberSet].sort()) {
    const snap = byId.get(memberId);
    if (!snap) continue;
    if (!input.isOnline(memberId)) continue;
    if (Math.max(0, Math.floor(snap.hp)) <= 0) continue;
    if (parsePvePendingDefeat(snap.pvePendingDefeatJson)) continue;

    if (memberId === killerId) {
      eligible.push(memberId);
      continue;
    }

    if (
      isPartyMemberNearbyForReward(input.killerResolved, snap.resolvedPosition)
    ) {
      eligible.push(memberId);
    }
  }

  return eligible.sort();
}
