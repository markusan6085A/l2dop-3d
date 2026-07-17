import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { GameConflictError } from '../services/charErrors.js';
import {
  createClanForUser,
  listClansForClient,
} from '../services/clanCreateService.js';
import { getClanMyForUser, updateClanAnnouncementForUser } from '../services/clanMyService.js';
import { sendClanCreateError } from './clanRouteErrors.js';

/** GET /game/clans/list, GET /game/clans/my, POST /game/clans/create */
export function registerClanRoutes(app: FastifyInstance): void {
  app.get(
    '/clans/list',
    { preHandler: requireAuth },
    async (_request, reply) => {
      const clans = await listClansForClient();
      return reply.send({ clans });
    }
  );

  app.get(
    '/clans/my',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const clan = await getClanMyForUser(userId);
      return reply.send({ clan });
    }
  );

  app.post(
    '/clans/create',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const character = await createClanForUser(userId, rev, b.clanName);
        await logRouteMutation(
          request,
          'clan_create',
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_create', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_create', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_create', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/create');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося створити клан.',
        });
      }
    }
  );

  app.post(
    '/clans/announcement',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const clan = await updateClanAnnouncementForUser(
          userId,
          rev,
          b.announcement
        );
        await logRouteMutation(request, 'clan_announcement', rev, 'ok', rev);
        return reply.send({ clan });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_announcement', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_announcement', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_announcement', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/announcement');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося зберегти оголошення.',
        });
      }
    }
  );
}
