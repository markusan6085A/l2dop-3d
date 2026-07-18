import type { PartyBattleSession } from '@prisma/client';
import type { BattleJsonState } from '../../domain/battleTypes.js';
import { isPartyBattleEngineEnabled } from '../../domain/partyBattleFlags.js';
import {
  isPartyBattleSessionTerminal,
} from '../../domain/partyBattleSessionConstants.js';
import { prisma } from '../../lib/prisma.js';
import { assertPartyBattleSyncReadOnlyContract } from './partyBattleSyncGuard.js';

export type PartyBattleSyncDto = {
  partyBattleId: string;
  battleVersion: number;
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  state: string;
  participantCount: number;
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

export function partyBattleSyncFromSession(
  session: PartyBattleSession,
  participantCount: number
): PartyBattleSyncDto {
  return {
    partyBattleId: session.id,
    battleVersion: session.battleVersion,
    spawnId: session.spawnId,
    mobHp: session.mobHp,
    mobMaxHp: session.mobMaxHp,
    state: session.state,
    participantCount,
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
