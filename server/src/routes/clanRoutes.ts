import type { FastifyInstance } from 'fastify';
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
  createClanForUser,
  listClansForClient,
} from '../services/clanCreateService.js';
import { getClanMyForUser, updateClanAnnouncementForUser } from '../services/clanMyService.js';
import {
  getClanHallForUser,
  purchaseClanHallBlessingForUser,
} from '../services/clanHallService.js';
import {
  acceptClanInviteForUser,
  declineClanInviteForUser,
  sendClanInviteForUser,
} from '../services/clanInviteService.js';
import { sendClanCreateError } from './clanRouteErrors.js';

/** GET /game/clans/list, GET /game/clans/my, POST /game/clans/create, … */
export function registerClanRoutes(app: FastifyInstance): void {
  app.get(
    '/clans/list',
    { preHandler: requireAuth },
    async (_request, reply) => {
      const clans = await listClansForClient();
      return reply.send({ clans });
    }
  );

  app.get(
    '/clans/my',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const clan = await getClanMyForUser(userId);
      return reply.send({ clan });
    }
  );

  app.post(
    '/clans/create',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const character = await createClanForUser(userId, rev, b.clanName);
        await logRouteMutation(
          request,
          'clan_create',
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_create', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_create', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_create', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/create');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося створити клан.',
        });
      }
    }
  );

  app.post(
    '/clans/announcement',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const clan = await updateClanAnnouncementForUser(
          userId,
          rev,
          b.announcement
        );
        await logRouteMutation(request, 'clan_announcement', rev, 'ok', rev);
        return reply.send({ clan });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_announcement', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_announcement', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_announcement', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/announcement');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося зберегти оголошення.',
        });
      }
    }
  );

  app.post(
    '/clans/invite',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;

      try {
        await sendClanInviteForUser(userId, b.targetCharacterId);
        await logRouteMutation(request, 'clan_invite', 0, 'ok');
        return reply.send({ ok: true });
      } catch (err) {
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_invite', 0, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_invite', 0, 'error');
        request.log.error({ err }, 'POST /game/clans/invite');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося надіслати запрошення в клан.',
        });
      }
    }
  );

  app.post(
    '/clans/invite/accept',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const character = await acceptClanInviteForUser(userId, b.inviteId, rev);
        await logRouteMutation(
          request,
          'clan_invite_accept',
          rev,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_invite_accept', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_invite_accept', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_invite_accept', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/invite/accept');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося прийняти запрошення в клан.',
        });
      }
    }
  );

  app.post(
    '/clans/invite/decline',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;

      try {
        await declineClanInviteForUser(userId, b.inviteId);
        await logRouteMutation(request, 'clan_invite_decline', 0, 'ok');
        return reply.send({ ok: true });
      } catch (err) {
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_invite_decline', 0, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_invite_decline', 0, 'error');
        request.log.error({ err }, 'POST /game/clans/invite/decline');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося відхилити запрошення в клан.',
        });
      }
    }
  );

  app.get(
    '/clans/hall',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const hall = await getClanHallForUser(userId);
      return reply.send({ hall });
    }
  );

  app.post(
    '/clans/hall/buy',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const rev = parseExpectedRevision(
        b,
        reply,
        'Передай expectedRevision з відповіді /character.'
      );
      if (rev == null) return;

      try {
        const result = await purchaseClanHallBlessingForUser(userId, rev);
        await logRouteMutation(
          request,
          'clan_hall_buy',
          rev,
          'ok',
          result.character.revision
        );
        return reply.send(result);
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'clan_hall_buy', rev, 'conflict');
          return sendGameConflict(reply, err);
        }
        const mapped = sendClanCreateError(reply, err);
        if (mapped) {
          await logRouteMutation(request, 'clan_hall_buy', rev, 'error');
          return mapped;
        }
        await logRouteMutation(request, 'clan_hall_buy', rev, 'error');
        request.log.error({ err }, 'POST /game/clans/hall/buy');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося купити Клан-хол.',
        });
      }
    }
  );
}
