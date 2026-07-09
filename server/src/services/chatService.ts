import { prisma } from '../lib/prisma.js';

export type ChatChannel = 'all' | 'trade' | 'my';

export type ChatMessageDto = {
  id: string;
  channel: ChatChannel;
  characterName: string;
  text: string;
  createdAt: string;
};

export type ChatListResult = {
  channel: ChatChannel;
  page: number;
  pageSize: number;
  totalPages: number;
  messages: ChatMessageDto[];
};

const PAGE_SIZE = 15;
const MAX_TEXT_LEN = 220;

const CHANNELS = new Set<ChatChannel>(['all', 'trade', 'my']);

export function parseChatChannel(raw: unknown): ChatChannel {
  const s = String(raw || '').trim();
  if (s === 'trade' || s === 'my') return s;
  return 'all';
}

function sanitizeChatText(raw: unknown): string {
  if (raw == null) return '';
  let s = String(raw).replace(/\s+/g, ' ').trim();
  if (s.length > MAX_TEXT_LEN) s = s.slice(0, MAX_TEXT_LEN);
  return s;
}

function toDto(row: {
  id: string;
  channel: string;
  text: string;
  createdAt: Date;
  character: { name: string };
}): ChatMessageDto {
  return {
    id: row.id,
    channel: parseChatChannel(row.channel),
    characterName: row.character.name,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

async function characterForUser(userId: string) {
  return prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, name: true },
  });
}

export async function listChatMessages(
  channel: ChatChannel,
  pageRaw: unknown
): Promise<ChatListResult> {
  const page = Math.max(1, Math.min(99, Number(pageRaw) || 1));
  if (channel !== 'all') {
    return {
      channel,
      page: 1,
      pageSize: PAGE_SIZE,
      totalPages: 1,
      messages: [],
    };
  }

  const total = await prisma.chatMessage.count({ where: { channel: 'all' } });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const rows = await prisma.chatMessage.findMany({
    where: { channel: 'all' },
    orderBy: { createdAt: 'desc' },
    skip,
    take: PAGE_SIZE,
    include: { character: { select: { name: true } } },
  });

  return {
    channel,
    page: safePage,
    pageSize: PAGE_SIZE,
    totalPages,
    messages: rows.map(toDto),
  };
}

export async function sendChatMessage(
  userId: string,
  channel: ChatChannel,
  textRaw: unknown
): Promise<ChatMessageDto> {
  if (channel !== 'all') {
    throw new Error('chat_channel_unavailable');
  }

  const text = sanitizeChatText(textRaw);
  if (!text) throw new Error('chat_empty_message');

  const char = await characterForUser(userId);
  if (!char) throw new Error('character_not_found');

  const row = await prisma.chatMessage.create({
    data: {
      channel: 'all',
      characterId: char.id,
      text,
    },
    include: { character: { select: { name: true } } },
  });

  return toDto(row);
}

export { CHANNELS, PAGE_SIZE };
