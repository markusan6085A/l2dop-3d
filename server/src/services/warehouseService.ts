import { Prisma } from '@prisma/client';
import { parseInventory } from '../data/inventory.js';
import type { BagStack } from '../data/inventory.js';
import {
  depositBagToWarehouse,
  parseWarehouse,
  withdrawWarehouseToBag,
} from '../data/warehouse.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { prisma } from '../lib/prisma.js';
import { gameConflictFromMutation } from './charConflict.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

export interface WarehouseTransferInput {
  itemId: number;
  enchant: number;
  /** Якщо не вказано — весь стек. */
  qty?: number;
}

function resolveQty(
  stacks: BagStack[],
  itemId: number,
  enchant: number,
  qty: number | undefined
): number {
  const e = normEnchant(enchant);
  const row = stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (!row) throw new Error('item_not_found');
  const have = Math.floor(Number(row.qty));
  if (!Number.isFinite(have) || have <= 0) throw new Error('item_not_found');
  if (qty == null) return have;
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q) || q <= 0 || q > have) throw new Error('invalid_qty');
  return q;
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, n));
}

async function transferWarehouse(
  userId: string,
  expectedRevision: number,
  mode: 'withdraw' | 'deposit',
  input: WarehouseTransferInput
): Promise<CharacterSnapshot> {
  const itemId = Math.floor(Number(input.itemId));
  if (!Number.isFinite(itemId) || itemId <= 0) throw new Error('invalid_item');
  const enchant = normEnchant(input.enchant);

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
        const wh = parseWarehouse(base.warehouseJson);
        const qty =
          mode === 'withdraw'
            ? resolveQty(wh.stacks, itemId, enchant, input.qty)
            : resolveQty(inv.stacks, itemId, enchant, input.qty);

        const moved =
          mode === 'withdraw'
            ? withdrawWarehouseToBag(wh, inv, itemId, enchant, qty)
            : depositBagToWarehouse(wh, inv, itemId, enchant, qty);

        const invChanged =
          JSON.stringify(moved.inventory) !== JSON.stringify(inv);
        const whChanged =
          JSON.stringify(moved.warehouse) !== JSON.stringify(wh);
        if (!invChanged && !whChanged) return { changed: false };

        return {
          changed: true,
          data: {
            inventoryJson: moved.inventory as unknown as Prisma.InputJsonValue,
            warehouseJson: moved.warehouse as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return buildCharacterClientSnapshot(result.character as CharacterRow, userId);
  });
}

export function applyWarehouseWithdraw(
  userId: string,
  expectedRevision: number,
  input: WarehouseTransferInput
): Promise<CharacterSnapshot> {
  return transferWarehouse(userId, expectedRevision, 'withdraw', input);
}

export function applyWarehouseDeposit(
  userId: string,
  expectedRevision: number,
  input: WarehouseTransferInput
): Promise<CharacterSnapshot> {
  return transferWarehouse(userId, expectedRevision, 'deposit', input);
}
