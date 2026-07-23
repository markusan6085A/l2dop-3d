import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { sendGameConflict } from './routeHttpHelpers.js';
import { GameConflictError } from '../services/charErrors.js';
import {
  applyCraftedResourceCraft,
  buildCraftedResourceMaterialsBook,
} from '../services/craftedResourceCraftService.js';

/** GET/POST /game/craft/materials — crafted-ресурси (етап 2). */
export const gameCraftRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    '/craft/materials',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
      try {
        return reply.send(await buildCraftedResourceMaterialsBook(userId));
      } catch (e) {
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        throw e;
      }
    },
  );

  app.post(
    '/craft/materials',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) return reply.code(401).send({ error: 'Unauthorized' });
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректне тіло запиту.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await applyCraftedResourceCraft(
          userId,
          b.recipeCode,
          b.craftCount,
          er,
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error) {
          const map: Record<string, string> = {
            no_character: 'Персонаж не знайдений.',
            craft_unknown_recipe: 'Невідомий рецепт.',
            craft_bad_count: 'Некоректна кількість.',
            craft_bad_profession: 'Крафт доступний тільки професіям Artisan, Warsmith і Maestro.',
            craft_no_create_item: 'Потрібен скіл Create Item.',
            craft_level_too_low: 'Недостатній рівень Create Item.',
            craft_no_mp: 'Недостатньо MP.',
            craft_no_materials: 'Недостатньо матеріалів.',
            craft_overflow: 'Занадто велика кількість.',
            in_battle: 'Неможливо під час бою.',
          };
          const msg = map[e.message];
          if (msg) {
            return reply.code(400).send({ error: e.message, messageUk: msg });
          }
        }
        throw e;
      }
    },
  );
};
