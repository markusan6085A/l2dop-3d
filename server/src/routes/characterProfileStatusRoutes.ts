import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  applyProfileStatus,
  GameConflictError,
} from '../services/charService.js';
import { prisma } from '../lib/prisma.js';

async function logCharacterMutation(
  request: { log: { info: (obj: unknown, msg?: string) => void }; userId?: string },
  action: string,
  expectedRevision: number,
  result: 'ok' | 'conflict' | 'error',
  actualRevision?: number
): Promise<void> {
  if (!request.userId) return;
  const row = await prisma.character.findFirst({
    where: { userId: request.userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, revision: true },
  });
  request.log.info(
    {
      action,
      characterId: row?.id ?? null,
      expectedRevision,
      actualRevision: actualRevision ?? row?.revision ?? null,
      result,
    },
    'character-mutation'
  );
}

/** POST /character/profile-status — зберегти текст статусу профілю. */
export function registerCharacterProfileStatusRoutes(app: FastifyInstance): void {
  app.post(
    '/profile-status',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const rev = b.expectedRevision;
      if (typeof rev !== 'number' || !Number.isFinite(rev)) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Передай expectedRevision з відповіді /character.',
        });
      }

      try {
        const character = await applyProfileStatus(userId, rev, b.status);
        await logCharacterMutation(
          request,
          'profile_status',
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(request, 'profile_status', rev, 'conflict');
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
        await logCharacterMutation(request, 'profile_status', rev, 'error');
        request.log.error({ err }, 'POST /character/profile-status');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося зберегти статус.',
        });
      }
    }
  );
}
