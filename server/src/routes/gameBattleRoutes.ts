import type { FastifyInstance } from 'fastify';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';
import { requireAuth } from '../lib/auth.js';
import {
  GameConflictError,
  performReturnToNearestTown,
} from '../services/charService.js';
import {
  getBattleState,
  getBattleSyncForUser,
  leaveBattle,
  performBattleAction,
  saveBattleHotbar,
  startBattle,
  startHuntContinueBattle,
  startPvpBattle,
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
import { BattleSkillNotAllowedError } from '../domain/battleSkillNotAllowedError.js';
import {
  isPvpStartErrorMessage,
  sendPvpStartError,
} from './gameBattlePvpRouteErrors.js';

export function registerGameBattleRoutes(app: FastifyInstance): void {
  app.get(
    '/battle',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const data = await getBattleState(userId);
      if (!data) {
        return reply.code(404).send({ error: 'forbidden' });
      }
      return reply.send(data);
    }
  );

  app.get(
    '/battle/sync',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const q = request.query as Record<string, unknown>;
      const rawBv = q.battleVersion;
      const rawLs = q.lastLogSeq;
      const battleVersion =
        typeof rawBv === 'string' && /^\d+$/.test(rawBv)
          ? parseInt(rawBv, 10)
          : typeof rawBv === 'number' && Number.isFinite(rawBv)
            ? Math.floor(rawBv)
            : undefined;
      const lastLogSeq =
        typeof rawLs === 'string' && /^\d+$/.test(rawLs)
          ? parseInt(rawLs, 10)
          : typeof rawLs === 'number' && Number.isFinite(rawLs)
            ? Math.floor(rawLs)
            : undefined;
      const data = await getBattleSyncForUser(userId, {
        battleVersion,
        lastLogSeq,
      });
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
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const spawnId = b.spawnId;
      if (typeof spawnId !== 'string' || !spawnId.length) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен spawnId моба.',
        });
      }
      try {
        const result = await startBattle(userId, spawnId, er);
        await logRouteMutation(
          request,
          'battle_start',
          er,
          'ok',
          result.character.revision,
          result.character.id,
          'battle-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_start', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
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
          await logRouteMutation(request, 'battle_start', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Підійди ближче до моба на карті.',
          });
        }
        if (e instanceof Error && e.message === 'mob_on_respawn') {
          await logRouteMutation(request, 'battle_start', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Моб ще не відродився. Зачекай трохи.',
          });
        }
        if (e instanceof Error && e.message === 'pve_defeat_pending') {
          await logRouteMutation(request, 'battle_start', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Ти знепритомнів. Спочатку натисни «В місто».',
          });
        }
        await logRouteMutation(request, 'battle_start', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/battle/pvp/start',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const targetCharacterId = b.targetCharacterId;
      if (typeof targetCharacterId !== 'string' || !targetCharacterId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен targetCharacterId гравця.',
        });
      }
      try {
        const result = await startPvpBattle(
          userId,
          targetCharacterId.trim(),
          er
        );
        await logRouteMutation(
          request,
          'battle_pvp_start',
          er,
          'ok',
          result.character.revision,
          result.character.id,
          'battle-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_pvp_start', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && isPvpStartErrorMessage(e.message)) {
          await logRouteMutation(request, 'battle_pvp_start', er, 'error', undefined, undefined, 'battle-mutation');
          return sendPvpStartError(reply, e.message);
        }
        await logRouteMutation(request, 'battle_pvp_start', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/battle/hunt-continue',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const rawTol = b.levelTolerance;
      const rawTargetLevel = b.targetLevel;
      const excludeRaw = b.excludeSpawnId;
      const preferredRaw = b.preferredSpawnId;
      const excludeSpawnId =
        typeof excludeRaw === 'string' && excludeRaw.trim()
          ? excludeRaw.trim()
          : undefined;
      const preferredSpawnId =
        typeof preferredRaw === 'string' && preferredRaw.trim()
          ? preferredRaw.trim()
          : undefined;
      const levelTolerance =
        typeof rawTol === 'number' && Number.isFinite(rawTol)
          ? Math.max(0, Math.min(10, Math.floor(rawTol)))
          : undefined;
      const targetLevel =
        typeof rawTargetLevel === 'number' && Number.isFinite(rawTargetLevel)
          ? Math.max(1, Math.floor(rawTargetLevel))
          : undefined;
      try {
        const result = await startHuntContinueBattle(
          userId,
          er,
          excludeSpawnId,
          levelTolerance,
          preferredSpawnId,
          targetLevel
        );
        await logRouteMutation(
          request,
          'battle_hunt_continue',
          er,
          'ok',
          result.character.revision,
          result.character.id,
          'battle-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_hunt_continue', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_hunt_no_targets') {
          await logRouteMutation(request, 'battle_hunt_continue', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(404).send({
            error: e.message,
            messageUk: 'Немає підхожих цілей поруч. Онови карту або підійди ближче.',
          });
        }
        if (e instanceof Error && e.message === 'battle_hunt_no_live_targets') {
          await logRouteMutation(request, 'battle_hunt_continue', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Усі цілі поруч на респавні. Зачекай кілька секунд.',
          });
        }
        if (e instanceof Error && e.message === 'battle_spawn_unknown') {
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Невідомий моб на карті.',
          });
        }
        if (e instanceof Error && e.message === 'battle_too_far') {
          await logRouteMutation(request, 'battle_hunt_continue', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Підійди ближче до мобів на карті.',
          });
        }
        if (e instanceof Error && e.message === 'mob_on_respawn') {
          await logRouteMutation(request, 'battle_hunt_continue', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: 'battle_hunt_no_live_targets',
            messageUk: 'Усі цілі поруч на респавні. Зачекай кілька секунд.',
          });
        }
        await logRouteMutation(request, 'battle_hunt_continue', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/battle/action',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      const actionNorm = normalizeClientBattleAction(b.action);

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
        const resultRevision =
          result.kind === 'delta' ? result.revision : result.character.revision;
        const resultCharId =
          result.kind === 'delta' ? result.characterId : result.character.id;
        await logRouteMutation(
          request,
          'battle_action:' + String(actionNorm),
          er,
          'ok',
          resultRevision,
          resultCharId,
          'battle-mutation'
        );
        return reply.send(result);
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(
            request,
            'battle_action:' + String(actionNorm),
            er,
            'conflict',
            undefined,
            undefined,
            'battle-mutation'
          );
          return sendGameConflict(reply, e);
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
        if (e instanceof Error && e.message === 'battle_player_stunned') {
          return reply.code(400).send({
            error: e.message,
            code: 'battle_player_stunned',
            reason: 'stunned',
            messageUk: 'Ти оглушений і не можеш діяти.',
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
        if (e instanceof Error && e.message === 'battle_no_arrows') {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'У сумці немає стріл потрібного грейду для лука (NG–S має збігатися з грейдом зброї).',
          });
        }
        if (
          e instanceof Error &&
          e.message === 'battle_bow_no_weapon_grade'
        ) {
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Потрібен лук з відомим грейдом (NG–S), щоб стріляти стрілами.',
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
          await logRouteMutation(
            request,
            'battle_action:' + String(actionNorm),
            er,
            'error',
            undefined,
            undefined,
            'battle-mutation'
          );
          return reply.code(400).send({
            error: e.message,
            messageUk:
              'Досягнуто максимум Sonic Focus зарядів. Витрать їх sonic-скілом.',
          });
        }
        await logRouteMutation(
          request,
          'battle_action:' + String(actionNorm),
          er,
          'error',
          undefined,
          undefined,
          'battle-mutation'
        );
        throw e;
      }
    }
  );

  app.post(
    '/battle/leave',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      try {
        const character = await leaveBattle(userId, er);
        await logRouteMutation(request, 'battle_leave', er, 'ok', character.revision, character.id, 'battle-mutation');
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_leave', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logRouteMutation(request, 'battle_leave', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logRouteMutation(request, 'battle_leave', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/battle/hotbar',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      if (!('slots' in b)) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен масив слотів панелі скілів.',
        });
      }
      try {
        const character = await saveBattleHotbar(userId, er, b.slots);
        await logRouteMutation(
          request,
          'battle_hotbar',
          er,
          'ok',
          character.revision,
          character.id,
          'battle-mutation'
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_hotbar', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'hotbar_invalid') {
          await logRouteMutation(request, 'battle_hotbar', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Некоректна розкладка панелі скілів.',
          });
        }
        if (e instanceof Error && e.message === 'no_character') {
          await logRouteMutation(request, 'battle_hotbar', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logRouteMutation(request, 'battle_hotbar', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );

  app.post(
    '/battle/return-to-town',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const er = parseExpectedRevision(b, reply);
      if (er == null) return;
      try {
        const character = await performReturnToNearestTown(userId, er);
        await logRouteMutation(
          request,
          'battle_return_to_town',
          er,
          'ok',
          character.revision,
          character.id,
          'battle-mutation'
        );
        return reply.send({ character });
      } catch (e) {
        if (e instanceof GameConflictError) {
          await logRouteMutation(request, 'battle_return_to_town', er, 'conflict', undefined, undefined, 'battle-mutation');
          return sendGameConflict(reply, e);
        }
        if (e instanceof Error && e.message === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        if (e instanceof Error && e.message === 'battle_still_active') {
          await logRouteMutation(request, 'battle_return_to_town', er, 'error', undefined, undefined, 'battle-mutation');
          return reply.code(400).send({
            error: e.message,
            messageUk: 'Спочатку заверши бій.',
          });
        }
        await logRouteMutation(request, 'battle_return_to_town', er, 'error', undefined, undefined, 'battle-mutation');
        throw e;
      }
    }
  );
}
