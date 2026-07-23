/**
 * Одноразова міграція A-grade itemId у PostgreSQL.
 *
 *   npx tsx server/scripts/migrate-a-weapon-item-ids-v1.ts --dry-run
 *   CONFIRM_A_WEAPON_ID_MIGRATION_V1=1 npx tsx server/scripts/migrate-a-weapon-item-ids-v1.ts --apply
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
  A_WEAPON_ITEM_ID_MIGRATION_MARKER,
  LEGACY_A_WEAPON_ID_MAP,
  LEGACY_A_WEAPON_SOURCE_IDS,
  LEGACY_AMBIGUOUS_A_WEAPON_IDS,
  mapLegacyAWeaponItemId,
  preflightAWeaponMigration,
  remapInventoryState,
  remapWarehouseState,
} from '../src/data/aWeaponItemIdMigration.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

function printStaticMigrationReport(): void {
  console.log('\n=== A weapon itemId migration (static plan) ===');
  console.log('Legacy map entries:', Object.keys(LEGACY_A_WEAPON_ID_MAP).length);
  for (const from of LEGACY_A_WEAPON_SOURCE_IDS.sort((a, b) => a - b)) {
    console.log(`  ${from} → ${LEGACY_A_WEAPON_ID_MAP[from]}`);
  }
  console.log('\nAmbiguous legacy ids (231 Grace Dagger / 304 Orcish Halberd):');
  for (const id of LEGACY_AMBIGUOUS_A_WEAPON_IDS) {
    console.log(`  ${id} → ${LEGACY_A_WEAPON_ID_MAP[id]}`);
  }
  const preflight = preflightAWeaponMigration();
  if (preflight.issues.length > 0) {
    console.log('\nPreflight issues:');
    for (const issue of preflight.issues) console.log(`  - ${issue}`);
  } else {
    console.log('\nPreflight: OK (231/304 safe, no cross-grade collisions)');
  }
  console.log('\nNote: one-pass only; marker blocks re-apply after --apply.');
}

type IdCount = { itemId: number; count: number };

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

function collectItemIdsFromWarehouse(stacks: ReturnType<typeof parseWarehouse>['stacks']): IdCount[] {
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
    where: { key: A_WEAPON_ITEM_ID_MIGRATION_MARKER },
  });
  return row?.value ?? null;
}

async function main(): Promise<void> {
  const dryRun = process.argv.includes('--dry-run');
  const apply = process.argv.includes('--apply');
  if (!dryRun && !apply) {
    console.error('Usage: --dry-run | --apply (with CONFIRM_A_WEAPON_ID_MIGRATION_V1=1)');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL missing — dry-run counts only from empty DB scan.');
    printStaticMigrationReport();
    process.exit(0);
  }

  let marker: string | null = null;
  try {
    marker = await readMarker();
  } catch (err) {
    console.warn('Database unavailable — showing static migration plan only.');
    console.warn(String(err));
    printStaticMigrationReport();
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  }
  if (marker) {
    console.error(`Migration already applied (marker ${A_WEAPON_ITEM_ID_MIGRATION_MARKER}=${marker})`);
    process.exit(1);
  }

  const preflight = preflightAWeaponMigration();
  if (preflight.ambiguous || preflight.crossGradeCollision) {
    console.error('\nRefusing migration due to preflight failure:');
    for (const issue of preflight.issues) console.error(`  - ${issue}`);
    process.exit(1);
  }

  if (apply && process.env.CONFIRM_A_WEAPON_ID_MIGRATION_V1 !== '1') {
    console.error('Refusing --apply without CONFIRM_A_WEAPON_ID_MIGRATION_V1=1');
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
    select: { id: true, itemId: true, qty: true, enchant: true, sellerName: true },
  });

  const legacyCounts = new Map<number, number>();
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
    mergeCounts(legacyCounts, collectItemIdsFromInventory(inv).filter((r) => r.itemId in LEGACY_A_WEAPON_ID_MAP));
    const nextInv = remapInventoryState(inv);
    if (inventoryChanged(invRaw, nextInv)) {
      charChanged = true;
      plan = { id: row.id, name: row.name, inventoryJson: nextInv as unknown as Prisma.InputJsonValue };
    }

    const whRaw = row.warehouseJson;
    const wh = parseWarehouse(whRaw);
    mergeCounts(
      legacyCounts,
      collectItemIdsFromWarehouse(wh.stacks).filter((r) => r.itemId in LEGACY_A_WEAPON_ID_MAP),
    );
    const nextWh = remapWarehouseState(wh);
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
    const nextId = mapLegacyAWeaponItemId(listing.itemId);
    if (nextId !== listing.itemId) {
      mergeCounts(legacyCounts, [{ itemId: listing.itemId, count: listing.qty }]);
      marketPlans.push({ id: listing.id, itemId: nextId });
    }
  }

  console.log('\n=== A weapon itemId migration dry-run ===\n');
  console.log(`Characters scanned: ${characters.length}`);
  console.log(`Characters to update: ${charactersAffected}`);
  console.log(`Warehouses to update: ${warehousesAffected}`);
  console.log(`Market listings to update: ${marketPlans.length}`);
  console.log('\nLegacy itemId counts found:');
  if (legacyCounts.size === 0) {
    console.log('  (none)');
  } else {
    for (const [id, count] of [...legacyCounts.entries()].sort((a, b) => a[0] - b[0])) {
      console.log(`  ${id} × ${count} → ${mapLegacyAWeaponItemId(id)}`);
    }
  }
  console.log('\nExpected remap map:');
  for (const from of LEGACY_A_WEAPON_SOURCE_IDS.sort((a, b) => a - b)) {
    console.log(`  ${from} → ${LEGACY_A_WEAPON_ID_MAP[from]}`);
  }
  console.log('\n231/304 audit: safe (only wrong A-grade usage in catalog)');

  if (dryRun) {
    console.log('\nDry-run complete. Apply not executed.');
    await prisma.$disconnect();
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const plan of charPlans) {
      await tx.character.update({
        where: { id: plan.id },
        data: {
          ...(plan.inventoryJson != null ? { inventoryJson: plan.inventoryJson } : {}),
          ...(plan.warehouseJson != null ? { warehouseJson: plan.warehouseJson } : {}),
          revision: { increment: 1 },
        },
      });
    }
    for (const plan of marketPlans) {
      await tx.marketListing.update({
        where: { id: plan.id },
        data: { itemId: plan.itemId },
      });
    }
    await tx.serverMeta.upsert({
      where: { key: A_WEAPON_ITEM_ID_MIGRATION_MARKER },
      create: {
        key: A_WEAPON_ITEM_ID_MIGRATION_MARKER,
        value: new Date().toISOString(),
      },
      update: {
        value: new Date().toISOString(),
      },
    });
  });

  console.log(`\nApply complete: ${charactersAffected} characters, ${marketPlans.length} market listings.`);
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
