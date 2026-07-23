/**
 * Циклічна міграція itemId 1874/1875/1876 після виправлення Interlude-канону.
 *
 *   npx tsx server/scripts/migrate-basic-resource-ids-v1.ts --dry-run
 *   CONFIRM_BASIC_RESOURCE_ID_MIGRATION_V1=1 npx tsx server/scripts/migrate-basic-resource-ids-v1.ts --apply
 *
 * Перед --apply зробіть backup PostgreSQL.
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient, type Prisma } from '@prisma/client';
import { parseInventory, type InventoryState } from '../src/data/inventory.js';
import { parseWarehouse } from '../src/data/warehouse.js';
import {
  BASIC_RESOURCE_ID_MIGRATION_MARKER,
  mapOriginalBasicResourceItemId,
  MIGRATED_BASIC_RESOURCE_SOURCE_IDS,
  OLD_BASIC_RESOURCE_SEMANTIC_LABELS,
  ORIGINAL_BASIC_RESOURCE_ID_MAP,
  preflightBasicResourceIdMigration,
  remapBasicResourceInventoryState,
  remapBasicResourceWarehouseState,
  semanticQtyTotalsAfterMigration,
  semanticQtyTotalsFromCounts,
} from '../src/data/basicResourceItemIdMigration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

type IdCount = { itemId: number; count: number };

function printStaticMigrationReport(): void {
  console.log('\n=== Basic resource itemId migration (static plan) ===');
  console.log('Cycle map (one-pass by ORIGINAL itemId):');
  for (const from of MIGRATED_BASIC_RESOURCE_SOURCE_IDS.sort((a, b) => a - b)) {
    const label = OLD_BASIC_RESOURCE_SEMANTIC_LABELS[from] ?? '?';
    console.log(
      `  ${from} × N ${label} → ${ORIGINAL_BASIC_RESOURCE_ID_MAP[from]}`,
    );
  }
  const preflight = preflightBasicResourceIdMigration();
  if (preflight.issues.length > 0) {
    console.log('\nPreflight issues:');
    for (const issue of preflight.issues) console.log(`  - ${issue}`);
  } else {
    console.log('\nPreflight: OK (3-cycle one-pass map)');
  }
  console.log('\nNote: one-pass only; marker blocks re-apply after --apply.');
}

function collectItemIdsFromInventory(inv: InventoryState): IdCount[] {
  const m = new Map<number, number>();
  for (const s of inv.stacks ?? []) {
    m.set(s.itemId, (m.get(s.itemId) ?? 0) + s.qty);
  }
  for (const v of Object.values(inv.eq ?? {})) {
    const id = typeof v === 'number' ? v : Number((v as { itemId?: number }).itemId);
    if (Number.isFinite(id) && id > 0) {
      m.set(id, (m.get(id) ?? 0) + 1);
    }
  }
  return [...m.entries()].map(([itemId, count]) => ({ itemId, count }));
}

function collectItemIdsFromWarehouse(
  stacks: ReturnType<typeof parseWarehouse>['stacks'],
): IdCount[] {
  const m = new Map<number, number>();
  for (const s of stacks) {
    m.set(s.itemId, (m.get(s.itemId) ?? 0) + s.qty);
  }
  return [...m.entries()].map(([itemId, count]) => ({ itemId, count }));
}

function mergeCounts(target: Map<number, number>, rows: IdCount[]): void {
  for (const r of rows) {
    target.set(r.itemId, (target.get(r.itemId) ?? 0) + r.count);
  }
}

function inventoryChanged(before: unknown, after: InventoryState): boolean {
  return JSON.stringify(before) !== JSON.stringify(after);
}

async function readMarker(): Promise<string | null> {
  const row = await prisma.serverMeta.findUnique({
    where: { key: BASIC_RESOURCE_ID_MIGRATION_MARKER },
  });
  return row?.value ?? null;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');
  if (!dryRun && !apply) {
    console.error(
      'Usage: --dry-run | --apply (with CONFIRM_BASIC_RESOURCE_ID_MIGRATION_V1=1)',
    );
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL missing — static migration plan only.');
    printStaticMigrationReport();
    process.exit(0);
  }

  let marker: string | null = null;
  try {
    marker = await readMarker();
  } catch (err) {
    console.warn('Database unavailable — static migration plan only.');
    console.warn(String(err));
    printStaticMigrationReport();
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  }

  if (marker) {
    console.error(
      `Migration already applied (marker ${BASIC_RESOURCE_ID_MIGRATION_MARKER}=${marker})`,
    );
    process.exit(1);
  }

  const preflight = preflightBasicResourceIdMigration();
  if (!preflight.ok) {
    console.error('\nRefusing migration due to preflight failure:');
    for (const issue of preflight.issues) console.error(`  - ${issue}`);
    process.exit(1);
  }

  if (apply && process.env.CONFIRM_BASIC_RESOURCE_ID_MIGRATION_V1 !== '1') {
    console.error(
      'Refusing --apply without CONFIRM_BASIC_RESOURCE_ID_MIGRATION_V1=1',
    );
    process.exit(1);
  }

  if (apply) {
    console.warn('\n⚠️  BACKUP PostgreSQL перед apply!\n');
  }

  const characters = await prisma.character.findMany({
    select: {
      id: true,
      name: true,
      inventoryJson: true,
      warehouseJson: true,
    },
    orderBy: { name: 'asc' },
  });

  const marketListings = await prisma.marketListing.findMany({
    select: {
      id: true,
      itemId: true,
      qty: true,
      enchant: true,
      sellerName: true,
    },
  });

  const beforeCounts = new Map<number, number>();
  const afterCounts = new Map<number, number>();
  let charactersAffected = 0;
  let warehousesAffected = 0;
  const charPlans: Array<{
    id: string;
    name: string;
    inventoryJson?: Prisma.InputJsonValue;
    warehouseJson?: Prisma.InputJsonValue;
  }> = [];

  for (const row of characters) {
    let charChanged = false;
    let plan: (typeof charPlans)[number] | null = null;

    const invRaw = row.inventoryJson;
    const inv = parseInventory(invRaw);
    mergeCounts(beforeCounts, collectItemIdsFromInventory(inv));
    const nextInv = remapBasicResourceInventoryState(inv);
    mergeCounts(afterCounts, collectItemIdsFromInventory(nextInv));
    if (inventoryChanged(invRaw, nextInv)) {
      charChanged = true;
      plan = {
        id: row.id,
        name: row.name,
        inventoryJson: nextInv as unknown as Prisma.InputJsonValue,
      };
    }

    const whRaw = row.warehouseJson;
    const wh = parseWarehouse(whRaw);
    mergeCounts(beforeCounts, collectItemIdsFromWarehouse(wh.stacks));
    const nextWh = remapBasicResourceWarehouseState(wh);
    mergeCounts(afterCounts, collectItemIdsFromWarehouse(nextWh.stacks));
    if (JSON.stringify(whRaw) !== JSON.stringify(nextWh)) {
      charChanged = true;
      warehousesAffected += 1;
      if (!plan) plan = { id: row.id, name: row.name };
      plan.warehouseJson = nextWh as unknown as Prisma.InputJsonValue;
    }

    if (charChanged) {
      charactersAffected += 1;
      if (plan) charPlans.push(plan);
    }
  }

  const marketPlans: Array<{ id: string; itemId: number }> = [];
  for (const listing of marketListings) {
    mergeCounts(beforeCounts, [{ itemId: listing.itemId, count: listing.qty }]);
    const nextId = mapOriginalBasicResourceItemId(listing.itemId);
    mergeCounts(afterCounts, [{ itemId: nextId, count: listing.qty }]);
    if (nextId !== listing.itemId) {
      marketPlans.push({ id: listing.id, itemId: nextId });
    }
  }

  const semanticBefore = semanticQtyTotalsFromCounts(beforeCounts);
  const semanticAfter = semanticQtyTotalsAfterMigration(beforeCounts);
  const semanticConflict =
    semanticBefore.stone_of_purity !== semanticAfter.stone_of_purity ||
    semanticBefore.mithril_ore !== semanticAfter.mithril_ore ||
    semanticBefore.oriharukon_ore !== semanticAfter.oriharukon_ore;

  const oldIdCounts = MIGRATED_BASIC_RESOURCE_SOURCE_IDS.map((id) => ({
    oldItemId: id,
    label: OLD_BASIC_RESOURCE_SEMANTIC_LABELS[id],
    qty: beforeCounts.get(id) ?? 0,
    newItemId: ORIGINAL_BASIC_RESOURCE_ID_MAP[id],
  }));

  const report = {
    dryRun,
    applyRequested: apply,
    applyExecuted: apply && !dryRun,
    charactersScanned: characters.length,
    charactersToUpdate: charactersAffected,
    warehousesToUpdate: warehousesAffected,
    marketListingsToUpdate: marketPlans.length,
    oldItemIdCounts: oldIdCounts,
    semanticMigrationMap: MIGRATED_BASIC_RESOURCE_SOURCE_IDS.map((from) => ({
      from,
      label: OLD_BASIC_RESOURCE_SEMANTIC_LABELS[from],
      to: ORIGINAL_BASIC_RESOURCE_ID_MAP[from],
    })),
    semanticQtyBefore: semanticBefore,
    semanticQtyAfter: semanticAfter,
    semanticQtyPreserved: !semanticConflict,
    conflicts: semanticConflict
      ? ['semantic quantity mismatch after simulated migration']
      : [],
  };

  console.log(JSON.stringify(report, null, 2));

  if (apply && !dryRun) {
    for (const plan of charPlans) {
      await prisma.character.update({
        where: { id: plan.id },
        data: {
          ...(plan.inventoryJson != null
            ? { inventoryJson: plan.inventoryJson }
            : {}),
          ...(plan.warehouseJson != null
            ? { warehouseJson: plan.warehouseJson }
            : {}),
        },
      });
    }
    for (const mp of marketPlans) {
      await prisma.marketListing.update({
        where: { id: mp.id },
        data: { itemId: mp.itemId },
      });
    }
    await prisma.serverMeta.upsert({
      where: { key: BASIC_RESOURCE_ID_MIGRATION_MARKER },
      create: {
        key: BASIC_RESOURCE_ID_MIGRATION_MARKER,
        value: new Date().toISOString(),
      },
      update: { value: new Date().toISOString() },
    });
    console.log('\nMigration applied.');
  } else {
    console.log('\nDry-run only — no database writes.');
  }
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
