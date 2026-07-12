import type { FastifyReply } from 'fastify';

const WAREHOUSE_ERRORS: Record<string, string> = {
  in_battle: 'Склад недоступний під час бою.',
  warehouse_not_in_town: 'Склад доступний лише в місті.',
  bag_full: 'Сумка переповнена — звільни місце.',
  warehouse_full: 'Склад переповнений.',
  not_in_warehouse: 'Предмета немає на складі.',
  not_in_bag: 'Предмета немає в сумці.',
  invalid_qty: 'Некоректна кількість.',
  invalid_item: 'Некоректний предмет.',
  item_not_found: 'Предмет не знайдено.',
  no_character: 'Персонаж не знайдений.',
};

export function handleWarehouseRouteError(
  reply: FastifyReply,
  err: unknown
): ReturnType<FastifyReply['send']> | null {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = WAREHOUSE_ERRORS[msg];
  if (!messageUk) return null;
  const code = msg === 'no_character' ? 404 : 400;
  return reply.code(code).send({ error: msg, messageUk });
}
