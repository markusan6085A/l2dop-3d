import type { FastifyReply } from 'fastify';
import type { CharacterSnapshot } from '../services/charService.js';

interface RevisionConflictPayload {
  serverRevision?: number | null;
  character?: CharacterSnapshot | null;
}

export function sendRevisionConflict(
  reply: FastifyReply,
  payload: RevisionConflictPayload = {}
) {
  return reply.code(409).send({
    code: 'revision_conflict',
    error: 'revision_conflict',
    message: 'Revision conflict',
    messageUk: 'Стан персонажа застарів. Дані оновлено, повтори дію.',
    serverRevision:
      typeof payload.serverRevision === 'number' ? payload.serverRevision : null,
    character: payload.character ?? null,
  });
}
