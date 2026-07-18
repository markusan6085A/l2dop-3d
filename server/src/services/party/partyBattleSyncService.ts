import type { PartyBattleSession } from '@prisma/client';
import type { BattleJsonState } from '../../domain/battleTypes.js';
import { isPartyBattleEngineEnabled } from '../../domain/partyBattleFlags.js';
import {
  isPartyBattleSessionTerminal,
} from '../../domain/partyBattleSessionConstants.js';
import type { PlayfieldPosition } from '../../domain/mapNearbyRadius.js';
import { prisma } from '../../lib/prisma.js';
import { assertPartyBattleSyncReadOnlyContract } from './partyBattleSyncGuard.js';
import { buildPartyBattleMemberSyncDtos } from './partyBattleMemberSyncService.js';
import type { PartyMemberBuffIconDto } from './partyBuffIconsLightweight.js';

export type PartyBattleMemberSyncDto = {
  characterId: string;
  name: string;
  level: number;
  profession: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  online: boolean;
  nearby: boolean;
  dead: boolean;
  isLeader: boolean;
  activeInBattle: boolean;
  buffIcons: PartyMemberBuffIconDto[];
  buffOverflow: number;
};

export type PartyBattleSyncDto = {
  partyBattleId: string;
  battleVersion: number;
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  state: string;
  participantCount: number;
  members?: PartyBattleMemberSyncDto[];
};

/** Read-only: canonical session state для GET /battle/sync. */
export async function readPartyBattleSyncDto(
  partyBattleId: string
): Promise<PartyBattleSyncDto | null> {
  if (!isPartyBattleEngineEnabled()) return null;
  assertPartyBattleSyncReadOnlyContract();

  const session = await prisma.partyBattleSession.findUnique({
    where: { id: partyBattleId },
    include: {
      _count: { select: { participants: { where: { active: true } } } },
    },
  });
  if (!session) return null;

  return {
    partyBattleId: session.id,
    battleVersion: session.battleVersion,
    spawnId: session.spawnId,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    participantCount: session._count.participants,
  };
}

export async function readPartyBattleSyncDtoForViewer(
  partyBattleId: string,
  partyId: string,
  viewerCharacterId: string,
  viewerPlayfield: PlayfieldPosition,
  nowMs: number = Date.now()
): Promise<PartyBattleSyncDto | null> {
  if (!isPartyBattleEngineEnabled()) return null;
  assertPartyBattleSyncReadOnlyContract();

  const session = await prisma.partyBattleSession.findUnique({
    where: { id: partyBattleId },
    include: {
      _count: { select: { participants: { where: { active: true } } } },
    },
  });
  if (!session || isPartyBattleSessionTerminal(session.state)) return null;

  const members = await buildPartyBattleMemberSyncDtos(
    session.id,
    partyId,
    viewerCharacterId,
    viewerPlayfield,
    nowMs
  );

  return {
    partyBattleId: session.id,
    battleVersion: session.battleVersion,
    spawnId: session.spawnId,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    participantCount: session._count.participants,
    members,
  };
}

export function partyBattleSyncFromSession(
  session: PartyBattleSession,
  participantCount: number,
  members?: PartyBattleMemberSyncDto[]
): PartyBattleSyncDto {
  return {
    partyBattleId: session.id,
    battleVersion: session.battleVersion,
    spawnId: session.spawnId,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    participantCount,
    ...(members ? { members } : {}),
  };
}

export function isPartyBattleSyncStale(
  bj: BattleJsonState,
  session: PartyBattleSession | null
): boolean {
  if (!session) return true;
  if (isPartyBattleSessionTerminal(session.state)) return true;
  if (session.activePartyKey == null) return true;
  return session.spawnId !== bj.spawnId;
}
