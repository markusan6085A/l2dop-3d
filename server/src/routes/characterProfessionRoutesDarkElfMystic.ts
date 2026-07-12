import type { FastifyInstance } from 'fastify';
import {
  ensureUserId,
  parseExpectedRevisionLoose,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charService.js';
import {
  performFirstProfessionDarkElfDarkWizard,
  performFirstProfessionDarkElfShillienOracle,
  performSecondProfessionDarkElfPhantomSummoner,
  performSecondProfessionDarkElfShillienElder,
  performSecondProfessionDarkElfSpellhowler,
  performThirdProfessionDarkElfShillienSaint,
  performThirdProfessionDarkElfSpectralMaster,
  performThirdProfessionDarkElfStormScreamer,
} from '../services/charProfessionDarkElfMystic.js';

/** Гілка темного ельфа-мага: l2db Interlude, рівні 20 / 40 / 76 як у людини-мага. */
export function registerCharacterProfessionRoutesDarkElfMystic(
  app: FastifyInstance
): void {
  const routes: {
    path: string;
    run: (userId: string, er: number) => ReturnType<
      typeof performFirstProfessionDarkElfDarkWizard
    >;
    wrongBranchUk: string;
    levelUk: string;
  }[] = [
    {
      path: '/profession/dark-elf-dark-wizard',
      run: performFirstProfessionDarkElfDarkWizard,
      wrongBranchUk:
        'Доступно лише для темного ельфа-мага з профою «базовий маг» (dark_elf_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/dark-elf-shillien-oracle',
      run: performFirstProfessionDarkElfShillienOracle,
      wrongBranchUk:
        'Доступно лише для темного ельфа-мага з профою «базовий маг» (dark_elf_mage), без іншої першої профи.',
      levelUk: 'Потрібен щонайменше 20 рівень.',
    },
    {
      path: '/profession/dark-elf-phantom-summoner',
      run: performSecondProfessionDarkElfPhantomSummoner,
      wrongBranchUk:
        'Потрібен клас Темний чарівник (Dark Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/dark-elf-spellhowler',
      run: performSecondProfessionDarkElfSpellhowler,
      wrongBranchUk:
        'Потрібен клас Темний чарівник (Dark Wizard) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/dark-elf-shillien-elder',
      run: performSecondProfessionDarkElfShillienElder,
      wrongBranchUk:
        'Потрібен клас Оракул Шиллен (Shillien Oracle) після першої зміни профи.',
      levelUk: 'Потрібен щонайменше 40 рівень.',
    },
    {
      path: '/profession/dark-elf-spectral-master',
      run: performThirdProfessionDarkElfSpectralMaster,
      wrongBranchUk:
        'Потрібен клас Підступний заклинатель (Phantom Summoner) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/dark-elf-storm-screamer',
      run: performThirdProfessionDarkElfStormScreamer,
      wrongBranchUk:
        'Потрібен клас Заклинатель вітрів (Spellhowler) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
    {
      path: '/profession/dark-elf-shillien-saint',
      run: performThirdProfessionDarkElfShillienSaint,
      wrongBranchUk:
        'Потрібен клас Старійшина Шиллен (Shillien Elder) після другої зміни профи.',
      levelUk: 'Потрібен щонайменше 76 рівень.',
    },
  ];

  for (const { path, run, wrongBranchUk, levelUk } of routes) {
    app.post(path, { preHandler: requireAuth }, async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const er = parseExpectedRevisionLoose(request.body);
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
