import { professionDisplayUk } from '../../domain/professionDisplay.js';
import { prisma } from '../../lib/prisma.js';
import {
  PARTY_MAX_MEMBERS,
  PARTY_VIEW_INCLUDE,
  type PartyDbRow,
} from './partyConstants.js';
import type { PartyView } from './partyTypes.js';

export function buildPartyView(
  row: PartyDbRow,
  viewerCharacterId: string
): PartyView {
  const leaderId = row.leaderCharacterId;
  return {
    id: row.id,
    version: row.version,
    leaderCharacterId: leaderId,
    leaderName: row.leader.name,
    memberCount: row._count.members,
    maxMembers: PARTY_MAX_MEMBERS,
    createdAt: row.createdAt.toISOString(),
    viewerCharacterId,
    viewerIsLeader: viewerCharacterId === leaderId,
    members: row.members.map((m) => ({
      characterId: m.characterId,
      name: m.character.name,
      level: m.character.level,
      professionLabelUk: professionDisplayUk(m.character.l2Profession),
      isLeader: m.characterId === leaderId,
      slotOrder: m.slotOrder,
      joinedAt: m.joinedAt.toISOString(),
      clanEmblemId: m.character.clan?.emblemId ?? null,
    })),
  };
}

export async function loadPartyViewById(
  partyId: string,
  viewerCharacterId: string
): Promise<PartyView | null> {
  const row = await prisma.party.findUnique({
    where: { id: partyId },
    include: PARTY_VIEW_INCLUDE,
  });
  if (!row) return null;
  return buildPartyView(row, viewerCharacterId);
}

export async function loadPartyViewForCharacter(
  characterId: string
): Promise<PartyView | null> {
  const membership = await prisma.partyMember.findUnique({
    where: { characterId },
    select: { partyId: true },
  });
  if (!membership) return null;
  return loadPartyViewById(membership.partyId, characterId);
}

export async function loadPartyViewForUser(
  userId: string,
  characterId?: string | null
): Promise<{ viewerCharacterId: string; party: PartyView | null } | null> {
  const char = await prisma.character.findFirst({
    where: {
      userId,
      ...(characterId ? { id: characterId } : {}),
    },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  if (!char) return null;
  const party = await loadPartyViewForCharacter(char.id);
  return { viewerCharacterId: char.id, party };
}
