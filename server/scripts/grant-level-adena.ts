/**
 * З кореня репозиторію:
 *   npm run grant:level-adena -- <ім'я персонажа> <рівень 1..80> <адена|-> [sp|->]
 * «-» для адени або sp — залишити поточне значення в БД.
 * Або: npx tsx server/scripts/grant-level-adena.ts …
 * Приклад: npm run grant:level-adena -- MyChar 80 100000000 1000000000
 * Приклад (лише рівень, економіка без змін): npm run grant:level-adena -- MyChar 80 -
 */

import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });
import { PrismaClient } from '@prisma/client';
import { parseInventory } from '../src/data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../src/data/l2dopCombatFormulas.js';
import { computeVitals } from '../src/data/l2dopVitals.js';
import {
  L2DOP_LEVEL_MIN_EXP,
  levelFromTotalExp,
} from '../src/data/l2dopExpgain.js';
import { combatOptsFromRow, type CharacterRow } from '../src/services/charService.js';

const prisma = new PrismaClient();

async function main() {
  const name = (process.argv[2] ?? '').trim();
  const level = Math.max(1, Math.min(80, parseInt(process.argv[3] ?? '80', 10)));
  const adenaArg = process.argv[4];
  const spArg = process.argv[5];

  if (!name) {
    console.error(
      'Usage: grant-level-adena.ts <characterName> <level 1..80> <adena|-> [sp|->]\n' +
        '  «-» для адени/sp — залишити в БД; якщо адену пропущено — теж залишаємо.'
    );
    process.exit(1);
  }

  const row = await prisma.character.findFirst({
    where: { name },
  });
  if (!row) {
    console.error('Character not found:', name);
    process.exit(1);
  }

  const keepAdena =
    adenaArg === '-' || adenaArg === undefined || adenaArg === '';
  const adena = keepAdena ? row.adena : BigInt(adenaArg!);

  let spPatch: number | undefined;
  if (spArg === '-') {
    spPatch = row.sp;
  } else if (spArg !== undefined && spArg !== '') {
    spPatch = Math.min(2_147_483_647, Math.max(0, parseInt(spArg, 10) || 0));
  }

  const exp = L2DOP_LEVEL_MIN_EXP[level - 1]!;
  const effLv = levelFromTotalExp(exp);
  const cr = row as CharacterRow;
  const inv = parseInventory(cr.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    cr.race,
    cr.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vit = computeVitals(
    effLv,
    cr.race,
    cr.classBranch,
    combat.con,
    combat.men
  );
  const maxHp = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);

  const data: {
    exp: bigint;
    level: number;
    adena: bigint;
    hp: number;
    maxHp: number;
    revision: { increment: number };
    sp?: number;
  } = {
    exp,
    level: effLv,
    adena,
    hp: maxHp,
    maxHp,
    revision: { increment: 1 },
  };
  if (spPatch !== undefined) {
    data.sp = spPatch;
  }

  await prisma.character.update({
    where: { id: row.id },
    data,
  });

  console.log('OK', {
    name: row.name,
    level: effLv,
    exp: exp.toString(),
    adena: adena.toString(),
    ...(spPatch !== undefined ? { sp: spPatch } : {}),
    maxHp,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
