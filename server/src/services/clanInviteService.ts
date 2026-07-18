import { gameConflictFromMutation } from './charConflict.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot, PendingClanInviteSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { prisma } from '../lib/prisma.js';

const CLAN_MAX_MEMBERS = 40;

const INVITE_INCLUDE = {
  clan: { select: { id: true, name: true } },
  inviter: { select: { name: true } },
} as const;

export type SendClanInviteResult = {
  ok: true;
};

export type DeclineClanInviteResult = {
  ok: true;
};

function toPendingClanInviteSnapshot(invite: {
  id: string;
  inviter: { name: string };
  clan: { name: string };
}): PendingClanInviteSnapshot {
  return {
    inviteId: invite.id,
    inviterName: invite.inviter.name,
    clanName: invite.clan.name,
  };
}

/** Надіслати запрошення в клан з профілю іншого гравця. */
export async function sendClanInviteForUser(
  userId: string,
  rawTargetCharacterId: unknown
): Promise<SendClanInviteResult> {
  const targetCharacterId = String(rawTargetCharacterId || '').trim();
  if (!targetCharacterId) {
    throw new Error('clan_invite_target_required');
  }

  return prisma.$transaction(async (tx) => {
    const inviter = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, clanId: true },
    });
    if (!inviter) throw new Error('no_character');
    if (!inviter.clanId) throw new Error('clan_invite_no_clan');

    const target = await tx.character.findUnique({
      where: { id: targetCharacterId },
      select: { id: true, clanId: true },
    });
    if (!target) throw new Error('clan_invite_target_not_found');
    if (target.id === inviter.id) throw new Error('clan_invite_self');
    if (target.clanId) throw new Error('clan_invite_target_in_clan');

    const memberCount = await tx.character.count({
      where: { clanId: inviter.clanId },
    });
    if (memberCount >= CLAN_MAX_MEMBERS) {
      throw new Error('clan_invite_clan_full');
    }

    const pending = await tx.clanInvite.findFirst({
      where: {
        clanId: inviter.clanId,
        targetCharacterId: target.id,
        respondedAt: null,
      },
      select: { id: true },
    });
    if (pending) throw new Error('clan_invite_already_sent');

    await tx.clanInvite.create({
      data: {
        clanId: inviter.clanId,
        inviterCharacterId: inviter.id,
        targetCharacterId: target.id,
      },
    });

    return { ok: true };
  });
}

/** HUD-блок «Прийняти/Відхилити» для snapshot (GET і мутації). */
export async function attachPendingClanInviteToSnapshot(
  characterId: string,
  characterClanId: string | null | undefined
): Promise<Partial<CharacterSnapshot>> {
  const selfId = String(characterId || '').trim();
  if (!selfId || characterClanId) {
    return { pendingClanInvite: null };
  }

  const invite = await prisma.clanInvite.findFirst({
    where: {
      targetCharacterId: selfId,
      respondedAt: null,
    },
    orderBy: { createdAt: 'asc' },
    include: INVITE_INCLUDE,
  });
  if (!invite) {
    return { pendingClanInvite: null };
  }

  return {
    pendingClanInvite: toPendingClanInviteSnapshot(invite),
  };
}

/** Прийняти запрошення в клан. */
export async function acceptClanInviteForUser(
  userId: string,
  rawInviteId: unknown,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const inviteId = String(rawInviteId || '').trim();
  if (!inviteId) throw new Error('clan_invite_id_required');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');

    const invite = await tx.clanInvite.findUnique({
      where: { id: inviteId },
      include: INVITE_INCLUDE,
    });
    if (!invite || invite.targetCharacterId !== char.id) {
      throw new Error('clan_invite_not_found');
    }
    if (invite.respondedAt) throw new Error('clan_invite_already_responded');
    if (char.clanId) throw new Error('clan_invite_already_in_clan');

    const memberCount = await tx.character.count({
      where: { clanId: invite.clanId },
    });
    if (memberCount >= CLAN_MAX_MEMBERS) {
      throw new Error('clan_invite_clan_full');
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        if (current.clanId) throw new Error('clan_invite_already_in_clan');
        if (current.battleJson != null) throw new Error('clan_invite_in_battle');
        return {
          changed: true,
          data: {
            clanId: invite.clanId,
            clanRole: 'member',
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const now = new Date();
    await tx.clanInvite.update({
      where: { id: invite.id },
      data: { respondedAt: now, response: 'accepted' },
    });
    await tx.clanInvite.updateMany({
      where: {
        targetCharacterId: char.id,
        respondedAt: null,
        id: { not: invite.id },
      },
      data: { respondedAt: now, response: 'declined' },
    });

    const fresh = (await tx.character.findUnique({
      where: { id: char.id },
      include: {
        clan: { select: { name: true, hallBlessingAt: true, level: true } },
      },
    })) as CharacterRow | null;
    if (!fresh) throw new Error('no_character');

    return buildCharacterClientSnapshot(fresh, userId, { pendingClanInvite: null });
  });
}

/** Відхилити запрошення в клан. */
export async function declineClanInviteForUser(
  userId: string,
  rawInviteId: unknown
): Promise<DeclineClanInviteResult> {
  const inviteId = String(rawInviteId || '').trim();
  if (!inviteId) throw new Error('clan_invite_id_required');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true },
    });
    if (!char) throw new Error('no_character');

    const invite = await tx.clanInvite.findUnique({
      where: { id: inviteId },
      select: { id: true, targetCharacterId: true, respondedAt: true },
    });
    if (!invite || invite.targetCharacterId !== char.id) {
      throw new Error('clan_invite_not_found');
    }
    if (invite.respondedAt) throw new Error('clan_invite_already_responded');

    await tx.clanInvite.update({
      where: { id: invite.id },
      data: { respondedAt: new Date(), response: 'declined' },
    });

    return { ok: true };
  });
}
