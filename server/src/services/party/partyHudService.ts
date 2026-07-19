import { prisma } from '../../lib/prisma.js';
import { PARTY_MAX_MEMBERS } from './partyConstants.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import { buildPartyHudActiveBattle } from './partyBattleHudReadService.js';
import { getUnreadPartyRewardNotice } from './partyRewardNoticeService.js';
import type { PartyHudResult } from './partyTypes.js';

/** GET /game/party/hud — легкий read-only стан для глобального HUD (без full PartyView). */
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
    select: { id: true, revision: true },
  });
  if (!char) throw new Error('no_character');

  const now = new Date();

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
  let pendingPartyReward: PartyHudResult['pendingPartyReward'] = null;

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
      pendingPartyReward = await getUnreadPartyRewardNotice(char.id);
    }
  }

  const invites = await prisma.partyInvite.findMany({
    where: {
      targetCharacterId: char.id,
      expiresAt: { gt: now },
    },
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
    characterRevision: char.revision ?? 0,
  };

  if (isPartyBattleRewardDistributionReady()) {
    if (activeBattle) result.activeBattle = activeBattle;
    if (pendingPartyReward) {
      result.pendingPartyReward = pendingPartyReward;
      result.rewardNotice = pendingPartyReward;
    }
  }

  return result;
}
