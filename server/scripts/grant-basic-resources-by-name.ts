/**
 * Одноразова видача базових ресурсів персонажу за нікнеймом.
 * npx tsx server/scripts/grant-basic-resources-by-name.ts "Оаьаьт" 5000
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Prisma } from '@prisma/client';
import { prisma } from '../src/lib/prisma.js';
import {
  BASIC_RESOURCE_CATALOG,
  BASIC_RESOURCE_ITEM_IDS,
} from '../src/data/basicResourceCatalog.js';
import {
  addItemToBag,
  parseInventory,
  type InventoryState,
} from '../src/data/inventory.js';
import { mutateCharacterWithRevision } from '../src/services/characterMutation.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

const QTY = Math.max(1, Math.floor(Number(process.argv[3]) || 5000));
const NAME = String(process.argv[2] || '').trim();

async function main(): Promise<void> {
  if (!NAME) {
    console.error('Usage: tsx server/scripts/grant-basic-resources-by-name.ts <name> [qty]');
    process.exitCode = 1;
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    console.error('PostgreSQL unavailable — start DB and retry.');
    process.exitCode = 1;
    return;
  }

  const row = await prisma.character.findFirst({
    where: { name: NAME },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!row) {
    const hints = await prisma.character.findMany({
      where: { name: { contains: NAME.slice(0, 3), mode: 'insensitive' } },
      select: { name: true },
      take: 10,
    });
    console.error(`Character not found: ${NAME}`);
    if (hints.length) {
      console.error('Similar names:', hints.map((h) => h.name).join(', '));
    }
    process.exitCode = 1;
    return;
  }

  const result = await prisma.$transaction(async (tx) => {
    return mutateCharacterWithRevision(tx, row.id, row.revision, (current) => {
      let inv: InventoryState = parseInventory(current.inventoryJson);
      for (const itemId of BASIC_RESOURCE_ITEM_IDS) {
        inv = addItemToBag(inv, itemId, QTY);
      }
      return {
        changed: true,
        data: {
          inventoryJson: inv as unknown as Prisma.InputJsonValue,
        },
      };
    });
  });

  if (!result.ok) {
    console.error('Mutation failed:', result.reason);
    process.exitCode = 1;
    return;
  }

  const granted = BASIC_RESOURCE_CATALOG.map((r) => ({
    itemId: r.itemId,
    code: r.code,
    nameUk: r.nameUk,
    qty: QTY,
  }));

  console.log(
    JSON.stringify(
      {
        characterId: row.id,
        name: row.name,
        revisionBefore: row.revision,
        revisionAfter: result.character.revision,
        grantedCount: granted.length,
        qtyEach: QTY,
        items: granted,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
