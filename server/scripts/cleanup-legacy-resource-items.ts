/**
 * Одноразове очищення legacy resource itemId з БД.
 * npm run cleanup:legacy-resource-items
 * npx tsx server/scripts/cleanup-legacy-resource-items.ts --dry-run
 * CONFIRM_LEGACY_RESOURCE_CLEANUP=1 npx tsx server/scripts/cleanup-legacy-resource-items.ts --apply
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
import { BASIC_RESOURCE_ITEM_IDS } from '../src/data/basicResourceCatalog.js';
import { CRAFTED_RESOURCE_ITEM_IDS } from '../src/data/craftedResourceCatalog.js';
import {
  LEGACY_S_WEAPON_SOURCE_IDS,
} from '../src/data/sWeaponItemIdMigration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const BASIC_RESOURCE_ID_SET = new Set<number>(BASIC_RESOURCE_ITEM_IDS);
const CRAFTED_RESOURCE_ID_SET = new Set<number>(CRAFTED_RESOURCE_ITEM_IDS);
const PRESERVED_RESOURCE_ID_SET = new Set<number>([
  ...BASIC_RESOURCE_ITEM_IDS,
  ...CRAFTED_RESOURCE_ITEM_IDS,
]);

/** Лише для cleanup: старі resource itemId без нових basic/crafted. */
const LEGACY_RESOURCE_ITEM_IDS = new Set<number>([
  ...Array.from({ length: 1899 - 1864 + 1 }, (_, i) => 1864 + i).filter(
    (id) => !PRESERVED_RESOURCE_ID_SET.has(id),
  ),
  4039,
  4040,
  4041,
  4042,
  4043,
  5220,
]);

export function isLegacyResourceItemId(itemId: number): boolean {
  const id = Math.floor(Number(itemId) || 0);
  if (LEGACY_S_WEAPON_SOURCE_IDS.includes(id)) return false;
  return LEGACY_RESOURCE_ITEM_IDS.has(id);
}

function eqItemId(value: EqSlotValue | undefined): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Math.floor(value);
  const id = Number((value as { itemId?: unknown }).itemId);
  return Number.isFinite(id) && id > 0 ? Math.floor(id) : null;
}

export function stripLegacyResourceItemsFromInventory(
  inv: InventoryState
): { next: InventoryState; removedQty: number; changed: boolean; removedByItemId: Record<number, number> } {
  let removedQty = 0;
  const removedByItemId: Record<number, number> = {};
  const stacks: BagStack[] = [];
  for (const row of inv.stacks) {
    if (isLegacyResourceItemId(row.itemId)) {
      const q = Math.max(0, Math.floor(Number(row.qty) || 0));
      removedQty += q;
      removedByItemId[row.itemId] = (removedByItemId[row.itemId] ?? 0) + q;
      continue;
    }
    stacks.push({ ...row });
  }
  const eq: InventoryState['eq'] = { ...(inv.eq || {}) };
  for (const [slot, value] of Object.entries(eq)) {
    const id = eqItemId(value);
    if (id != null && isLegacyResourceItemId(id)) {
      removedByItemId[id] = (removedByItemId[id] ?? 0) + 1;
      removedQty += 1;
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
    removedByItemId,
  };
}

function inventoryJsonFromState(state: InventoryState): Record<string, unknown> {
  return JSON.parse(JSON.stringify(state)) as Record<string, unknown>;
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply');
  const dryRun = !apply;
  if (apply && process.env.CONFIRM_LEGACY_RESOURCE_CLEANUP !== '1') {
    console.error(
      'Refusing --apply without CONFIRM_LEGACY_RESOURCE_CLEANUP=1'
    );
    process.exitCode = 1;
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.log(
      JSON.stringify(
        {
          dryRun,
          applyRequested: apply,
          databaseUnavailable: true,
          legacyItemIdCount: LEGACY_RESOURCE_ITEM_IDS.size,
          preservedBasicResourceIds: [...BASIC_RESOURCE_ITEM_IDS],
          preservedCraftedResourceIds: [...CRAFTED_RESOURCE_ITEM_IDS],
          preservedLegacySWeaponIds: [...LEGACY_S_WEAPON_SOURCE_IDS],
          note: 'Start PostgreSQL and re-run dry-run for per-character counts.',
        },
        null,
        2
      )
    );
    return;
  }

  let charactersTouched = 0;
  let inventoryStacksRemoved = 0;
  let warehouseStacksRemoved = 0;
  let marketListingsRemoved = 0;
  const totalsByItemId = new Map<number, number>();

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
        for (const [idStr, qty] of Object.entries(stripped.removedByItemId)) {
          const id = Number(idStr);
          totalsByItemId.set(id, (totalsByItemId.get(id) ?? 0) + qty);
        }
      }
    }

    if (row.warehouseJson != null) {
      const wh = parseInventoryRaw(row.warehouseJson);
      const stripped = stripLegacyResourceItemsFromInventory(wh);
      if (stripped.changed) {
        patch = patch || {};
        patch.warehouseJson = inventoryJsonFromState(stripped.next);
        warehouseStacksRemoved += stripped.removedQty;
        for (const [idStr, qty] of Object.entries(stripped.removedByItemId)) {
          const id = Number(idStr);
          totalsByItemId.set(id, (totalsByItemId.get(id) ?? 0) + qty);
        }
      }
    }

    if (patch) {
      charactersTouched += 1;
      if (apply) {
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
  if (apply && legacyListingCount > 0) {
    await prisma.marketListing.deleteMany({
      where: { itemId: { in: [...LEGACY_RESOURCE_ITEM_IDS] } },
    });
  }

  const byItemId = [...totalsByItemId.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([itemId, qty]) => ({ itemId, qty }));

  console.log(
    JSON.stringify(
      {
        dryRun,
        applyRequested: apply,
        legacyItemIdCount: LEGACY_RESOURCE_ITEM_IDS.size,
        charactersTouched,
        inventoryStacksRemoved,
        warehouseStacksRemoved,
        marketListingsRemoved,
        legacyIdsFoundInInventories: byItemId,
        preservedBasicResourceIds: [...BASIC_RESOURCE_ITEM_IDS],
        preservedCraftedResourceIds: [...CRAFTED_RESOURCE_ITEM_IDS],
        preservedLegacySWeaponIds: [...LEGACY_S_WEAPON_SOURCE_IDS],
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
