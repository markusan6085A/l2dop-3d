import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  applyUsePotionFromBag,
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

/** POST /character/consumable/use — HP/MP зілля з сумки поза боєм. */
export function registerCharacterConsumableUseRoutes(app: FastifyInstance): void {
  app.post(
    '/consumable/use',
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

      const itemId = Math.floor(Number(b.itemId));
      const quantity = Math.floor(Number(b.quantity ?? 1));
      if (!Number.isFinite(itemId) || itemId <= 0) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний предмет.',
        });
      }
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > 999) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Кількість має бути від 1 до 999.',
        });
      }

      try {
        const character = await applyUsePotionFromBag(
          userId,
          itemId,
          rev,
          quantity
        );
        await logCharacterMutation(
          request,
          'consumable_use:' + String(itemId),
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(request, 'consumable_use', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (msg === 'in_battle') {
          return reply.code(400).send({
            error: 'in_battle',
            messageUk: 'Під час бою зілля — через панель швидкого доступу.',
          });
        }
        if (msg === 'not_in_bag') {
          return reply.code(400).send({
            error: 'not_in_bag',
            messageUk: 'Недостатньо предметів у сумці.',
          });
        }
        if (msg === 'bad_potion') {
          return reply.code(400).send({
            error: 'bad_potion',
            messageUk: 'Цей предмет не можна використати так.',
          });
        }
        await logCharacterMutation(request, 'consumable_use', rev, 'error');
        request.log.error({ err }, 'POST /character/consumable/use');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося використати предмет.',
        });
      }
    }
  );
}
