/**
 * Smoke: pino redact приховує Authorization/Cookie/token у логах.
 * Запуск: npm run test:logger-redact
 */
import { Writable } from 'node:stream';
import pino from 'pino';

const SECRET_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.leaked-access-token.payload';
const SECRET_COOKIE = 'refresh=super-secret-refresh-value';
const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.Authorization',
  'headers.authorization',
  'headers.Authorization',
  'req.headers.cookie',
  'req.headers.Cookie',
  'headers.cookie',
  'headers.Cookie',
  'req.query.token',
  'req.query.accessToken',
  'req.query.refreshToken',
];

const chunks: string[] = [];
const sink = new Writable({
  write(chunk, _enc, cb) {
    chunks.push(String(chunk));
    cb();
  },
});

const logger = pino({ redact: REDACT_PATHS }, sink);

logger.info({
  req: {
    headers: {
      authorization: 'Bearer ' + SECRET_TOKEN,
      Authorization: 'Bearer ' + SECRET_TOKEN,
      cookie: SECRET_COOKIE,
      Cookie: SECRET_COOKIE,
    },
    query: {
      token: SECRET_TOKEN,
      accessToken: SECRET_TOKEN,
      refreshToken: 'refresh-leak',
    },
  },
});

const out = chunks.join('');
if (out.includes(SECRET_TOKEN)) {
  console.error('[test:logger-redact] FAIL: access token у виводі логу');
  process.exit(1);
}
if (out.includes(SECRET_COOKIE)) {
  console.error('[test:logger-redact] FAIL: cookie у виводі логу');
  process.exit(1);
}
if (out.includes('refresh-leak')) {
  console.error('[test:logger-redact] FAIL: refreshToken у query логу');
  process.exit(1);
}

/** Node HTTP нормалізує вхідні заголовки в нижній регістр; redact покриває обидва шляхи. */
const lowerOnly = pino({ redact: ['req.headers.authorization'] }, sink);
chunks.length = 0;
lowerOnly.info({
  req: { headers: { authorization: 'Bearer ' + SECRET_TOKEN } },
});
if (chunks.join('').includes(SECRET_TOKEN)) {
  console.error('[test:logger-redact] FAIL: lowercase authorization не redact');
  process.exit(1);
}

console.log('[test:logger-redact] OK: Authorization, Cookie і query-токени приховані');
