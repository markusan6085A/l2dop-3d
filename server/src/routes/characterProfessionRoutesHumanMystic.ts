import type { FastifyInstance } from 'fastify';
import { sendGameConflict } from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performFirstProfessionHumanCleric,
  performFirstProfessionHumanWizard,
  performSecondProfessionHumanBishop,
  performSecondProfessionHumanNecromancer,
  performSecondProfessionHumanProphet,
  performSecondProfessionHumanSorcerer,
  performSecondProfessionHumanWarlock,
  performThirdProfessionHumanArcanaLord,
  performThirdProfessionHumanArchmage,
  performThirdProfessionHumanCardinal,
  performThirdProfessionHumanHierophant,
  performThirdProfessionHumanSoultaker,
} from '../services/charProfessionHumanMystic.js';

function parseExpectedRevision(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const er = (body as Record<string, unknown>).expectedRevision;
  if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) return null;
  return er;
}

/** Гілка людини-мага: l2db Interlude, рівні 20 / 40 / 76. */
export function registerCharacterProfessionRoutesHumanMystic(
  app: FastifyInstance
): void {
  const routes: {
    path: string;
    run: (userId: string, er: number) => ReturnType<
      typeof performFirstProfessionHumanWizard
    >;
    wrongBranchUk: string;
    levelUk: string;
  }[] = [
    {
      path: '/profession/human-wizard',
      run: performFirstProfessionHumanWizard,
      wrongBranchUk:
        'Доступно лише для людини-мага з профою «базовий маг» (human_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/human-cleric',
      run: performFirstProfessionHumanCleric,
      wrongBranchUk:
        'Доступно лише для людини-мага з профою «базовий маг» (human_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/human-sorcerer',
      run: performSecondProfessionHumanSorcerer,
      wrongBranchUk:
        'Потрібен клас Чарівник (Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/human-necromancer',
      run: performSecondProfessionHumanNecromancer,
      wrongBranchUk:
        'Потрібен клас Чарівник (Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/human-warlock',
      run: performSecondProfessionHumanWarlock,
      wrongBranchUk:
        'Потрібен клас Чарівник (Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/human-bishop',
      run: performSecondProfessionHumanBishop,
      wrongBranchUk:
        'Потрібен клас Клірик (Cleric) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/human-prophet',
      run: performSecondProfessionHumanProphet,
      wrongBranchUk:
        'Потрібен клас Клірик (Cleric) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/human-archmage',
      run: performThirdProfessionHumanArchmage,
      wrongBranchUk:
        'Потрібен клас Чаклун (Sorcerer) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/human-soultaker',
      run: performThirdProfessionHumanSoultaker,
      wrongBranchUk:
        'Потрібен клас Некромант (Necromancer) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/human-arcana-lord',
      run: performThirdProfessionHumanArcanaLord,
      wrongBranchUk:
        'Потрібен клас Чорнокнижник (Warlock) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/human-cardinal',
      run: performThirdProfessionHumanCardinal,
      wrongBranchUk:
        'Потрібен клас Єпископ (Bishop) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/human-hierophant',
      run: performThirdProfessionHumanHierophant,
      wrongBranchUk:
        'Потрібен клас Пророк (Prophet) після другої зміни профи.',
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
