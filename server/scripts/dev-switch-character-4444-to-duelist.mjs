/**
 * Одноразово: нік 4444 → профа human_duelist, скидає старі скіли та бойові
 * стани (activeBuffs / battleJson / worldCombatState / skillCooldowns), щоб
 * на гілці Gladiator → Duelist не залишалось "старих" записів з Warrior/Warlord/etc.
 *
 * Рівень підіймаємо до 76 (мін. для Duelist) і видаємо 1_000_000_000 SP, щоб
 * можна було вчити скіли цієї гілки з чистого аркуша.
 *
 * Запуск з кореня репо: node server/scripts/dev-switch-character-4444-to-duelist.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });
import { PrismaClient } from '@prisma/client';

const NAME = '4444';
/** Мін. EXP для 80 р. — L2DOP_LEVEL_MIN_EXP[79] з l2dopExpgain.ts. */
const EXP_LEVEL_80 = 4000000000n - 1n;
const LEVEL = 80;
const SP = 1_000_000_000;

const prisma = new PrismaClient();
try {
  const before = await prisma.character.findUnique({
    where: { name: NAME },
    select: {
      id: true,
      name: true,
      level: true,
      l2Profession: true,
      exp: true,
      sp: true,
    },
  });
  if (!before) {
    console.error('Персонажа з іменем "' + NAME + '" не знайдено.');
    process.exit(1);
  }
  console.log('Було:', before);

  const r = await prisma.character.updateMany({
    where: { name: NAME },
    data: {
      l2Profession: 'human_duelist',
      classBranch: 'fighter',
      race: 'Human',
      exp: EXP_LEVEL_80,
      level: LEVEL,
      sp: SP,
      skillsLearnedJson: [],
      activeBuffsJson: null,
      battleJson: null,
      worldCombatStateJson: null,
      skillCooldownsJson: null,
      buffHeroicTier: null,
      buffZealotStacks: null,
      revision: { increment: 1 },
    },
  });
  if (r.count === 0) {
    console.error('Не вдалося оновити персонажа "' + NAME + '".');
    process.exitCode = 1;
  } else {
    const after = await prisma.character.findUnique({
      where: { name: NAME },
      select: {
        id: true,
        name: true,
        level: true,
        l2Profession: true,
        exp: true,
        sp: true,
      },
    });
    console.log('Стало:', after);
    console.log(
      'Готово: профа human_duelist, level 76, SP 1kkk, скіли/бафи/CD скинуто.'
    );
  }
} finally {
  await prisma.$disconnect();
}
