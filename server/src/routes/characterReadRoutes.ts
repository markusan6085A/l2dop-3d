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
import { itemNamesEnForClient } from '../data/itemNamesEnForClient.js';
import { ancientAdenaIconHintsForClient } from '../data/ancientAdenaItem.js';
import { mammonGemstoneIconHintsForClient } from '../data/mammonMerchantGemstones.js';
import { mammonLifeStoneIconHintsForClient } from '../data/mammonMerchantLifeStones.js';
import {
  sealStoneIconHintsForClient,
  sealStoneNameColorSlugForClient,
} from '../data/sevenSignsSealStoneItems.js';
import { basicResourceIconHintsForClient } from '../data/itemsCatalogBasicResources.js';
import {
  itemBlocksShieldHintsForClient,
  itemRequiresArrowsHintsForClient,
} from '../data/l2dopTwoHandedWeapon.js';
import { getSnapshotForUser } from '../services/charService.js';
import { findPvpIncomingForCharacter } from '../services/pvpIncomingService.js';
import { getCharacterMapStateForUser } from '../services/charMapStateService.js';
import { getMagisterDialogForUser } from '../services/skillLearnService.js';
import { getCharacterBonusesForUser } from '../services/characterBonusesService.js';
import { characterDbErrorPayload } from './characterRouteErrors.js';
import { CHARACTER_CATALOG_VERSION } from '../data/characterCatalogVersion.js';
import { armorSetCatalogForClient } from '../data/armorSetResolver.js';

function buildCharacterCatalogHints() {
  return {
    catalogVersion: CHARACTER_CATALOG_VERSION,
    gearCatalog: listGearCatalogForClient(),
    /** Підписи предметів англійською (зброя, броня, дроп, ресурси). */
    itemNamesEn: itemNamesEnForClient(),
    /** Legacy UA — лишається для сумісності, UI бере itemNamesEn. */
    itemNamesUk: itemNamesUkForClient(),
    itemSlotHints: itemSlotHintsForClient(),
    itemInventoryTabHints: itemInventoryTabHintsForClient(),
    itemGradeHints: itemGradeHintsForClient(),
    itemStatsHints: itemStatsHintsForClient(),
    /** Дворучна зброя (l1 займає «другу руку») — для UI слота щита. */
    itemBlocksShieldById: itemBlocksShieldHintsForClient(),
    /** Лук → true; інші типи не передаються (explicit false не потрібен). */
    itemRequiresArrowsById: itemRequiresArrowsHintsForClient(),
    armorSetCatalog: armorSetCatalogForClient(),
    /** itemId → URL іконки (seal stones, mammon, ancient adena). */
    itemIconHintByItemId: {
      ...sealStoneIconHintsForClient(),
      ...ancientAdenaIconHintsForClient(),
      ...mammonGemstoneIconHintsForClient(),
      ...mammonLifeStoneIconHintsForClient(),
      ...basicResourceIconHintsForClient(),
    },
    /** itemId → CSS slug кольору назви (каміння печаті Seven Signs). */
    itemNameColorSlugById: sealStoneNameColorSlugForClient(),
  };
}

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
        const q = request.query as Record<string, unknown>;
        const claimWorld =
          q.claimWorld === '1' ||
          q.claimWorld === 1 ||
          q.claimWorldSession === '1' ||
          q.claimWorldSession === 1;
        const character = await getSnapshotForUser(userId, {
          claimWorldSession: claimWorld,
        });
        if (!character) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        return reply.send({
          character,
          catalogVersion: CHARACTER_CATALOG_VERSION,
          pvpIncoming: await findPvpIncomingForCharacter(character.id),
        });
      } catch (err) {
        request.log.error({ err }, 'GET /character');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );

  /** Важкі довідники предметів для UI (окремо від легкого /character). */
  app.get(
    '/catalog-hints',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      return reply.send(buildCharacterCatalogHints());
    }
  );

  /** Легкий зріз для poll карти (без gearCatalog / інвентаря). */
  app.get(
    '/map-state',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const mapState = await getCharacterMapStateForUser(userId);
        if (!mapState) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        return reply.send(mapState);
      } catch (err) {
        request.log.error({ err }, 'GET /character/map-state');
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

  /** Діалог магістра в місті (скіли на вивчення за SP). Дані не кешувати — список залежить від рівня/профи. */
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
        void reply.header(
          'Cache-Control',
          'private, no-store, no-cache, must-revalidate, max-age=0'
        );
        return reply.send(dialog);
      } catch (err) {
        request.log.error({ err }, 'GET /character/magister');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );

  app.get(
    '/bonuses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      try {
        const bonuses = await getCharacterBonusesForUser(userId);
        if (!bonuses) {
          return reply.code(404).send({ error: 'forbidden' });
        }
        void reply.header(
          'Cache-Control',
          'private, no-store, no-cache, must-revalidate, max-age=0'
        );
        return reply.send({ bonuses });
      } catch (err) {
        request.log.error({ err }, 'GET /character/bonuses');
        const { code, body } = characterDbErrorPayload(err);
        return reply.code(code).send(body);
      }
    }
  );
}
