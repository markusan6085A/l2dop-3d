import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../lib/auth.js';
import { GameConflictError } from '../services/charErrors.js';
import { enchantEquipmentItemForUser } from '../services/enchantService.js';
import {
  ensureBodyRecord,
  ensureUserId,
  logRouteMutation,
  parseExpectedRevision,
  sendGameConflict,
} from './routeHttpHelpers.js';

function errorMessageUk(errorCode: string): string {
  if (errorCode === 'enchant_scroll_required' || errorCode === 'enchant_scroll_unknown') {
    return 'Некоректний сувій заточки.';
  }
  if (errorCode === 'enchant_target_required') {
    return 'Не вказано предмет для заточки.';
  }
  if (errorCode === 'enchant_scroll_not_in_bag') {
    return 'У сумці немає цього сувою.';
  }
  if (errorCode === 'enchant_target_not_found') {
    return 'Предмет для заточки не знайдено.';
  }
  if (errorCode === 'enchant_target_not_equipment') {
    return 'Заточувати можна тільки екіпіровку.';
  }
  if (errorCode === 'enchant_grade_mismatch') {
    return 'Грейд сувою не відповідає грейду предмета.';
  }
  if (errorCode === 'enchant_target_type_mismatch') {
    return 'Тип сувою не підходить для цього предмета.';
  }
  return 'Не вдалося виконати заточку.';
}

/** POST /game/inventory/enchant */
export function registerGameInventoryEnchantRoutes(app: FastifyInstance): void {
  app.post(
    '/inventory/enchant',
    { preHandler: requireAuth },
    async (request, reply) => {
      const userId = ensureUserId(request, reply);
      if (!userId) return;
      const b = ensureBodyRecord(request.body, reply);
      if (!b) return;
      const expectedRevision = parseExpectedRevision(b, reply);
      if (expectedRevision == null) return;
      const scrollItemId = Number(b.scrollItemId);
      const targetInstanceId =
        typeof b.targetInstanceId === 'string' ? b.targetInstanceId.trim() : '';
      if (!Number.isFinite(scrollItemId) || scrollItemId <= 0 || !targetInstanceId) {
        return reply.code(400).send({
          error: 'invalid_input',
          messageUk:
            'Передай expectedRevision, scrollItemId та targetInstanceId.',
        });
      }
      try {
        const result = await enchantEquipmentItemForUser(userId, expectedRevision, {
          scrollItemId,
          targetInstanceId,
        });
        await logRouteMutation(
          request,
          'inventory_enchant:' + String(scrollItemId),
          expectedRevision,
          'ok',
          result.character.revision
        );
        return reply.send(result);
      } catch (err) {
        if (err instanceof GameConflictError) {
          await logRouteMutation(request, 'inventory_enchant', expectedRevision, 'conflict');
          return sendGameConflict(reply, err);
        }
        if (err instanceof Error) {
          const code = String(err.message || 'enchant_failed');
          await logRouteMutation(request, 'inventory_enchant', expectedRevision, 'error');
          return reply.code(400).send({
            error: code,
            messageUk: errorMessageUk(code),
          });
        }
        await logRouteMutation(request, 'inventory_enchant', expectedRevision, 'error');
        request.log.error({ err }, 'POST /game/inventory/enchant');
        return reply.code(500).send({
          error: 'internal_error',
          messageUk: 'Не вдалося виконати заточку.',
        });
      }
    }
  );
}
