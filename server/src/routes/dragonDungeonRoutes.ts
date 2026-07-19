import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { ensureUserId, logRouteMutation } from './routeHttpHelpers.js';
import {
  getDragonDungeonForUser,
  unlockDragonForUser,
} from '../services/dragonDungeonService.js';
import {
  mapDragonDungeonUnlockError,
  sendDragonDungeonError,
} from './dragonDungeonRouteErrors.js';

/** GET /game/dragon-dungeon, POST /game/dragon-dungeon/:dragonId/unlock */
export function registerDragonDungeonRoutes(app: FastifyInstance): void {
  app.get(
    '/dragon-dungeon',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const view = await getDragonDungeonForUser(userId);
      if (!view) {
        sendDragonDungeonError(reply, 'character_not_found');
        return;
      }
      return reply.send(view);
    }
  );

  app.post(
    '/dragon-dungeon/:dragonId/unlock',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const dragonId = (request.params as { dragonId?: string }).dragonId;
      try {
        const view = await unlockDragonForUser(userId, dragonId);
        await logRouteMutation(request, 'dragon_dungeon_unlock', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapDragonDungeonUnlockError(err, reply)) return;
        request.log.error({ err }, 'POST /game/dragon-dungeon/unlock');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );
}
