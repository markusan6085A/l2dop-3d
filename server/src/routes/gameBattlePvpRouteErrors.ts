import type { FastifyReply } from 'fastify';

const PVP_START_ERRORS: Record<string, string> = {
  pvp_target_unknown: 'Гравця не знайдено.',
  pvp_too_far: 'Підійди ближче — гравець поза радіусом атаки.',
  pvp_target_in_battle: 'Цей гравець уже в бою.',
  pvp_target_busy: 'Гравець б\'ється з іншим суперником.',
  pvp_self: 'Не можна атакувати себе.',
  pvp_target_safe: 'У місті та селищах PvP заборонено.',
  pvp_attacker_safe: 'З безпечної зони не можна атакувати.',
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
