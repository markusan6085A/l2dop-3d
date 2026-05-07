import { createReadStream } from 'node:fs';
import type { FastifyPluginAsync } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { MAP_TOWNS } from '../data/mapLocalities.js';
import {
  GameConflictError,
  performHunt,
  performMapMove,
  performReturnToNearestTown,
  performTeleport,
} from '../services/charService.js';
import {
  getResourceCraftBook,
  performResourceCraft,
} from '../services/resourceCraftService.js';
import { getMapAroundForUser } from '../services/mapAroundService.js';
import { getMapWorldSpawnsNearPlayer } from '../services/mapSpawnsService.js';
import { getSpawnCatalogInfo } from '../services/spawnCatalogService.js';
import { prisma } from '../lib/prisma.js';
import type { CharacterRow } from '../services/charService.js';
import {
  getBattleState,
  leaveBattle,
  performBattleAction,
  startBattle,
} from '../services/battleService.js';
import type { BattleActionId } from '../domain/battle.js';
import { CANONICAL_L2_SKILL_TO_BATTLE_ACTION } from '../data/humanFighterSkillCatalog.js';
import {
  ELVEN_MYSTIC_ACTIVE_L2_ID_SET,
  ELVEN_MYSTIC_ALL_L2_IDS,
} from '../data/elvenMysticSkillCatalog.js';
import {
  DARK_MYSTIC_ACTIVE_L2_ID_SET,
  DARK_MYSTIC_ALL_L2_IDS,
} from '../data/darkMysticSkillCatalog.js';
import {
  ORC_MYSTIC_ACTIVE_L2_ID_SET,
  ORC_MYSTIC_ALL_L2_IDS,
} from '../data/orcMysticSkillCatalog.js';
import {
  HUMAN_MYSTIC_ACTIVE_L2_ID_SET,
  HUMAN_MYSTIC_ALL_L2_IDS,
} from '../data/humanMysticSkillCatalog.js';
import { ORC_FIGHTER_ACTIVE_L2_IDS } from '../data/orcFighterSkillCatalog.generated.js';
import { ELVEN_FIGHTER_ACTIVE_L2_IDS } from '../data/elvenFighterSkillCatalog.generated.js';
import { DARK_FIGHTER_ACTIVE_L2_IDS } from '../data/darkFighterSkillCatalog.generated.js';
import { DWARF_FIGHTER_ACTIVE_L2_IDS } from '../data/dwarfFighterSkillCatalog.generated.js';
import { resolveL2dopItemIconJpgPath } from '../services/l2dopItemIconPath.js';
import { resolveL2dopSkillIconJpgPath } from '../services/l2dopSkillIconPath.js';
import { renderL2dopSkillIconCrispPng } from '../services/l2dopSkillIconCrispRender.js';
import {
  mimeTypeForPublicSkillIcon,
  resolvePublicSkillIconPath,
} from '../services/publicSkillIconPath.js';

/** Активні бойові `l2_*` расових воїнів (Orc/Elf/Dark Elf/Dwarf) — дозвіл POST /battle/action. */
const RACE_FIGHTER_ACTIVE_L2_ID_SET = new Set<number>([
  ...ORC_FIGHTER_ACTIVE_L2_IDS,
  ...ELVEN_FIGHTER_ACTIVE_L2_IDS,
  ...DARK_FIGHTER_ACTIVE_L2_IDS,
  ...DWARF_FIGHTER_ACTIVE_L2_IDS,
]);

function raceFighterL2ActionAllowed(actionNorm: string): boolean {
  const mysticId = /^l2_(\d+)$/.exec(actionNorm);
  if (!mysticId) return false;
  return RACE_FIGHTER_ACTIVE_L2_ID_SET.has(Number(mysticId[1]));
}

/** Клієнт / хотбар інколи шлють `l2_256` замість `accuracy_stance` — узгоджуємо з каталогом. */
function normalizeClientBattleAction(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const t = raw.trim();
  if (!t) return null;
  const mysticId = /^l2_(\d+)$/.exec(t);
  if (mysticId) {
    const id = Number(mysticId[1]);
    if (
      HUMAN_MYSTIC_ALL_L2_IDS.has(id) ||
      ELVEN_MYSTIC_ALL_L2_IDS.has(id) ||
      DARK_MYSTIC_ALL_L2_IDS.has(id) ||
      ORC_MYSTIC_ALL_L2_IDS.has(id) ||
      RACE_FIGHTER_ACTIVE_L2_ID_SET.has(id)
    ) {
      return t;
    }
  }
  const mapped =
    CANONICAL_L2_SKILL_TO_BATTLE_ACTION[
      t as keyof typeof CANONICAL_L2_SKILL_TO_BATTLE_ACTION
    ];
  return mapped ?? t;
}

export const gameRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Реальні іконки `l2dop/img/items/{id}.jpg` (як у PHP). Без авторизації — для `<img src>`.
   * Якщо файлу немає — редірект на локальну SVG-заглушку.
   */
  app.get('/item-icon/:itemId', async (request, reply) => {
    const raw = (request.params as { itemId: string }).itemId;
    const itemId = parseInt(raw, 10);
    if (!Number.isFinite(itemId) || itemId < 1) {
      return reply.code(404).send();
    }
    const filePath = resolveL2dopItemIconJpgPath(itemId);
    if (!filePath) {
      return reply.redirect('/icons/drops/other.svg', 302);
    }
    reply.header('Cache-Control', 'public, max-age=86400');
    return reply.type('image/jpeg').send(createReadStream(filePath));
  });

  /**
   * Іконки скіла: 1) `server/public/skills/skill{n}.*` (gif/jpg/png) — твій імпорт з text-rpg;
   * 2) інакше l2dop `skill{n}.jpg`. З `?dpr=` — PNG nearest-neighbour (×2 UI × dpr).
   */
  app.get('/skill-icon/:skillId', async (request, reply) => {
    const raw = (request.params as { skillId: string }).skillId;
    const skillId = parseInt(raw, 10);
    if (!Number.isFinite(skillId) || skillId < 1) {
      return reply.code(404).send();
    }
    const fromPublic = resolvePublicSkillIconPath(skillId);
    const filePath = fromPublic ?? resolveL2dopSkillIconJpgPath(skillId);
    if (!filePath) {
      return reply.redirect('/icons/drops/other.svg', 302);
    }
    const q = request.query as { dpr?: string };
    const dprParsed = Number.parseFloat(String(q?.dpr ?? ''));
    const hasDpr = Number.isFinite(dprParsed) && dprParsed > 0;
    reply.header('Cache-Control', 'public, max-age=86400');
    if (hasDpr) {
      try {
        const png = await renderL2dopSkillIconCrispPng(filePath, dprParsed);
        return reply.type('image/png').send(png);
      } catch (err) {
        request.log.warn({ err }, 'skill-icon crisp PNG failed, fallback stream');
      }
    }
    const mime = fromPublic
      ? mimeTypeForPublicSkillIcon(filePath)
      : 'image/jpeg';
    return reply.type(mime).send(createReadStream(filePath));
  });

  app.get(
    '/map/spawns',
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const row = (await prisma.character.findFirst({
        where: { userId: request.userId },
      })) as CharacterRow | null;
      if (!row) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send({
        spawns: getMapWorldSpawnsNearPlayer(row.worldX, row.worldY),
      });
    }
  );

  app.get(
    '/map/around',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const data = await getMapAroundForUser(userId);
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.get(
    '/spawn/:spawnId/info',
    { preHandler: requireAuth },
    async (request, reply) => {
      if (!request.userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const { spawnId } = request.params as { spawnId: string };
      const info = getSpawnCatalogInfo(spawnId);
      if (!info) {
        return reply.code(404).send({ error: 'not_found' });
      }
      return reply.send(info);
    }
  );

  app.get(
    '/teleport/locations',
    { preHandler: requireAuth },
    async (_request, reply) => {
      return reply.send({
        locations: MAP_TOWNS.map((t) => ({
          teleportId: t.teleportId,
          labelUk: t.labelUk,
          labelEn: t.labelEn,
        })),
      });
    }
  );

  app.post(
    '/teleport',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const teleportId = b.teleportId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof teleportId !== 'string' || !teleportId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Обери пункт призначення.',
        });
      }
      try {
        const character = await performTeleport(
          userId,
          teleportId.trim(),
          er
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'teleport_unknown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий пункт телепорту.',
          });
        }
        throw e;
      }
    }
  );

  app.post(
    '/move',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const tx = b.targetX;
      const ty = b.targetY;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof tx !== 'number' || typeof ty !== 'number') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібні targetX і targetY (числа).',
        });
      }
      try {
        const character = await performMapMove(userId, tx, ty, er);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'map_target_too_far') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Ціль занадто далеко.',
          });
        }
        if (e instanceof Error && e.message === 'map_target_too_close') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Обери точку далі від поточної позиції.',
          });
        }
        if (e instanceof Error && e.message === 'map_move_invalid') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Некоректні координати.',
          });
        }
        throw e;
      }
    }
  );

  app.post(
    '/hunt',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }

      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      const er = (body as Record<string, unknown>).expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({ error: 'invalid_input' });
      }

      try {
        const character = await performHunt(userId, er);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        throw e;
      }
    }
  );

  app.get(
    '/battle',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const data = await getBattleState(userId);
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.post(
    '/battle/start',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const spawnId = b.spawnId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof spawnId !== 'string' || !spawnId.length) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен spawnId моба.',
        });
      }
      try {
        const result = await startBattle(userId, spawnId, er);
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_spawn_unknown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий моб на карті.',
          });
        }
        if (e instanceof Error && e.message === 'battle_too_far') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Підійди ближче до моба на карті.',
          });
        }
        throw e;
      }
    }
  );

  app.post(
    '/battle/action',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const actionNorm = normalizeClientBattleAction(b.action);
      const allowed: BattleActionId[] = [
        'attack',
        'power',
        'bolt',
        'stun',
        'power_strike',
        'power_shot',
        'mortal_blow',
        'war_cry',
        'dash',
        'rapid_shot',
        'snipe',
        'stun_shot',
        'lethal_shot',
        'hamstring_shot',
        'double_shot',
        'burst_shot',
        'stun_attack',
        'wild_sweep',
        'power_smash',
        'whirlwind',
        'thunder_storm',
        'provoke',
        'accuracy_stance',
        'vicious_stance',
        'parry_stance',
        'detect_insect_weakness',
        'detect_monster_weakness',
        'detect_animal_weakness',
        'detect_dragon_weakness',
        'detect_plant_weakness',
        'howl',
        'battle_roar',
        'thrill_fight',
        'revival',
        'lionheart',
        'zealot',
        'focus_attack',
        'wrath',
        'earthquake',
        'eye_hunter',
        'eye_slayer',
        'shock_blast',
        'backstab',
        'deadly_blow_dagger',
        'switch_target',
        'unlock',
        'lure',
        'fake_death',
        'ultimate_evasion',
        'silent_move',
        'lethal_blow_adv',
        'focus_chance',
        'focus_power',
        'bluff',
        'aggression',
        'remedy',
        'holy_strike',
        'sanctuary',
        'aegis_stance',
        'horror',
        'reflect_damage',
        'corpse_plague',
        'hamstring_slash',
        'summon_dark_panther',
        'shield_fortress',
        'touch_of_life',
        'touch_of_death',
        'physical_mirror',
        'vengeance',
        'triple_slash',
        'sonic_focus',
        'sonic_blaster',
        'double_sonic_slash',
        'sonic_buster',
        'sonic_storm',
        'triple_sonic_slash',
        'fatal_strike',
        'hammer_crush',
        'sonic_move',
        'sonic_guard',
      ];
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      const mysticCastOk =
        typeof actionNorm === 'string' &&
        /^l2_\d+$/.test(actionNorm) &&
        (HUMAN_MYSTIC_ACTIVE_L2_ID_SET.has(Number(actionNorm.slice(3))) ||
          ELVEN_MYSTIC_ACTIVE_L2_ID_SET.has(Number(actionNorm.slice(3))) ||
          DARK_MYSTIC_ACTIVE_L2_ID_SET.has(Number(actionNorm.slice(3))) ||
          ORC_MYSTIC_ACTIVE_L2_ID_SET.has(Number(actionNorm.slice(3))));
      if (
        !actionNorm ||
        (!allowed.includes(actionNorm as BattleActionId) &&
          !mysticCastOk &&
          !raceFighterL2ActionAllowed(actionNorm))
      ) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Невідома дія.',
        });
      }
      try {
        const result = await performBattleAction(
          userId,
          actionNorm as BattleActionId,
          er
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_none') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Немає активного бою.',
          });
        }
        if (e instanceof Error && e.message === 'battle_spawn_gone') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Дані моба застарілі — онови карту.',
          });
        }
        if (e instanceof Error && e.message === 'battle_skill_not_allowed') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Цей скіл зараз недоступний для твого персонажа.',
          });
        }
        if (e instanceof Error && e.message === 'battle_zealot_need_low_hp') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Zealot можна ввімкнути лише коли HP не вище ~30% від поточного максимуму в бою. Спочатку втрать здоров’я або дочекайся, поки моб тебе поб’є.',
          });
        }
        if (e instanceof Error && e.message === 'battle_frenzy_need_low_hp') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Frenzy (176) діє лише коли HP у бою не вище ~30% від максимуму. Спочатку втрать здоров’я, потім активуй скіл.',
          });
        }
        if (e instanceof Error && e.message === 'battle_zealot_wrong_class') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Zealot (420) — скіл гілки орка Destroyer / Titan / Tyrant / Grand Khavatari. Для інших рас і проф він недоступний.',
          });
        }
        if (e instanceof Error && e.message === 'battle_zealot_cooldown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Zealot ще на перезарядці — зачекай, поки минуть секунди КД.',
          });
        }
        if (e instanceof Error && e.message === 'battle_low_mp') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Недостатньо MP для скіла.',
          });
        }
        if (e instanceof Error && e.message === 'battle_skill_not_enough_charges') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Недостатньо Sonic Focus зарядів для цього скіла. Використай Sonic Focus (8), щоб накопичити заряди.',
          });
        }
        if (e instanceof Error && e.message === 'battle_sonic_max_charges') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Досягнуто максимум Sonic Focus зарядів. Витрать їх sonic-скілом.',
          });
        }
        throw e;
      }
    }
  );

  app.post(
    '/battle/leave',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      const er = (body as Record<string, unknown>).expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      try {
        const character = await leaveBattle(userId, er);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        throw e;
      }
    }
  );

  app.post(
    '/battle/return-to-town',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      const er = (body as Record<string, unknown>).expectedRevision;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({ error: 'invalid_input' });
      }
      try {
        const character = await performReturnToNearestTown(userId, er);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_still_active') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Спочатку заверши бій.',
          });
        }
        throw e;
      }
    }
  );

  app.get(
    '/resource-craft/book',
    { preHandler: requireAuth },
    async (_request, reply) => reply.send(getResourceCraftBook())
  );

  app.post(
    '/resource-craft',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body;
      if (!body || typeof body !== 'object') {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректні дані.',
        });
      }
      const b = body as Record<string, unknown>;
      const er = b.expectedRevision;
      const tier = Math.floor(Number(b.tier));
      const recipeIndex = Math.floor(Number(b.recipeIndex));
      const quantity = Math.floor(Number(b.quantity ?? 1));
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (!Number.isFinite(tier) || tier < 1 || tier > 4) {
        return reply.code(400).send({
          error: 'invalid_recipe',
          messageUk: 'Некоректний рівень крафту.',
        });
      }
      if (!Number.isFinite(recipeIndex) || recipeIndex < 0) {
        return reply.code(400).send({
          error: 'invalid_recipe',
          messageUk: 'Некоректний рецепт.',
        });
      }
      try {
        const character = await performResourceCraft(
          userId,
          er,
          tier,
          recipeIndex,
          quantity
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          return reply.code(409).send({ error: e.message });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'craft_profession_required') {
          return reply.code(403).send({
            error: e.message,
            messageUk:
              'Крафт лише для Збирача (Scavenger), Ремісника (Artisan) та Маестро (Maestro).',
          });
        }
        if (e instanceof Error && e.message === 'level_too_low') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Занадто низький рівень для цього ряду рецептів.',
          });
        }
        if (e instanceof Error && e.message === 'insufficient_materials') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Недостатньо матеріалів у сумці.',
          });
        }
        if (e instanceof Error && e.message === 'invalid_recipe') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий рецепт.',
          });
        }
        throw e;
      }
    }
  );
};
