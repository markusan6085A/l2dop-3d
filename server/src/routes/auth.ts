import type { FastifyPluginAsync } from 'fastify';
import { Prisma } from '@prisma/client';
import { AuthError, login, register } from '../services/authService.js';

function isDatabaseUnavailable(e: unknown): boolean {
  if (e instanceof Prisma.PrismaClientInitializationError) return true;
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    return e.code === 'P1001' || e.code === 'P1017';
  }
  return false;
}

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', async (request, reply) => {
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
