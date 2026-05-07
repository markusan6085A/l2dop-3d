/**
 * Додати SP персонажу (накопичувально, з обрізанням до INT max).
 * З кореня: npx tsx server/scripts/grant-sp.ts <ім'я> <sp_to_add>
 * Або: npm run grant:sp -- <ім'я> <sp_to_add>
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';

const SP_MAX = 2_147_483_647;
const prisma = new PrismaClient();

async function main() {
  if (process.argv[2] === '--list') {
    const rows = await prisma.character.findMany({
      select: { name: true, sp: true },
      orderBy: { name: 'asc' },
    });
    console.log(rows.map((r) => `${r.name}\t${r.sp}`).join('\n'));
    return;
  }

  const name = (process.argv[2] ?? '').trim();
  const add = Math.floor(Number(process.argv[3] ?? '0'));
  if (!name || !Number.isFinite(add) || add <= 0) {
    console.error(
      'Usage: grant-sp.ts <characterName> <sp_to_add>\n  Example: grant-sp.ts MyChar 60000000\n  List: grant-sp.ts --list'
    );
    process.exit(1);
  }

  const row = await prisma.character.findFirst({ where: { name } });
  if (!row) {
    console.error('Character not found:', name);
    process.exit(1);
  }

  const next = Math.min(SP_MAX, Math.max(0, row.sp + add));
  await prisma.character.update({
    where: { id: row.id },
    data: { sp: next, revision: { increment: 1 } },
  });

  console.log('OK', { name: row.name, spBefore: row.sp, spAdded: add, spAfter: next });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
