import type { Prisma } from '@prisma/client';
import {
  applyDailyQuestRaidBossParticipation,
  dailyQuestsJsonChanged,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
} from '../domain/dailyQuests.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
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
  const row = await tx.character.findUnique({ where: { id: characterId } });
  if (!row) return;
  const before = parseDailyQuestsJson(row.dailyQuestsJson, nowMs);
  const after = applyDailyQuestRaidBossParticipation(before, nowMs);
  if (!dailyQuestsJsonChanged(row.dailyQuestsJson, after)) return;
  await mutateCharacterWithRevision(tx, characterId, null, () => ({
    changed: true,
    data: {
      dailyQuestsJson: serializeDailyQuestsJson(
        after
      ) as unknown as Prisma.InputJsonValue,
    },
  }));
}
