import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performSecondProfessionHumanWarlord,
  performThirdProfessionHumanDreadnought,
  performSecondProfessionHumanGladiator,
  performThirdProfessionHumanDuelist,
} from '../services/charProfessionService.js';

/** Warrior: Warlord/Dreadnought, Gladiator/Duelist. */
export function registerCharacterProfessionRoutesWarriorBranches(app: FastifyInstance): void {
  /** Друга профа гілки алебарди: Warrior → Warlord (40+ р. у проді). */
  app.post(
    '/profession/human-warlord',
    { preHandler: requireAuth },
    async (request, reply) => {
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
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await performSecondProfessionHumanWarlord(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Воїн (Warrior) після 1-ї зміни профи.',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Ця зміна профи вже зроблена.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен щонайменше 40 рівень.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        request.log.error({ err }, 'POST /character/profession/human-warlord');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа гілки алебарди: Warlord → Dreadnought (76+ р. у проді). */
  app.post(
    '/profession/human-dreadnought',
    { preHandler: requireAuth },
    async (request, reply) => {
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
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await performThirdProfessionHumanDreadnought(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk:
              'Потрібен клас Воєначальник (Warlord) після 2-ї зміни профи на гілці алебарди.',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Ця зміна профи вже зроблена.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен щонайменше 76 рівень.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        request.log.error({ err }, 'POST /character/profession/human-dreadnought');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Друга профа гілки гладіатора: Warrior → Gladiator (без квесту). */
  app.post(
    '/profession/human-gladiator',
    { preHandler: requireAuth },
    async (request, reply) => {
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
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await performSecondProfessionHumanGladiator(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Воїн (Warrior) після 1-ї зміни профи.',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Ця зміна профи вже зроблена.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен щонайменше 40 рівень.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        request.log.error({ err }, 'POST /character/profession/human-gladiator');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа гілки гладіатора: Gladiator → Duelist (без квесту). */
  app.post(
    '/profession/human-duelist',
    { preHandler: requireAuth },
    async (request, reply) => {
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
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      try {
        const character = await performThirdProfessionHumanDuelist(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Гладіатор (Gladiator) після 2-ї зміни профи на цій гілці.',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Ця зміна профи вже зроблена.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен щонайменше 76 рівень.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        request.log.error({ err }, 'POST /character/profession/human-duelist');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );
}
