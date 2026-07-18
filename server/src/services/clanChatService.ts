import { prisma } from '../lib/prisma.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import { gameConflictFromCharacter, gameConflictFromMutation } from './charConflict.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';

export type ClanChatMessageDto = {
  id: string;
  characterId: string;
  characterName: string;
  text: string;
  createdAt: string;
};

export type ClanChatListResult = {
  page: number;
  pageSize: number;
  totalPages: number;
  messages: ClanChatMessageDto[];
};

const PAGE_SIZE = 10;
const MAX_TEXT_LEN = 220;

function sanitizeChatText(raw: unknown): string {
  if (raw == null) return '';
  let s = String(raw).replace(/\s+/g, ' ').trim();
  if (s.length > MAX_TEXT_LEN) s = s.slice(0, MAX_TEXT_LEN);
  return s;
}

function toDto(row: {
  id: string;
  characterId: string;
  text: string;
  createdAt: Date;
  character: { name: string };
}): ClanChatMessageDto {
  return {
    id: row.id,
    characterId: row.characterId,
    characterName: row.character.name,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

async function characterInClan(userId: string) {
  return prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, name: true, clanId: true, clanRole: true },
  });
}

/** Список повідомлень чату клану (10 на сторінку, новіші зверху). */
export async function listClanChatMessages(
  userId: string,
  pageRaw: unknown
): Promise<ClanChatListResult | null> {
  const char = await characterInClan(userId);
  if (!char?.clanId) return null;

  const page = Math.max(1, Math.min(99, Number(pageRaw) || 1));
  const total = await prisma.clanChatMessage.count({
    where: { clanId: char.clanId },
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const rows = await prisma.clanChatMessage.findMany({
    where: { clanId: char.clanId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
    include: { character: { select: { name: true } } },
  });

  return {
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
    messages: rows.map(toDto),
  };
}

/** Надіслати повідомлення в чат клану. */
export async function sendClanChatMessage(
  userId: string,
  textRaw: unknown
): Promise<ClanChatMessageDto> {
  const text = sanitizeChatText(textRaw);
  if (!text) throw new Error('clan_chat_empty_message');

  const char = await characterInClan(userId);
  if (!char) throw new Error('no_character');
  if (!char.clanId) throw new Error('clan_chat_not_in_clan');

  const row = await prisma.clanChatMessage.create({
    data: {
      clanId: char.clanId,
      characterId: char.id,
      text,
    },
    include: { character: { select: { name: true } } },
  });

  return toDto(row);
}

/** Вийти з клану (лише учасник, не лідер). */
export async function leaveClanForUser(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (!char.clanId) throw new Error('clan_leave_not_in_clan');
    if (char.clanRole === 'leader') {
      throw new Error('clan_leave_leader_forbidden');
    }
    if (char.revision !== expectedRevision) {
      throw gameConflictFromCharacter(char);
    }

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        if (!current.clanId) throw new Error('clan_leave_not_in_clan');
        if (current.clanRole === 'leader') {
          throw new Error('clan_leave_leader_forbidden');
        }
        if (current.battleJson != null) throw new Error('clan_leave_in_battle');
        return {
          changed: true,
          data: {
            clanId: null,
            clanRole: null,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const fresh = (await tx.character.findUnique({
      where: { id: char.id },
      include: {
        clan: { select: { name: true, hallBlessingAt: true, level: true } },
      },
    })) as CharacterRow | null;
    if (!fresh) throw new Error('no_character');

    return buildCharacterClientSnapshot(fresh, userId);
  });
}

export { PAGE_SIZE as CLAN_CHAT_PAGE_SIZE };
