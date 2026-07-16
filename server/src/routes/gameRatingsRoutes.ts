import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { getRatingsSnapshot } from '../services/ratingsService.js';

export function registerGameRatingsRoutes(app: FastifyInstance): void {
  app.get(
    '/ratings',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const q = request.query as { type?: string; page?: string };
      const snapshot = await getRatingsSnapshot({
        userId,
        typeRaw: q?.type,
        pageRaw: q?.page,
      });
      return reply.send(snapshot);
    }
  );
}
