import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  getPlayerPublicProfileById,
  getPlayerPublicProfileByName,
} from '../services/playerPublicProfileService.js';

export function registerGamePlayerRoutes(app: FastifyInstance): void {
  app.get(
    '/player/by-name/:name/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const params = request.params as { name?: string };
      const profile = await getPlayerPublicProfileByName(params?.name || '');
      if (!profile) {
        return reply.code(404).send({
          error: 'not_found',
          messageUk: 'Гравця не знайдено.',
        });
      }

      return reply.send({ profile });
    }
  );

  app.get(
    '/player/:characterId/profile',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const params = request.params as { characterId?: string };
      const profile = await getPlayerPublicProfileById(params?.characterId || '');
      if (!profile) {
        return reply.code(404).send({
          error: 'not_found',
          messageUk: 'Гравця не знайдено.',
        });
      }

      return reply.send({ profile });
    }
  );
}
