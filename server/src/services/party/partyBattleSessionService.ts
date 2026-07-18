import type {
  PartyBattleSession,
  PartyBattleSessionState,
  Prisma,
} from '@prisma/client';
import {
  isPartyBattleSessionTerminal,
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
  PARTY_BATTLE_SESSION_TIMEOUT_MS,
  type PartyBattleEndReasonValue,
  type PartyBattleSessionStateValue,
} from '../../domain/partyBattleSessionConstants.js';
import { isPrismaUniqueViolation } from './partyPrismaErrors.js';

type Tx = Prisma.TransactionClient;

export type CreatePartyBattleSessionArgs = {
  partyId: string;
  spawnId: string;
  canonicalMobTemplateId: string;
  mobWorldX: number;
  mobWorldY: number;
  mobMaxHp: number;
  starterCharacterId: string;
  nowMs?: number;
};

export type EndPartyBattleSessionArgs = {
  sessionId: string;
  terminalState: Exclude<PartyBattleSessionStateValue, 'active'>;
  endReason: PartyBattleEndReasonValue;
  nowMs?: number;
};

function sessionNow(nowMs?: number): Date {
  return new Date(nowMs ?? Date.now());
}

/** FOR UPDATE — лише для tx цієї session (без універсального lock order). */
export async function lockPartyBattleSessionInTx(
  tx: Tx,
  sessionId: string
): Promise<PartyBattleSession | null> {
  const id = String(sessionId || '').trim();
  if (!id) return null;
  const rows = await tx.$queryRaw<PartyBattleSession[]>`
    SELECT *
    FROM "PartyBattleSession"
    WHERE id = ${id}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export async function findActivePartyBattleSessionByPartyIdInTx(
  tx: Tx,
  partyId: string
): Promise<PartyBattleSession | null> {
  const key = String(partyId || '').trim();
  if (!key) return null;
  return tx.partyBattleSession.findFirst({
    where: {
      activePartyKey: key,
      state: PARTY_BATTLE_SESSION_STATE.active,
    },
  });
}

export async function createActivePartyBattleSessionInTx(
  tx: Tx,
  args: CreatePartyBattleSessionArgs
): Promise<PartyBattleSession> {
  const partyId = String(args.partyId || '').trim();
  const spawnId = String(args.spawnId || '').trim();
  const starterId = String(args.starterCharacterId || '').trim();
  if (!partyId || !spawnId || !starterId) {
    throw new Error('party_battle_invalid_input');
  }
  const mobMaxHp = Math.max(1, Math.floor(args.mobMaxHp));
  const now = sessionNow(args.nowMs);

  try {
    const session = await tx.partyBattleSession.create({
      data: {
        partyId,
        originPartyId: partyId,
        activePartyKey: partyId,
        spawnId,
        canonicalMobTemplateId: String(args.canonicalMobTemplateId || '').trim(),
        mobWorldX: Math.floor(args.mobWorldX),
        mobWorldY: Math.floor(args.mobWorldY),
        mobHp: mobMaxHp,
        mobMaxHp,
        battleVersion: 1,
        state: PARTY_BATTLE_SESSION_STATE.active,
        lastActivityAt: now,
        participants: {
          create: {
            characterId: starterId,
            joinedAt: now,
            lastActivityAt: now,
            active: true,
          },
        },
      },
    });
    return session;
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      throw new Error('party_battle_session_already_active');
    }
    throw err;
  }
}

export async function touchPartyBattleSessionInTx(
  tx: Tx,
  sessionId: string,
  nowMs?: number
): Promise<void> {
  const locked = await lockPartyBattleSessionInTx(tx, sessionId);
  if (!locked || isPartyBattleSessionTerminal(locked.state)) return;
  await tx.partyBattleSession.update({
    where: { id: locked.id },
    data: { lastActivityAt: sessionNow(nowMs) },
  });
}

/** Idempotent active → terminal. Повторний виклик не змінює endedAt/endReason/state. */
export async function endPartyBattleSessionInTx(
  tx: Tx,
  args: EndPartyBattleSessionArgs
): Promise<PartyBattleSession> {
  const locked = await lockPartyBattleSessionInTx(tx, args.sessionId);
  if (!locked) throw new Error('party_battle_session_not_found');

  if (isPartyBattleSessionTerminal(locked.state)) {
    return locked;
  }

  const now = sessionNow(args.nowMs);
  return tx.partyBattleSession.update({
    where: { id: locked.id },
    data: {
      state: args.terminalState as PartyBattleSessionState,
      activePartyKey: null,
      endedAt: now,
      endReason: args.endReason,
      lastActivityAt: now,
    },
  });
}

export async function joinPartyBattleParticipantInTx(
  tx: Tx,
  args: {
    sessionId: string;
    characterId: string;
    nowMs?: number;
  }
): Promise<void> {
  const sessionId = String(args.sessionId || '').trim();
  const characterId = String(args.characterId || '').trim();
  if (!sessionId || !characterId) throw new Error('party_battle_invalid_input');

  const locked = await lockPartyBattleSessionInTx(tx, sessionId);
  if (!locked) throw new Error('party_battle_session_not_found');
  if (isPartyBattleSessionTerminal(locked.state)) {
    throw new Error('party_battle_session_not_active');
  }

  const now = sessionNow(args.nowMs);
  await tx.partyBattleParticipant.upsert({
    where: {
      partyBattleId_characterId: { partyBattleId: sessionId, characterId },
    },
    create: {
      partyBattleId: sessionId,
      characterId,
      joinedAt: now,
      lastActivityAt: now,
      active: true,
    },
    update: {
      active: true,
      leftAt: null,
      lastActivityAt: now,
    },
  });

  await tx.partyBattleSession.update({
    where: { id: sessionId },
    data: { lastActivityAt: now },
  });
}

/** Idempotent leave: повторний виклик не ламає стан. */
export async function leavePartyBattleParticipantInTx(
  tx: Tx,
  args: {
    sessionId: string;
    characterId: string;
    nowMs?: number;
  }
): Promise<void> {
  const sessionId = String(args.sessionId || '').trim();
  const characterId = String(args.characterId || '').trim();
  if (!sessionId || !characterId) return;

  const row = await tx.partyBattleParticipant.findUnique({
    where: {
      partyBattleId_characterId: { partyBattleId: sessionId, characterId },
    },
  });
  if (!row || !row.active) return;

  const now = sessionNow(args.nowMs);
  await tx.partyBattleParticipant.update({
    where: {
      partyBattleId_characterId: { partyBattleId: sessionId, characterId },
    },
    data: {
      active: false,
      leftAt: now,
      lastActivityAt: now,
    },
  });
}

async function countActiveParticipantsInTx(
  tx: Tx,
  sessionId: string
): Promise<number> {
  return tx.partyBattleParticipant.count({
    where: { partyBattleId: sessionId, active: true },
  });
}

/** Abandoned sessions: timeout або без active participants. */
export async function cleanupStalePartyBattleSessionsInTx(
  tx: Tx,
  nowMs: number = Date.now()
): Promise<number> {
  const cutoff = new Date(nowMs - PARTY_BATTLE_SESSION_TIMEOUT_MS);
  const activeRows = await tx.partyBattleSession.findMany({
    where: { state: PARTY_BATTLE_SESSION_STATE.active },
    select: { id: true, lastActivityAt: true },
  });

  let ended = 0;
  for (const row of activeRows) {
    const locked = await lockPartyBattleSessionInTx(tx, row.id);
    if (!locked || isPartyBattleSessionTerminal(locked.state)) continue;

    const activeCount = await countActiveParticipantsInTx(tx, locked.id);
    const timedOut = locked.lastActivityAt.getTime() < cutoff.getTime();
    if (activeCount > 0 && !timedOut) continue;

    const endReason =
      activeCount <= 0
        ? PARTY_BATTLE_END_REASON.no_participants
        : PARTY_BATTLE_END_REASON.timeout;

    await endPartyBattleSessionInTx(tx, {
      sessionId: locked.id,
      terminalState: PARTY_BATTLE_SESSION_STATE.ended,
      endReason,
      nowMs,
    });
    ended += 1;
  }
  return ended;
}

/** Майбутній disband: завершити active session до видалення Party. */
export async function endActivePartyBattleSessionForPartyDisbandInTx(
  tx: Tx,
  partyId: string,
  nowMs?: number
): Promise<PartyBattleSession | null> {
  const active = await findActivePartyBattleSessionByPartyIdInTx(tx, partyId);
  if (!active) return null;
  return endPartyBattleSessionInTx(tx, {
    sessionId: active.id,
    terminalState: PARTY_BATTLE_SESSION_STATE.ended,
    endReason: PARTY_BATTLE_END_REASON.party_disbanded,
    nowMs,
  });
}

/** Запис idempotency reward (Етап C); у A — для тестів FK/history. */
export async function recordPartyKillRewardInTx(
  tx: Tx,
  args: {
    partyBattleId: string;
    characterId: string;
    expGain: number;
    spGain: number;
    adenaGain: bigint;
  }
): Promise<void> {
  await tx.partyKillReward.create({
    data: {
      partyBattleId: args.partyBattleId,
      characterId: args.characterId,
      expGain: args.expGain,
      spGain: args.spGain,
      adenaGain: args.adenaGain,
    },
  });
}
