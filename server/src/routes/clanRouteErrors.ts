import type { FastifyReply } from 'fastify';

const CLAN_CREATE_ERRORS: Record<string, { status: number; messageUk: string }> = {
  no_character: { status: 404, messageUk: 'Персонаж не знайдено.' },
  clan_name_required: {
    status: 400,
    messageUk: 'Вкажи назву клану.',
  },
  clan_name_length: {
    status: 400,
    messageUk: 'Назва клану: від 3 до 16 символів.',
  },
  clan_name_chars: {
    status: 400,
    messageUk: 'У назві лише літери та цифри, без спецсимволів.',
  },
  clan_name_offensive: {
    status: 400,
    messageUk: 'Заборонена назва клану.',
  },
  clan_name_taken: {
    status: 400,
    messageUk: 'Клан з такою назвою вже існує.',
  },
  clan_create_level: {
    status: 400,
    messageUk: 'Потрібен рівень персонажа не нижче 20.',
  },
  clan_create_not_enough_adena: {
    status: 400,
    messageUk: 'Недостатньо Adena (потрібно 1).',
  },
  clan_create_already_in_clan: {
    status: 400,
    messageUk: 'Ти вже в клані.',
  },
  clan_create_in_battle: {
    status: 400,
    messageUk: 'Неможливо створити клан під час бою.',
  },
  clan_announcement_length: {
    status: 400,
    messageUk: 'Оголошення занадто довге (макс. 300 символів).',
  },
  clan_announcement_forbidden: {
    status: 403,
    messageUk: 'Редагувати оголошення може лише лідер клану.',
  },
  clan_hall_not_in_clan: {
    status: 400,
    messageUk: 'Ти не в клані.',
  },
  clan_hall_buy_forbidden: {
    status: 403,
    messageUk: 'Купити Клан-хол може лише лідер клану.',
  },
  clan_hall_already_owned: {
    status: 400,
    messageUk: 'Благословення Клан-холу вже куплено.',
  },
  clan_hall_not_enough_adena: {
    status: 400,
    messageUk: 'Недостатньо Adena (потрібно 1).',
  },
  clan_hall_in_battle: {
    status: 400,
    messageUk: 'Неможливо купити під час бою.',
  },
};

export function sendClanCreateError(
  reply: FastifyReply,
  err: unknown
): FastifyReply | null {
  const msg = err instanceof Error ? err.message : '';
  const mapped = CLAN_CREATE_ERRORS[msg];
  if (!mapped) return null;
  return reply.code(mapped.status).send({
    error: msg,
    messageUk: mapped.messageUk,
  });
}
