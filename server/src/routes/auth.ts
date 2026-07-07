import type { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { Prisma } from '@prisma/client';
import { checkRateLimit } from '../lib/authRateLimit.js';
import { AuthError, login, register } from '../services/authService.js';

function clientIp(request: FastifyRequest): string {
  return request.ip || 'unknown';
}

function rateLimited(
  request: FastifyRequest,
  scope: 'register' | 'login'
): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  const key = `auth:${scope}:${clientIp(request)}`;
  const max = scope === 'register' ? 5 : 15;
  const windowMs = scope === 'register' ? 60 * 60 * 1000 : 15 * 60 * 1000;
  return !checkRateLimit(key, max, windowMs);
}

function isDatabaseUnavailable(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return e.code === 'P1001' || e.code === 'P1017';
  }
  return false;
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
    if (rateLimited(request, 'register')) {
      return reply.code(429).send({
        error: 'too_many_requests',
        messageUk: 'Забагато спроб реєстрації. Спробуй пізніше.',
      });
    }
    const body = request.body;
    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'invalid_input' });
    }
    const b = body as Record<string, unknown>;
    try {
      const result = await register({
        login: b.login,
        password: b.password,
        password2: b.password2,
        characterName: b.characterName,
        race: b.race,
        classBranch: b.classBranch,
        gender: b.gender,
      });
      return reply.code(201).send(result);
    } catch (e) {
      if (e instanceof AuthError) {
        return reply.code(e.statusCode).send({ error: e.message });
      }
      if (isDatabaseUnavailable(e)) {
        return reply.code(503).send({ error: 'database_unavailable' });
      }
      throw e;
    }
  });

  app.post('/login', async (request, reply) => {
    if (rateLimited(request, 'login')) {
      return reply.code(429).send({
        error: 'too_many_requests',
        messageUk: 'Забагато спроб входу. Спробуй пізніше.',
      });
    }
    const body = request.body;
    if (!body || typeof body !== 'object') {
      return reply.code(400).send({ error: 'invalid_input' });
    }
    const b = body as Record<string, unknown>;
    try {
      const result = await login({
        login: b.login,
        password: b.password,
      });
      return reply.send(result);
    } catch (e) {
      if (e instanceof AuthError) {
        return reply.code(e.statusCode).send({ error: e.message });
      }
      if (isDatabaseUnavailable(e)) {
        return reply.code(503).send({ error: 'database_unavailable' });
      }
      throw e;
    }
  });
};
