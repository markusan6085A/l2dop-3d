import type { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { findCharacterForUserInTx } from '../charResolveForUser.js';
import {
  PARTY_VIEW_INCLUDE,
} from './partyConstants.js';
import {
  assertPartyVersion,
  bumpPartyVersionInTx,
  lockPartyForUpdateInTx,
} from './partyLock.js';
import {
  purgeAllPartyInvitesForTargetInTx,
} from './partyMemberHelpers.js';
import { buildPartyView, loadPartyViewForCharacter } from './partySnapshot.js';
import { isPartyMemberCharacterUniqueViolation } from './partyPrismaErrors.js';
import type { GetPartyResult, PartyLeaveResult, PartyMutationResult } from './partyTypes.js';

type Tx = Prisma.TransactionClient;

async function resolveViewerCharacterInTx(
  tx: Tx,
  userId: string,
  characterId?: string | null
) {
  const char = await findCharacterForUserInTx(tx, userId, { characterId });
  if (!char) throw new Error('no_character');
  return char;
}

async function membershipForCharacterInTx(tx: Tx, characterId: string) {
  return tx.partyMember.findUnique({
    where: { characterId },
    select: { partyId: true, characterId: true },
  });
}

async function partyRowAfterMutationInTx(
  tx: Tx,
  partyId: string,
  viewerCharacterId: string
) {
  const row = await tx.party.findUnique({
    where: { id: partyId },
    include: PARTY_VIEW_INCLUDE,
  });
  if (!row) throw new Error('party_not_found');
  return buildPartyView(row, viewerCharacterId);
}

/** GET /game/party */
export async function getPartyForUser(
  userId: string,
  characterId?: string | null
): Promise<GetPartyResult> {
  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  if (!char) throw new Error('no_character');
  const party = await loadPartyViewForCharacter(char.id);
  return { party };
}

/** POST /game/party/create */
export async function createPartyForUser(
  userId: string,
  characterId?: string | null
): Promise<PartyMutationResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const char = await resolveViewerCharacterInTx(tx, userId, characterId);
      const existing = await membershipForCharacterInTx(tx, char.id);
      if (existing) throw new Error('party_already_member');

      const party = await tx.party.create({
        data: {
          leaderCharacterId: char.id,
          members: {
            create: {
              characterId: char.id,
              slotOrder: 0,
            },
          },
        },
        include: PARTY_VIEW_INCLUDE,
      });

      await purgeAllPartyInvitesForTargetInTx(tx, char.id);

      return {
        party: buildPartyView(party, char.id),
      };
    });
  } catch (err) {
    if (isPartyMemberCharacterUniqueViolation(err)) {
      throw new Error('party_already_member');
    }
    throw err;
  }
}

/** POST /game/party/leave */
export async function leavePartyForUser(
  userId: string,
  expectedPartyVersion: number,
  characterId?: string | null
): Promise<PartyLeaveResult> {
  return prisma.$transaction(async (tx) => {
    const char = await resolveViewerCharacterInTx(tx, userId, characterId);
    const membership = await membershipForCharacterInTx(tx, char.id);
    if (!membership) throw new Error('party_not_member');

    const locked = await lockPartyForUpdateInTx(tx, membership.partyId);
    if (!locked) throw new Error('party_not_found');
    assertPartyVersion(locked, expectedPartyVersion);

    const memberCount = await tx.partyMember.count({
      where: { partyId: locked.id },
    });

    if (locked.leaderCharacterId === char.id) {
      if (memberCount <= 1) {
        await tx.party.delete({ where: { id: locked.id } });
        return { party: null };
      }

      const nextLeader = await tx.partyMember.findFirst({
        where: {
          partyId: locked.id,
          characterId: { not: char.id },
        },
        orderBy: { joinedAt: 'asc' },
        select: { characterId: true },
      });
      if (!nextLeader) throw new Error('party_not_found');

      await tx.partyMember.delete({
        where: {
          partyId_characterId: {
            partyId: locked.id,
            characterId: char.id,
          },
        },
      });
      await tx.party.update({
        where: { id: locked.id },
        data: {
          leaderCharacterId: nextLeader.characterId,
          version: { increment: 1 },
        },
      });
      return { party: null };
    }

    await tx.partyMember.delete({
      where: {
        partyId_characterId: {
          partyId: locked.id,
          characterId: char.id,
        },
      },
    });
    await bumpPartyVersionInTx(tx, locked.id);
    return { party: null };
  });
}

/** POST /game/party/kick — лише лідер. */
export async function kickPartyMemberForUser(
  userId: string,
  rawTargetCharacterId: unknown,
  expectedPartyVersion: number,
  characterId?: string | null
): Promise<PartyMutationResult> {
  const targetCharacterId = String(rawTargetCharacterId || '').trim();
  if (!targetCharacterId) throw new Error('party_kick_target_required');

  return prisma.$transaction(async (tx) => {
    const char = await resolveViewerCharacterInTx(tx, userId, characterId);
    const membership = await membershipForCharacterInTx(tx, char.id);
    if (!membership) throw new Error('party_not_member');

    const locked = await lockPartyForUpdateInTx(tx, membership.partyId);
    if (!locked) throw new Error('party_not_found');
    assertPartyVersion(locked, expectedPartyVersion);

    if (locked.leaderCharacterId !== char.id) {
      throw new Error('party_forbidden');
    }
    if (targetCharacterId === char.id) {
      throw new Error('party_kick_self');
    }

    const targetMember = await tx.partyMember.findUnique({
      where: { characterId: targetCharacterId },
      select: { partyId: true },
    });
    if (!targetMember || targetMember.partyId !== locked.id) {
      throw new Error('party_kick_not_member');
    }

    await tx.partyMember.delete({
      where: {
        partyId_characterId: {
          partyId: locked.id,
          characterId: targetCharacterId,
        },
      },
    });
    await bumpPartyVersionInTx(tx, locked.id);

    return {
      party: await partyRowAfterMutationInTx(tx, locked.id, char.id),
    };
  });
}

/** POST /game/party/disband — лише лідер. */
export async function disbandPartyForUser(
  userId: string,
  expectedPartyVersion: number,
  characterId?: string | null
): Promise<{ ok: true }> {
  return prisma.$transaction(async (tx) => {
    const char = await resolveViewerCharacterInTx(tx, userId, characterId);
    const membership = await membershipForCharacterInTx(tx, char.id);
    if (!membership) throw new Error('party_not_member');

    const locked = await lockPartyForUpdateInTx(tx, membership.partyId);
    if (!locked) throw new Error('party_not_found');
    assertPartyVersion(locked, expectedPartyVersion);

    if (locked.leaderCharacterId !== char.id) {
      throw new Error('party_forbidden');
    }

    await tx.party.delete({ where: { id: locked.id } });
    return { ok: true };
  });
}
