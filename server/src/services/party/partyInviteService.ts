import { prisma } from '../../lib/prisma.js';
import { findCharacterForUserInTx } from '../charResolveForUser.js';
import { PARTY_INVITE_TTL_MS, PARTY_VIEW_INCLUDE } from './partyConstants.js';
import { PartyVersionConflictError } from './partyErrors.js';
import {
  isPartyInviteExpired,
  purgeExpiredPartyInvitesInTx,
} from './partyExpire.js';
import { bumpPartyVersionInTx, lockPartyForUpdateInTx } from './partyLock.js';
import {
  assertCharacterNotInPartyInTx,
  assertPartyNotFullInTx,
  findFirstFreeSlotOrderInTx,
  purgeAllPartyInvitesForTargetInTx,
} from './partyMemberHelpers.js';
import {
  buildPartyView,
  loadPartyViewForUser,
} from './partySnapshot.js';
import { isPartyMemberCharacterUniqueViolation } from './partyPrismaErrors.js';
import type {
  PartyInvitesListResult,
  PartyInviteView,
  PartyMutationResult,
} from './partyTypes.js';

const INVITE_LIST_INCLUDE = {
  inviter: { select: { name: true } },
  party: {
    select: {
      version: true,
      leader: { select: { name: true } },
      _count: { select: { members: true } },
    },
  },
} as const;

function mapInviteRow(row: {
  id: string;
  partyId: string;
  createdAt: Date;
  expiresAt: Date;
  inviter: { name: string };
  party: {
    version: number;
    leader: { name: string };
    _count: { members: number };
  };
}): PartyInviteView {
  return {
    inviteId: row.id,
    partyId: row.partyId,
    partyVersion: row.party.version,
    inviterName: row.inviter.name,
    leaderName: row.party.leader.name,
    memberCount: row.party._count.members,
    maxMembers: 5,
    expiresAt: row.expiresAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

/** GET /game/party/invites */
export async function listPartyInvitesForUser(
  userId: string,
  characterId?: string | null
): Promise<PartyInvitesListResult> {
  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  if (!char) throw new Error('no_character');

  const nowMs = Date.now();
  await prisma.$transaction(async (tx) => {
    await purgeExpiredPartyInvitesInTx(tx, nowMs, {
      targetCharacterId: char.id,
    });
  });

  const rows = await prisma.partyInvite.findMany({
    where: { targetCharacterId: char.id },
    orderBy: { createdAt: 'asc' },
    include: INVITE_LIST_INCLUDE,
  });

  return {
    invites: rows.map((row) => mapInviteRow(row)),
  };
}

/** POST /game/party/invite — лише лідер. */
export async function sendPartyInviteForUser(
  userId: string,
  rawTargetCharacterId: unknown,
  expectedPartyVersion: number,
  characterId?: string | null
): Promise<{ ok: true; partyVersion: number }> {
  const targetCharacterId = String(rawTargetCharacterId || '').trim();
  if (!targetCharacterId) throw new Error('party_invite_target_required');

  return prisma.$transaction(async (tx) => {
    const char = await findCharacterForUserInTx(tx, userId, { characterId });
    if (!char) throw new Error('no_character');

    const membership = await tx.partyMember.findUnique({
      where: { characterId: char.id },
      select: { partyId: true },
    });
    if (!membership) throw new Error('party_not_member');

    const locked = await lockPartyForUpdateInTx(tx, membership.partyId);
    if (!locked) throw new Error('party_not_found');
    if (locked.version !== expectedPartyVersion) {
      throw new Error('party_version_mismatch');
    }
    if (locked.leaderCharacterId !== char.id) {
      throw new Error('party_forbidden');
    }

    if (targetCharacterId === char.id) {
      throw new Error('party_invite_self');
    }

    const target = await tx.character.findUnique({
      where: { id: targetCharacterId },
      select: { id: true },
    });
    if (!target) throw new Error('party_invite_target_not_found');

    await assertCharacterNotInPartyInTx(tx, targetCharacterId);
    await assertPartyNotFullInTx(tx, locked.id);

    const nowMs = Date.now();
    await purgeExpiredPartyInvitesInTx(tx, nowMs, { partyId: locked.id });

    const pending = await tx.partyInvite.findUnique({
      where: {
        partyId_targetCharacterId: {
          partyId: locked.id,
          targetCharacterId,
        },
      },
      select: { id: true },
    });
    if (pending) throw new Error('party_invite_exists');

    await tx.partyInvite.create({
      data: {
        partyId: locked.id,
        inviterCharacterId: char.id,
        targetCharacterId,
        expiresAt: new Date(nowMs + PARTY_INVITE_TTL_MS),
      },
    });

    return { ok: true, partyVersion: locked.version };
  });
}

/** POST /game/party/invite/accept */
export async function acceptPartyInviteForUser(
  userId: string,
  rawInviteId: unknown,
  expectedPartyVersion: number,
  characterId?: string | null
): Promise<PartyMutationResult> {
  const inviteId = String(rawInviteId || '').trim();
  if (!inviteId) throw new Error('party_invite_id_required');

  return prisma.$transaction(async (tx) => {
    const char = await findCharacterForUserInTx(tx, userId, { characterId });
    if (!char) throw new Error('no_character');
    await assertCharacterNotInPartyInTx(tx, char.id);

    const invite = await tx.partyInvite.findUnique({
      where: { id: inviteId },
      select: {
        id: true,
        partyId: true,
        targetCharacterId: true,
        expiresAt: true,
      },
    });
    if (!invite || invite.targetCharacterId !== char.id) {
      throw new Error('party_invite_not_found');
    }

    const nowMs = Date.now();
    if (isPartyInviteExpired(invite.expiresAt, nowMs)) {
      await tx.partyInvite.delete({ where: { id: invite.id } });
      throw new Error('party_invite_expired');
    }

    const locked = await lockPartyForUpdateInTx(tx, invite.partyId);
    if (!locked) throw new Error('party_not_found');
    if (locked.version !== expectedPartyVersion) {
      throw new Error('party_version_mismatch');
    }

    const slotOrder = await findFirstFreeSlotOrderInTx(tx, locked.id);
    if (slotOrder === null) throw new Error('party_full');

    try {
      await tx.partyMember.create({
        data: {
          partyId: locked.id,
          characterId: char.id,
          slotOrder,
        },
      });
    } catch (err) {
      if (isPartyMemberCharacterUniqueViolation(err)) {
        throw new Error('party_target_in_party');
      }
      throw err;
    }
    await purgeAllPartyInvitesForTargetInTx(tx, char.id);
    await bumpPartyVersionInTx(tx, locked.id);

    const row = await tx.party.findUnique({
      where: { id: locked.id },
      include: PARTY_VIEW_INCLUDE,
    });
    if (!row) throw new Error('party_not_found');

    return {
      party: buildPartyView(row, char.id),
    };
  });
}

/** POST /game/party/invite/decline */
export async function declinePartyInviteForUser(
  userId: string,
  rawInviteId: unknown,
  characterId?: string | null
): Promise<{ ok: true }> {
  const inviteId = String(rawInviteId || '').trim();
  if (!inviteId) throw new Error('party_invite_id_required');

  return prisma.$transaction(async (tx) => {
    const char = await findCharacterForUserInTx(tx, userId, { characterId });
    if (!char) throw new Error('no_character');

    const invite = await tx.partyInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, partyId: true, targetCharacterId: true },
    });
    if (!invite || invite.targetCharacterId !== char.id) {
      throw new Error('party_invite_not_found');
    }

    await tx.partyInvite.delete({ where: { id: invite.id } });
    return { ok: true };
  });
}

export async function mapPartyVersionMismatchToConflict(
  err: unknown,
  userId: string,
  characterId?: string | null
): Promise<never> {
  if (!(err instanceof Error) || err.message !== 'party_version_mismatch') {
    throw err;
  }
  const ctx = await loadPartyViewForUser(userId, characterId);
  throw new PartyVersionConflictError(
    ctx?.party?.version ?? 0,
    ctx?.party ?? null
  );
}
