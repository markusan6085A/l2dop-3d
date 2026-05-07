import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  parseInventory,
  needsStarterKitMigration,
  migrateInventoryToSk2,
  equipFromBag,
  unequipSlot,
} from '../data/inventory.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { GameConflictError } from './charErrors.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import {
  ensureMysticStarterSkillsRow,
  ensureSanitizedSkillsLearnedRow,
} from './charSkillsSanitize.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';

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
    if (char.revision !== expectedRevision) throw new GameConflictError();

    const updated = await tx.character.updateMany({
      where: { id: char.id, userId, revision: expectedRevision },
      data: {
        buffHeroicTier,
        buffZealotStacks,
        revision: { increment: 1 },
      },
    });
    if (updated.count === 0) throw new GameConflictError();

    const row = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(row as CharacterRow);
  });
}

export async function getSnapshotForUser(
  userId: string
): Promise<CharacterSnapshot | null> {
  let row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) return null;

  let inv = parseInventory((row as CharacterRow).inventoryJson);
  if (needsStarterKitMigration(inv)) {
    inv = migrateInventoryToSk2(inv);
    const upd = {
      inventoryJson: inv as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
    } as unknown as Prisma.CharacterUncheckedUpdateInput;
    row = await prisma.character.update({
      where: { id: row.id },
      data: upd,
    });
  }

  row = await ensureSanitizedSkillsLearnedRow(row as CharacterRow);
  row = await ensureMysticStarterSkillsRow(row as CharacterRow);

  row = await applyPassiveHpRegen(row as CharacterRow);
  row = (await resolveMapMovement(
    row as CharacterRow
  )) as CharacterRow;
  return toSnapshot(row as CharacterRow);
}

export async function applyEquipFromBag(
  userId: string,
  itemId: number,
  expectedRevision: number,
  enchant: number = 0
): Promise<CharacterSnapshot> {
  let pre = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!pre) throw new Error('no_character');
  pre = await applyPassiveHpRegen(pre as CharacterRow);
  pre = (await resolveMapMovement(pre as CharacterRow)) as CharacterRow;

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }
    const inv = parseInventory((char as CharacterRow).inventoryJson);
    const next = equipFromBag(inv, itemId, enchant);
    const updMany = {
      inventoryJson: next as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
    } as unknown as Prisma.CharacterUncheckedUpdateManyInput;
    const updated = await tx.character.updateMany({
      where: { id: char.id, userId, revision: expectedRevision },
      data: updMany,
    });
    if (updated.count === 0) throw new GameConflictError();
    const row = await tx.character.findUniqueOrThrow({ where: { id: char.id } });
    return toSnapshot(row as CharacterRow);
  });
}

export async function applyUnequip(
  userId: string,
  slot: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  let pre = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!pre) throw new Error('no_character');
  pre = await applyPassiveHpRegen(pre as CharacterRow);
  pre = (await resolveMapMovement(pre as CharacterRow)) as CharacterRow;

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }
    const inv = parseInventory((char as CharacterRow).inventoryJson);
    const next = unequipSlot(inv, slot);
    const updMany = {
      inventoryJson: next as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
    } as unknown as Prisma.CharacterUncheckedUpdateManyInput;
    const updated = await tx.character.updateMany({
      where: { id: char.id, userId, revision: expectedRevision },
      data: updMany,
    });
    if (updated.count === 0) throw new GameConflictError();
    const row = await tx.character.findUniqueOrThrow({ where: { id: char.id } });
    return toSnapshot(row as CharacterRow);
  });
}

