import type { Prisma } from '@prisma/client';
import { getDragonBossConfig, type DragonBossId } from '../domain/dragonDungeon.js';

type DbClient = Prisma.TransactionClient | typeof import('../lib/prisma.js').prisma;

export async function postClanDragonJournalOpened(
  db: DbClient,
  clanId: string,
  characterId: string,
  leaderName: string,
  dragonId: DragonBossId,
  costDiamonds: number
): Promise<void> {
  const boss = getDragonBossConfig(dragonId);
  const text =
    `Глава клану ${leaderName} відкрив ${boss.nameEn} за ${costDiamonds} алмазів.`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}

export async function postClanDragonJournalVictory(
  db: DbClient,
  clanId: string,
  characterId: string,
  dragonId: DragonBossId
): Promise<void> {
  const boss = getDragonBossConfig(dragonId);
  const text =
    `Клан переміг ${boss.nameEn}.\n` +
    `До казни зараховано:\n` +
    `${boss.reward.adena.toLocaleString('uk-UA')} адени,\n` +
    `${boss.reward.coinOfLuck} Coin of Luck,\n` +
    `${boss.reward.clanReputation} репутації клану.`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}

export async function postClanDragonJournalExpired(
  db: DbClient,
  clanId: string,
  characterId: string,
  dragonId: DragonBossId
): Promise<void> {
  const boss = getDragonBossConfig(dragonId);
  const text = `Час битви з ${boss.nameEn} завершився. Нагороду не отримано.`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}
