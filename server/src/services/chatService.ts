import { prisma } from '../lib/prisma.js';
import { applyDailyQuestChatMessage } from '../domain/dailyQuests.js';
import { applyDailyQuestsJsonAtomicInTx } from './charDailyQuestPersist.js';

export type ChatChannel = 'all' | 'trade' | 'my';

export type ChatMessageDto = {
  id: string;
  channel: ChatChannel;
  characterId: string;
  characterName: string;
  text: string;
  replyToCharacterId: string | null;
  replyToCharacterName: string | null;
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
  characterId: string;
  text: string;
  replyToCharacterId: string | null;
  replyToCharacterName: string | null;
  createdAt: Date;
  character: { name: string };
}): ChatMessageDto {
  return {
    id: row.id,
    channel: parseChatChannel(row.channel),
    characterId: row.characterId,
    characterName: row.character.name,
    text: row.text,
    replyToCharacterId: row.replyToCharacterId,
    replyToCharacterName: row.replyToCharacterName,
    createdAt: row.createdAt.toISOString(),
  };
}

async function characterForUser(userId: string) {
  return prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, name: true, chatRepliesReadAt: true },
  });
}

async function resolveReplyTarget(
  senderId: string,
  replyToCharacterIdRaw: unknown
): Promise<{ id: string; name: string } | null> {
  const replyId = String(replyToCharacterIdRaw || '').trim();
  if (!replyId) return null;

  const target = await prisma.character.findUnique({
    where: { id: replyId },
    select: { id: true, name: true },
  });
  if (!target) throw new Error('chat_reply_target_not_found');
  if (target.id === senderId) throw new Error('chat_reply_self');
  return target;
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
  textRaw: unknown,
  replyToCharacterIdRaw?: unknown
): Promise<ChatMessageDto> {
  if (channel !== 'all') {
    throw new Error('chat_channel_unavailable');
  }

  const text = sanitizeChatText(textRaw);
  if (!text) throw new Error('chat_empty_message');

  const char = await characterForUser(userId);
  if (!char) throw new Error('character_not_found');

  const replyTarget = await resolveReplyTarget(char.id, replyToCharacterIdRaw);

  const nowMs = Date.now();
  const row = await prisma.$transaction(async (tx) => {
    const created = await tx.chatMessage.create({
      data: {
        channel: 'all',
        characterId: char.id,
        text,
        replyToCharacterId: replyTarget?.id ?? null,
        replyToCharacterName: replyTarget?.name ?? null,
      },
      include: { character: { select: { name: true } } },
    });

    await applyDailyQuestsJsonAtomicInTx(tx, char.id, nowMs, (before) =>
      applyDailyQuestChatMessage(before, nowMs)
    );

    return created;
  });

  return toDto(row);
}

export async function deleteChatMessage(
  userId: string,
  messageIdRaw: unknown
): Promise<void> {
  const messageId = String(messageIdRaw || '').trim();
  if (!messageId) throw new Error('chat_message_not_found');

  const char = await characterForUser(userId);
  if (!char) throw new Error('character_not_found');

  const msg = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: { id: true, characterId: true },
  });
  if (!msg) throw new Error('chat_message_not_found');
  if (msg.characterId !== char.id) throw new Error('chat_forbidden');

  await prisma.chatMessage.delete({ where: { id: messageId } });
}

export async function getUnreadReplyCountForCharacter(
  characterId: string,
  chatRepliesReadAt: Date | null
): Promise<number> {
  if (process.env.PERF_DEBUG === '1') {
    console.log('[perf] unread COUNT', characterId);
  }
  return prisma.chatMessage.count({
    where: {
      channel: 'all',
      replyToCharacterId: characterId,
      createdAt: { gt: chatRepliesReadAt ?? new Date(0) },
    },
  });
}

export async function getUnreadReplyCount(userId: string): Promise<number> {
  const char = await characterForUser(userId);
  if (!char) return 0;
  return getUnreadReplyCountForCharacter(char.id, char.chatRepliesReadAt);
}

export async function markChatRepliesRead(userId: string): Promise<void> {
  const char = await characterForUser(userId);
  if (!char) throw new Error('character_not_found');

  await prisma.character.update({
    where: { id: char.id },
    data: { chatRepliesReadAt: new Date() },
  });
}

export { CHANNELS, PAGE_SIZE };
