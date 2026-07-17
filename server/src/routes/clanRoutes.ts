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
import { sendClanCreateError } from './clanRouteErrors.js';

/** GET /game/clans/list, POST /game/clans/create */
export function registerClanRoutes(app: FastifyInstance): void {
  app.get(
    '/clans/list',
    { preHandler: requireAuth },
    async (_request, reply) => {
      const clans = await listClansForClient();
      return reply.send({ clans });
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
}
