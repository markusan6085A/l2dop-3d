import type { FastifyReply } from 'fastify';

const MARKET_ERRORS: Record<string, string> = {
  in_battle: 'Ринок недоступний під час бою.',
  not_in_bag: 'Предмета немає в сумці.',
  invalid_qty: 'Некоректна кількість.',
  invalid_item: 'Некоректний предмет.',
  price_required: 'Вкажи ціну в адені або Coin of Luck.',
  listing_not_found: 'Оголошення не знайдено або вже знято.',
  not_your_listing: 'Це не твоє оголошення.',
  cannot_buy_own_listing: 'Не можна купити власний лот.',
  not_enough_adena: 'Недостатньо адени.',
  not_enough_coin: 'Недостатньо Coin of Luck.',
  coin_luck_use_coin_market:
    'Coin of Luck продають лише на ринку Coin of Luck.',
  no_character: 'Персонаж не знайдений.',
};

export function handleMarketRouteError(
  reply: FastifyReply,
  err: unknown
): ReturnType<FastifyReply['send']> | null {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = MARKET_ERRORS[msg];
  if (!messageUk) return null;
  const code = msg === 'no_character' ? 404 : 400;
  return reply.code(code).send({ error: msg, messageUk });
}
