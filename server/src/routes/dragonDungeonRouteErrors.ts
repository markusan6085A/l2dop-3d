import type { FastifyReply } from 'fastify';

const DRAGON_DUNGEON_ERRORS: Record<string, string> = {
  dragon_not_found: 'Такого дракона не існує.',
  dragon_already_active: 'Ваш клан уже б’ється з іншим драконом.',
  dragon_unlock_conflict: 'Стан підземелля змінився. Оновіть сторінку.',
  clan_required: 'Для входу потрібен клан.',
  clan_leader_required: 'Відкрити дракона може лише глава клану.',
  clan_diamonds_insufficient: 'У клану недостатньо алмазів.',
  character_not_found: 'Персонажа не знайдено.',
  dragon_dungeon_forbidden: 'Немає доступу до цього підземелля.',
  dragon_not_active: 'Дракон уже переможений або час битви завершився.',
  dragon_entry_cooldown: 'Ще не можна увійти — діє кулдаун.',
  dragon_battle_not_active: 'Немає активної спроби бою.',
  dragon_battle_expired: 'Час спроби завершено.',
  dragon_battle_stunned: 'Ви оглушені — зачекайте.',
  dragon_battle_player_dead: 'Ви загинули в бою з драконом.',
  dragon_battle_conflict: 'Стан бою змінився. Оновіть сторінку.',
  battle_incompatible: 'Спочатку завершіть інший бій.',
};

export function sendDragonDungeonError(
  reply: FastifyReply,
  code: string
): void {
  const messageUk = DRAGON_DUNGEON_ERRORS[code] ?? 'Помилка підземелля драконів.';
  const status =
    code === 'dragon_not_found' || code === 'character_not_found'
      ? 404
      : code === 'dragon_unlock_conflict' || code === 'dragon_battle_conflict'
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

export function mapDragonDungeonError(
  err: unknown,
  reply: FastifyReply
): boolean {
  return mapDragonDungeonUnlockError(err, reply);
}
