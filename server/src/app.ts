import fs from 'node:fs';
import path from 'node:path';
import fastifyCompress from '@fastify/compress';
import fastifyStatic from '@fastify/static';
import Fastify from 'fastify';
import { authRoutes } from './routes/auth.js';
import { characterRoutes } from './routes/character.js';
import { clientConfigRoutes } from './routes/clientConfigRoutes.js';
import { gameRoutes } from './routes/game.js';
import { dropsShopRoutes } from './routes/dropsShopRoutes.js';
import { shopSellRoutes } from './routes/shopSellRoutes.js';
import { isDevSelfBoostEnabled } from './services/devSelfBoostService.js';

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

function isNoStoreApiPath(pathname: string): boolean {
  if (pathname.startsWith('/character')) return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname.startsWith('/game/item-icon/')) return false;
  if (pathname.startsWith('/game/skill-icon/')) return false;
  return pathname.startsWith('/game/');
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      redact: [
        'req.headers.authorization',
        'headers.authorization',
        'req.body.password',
        'req.body.password2',
        'body.password',
        'body.password2',
      ],
    },
    trustProxy: true,
  });

  await app.register(fastifyCompress, {
    global: true,
    encodings: ['br', 'gzip', 'deflate'],
  });

  app.addHook('onSend', async (request, reply, payload) => {
    const path = request.url.split('?')[0] || '';
    if (isNoStoreApiPath(path)) {
      reply.header('Cache-Control', 'no-store');
    }
    return payload;
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(characterRoutes, { prefix: '/character' });
  await app.register(clientConfigRoutes, { prefix: '/game' });
  await app.register(gameRoutes, { prefix: '/game' });
  await app.register(dropsShopRoutes, { prefix: '/game' });
  await app.register(shopSellRoutes, { prefix: '/game' });

  if (!isDevSelfBoostEnabled()) {
    app.get('/dev-boost.html', async (_request, reply) => {
      return reply.redirect('/menu.html');
    });
  }

  await app.register(fastifyStatic, {
    root: publicDir,
    prefix: '/',
    setHeaders(res, filePath) {
      const normalized = filePath.replace(/\\/g, '/');
      const rel = normalized.includes('/public/')
        ? normalized.slice(normalized.indexOf('/public/') + '/public'.length)
        : normalized;
      if (/\.html$/i.test(rel) || /\/sw\.js$/i.test(rel)) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        return;
      }
      if (
        /^\/(assets|icons|ref|characters|mobs|css|js|skills)\//.test(rel) ||
        /\.(jpg|jpeg|png|gif|webp|svg|woff2?|ico)$/i.test(rel)
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    },
  });

  return app;
}