import type { Prisma } from '@prisma/client';
import {
  applyDailyQuestRaidBossParticipation,
  dailyQuestsJsonChanged,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
} from '../domain/dailyQuests.js';
import { applyDailyQuestsJsonAtomicInTx } from './charDailyQuestPersist.js';
import type { CharacterRow } from './charTypes.js';

type Tx = Prisma.TransactionClient;

export function mergeDailyQuestsJsonPatch(
  char: CharacterRow,
  nextDaily: ReturnType<typeof parseDailyQuestsJson>,
  nowMs: number
): Prisma.InputJsonValue | undefined {
  void nowMs;
  const merged = serializeDailyQuestsJson(nextDaily);
  if (!dailyQuestsJsonChanged(char.dailyQuestsJson, merged)) return undefined;
  return merged as unknown as Prisma.InputJsonValue;
}

export async function creditDailyQuestRaidBossParticipationInTx(
  tx: Tx,
  characterId: string,
  nowMs: number
): Promise<void> {
  await applyDailyQuestsJsonAtomicInTx(tx, characterId, nowMs, (before) =>
    applyDailyQuestRaidBossParticipation(before, nowMs)
  );
}
