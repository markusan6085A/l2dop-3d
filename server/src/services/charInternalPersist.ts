import type { Prisma } from '@prisma/client';

/**
 * Внутрішній server-side write без revision++.
 * Для дзеркалення PvP (HP жертви, battleJson flags) під час активного бою атакуючого.
 * Не для видимих дій гравця — перемога/поразка жертви йде через mutateCharacterWithRevision.
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
