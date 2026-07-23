/**
 * Одноразове очищення legacy resource itemId з БД.
 * npm run cleanup:legacy-resource-items
 * npm run cleanup:legacy-resource-items -- --dry-run
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import {
  parseInventoryRaw,
  type InventoryState,
  type BagStack,
  type EqSlotValue,
} from '../src/data/inventory.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

/** Лише для cleanup: старі resource itemId (1864–1899, 4039–4043, 5220, 5549, 5550). */
const LEGACY_RESOURCE_ITEM_IDS = new Set<number>([
  ...Array.from({ length: 1899 - 1864 + 1 }, (_, i) => 1864 + i),
  4039,
  4040,
  4041,
  4042,
  4043,
  5220,
  5549,
  5550,
]);

export function isLegacyResourceItemId(itemId: number): boolean {
  return LEGACY_RESOURCE_ITEM_IDS.has(Math.floor(Number(itemId) || 0));
}

function eqItemId(value: EqSlotValue | undefined): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Math.floor(value);
  const id = Number((value as { itemId?: unknown }).itemId);
  return Number.isFinite(id) && id > 0 ? Math.floor(id) : null;
}

export function stripLegacyResourceItemsFromInventory(
  inv: InventoryState
): { next: InventoryState; removedQty: number; changed: boolean } {
  let removedQty = 0;
  const stacks: BagStack[] = [];
  for (const row of inv.stacks) {
    if (isLegacyResourceItemId(row.itemId)) {
      removedQty += Math.max(0, Math.floor(Number(row.qty) || 0));
      continue;
    }
    stacks.push({ ...row });
  }
  const eq: InventoryState['eq'] = { ...(inv.eq || {}) };
  for (const [slot, value] of Object.entries(eq)) {
    const id = eqItemId(value);
    if (id != null && isLegacyResourceItemId(id)) {
      delete eq[slot];
    }
  }
  const changed =
    stacks.length !== inv.stacks.length ||
    Object.keys(eq).length !== Object.keys(inv.eq || {}).length;
  return {
    next: {
      ...inv,
      stacks,
      eq,
    },
    removedQty,
    changed,
  };
}

function inventoryJsonFromState(state: InventoryState): Record<string, unknown> {
  return JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  let charactersTouched = 0;
  let inventoryStacksRemoved = 0;
  let warehouseStacksRemoved = 0;
  let marketListingsRemoved = 0;

  const rows = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      inventoryJson: true,
      warehouseJson: true,
    },
  });

  for (const row of rows) {
    let patch: {
      inventoryJson?: Record<string, unknown>;
      warehouseJson?: Record<string, unknown>;
    } | null = null;

    if (row.inventoryJson != null) {
      const inv = parseInventoryRaw(row.inventoryJson);
      const stripped = stripLegacyResourceItemsFromInventory(inv);
      if (stripped.changed) {
        patch = patch || {};
        patch.inventoryJson = inventoryJsonFromState(stripped.next);
        inventoryStacksRemoved += stripped.removedQty;
      }
    }

    if (row.warehouseJson != null) {
      const wh = parseInventoryRaw(row.warehouseJson);
      const stripped = stripLegacyResourceItemsFromInventory(wh);
      if (stripped.changed) {
        patch = patch || {};
        patch.warehouseJson = inventoryJsonFromState(stripped.next);
        warehouseStacksRemoved += stripped.removedQty;
      }
    }

    if (patch) {
      charactersTouched += 1;
      if (!dryRun) {
        await prisma.character.update({
          where: { id: row.id },
          data: patch,
        });
      }
    }
  }

  const legacyListingCount = await prisma.marketListing.count({
    where: { itemId: { in: [...LEGACY_RESOURCE_ITEM_IDS] } },
  });
  marketListingsRemoved = legacyListingCount;
  if (!dryRun && legacyListingCount > 0) {
    await prisma.marketListing.deleteMany({
      where: { itemId: { in: [...LEGACY_RESOURCE_ITEM_IDS] } },
    });
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        legacyItemIdCount: LEGACY_RESOURCE_ITEM_IDS.size,
        charactersTouched,
        inventoryStacksRemoved,
        warehouseStacksRemoved,
        marketListingsRemoved,
      },
      null,
      2
    )
  );
}

const isDirectRun =
  process.argv[1] != null &&
  path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isDirectRun) {
  main()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
