import type { FastifyReply } from 'fastify';
import { SiegeAttackError } from '../services/clanSiege/clanSiegeStateService.js';

const CODE_HTTP: Record<string, number> = {
  siege_not_started: 409,
  siege_not_active: 409,
  siege_finished: 409,
  siege_no_clan: 403,
  siege_defender: 403,
  siege_cooldown: 429,
  siege_invalid_city: 404,
  no_character: 404,
  invalid_input: 400,
};

export function sendSiegeAttackError(
  reply: FastifyReply,
  err: SiegeAttackError
): FastifyReply {
  const code = err.code;
  return reply.code(CODE_HTTP[code] ?? 400).send({
    error: code,
    messageUk: err.messageUk,
  });
}
