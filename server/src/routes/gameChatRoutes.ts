import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  deleteChatMessage,
  listChatMessages,
  parseChatChannel,
  sendChatMessage,
} from '../services/chatService.js';

export function registerGameChatRoutes(app: FastifyInstance): void {
  app.get('/chat', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const q = request.query as { channel?: string; page?: string };
    const channel = parseChatChannel(q?.channel);
    const result = await listChatMessages(channel, q?.page);
    return reply.send(result);
  });

  app.post('/chat', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const body = request.body as { channel?: string; text?: string } | null;
    const channel = parseChatChannel(body?.channel);

    try {
      const message = await sendChatMessage(userId, channel, body?.text);
      request.log.info(
        { action: 'chat_send', characterId: null, result: 'ok' },
        'chat-mutation'
      );
      return reply.send({ ok: true, message });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'chat_empty_message') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Повідомлення порожнє.',
        });
      }
      if (msg === 'chat_channel_unavailable') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Цей канал чату ще недоступний.',
        });
      }
      if (msg === 'character_not_found') {
        return reply.code(404).send({
          error: 'not_found',
          messageUk: 'Персонажа не знайдено.',
        });
      }
      request.log.info({ action: 'chat_send', result: 'error' }, 'chat-mutation');
      return reply.code(500).send({
        error: 'server_error',
        messageUk: 'Не вдалося надіслати повідомлення.',
      });
    }
  });

  app.delete('/chat/:messageId', { preHandler: requireAuth }, async (request, reply) => {
    const userId = request.userId;
    if (!userId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const params = request.params as { messageId?: string };

    try {
      await deleteChatMessage(userId, params?.messageId);
      request.log.info({ action: 'chat_delete', result: 'ok' }, 'chat-mutation');
      return reply.send({ ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'chat_message_not_found') {
        return reply.code(404).send({
          error: 'not_found',
          messageUk: 'Повідомлення не знайдено.',
        });
      }
      if (msg === 'chat_forbidden') {
        return reply.code(403).send({
          error: 'forbidden',
          messageUk: 'Можна видалити лише своє повідомлення.',
        });
      }
      if (msg === 'character_not_found') {
        return reply.code(404).send({
          error: 'not_found',
          messageUk: 'Персонажа не знайдено.',
        });
      }
      request.log.info({ action: 'chat_delete', result: 'error' }, 'chat-mutation');
      return reply.code(500).send({
        error: 'server_error',
        messageUk: 'Не вдалося видалити повідомлення.',
      });
    }
  });
}
