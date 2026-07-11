import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  GameConflictError,
  performReturnToNearestTown,
} from '../services/charService.js';
import {
  getBattleState,
  leaveBattle,
  performBattleAction,
  saveBattleHotbar,
  startBattle,
  startHuntContinueBattle,
} from '../services/battleService.js';
import type { BattleActionId } from '../domain/battle.js';
import {
  ELVEN_MYSTIC_ACTIVE_L2_ID_SET,
} from '../data/elvenMysticSkillCatalog.js';
import {
  DARK_MYSTIC_ACTIVE_L2_ID_SET,
} from '../data/darkMysticSkillCatalog.js';
import {
  ORC_MYSTIC_ACTIVE_L2_ID_SET,
} from '../data/orcMysticSkillCatalog.js';
import {
  HUMAN_MYSTIC_ACTIVE_L2_ID_SET,
} from '../data/humanMysticSkillCatalog.js';
import { GAME_BATTLE_NAMED_ALLOWED_ACTIONS } from './gameBattleAllowedActions.js';
import {
  normalizeClientBattleAction,
  raceFighterL2ActionAllowed,
} from './gameBattleClientNormalize.js';
import { prisma } from '../lib/prisma.js';
import { BattleSkillNotAllowedError } from '../domain/battleSkillNotAllowedError.js';
import { sendRevisionConflict } from './revisionConflict.js';

async function logBattleMutation(
  request: { log: { info: (obj: unknown, msg?: string) => void }; userId?: string },
  action: string,
  expectedRevision: number,
  result: 'ok' | 'conflict' | 'error',
  actualRevision?: number,
  characterId?: string | null
): Promise<void> {
  if (!request.userId) return;
  let characterIdLog = characterId ?? null;
  let actualRevisionLog = actualRevision ?? null;
  if (!characterIdLog || actualRevisionLog == null) {
    const row = await prisma.character.findFirst({
      where: { userId: request.userId },
      orderBy: { lastUpdate: 'desc' },
      select: { id: true, revision: true },
    });
    characterIdLog = row?.id ?? null;
    if (actualRevisionLog == null) {
      actualRevisionLog = row?.revision ?? null;
    }
  }
  request.log.info(
    {
      action,
      characterId: characterIdLog,
      expectedRevision,
      actualRevision: actualRevisionLog,
      result,
    },
    'battle-mutation'
  );
}

export function registerGameBattleRoutes(app: FastifyInstance): void {
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
        await logBattleMutation(
          request,
          'battle_start',
          er,
          'ok',
          result.character.revision,
          result.character.id
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(request, 'battle_start', er, 'conflict');
          return sendRevisionConflict(reply);
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
          await logBattleMutation(request, 'battle_start', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Підійди ближче до моба на карті.',
          });
        }
        if (e instanceof Error && e.message === 'mob_on_respawn') {
          await logBattleMutation(request, 'battle_start', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Моб ще не відродився. Зачекай трохи.',
          });
        }
        await logBattleMutation(request, 'battle_start', er, 'error');
        throw e;
      }
    }
  );

  app.post(
    '/battle/hunt-continue',
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
      const rawLevel = b.targetLevel;
      const rawTol = b.levelTolerance;
      const excludeRaw = b.excludeSpawnId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (
        typeof rawLevel !== 'number' ||
        !Number.isFinite(rawLevel) ||
        rawLevel < 1
      ) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен рівень моба для полювання.',
        });
      }
      const excludeSpawnId =
        typeof excludeRaw === 'string' && excludeRaw.trim()
          ? excludeRaw.trim()
          : undefined;
      const levelTolerance =
        typeof rawTol === 'number' && Number.isFinite(rawTol)
          ? Math.max(0, Math.min(10, Math.floor(rawTol)))
          : 0;
      try {
        const result = await startHuntContinueBattle(
          userId,
          er,
          Math.floor(rawLevel),
          excludeSpawnId,
          levelTolerance
        );
        await logBattleMutation(
          request,
          'battle_hunt_continue',
          er,
          'ok',
          result.character.revision,
          result.character.id
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(request, 'battle_hunt_continue', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_hunt_no_targets') {
          await logBattleMutation(request, 'battle_hunt_continue', er, 'error');
          return reply.code(404).send({
            error: e.message,
            messageUk:
              'Поруч немає доступних мобів цього рівня. Онови карту або підійди ближче.',
          });
        }
        if (e instanceof Error && e.message === 'battle_spawn_unknown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий моб на карті.',
          });
        }
        if (e instanceof Error && e.message === 'battle_too_far') {
          await logBattleMutation(request, 'battle_hunt_continue', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Підійди ближче до мобів на карті.',
          });
        }
        if (e instanceof Error && e.message === 'mob_on_respawn') {
          await logBattleMutation(request, 'battle_hunt_continue', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Моб ще не відродився. Зачекай трохи.',
          });
        }
        await logBattleMutation(request, 'battle_hunt_continue', er, 'error');
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
      if (
        typeof er !== 'number' ||
        !Number.isInteger(er) ||
        er < 1
      ) {
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
        (!GAME_BATTLE_NAMED_ALLOWED_ACTIONS.includes(
          actionNorm as BattleActionId
        ) &&
          !mysticCastOk &&
          !raceFighterL2ActionAllowed(actionNorm))
      ) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Невідома дія.',
        });
      }

      let fighterSoulshotOpts:
        | { fighterSoulshotItemId: number }
        | undefined;
      let mysticSpiritshotOpts:
        | { mysticSpiritshotItemId: number }
        | undefined;
      let battlePotionOpts: { battlePotionItemId: number } | undefined;
      if (actionNorm === 'fighter_soulshot_toggle') {
        const rawBid = b.itemId;
        const parsed =
          typeof rawBid === 'number' && Number.isInteger(rawBid)
            ? rawBid
            : typeof rawBid === 'string' && /^\d+$/.test(rawBid.trim())
              ? parseInt(rawBid.trim(), 10)
              : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Вкажи предмет заряду душі.',
          });
        }
        fighterSoulshotOpts = { fighterSoulshotItemId: parsed };
      }
      if (actionNorm === 'mystic_spiritshot_toggle') {
        const rawBid = b.itemId;
        const parsed =
          typeof rawBid === 'number' && Number.isInteger(rawBid)
            ? rawBid
            : typeof rawBid === 'string' && /^\d+$/.test(rawBid.trim())
              ? parseInt(rawBid.trim(), 10)
              : NaN;
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Вкажи предмет благословенного заряду духу.',
          });
        }
        mysticSpiritshotOpts = { mysticSpiritshotItemId: parsed };
      }
      if (actionNorm === 'battle_potion_use') {
        const rawPid = b.itemId;
        const parsedP =
          typeof rawPid === 'number' && Number.isInteger(rawPid)
            ? rawPid
            : typeof rawPid === 'string' && /^\d+$/.test(rawPid.trim())
              ? parseInt(rawPid.trim(), 10)
              : NaN;
        if (!Number.isFinite(parsedP) || parsedP <= 0) {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Вкажи зілля для використання в бою.',
          });
        }
        battlePotionOpts = { battlePotionItemId: parsedP };
      }
      try {
        const result = await performBattleAction(
          userId,
          actionNorm as BattleActionId,
          er,
          {
            ...fighterSoulshotOpts,
            ...mysticSpiritshotOpts,
            ...battlePotionOpts,
          }
        );
        await logBattleMutation(
          request,
          'battle_action:' + String(actionNorm),
          er,
          'ok',
          result.character.revision,
          result.character.id
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(
            request,
            'battle_action:' + String(actionNorm),
            er,
            'conflict'
          );
          return sendRevisionConflict(reply);
        }
        if (e instanceof BattleSkillNotAllowedError) {
          return reply.code(400).send({
            error: e.code,
            code: e.code,
            reason: e.reason,
            ...(typeof e.remainingCooldownMs === 'number'
              ? { remainingCooldownMs: e.remainingCooldownMs }
              : {}),
            ...(typeof e.serverNowMs === 'number'
              ? { serverNowMs: e.serverNowMs }
              : {}),
            ...(typeof e.cooldownReadyAtMs === 'number'
              ? { cooldownReadyAtMs: e.cooldownReadyAtMs }
              : {}),
            messageUk:
              e.reason === 'cooldown'
                ? 'Скіл ще на перезарядці.'
                : 'Цей скіл зараз недоступний для твого персонажа.',
          });
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_none') {
          return reply.code(400).send({
            error: e.message,
            code: 'battle_skill_not_allowed',
            reason: 'not_in_battle',
            messageUk: 'Немає активного бою.',
          });
        }
        if (e instanceof Error && e.message === 'battle_spawn_gone') {
          return reply.code(400).send({
            error: e.message,
            code: 'battle_skill_not_allowed',
            reason: 'target_dead',
            messageUk: 'Дані моба застарілі — онови карту.',
          });
        }
        if (e instanceof Error && e.message === 'battle_skill_not_allowed') {
          return reply.code(400).send({
            error: e.message,
            code: 'battle_skill_not_allowed',
            reason: 'invalid_state',
            messageUk: 'Цей скіл зараз недоступний для твого персонажа.',
          });
        }
        if (e instanceof Error && e.message === 'mystic_spiritshot_bad_item') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Цей предмет не є благословенним зарядом духу для мага.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'mystic_spiritshot_no_weapon_grade'
        ) {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Потрібна зброя в правій руці з відомим грейдом (NG–S), щоб увімкнути благословений заряд духу.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'mystic_spiritshot_grade_mismatch'
        ) {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Грейд благословенного заряду духу має збігатися з грейдом зброї (NG до NG, D до D тощо).',
          });
        }
        if (e instanceof Error && e.message === 'battle_soulshot_bad_item') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Цей предмет не є зарядом душі для воїна.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'battle_soulshot_no_weapon_grade'
        ) {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Потрібна зброя в правій руці з відомим грейдом (NG–S), щоб увімкнути заряд душі.',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'battle_soulshot_grade_mismatch'
        ) {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Грейд заряду душі має збігатися з грейдом зброї (NG до NG, D до D тощо).',
          });
        }
        if (e instanceof Error && e.message === 'battle_no_item') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Немає таких предметів у сумці.',
          });
        }
        if (e instanceof Error && e.message === 'battle_bad_potion') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Це зілля не можна використати так у бою.',
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
            code: 'battle_skill_not_allowed',
            reason: 'cooldown',
            messageUk: 'Zealot ще на перезарядці — зачекай, поки минуть секунди КД.',
          });
        }
        if (e instanceof Error && e.message === 'battle_low_mp') {
          return reply.code(400).send({
            error: e.message,
            code: 'battle_skill_not_allowed',
            reason: 'not_enough_mp',
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
          await logBattleMutation(
            request,
            'battle_action:' + String(actionNorm),
            er,
            'error'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Досягнуто максимум Sonic Focus зарядів. Витрать їх sonic-скілом.',
          });
        }
        await logBattleMutation(
          request,
          'battle_action:' + String(actionNorm),
          er,
          'error'
        );
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
        await logBattleMutation(request, 'battle_leave', er, 'ok', character.revision, character.id);
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(request, 'battle_leave', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logBattleMutation(request, 'battle_leave', er, 'error');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logBattleMutation(request, 'battle_leave', er, 'error');
        throw e;
      }
    }
  );

  app.post(
    '/battle/hotbar',
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
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (!('slots' in b)) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен масив слотів панелі скілів.',
        });
      }
      try {
        const character = await saveBattleHotbar(userId, er, b.slots);
        await logBattleMutation(
          request,
          'battle_hotbar',
          er,
          'ok',
          character.revision,
          character.id
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(request, 'battle_hotbar', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'hotbar_invalid') {
          await logBattleMutation(request, 'battle_hotbar', er, 'error');
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Некоректна розкладка панелі скілів.',
          });
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logBattleMutation(request, 'battle_hotbar', er, 'error');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logBattleMutation(request, 'battle_hotbar', er, 'error');
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
        await logBattleMutation(
          request,
          'battle_return_to_town',
          er,
          'ok',
          character.revision,
          character.id
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logBattleMutation(request, 'battle_return_to_town', er, 'conflict');
          return sendRevisionConflict(reply);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_still_active') {
          await logBattleMutation(request, 'battle_return_to_town', er, 'error');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Спочатку заверши бій.',
          });
        }
        await logBattleMutation(request, 'battle_return_to_town', er, 'error');
        throw e;
      }
    }
  );
}
