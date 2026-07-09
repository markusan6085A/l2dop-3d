import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  getOnlinePresenceSnapshot,
  touchOnlinePresence,
} from '../services/onlinePresenceService.js';

export function registerGameOnlineRoutes(app: FastifyInstance): void {
  app.get(
    '/online',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      await touchOnlinePresence(userId);
      return reply.send(getOnlinePresenceSnapshot());
    }
  );
}
