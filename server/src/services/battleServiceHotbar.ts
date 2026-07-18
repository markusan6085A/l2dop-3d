import { Prisma } from '@prisma/client';
import {
  parseBattleHotbarSlots,
  type BattleHotbarSlot,
} from '../domain/battleHotbar.js';
import { prisma } from '../lib/prisma.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';

/**
 * UI-розкладка хотбару: write без Character.revision++ (last-write-wins).
 * Не чіпає battleJson, revision, battleVersion, lastLogSeq.
 */
export async function saveBattleHotbar(
  userId: string,
  characterId: string,
  slotsRaw: unknown
): Promise<(BattleHotbarSlot | null)[]> {
  const slots = parseBattleHotbarSlots(slotsRaw);
  if (slots === null) {
    throw new Error('hotbar_invalid');
  }
  const cid = String(characterId || '').trim();
  if (!cid) throw new Error('hotbar_no_character');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId, id: cid },
      select: { id: true, battleHotbarJson: true },
    });
    if (!char) throw new Error('no_character');

    const existing = parseBattleHotbarSlots(char.battleHotbarJson);
    if (JSON.stringify(existing) === JSON.stringify(slots)) return;

    await persistCharacterFieldsInTx(tx, char.id, {
      battleHotbarJson: JSON.parse(
        JSON.stringify(slots)
      ) as Prisma.InputJsonValue,
    });
  });

  return slots;
}
