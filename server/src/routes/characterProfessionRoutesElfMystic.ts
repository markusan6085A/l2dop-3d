import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performFirstProfessionElfElvenOracle,
  performFirstProfessionElfElvenWizard,
  performSecondProfessionElfElementalSummoner,
  performSecondProfessionElfElvenElder,
  performSecondProfessionElfSpellsinger,
  performThirdProfessionElfElementalMaster,
  performThirdProfessionElfEvasSaint,
  performThirdProfessionElfMysticMuse,
} from '../services/charProfessionElfMystic.js';

function parseExpectedRevision(body: unknown): number | null {
  if (!body || typeof body !== 'object') return null;
  const er = (body as Record<string, unknown>).expectedRevision;
  if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) return null;
  return er;
}

/** Гілка ельфа-мага: l2db Interlude, рівні 20 / 40 / 76 як у людини-мага. */
export function registerCharacterProfessionRoutesElfMystic(app: FastifyInstance): void {
  const routes: {
    path: string;
    run: (userId: string, er: number) => ReturnType<
      typeof performFirstProfessionElfElvenWizard
    >;
    wrongBranchUk: string;
    levelUk: string;
  }[] = [
    {
      path: '/profession/elf-elven-wizard',
      run: performFirstProfessionElfElvenWizard,
      wrongBranchUk:
        'Доступно лише для ельфа-мага з профою «базовий маг» (elf_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/elf-elven-oracle',
      run: performFirstProfessionElfElvenOracle,
      wrongBranchUk:
        'Доступно лише для ельфа-мага з профою «базовий маг» (elf_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/elf-elemental-summoner',
      run: performSecondProfessionElfElementalSummoner,
      wrongBranchUk:
        'Потрібен клас Ельфійський чарівник (Elven Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/elf-spellsinger',
      run: performSecondProfessionElfSpellsinger,
      wrongBranchUk:
        'Потрібен клас Ельфійський чарівник (Elven Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/elf-elven-elder',
      run: performSecondProfessionElfElvenElder,
      wrongBranchUk:
        'Потрібен клас Ельфійський оракул (Elven Oracle) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/elf-elemental-master',
      run: performThirdProfessionElfElementalMaster,
      wrongBranchUk:
        'Потрібен клас Покликувач стихій (Elemental Summoner) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/elf-mystic-muse',
      run: performThirdProfessionElfMysticMuse,
      wrongBranchUk:
        'Потрібен клас Співак чарів (Spellsinger) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/elf-evas-saint',
      run: performThirdProfessionElfEvasSaint,
      wrongBranchUk:
        'Потрібен клас Ельфійський старійшина (Elven Elder) після другої зміни профи.',
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
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
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
