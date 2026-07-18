import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  ensureBodyRecord,
  ensureUserId,
  parseOptionalCharacterId,
} from './routeHttpHelpers.js';
import { PartyVersionConflictError } from '../services/party/partyErrors.js';
import {
  acceptPartyInviteForUser,
  declinePartyInviteForUser,
  invitePlayerFromProfileForUser,
  listPartyInvitesForUser,
  sendPartyInviteForUser,
} from '../services/party/partyInviteService.js';
import { getPartyHudForUser } from '../services/party/partyHudService.js';
import {
  createPartyForUser,
  disbandPartyForUser,
  getPartyForUser,
  kickPartyMemberForUser,
  leavePartyForUser,
} from '../services/party/partyService.js';
import { handlePartyRouteError } from './partyRouteErrorHandlers.js';
import {
  logPartyRouteMutation,
  parseExpectedPartyVersion,
  sendPartyRouteError,
} from './partyRouteHelpers.js';

function characterIdFromBody(b: Record<string, unknown>): string | null {
  return parseOptionalCharacterId(b.characterId);
}

function characterIdFromQuery(q: Record<string, unknown>): string | null {
  return parseOptionalCharacterId(q.characterId);
}

function isPartyVersionConflictErr(err: unknown): boolean {
  return (
    err instanceof PartyVersionConflictError ||
    (err instanceof Error && err.message === 'party_version_mismatch')
  );
}

export function registerPartyRoutes(app: FastifyInstance): void {
  app.get(
    '/party',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = (request.query as Record<string, unknown>) ?? {};
      try {
        return reply.send(
          await getPartyForUser(userId, characterIdFromQuery(q))
        );
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) return mapped;
        throw err;
      }
    }
  );

  app.get(
    '/party/hud',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = (request.query as Record<string, unknown>) ?? {};
      try {
        return reply.send(await getPartyHudForUser(userId, characterIdFromQuery(q)));
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) return mapped;
        throw err;
      }
    }
  );

  app.get(
    '/party/invites',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = (request.query as Record<string, unknown>) ?? {};
      try {
        return reply.send(
          await listPartyInvitesForUser(userId, characterIdFromQuery(q))
        );
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) return mapped;
        throw err;
      }
    }
  );

  app.post(
    '/party/create',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      try {
        const result = await createPartyForUser(userId, characterIdFromBody(b));
        await logPartyRouteMutation(
          request,
          'party_create',
          null,
          'ok',
          result.party.version,
          result.party.id
        );
        return reply.send(result);
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) {
          await logPartyRouteMutation(request, 'party_create', null, 'error');
          return mapped;
        }
        await logPartyRouteMutation(request, 'party_create', null, 'error');
        throw err;
      }
    }
  );

  app.post(
    '/party/invite-player',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const charId = characterIdFromBody(b);
      try {
        const result = await invitePlayerFromProfileForUser(
          userId,
          b.targetCharacterId,
          charId
        );
        await logPartyRouteMutation(
          request,
          'party_invite_player',
          null,
          'ok',
          result.partyVersion
        );
        return reply.send(result);
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) {
          await logPartyRouteMutation(request, 'party_invite_player', null, 'error');
          return mapped;
        }
        await logPartyRouteMutation(request, 'party_invite_player', null, 'error');
        throw err;
      }
    }
  );

  app.post(
    '/party/invite',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const pv = parseExpectedPartyVersion(b, reply);
      if (pv == null) return;
      const charId = characterIdFromBody(b);
      try {
        const result = await sendPartyInviteForUser(
          userId,
          b.targetCharacterId,
          pv,
          charId
        );
        await logPartyRouteMutation(
          request,
          'party_invite',
          pv,
          'ok',
          result.partyVersion
        );
        return reply.send(result);
      } catch (err) {
        if (err instanceof PartyVersionConflictError) {
          await logPartyRouteMutation(
            request,
            'party_invite',
            pv,
            'conflict',
            err.serverPartyVersion
          );
        }
        const handled = await handlePartyRouteError(reply, err, userId, charId);
        if (handled) {
          if (!(err instanceof PartyVersionConflictError)) {
            await logPartyRouteMutation(request, 'party_invite', pv, 'error');
          }
          return handled;
        }
        await logPartyRouteMutation(request, 'party_invite', pv, 'error');
        throw err;
      }
    }
  );

  app.post(
    '/party/invite/accept',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const pv = parseExpectedPartyVersion(b, reply);
      if (pv == null) return;
      const charId = characterIdFromBody(b);
      try {
        const result = await acceptPartyInviteForUser(
          userId,
          b.inviteId,
          pv,
          charId
        );
        await logPartyRouteMutation(
          request,
          'party_invite_accept',
          pv,
          'ok',
          result.party.version,
          result.party.id
        );
        return reply.send(result);
      } catch (err) {
        const handled = await handlePartyRouteError(reply, err, userId, charId);
        if (handled) {
          await logPartyRouteMutation(
            request,
            'party_invite_accept',
            pv,
            isPartyVersionConflictErr(err) ? 'conflict' : 'error'
          );
          return handled;
        }
        await logPartyRouteMutation(
          request,
          'party_invite_accept',
          pv,
          'error'
        );
        throw err;
      }
    }
  );

  app.post(
    '/party/invite/decline',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      try {
        await declinePartyInviteForUser(
          userId,
          b.inviteId,
          characterIdFromBody(b)
        );
        await logPartyRouteMutation(request, 'party_invite_decline', null, 'ok');
        return reply.send({ ok: true });
      } catch (err) {
        const mapped = sendPartyRouteError(reply, err);
        if (mapped) {
          await logPartyRouteMutation(
            request,
            'party_invite_decline',
            null,
            'error'
          );
          return mapped;
        }
        await logPartyRouteMutation(
          request,
          'party_invite_decline',
          null,
          'error'
        );
        throw err;
      }
    }
  );

  app.post(
    '/party/leave',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const pv = parseExpectedPartyVersion(b, reply);
      if (pv == null) return;
      const charId = characterIdFromBody(b);
      try {
        const result = await leavePartyForUser(userId, pv, charId);
        await logPartyRouteMutation(request, 'party_leave', pv, 'ok');
        return reply.send(result);
      } catch (err) {
        const handled = await handlePartyRouteError(reply, err, userId, charId);
        if (handled) {
          await logPartyRouteMutation(
            request,
            'party_leave',
            pv,
            isPartyVersionConflictErr(err) ? 'conflict' : 'error'
          );
          return handled;
        }
        await logPartyRouteMutation(request, 'party_leave', pv, 'error');
        throw err;
      }
    }
  );

  app.post(
    '/party/kick',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const pv = parseExpectedPartyVersion(b, reply);
      if (pv == null) return;
      const charId = characterIdFromBody(b);
      try {
        const result = await kickPartyMemberForUser(
          userId,
          b.targetCharacterId,
          pv,
          charId
        );
        await logPartyRouteMutation(
          request,
          'party_kick',
          pv,
          'ok',
          result.party.version,
          result.party.id
        );
        return reply.send(result);
      } catch (err) {
        const handled = await handlePartyRouteError(reply, err, userId, charId);
        if (handled) {
          await logPartyRouteMutation(
            request,
            'party_kick',
            pv,
            isPartyVersionConflictErr(err) ? 'conflict' : 'error'
          );
          return handled;
        }
        await logPartyRouteMutation(request, 'party_kick', pv, 'error');
        throw err;
      }
    }
  );

  app.post(
    '/party/disband',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const pv = parseExpectedPartyVersion(b, reply);
      if (pv == null) return;
      const charId = characterIdFromBody(b);
      try {
        await disbandPartyForUser(userId, pv, charId);
        await logPartyRouteMutation(request, 'party_disband', pv, 'ok');
        return reply.send({ ok: true });
      } catch (err) {
        const handled = await handlePartyRouteError(reply, err, userId, charId);
        if (handled) {
          await logPartyRouteMutation(
            request,
            'party_disband',
            pv,
            isPartyVersionConflictErr(err) ? 'conflict' : 'error'
          );
          return handled;
        }
        await logPartyRouteMutation(request, 'party_disband', pv, 'error');
        throw err;
      }
    }
  );
}
