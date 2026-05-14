import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  getResourceCraftBook,
  performResourceCraft,
} from '../services/resourceCraftService.js';
import { sendRevisionConflict } from './revisionConflict.js';

export function registerGameResourceCraftRoutes(app: FastifyInstance): void {
  app.get(
    '/resource-craft/book',
    { preHandler: requireAuth },
    async (_request, reply) => reply.send(getResourceCraftBook())
  );

  app.post(
    '/resource-craft',
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
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const tier = Math.floor(Number(b.tier));
      const recipeIndex = Math.floor(Number(b.recipeIndex));
      const quantity = Math.floor(Number(b.quantity ?? 1));
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (!Number.isFinite(tier) || tier < 1 || tier > 4) {
        return reply.code(400).send({
          error: 'invalid_recipe',
          messageUk: 'Некоректний рівень крафту.',
        });
      }
      if (!Number.isFinite(recipeIndex) || recipeIndex < 0) {
        return reply.code(400).send({
          error: 'invalid_recipe',
          messageUk: 'Некоректний рецепт.',
        });
      }
      try {
        const character = await performResourceCraft(
          userId,
          er,
          tier,
          recipeIndex,
          quantity
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'craft_profession_required') {
          return reply.code(403).send({
            error: e.message,
            messageUk:
              'Крафт лише для Збирача (Scavenger), Ремісника (Artisan) та Маестро (Maestro).',
          });
        }
        if (e instanceof Error && e.message === 'level_too_low') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Занадто низький рівень для цього ряду рецептів.',
          });
        }
        if (e instanceof Error && e.message === 'insufficient_materials') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Недостатньо матеріалів у сумці.',
          });
        }
        if (e instanceof Error && e.message === 'invalid_recipe') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий рецепт.',
          });
        }
        throw e;
      }
    }
  );
}
