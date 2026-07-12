import type { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { GameConflictError } from '../services/charErrors.js';
import { sendRevisionConflict } from './revisionConflict.js';

export function ensureUserId(
  request: { userId?: string },
  reply: FastifyReply
): string | null {
  const userId = request.userId;
  if (!userId) {
    reply.code(401).send({ error: 'Unauthorized' });
    return null;
  }
  return userId;
}

export function ensureBodyRecord(
  body: unknown,
  reply: FastifyReply,
  messageUk = 'Некоректні дані.'
): Record<string, unknown> | null {
  if (!body || typeof body !== 'object') {
    reply.code(400).send({ error: 'invalid_input', messageUk });
    return null;
  }
  return body as Record<string, unknown>;
}

export function parseExpectedRevision(
  body: Record<string, unknown>,
  reply: FastifyReply,
  messageUk = 'Некоректний expectedRevision.'
): number | null {
  const er = body.expectedRevision;
  if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
    reply.code(400).send({ error: 'invalid_input', messageUk });
    return null;
  }
  return er;
}

export async function logRouteMutation(
  request: FastifyRequest,
  action: string,
  expectedRevision: number,
  result: 'ok' | 'conflict' | 'error',
  actualRevision?: number,
  characterId?: string | null,
  logTag = 'character-mutation'
): Promise<void> {
  if (!request.userId) return;
  let characterIdLog = characterId ?? null;
  let actualRevisionLog = actualRevision ?? null;
  if (!characterIdLog || actualRevisionLog == null) {
    const row = await prisma.character.findFirst({
      where: { userId: request.userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, revision: true },
    });
    characterIdLog = row?.id ?? null;
    if (actualRevisionLog == null) {
      actualRevisionLog = row?.revision ?? null;
    }
  }
  request.log.info(
    {
      action,
      characterId: characterIdLog,
      expectedRevision,
      actualRevision: actualRevisionLog,
      result,
    },
    logTag
  );
}

export function sendGameConflict(reply: FastifyReply, err: GameConflictError) {
  return sendRevisionConflict(reply, {
    serverRevision: err.serverRevision,
    character: err.character,
  });
}
