import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  applyAncientTraderExchange,
  resolveAncientTraderRate,
  type AncientTraderRate,
} from '../domain/ancientTraderExchangeLogic.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';

export async function performAncientTraderExchange(
  userId: string,
  expectedRevision: number,
  stoneRaw: unknown,
  qtyRaw: unknown
): Promise<CharacterSnapshot> {
  const rate = resolveAncientTraderRate(stoneRaw);
  if (!rate) throw new Error('invalid_stone');
  const qty = Math.floor(Number(qtyRaw));
  if (!Number.isFinite(qty) || qty < 1 || qty > 100_000) {
    throw new Error('invalid_quantity');
  }

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw gameConflictFromCharacter(char);
    }
    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        let inv = parseInventory((current as CharacterRow).inventoryJson);
        try {
          inv = applyAncientTraderExchange(inv, rate as AncientTraderRate, qty);
        } catch (e) {
          if (e instanceof Error && e.message === 'insufficient_materials') {
            throw new Error('insufficient_materials');
          }
          throw e;
        }
        return {
          changed: true,
          data: {
            inventoryJson: inv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
