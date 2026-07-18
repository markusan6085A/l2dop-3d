import type { FastifyReply } from 'fastify';

const PARTY_ERRORS: Record<string, { status: number; messageUk: string }> = {
  no_character: { status: 404, messageUk: 'Персонаж не знайдено.' },
  party_not_found: { status: 404, messageUk: 'Паті не знайдено.' },
  party_not_member: { status: 400, messageUk: 'Ти не в паті.' },
  party_already_member: {
    status: 400,
    messageUk: 'Ти вже в паті.',
  },
  party_full: { status: 400, messageUk: 'Паті заповнене' },
  party_forbidden: {
    status: 403,
    messageUk: 'Недостатньо прав для цієї дії в паті.',
  },
  party_invite_leader_only: {
    status: 403,
    messageUk: 'Запрошувати може лише лідер.',
  },
  party_target_in_party: {
    status: 400,
    messageUk: 'Цей гравець уже в паті.',
  },
  party_invite_target_required: {
    status: 400,
    messageUk: 'Потрібен targetCharacterId.',
  },
  party_invite_target_not_found: {
    status: 404,
    messageUk: 'Персонаж не знайдено.',
  },
  party_invite_self: {
    status: 400,
    messageUk: 'Не можна запросити себе.',
  },
  party_invite_exists: {
    status: 400,
    messageUk: 'Запрошення вже надіслано',
  },
  party_invite_id_required: {
    status: 400,
    messageUk: 'Потрібен inviteId.',
  },
  party_invite_not_found: {
    status: 404,
    messageUk: 'Запрошення не знайдено.',
  },
  party_invite_expired: {
    status: 400,
    messageUk: 'Термін запрошення минув.',
  },
  party_kick_target_required: {
    status: 400,
    messageUk: 'Потрібен targetCharacterId.',
  },
  party_kick_self: {
    status: 400,
    messageUk: 'Не можна виключити себе — скористайся «Вийти».',
  },
  party_kick_not_member: {
    status: 400,
    messageUk: 'Цей гравець не в твоєму паті.',
  },
  invalid_input: {
    status: 400,
    messageUk: 'Некоректні дані.',
  },
};

export function sendPartyRouteError(
  reply: FastifyReply,
  err: unknown
): FastifyReply | null {
  if (!(err instanceof Error)) return null;
  const mapped = PARTY_ERRORS[err.message];
  if (!mapped) return null;
  return reply.code(mapped.status).send({
    error: err.message,
    messageUk: mapped.messageUk,
  });
}

export function parseExpectedPartyVersion(
  body: Record<string, unknown>,
  reply: FastifyReply,
  messageUk = 'Некоректний expectedPartyVersion.'
): number | null {
  const pv = body.expectedPartyVersion;
  if (typeof pv !== 'number' || !Number.isInteger(pv) || pv < 1) {
    reply.code(400).send({ error: 'invalid_input', messageUk });
    return null;
  }
  return pv;
}

export async function logPartyRouteMutation(
  request: {
    userId?: string;
    log: { info: (obj: object, msg?: string) => void };
  },
  action: string,
  expectedPartyVersion: number | null,
  result: 'ok' | 'conflict' | 'error',
  actualPartyVersion?: number | null,
  partyId?: string | null,
  characterId?: string | null
): Promise<void> {
  request.log.info(
    {
      action,
      characterId: characterId ?? null,
      partyId: partyId ?? null,
      expectedPartyVersion,
      actualPartyVersion: actualPartyVersion ?? null,
      result,
    },
    'party-mutation'
  );
}
