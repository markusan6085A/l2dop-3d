import type { FastifyInstance } from 'fastify';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  applyProfileStatus,
  GameConflictError,
} from '../services/charService.js';

/** POST /character/profile-status — зберегти текст статусу профілю. */
export function registerCharacterProfileStatusRoutes(app: FastifyInstance): void {
  app.post(
    '/profile-status',
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
        const character = await applyProfileStatus(userId, rev, b.status);
        await logRouteMutation(
          request,
          'profile_status',
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'profile_status', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (msg === 'status_too_long') {
          return reply.code(400).send({
            error: 'status_too_long',
            messageUk: 'Статус занадто довгий (макс. 100 символів).',
          });
        }
        await logRouteMutation(request, 'profile_status', rev, 'error');
        request.log.error({ err }, 'POST /character/profile-status');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося зберегти статус.',
        });
      }
    }
  );
}
