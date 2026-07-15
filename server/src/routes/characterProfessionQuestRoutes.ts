import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { GameConflictError } from '../services/charService.js';
import { acceptHumanFighterFirstProfessionQuest } from '../services/charProfessionFirstQuest.js';
import { mapProfessionFirstJobQuestError } from './characterProfessionQuestRouteErrors.js';

export function registerCharacterProfessionQuestRoutes(
  app: FastifyInstance
): void {
  app.post(
    '/profession-quest/accept-first',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const slugRaw = b.slug;
      const slug =
        typeof slugRaw === 'string' ? slugRaw.trim().toLowerCase() : '';
      if (!slug) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен slug професії.',
        });
      }
      try {
        const character = await acceptHumanFighterFirstProfessionQuest(
          userId,
          slug,
          er
        );
        await logRouteMutation(
          request,
          'profession_quest_accept_first',
          er,
          'ok'
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(
            request,
            'profession_quest_accept_first',
            er,
            'conflict'
          );
          return sendGameConflict(reply, err);
        }
        if (
          mapProfessionFirstJobQuestError(
            request,
            reply,
            err,
            'POST /character/profession-quest/accept-first'
          )
        ) {
          await logRouteMutation(
            request,
            'profession_quest_accept_first',
            er,
            'error'
          );
          return;
        }
      }
    }
  );
}
