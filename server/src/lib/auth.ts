import type { FastifyReply, FastifyRequest } from 'fastify';
import { verifyAccessToken } from './jwt.js';

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  const token = auth.slice('Bearer '.length).trim();
  if (!token) {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
  try {
    const { sub } = verifyAccessToken(token);
    request.userId = sub;
  } catch {
    await reply.code(401).send({ error: 'Unauthorized' });
    return;
  }
}
