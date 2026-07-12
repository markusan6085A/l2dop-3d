import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performFirstProfessionOrcShaman,
  performSecondProfessionOrcOverlord,
  performSecondProfessionOrcWarcryer,
  performThirdProfessionOrcDominator,
  performThirdProfessionOrcDoomcryer,
} from '../services/charProfessionOrcMystic.js';

function parseExpectedRevision(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const er = (body as Record<string, unknown>).expectedRevision;
  if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) return null;
  return er;
}

/** Гілка орка-шамана: l2db Interlude, рівні 20 / 40 / 76 як у магів. */
export function registerCharacterProfessionRoutesOrcMystic(
  app: FastifyInstance
): void {
  const routes: {
    path: string;
    run: (userId: string, er: number) => ReturnType<
      typeof performFirstProfessionOrcShaman
    >;
    wrongBranchUk: string;
    levelUk: string;
  }[] = [
    {
      path: '/profession/orc-shaman',
      run: performFirstProfessionOrcShaman,
      wrongBranchUk:
        'Доступно лише для орка-мага з профою «базовий маг» (orc_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/orc-overlord',
      run: performSecondProfessionOrcOverlord,
      wrongBranchUk:
        'Потрібен клас Шаман орків (Orc Shaman) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/orc-warcryer',
      run: performSecondProfessionOrcWarcryer,
      wrongBranchUk:
        'Потрібен клас Шаман орків (Orc Shaman) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/orc-dominator',
      run: performThirdProfessionOrcDominator,
      wrongBranchUk:
        'Потрібен клас Вождь (Overlord) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/orc-doomcryer',
      run: performThirdProfessionOrcDoomcryer,
      wrongBranchUk:
        'Потрібен клас Warcryer після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
  ];

  for (const { path, run, wrongBranchUk, levelUk } of routes) {
    app.post(path, { preHandler: requireAuth }, async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const er = parseExpectedRevision(request.body);
      if (er == null) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await run(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: wrongBranchUk,
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Ця зміна профи вже зроблена або недоступна.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: levelUk,
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        request.log.error({ err }, `POST ${path}`);
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    });
  }
}
