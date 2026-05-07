/**
 * Dev seed: для персонажа 4444 видати всім уже вивченим sonic/гладіаторським
 * скілам максимально доступний ранг згідно `MAX_SKILL_RANK_BY_BATTLE_ID` +
 * `minCharLevelForSkillRank` (Interlude прогресія). У L2 Interlude кожен такий
 * скіл має кілька десятків рангів (Triple Slash — 37), тому без цього скрипта
 * довелося б жахнути в магістрі по +1 ранг разів 37.
 *
 * Запуск: npx tsx server/scripts/dev-maxrank-character-4444.ts
 */
import { PrismaClient, type Prisma } from '@prisma/client';
import { levelFromTotalExp } from '../src/data/l2dopExpgain.js';
import {
  humanFighterCatalogEntry,
} from '../src/data/humanFighterSkillCatalog.js';
import {
  MAX_SKILL_RANK_BY_BATTLE_ID,
  maxSkillRankForBattleId,
  minCharLevelForSkillRank,
  normalizeLearnedSkillsJson,
} from '../src/data/humanFighterSkillCatalog.learnedRanks.js';
import { HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ } from '../src/data/l2dopHumanFighterBattleSkills.js';

const NAME = '4444';

/** Sonic/гладіаторські скіли — посіяти, навіть якщо ще не вивчено. */
const SONIC_SKILLS = [
  'l2_1',
  'l2_5',
  'l2_6',
  'l2_7',
  'l2_8',
  'l2_9',
  'l2_190',
  'l2_260',
  'l2_261',
  'l2_442',
  'l2_451',
];

function bestRankForLevel(battleId: string, effLevel: number): number {
  const entry = humanFighterCatalogEntry(battleId);
  const maxR = maxSkillRankForBattleId(battleId);
  if (!entry) return Math.max(1, maxR);
  let best = 1;
  for (let r = 1; r <= maxR; r++) {
    const minLvl = minCharLevelForSkillRank(entry, r);
    if (HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ || effLevel >= minLvl) best = r;
  }
  return best;
}

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
  const char = await prisma.character.findUnique({
    where: { name: NAME },
    select: {
      id: true,
      name: true,
      level: true,
      exp: true,
      l2Profession: true,
      classBranch: true,
      race: true,
      skillsLearnedJson: true,
      revision: true,
    },
  });
  if (!char) {
    console.error('Персонажа "' + NAME + '" не знайдено.');
    process.exit(1);
  }

  const effLevel = levelFromTotalExp(char.exp);
  const learned = normalizeLearnedSkillsJson(char.skillsLearnedJson);
  console.log('Було:', {
    level: char.level,
    effLevel,
    l2Profession: char.l2Profession,
    entries: learned,
  });

  const byId = new Map<string, number>();
  for (const e of learned) byId.set(e.battleId, e.level);

  for (const bid of SONIC_SKILLS) {
    if (!MAX_SKILL_RANK_BY_BATTLE_ID[bid]) {
      console.warn('skip ' + bid + ': немає в MAX_SKILL_RANK');
      continue;
    }
    const r = bestRankForLevel(bid, effLevel);
    byId.set(bid, r);
  }

  const next = Array.from(byId.entries())
    .map(([battleId, level]) => ({ battleId, level }))
    .sort((a, b) => a.battleId.localeCompare(b.battleId));

  const upd = await prisma.character.updateMany({
    where: { id: char.id, revision: char.revision },
    data: {
      skillsLearnedJson: next as unknown as Prisma.InputJsonValue,
      revision: { increment: 1 },
    },
  });

  if (upd.count === 0) {
    console.error('Не вдалося оновити (revision mismatch).');
    process.exit(1);
  }

  const after = await prisma.character.findUnique({
    where: { id: char.id },
    select: { skillsLearnedJson: true, level: true, revision: true },
  });
  console.log('Стало:', after);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
