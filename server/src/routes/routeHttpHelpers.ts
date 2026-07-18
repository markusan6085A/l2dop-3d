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

export function parseExpectedRevisionLoose(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const er = (body as Record<string, unknown>).expectedRevision;
  if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) return null;
  return er;
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

/** Необов'язковий characterId з body/query (мульти-перс на акаунті). */
export function parseOptionalCharacterId(raw: unknown): string | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;
  const id = raw.trim();
  return id.length > 0 ? id : null;
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

/** Dev-only: X-L2-Debug-Delay-Ms для A/B stale-response тестів. */
export function parseSnapshotDebugDelayMs(
  request: FastifyRequest
): number | undefined {
  if (process.env.NODE_ENV === 'production') return undefined;
  if (process.env.L2_ALLOW_DEBUG_DELAY !== '1') return undefined;
  const raw = request.headers['x-l2-debug-delay-ms'];
  const ms = Number(Array.isArray(raw) ? raw[0] : raw);
  if (!Number.isFinite(ms) || ms <= 0 || ms > 5000) return undefined;
  return Math.floor(ms);
}
