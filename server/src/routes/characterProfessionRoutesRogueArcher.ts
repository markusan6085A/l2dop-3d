import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performSecondProfessionHumanTreasureHunter,
  performSecondProfessionHumanHawkeye,
  performThirdProfessionHumanAdventurer,
  performThirdProfessionHumanSagittarius,
} from '../services/charProfessionService.js';

/** Rogue / Archer (2–3 профи). */
export function registerCharacterProfessionRoutesRogueArcher(app: FastifyInstance): void {
  /** Друга профа гілки розбійника: Rogue → Treasure Hunter (40+ р.). */
  app.post(
    '/profession/human-treasure-hunter',
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
        const character = await performSecondProfessionHumanTreasureHunter(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Розбійник (Rogue).',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Профа вже змінена.',
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
        request.log.error(
          { err },
          'POST /character/profession/human-treasure-hunter'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Друга профа лучника: Rogue → Hawkeye (40+ р.). */
  app.post(
    '/profession/human-hawkeye',
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
        const character = await performSecondProfessionHumanHawkeye(userId, er);
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
              'Потрібен Розбійник (Rogue) без другої профи (не Treasure Hunter / Adventurer).',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Профа вже змінена.',
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
        request.log.error(
          { err },
          'POST /character/profession/human-hawkeye'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа гілки розбійника: Treasure Hunter → Adventurer (76+ р.). */
  app.post(
    '/profession/human-adventurer',
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
        const character = await performThirdProfessionHumanAdventurer(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Мисливець за скарбами (Treasure Hunter).',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Профа вже змінена.',
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
        request.log.error(
          { err },
          'POST /character/profession/human-adventurer'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа гілки лучника: Hawkeye → Sagittarius (76+ р.). */
  app.post(
    '/profession/human-sagittarius',
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
        const character = await performThirdProfessionHumanSagittarius(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return sendGameConflict(reply, err);
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Яструб (Hawkeye).',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Профа вже змінена.',
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
        request.log.error(
          { err },
          'POST /character/profession/human-sagittarius'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );
}
