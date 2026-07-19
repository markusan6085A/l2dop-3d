import type { FastifyReply } from 'fastify';

const DRAGON_DUNGEON_ERRORS: Record<string, string> = {
  dragon_not_found: 'Такого дракона не існує.',
  dragon_already_unlocked: 'Цей дракон уже відкритий.',
  diamonds_insufficient: 'Недостатньо алмазів.',
  character_not_found: 'Персонажа не знайдено.',
  dragon_unlock_conflict: 'Стан підземелля змінився. Оновіть сторінку.',
};

export function sendDragonDungeonError(
  reply: FastifyReply,
  code: string
): void {
  const messageUk = DRAGON_DUNGEON_ERRORS[code] ?? 'Помилка підземелля драконів.';
  const status =
    code === 'dragon_not_found' || code === 'character_not_found'
      ? 404
      : code === 'dragon_unlock_conflict'
        ? 409
        : 400;
  reply.code(status).send({ error: code, messageUk });
}

export function mapDragonDungeonUnlockError(
  err: unknown,
  reply: FastifyReply
): boolean {
  if (!(err instanceof Error)) return false;
  const code = err.message;
  if (!DRAGON_DUNGEON_ERRORS[code]) return false;
  sendDragonDungeonError(reply, code);
  return true;
}
