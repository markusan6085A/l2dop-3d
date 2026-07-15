import type { FastifyReply } from 'fastify';

const QUEST_ERRORS: Readonly<
  Record<string, { status: number; messageUk: string }>
> = {
  profession_quest_not_accepted: {
    status: 400,
    messageUk: 'Спочатку візьми квест на професію у магістра.',
  },
  profession_quest_wrong_target: {
    status: 400,
    messageUk:
      'Квест активний для іншої професії. Заверши або обери ту саму гілку.',
  },
  profession_quest_kills_incomplete: {
    status: 400,
    messageUk: 'Ще не виконано всі вимоги квесту (моби).',
  },
  profession_quest_items_missing: {
    status: 400,
    messageUk: 'Недостатньо Шкур звіра (Animal Skin) в інвентарі.',
  },
  profession_quest_unknown_slug: {
    status: 400,
    messageUk: 'Невідома професія для квесту.',
  },
};

export function sendProfessionQuestError(
  reply: FastifyReply,
  err: unknown
): boolean {
  const msg = err instanceof Error ? err.message : '';
  const row = QUEST_ERRORS[msg];
  if (!row) return false;
  void reply.code(row.status).send({ error: msg, messageUk: row.messageUk });
  return true;
}

export function mapProfessionFirstJobQuestError(
  request: { log: { error: (obj: object, msg: string) => void } },
  reply: FastifyReply,
  err: unknown,
  logLabel: string
): boolean {
  if (sendProfessionQuestError(reply, err)) return true;
  const msg = err instanceof Error ? err.message : '';
  if (msg === 'profession_wrong_branch') {
    void reply.code(400).send({
      error: msg,
      messageUk: 'Це доступно лише для людини-воїна (Fighter).',
    });
    return true;
  }
  if (msg === 'profession_already_advanced') {
    void reply.code(400).send({
      error: msg,
      messageUk: 'Профа вже змінена.',
    });
    return true;
  }
  if (msg === 'profession_requires_level') {
    void reply.code(400).send({
      error: msg,
      messageUk: 'Потрібен щонайменше 20 рівень.',
    });
    return true;
  }
  if (msg === 'no_character') {
    void reply.code(404).send({ error: 'forbidden' });
    return true;
  }
  request.log.error({ err }, logLabel);
  void reply.code(500).send({
    error: 'internal_error',
    messageUk: 'Не вдалося виконати дію.',
  });
  return true;
}

export function mapProfessionChangeQuestError(
  reply: FastifyReply,
  err: unknown
): boolean {
  return sendProfessionQuestError(reply, err);
}
