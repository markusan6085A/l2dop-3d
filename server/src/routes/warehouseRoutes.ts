import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  applyWarehouseDeposit,
  applyWarehouseWithdraw,
} from '../services/warehouseService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { handleWarehouseRouteError } from './warehouseRouteErrors.js';

function parseWarehouseBody(b: Record<string, unknown>) {
  const itemId = Number(b.itemId);
  if (!Number.isFinite(itemId) || itemId <= 0) return null;
  const enRaw = b.enchant;
  const enchant =
    typeof enRaw === 'number' && Number.isFinite(enRaw)
      ? Math.max(0, Math.min(20, Math.floor(enRaw)))
      : 0;
  const qtyRaw = b.qty;
  let qty: number | undefined;
  if (qtyRaw != null) {
    if (typeof qtyRaw !== 'number' || !Number.isFinite(qtyRaw)) return null;
    qty = Math.floor(qtyRaw);
    if (qty <= 0) return null;
  }
  return { itemId, enchant, qty };
}

/** POST /character/warehouse/withdraw|deposit */
export function registerWarehouseRoutes(app: FastifyInstance): void {
  app.post(
    '/warehouse/withdraw',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseWarehouseBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані предмета.',
        });
      }
      try {
        const character = await applyWarehouseWithdraw(userId, er, parsed);
        await logRouteMutation(
          request,
          'warehouse_withdraw:' + String(parsed.itemId),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'warehouse_withdraw', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleWarehouseRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'warehouse_withdraw', er, 'error');
        request.log.error({ err }, 'POST /character/warehouse/withdraw');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося забрати предмет зі складу.',
        });
      }
    }
  );

  app.post(
    '/warehouse/deposit',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseWarehouseBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані предмета.',
        });
      }
      try {
        const character = await applyWarehouseDeposit(userId, er, parsed);
        await logRouteMutation(
          request,
          'warehouse_deposit:' + String(parsed.itemId),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'warehouse_deposit', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleWarehouseRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'warehouse_deposit', er, 'error');
        request.log.error({ err }, 'POST /character/warehouse/deposit');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося покласти предмет на склад.',
        });
      }
    }
  );
}
