import type { FastifyReply } from 'fastify';
import { PartyVersionConflictError } from '../services/party/partyErrors.js';
import { mapPartyVersionMismatchToConflict } from '../services/party/partyInviteService.js';
import { sendPartyVersionConflict } from './partyConflict.js';
import { sendPartyRouteError } from './partyRouteHelpers.js';

/** Обробка помилок мутацій паті для route. */
export async function handlePartyRouteError(
  reply: FastifyReply,
  err: unknown,
  userId: string,
  characterId?: string | null
): Promise<FastifyReply | null> {
  if (err instanceof PartyVersionConflictError) {
    return sendPartyVersionConflict(reply, {
      serverPartyVersion: err.serverPartyVersion,
      party: err.party,
    });
  }
  try {
    await mapPartyVersionMismatchToConflict(err, userId, characterId);
  } catch (mapped) {
    if (mapped instanceof PartyVersionConflictError) {
      return sendPartyVersionConflict(reply, {
        serverPartyVersion: mapped.serverPartyVersion,
        party: mapped.party,
      });
    }
    const http = sendPartyRouteError(reply, mapped);
    if (http) return http;
    throw mapped;
  }
  const http = sendPartyRouteError(reply, err);
  if (http) return http;
  return null;
}
