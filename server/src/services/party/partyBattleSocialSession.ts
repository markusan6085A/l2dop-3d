import { Prisma } from '@prisma/client';
import {
  isPartyBattleEngineEnabled,
} from '../../domain/partyBattleFlags.js';
import {
  isPartyBattleSessionTerminal,
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../../domain/partyBattleSessionConstants.js';
import { peekPartyBattleIdFromBattleJson } from './partyBattleActionLock.js';
import {
  lockCharacterRowsInStableOrderInTx,
} from './partyBattleCharacterLock.js';
import {
  endPartyBattleIfNoActiveParticipantsInTx,
  endPartyBattleSessionInTx,
  findActivePartyBattleSessionByPartyIdInTx,
  leavePartyBattleParticipantInTx,
  lockPartyBattleSessionInTx,
} from './partyBattleSessionService.js';
import { mutateCharacterWithRevision } from '../characterMutation.js';
import { gameConflictFromMutation } from '../charService.js';

type Tx = Prisma.TransactionClient;

/** Очистити party battle pointer у Character (без solo battleJson іншої сесії). */
export async function clearPartyBattlePointerForCharacterInTx(
  tx: Tx,
  characterId: string,
  sessionId: string,
  expectedRevision: number | null
): Promise<boolean> {
  const sid = String(sessionId || '').trim();
  const cid = String(characterId || '').trim();
  if (!sid || !cid) return false;

  const result = await mutateCharacterWithRevision(
    tx,
    cid,
    expectedRevision,
    (row) => {
      const pointer = peekPartyBattleIdFromBattleJson(row.battleJson);
      if (pointer !== sid) return { changed: false, data: {} };
      return {
        changed: true,
        data: {
          battleJson: Prisma.JsonNull,
          worldCombatStateJson: Prisma.JsonNull,
        },
      };
    }
  );
  if (expectedRevision != null && !result.ok) {
    throw gameConflictFromMutation(result);
  }
  return result.ok && result.changed;
}

/**
 * Leave/kick: Party вже locked → Session → participant inactive → clear battleJson.
 * Lock order: Party → Session → Character (без deadlock з lethal Session→Character).
 */
export async function syncPartyBattleOnMemberRemovalInTx(
  tx: Tx,
  args: {
    partyId: string;
    removedCharacterId: string;
    nowMs?: number;
  }
): Promise<void> {
  if (!isPartyBattleEngineEnabled()) return;

  const partyId = String(args.partyId || '').trim();
  const removedId = String(args.removedCharacterId || '').trim();
  if (!partyId || !removedId) return;

  const active = await findActivePartyBattleSessionByPartyIdInTx(tx, partyId);
  if (!active) return;

  const locked = await lockPartyBattleSessionInTx(tx, active.id);
  if (!locked || isPartyBattleSessionTerminal(locked.state)) return;

  await leavePartyBattleParticipantInTx(tx, {
    sessionId: locked.id,
    characterId: removedId,
    nowMs: args.nowMs,
  });

  await clearPartyBattlePointerForCharacterInTx(
    tx,
    removedId,
    locked.id,
    null
  );

  await endPartyBattleIfNoActiveParticipantsInTx(tx, {
    sessionId: locked.id,
    endReason: PARTY_BATTLE_END_REASON.no_participants,
    nowMs: args.nowMs,
  });
}

/**
 * Explicit dungeon exit: participant inactive, clear pointer, maybe end session.
 */
export async function syncPartyBattleOnDungeonExitInTx(
  tx: Tx,
  args: {
    characterId: string;
    nowMs?: number;
  }
): Promise<void> {
  if (!isPartyBattleEngineEnabled()) return;

  const characterId = String(args.characterId || '').trim();
  if (!characterId) return;

  const char = await tx.character.findUnique({
    where: { id: characterId },
    select: { battleJson: true },
  });
  const sessionId = peekPartyBattleIdFromBattleJson(char?.battleJson);
  if (!sessionId) return;

  const locked = await lockPartyBattleSessionInTx(tx, sessionId);
  if (!locked || isPartyBattleSessionTerminal(locked.state)) return;

  await leavePartyBattleParticipantInTx(tx, {
    sessionId: locked.id,
    characterId,
    nowMs: args.nowMs,
  });

  await clearPartyBattlePointerForCharacterInTx(
    tx,
    characterId,
    locked.id,
    null
  );

  await endPartyBattleIfNoActiveParticipantsInTx(tx, {
    sessionId: locked.id,
    endReason: PARTY_BATTLE_END_REASON.dungeon_exit,
    nowMs: args.nowMs,
  });
}

/**
 * Disband / останній member leave: end session, clear усі participant pointers, без reward.
 */
export async function finalizePartyBattleOnPartyDissolveInTx(
  tx: Tx,
  partyId: string,
  endReason:
    | typeof PARTY_BATTLE_END_REASON.party_disbanded
    | typeof PARTY_BATTLE_END_REASON.no_participants,
  nowMs?: number
): Promise<void> {
  if (!isPartyBattleEngineEnabled()) return;

  const pid = String(partyId || '').trim();
  if (!pid) return;

  const active = await findActivePartyBattleSessionByPartyIdInTx(tx, pid);
  if (!active) return;

  const locked = await lockPartyBattleSessionInTx(tx, active.id);
  if (!locked) return;

  if (!isPartyBattleSessionTerminal(locked.state)) {
    await endPartyBattleSessionInTx(tx, {
      sessionId: locked.id,
      terminalState: PARTY_BATTLE_SESSION_STATE.ended,
      endReason,
      nowMs,
    });
  }

  const participants = await tx.partyBattleParticipant.findMany({
    where: { partyBattleId: locked.id },
    select: { characterId: true },
  });
  const ids = participants
    .map((p) => p.characterId)
    .filter(Boolean)
    .sort();

  if (ids.length > 0) {
    await lockCharacterRowsInStableOrderInTx(tx, ids);
    for (const characterId of ids) {
      await clearPartyBattlePointerForCharacterInTx(
        tx,
        characterId,
        locked.id,
        null
      );
    }
  }
}
