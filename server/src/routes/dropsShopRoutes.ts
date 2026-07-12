import type { FastifyPluginAsync } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  applyDropsShopPurchase,
  buildDropsShopCatalogForClient,
} from '../services/dropsShopService.js';
import { GameConflictError } from '../services/charErrors.js';

/** GET/POST /game/drops-shop* — магазин екіпу з іконок у public/icons/drops. */
export const dropsShopRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/drops-shop',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send(buildDropsShopCatalogForClient());
    }
  );

  app.post(
    '/drops-shop/buy',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректне тіло запиту.',
        });
      }
      const b = body as Record<string, unknown>;
      const shopKey = b.shopKey;
      const er = b.expectedRevision;
      const qtyRaw = b.qty ?? b.quantity;
      if (typeof shopKey !== 'string' || !shopKey.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Вкажи shopKey предмета.',
        });
      }
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await applyDropsShopPurchase(userId, shopKey, er, qtyRaw);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error) {
          const m = e.message;
          if (m === 'no_character') {
            return reply.code(404).send({ error: 'forbidden' });
          }
          if (m === 'drops_shop_unknown') {
            return reply.code(400).send({
              error: m,
              messageUk: 'Такого товару немає в каталозі.',
            });
          }
          if (m === 'drops_shop_not_configured') {
            return reply.code(400).send({
              error: m,
              messageUk:
                'Немає ціни для покупки: додай рядок у dropsShopOverrides.json або збіг у GM-каталозі за іконкою.',
            });
          }
          if (m === 'drops_shop_bad_item') {
            return reply.code(400).send({
              error: m,
              messageUk:
                'Предмет не знайдено в ITEM_CATALOG — додай дані предмета на сервері.',
            });
          }
          if (m === 'drops_shop_bad_qty') {
            return reply.code(400).send({
              error: m,
              messageUk: 'Вкажи кількість від 1 до 9999.',
            });
          }
          if (m === 'drops_shop_category_mismatch') {
            return reply.code(400).send({
              error: m,
              messageUk: 'Невідповідність типу предмета та розділу магазину.',
            });
          }
          if (m === 'drops_shop_no_adena') {
            return reply.code(400).send({
              error: m,
              messageUk: 'Недостатньо адени.',
            });
          }
        }
        throw e;
      }
    }
  );
};
