import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { townNpcsPayloadForCity } from '../data/townNpcs.js';
import {
  itemGradeHintsForClient,
  itemInventoryTabHintsForClient,
  itemNamesUkForClient,
  itemSlotHintsForClient,
  itemStatsHintsForClient,
  listGearCatalogForClient,
} from '../data/itemsCatalog.js';
import { itemBlocksShieldHintsForClient } from '../data/l2dopTwoHandedWeapon.js';
import { getSnapshotForUser } from '../services/charService.js';
import { getMagisterDialogForUser } from '../services/skillLearnService.js';
import { characterDbErrorPayload } from './characterRouteErrors.js';

/** GET /character, /town, /magister */
export function registerCharacterReadRoutes(app: FastifyInstance): void {
  app.get(
    '/',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const character = await getSnapshotForUser(userId);
        if (!character) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        return reply.send({
          character,
          gearCatalog: listGearCatalogForClient(),
          /** Підписи для дропу / сумки / ресурсів: lineage + каталог + ручні UA. */
          itemNamesUk: itemNamesUkForClient(),
          itemSlotHints: itemSlotHintsForClient(),
          itemInventoryTabHints: itemInventoryTabHintsForClient(),
          itemGradeHints: itemGradeHintsForClient(),
          itemStatsHints: itemStatsHintsForClient(),
          /** Дворучна зброя (l1 займає «другу руку») — для UI слота щита. */
          itemBlocksShieldById: itemBlocksShieldHintsForClient(),
        });
      } catch (err) {
        request.log.error({ err }, 'GET /character');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );

  /** НПС поточного міста (кнопки-дії для мешканців). */
  app.get(
    '/town',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const row = await prisma.character.findFirst({
          where: { userId },
          orderBy: { lastUpdate: 'desc' },
          select: { cityId: true },
        });
        if (!row) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        const cityId =
          typeof row.cityId === 'string' && row.cityId.trim()
            ? row.cityId.trim()
            : 'l2dop_gludio';
        return reply.send({
          cityId,
          npcs: townNpcsPayloadForCity(cityId),
        });
      } catch (err) {
        request.log.error({ err }, 'GET /character/town');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );

  /** Діалог магістра в місті (скіли на вивчення за SP). */
  app.get(
    '/magister',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const q = request.query as Record<string, unknown>;
        const dialog = await getMagisterDialogForUser(userId, q.npcId);
        if (!dialog) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        return reply.send(dialog);
      } catch (err) {
        request.log.error({ err }, 'GET /character/magister');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );
}
