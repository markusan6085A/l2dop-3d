import type { FastifyInstance } from 'fastify';
import {
  ensureUserId,
  parseExpectedRevisionLoose,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  GameConflictError,
  type CharacterSnapshot,
} from '../services/charService.js';
import * as ElfF from '../services/charProfessionElfFighter.js';
import * as DeF from '../services/charProfessionDarkElfFighter.js';
import * as OrcF from '../services/charProfessionOrcFighter.js';
import * as DwF from '../services/charProfessionDwarfFighter.js';

/** Не-людські воїни: ельф / темний ельф / орк / гном (Interlude, 3 профи). */
export function registerCharacterProfessionRoutesNonHumanFighters(
  app: FastifyInstance
): void {
  const routes: {
    path: string;
    run: (userId: string, er: number) => Promise<CharacterSnapshot>;
  }[] = [
    { path: '/profession/elf-elven-knight', run: ElfF.performFirstProfessionElfElvenKnight },
    { path: '/profession/elf-elven-scout', run: ElfF.performFirstProfessionElfElvenScout },
    { path: '/profession/elf-temple-knight', run: ElfF.performSecondProfessionElfTempleKnight },
    { path: '/profession/elf-swordsinger', run: ElfF.performSecondProfessionElfSwordsinger },
    { path: '/profession/elf-plainswalker', run: ElfF.performSecondProfessionElfPlainswalker },
    { path: '/profession/elf-silver-ranger', run: ElfF.performSecondProfessionElfSilverRanger },
    { path: '/profession/elf-evas-templar', run: ElfF.performThirdProfessionElfEvasTemplar },
    { path: '/profession/elf-sword-muse', run: ElfF.performThirdProfessionElfSwordMuse },
    { path: '/profession/elf-wind-rider', run: ElfF.performThirdProfessionElfWindRider },
    { path: '/profession/elf-moonlight-sentinel', run: ElfF.performThirdProfessionElfMoonlightSentinel },
    {
      path: '/profession/dark-elf-palus-knight',
      run: DeF.performFirstProfessionDarkElfPalusKnight,
    },
    { path: '/profession/dark-elf-assassin', run: DeF.performFirstProfessionDarkElfAssassin },
    {
      path: '/profession/dark-elf-shillien-knight',
      run: DeF.performSecondProfessionDarkElfShillienKnight,
    },
    {
      path: '/profession/dark-elf-bladedancer',
      run: DeF.performSecondProfessionDarkElfBladedancer,
    },
    {
      path: '/profession/dark-elf-abyss-walker',
      run: DeF.performSecondProfessionDarkElfAbyssWalker,
    },
    {
      path: '/profession/dark-elf-phantom-ranger',
      run: DeF.performSecondProfessionDarkElfPhantomRanger,
    },
    {
      path: '/profession/dark-elf-shillien-templar',
      run: DeF.performThirdProfessionDarkElfShillienTemplar,
    },
    {
      path: '/profession/dark-elf-spectral-dancer',
      run: DeF.performThirdProfessionDarkElfSpectralDancer,
    },
    {
      path: '/profession/dark-elf-ghost-hunter',
      run: DeF.performThirdProfessionDarkElfGhostHunter,
    },
    {
      path: '/profession/dark-elf-ghost-sentinel',
      run: DeF.performThirdProfessionDarkElfGhostSentinel,
    },
    { path: '/profession/orc-raider', run: OrcF.performFirstProfessionOrcRaider },
    { path: '/profession/orc-monk', run: OrcF.performFirstProfessionOrcMonk },
    { path: '/profession/orc-destroyer', run: OrcF.performSecondProfessionOrcDestroyer },
    { path: '/profession/orc-tyrant', run: OrcF.performSecondProfessionOrcTyrant },
    { path: '/profession/orc-titan', run: OrcF.performThirdProfessionOrcTitan },
    {
      path: '/profession/orc-grand-khavatari',
      run: OrcF.performThirdProfessionOrcGrandKhavatari,
    },
    { path: '/profession/dwarf-scavenger', run: DwF.performFirstProfessionDwarfScavenger },
    { path: '/profession/dwarf-artisan', run: DwF.performFirstProfessionDwarfArtisan },
    {
      path: '/profession/dwarf-bounty-hunter',
      run: DwF.performSecondProfessionDwarfBountyHunter,
    },
    { path: '/profession/dwarf-warsmith', run: DwF.performSecondProfessionDwarfWarsmith },
    {
      path: '/profession/dwarf-fortune-seeker',
      run: DwF.performThirdProfessionDwarfFortuneSeeker,
    },
    { path: '/profession/dwarf-maestro', run: DwF.performThirdProfessionDwarfMaestro },
  ];

  for (const { path, run } of routes) {
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
            messageUk:
              'Невірна раса, гілка або поточна професія для цієї зміни.',
          });
        }
        if (msg === 'profession_already_advanced') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Профа вже змінена або недоступна.',
          });
        }
        if (msg === 'profession_requires_level') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Потрібен відповідний рівень (20 / 40 / 76).',
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
