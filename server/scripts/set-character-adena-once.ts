/**
 * Одноразове / дев: лишень adena + revision.
 *   npx tsx server/scripts/set-character-adena-once.ts <name> <adena>
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = (process.argv[2] ?? '').trim();
  const adena = BigInt(process.argv[3] ?? '0');
  if (!name || adena < 0n) {
    console.error('Usage: set-character-adena-once.ts <characterName> <adena>');
    process.exit(1);
  }
  const row = await prisma.character.findFirst({ where: { name } });
  if (!row) {
    console.error('Character not found:', name);
    process.exit(1);
  }
  const u = await prisma.character.update({
    where: { id: row.id },
    data: { adena, revision: { increment: 1 } },
  });
  console.log('OK', u.name, 'adena=', u.adena.toString());
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
