import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { ensureUserId, logRouteMutation } from './routeHttpHelpers.js';
import {
  cancelClanTaskForUser,
  claimClanTaskForUser,
  getClanTasksForUser,
  helpClanTaskForUser,
  takeClanTaskForUser,
} from '../services/clanTask/clanTaskService.js';
import {
  mapClanTaskMutationError,
  sendClanTaskError,
} from './clanTaskRouteErrors.js';

/** Кланові завдання — cooperative clan tasks. */
export function registerClanTaskRoutes(app: FastifyInstance): void {
  app.get('/clan-tasks', { preHandler: requireAuth }, async (request, reply) => {
    const userId = ensureUserId(request, reply);
    if (!userId) return;
    const view = await getClanTasksForUser(userId);
    if (!view) {
      sendClanTaskError(reply, 'character_not_found');
      return;
    }
    return reply.send(view);
  });

  app.post(
    '/clan-tasks/:taskType/take',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const taskType = (request.params as { taskType?: string }).taskType;
      try {
        const view = await takeClanTaskForUser(userId, taskType);
        await logRouteMutation(request, 'clan_task_take', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapClanTaskMutationError(err, reply)) return;
        request.log.error({ err }, 'POST /game/clan-tasks/take');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/clan-tasks/:taskId/help',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const taskId = (request.params as { taskId?: string }).taskId;
      try {
        const view = await helpClanTaskForUser(userId, taskId);
        await logRouteMutation(request, 'clan_task_help', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapClanTaskMutationError(err, reply)) return;
        request.log.error({ err }, 'POST /game/clan-tasks/help');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/clan-tasks/:taskId/claim',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const taskId = (request.params as { taskId?: string }).taskId;
      try {
        const view = await claimClanTaskForUser(userId, taskId);
        await logRouteMutation(request, 'clan_task_claim', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapClanTaskMutationError(err, reply)) return;
        request.log.error({ err }, 'POST /game/clan-tasks/claim');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/clan-tasks/:taskId/cancel',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const taskId = (request.params as { taskId?: string }).taskId;
      try {
        const view = await cancelClanTaskForUser(userId, taskId);
        await logRouteMutation(request, 'clan_task_cancel', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapClanTaskMutationError(err, reply)) return;
        request.log.error({ err }, 'POST /game/clan-tasks/cancel');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );
}
