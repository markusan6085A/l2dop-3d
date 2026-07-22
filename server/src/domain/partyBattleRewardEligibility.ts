import { parsePvePendingDefeat } from './pvePendingDefeat.js';
import type { PlayfieldPosition } from './mapNearbyRadius.js';
import type { ResolvedDungeonMapPosition } from './partyBattlePlayfield.js';

/** Поля для pure eligibility (без DB write). */
export type PartyBattleRewardMemberSnapshot = {
  characterId: string;
  hp: number;
  pvePendingDefeatJson: unknown;
  resolvedPosition: PlayfieldPosition;
  dungeonMap?: ResolvedDungeonMapPosition | null;
};

export type PartyBattleRewardEligibilityInput = {
  killerCharacterId: string;
  /** Зафіксовані active учасники конкретного party battle instance. */
  battleParticipantIds: readonly string[];
  memberSnapshots: readonly PartyBattleRewardMemberSnapshot[];
  isOnline: (characterId: string) => boolean;
  /** Лише для debug-логів (geo більше не впливає на eligible battle participants). */
  killerResolved?: PlayfieldPosition;
  killerDungeonMap?: ResolvedDungeonMapPosition | null;
  playfield?: 'world' | 'dungeon';
  partyMemberIds?: readonly string[];
};

export type PartyBattleRewardEligibilityReason =
  | 'eligible_killer'
  | 'eligible_participant'
  | 'missing_snapshot'
  | 'offline'
  | 'dead'
  | 'pve_pending_defeat'
  | 'killer_not_participant';

export type PartyBattleRewardMemberEligibilityDebug = {
  characterId: string;
  eligible: boolean;
  reason: PartyBattleRewardEligibilityReason;
  online: boolean;
  activeParticipant: boolean;
  hp: number;
  pvePendingDefeat: boolean;
  dungeonId: string | null;
  mapX: number | null;
  mapY: number | null;
  distanceFromKiller: number | null;
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

function evaluateBattleParticipantEligibility(args: {
  memberId: string;
  killerId: string;
  snap: PartyBattleRewardMemberSnapshot | undefined;
  online: boolean;
}): PartyBattleRewardMemberEligibilityDebug {
  const { memberId, killerId, snap, online } = args;
  const base = {
    characterId: memberId,
    eligible: false,
    reason: 'missing_snapshot' as PartyBattleRewardEligibilityReason,
    online,
    activeParticipant: true,
    hp: snap ? Math.max(0, Math.floor(snap.hp)) : 0,
    pvePendingDefeat: snap ? !!parsePvePendingDefeat(snap.pvePendingDefeatJson) : false,
    dungeonId: snap?.dungeonMap?.dungeonId ?? null,
    mapX: snap?.dungeonMap?.mapX ?? null,
    mapY: snap?.dungeonMap?.mapY ?? null,
    distanceFromKiller: null,
  };

  if (!snap) return base;
  if (!online) return { ...base, reason: 'offline' };
  if (base.hp <= 0) return { ...base, reason: 'dead' };
  if (base.pvePendingDefeat) return { ...base, reason: 'pve_pending_defeat' };

  return {
    ...base,
    eligible: true,
    reason: memberId === killerId ? 'eligible_killer' : 'eligible_participant',
  };
}

/**
 * Eligible = active battle participants (fixed at victory), online + alive + no pvePendingDefeat.
 * Party roster / map distance не визначають pool — лише battleParticipantIds.
 */
export function explainPartyBattleRewardEligibility(
  input: PartyBattleRewardEligibilityInput
): {
  eligibleIds: string[];
  members: PartyBattleRewardMemberEligibilityDebug[];
} {
  const participantSet = new Set(
    input.battleParticipantIds.map((id) => String(id).trim()).filter(Boolean)
  );
  const killerId = String(input.killerCharacterId || '').trim();
  if (!killerId || !participantSet.has(killerId)) {
    return { eligibleIds: [], members: [] };
  }

  const byId = snapshotById(input.memberSnapshots);
  const members: PartyBattleRewardMemberEligibilityDebug[] = [];
  const eligible: string[] = [];

  for (const memberId of [...participantSet].sort()) {
    const row = evaluateBattleParticipantEligibility({
      memberId,
      killerId,
      snap: byId.get(memberId),
      online: input.isOnline(memberId),
    });
    members.push(row);
    if (row.eligible) eligible.push(memberId);
  }

  return { eligibleIds: eligible.sort(), members };
}

export function resolvePartyBattleRewardEligibleIds(
  input: PartyBattleRewardEligibilityInput
): string[] {
  return explainPartyBattleRewardEligibility(input).eligibleIds;
}
