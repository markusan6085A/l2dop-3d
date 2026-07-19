import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { ensureUserId, logRouteMutation } from './routeHttpHelpers.js';
import {
  getDragonDungeonForUser,
  unlockDragonForUser,
} from '../services/dragonDungeonService.js';
import {
  attackDragonForUser,
  enterDragonBattleForUser,
  leaveDragonBattleForUser,
  syncDragonBattleForUser,
} from '../services/dragonDungeonBattleService.js';
import {
  mapDragonDungeonError,
  mapDragonDungeonUnlockError,
  sendDragonDungeonError,
} from './dragonDungeonRouteErrors.js';

/** Dragon dungeon routes (clan-based). */
export function registerDragonDungeonRoutes(app: FastifyInstance): void {
  app.get(
    '/dragon-dungeon',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const view = await getDragonDungeonForUser(userId);
      if (!view) {
        sendDragonDungeonError(reply, 'character_not_found');
        return;
      }
      return reply.send(view);
    }
  );

  app.post(
    '/dragon-dungeon/:dragonId/unlock',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const dragonId = (request.params as { dragonId?: string }).dragonId;
      try {
        const view = await unlockDragonForUser(userId, dragonId);
        await logRouteMutation(request, 'dragon_dungeon_unlock', 0, 'ok');
        return reply.send(view);
      } catch (err) {
        if (mapDragonDungeonUnlockError(err, reply)) return;
        request.log.error({ err }, 'POST /game/dragon-dungeon/unlock');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/dragon-dungeon/active/enter',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const body = (request.body ?? {}) as { dungeonId?: string };
      try {
        const battle = await enterDragonBattleForUser(userId, body.dungeonId);
        await logRouteMutation(request, 'dragon_dungeon_enter', 0, 'ok');
        return reply.send(battle);
      } catch (err) {
        if (mapDragonDungeonError(err, reply)) return;
        request.log.error({ err }, 'POST /game/dragon-dungeon/active/enter');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/dragon-dungeon/active/attack',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const body = (request.body ?? {}) as { dungeonId?: string; action?: string };
      try {
        const battle = await attackDragonForUser(
          userId,
          body.dungeonId,
          body.action ?? 'attack'
        );
        await logRouteMutation(request, 'dragon_dungeon_attack', 0, 'ok');
        return reply.send(battle);
      } catch (err) {
        if (mapDragonDungeonError(err, reply)) return;
        request.log.error({ err }, 'POST /game/dragon-dungeon/active/attack');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.post(
    '/dragon-dungeon/active/leave',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const body = (request.body ?? {}) as { dungeonId?: string };
      try {
        const result = await leaveDragonBattleForUser(userId, body.dungeonId);
        await logRouteMutation(request, 'dragon_dungeon_leave', 0, 'ok');
        return reply.send(result);
      } catch (err) {
        if (mapDragonDungeonError(err, reply)) return;
        request.log.error({ err }, 'POST /game/dragon-dungeon/active/leave');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );

  app.get(
    '/dragon-dungeon/active/sync',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = request.query as { dungeonId?: string };
      try {
        const battle = await syncDragonBattleForUser(userId, q.dungeonId);
        return reply.send(battle);
      } catch (err) {
        if (mapDragonDungeonError(err, reply)) return;
        request.log.error({ err }, 'GET /game/dragon-dungeon/active/sync');
        reply.code(500).send({ error: 'internal_error', messageUk: 'Помилка сервера.' });
      }
    }
  );
}
