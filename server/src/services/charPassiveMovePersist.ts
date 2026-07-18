import type { Prisma } from '@prisma/client';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import type { CharacterRow } from './charTypes.js';
import { prisma } from '../lib/prisma.js';

/** Pure: regen HP + рух по карті без write. */
export function passiveAndMovePatch(
  row: CharacterRow
): Prisma.CharacterUncheckedUpdateInput | null {
  const afterMove = applyPassiveAndMoveToRow(row);
  const changed =
    afterMove.hp !== row.hp ||
    afterMove.worldX !== row.worldX ||
    afterMove.worldY !== row.worldY ||
    afterMove.targetX !== row.targetX ||
    afterMove.targetY !== row.targetY ||
    (afterMove.moveStartAt?.getTime() ?? 0) !== (row.moveStartAt?.getTime() ?? 0) ||
    afterMove.moveFromX !== row.moveFromX ||
    afterMove.moveFromY !== row.moveFromY;
  if (!changed) return null;
  return {
    hp: afterMove.hp,
    worldX: afterMove.worldX,
    worldY: afterMove.worldY,
    targetX: afterMove.targetX,
    targetY: afterMove.targetY,
    moveStartAt: afterMove.moveStartAt,
    moveFromX: afterMove.moveFromX,
    moveFromY: afterMove.moveFromY,
  };
}

/** Pure: regen + interpolated map movement без DB write. */
export function applyPassiveAndMoveToRow(row: CharacterRow): CharacterRow {
  const afterRegen = applyPassiveHpRegen(row);
  return resolveMapMovement(afterRegen);
}

/**
 * Read-path / pre-battle: зберегти regen+рух без revision++ (не ламає expectedRevision).
 */
export async function persistPassiveAndMoveInTx(
  tx: Prisma.TransactionClient,
  row: CharacterRow
): Promise<CharacterRow> {
  const patch = passiveAndMovePatch(row);
  if (!patch) return row;
  return (await tx.character.update({
    where: { id: row.id },
    data: patch,
  })) as CharacterRow;
}

/** Standalone read-path (GET battle, poll). */
export async function applyPassiveAndMove(row: CharacterRow): Promise<CharacterRow> {
  return prisma.$transaction(async (tx) => persistPassiveAndMoveInTx(tx, row));
}
