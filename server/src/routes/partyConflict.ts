import type { FastifyReply } from 'fastify';
import type { PartyView } from '../services/party/partyTypes.js';

export function sendPartyVersionConflict(
  reply: FastifyReply,
  payload: { serverPartyVersion: number; party: PartyView | null }
) {
  return reply.code(409).send({
    code: 'party_version_conflict',
    error: 'party_version_conflict',
    messageUk: 'Стан паті застарів. Онови дані і повтори дію.',
    serverPartyVersion: payload.serverPartyVersion,
    party: payload.party,
  });
}
