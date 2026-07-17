import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import { performAncientTraderExchange } from '../services/ancientTraderExchangeService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { handleAncientTraderRouteError } from './gameAncientTraderRouteErrors.js';

export function registerGameAncientTraderRoutes(app: FastifyInstance): void {
  app.post(
    '/ancient-trader/exchange',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const stone = b.stone;
      const qtyRaw = b.qty ?? b.quantity ?? 1;
      const action = `ancient_trader_exchange:${String(stone)}`;
      try {
        const character = await performAncientTraderExchange(
          userId,
          er,
          stone,
          qtyRaw
        );
        await logRouteMutation(
          request,
          action,
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, action, er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleAncientTraderRouteError(reply, err);
        if (handled) {
          await logRouteMutation(request, action, er, 'error');
          return handled;
        }
        await logRouteMutation(request, action, er, 'error');
        request.log.error({ err }, 'POST /ancient-trader/exchange');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося виконати обмін.',
        });
      }
    }
  );
}
