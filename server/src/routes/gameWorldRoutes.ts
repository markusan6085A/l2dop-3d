import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { MAP_TOWNS } from '../data/mapLocalities.js';
import {
  GameConflictError,
  performHunt,
  performMapMove,
  performTeleport,
} from '../services/charService.js';
import { getMapAroundForUser } from '../services/mapAroundService.js';
import { getMapWorldSpawnsNearPlayer } from '../services/mapSpawnsService.js';
import { getMapSyncForUser } from '../services/charMapStateService.js';
import { getSpawnCatalogInfo } from '../services/spawnCatalogService.js';
import { prisma } from '../lib/prisma.js';
import type { CharacterRow } from '../services/charService.js';
import { sendRevisionConflict } from './revisionConflict.js';

async function logMutationOutcome(
  request: { log: { info: (obj: unknown, msg?: string) => void }; userId?: string },
  action: string,
  expectedRevision: number,
  result: 'ok' | 'conflict' | 'error',
  actualRevision?: number
): Promise<void> {
  if (!request.userId) return;
  let actual = actualRevision;
  if (actual == null && result !== 'ok') {
    const row = await prisma.character.findFirst({
      where: { userId: request.userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, revision: true },
    });
    request.log.info({
      action,
      characterId: row?.id ?? null,
      expectedRevision,
      actualRevision: row?.revision ?? null,
      result,
    }, 'game-mutation');
    return;
  }
  const row = await prisma.character.findFirst({
    where: { userId: request.userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  request.log.info({
    action,
    characterId: row?.id ?? null,
    expectedRevision,
    actualRevision: actual ?? null,
    result,
  }, 'game-mutation');
}

export function registerGameWorldRoutes(app: FastifyInstance): void {
  app.get(
    '/map/sync',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const data = await getMapSyncForUser(userId);
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.get(
    '/map/spawns',
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const row = (await prisma.character.findFirst({
        where: { userId: request.userId },
      })) as CharacterRow | null;
      if (!row) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send({
        spawns: getMapWorldSpawnsNearPlayer(
          row.worldX,
          row.worldY,
          row.mobSpawnHpJson
        ),
      });
    }
  );

  app.get(
    '/map/around',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const data = await getMapAroundForUser(userId);
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.get(
    '/spawn/:spawnId/info',
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const { spawnId } = request.params as { spawnId: string };
      const row = (await prisma.character.findFirst({
        where: { userId: request.userId },
      })) as CharacterRow | null;
      if (!row) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      const info = getSpawnCatalogInfo(spawnId, {
        race: row.race,
        l2Profession: row.l2Profession,
        skillsLearnedJson: row.skillsLearnedJson,
      });
      if (!info) {
        return reply.code(404).send({ error: 'not_found' });
      }
      return reply.send(info);
    }
  );

  app.get(
    '/teleport/locations',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({
        locations: MAP_TOWNS.map((t) => ({
          teleportId: t.teleportId,
          labelUk: t.labelUk,
          labelEn: t.labelEn,
        })),
      });
    }
  );

  app.post(
    '/teleport',
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
      const teleportId = b.teleportId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof teleportId !== 'string' || !teleportId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери пункт призначення.',
        });
      }
      try {
        const character = await performTeleport(
          userId,
          teleportId.trim(),
          er
        );
        await logMutationOutcome(request, 'teleport', er, 'ok', character.revision);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logMutationOutcome(request, 'teleport', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'teleport_unknown') {
          await logMutationOutcome(request, 'teleport', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий пункт телепорту.',
          });
        }
        await logMutationOutcome(request, 'teleport', er, 'error');
        throw e;
      }
    }
  );

  app.post(
    '/move',
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
      const tx = b.targetX;
      const ty = b.targetY;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof tx !== 'number' || typeof ty !== 'number') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібні targetX і targetY (числа).',
        });
      }
      try {
        const character = await performMapMove(userId, tx, ty, er);
        await logMutationOutcome(request, 'map_move', er, 'ok', character.revision);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logMutationOutcome(request, 'map_move', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'map_target_too_far') {
          await logMutationOutcome(request, 'map_move', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Ціль занадто далеко.',
          });
        }
        if (e instanceof Error && e.message === 'map_target_too_close') {
          await logMutationOutcome(request, 'map_move', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Обери точку далі від поточної позиції.',
          });
        }
        if (e instanceof Error && e.message === 'map_move_invalid') {
          await logMutationOutcome(request, 'map_move', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Некоректні координати.',
          });
        }
        await logMutationOutcome(request, 'map_move', er, 'error');
        throw e;
      }
    }
  );

  app.post(
    '/hunt',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      const er = (body as Record<string, unknown>).expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({ error: 'invalid_input' });
      }

      try {
        const character = await performHunt(userId, er);
        await logMutationOutcome(request, 'hunt', er, 'ok', character.revision);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logMutationOutcome(request, 'hunt', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logMutationOutcome(request, 'hunt', er, 'error');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logMutationOutcome(request, 'hunt', er, 'error');
        throw e;
      }
    }
  );
}
