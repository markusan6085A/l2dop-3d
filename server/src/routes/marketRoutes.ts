import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charErrors.js';
import {
  buyMarketListing,
  cancelMarketListing,
  createMarketListing,
  listActiveMarketListings,
  listCoinOfLuckListings,
  listMyMarketListings,
} from '../services/marketService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { handleMarketRouteError } from './marketRouteErrors.js';

function parseMarketListBody(b: Record<string, unknown>) {
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
  const adenaRaw = b.priceAdena;
  let priceAdena = 0n;
  if (typeof adenaRaw === 'number' && Number.isFinite(adenaRaw)) {
    priceAdena = BigInt(Math.max(0, Math.floor(adenaRaw)));
  } else if (typeof adenaRaw === 'string' && adenaRaw.trim() !== '') {
    try {
      priceAdena = BigInt(adenaRaw.trim());
      if (priceAdena < 0n) priceAdena = 0n;
    } catch {
      return null;
    }
  }
  const coinRaw = b.priceCoinOfLuck;
  const priceCoinOfLuck =
    typeof coinRaw === 'number' && Number.isFinite(coinRaw)
      ? Math.max(0, Math.floor(coinRaw))
      : 0;
  return { itemId, enchant, qty, priceAdena, priceCoinOfLuck };
}

function parseMarketCancelBody(b: Record<string, unknown>) {
  const listingId = b.listingId;
  if (typeof listingId !== 'string' || listingId.trim() === '') return null;
  return { listingId: listingId.trim() };
}

function parseMarketBuyBody(b: Record<string, unknown>) {
  const listingId = b.listingId;
  if (typeof listingId !== 'string' || listingId.trim() === '') return null;
  const qtyRaw = b.qty;
  let qty: number | undefined;
  if (qtyRaw != null) {
    if (typeof qtyRaw !== 'number' || !Number.isFinite(qtyRaw)) return null;
    qty = Math.floor(qtyRaw);
    if (qty <= 0) return null;
  }
  return { listingId: listingId.trim(), qty };
}

export const marketReadRoutes: FastifyPluginAsync = async (app) => {
  app.get('/market/listings', async (_request, reply) => {
    const listings = await listActiveMarketListings();
    return reply.send({ listings });
  });

  app.get('/market/coin-of-luck/listings', async (_request, reply) => {
    const listings = await listCoinOfLuckListings();
    return reply.send({ listings });
  });
};

export function registerMarketMutationRoutes(app: FastifyInstance): void {
  app.get(
    '/market/my-listings',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const listings = await listMyMarketListings(userId);
      return reply.send({ listings });
    }
  );

  app.post(
    '/market/buy',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseMarketBuyBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректне оголошення.',
        });
      }
      try {
        const result = await buyMarketListing(
          userId,
          er,
          parsed.listingId,
          parsed.qty
        );
        await logRouteMutation(
          request,
          'market_buy:' + parsed.listingId,
          er,
          'ok',
          result.character.revision
        );
        return reply.send({ character: result.character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'market_buy', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleMarketRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'market_buy', er, 'error');
        request.log.error({ err }, 'POST /character/market/buy');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося купити лот.',
        });
      }
    }
  );

  app.post(
    '/market/cancel',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseMarketCancelBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректне оголошення.',
        });
      }
      try {
        const result = await cancelMarketListing(userId, er, parsed.listingId);
        await logRouteMutation(
          request,
          'market_cancel:' + parsed.listingId,
          er,
          'ok',
          result.character.revision
        );
        return reply.send({ character: result.character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'market_cancel', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleMarketRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'market_cancel', er, 'error');
        request.log.error({ err }, 'POST /character/market/cancel');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося скасувати оголошення.',
        });
      }
    }
  );

  app.post(
    '/market/list',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const parsed = parseMarketListBody(b);
      if (!parsed) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані оголошення.',
        });
      }
      try {
        const result = await createMarketListing(userId, er, parsed);
        await logRouteMutation(
          request,
          'market_list:' + String(parsed.itemId),
          er,
          'ok',
          result.character.revision
        );
        return reply.send({
          character: result.character,
          listing: result.listing,
        });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'market_list', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        const handled = handleMarketRouteError(reply, err);
        if (handled) return handled;
        await logRouteMutation(request, 'market_list', er, 'error');
        request.log.error({ err }, 'POST /character/market/list');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося виставити предмет на продаж.',
        });
      }
    }
  );
}
