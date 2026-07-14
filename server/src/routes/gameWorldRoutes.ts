import type { FastifyInstance } from 'fastify';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { MAP_TOWNS, getTeleportAdenaCost } from '../data/mapLocalities.js';
import { getTeleportMobLevelRange } from '../data/teleportMobLevelRanges.js';
import {
  GameConflictError,
  performHunt,
  performMapMove,
  performTeleport,
  performRaidBossTeleport,
} from '../services/charService.js';
import { getMapAroundForUser, resolvedWorldPositionFromCharacterRow } from '../services/mapAroundService.js';
import { getMapWorldSpawnsNearPlayer } from '../services/mapSpawnsService.js';
import { getMapSyncForUser } from '../services/charMapStateService.js';
import { getSpawnCatalogInfo } from '../services/spawnCatalogService.js';
import { listRaidBossesPage } from '../services/raidBossListService.js';
import { prisma } from '../lib/prisma.js';
import type { CharacterRow } from '../services/charService.js';

export function registerGameWorldRoutes(app: FastifyInstance): void {
  app.get(
    '/map/sync',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = request.query as Record<string, unknown>;
      const rawCat = q.mapCatalogVersion;
      const rawRev = q.revision;
      const personalMapSig =
        typeof q.personalMapSig === 'string' ? q.personalMapSig : undefined;
      const mapCatalogVersion =
        typeof rawCat === 'string' && /^\d+$/.test(rawCat)
          ? parseInt(rawCat, 10)
          : typeof rawCat === 'number' && Number.isFinite(rawCat)
            ? Math.floor(rawCat)
            : undefined;
      const revision =
        typeof rawRev === 'string' && /^\d+$/.test(rawRev)
          ? parseInt(rawRev, 10)
          : typeof rawRev === 'number' && Number.isFinite(rawRev)
            ? Math.floor(rawRev)
            : undefined;
      const data = await getMapSyncForUser(userId, {
        mapCatalogVersion,
        personalMapSig,
        revision,
      });
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
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const row = (await prisma.character.findFirst({
        where: { userId },
      })) as CharacterRow | null;
      if (!row) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      const pos = resolvedWorldPositionFromCharacterRow(row);
      return reply.send({
        spawns: getMapWorldSpawnsNearPlayer(
          pos.worldX,
          pos.worldY,
          pos.mobSpawnHpJson
        ),
      });
    }
  );

  app.get(
    '/map/around',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
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
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const { spawnId } = request.params as { spawnId: string };
      const row = (await prisma.character.findFirst({
        where: { userId },
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
    '/raid-bosses',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = request.query as { page?: string };
      const page = q.page != null ? Number(q.page) : 1;
      return reply.send(listRaidBossesPage(page));
    }
  );

  app.post(
    '/raid-boss/teleport',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const spawnId = b.spawnId;
      if (typeof spawnId !== 'string' || !spawnId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери рейд-боса.',
        });
      }
      try {
        const character = await performRaidBossTeleport(
          userId,
          spawnId.trim(),
          er
        );
        await logRouteMutation(
          request,
          'raid_boss_teleport',
          er,
          'ok',
          character.revision,
          undefined,
          'game-mutation'
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(
            request,
            'raid_boss_teleport',
            er,
            'conflict',
            undefined,
            undefined,
            'game-mutation'
          );
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'raid_boss_unknown') {
          await logRouteMutation(
            request,
            'raid_boss_teleport',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий рейд-бос.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'raid_boss_teleport_not_enough_adena'
        ) {
          await logRouteMutation(
            request,
            'raid_boss_teleport',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Недостатньо адени для телепорту.',
          });
        }
        await logRouteMutation(
          request,
          'raid_boss_teleport',
          er,
          'error',
          undefined,
          undefined,
          'game-mutation'
        );
        throw e;
      }
    }
  );

  app.get(
    '/teleport/locations',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({
        locations: MAP_TOWNS.map((t) => {
          const mobLevelRange = getTeleportMobLevelRange(t.teleportId);
          return {
            teleportId: t.teleportId,
            labelUk: t.labelUk,
            labelEn: t.labelEn,
            adenaCost: getTeleportAdenaCost(t.teleportId),
            mobLevelMin: mobLevelRange?.min ?? null,
            mobLevelMax: mobLevelRange?.max ?? null,
          };
        }),
      });
    }
  );

  app.post(
    '/teleport',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const teleportId = b.teleportId;
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
        await logRouteMutation(request, 'teleport', er, 'ok', character.revision, undefined, 'game-mutation');
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'teleport', er, 'conflict', undefined, undefined, 'game-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'teleport_unknown') {
          await logRouteMutation(request, 'teleport', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий пункт телепорту.',
          });
        }
        if (e instanceof Error && e.message === 'teleport_not_enough_adena') {
          await logRouteMutation(request, 'teleport', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Недостатньо адени для телепорту.',
          });
        }
        await logRouteMutation(request, 'teleport', er, 'error', undefined, undefined, 'game-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/move',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const tx = b.targetX;
      const ty = b.targetY;
      if (typeof tx !== 'number' || typeof ty !== 'number') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібні targetX і targetY (числа).',
        });
      }
      try {
        const character = await performMapMove(userId, tx, ty, er);
        await logRouteMutation(request, 'map_move', er, 'ok', character.revision, undefined, 'game-mutation');
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'map_move', er, 'conflict', undefined, undefined, 'game-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'map_target_too_far') {
          await logRouteMutation(request, 'map_move', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Ціль занадто далеко.',
          });
        }
        if (e instanceof Error && e.message === 'map_target_too_close') {
          await logRouteMutation(request, 'map_move', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Обери точку далі від поточної позиції.',
          });
        }
        if (e instanceof Error && e.message === 'map_move_invalid') {
          await logRouteMutation(request, 'map_move', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Некоректні координати.',
          });
        }
        await logRouteMutation(request, 'map_move', er, 'error', undefined, undefined, 'game-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/hunt',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;

      try {
        const character = await performHunt(userId, er);
        await logRouteMutation(request, 'hunt', er, 'ok', character.revision, undefined, 'game-mutation');
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'hunt', er, 'conflict', undefined, undefined, 'game-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logRouteMutation(request, 'hunt', er, 'error', undefined, undefined, 'game-mutation');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logRouteMutation(request, 'hunt', er, 'error', undefined, undefined, 'game-mutation');
        throw e;
      }
    }
  );
}
