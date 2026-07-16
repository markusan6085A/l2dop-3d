import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { claimDailyQuestReward } from '../services/dailyQuestClaimService.js';
import { GameConflictError } from '../services/charService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { mapDailyQuestClaimError } from './characterDailyQuestRouteErrors.js';

export function registerCharacterDailyQuestRoutes(app: FastifyInstance): void {
  app.post(
    '/daily-quests/claim',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const taskId = b.taskId;

      try {
        const character = await claimDailyQuestReward(userId, taskId, er);
        await logRouteMutation(request, 'daily_quest_claim', er, 'ok');
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'daily_quest_claim', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        if (
          mapDailyQuestClaimError(
            request,
            reply,
            err,
            'POST /character/daily-quests/claim'
          )
        ) {
          await logRouteMutation(request, 'daily_quest_claim', er, 'error');
          return;
        }
        throw err;
      }
    }
  );
}
