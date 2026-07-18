import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import { parseBattleHotbarSlots } from '../domain/battleHotbar.js';
import { prisma } from '../lib/prisma.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { findCharacterForUserInTx } from './charResolveForUser.js';

export async function saveBattleHotbar(
  userId: string,
  expectedRevision: number,
  slotsRaw: unknown,
  opts?: { characterId?: string | null }
): Promise<CharacterSnapshot> {
  const slots = parseBattleHotbarSlots(slotsRaw);
  if (slots === null) {
    throw new Error('hotbar_invalid');
  }

  return prisma.$transaction(async (tx) => {
    const char = await findCharacterForUserInTx(tx, userId, {
      characterId: opts?.characterId,
    });
    if (!char) throw new Error('no_character');

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const row = current as CharacterRow;
        const existing = parseBattleHotbarSlots(row.battleHotbarJson);
        if (JSON.stringify(existing) === JSON.stringify(slots)) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            battleHotbarJson: JSON.parse(
              JSON.stringify(slots)
            ) as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
