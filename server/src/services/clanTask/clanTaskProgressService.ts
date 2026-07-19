import type { Prisma } from '@prisma/client';
import {
  CLAN_TASK_RAID_BOSS_LEVEL_TOLERANCE,
  getClanTaskDefinition,
  type ClanTaskProgressType,
} from '../../domain/clanTasks.js';
import {
  clanTaskStatusFromRow,
  isClanTaskOpen,
} from './clanTaskStatus.js';

type Tx = Prisma.TransactionClient;

export type ClanTaskProgressInput = {
  tx: Tx;
  characterId: string;
  eventType: ClanTaskProgressType;
  amount: bigint | number;
  eventKey: string;
  characterLevel?: number;
  raidBossLevel?: number;
};

function toBigIntAmount(amount: bigint | number): bigint {
  if (typeof amount === 'bigint') return amount > 0n ? amount : 0n;
  const n = Math.floor(Number(amount));
  if (!Number.isFinite(n) || n <= 0) return 0n;
  return BigInt(n);
}

/** Idempotent progress для активного кланового завдання персонажа. */
export async function addClanTaskProgressForCharacter(
  input: ClanTaskProgressInput
): Promise<boolean> {
  const { tx, characterId, eventType, eventKey } = input;
  const amount = toBigIntAmount(input.amount);
  if (amount <= 0n) return false;

  const lock = await tx.clanTaskParticipantLock.findUnique({
    where: { characterId },
    include: { task: true },
  });
  if (!lock?.task) return false;

  const task = lock.task;
  const status = clanTaskStatusFromRow(task);
  if (!isClanTaskOpen(status)) return false;
  if (task.progress >= task.target) return false;

  const def = getClanTaskDefinition(task.taskType as never);
  if (def.progressType !== eventType) return false;

  if (characterId !== task.ownerId && characterId !== task.helperId) {
    return false;
  }

  if (eventType === 'RAID_BOSS_KILLS') {
    const charLevel = input.characterLevel ?? 0;
    const bossLevel = input.raidBossLevel ?? 0;
    if (
      Math.abs(charLevel - bossLevel) > CLAN_TASK_RAID_BOSS_LEVEL_TOLERANCE
    ) {
      return false;
    }
  }

  const existingEvent = await tx.clanTaskProgressEvent.findUnique({
    where: {
      taskId_eventKey: { taskId: task.id, eventKey },
    },
  });
  if (existingEvent) return false;

  await tx.clanTaskProgressEvent.create({
    data: {
      taskId: task.id,
      characterId,
      eventKey,
      eventType,
      amount,
    },
  });

  const remaining = task.target - task.progress;
  const applied = amount > remaining ? remaining : amount;
  if (applied <= 0n) return false;

  await tx.clanTaskContribution.update({
    where: {
      taskId_characterId: { taskId: task.id, characterId },
    },
    data: { progress: { increment: applied } },
  });

  const nextProgress = task.progress + applied;
  const nextStatus = nextProgress >= task.target ? 'READY_TO_CLAIM' : 'ACTIVE';

  await tx.clanTask.update({
    where: { id: task.id },
    data: {
      progress: nextProgress,
      status: nextStatus,
    },
  });

  return true;
}

export async function creditClanTaskRaidBossKillInTx(
  tx: Tx,
  characterId: string,
  spawnId: string,
  characterLevel: number,
  raidBossLevel: number
): Promise<boolean> {
  return addClanTaskProgressForCharacter({
    tx,
    characterId,
    eventType: 'RAID_BOSS_KILLS',
    amount: 1,
    eventKey: `rb:${spawnId}:${characterId}`,
    characterLevel,
    raidBossLevel,
  });
}
