import { prisma } from '../lib/prisma.js';
import { parseClanEmblemId } from '../domain/clanEmblem.js';
import { getClanMyForUser } from './clanMyService.js';
import type { ClanMyView } from './clanMyService.js';

export async function updateClanEmblemForUser(
  userId: string,
  rawEmblemId: unknown
): Promise<ClanMyView> {
  const parsed = parseClanEmblemId(rawEmblemId);
  if (!parsed.ok) {
    throw new Error(parsed.code);
  }

  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, clanId: true, clanRole: true },
  });
  if (!char) throw new Error('no_character');
  if (!char.clanId) throw new Error('clan_emblem_not_in_clan');
  if (char.clanRole !== 'leader') {
    throw new Error('clan_emblem_forbidden');
  }

  await prisma.clan.update({
    where: { id: char.clanId },
    data: { emblemId: parsed.emblemId },
  });

  const view = await getClanMyForUser(userId);
  if (!view) throw new Error('clan_emblem_not_in_clan');
  return view;
}
