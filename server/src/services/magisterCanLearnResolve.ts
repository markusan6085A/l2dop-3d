/** Розв'язання canLearn і тексту блокування для GET /character/magister. */
export function resolveMagisterCanLearn(args: {
  learnedMax: boolean;
  effLevel: number;
  minForNext: number;
  meetsBase: boolean;
  meetsProfRank: boolean;
  spNow: number;
  spNext: number;
}): { canLearn: boolean; blockReasonUk: string | null } {
  if (args.learnedMax) {
    return { canLearn: false, blockReasonUk: 'Максимальний ранг скіла.' };
  }
  if (args.effLevel < args.minForNext) {
    return {
      canLearn: false,
      blockReasonUk: `Потрібен рівень персонажа ${args.minForNext}.`,
    };
  }
  if (!args.meetsBase) {
    return {
      canLearn: false,
      blockReasonUk: `Потрібен рівень персонажа ${args.minForNext}.`,
    };
  }
  if (!args.meetsProfRank) {
    return {
      canLearn: false,
      blockReasonUk:
        'Цей ранг доступний після зміни професії (або на попередній профі).',
    };
  }
  if (args.spNow < args.spNext) {
    return {
      canLearn: false,
      blockReasonUk: `Недостатньо SP (потрібно ${args.spNext}, є ${Math.max(0, Math.floor(args.spNow))}).`,
    };
  }
  return { canLearn: true, blockReasonUk: null };
}
