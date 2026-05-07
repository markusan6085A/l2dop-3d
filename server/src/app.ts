import fs from 'node:fs';
import path from 'node:path';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { characterRoutes } from './routes/character.js';
import { gameRoutes } from './routes/game.js';
import { dropsShopRoutes } from './routes/dropsShopRoutes.js';

/** `server/public` з кореня репо або `public`, якщо cwd = `server/`. */
function resolvePublicDir(): string {
  const cwd = process.cwd();
  const fromRoot = path.join(cwd, 'server', 'public');
  const fromServer = path.join(cwd, 'public');
  if (fs.existsSync(path.join(fromRoot, 'map.html'))) return fromRoot;
  if (fs.existsSync(path.join(fromServer, 'map.html'))) return fromServer;
  return fromRoot;
}

const publicDir = resolvePublicDir();

export async function buildApp() {
  const app = Fastify({ logger: true });

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(characterRoutes, { prefix: '/character' });
  await app.register(gameRoutes, { prefix: '/game' });
  await app.register(dropsShopRoutes, { prefix: '/game' });

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
  });

  return app;
}