import type { FastifyReply } from 'fastify';

const ANCIENT_TRADER_ERRORS: Record<string, string> = {
  invalid_stone: 'Невідомий тип каміння.',
  invalid_quantity: 'Некоректна кількість.',
  insufficient_materials: 'Недостача ресурсів',
  no_character: 'Персонаж не знайдений.',
};

export function handleAncientTraderRouteError(
  reply: FastifyReply,
  err: unknown
): ReturnType<FastifyReply['send']> | null {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = ANCIENT_TRADER_ERRORS[msg];
  if (!messageUk) return null;
  const code = msg === 'no_character' ? 404 : 400;
  return reply.code(code).send({ error: msg, messageUk });
}
