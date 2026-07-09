import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  getOnlinePresenceSnapshot,
  touchOnlinePresence,
  type OnlineSortMode,
} from '../services/onlinePresenceService.js';

function parseOnlineSort(raw: unknown): OnlineSortMode {
  return String(raw || '').trim() === 'name' ? 'name' : 'level';
}

export function registerGameOnlineRoutes(app: FastifyInstance): void {
  app.get(
    '/online',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const q = request.query as { sort?: string };
      const sort = parseOnlineSort(q?.sort);

      await touchOnlinePresence(userId);
      return reply.send(getOnlinePresenceSnapshot(sort));
    }
  );
}
