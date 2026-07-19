import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
} from './routeHttpHelpers.js';
import {
  SiegeAttackError,
  attackSiegeWallForUser,
  getSiegeStateForUser,
} from '../services/clanSiege/clanSiegeStateService.js';
import {
  SiegePvpError,
  startSiegePvpBattleForUser,
} from '../services/clanSiege/clanSiegePvpService.js';
import { sendSiegeAttackError } from './clanSiegeRouteErrors.js';
import { sendGameConflict } from './routeHttpHelpers.js';
import { GameConflictError } from '../services/charService.js';

function characterIdFromQuery(
  q: Record<string, unknown>
): string | null | undefined {
  const raw = q.characterId;
  if (raw == null || raw === '') return undefined;
  return String(raw);
}

/** GET /game/siege/:cityId/state, POST /game/siege/:cityId/attack-wall */
export function registerClanSiegeRoutes(app: FastifyInstance): void {
  app.get(
    '/siege/:cityId/state',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const params = request.params as { cityId?: string };
      const cityId = String(params.cityId || '').trim();
      const q = (request.query ?? {}) as Record<string, unknown>;
      try {
        const state = await getSiegeStateForUser(
          userId,
          cityId,
          characterIdFromQuery(q)
        );
        return reply.send(state);
      } catch (err) {
        if (err instanceof Error && err.message === 'siege_invalid_city') {
          return reply.code(404).send({
            error: 'siege_invalid_city',
            messageUk: 'Місто не бере участі в облозі.',
          });
        }
        if (err instanceof Error && err.message === 'no_character') {
          return reply.code(404).send({
            error: 'no_character',
            messageUk: 'Немає персонажа.',
          });
        }
        request.log.error({ err }, 'GET /game/siege/:cityId/state');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося завантажити стан облоги.',
        });
      }
    }
  );

  app.post(
    '/siege/:cityId/attack-wall',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const params = request.params as { cityId?: string };
      const cityId = String(params.cityId || '').trim();
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const actionId =
        typeof b.actionId === 'string' ? b.actionId.trim() : '';
      const charId =
        typeof b.characterId === 'string' ? b.characterId.trim() : undefined;

      try {
        const result = await attackSiegeWallForUser(
          userId,
          cityId,
          actionId,
          charId || undefined
        );
        await logRouteMutation(request, 'siege_attack_wall', 0, 'ok');
        return reply.send(result);
      } catch (err) {
        if (err instanceof SiegeAttackError) {
          await logRouteMutation(request, 'siege_attack_wall', 0, 'error');
          return sendSiegeAttackError(reply, err);
        }
        await logRouteMutation(request, 'siege_attack_wall', 0, 'error');
        request.log.error({ err }, 'POST /game/siege/:cityId/attack-wall');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося виконати удар.',
        });
      }
    }
  );

  app.post(
    '/siege/:cityId/pvp/start',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const params = request.params as { cityId?: string };
      const cityId = String(params.cityId || '').trim();
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const targetCharacterId =
        typeof b.targetCharacterId === 'string'
          ? b.targetCharacterId.trim()
          : '';
      if (!targetCharacterId) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен targetCharacterId.',
        });
      }
      const charId =
        typeof b.characterId === 'string' ? b.characterId.trim() : undefined;

      try {
        const result = await startSiegePvpBattleForUser(
          userId,
          cityId,
          targetCharacterId,
          er,
          charId || undefined
        );
        await logRouteMutation(
          request,
          'siege_pvp_start',
          er,
          'ok',
          result.character.revision,
          result.character.id
        );
        return reply.send(result);
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'siege_pvp_start', er, 'conflict');
          return sendGameConflict(reply, err);
        }
        if (err instanceof SiegePvpError) {
          await logRouteMutation(request, 'siege_pvp_start', er, 'error');
          return sendSiegeAttackError(reply, err);
        }
        await logRouteMutation(request, 'siege_pvp_start', er, 'error');
        request.log.error({ err }, 'POST /game/siege/:cityId/pvp/start');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося розпочати PvP на облозі.',
        });
      }
    }
  );
}
