import type { FastifyReply } from 'fastify';

const CLAN_TASK_ERRORS: Record<
  string,
  { status: number; error: string; messageUk: string }
> = {
  clan_required: {
    status: 403,
    error: 'clan_required',
    messageUk: 'Для виконання кланових завдань потрібен клан.',
  },
  clan_task_not_found: {
    status: 404,
    error: 'clan_task_not_found',
    messageUk: 'Такого кланового завдання не існує.',
  },
  clan_task_participant_busy: {
    status: 409,
    error: 'clan_task_participant_busy',
    messageUk: 'Ви вже виконуєте інше кланове завдання.',
  },
  clan_task_take_conflict: {
    status: 409,
    error: 'clan_task_take_conflict',
    messageUk: 'Завдання вже змінилося. Оновіть сторінку.',
  },
  clan_task_helper_exists: {
    status: 409,
    error: 'clan_task_helper_exists',
    messageUk: 'Цьому гравцю вже допомагає інший учасник.',
  },
  clan_task_cannot_help_self: {
    status: 400,
    error: 'clan_task_cannot_help_self',
    messageUk: 'Не можна допомагати самому собі.',
  },
  clan_task_other_clan: {
    status: 403,
    error: 'clan_task_other_clan',
    messageUk: 'Це завдання належить іншому клану.',
  },
  clan_task_claim_forbidden: {
    status: 403,
    error: 'clan_task_claim_forbidden',
    messageUk: 'Завершити завдання можуть лише учасники.',
  },
  clan_task_not_ready: {
    status: 400,
    error: 'clan_task_not_ready',
    messageUk: 'Завдання ще не виконано.',
  },
  clan_task_claim_conflict: {
    status: 409,
    error: 'clan_task_claim_conflict',
    messageUk: 'Завдання вже змінилося. Оновіть сторінку.',
  },
  clan_task_cancel_forbidden: {
    status: 403,
    error: 'clan_task_cancel_forbidden',
    messageUk: 'Скасувати завдання може лише власник.',
  },
  clan_task_cancel_conflict: {
    status: 409,
    error: 'clan_task_cancel_conflict',
    messageUk: 'Завдання вже змінилося. Оновіть сторінку.',
  },
  character_not_found: {
    status: 404,
    error: 'character_not_found',
    messageUk: 'Персонаж не знайдений.',
  },
};

export function sendClanTaskError(
  reply: FastifyReply,
  code: string
): boolean {
  const mapped = CLAN_TASK_ERRORS[code];
  if (!mapped) return false;
  reply.code(mapped.status).send({
    error: mapped.error,
    messageUk: mapped.messageUk,
  });
  return true;
}

export function mapClanTaskMutationError(
  err: unknown,
  reply: FastifyReply
): boolean {
  if (!(err instanceof Error)) return false;
  return sendClanTaskError(reply, err.message);
}
