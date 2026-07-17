import { prisma } from '../lib/prisma.js';
import {
  normalizeClanAnnouncement,
} from '../domain/clanAnnouncement.js';
import { gameConflictFromCharacter } from './charConflict.js';

/** Деталі «Мій клан» для клієнта. Числові поля без БД — заглушки до майбутньої логіки. */
export type ClanMyView = {
  id: string;
  name: string;
  foundedAt: string;
  level: number;
  leaderName: string;
  announcement: string;
  reputation: number;
  ratingRank: number | null;
  skillPoints: number;
  adena: string;
  luckCoins: number;
  memberCount: number;
  maxMembers: number;
  viewerRole: string | null;
  canEditAnnouncement: boolean;
};

const CLAN_MAX_MEMBERS = 40;

const CLAN_MY_SELECT = {
  id: true,
  name: true,
  createdAt: true,
  announcement: true,
  level: true,
  leader: { select: { name: true } },
  _count: { select: { members: true } },
} as const;

async function computeClanRatingRank(clanId: string): Promise<number | null> {
  const rows = await prisma.clan.findMany({
    orderBy: [{ createdAt: 'asc' }],
    select: { id: true },
  });
  const idx = rows.findIndex((r) => r.id === clanId);
  return idx >= 0 ? idx + 1 : null;
}

function buildClanMyView(
  clan: {
    id: string;
    name: string;
    createdAt: Date;
    announcement: string;
    level: number;
    leader: { name: string };
    _count: { members: number };
  },
  viewerRole: string | null,
  ratingRank: number | null
): ClanMyView {
  return {
    id: clan.id,
    name: clan.name,
    foundedAt: clan.createdAt.toISOString(),
    level: clan.level,
    leaderName: clan.leader.name,
    announcement: clan.announcement,
    reputation: 0,
    ratingRank,
    skillPoints: 0,
    adena: '0',
    luckCoins: 0,
    memberCount: clan._count.members,
    maxMembers: CLAN_MAX_MEMBERS,
    viewerRole,
    canEditAnnouncement: viewerRole === 'leader',
  };
}

/** Повертає null, якщо персонаж не в клані. */
export async function getClanMyForUser(
  userId: string
): Promise<ClanMyView | null> {
  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { clanId: true, clanRole: true },
  });
  if (!char?.clanId) return null;

  const clan = await prisma.clan.findUnique({
    where: { id: char.clanId },
    select: CLAN_MY_SELECT,
  });
  if (!clan) return null;

  const ratingRank = await computeClanRatingRank(clan.id);
  return buildClanMyView(clan, char.clanRole ?? null, ratingRank);
}

/** Оновити оголошення клану (лише лідер). */
export async function updateClanAnnouncementForUser(
  userId: string,
  expectedRevision: number,
  rawText: unknown
): Promise<ClanMyView> {
  const parsed = normalizeClanAnnouncement(rawText);
  if (!parsed.ok) {
    throw new Error(parsed.code);
  }

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw gameConflictFromCharacter(char);
    }
    if (!char.clanId || char.clanRole !== 'leader') {
      throw new Error('clan_announcement_forbidden');
    }

    const clan = await tx.clan.update({
      where: { id: char.clanId },
      data: { announcement: parsed.text },
      select: CLAN_MY_SELECT,
    });

    const ratingRank = await computeClanRatingRank(clan.id);
    return buildClanMyView(clan, char.clanRole ?? null, ratingRank);
  });
}
