import type { Prisma } from '@prisma/client';

/**
 * Внутрішній server-side write без revision++.
 * Для дзеркалення PvP (HP жертви, battleJson flags) під час активного бою атакуючого
 * і для фонових tick world РБ/епіків (HP гравця, mobHp у battleJson) — клієнт
 * підхоплює через GET /game/battle, а revision++ лише на дії гравця.
 * Не для видимих дій гравця — перемога/поразка йде через mutateCharacterWithRevision.
 * Для фонової статистики (raidBossKills increment) і progress-only dailyQuestsJson
 * (FOR UPDATE + persist тут або в charDailyQuestPersist.ts) — теж без revision++.
 */
export async function persistCharacterFieldsInTx(
  tx: Prisma.TransactionClient,
  characterId: string,
  data: Prisma.CharacterUncheckedUpdateInput
): Promise<void> {
  if (!characterId || Object.keys(data).length === 0) return;
  await tx.character.update({
    where: { id: characterId },
    data,
  });
}
