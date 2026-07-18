import type { Prisma } from '@prisma/client';
import {
  dailyQuestsJsonChanged,
  parseDailyQuestsJson,
  serializeDailyQuestsJson,
  type DailyQuestsJson,
} from '../domain/dailyQuests.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';

export type LockedCharacterDailyQuestRow = {
  id: string;
  dailyQuestsJson: Prisma.JsonValue | null;
  revision: number;
};

/** Row lock для безпечного read-modify-write `dailyQuestsJson` без revision++. */
export async function lockCharacterRowForDailyQuestInTx(
  tx: Prisma.TransactionClient,
  characterId: string
): Promise<LockedCharacterDailyQuestRow | null> {
  const id = String(characterId || '').trim();
  if (!id) return null;
  const rows = await tx.$queryRaw<
    Array<{
      id: string;
      dailyQuestsJson: Prisma.JsonValue | null;
      revision: number;
    }>
  >`
    SELECT id, "dailyQuestsJson", revision
    FROM "Character"
    WHERE id = ${id}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

/**
 * Атомарне оновлення dailyQuestsJson під FOR UPDATE, без Character.revision++.
 * Для progress-only (чат, RB participation, бій); claim з нагородою — окремий flow з revision.
 */
export async function applyDailyQuestsJsonAtomicInTx(
  tx: Prisma.TransactionClient,
  characterId: string,
  nowMs: number,
  apply: (state: DailyQuestsJson) => DailyQuestsJson
): Promise<boolean> {
  const row = await lockCharacterRowForDailyQuestInTx(tx, characterId);
  if (!row) return false;
  const before = parseDailyQuestsJson(row.dailyQuestsJson, nowMs);
  const after = apply(before);
  if (!dailyQuestsJsonChanged(row.dailyQuestsJson, after)) return false;
  await persistCharacterFieldsInTx(tx, characterId, {
    dailyQuestsJson: serializeDailyQuestsJson(
      after
    ) as Prisma.InputJsonValue,
  });
  return true;
}
