import { Prisma } from '@prisma/client';
import {
  parseInventory,
  removeEnchantedFromBag,
  addEnchantedToBag,
  type BagStack,
} from '../data/inventory.js';
import { prisma } from '../lib/prisma.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { gameConflictFromMutation } from './charConflict.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import { COIN_OF_LUCK_ITEM_ID } from '../domain/dailyQuestRewards.js';

export interface MarketListingView {
  id: string;
  sellerName: string;
  itemId: number;
  qty: number;
  enchant: number;
  priceAdena: string;
  priceCoinOfLuck: number;
  createdAt: string;
}

export interface CreateMarketListingInput {
  itemId: number;
  enchant: number;
  qty?: number;
  priceAdena: bigint;
  priceCoinOfLuck: number;
}

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function normEnchant(e: unknown): number {
  if (e == null) return 0;
  const n = Math.floor(Number(e));
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(20, n));
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
  if (!row) throw new Error('not_in_bag');
  const have = Math.floor(Number(row.qty));
  if (!Number.isFinite(have) || have <= 0) throw new Error('not_in_bag');
  if (qty == null) return have;
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q) || q <= 0 || q > have) throw new Error('invalid_qty');
  return q;
}

function listingToView(row: {
  id: string;
  sellerName: string;
  itemId: number;
  qty: number;
  enchant: number;
  priceAdena: bigint;
  priceCoinOfLuck: number;
  createdAt: Date;
}): MarketListingView {
  return {
    id: row.id,
    sellerName: row.sellerName,
    itemId: row.itemId,
    qty: row.qty,
    enchant: row.enchant,
    priceAdena: row.priceAdena.toString(),
    priceCoinOfLuck: row.priceCoinOfLuck,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listActiveMarketListings(): Promise<MarketListingView[]> {
  const rows = await prisma.marketListing.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  return rows.map(listingToView);
}

export async function listCoinOfLuckListings(): Promise<MarketListingView[]> {
  const rows = await prisma.marketListing.findMany({
    where: {
      itemId: COIN_OF_LUCK_ITEM_ID,
      priceAdena: { gt: 0n },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return rows.map(listingToView);
}

export async function listMyMarketListings(
  userId: string
): Promise<MarketListingView[]> {
  const char = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    select: { id: true },
  });
  if (!char) return [];

  const rows = await prisma.marketListing.findMany({
    where: { sellerCharacterId: char.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return rows.map(listingToView);
}

export async function cancelMarketListing(
  userId: string,
  expectedRevision: number,
  listingId: string
): Promise<{ character: CharacterSnapshot }> {
  const id = String(listingId || '').trim();
  if (!id) throw new Error('listing_not_found');

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');

    const listing = await tx.marketListing.findUnique({
      where: { id },
    });
    if (!listing) throw new Error('listing_not_found');
    if (listing.sellerCharacterId !== char.id) {
      throw new Error('not_your_listing');
    }

    const deleted = await tx.marketListing.deleteMany({
      where: {
        id,
        sellerCharacterId: char.id,
        qty: listing.qty,
      },
    });
    if (deleted.count !== 1) throw new Error('listing_not_found');

    const returnQty = listing.qty;
    const returnItemId = listing.itemId;
    const returnEnchant = listing.enchant;

    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const nextInv = addEnchantedToBag(
          inv,
          returnItemId,
          returnQty,
          returnEnchant
        );
        return {
          changed: true,
          data: {
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    return { character: toSnapshot(result.character as CharacterRow) };
  });
}

function bagQty(stacks: BagStack[], itemId: number, enchant: number): number {
  const e = normEnchant(enchant);
  const row = stacks.find(
    (s) => s.itemId === itemId && normEnchant(s.enchant) === e
  );
  if (!row) return 0;
  const q = Math.floor(Number(row.qty));
  return Number.isFinite(q) && q > 0 ? q : 0;
}

function movementDataPatch(
  base: CharacterRow,
  current: CharacterRow
): Prisma.CharacterUpdateManyMutationInput {
  const patch: Prisma.CharacterUpdateManyMutationInput = {};
  if (base.hp !== current.hp) patch.hp = base.hp;
  if (base.worldX !== current.worldX) patch.worldX = base.worldX;
  if (base.worldY !== current.worldY) patch.worldY = base.worldY;
  if (base.targetX !== current.targetX) patch.targetX = base.targetX;
  if (base.targetY !== current.targetY) patch.targetY = base.targetY;
  if (
    (base.moveStartAt?.getTime() ?? 0) !==
    (current.moveStartAt?.getTime() ?? 0)
  ) {
    patch.moveStartAt = base.moveStartAt;
  }
  if (base.moveFromX !== current.moveFromX) patch.moveFromX = base.moveFromX;
  if (base.moveFromY !== current.moveFromY) patch.moveFromY = base.moveFromY;
  return patch;
}

function hasMovementPatch(
  patch: Prisma.CharacterUpdateManyMutationInput
): boolean {
  return Object.keys(patch).length > 0;
}

function resolveBuyQty(requested: number | undefined, listingQty: number): number {
  const max = Math.floor(listingQty);
  if (!Number.isFinite(max) || max <= 0) throw new Error('listing_not_found');
  if (requested == null) return max;
  const q = Math.floor(Number(requested));
  if (!Number.isFinite(q) || q <= 0 || q > max) throw new Error('invalid_qty');
  return q;
}

async function claimListingQty(
  tx: Prisma.TransactionClient,
  listingId: string,
  buyQty: number,
  listingQty: number
): Promise<void> {
  if (buyQty >= listingQty) {
    const deleted = await tx.marketListing.deleteMany({
      where: { id: listingId, qty: listingQty },
    });
    if (deleted.count !== 1) throw new Error('listing_not_found');
    return;
  }
  const updated = await tx.marketListing.updateMany({
    where: { id: listingId, qty: { gte: buyQty } },
    data: { qty: { decrement: buyQty } },
  });
  if (updated.count !== 1) throw new Error('listing_not_found');
}

export async function buyMarketListing(
  userId: string,
  expectedRevision: number,
  listingId: string,
  buyQtyRaw?: number
): Promise<{ character: CharacterSnapshot }> {
  const id = String(listingId || '').trim();
  if (!id) throw new Error('listing_not_found');

  return prisma.$transaction(async (tx) => {
    const buyerChar = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!buyerChar) throw new Error('no_character');

    const listing = await tx.marketListing.findUnique({ where: { id } });
    if (!listing) throw new Error('listing_not_found');
    if (listing.sellerCharacterId === buyerChar.id) {
      throw new Error('cannot_buy_own_listing');
    }

    const buyQty = resolveBuyQty(buyQtyRaw, listing.qty);
    await claimListingQty(tx, id, buyQty, listing.qty);

    const unitAdena = listing.priceAdena >= 0n ? listing.priceAdena : 0n;
    const unitCoin = Math.max(0, Math.floor(listing.priceCoinOfLuck || 0));
    const chargeAdena = unitAdena * BigInt(buyQty);
    const chargeCoin = unitCoin * buyQty;

    const buyerResult = await mutateCharacterWithRevision(
      tx,
      buyerChar.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const adena = BigInt(base.adena);
        if (chargeAdena > 0n && adena < chargeAdena) {
          throw new Error('not_enough_adena');
        }

        const inv = parseInventory(base.inventoryJson);
        if (chargeCoin > 0) {
          const haveCoin = bagQty(inv.stacks, COIN_OF_LUCK_ITEM_ID, 0);
          if (haveCoin < chargeCoin) throw new Error('not_enough_coin');
        }

        let nextInv = inv;
        if (chargeCoin > 0) {
          nextInv = removeEnchantedFromBag(
            nextInv,
            COIN_OF_LUCK_ITEM_ID,
            chargeCoin,
            0
          );
        }
        nextInv = addEnchantedToBag(
          nextInv,
          listing.itemId,
          buyQty,
          listing.enchant
        );
        const nextAdena = adena - chargeAdena;
        const invChanged =
          JSON.stringify(nextInv) !==
          JSON.stringify(parseInventory(current.inventoryJson));
        const passivePatch = movementDataPatch(
          base,
          current as CharacterRow
        );
        const changed =
          hasMovementPatch(passivePatch) ||
          nextAdena !== current.adena ||
          invChanged;
        if (!changed) return { changed: false };

        return {
          changed: true,
          data: {
            ...passivePatch,
            adena: nextAdena,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!buyerResult.ok) throw gameConflictFromMutation(buyerResult);

    const sellerResult = await mutateCharacterWithRevision(
      tx,
      listing.sellerCharacterId,
      null,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        let nextAdena = BigInt(base.adena);
        let nextInv = parseInventory(base.inventoryJson);

        if (chargeAdena > 0n) nextAdena = nextAdena + chargeAdena;
        if (chargeCoin > 0) {
          nextInv = addEnchantedToBag(
            nextInv,
            COIN_OF_LUCK_ITEM_ID,
            chargeCoin,
            0
          );
        }

        const invChanged =
          JSON.stringify(nextInv) !==
          JSON.stringify(parseInventory(current.inventoryJson));
        const passivePatch = movementDataPatch(
          base,
          current as CharacterRow
        );
        const changed =
          hasMovementPatch(passivePatch) ||
          nextAdena !== current.adena ||
          invChanged;
        if (!changed) return { changed: false };

        return {
          changed: true,
          data: {
            ...passivePatch,
            adena: nextAdena,
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!sellerResult.ok) throw new Error('seller_update_failed');

    return { character: toSnapshot(buyerResult.character as CharacterRow) };
  });
}

export async function createMarketListing(
  userId: string,
  expectedRevision: number,
  input: CreateMarketListingInput
): Promise<{ character: CharacterSnapshot; listing: MarketListingView }> {
  const itemId = Math.floor(Number(input.itemId));
  if (!Number.isFinite(itemId) || itemId <= 0) throw new Error('invalid_item');

  const enchant = normEnchant(input.enchant);
  const priceAdena =
    input.priceAdena >= 0n ? input.priceAdena : 0n;
  const priceCoinOfLuck = Math.max(
    0,
    Math.floor(Number(input.priceCoinOfLuck) || 0)
  );
  if (priceAdena <= 0n && priceCoinOfLuck <= 0) {
    throw new Error('price_required');
  }

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('no_character');

    let soldQty = 0;
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const inv = parseInventory(base.inventoryJson);
        const qty = resolveQty(inv.stacks, itemId, enchant, input.qty);
        soldQty = qty;
        const nextInv = removeEnchantedFromBag(inv, itemId, qty, enchant);
        if (JSON.stringify(nextInv) === JSON.stringify(inv)) {
          return { changed: false };
        }
        return {
          changed: true,
          data: {
            inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
          },
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    if (!result.changed || soldQty <= 0) throw new Error('not_in_bag');

    const listing = await tx.marketListing.create({
      data: {
        sellerCharacterId: char.id,
        sellerName: char.name,
        itemId,
        qty: soldQty,
        enchant,
        priceAdena,
        priceCoinOfLuck,
      },
    });

    return {
      character: toSnapshot(result.character as CharacterRow),
      listing: listingToView(listing),
    };
  });
}
