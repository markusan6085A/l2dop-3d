import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import {
  applyEquipFromBag,
  applyPersistedCombatBuffs,
  applyUnequip,
  castActiveSelfBuff,
  toggleSelfStance,
  applyTownBuffer,
  applyTownRestoreVitals,
  GameConflictError,
} from '../services/charService.js';
import { learnSkillForUser } from '../services/skillLearnService.js';
import { prisma } from '../lib/prisma.js';

async function logCharacterMutation(
  request: { log: { info: (obj: unknown, msg?: string) => void }; userId?: string },
  action: string,
  expectedRevision: number,
  result: 'ok' | 'conflict' | 'error',
  actualRevision?: number
): Promise<void> {
  if (!request.userId) return;
  const row = await prisma.character.findFirst({
    where: { userId: request.userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true, revision: true },
  });
  request.log.info(
    {
      action,
      characterId: row?.id ?? null,
      expectedRevision,
      actualRevision: actualRevision ?? row?.revision ?? null,
      result,
    },
    'character-mutation'
  );
}

/** POST skills/learn, persisted-combat-buffs, equip. */
export function registerCharacterSkillsBuffEquipRoutes(app: FastifyInstance): void {
  app.post(
    '/town/buffer',
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
        const res = await applyTownBuffer(userId, er);
        await logCharacterMutation(
          request,
          'town_buffer',
          er,
          'ok',
          res.character.revision
        );
        return reply.send({
          character: res.character,
          feeAdena: res.feeAdena,
        });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(request, 'town_buffer', er, 'conflict');
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — виконай синхронізацію.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'town_buffer_not_enough_adena') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Недостатньо адени для міського бафера.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(request, 'town_buffer', er, 'error');
        request.log.error({ err }, 'POST /character/town/buffer');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося застосувати бафи міського бафера.',
        });
      }
    }
  );

  app.post(
    '/town/restore-vitals',
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
        const res = await applyTownRestoreVitals(userId, er);
        await logCharacterMutation(
          request,
          'town_restore_vitals',
          er,
          'ok',
          res.character.revision
        );
        return reply.send({
          character: res.character,
          feeAdena: res.feeAdena,
        });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(request, 'town_restore_vitals', er, 'conflict');
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — виконай синхронізацію.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'town_restore_not_enough_adena') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Недостатньо адени для відновлення.',
          });
        }
        if (msg === 'town_restore_already_full') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'HP, MP і CP уже повні.',
          });
        }
        if (msg === 'in_battle') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Під час бою відновлення недоступне.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(request, 'town_restore_vitals', er, 'error');
        request.log.error({ err }, 'POST /character/town/restore-vitals');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося відновити HP, MP і CP.',
        });
      }
    }
  );

  app.post(
    '/skills/learn',
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
      const battleId = b.battleId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof battleId !== 'string' || !battleId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен battleId скіла.',
        });
      }
      try {
        const character = await learnSkillForUser(
          userId,
          battleId.trim(),
          er
        );
        await logCharacterMutation(
          request,
          'skills_learn:' + battleId.trim(),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(
            request,
            'skills_learn:' + battleId.trim(),
            er,
            'conflict'
          );
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'skill_unknown' || msg === 'skill_wrong_class') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Невідомий скіл або не для твоєї гілки.',
          });
        }
        if (msg === 'skill_already_maxed') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Досягнуто максимального рангу цього скіла.',
          });
        }
        if (msg === 'skill_level_too_low') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Рівень замалий для цього скіла.',
          });
        }
        if (msg === 'skill_not_enough_sp') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Недостатньо SP.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(
          request,
          'skills_learn:' + battleId.trim(),
          er,
          'error'
        );
        request.log.error({ err }, 'POST /character/skills/learn');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося вивчити скіл.',
        });
      }
    }
  );

  /**
   * Геройський режим / Zealot у БД (cs1 $heroic / $zealot). Потрібен для геройських бафів з activeBuffsJson.
   */
  app.post(
    '/persisted-combat-buffs',
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
      const ht = b.buffHeroicTier;
      const zs = b.buffZealotStacks;
      if (!('buffHeroicTier' in b) || !('buffZealotStacks' in b)) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Передай buffHeroicTier і buffZealotStacks (null або число).',
        });
      }
      if (ht != null && (typeof ht !== 'number' || !Number.isInteger(ht))) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'buffHeroicTier: очікується null або 1/2/3.',
        });
      }
      if (zs != null && (typeof zs !== 'number' || !Number.isInteger(zs))) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'buffZealotStacks: очікується null або 1–3.',
        });
      }
      try {
        const character = await applyPersistedCombatBuffs(
          userId,
          er,
          ht as number | null,
          zs as number | null
        );
        await logCharacterMutation(
          request,
          'persisted_combat_buffs',
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(
            request,
            'persisted_combat_buffs',
            er,
            'conflict'
          );
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'invalid_heroic_tier') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Режим героя: лише 1 (атака), 2 (захист), 3 (підмога) або вимкнено.',
          });
        }
        if (msg === 'invalid_zealot_stacks') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Zealot: лише 1–3 верстви або вимкнено.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(
          request,
          'persisted_combat_buffs',
          er,
          'error'
        );
        request.log.error({ err }, 'POST /character/persisted-combat-buffs');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося зберегти налаштування.',
        });
      }
    }
  );

  /**
   * Каст активного селф-бафа поза боєм (War Cry 78, Battle Roar 121, Thrill Fight 130 тощо).
   * Тіло: `{ battleId: string, expectedRevision: number }`. Якщо гравець у бою — 400.
   */
  app.post(
    '/skills/cast',
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
      const battleId = b.battleId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof battleId !== 'string' || !battleId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен battleId скіла (наприклад, l2_78).',
        });
      }
      try {
        const character = await castActiveSelfBuff(userId, battleId.trim(), er);
        await logCharacterMutation(
          request,
          'skills_cast:' + battleId.trim(),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(
            request,
            'skills_cast:' + battleId.trim(),
            er,
            'conflict'
          );
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'skill_unknown') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Невідомий скіл (немає в каталозі чи без MP-таблиці).',
          });
        }
        if (msg === 'skill_not_learned') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Цей скіл ще не вивчено.',
          });
        }
        if (msg === 'skill_not_self_buff') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Для цього скіла немає Interlude-тривалості — поза боєм не кастується.',
          });
        }
        if (msg === 'skill_in_battle') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Кастити поза боєм — лише коли ти не в бою.',
          });
        }
        if (msg === 'skill_on_cooldown') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Скіл ще перезаряджається.',
          });
        }
        if (msg === 'skill_not_enough_mp') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Недостатньо MP.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(
          request,
          'skills_cast:' + battleId.trim(),
          er,
          'error'
        );
        request.log.error({ err }, 'POST /character/skills/cast');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося застосувати скіл.',
        });
      }
    }
  );

  /**
   * Перемикання toggle-стійки **поза боєм** (Accuracy 256, Vicious 312, Parry 364).
   * Тіло: `{ battleId: string, expectedRevision: number }`. У бою — 400.
   */
  app.post(
    '/skills/toggle',
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
      const battleId = b.battleId;
      if (typeof er !== 'number' || !Number.isInteger(er) || er < 1) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Некоректний expectedRevision.',
        });
      }
      if (typeof battleId !== 'string' || !battleId.trim()) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Потрібен battleId стійки (наприклад, l2_256).',
        });
      }
      try {
        const character = await toggleSelfStance(userId, battleId.trim(), er);
        await logCharacterMutation(
          request,
          'skills_toggle:' + battleId.trim(),
          er,
          'ok',
          character.revision
        );
        return reply.send({ character });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(
            request,
            'skills_toggle:' + battleId.trim(),
            er,
            'conflict'
          );
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'skill_in_battle') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'У бою стійка вмикається через її екшн на панелі.',
          });
        }
        if (msg === 'skill_unknown') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Стійки з такою назвою не існує.',
          });
        }
        if (msg === 'skill_not_learned') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Цю стійку ще не вивчено.',
          });
        }
        if (msg === 'skill_not_toggle') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Цей скіл — не toggle-стійка.',
          });
        }
        if (msg === 'stance_not_supported') {
          return reply.code(400).send({
            error: msg,
            messageUk: 'Стійка для цієї раси/гілки поки доступна тільки в бою.',
          });
        }
        if (msg === 'no_character') {
          return reply.code(404).send({ error: 'forbidden' });
        }
        await logCharacterMutation(
          request,
          'skills_toggle:' + battleId.trim(),
          er,
          'error'
        );
        request.log.error({ err }, 'POST /character/skills/toggle');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося перемкнути стійку.',
        });
      }
    }
  );

      /** Одягнути предмет із сумки у відповідний слот (l1/l2/l3/l4, lr1/lr2, neck, le1/le2). */
  app.post(
    '/equip',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = request.userId;
      if (!userId) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      const body = request.body as {
        action?: string;
        itemId?: number;
        /** Заточка стеку в сумці (l2dop eqbonus), 0 за замовчуванням */
        enchant?: number;
        slot?: string;
        expectedRevision?: number;
      };
      const rev = body.expectedRevision;
      if (typeof rev !== 'number' || !Number.isFinite(rev)) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Передай expectedRevision з відповіді /character.',
        });
      }
      try {
        if (body.action === 'equip' && body.itemId != null) {
          const itemId = Number(body.itemId);
          if (!Number.isFinite(itemId) || itemId <= 0) {
            return reply.code(400).send({
              error: 'invalid_input',
              messageUk: 'Некоректний itemId.',
            });
          }
          const enRaw = body.enchant;
          const enchant =
            typeof enRaw === 'number' && Number.isFinite(enRaw)
              ? Math.max(0, Math.min(20, Math.floor(enRaw)))
              : 0;
          const character = await applyEquipFromBag(userId, itemId, rev, enchant);
          await logCharacterMutation(
            request,
            'equip:' + String(itemId),
            rev,
            'ok',
            character.revision
          );
          return reply.send({ character });
        }
        if (body.action === 'unequip' && typeof body.slot === 'string') {
          const character = await applyUnequip(userId, body.slot, rev);
          await logCharacterMutation(
            request,
            'unequip:' + body.slot,
            rev,
            'ok',
            character.revision
          );
          return reply.send({ character });
        }
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk: 'Очікується action: "equip" + itemId або action: "unequip" + slot.',
        });
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logCharacterMutation(request, 'equip_mutation', rev, 'conflict');
          return reply.code(409).send({
            error: 'revision_conflict',
            messageUk: 'Дані застаріли — онови сторінку.',
          });
        }
        const msg = err instanceof Error ? err.message : '';
        if (msg === 'not_in_bag' || msg === 'unknown_item') {
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk:
              msg === 'not_in_bag'
                ? 'Предмета немає в сумці.'
                : 'Невідомий предмет.',
          });
        }
        if (msg === 'slot_empty') {
          await logCharacterMutation(request, 'equip_mutation', rev, 'error');
          return reply.code(400).send({
            error: 'invalid_input',
            messageUk: 'Слот порожній.',
          });
        }
        await logCharacterMutation(request, 'equip_mutation', rev, 'error');
        request.log.error({ err }, 'POST /character/equip');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося змінити екіп.',
        });
      }
    }
  );
}
