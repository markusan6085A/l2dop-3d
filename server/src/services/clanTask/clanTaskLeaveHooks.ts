import type { Prisma } from '@prisma/client';
import {
  CLAN_TASK_OPEN_STATUSES,
  clanTaskStatusFromRow,
} from './clanTaskStatus.js';

type Tx = Prisma.TransactionClient;

async function releaseClanTaskLocksInTx(tx: Tx, taskId: string): Promise<void> {
  await tx.clanTaskParticipantLock.deleteMany({ where: { taskId } });
}

async function cancelClanTaskAsOwnerLeftInTx(
  tx: Tx,
  taskId: string
): Promise<void> {
  const task = await tx.clanTask.findUnique({ where: { id: taskId } });
  if (!task) return;
  const status = clanTaskStatusFromRow(task);
  if (!CLAN_TASK_OPEN_STATUSES.includes(status as never)) return;

  await tx.clanTask.update({
    where: { id: taskId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });
  await releaseClanTaskLocksInTx(tx, taskId);
}

/** Викликати в tx, коли персонаж покидає клан. */
export async function handleClanTaskParticipantClanLeaveInTx(
  tx: Tx,
  characterId: string
): Promise<void> {
  const owned = await tx.clanTask.findFirst({
    where: {
      ownerId: characterId,
      status: { in: [...CLAN_TASK_OPEN_STATUSES] },
      rewardPaidAt: null,
      cancelledAt: null,
    },
  });
  if (owned) {
    await cancelClanTaskAsOwnerLeftInTx(tx, owned.id);
    return;
  }

  const helping = await tx.clanTask.findFirst({
    where: {
      helperId: characterId,
      status: { in: [...CLAN_TASK_OPEN_STATUSES] },
      rewardPaidAt: null,
      cancelledAt: null,
    },
  });
  if (!helping) return;

  await tx.clanTask.update({
    where: { id: helping.id },
    data: {
      helperId: null,
      helperJoinedAt: null,
    },
  });
  await tx.clanTaskParticipantLock.deleteMany({
    where: { characterId },
  });
}
