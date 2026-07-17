import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { ensureUserId } from './routeHttpHelpers.js';
import { listServerNews } from '../services/serverNewsService.js';

export function registerGameNewsRoutes(app: FastifyInstance): void {
  app.get('/news', { preHandler: requireAuth }, async (request, reply) => {
    const userId = ensureUserId(request, reply);
    if (!userId) return;

    const q = request.query as { page?: string };
    const result = await listServerNews(q?.page);
    return reply.send(result);
  });
}
