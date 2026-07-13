import type { FastifyReply } from 'fastify';

export function handleShopSellRouteError(
  reply: FastifyReply,
  err: unknown
): boolean {
  if (!(err instanceof Error)) return false;
  const m = err.message;
  if (m === 'no_character') {
    reply.code(404).send({ error: 'forbidden' });
    return true;
  }
  if (m === 'shop_sell_bad_item') {
    reply.code(400).send({
      error: m,
      messageUk: 'Некоректний предмет.',
    });
    return true;
  }
  if (m === 'shop_sell_bad_qty') {
    reply.code(400).send({
      error: m,
      messageUk: 'Вкажи кількість від 1 до 9999.',
    });
    return true;
  }
  if (m === 'shop_sell_not_sellable') {
    reply.code(400).send({
      error: m,
      messageUk: 'Цей предмет не можна продати в магазині.',
    });
    return true;
  }
  if (m === 'shop_sell_not_in_bag') {
    reply.code(400).send({
      error: m,
      messageUk: 'Предмета немає в сумці в потрібній кількості.',
    });
    return true;
  }
  return false;
}
