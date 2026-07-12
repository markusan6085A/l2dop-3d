import type { FastifyReply } from 'fastify';

const PVP_START_ERRORS: Record<string, string> = {
  pvp_target_unknown: 'Гравця не знайдено.',
  pvp_too_far: 'Підійди ближче — гравець поза радіусом атаки.',
  pvp_target_in_battle: 'Цей гравець уже в бою.',
  pvp_self: 'Не можна атакувати себе.',
  already_in_battle: 'Спочатку заверши поточний бій.',
};

export function sendPvpStartError(
  reply: FastifyReply,
  code: string
): ReturnType<FastifyReply['send']> {
  const messageUk = PVP_START_ERRORS[code] ?? 'Не вдалося розпочати PvP-бій.';
  return reply.code(400).send({ error: code, messageUk });
}

export function isPvpStartErrorMessage(msg: string): boolean {
  return msg in PVP_START_ERRORS;
}
