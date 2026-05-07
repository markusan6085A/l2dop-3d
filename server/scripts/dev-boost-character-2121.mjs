/**
 * Одноразово: нік 2121 — 66 рівень (EXP з l2dop), 1_000_000_000 SP, скинути вивчені скіли.
 * Запуск з кореня репо: node server/scripts/dev-boost-character-2121.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
import { PrismaClient } from '@prisma/client';

const NAME = '2121';
/** Мін. EXP для 66 р. — L2DOP_LEVEL_MIN_EXP[65] у l2dopExpgain.ts */
const EXP_LEVEL_66 = 271975264n;
const SP = 1_000_000_000;

const prisma = new PrismaClient();
try {
  const r = await prisma.character.updateMany({
    where: { name: NAME },
    data: {
      exp: EXP_LEVEL_66,
      sp: SP,
      skillsLearnedJson: [],
      revision: { increment: 1 },
    },
  });
  if (r.count === 0) {
    console.error('Персонажа з іменем "' + NAME + '" не знайдено.');
    process.exitCode = 1;
  } else {
    console.log('Оновлено рядків:', r.count, '— EXP→66, SP=1kkk, скіли скинуто.');
  }
} finally {
  await prisma.$disconnect();
}
