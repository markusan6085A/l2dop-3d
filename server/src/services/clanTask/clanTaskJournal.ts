import type { Prisma } from '@prisma/client';
import {
  getClanTaskDefinition,
  type ClanTaskId,
} from '../../domain/clanTasks.js';
import { formatClanTaskPersonalRewardUk } from './clanTaskRewards.js';

type DbClient = Prisma.TransactionClient | typeof import('../../lib/prisma.js').prisma;

export async function postClanTaskJournalTaken(
  db: DbClient,
  clanId: string,
  characterId: string,
  ownerName: string,
  taskType: ClanTaskId
): Promise<void> {
  const def = getClanTaskDefinition(taskType);
  const text = `${ownerName} взяв кланове завдання «${def.nameUk}».`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}

export async function postClanTaskJournalHelped(
  db: DbClient,
  clanId: string,
  characterId: string,
  helperName: string,
  ownerName: string,
  taskType: ClanTaskId
): Promise<void> {
  const def = getClanTaskDefinition(taskType);
  const text =
    `${helperName} приєднався до завдання «${def.nameUk}», яке виконує ${ownerName}.`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}

export async function postClanTaskJournalCompleted(
  db: DbClient,
  clanId: string,
  characterId: string,
  ownerName: string,
  taskType: ClanTaskId,
  clanDiamonds: number
): Promise<void> {
  const def = getClanTaskDefinition(taskType);
  const personal = formatClanTaskPersonalRewardUk(def.personalReward);
  const text =
    `Кланове завдання «${def.nameUk}» завершено.\n` +
    `${ownerName} отримав ${personal}.\n` +
    `Клан отримав ${clanDiamonds} алмазів.`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}

export async function postClanTaskJournalCancelled(
  db: DbClient,
  clanId: string,
  characterId: string,
  ownerName: string,
  taskType: ClanTaskId
): Promise<void> {
  const def = getClanTaskDefinition(taskType);
  const text = `${ownerName} скасував кланове завдання «${def.nameUk}».`;
  await db.clanChatMessage.create({
    data: { clanId, characterId, text },
  });
}
