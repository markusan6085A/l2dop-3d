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
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { ClientSnapshotEnrichOpts } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { applyCharacterReadView } from './charReadView.js';
import { ensureInventoryReadPatchesRow } from './charInventorySanitize.js';
import { ensureWorldCombatViciousStanceReadRepairRow } from './charWorldCombatSanitize.js';
import { clampCharacterVitalsForInventoryChange } from '../domain/clampCharacterVitalsForEquipment.js';
import { resolveClanHallBonusInTx } from './characterClanHallVitals.js';

function equipInventoryPatch(
  base: CharacterRow,
  current: CharacterRow,
  nextInv: ReturnType<typeof parseInventory>,
  vitalsPatch: ReturnType<typeof clampCharacterVitalsForInventoryChange>
): { changed: boolean; data?: Record<string, unknown> } {
  const inv = parseInventory(base.inventoryJson);
  const changed =
    vitalsPatch.hp !== current.hp ||
    vitalsPatch.maxHp !== current.maxHp ||
    base.hp !== current.hp ||
    movementFieldsChanged(current, base) ||
    JSON.stringify(nextInv) !== JSON.stringify(inv) ||
    vitalsPatch.worldCombatStateJson !== undefined ||
    vitalsPatch.battleJson !== undefined;
  if (!changed) return { changed: false };
  return {
    changed: true,
    data: {
      hp: vitalsPatch.hp,
      maxHp: vitalsPatch.maxHp,
      worldX: base.worldX,
      worldY: base.worldY,
      targetX: base.targetX,
      targetY: base.targetY,
      moveStartAt: base.moveStartAt,
      moveFromX: base.moveFromX,
      moveFromY: base.moveFromY,
      inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
      ...(vitalsPatch.worldCombatStateJson !== undefined
        ? { worldCombatStateJson: vitalsPatch.worldCombatStateJson }
        : {}),
      ...(vitalsPatch.battleJson !== undefined
        ? { battleJson: vitalsPatch.battleJson }
        : {}),
    },
  };
}


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
  userId: string,
  opts?: { claimWorldSession?: boolean }
): Promise<CharacterSnapshot | null> {
  if (opts?.claimWorldSession) {
    return prisma.$transaction(async (trx) => {
      const char = (await trx.character.findFirst({
        where: { userId },
        orderBy: { lastUpdate: 'desc' },
        include: { clan: { select: { name: true, hallBlessingAt: true, level: true, emblemId: true } } },
      })) as CharacterRow | null;
      if (!char) return null;

      let row = char;
      if (row.dungeonStateJson != null) {
        const updated = (await trx.character.update({
          where: { id: row.id },
          data: {
            dungeonStateJson: Prisma.JsonNull,
            revision: { increment: 1 },
          },
        })) as CharacterRow;
        row = row.clan ? { ...updated, clan: row.clan } : updated;
      }

      const sanitized = await ensureWorldCombatViciousStanceReadRepairRow(
        await ensureInventoryReadPatchesRow(row)
      );
      return buildCharacterClientSnapshot(applyCharacterReadView(sanitized), userId);
    });
  }

  const row = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    include: { clan: { select: { name: true, hallBlessingAt: true, level: true, emblemId: true } } },
  });
  if (!row) return null;
  const sanitized = await ensureWorldCombatViciousStanceReadRepairRow(
    await ensureInventoryReadPatchesRow(row as CharacterRow)
  );
  return buildCharacterClientSnapshot(applyCharacterReadView(sanitized), userId);
}

export async function applyEquipFromBag(
  userId: string,
  itemId: number,
  expectedRevision: number,
  enchant: number = 0,
  snapshotOpts?: ClientSnapshotEnrichOpts
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      include: {
        clan: {
          select: { name: true, hallBlessingAt: true, level: true, emblemId: true },
        },
      },
    });
    if (!char) throw new Error('no_character');
    const clanHallBonus = await resolveClanHallBonusInTx(tx, char as CharacterRow);
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = equipFromBag(inv, itemId, enchant);
        const vitalsPatch = clampCharacterVitalsForInventoryChange({
          row: {
            ...base,
            inventoryJson: nextInv as unknown as CharacterRow['inventoryJson'],
          },
          nextInv,
          clanHallBonus,
        });
        return equipInventoryPatch(base, current as CharacterRow, nextInv, vitalsPatch);
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId, undefined, snapshotOpts);
}

export async function applyUnequip(
  userId: string,
  slot: string,
  expectedRevision: number,
  snapshotOpts?: ClientSnapshotEnrichOpts
): Promise<CharacterSnapshot> {
  const row = await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
      include: {
        clan: {
          select: { name: true, hallBlessingAt: true, level: true, emblemId: true },
        },
      },
    });
    if (!char) throw new Error('no_character');
    const clanHallBonus = await resolveClanHallBonusInTx(tx, char as CharacterRow);
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = unequipSlot(inv, slot);
        const vitalsPatch = clampCharacterVitalsForInventoryChange({
          row: {
            ...base,
            inventoryJson: nextInv as unknown as CharacterRow['inventoryJson'],
          },
          nextInv,
          clanHallBonus,
        });
        return equipInventoryPatch(base, current as CharacterRow, nextInv, vitalsPatch);
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId, undefined, snapshotOpts);
}
