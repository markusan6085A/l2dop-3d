import {
  isPartyMemberNearbyForReward,
  type PlayfieldPosition,
} from './mapNearbyRadius.js';
import {
  isWithinDungeonMemberRadius,
  type ResolvedDungeonMapPosition,
} from './partyBattlePlayfield.js';
import { parsePvePendingDefeat } from './pvePendingDefeat.js';

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
  killerResolved: PlayfieldPosition;
  killerDungeonMap?: ResolvedDungeonMapPosition | null;
  playfield: 'world' | 'dungeon';
  partyMemberIds: readonly string[];
  memberSnapshots: readonly PartyBattleRewardMemberSnapshot[];
  isOnline: (characterId: string) => boolean;
};

export type PartyBattleRewardEligibilityReason =
  | 'eligible_killer'
  | 'eligible_nearby'
  | 'missing_snapshot'
  | 'offline'
  | 'dead'
  | 'pve_pending_defeat'
  | 'dungeon_missing_position'
  | 'dungeon_wrong_id'
  | 'dungeon_too_far'
  | 'world_too_far';

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

export function dungeonMemberDistanceFromKillerPx(
  killerDungeon: ResolvedDungeonMapPosition | null | undefined,
  memberDungeon: ResolvedDungeonMapPosition | null | undefined
): number | null {
  if (!killerDungeon || !memberDungeon) return null;
  const dx = memberDungeon.mapX - killerDungeon.mapX;
  const dy = memberDungeon.mapY - killerDungeon.mapY;
  return Math.hypot(dx, dy);
}

function evaluatePartyBattleRewardMember(args: {
  memberId: string;
  killerId: string;
  input: PartyBattleRewardEligibilityInput;
  snap: PartyBattleRewardMemberSnapshot | undefined;
  activeParticipant: boolean;
}): PartyBattleRewardMemberEligibilityDebug {
  const { memberId, killerId, input, snap, activeParticipant } = args;
  const online = input.isOnline(memberId);
  const base = {
    characterId: memberId,
    eligible: false,
    reason: 'missing_snapshot' as PartyBattleRewardEligibilityReason,
    online,
    activeParticipant,
    hp: snap ? Math.max(0, Math.floor(snap.hp)) : 0,
    pvePendingDefeat: snap ? !!parsePvePendingDefeat(snap.pvePendingDefeatJson) : false,
    dungeonId: snap?.dungeonMap?.dungeonId ?? null,
    mapX: snap?.dungeonMap?.mapX ?? null,
    mapY: snap?.dungeonMap?.mapY ?? null,
    distanceFromKiller: dungeonMemberDistanceFromKillerPx(
      input.killerDungeonMap,
      snap?.dungeonMap
    ),
  };

  if (!snap) return base;
  if (!online) return { ...base, reason: 'offline' };
  if (base.hp <= 0) return { ...base, reason: 'dead' };
  if (base.pvePendingDefeat) return { ...base, reason: 'pve_pending_defeat' };

  if (memberId === killerId) {
    return { ...base, eligible: true, reason: 'eligible_killer' };
  }

  if (input.playfield === 'dungeon') {
    const killerDungeon = input.killerDungeonMap;
    const memberDungeon = snap.dungeonMap;
    if (!killerDungeon || !memberDungeon) {
      return { ...base, reason: 'dungeon_missing_position' };
    }
    if (killerDungeon.dungeonId !== memberDungeon.dungeonId) {
      return { ...base, reason: 'dungeon_wrong_id' };
    }
    if (
      isWithinDungeonMemberRadius(
        killerDungeon.mapX,
        killerDungeon.mapY,
        memberDungeon.mapX,
        memberDungeon.mapY
      )
    ) {
      return { ...base, eligible: true, reason: 'eligible_nearby' };
    }
    return { ...base, reason: 'dungeon_too_far' };
  }

  if (isPartyMemberNearbyForReward(input.killerResolved, snap.resolvedPosition)) {
    return { ...base, eligible: true, reason: 'eligible_nearby' };
  }
  return { ...base, reason: 'world_too_far' };
}

export function explainPartyBattleRewardEligibility(
  input: PartyBattleRewardEligibilityInput,
  activeParticipantIds: ReadonlySet<string> = new Set()
): {
  eligibleIds: string[];
  members: PartyBattleRewardMemberEligibilityDebug[];
} {
  const memberSet = new Set(
    input.partyMemberIds.map((id) => String(id).trim()).filter(Boolean)
  );
  const killerId = String(input.killerCharacterId || '').trim();
  if (!killerId || !memberSet.has(killerId)) {
    return { eligibleIds: [], members: [] };
  }

  const byId = snapshotById(input.memberSnapshots);
  const members: PartyBattleRewardMemberEligibilityDebug[] = [];
  const eligible: string[] = [];

  for (const memberId of [...memberSet].sort()) {
    const row = evaluatePartyBattleRewardMember({
      memberId,
      killerId,
      input,
      snap: byId.get(memberId),
      activeParticipant: activeParticipantIds.has(memberId),
    });
    members.push(row);
    if (row.eligible) eligible.push(memberId);
  }

  return { eligibleIds: eligible.sort(), members };
}

/**
 * Eligible = PartyMember на момент snapshot + червоний радіус + online + alive + no pvePendingDefeat.
 * Killer завжди включається, якщо досі у partyMemberIds.
 */
export function resolvePartyBattleRewardEligibleIds(
  input: PartyBattleRewardEligibilityInput
): string[] {
  return explainPartyBattleRewardEligibility(input).eligibleIds;
}
