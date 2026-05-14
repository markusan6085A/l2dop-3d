import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen, type CharacterRow } from './charService.js';
import { prisma } from '../lib/prisma.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export async function applyPassiveAndMove(
  row: CharacterRow
): Promise<CharacterRow> {
  return prisma.$transaction(async (tx) => {
    const result = await mutateCharacterWithRevision(
      tx,
      row.id,
      null,
      (character) => {
        const before = character as CharacterRow;
        const afterRegen = applyPassiveHpRegen(before);
        const afterMove = resolveMapMovement(afterRegen);
        const changed =
          afterMove.hp !== before.hp ||
          afterMove.worldX !== before.worldX ||
          afterMove.worldY !== before.worldY ||
          afterMove.targetX !== before.targetX ||
          afterMove.targetY !== before.targetY ||
          (afterMove.moveStartAt?.getTime() ?? 0) !==
            (before.moveStartAt?.getTime() ?? 0) ||
          afterMove.moveFromX !== before.moveFromX ||
          afterMove.moveFromY !== before.moveFromY;
        if (!changed) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            hp: afterMove.hp,
            worldX: afterMove.worldX,
            worldY: afterMove.worldY,
            targetX: afterMove.targetX,
            targetY: afterMove.targetY,
            moveStartAt: afterMove.moveStartAt,
            moveFromX: afterMove.moveFromX,
            moveFromY: afterMove.moveFromY,
          },
        };
      }
    );
    if (!result.ok) {
      throw new Error('passive_move_conflict');
    }
    return result.character as CharacterRow;
  });
}
