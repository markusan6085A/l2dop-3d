import type { FastifyReply, FastifyRequest } from 'fastify';

const DAILY_QUEST_ERROR_UK: Record<string, string> = {
  daily_quest_invalid_id: 'Невідоме щоденне завдання.',
  daily_quest_not_done: 'Завдання ще не виконано.',
  daily_quest_already_claimed: 'Нагороду вже отримано.',
};

export function mapDailyQuestClaimError(
  request: FastifyRequest,
  reply: FastifyReply,
  err: unknown,
  routeTag: string
): boolean {
  const msg = err instanceof Error ? err.message : '';
  const messageUk = DAILY_QUEST_ERROR_UK[msg];
  if (!messageUk) return false;
  request.log.info({ route: routeTag, error: msg });
  reply.code(400).send({ error: msg, messageUk });
  return true;
}
