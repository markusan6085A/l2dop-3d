import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  applyDevSelfBoostForUser,
  isDevSelfBoostEnabled,
} from '../services/devSelfBoostService.js';
import { GameConflictError } from '../services/charService.js';

function parseAdenaField(v: unknown): bigint | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) return undefined;
    return BigInt(Math.floor(Math.min(v, Number.MAX_SAFE_INTEGER)));
  }
  if (typeof v === 'string') {
    const s = v.trim().replace(/\s/g, '');
    if (s === '') return undefined;
    if (!/^\d+$/.test(s)) return undefined;
    try {
      const x = BigInt(s);
      return x < 0n ? 0n : x;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

/** POST /character/dev-self-boost — лише якщо L2DOP_DEV_SELF_BOOST=1 */
export function registerDevSelfBoostRoutes(app: FastifyInstance): void {
  app.post(
    '/dev-self-boost',
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!isDevSelfBoostEnabled()) {
        return reply.code(403).send({
          error: 'dev_boost_disabled',
          messageUk: 'Цю функцію вимкнено на сервері (L2DOP_DEV_SELF_BOOST).',
        });
      }

      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const raw = request.body;
      if (!raw || typeof raw !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }

      const b = raw as Record<string, unknown>;
      const er = b.expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен коректний expectedRevision.',
        });
      }

      let levelPatch: number | undefined;
      if (b.level !== undefined && b.level !== null && b.level !== '') {
        const lv = typeof b.level === 'number' ? b.level : parseInt(String(b.level), 10);
        if (!Number.isFinite(lv)) {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Некоректний рівень (1–80).',
          });
        }
        levelPatch = lv;
      }

      const adenaPatch = parseAdenaField(b.adena);

      let spPatch: number | undefined;
      if (b.sp !== undefined && b.sp !== null && b.sp !== '') {
        const sp =
          typeof b.sp === 'number' ? b.sp : parseInt(String(b.sp), 10);
        if (!Number.isFinite(sp)) {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Некоректні SP.',
          });
        }
        spPatch = sp;
      }

      if (
        levelPatch === undefined &&
        adenaPatch === undefined &&
        spPatch === undefined
      ) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери хоча б одне: рівень, адену або SP.',
        });
      }

      try {
        const character = await applyDevSelfBoostForUser(userId, er, {
          level: levelPatch,
          adena: adenaPatch,
          sp: spPatch,
        });
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (msg === 'dev_boost_empty') {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Немає полів для зміни.',
          });
        }
        request.log.error({ err }, 'POST /character/dev-self-boost');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося застосувати зміни.',
        });
      }
    }
  );
}
