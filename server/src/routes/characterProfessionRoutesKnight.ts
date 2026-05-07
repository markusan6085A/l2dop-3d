import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performSecondProfessionHumanPaladin,
  performThirdProfessionHumanPhoenixKnight,
  performSecondProfessionHumanDarkAvenger,
  performThirdProfessionHumanHellKnight,
} from '../services/charProfessionService.js';

/** Knight: Paladin/Phoenix, Dark Avenger/Hell. */
export function registerCharacterProfessionRoutesKnight(app: FastifyInstance): void {
  /** Друга профа гілки лицаря: Human Knight → Paladin (40+ р.). */
  app.post(
    '/profession/human-paladin',
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
        const character = await performSecondProfessionHumanPaladin(userId, er);
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Лицар (Human Knight).',
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
        request.log.error({ err }, 'POST /character/profession/human-paladin');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа гілки лицаря: Paladin → Phoenix Knight (76+ р.). */
  app.post(
    '/profession/human-phoenix-knight',
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
        const character = await performThirdProfessionHumanPhoenixKnight(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Паладин (Paladin).',
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
          'POST /character/profession/human-phoenix-knight'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Друга профа темної гілки лицаря: Human Knight → Dark Avenger (40+ р.). */
  app.post(
    '/profession/human-dark-avenger',
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
        const character = await performSecondProfessionHumanDarkAvenger(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Лицар (Human Knight).',
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
          'POST /character/profession/human-dark-avenger'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );

  /** Третя профа темної гілки лицаря: Dark Avenger → Hell Knight (76+ р.). */
  app.post(
    '/profession/human-hell-knight',
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
        const character = await performThirdProfessionHumanHellKnight(
          userId,
          er
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'profession_wrong_branch') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен клас Темний месник (Dark Avenger).',
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
          'POST /character/profession/human-hell-knight'
        );
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити профу.',
        });
      }
    }
  );
}
