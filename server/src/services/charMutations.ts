import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  parseInventory,
  equipFromBag,
  unequipSlot,
} from '../data/inventory.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import {
  gameConflictFromMutation,
} from './charConflict.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyCharacterReadView } from './charReadView.js';


function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function movementFieldsChanged(a: CharacterRow, b: CharacterRow): boolean {
  return (
    a.worldX !== b.worldX ||
    a.worldY !== b.worldY ||
    a.targetX !== b.targetX ||
    a.targetY !== b.targetY ||
    (a.moveStartAt?.getTime() ?? 0) !== (b.moveStartAt?.getTime() ?? 0) ||
    a.moveFromX !== b.moveFromX ||
    a.moveFromY !== b.moveFromY
  );
}

/**
 * Зберегти режим героя / Zealot у БД (як cs1.php $heroic / $zealot). Оновлює revision.
 */
export async function applyPersistedCombatBuffs(
  userId: string,
  expectedRevision: number,
  buffHeroicTier: number | null,
  buffZealotStacks: number | null
): Promise<CharacterSnapshot> {
  if (
    buffHeroicTier != null &&
    buffHeroicTier !== 1 &&
    buffHeroicTier !== 2 &&
    buffHeroicTier !== 3
  ) {
    throw new Error('invalid_heroic_tier');
  }
  if (
    buffZealotStacks != null &&
    (!Number.isInteger(buffZealotStacks) ||
      buffZealotStacks < 1 ||
      buffZealotStacks > 3)
  ) {
    throw new Error('invalid_zealot_stacks');
  }

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          base.buffHeroicTier !== buffHeroicTier ||
          base.buffZealotStacks !== buffZealotStacks;
        if (!changed) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            buffHeroicTier,
            buffZealotStacks,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}

export async function getSnapshotForUser(
  userId: string
): Promise<CharacterSnapshot | null> {
  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;
  return toSnapshot(applyCharacterReadView(row as CharacterRow));
}

export async function applyEquipFromBag(
  userId: string,
  itemId: number,
  expectedRevision: number,
  enchant: number = 0
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = equipFromBag(inv, itemId, enchant);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          JSON.stringify(nextInv) !== JSON.stringify(inv);
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}

export async function applyUnequip(
  userId: string,
  slot: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = unequipSlot(inv, slot);
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          JSON.stringify(nextInv) !== JSON.stringify(inv);
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}

