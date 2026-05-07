/**
 * Старт із кореня репо:
 *   npm run grant:craft-resources -- <ім'я персонажа> [кількість кожного ресурсу, за замовч. 300]
 * Додає набір крафт-матеріалів (stack у сумку).
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

/** Той самий набір л2 id, що в resourceCraft / дропі (дублікати прибрані). */
const CRAFT_RESOURCE_ITEM_IDS: readonly number[] = [
  4040, // Mold Lubricant
  4042, // Enria
  4043, // Asofe
  4039, // Mold Glue
  4041, // Mold Hardener
  1876, // Mithril Ore
  1883, // Varnish of Purity
  1873, // Silver Nugget
  1875, // Stone of Purity
  1882, // Leather
  1884, // Cord
  1871, // Charcoal
  1870, // Coal (Вугілля)
  1865, // Varnish
  1881, // Coarse Bone Powder
  1867, // Animal Skin
  1872, // Animal Bone
  1864, // Stem
  1869, // Iron Ore
  1868, // Thread
] as const;

async function main() {
  const name = (process.argv[2] ?? '').trim();
  const qty = Math.max(
    1,
    Math.min(1_000_000, parseInt(process.argv[3] ?? '300', 10) || 300)
  );

  if (!name) {
    console.error(
      'Usage: grant-craft-resources.ts <characterName> [qtyPerItem=300]'
    );
    process.exit(1);
  }

  const row = await prisma.character.findFirst({ where: { name } });
  if (!row) {
    console.error('Character not found:', name);
    process.exit(1);
  }

  const cr = row as CharacterRow;
  let inv = parseInventory(cr.inventoryJson);
  for (const id of CRAFT_RESOURCE_ITEM_IDS) {
    inv = addItemToBag(inv, id, qty);
  }

  await prisma.character.update({
    where: { id: row.id },
    data: {
      inventoryJson: inv as object,
      revision: { increment: 1 },
    },
  });

  console.log('OK', {
    name: row.name,
    qtyPerItem: qty,
    itemCount: CRAFT_RESOURCE_ITEM_IDS.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
