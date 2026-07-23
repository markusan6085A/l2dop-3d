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
  performEnterCityHub,
} from '../services/charService.js';
import { getMapAroundForUser, resolvedWorldPositionFromCharacterRow } from '../services/mapAroundService.js';
import { getMapWorldSpawnsNearPlayer } from '../services/mapSpawnsService.js';
import { getMapSyncForUser } from '../services/charMapStateService.js';
import { getMammonMerchantState } from '../services/mammonMerchantService.js';
import { getMammonBlacksmithState } from '../services/mammonBlacksmithService.js';
import { prisma } from '../lib/prisma.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import type { CharacterRow } from '../services/charTypes.js';
import {
  getDungeonViewWithPlayer,
  performDungeonEnter,
  performDungeonMove,
} from '../services/dungeonMoveService.js';
import { performDungeonLeave } from '../services/dungeonLeaveService.js';
import { dungeonViewDeniedMessageUk } from '../domain/dungeonMoveLogic.js';
import { getSpawnCatalogInfo } from '../services/spawnCatalogService.js';
import { listRaidBossesPage } from '../services/raidBossListService.js';
import { listSevenSignsDungeonsForMenu } from '../services/sevenSignsDungeonListService.js';
import { performSevenSignsDungeonTeleport } from '../services/sevenSignsDungeonTeleportService.js';
import { syncWorldMapPresenceForUser } from '../services/onlinePresenceService.js';
import {
  parseMammonTeleportKind,
  performMammonTeleport,
} from '../services/mammonTeleportService.js';
import {
  getMammonMerchantShopCatalog,
  performMammonMerchantBuy,
} from '../services/mammonMerchantBuyService.js';
import {
  handleMammonMerchantShopRouteError,
  handleMammonTeleportRouteError,
} from './gameMammonRouteErrors.js';

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
      const mammonRotationSig =
        typeof q.mammonRotationSig === 'string' ? q.mammonRotationSig : undefined;
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
        mammonRotationSig,
        revision,
      });
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.get(
    '/mammon/merchant',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({ mammonMerchant: getMammonMerchantState() });
    }
  );

  app.get(
    '/mammon/merchant/shop',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send(getMammonMerchantShopCatalog());
    }
  );

  app.post(
    '/mammon/merchant/buy',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const category =
        typeof b.category === 'string' && b.category.trim()
          ? b.category
          : null;
      const itemKey = b.itemKey ?? b.grade;
      const qtyRaw = b.qty ?? b.quantity ?? 1;
      const action = `mammon_merchant_buy:${String(category)}:${String(itemKey)}`;
      try {
        const character = await performMammonMerchantBuy(
          userId,
          er,
          category,
          itemKey,
          qtyRaw
        );
        await logRouteMutation(
          request,
          action,
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
            action,
            er,
            'conflict',
            undefined,
            undefined,
            'game-mutation'
          );
          return sendGameConflict(reply, e);
        }
        const handled = handleMammonMerchantShopRouteError(reply, e);
        if (handled) {
          await logRouteMutation(
            request,
            action,
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return handled;
        }
        await logRouteMutation(
          request,
          action,
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
    '/mammon/blacksmith',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({ mammonBlacksmith: getMammonBlacksmithState() });
    }
  );

  app.post(
    '/mammon/teleport',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const kind = parseMammonTeleportKind(b.kind);
      if (!kind) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери Торговця або Коваля Маммона.',
        });
      }
      const action = 'mammon_teleport:' + kind;
      try {
        const character = await performMammonTeleport(userId, kind, er);
        await logRouteMutation(
          request,
          action,
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
            action,
            er,
            'conflict',
            undefined,
            undefined,
            'game-mutation'
          );
          return sendGameConflict(reply, e);
        }
        const handled = handleMammonTeleportRouteError(reply, e);
        if (handled) {
          await logRouteMutation(
            request,
            action,
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return handled;
        }
        await logRouteMutation(
          request,
          action,
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
    '/dungeon/view',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = request.query as Record<string, unknown>;
      const dungeonId =
        typeof q.dungeonId === 'string' ? q.dungeonId.trim() : '';
      if (!dungeonId) {
        return reply.code(400).send({ messageUk: 'Невідоме подземелля.' });
      }
      const row = (await prisma.character.findFirst({
        where: { userId },
        orderBy: { lastUpdate: 'desc' },
      })) as CharacterRow | null;
      if (!row) {
        return reply.code(404).send({ messageUk: 'Персонажа не знайдено.' });
      }
      const view = await getDungeonViewWithPlayer(row, dungeonId);
      if (!view) {
        return reply.code(403).send({
          messageUk: dungeonViewDeniedMessageUk(row, dungeonId),
        });
      }
      return reply.send({ dungeon: view });
    }
  );

  app.post(
    '/dungeon/enter',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const dungeonId =
        typeof b.dungeonId === 'string' ? b.dungeonId.trim() : '';
      if (!dungeonId) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Невідоме подземелля.',
        });
      }
      try {
        const result = await performDungeonEnter(userId, dungeonId, er);
        await logRouteMutation(
          request,
          'dungeon_enter',
          er,
          'ok',
          result.character.revision,
          undefined,
          'game-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(
            request,
            'dungeon_enter',
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
        if (e instanceof Error && e.message === 'dungeon_enter_invalid') {
          await logRouteMutation(
            request,
            'dungeon_enter',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідоме подземелля.',
          });
        }
        if (e instanceof Error && e.message === 'dungeon_enter_forbidden') {
          await logRouteMutation(
            request,
            'dungeon_enter',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(403).send({
            error: e.message,
            messageUk: 'Підійди ближче до входу в некрополь або катакомби.',
          });
        }
        await logRouteMutation(
          request,
          'dungeon_enter',
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

  app.post(
    '/dungeon/leave',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      try {
        const character = await performDungeonLeave(userId, er);
        await logRouteMutation(
          request,
          'dungeon_leave',
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
            'dungeon_leave',
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
        await logRouteMutation(
          request,
          'dungeon_leave',
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

  app.post(
    '/dungeon/move',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const dungeonId =
        typeof b.dungeonId === 'string' ? b.dungeonId.trim() : '';
      const tx = b.targetMapX;
      const ty = b.targetMapY;
      if (!dungeonId) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Невідоме подземелля.',
        });
      }
      if (typeof tx !== 'number' || typeof ty !== 'number') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібні targetMapX і targetMapY (числа).',
        });
      }
      try {
        const result = await performDungeonMove(
          userId,
          dungeonId,
          tx,
          ty,
          er
        );
        await logRouteMutation(
          request,
          'dungeon_move',
          er,
          'ok',
          result.character.revision,
          undefined,
          'game-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(
            request,
            'dungeon_move',
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
        if (e instanceof Error && e.message === 'dungeon_move_invalid') {
          await logRouteMutation(
            request,
            'dungeon_move',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Некоректні координати.',
          });
        }
        if (e instanceof Error && e.message === 'dungeon_move_forbidden') {
          await logRouteMutation(
            request,
            'dungeon_move',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(403).send({
            error: e.message,
            messageUk: 'Рух у подземеллі зараз недоступний.',
          });
        }
        if (e instanceof Error && e.message === 'dungeon_target_too_close') {
          await logRouteMutation(
            request,
            'dungeon_move',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Обери точку далі від поточної позиції.',
          });
        }
        if (
          e instanceof Error &&
          (e.message === 'dungeon_target_blocked' ||
            e.message === 'dungeon_no_path')
        ) {
          await logRouteMutation(
            request,
            'dungeon_move',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Туди не пройти — лише по коридорах катакомб.',
          });
        }
        await logRouteMutation(
          request,
          'dungeon_move',
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
        characterLevel: levelFromTotalExp(row.exp),
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
      const row = await prisma.character.findFirst({
        where: { userId },
        select: { exp: true },
      });
      const characterLevel = row != null ? levelFromTotalExp(row.exp) : null;
      return reply.send(listRaidBossesPage(page, undefined, characterLevel));
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
    '/catacombs',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      return reply.send(listSevenSignsDungeonsForMenu());
    }
  );

  app.post(
    '/catacombs/teleport',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const dungeonId =
        typeof b.dungeonId === 'string' ? b.dungeonId.trim() : '';
      if (!dungeonId) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери некрополь або катакомбу.',
        });
      }
      try {
        const character = await performSevenSignsDungeonTeleport(
          userId,
          dungeonId,
          er
        );
        await logRouteMutation(
          request,
          'catacombs_teleport',
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
            'catacombs_teleport',
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
        if (e instanceof Error && e.message === 'seven_signs_dungeon_unknown') {
          await logRouteMutation(
            request,
            'catacombs_teleport',
            er,
            'error',
            undefined,
            undefined,
            'game-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідоме подземелля.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'seven_signs_dungeon_teleport_not_enough_adena'
        ) {
          await logRouteMutation(
            request,
            'catacombs_teleport',
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
          'catacombs_teleport',
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
    '/world/enter-city',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      try {
        const character = await performEnterCityHub(userId, er);
        await logRouteMutation(
          request,
          'enter_city',
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
            'enter_city',
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
        if (e instanceof Error && e.message === 'teleport_unknown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Не вдалося визначити місто.',
          });
        }
        await logRouteMutation(
          request,
          'enter_city',
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

  app.post(
    '/world/enter-map',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      await syncWorldMapPresenceForUser(userId);
      return reply.send({ ok: true });
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
