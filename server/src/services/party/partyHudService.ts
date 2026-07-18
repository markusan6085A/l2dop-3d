import { prisma } from '../../lib/prisma.js';
import { PARTY_MAX_MEMBERS } from './partyConstants.js';
import { purgeExpiredPartyInvitesInTx } from './partyExpire.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import { buildPartyHudActiveBattle } from './partyBattleHudReadService.js';
import { getUnreadPartyRewardNotice } from './partyRewardNoticeService.js';
import type { PartyHudResult } from './partyTypes.js';

/** GET /game/party/hud — легкий стан для глобального HUD (без full PartyView). */
export async function getPartyHudForUser(
  userId: string,
  characterId?: string | null
): Promise<PartyHudResult> {
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

  const membership = await prisma.partyMember.findUnique({
    where: { characterId: char.id },
    select: {
      partyId: true,
      party: {
        select: {
          id: true,
          version: true,
          leaderCharacterId: true,
          _count: { select: { members: true } },
        },
      },
    },
  });

  let party: PartyHudResult['party'] = null;
  let activeBattle: PartyHudResult['activeBattle'] = null;
  let rewardNotice: PartyHudResult['rewardNotice'] = null;

  if (membership?.party) {
    const row = membership.party;
    party = {
      partyId: row.id,
      partyVersion: row.version,
      leaderCharacterId: row.leaderCharacterId,
      memberCount: row._count.members,
      maxMembers: PARTY_MAX_MEMBERS,
      isLeader: row.leaderCharacterId === char.id,
    };

    if (isPartyBattleRewardDistributionReady()) {
      activeBattle = await buildPartyHudActiveBattle(
        row.id,
        char.id
      );
      rewardNotice = await getUnreadPartyRewardNotice(char.id);
    }
  }

  const invites = await prisma.partyInvite.findMany({
    where: { targetCharacterId: char.id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      inviterCharacterId: true,
      expiresAt: true,
      party: { select: { version: true } },
      inviter: { select: { name: true } },
    },
  });

  const first = invites[0];
  const invite = first
    ? {
        inviteId: first.id,
        inviterCharacterId: first.inviterCharacterId,
        inviterName: first.inviter.name,
        partyVersion: first.party.version,
        expiresAt: first.expiresAt.toISOString(),
      }
    : null;

  const result: PartyHudResult = {
    party,
    invite,
    extraInviteCount: Math.max(0, invites.length - 1),
  };

  if (isPartyBattleRewardDistributionReady()) {
    if (activeBattle) result.activeBattle = activeBattle;
    if (rewardNotice) result.rewardNotice = rewardNotice;
  }

  return result;
}
