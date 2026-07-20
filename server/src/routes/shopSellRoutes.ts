import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charErrors.js';
import {
  applyShopSell,
  buildShopSellPricesForClient,
} from '../services/shopSellService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { handleShopSellRouteError } from './shopSellRouteErrors.js';
import { MAX_ENCHANT_LEVEL } from '../data/enchantConfig.js';

function parseSellBody(b: Record<string, unknown>) {
  const itemId = Number(b.itemId);
  if (!Number.isFinite(itemId) || itemId <= 0) return null;
  const enRaw = b.enchant;
  const enchant =
    typeof enRaw === 'number' && Number.isFinite(enRaw)
      ? Math.max(0, Math.min(MAX_ENCHANT_LEVEL, Math.floor(enRaw)))
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

/** GET/POST /game/shop/sell* — продаж предметів з сумки. */
export const shopSellRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/shop/sell/prices',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({ prices: buildShopSellPricesForClient() });
    }
  );

  app.post(
    '/shop/sell',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseSellBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані предмета.',
        });
      }
      try {
        const character = await applyShopSell(
          userId,
          er,
          parsed.itemId,
          parsed.enchant,
          parsed.qty
        );
        await logRouteMutation(
          request,
          'shop_sell:' + String(parsed.itemId),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'shop_sell', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleShopSellRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'shop_sell', er, 'error');
        request.log.error({ err }, 'POST /game/shop/sell');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося продати предмет.',
        });
      }
    }
  );
};
