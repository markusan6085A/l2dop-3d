import type { FastifyReply } from 'fastify';

const MAMMON_TELEPORT_ERRORS: Record<string, string> = {
  invalid_mammon_kind: 'Невідомий тип Маммона.',
  mammon_teleport_not_enough_adena: 'Недостатньо адени для телепорту (потрібна 1).',
  no_character: 'Персонаж не знайдений.',
};

const MAMMON_MERCHANT_SHOP_ERRORS: Record<string, string> = {
  invalid_shop_item: 'Невідомий ресурс.',
  invalid_gemstone: 'Невідомий ресурс.',
  invalid_quantity: 'Некоректна кількість.',
  insufficient_ancient_adena: 'Недостатньо Ancient Adena.',
  mammon_merchant_not_nearby: 'Підійди до Торговця Маммона.',
  no_character: 'Персонаж не знайдений.',
};

export function handleMammonTeleportRouteError(
  reply: FastifyReply,
  err: unknown
): ReturnType<FastifyReply['send']> | null {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = MAMMON_TELEPORT_ERRORS[msg];
  if (!messageUk) return null;
  const code = msg === 'no_character' ? 404 : 400;
  return reply.code(code).send({ error: msg, messageUk });
}

export function handleMammonMerchantShopRouteError(
  reply: FastifyReply,
  err: unknown
): ReturnType<FastifyReply['send']> | null {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = MAMMON_MERCHANT_SHOP_ERRORS[msg];
  if (!messageUk) return null;
  const code = msg === 'no_character' ? 404 : 400;
  return reply.code(code).send({ error: msg, messageUk });
}
