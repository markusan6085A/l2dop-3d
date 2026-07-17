import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  getMammonMerchantShopCategories,
  resolveMammonMerchantShopOfferRow,
} from '../data/mammonMerchantShopCatalog.js';
import { applyMammonMerchantShopBuy } from '../domain/mammonMerchantBuyLogic.js';
import { isWithinMapNearbyHeroRadius } from '../domain/mapNearbyRadius.js';
import {
  gameConflictFromCharacter,
  gameConflictFromMutation,
  buildCharacterClientSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { getMammonMerchantState } from './mammonMerchantService.js';

export function getMammonMerchantShopCatalog(): {
  categories: ReturnType<typeof getMammonMerchantShopCategories>;
} {
  return { categories: getMammonMerchantShopCategories() };
}

function assertNearMammonMerchant(row: CharacterRow): void {
  const merchant = getMammonMerchantState();
  const cur = merchant.current;
  if (
    !isWithinMapNearbyHeroRadius(row.worldX, row.worldY, cur.worldX, cur.worldY)
  ) {
    throw new Error('mammon_merchant_not_nearby');
  }
}

export async function performMammonMerchantBuy(
  userId: string,
  expectedRevision: number,
  categoryRaw: unknown,
  itemKeyRaw: unknown,
  qtyRaw: unknown
): Promise<CharacterSnapshot> {
  const offer = resolveMammonMerchantShopOfferRow(categoryRaw, itemKeyRaw);
  if (!offer) throw new Error('invalid_shop_item');
  const qty = Math.floor(Number(qtyRaw));
  if (!Number.isFinite(qty) || qty < 1 || qty > 100_000) {
    throw new Error('invalid_quantity');
  }

  const row = await prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw gameConflictFromCharacter(char);
    }
    assertNearMammonMerchant(char);

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        let inv = parseInventory((current as CharacterRow).inventoryJson);
        try {
          inv = applyMammonMerchantShopBuy(inv, offer, qty);
        } catch (e) {
          if (
            e instanceof Error &&
            e.message === 'insufficient_ancient_adena'
          ) {
            throw new Error('insufficient_ancient_adena');
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
    return result.character as CharacterRow;
  });
  return buildCharacterClientSnapshot(row, userId);
}

/** @deprecated alias */
export const performMammonGemstoneBuy = performMammonMerchantBuy;
