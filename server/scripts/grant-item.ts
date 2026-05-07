/**
 * З кореня репо:
 *   npm run grant:item -- <ім'я персонажа> <l2ItemId> <qty>
 */

import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { addItemToBag, parseInventory } from '../src/data/inventory.js';
import type { CharacterRow } from '../src/services/charService.js';

const prisma = new PrismaClient();

async function main() {
  const name = (process.argv[2] ?? '').trim();
  const itemId = Math.floor(Number(process.argv[3]));
  const qty = Math.floor(Number(process.argv[4]));

  if (!name || !Number.isFinite(itemId) || itemId <= 0) {
    console.error('Usage: grant-item.ts <characterName> <l2ItemId> <qty>');
    process.exit(1);
  }
  if (!Number.isFinite(qty) || qty < 1 || qty > 10_000_000) {
    console.error('Invalid qty (1..10M)');
    process.exit(1);
  }

  const row = await prisma.character.findFirst({ where: { name } });
  if (!row) {
    console.error('Character not found:', name);
    process.exit(1);
  }

  const cr = row as CharacterRow;
  const inv = addItemToBag(parseInventory(cr.inventoryJson), itemId, qty);

  await prisma.character.update({
    where: { id: row.id },
    data: {
      inventoryJson: inv as object,
      revision: { increment: 1 },
    },
  });

  console.log('OK', { name: row.name, itemId, qty });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
