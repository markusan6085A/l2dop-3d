import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { GameConflictError } from '../services/charErrors.js';
import {
  applyLearnRecipeFromBag,
  recipeLearnErrorMessageUk,
} from '../services/recipeLearnService.js';

/** POST /game/recipes/learn — вивчення recipe scroll. */
export const gameRecipeRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/recipes/learn',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.',
      );
      if (rev == null) return;

      const itemId = Math.floor(Number(b.itemId));
      if (!Number.isFinite(itemId) || itemId <= 0) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний предмет.',
        });
      }

      try {
        const result = await applyLearnRecipeFromBag(userId, itemId, rev);
        await logRouteMutation(
          request,
          'recipe_learn:' + String(itemId),
          rev,
          'ok',
          result.character.revision,
        );
        return reply.send({
          character: result.character,
          learnedRecipeCode: result.learnedRecipeCode,
        });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'recipe_learn', rev, 'conflict');
          return sendGameConflict(reply, e);
        }
        const msg = e instanceof Error ? e.message : '';
        const messageUk = recipeLearnErrorMessageUk(msg);
        if (messageUk) {
          await logRouteMutation(request, 'recipe_learn', rev, 'error');
          return reply.code(400).send({ error: msg, messageUk });
        }
        throw e;
      }
    },
  );
};
