import {
  isPartyMemberNearbyForReward,
  type PlayfieldPosition,
} from './mapNearbyRadius.js';
import { parsePvePendingDefeat } from './pvePendingDefeat.js';

export type WorldPartyRewardMemberSnapshot = {
  characterId: string;
  hp: number;
  pvePendingDefeatJson: unknown;
  resolvedPosition: PlayfieldPosition;
};

export type WorldPartyRewardEligibilityInput = {
  killerCharacterId: string;
  killerResolved: PlayfieldPosition;
  partyMemberIds: readonly string[];
  memberSnapshots: readonly WorldPartyRewardMemberSnapshot[];
  isOnline: (characterId: string) => boolean;
};

export type WorldPartyRewardEligibilityReason =
  | 'eligible_killer'
  | 'eligible_nearby'
  | 'missing_snapshot'
  | 'offline'
  | 'dead'
  | 'pve_pending_defeat'
  | 'world_too_far'
  | 'different_playfield';

function snapshotById(
  snapshots: readonly WorldPartyRewardMemberSnapshot[]
): Map<string, WorldPartyRewardMemberSnapshot> {
  const map = new Map<string, WorldPartyRewardMemberSnapshot>();
  for (const s of snapshots) {
    map.set(s.characterId, s);
  }
  return map;
}

function evaluateWorldPartyRewardMember(args: {
  memberId: string;
  killerId: string;
  killerResolved: PlayfieldPosition;
  snap: WorldPartyRewardMemberSnapshot | undefined;
  online: boolean;
}): {
  characterId: string;
  eligible: boolean;
  reason: WorldPartyRewardEligibilityReason;
} {
  const { memberId, killerId, killerResolved, snap, online } = args;
  const base = {
    characterId: memberId,
    eligible: false,
    reason: 'missing_snapshot' as WorldPartyRewardEligibilityReason,
  };

  if (!snap) return base;
  if (!online) return { ...base, reason: 'offline' };
  const hp = Math.max(0, Math.floor(snap.hp));
  if (hp <= 0) return { ...base, reason: 'dead' };
  if (parsePvePendingDefeat(snap.pvePendingDefeatJson)) {
    return { ...base, reason: 'pve_pending_defeat' };
  }

  if (memberId === killerId) {
    return { ...base, eligible: true, reason: 'eligible_killer' };
  }

  if (isPartyMemberNearbyForReward(killerResolved, snap.resolvedPosition)) {
    return { ...base, eligible: true, reason: 'eligible_nearby' };
  }
  return { ...base, reason: 'world_too_far' };
}

/**
 * World open-field party reward (L2-style): roster + online + alive + same world + nearby radius.
 * Не потребує спільного battle session / spawnId / урону по мобу.
 */
export function resolveWorldPartyRewardEligibleIds(
  input: WorldPartyRewardEligibilityInput
): string[] {
  const memberSet = new Set(
    input.partyMemberIds.map((id) => String(id).trim()).filter(Boolean)
  );
  const killerId = String(input.killerCharacterId || '').trim();
  if (!killerId || !memberSet.has(killerId)) {
    return [];
  }

  const byId = snapshotById(input.memberSnapshots);
  const eligible: string[] = [];

  for (const memberId of [...memberSet].sort()) {
    const row = evaluateWorldPartyRewardMember({
      memberId,
      killerId,
      killerResolved: input.killerResolved,
      snap: byId.get(memberId),
      online: input.isOnline(memberId),
    });
    if (row.eligible) eligible.push(memberId);
  }

  return eligible.sort();
}
