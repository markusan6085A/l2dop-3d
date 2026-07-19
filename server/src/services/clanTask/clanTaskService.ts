import type { ClanTask, Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import {
  CLAN_TASK_DEFINITIONS,
  CLAN_TASK_ORDER,
  getClanTaskDefinition,
  parseClanTaskId,
  type ClanTaskId,
} from '../../domain/clanTasks.js';
import { isPrismaUniqueViolation } from '../party/partyPrismaErrors.js';
import {
  bigintToJsonNumber,
  clanTaskStatusFromRow,
  CLAN_TASK_OPEN_STATUSES,
  type ClanTaskStatus,
} from './clanTaskStatus.js';
import { grantClanTaskPersonalRewardInTx } from './clanTaskRewards.js';
import {
  postClanTaskJournalCancelled,
  postClanTaskJournalCompleted,
  postClanTaskJournalHelped,
  postClanTaskJournalTaken,
} from './clanTaskJournal.js';

type Tx = Prisma.TransactionClient;

export type ClanTaskPersonalRewardDto = {
  exp: number;
  adena: number;
  coinOfLuck: number;
};

export type ClanTaskDefinitionDto = {
  id: ClanTaskId;
  name: string;
  description: string;
  target: number;
  progressLabel: string;
  personalReward: ClanTaskPersonalRewardDto;
  clanRewardDiamonds: number;
  canTake: boolean;
  blockedReason: string | null;
};

export type ClanTaskContributionDto = {
  characterId: string;
  characterName: string;
  progress: number;
};

export type ActiveClanTaskDto = {
  id: string;
  taskType: ClanTaskId;
  name: string;
  owner: { id: string; name: string };
  helper: { id: string; name: string } | null;
  target: number;
  progress: number;
  progressPercent: number;
  status: ClanTaskStatus;
  personalReward: ClanTaskPersonalRewardDto;
  clanRewardDiamonds: number;
  canHelp: boolean;
  canClaim: boolean;
  canCancel: boolean;
  contributions: ClanTaskContributionDto[];
};

export type ClanTasksViewDto = {
  clan: { id: string; name: string; diamonds: number } | null;
  me: {
    characterId: string;
    activeTaskId: string | null;
    role: 'OWNER' | 'HELPER' | null;
  } | null;
  taskDefinitions: ClanTaskDefinitionDto[];
  activeClanTasks: ActiveClanTaskDto[];
};

async function resolveCharacterForUser(userId: string) {
  return prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
    include: { clan: { select: { id: true, name: true, diamonds: true } } },
  });
}

function mapPersonalReward(
  reward: ClanTaskPersonalRewardDto
): ClanTaskPersonalRewardDto {
  return {
    exp: reward.exp ?? 0,
    adena: reward.adena ?? 0,
    coinOfLuck: reward.coinOfLuck ?? 0,
  };
}

function mapActiveTask(
  row: ClanTask & {
    owner: { id: string; name: string };
    helper: { id: string; name: string } | null;
    contributions: Array<{
      characterId: string;
      progress: bigint;
      character: { name: string };
    }>;
  },
  viewerId: string
): ActiveClanTaskDto {
  const def = getClanTaskDefinition(row.taskType as ClanTaskId);
  const target = bigintToJsonNumber(row.target);
  const progress = bigintToJsonNumber(row.progress);
  const status = clanTaskStatusFromRow(row);
  const isOwner = row.ownerId === viewerId;
  const isHelper = row.helperId === viewerId;
  const isParticipant = isOwner || isHelper;
  const canClaim =
    isParticipant &&
    status === 'READY_TO_CLAIM' &&
    row.rewardPaidAt == null;
  return {
    id: row.id,
    taskType: def.id,
    name: def.nameUk,
    owner: { id: row.owner.id, name: row.owner.name },
    helper: row.helper
      ? { id: row.helper.id, name: row.helper.name }
      : null,
    target,
    progress,
    progressPercent: target > 0 ? Math.min(100, (progress / target) * 100) : 0,
    status,
    personalReward: mapPersonalReward(def.personalReward),
    clanRewardDiamonds: def.clanRewardDiamonds,
    canHelp:
      !isOwner &&
      !isHelper &&
      row.helperId == null &&
      CLAN_TASK_OPEN_STATUSES.includes(status),
    canClaim,
    canCancel: isOwner && CLAN_TASK_OPEN_STATUSES.includes(status),
    contributions: row.contributions.map((c) => ({
      characterId: c.characterId,
      characterName: c.character.name,
      progress: bigintToJsonNumber(c.progress),
    })),
  };
}

export async function getClanTasksForUser(
  userId: string
): Promise<ClanTasksViewDto | null> {
  const char = await resolveCharacterForUser(userId);
  if (!char) return null;

  const participantLock = await prisma.clanTaskParticipantLock.findUnique({
    where: { characterId: char.id },
  });

  let meRole: 'OWNER' | 'HELPER' | null = null;
  if (participantLock) {
    meRole = participantLock.role === 'HELPER' ? 'HELPER' : 'OWNER';
  }

  const participantBusy = participantLock != null;

  const taskDefinitions: ClanTaskDefinitionDto[] = CLAN_TASK_ORDER.map((id) => {
    const def = CLAN_TASK_DEFINITIONS[id];
    return {
      id: def.id,
      name: def.nameUk,
      description: def.descriptionUk,
      target: def.target,
      progressLabel: def.progressLabel,
      personalReward: mapPersonalReward(def.personalReward),
      clanRewardDiamonds: def.clanRewardDiamonds,
      canTake: !!char.clanId && !participantBusy,
      blockedReason: !char.clanId
        ? 'clan_required'
        : participantBusy
          ? 'participant_busy'
          : null,
    };
  });

  let activeClanTasks: ActiveClanTaskDto[] = [];
  if (char.clanId) {
    const rows = await prisma.clanTask.findMany({
      where: {
        clanId: char.clanId,
        status: { in: [...CLAN_TASK_OPEN_STATUSES] },
        rewardPaidAt: null,
        cancelledAt: null,
      },
      include: {
        owner: { select: { id: true, name: true } },
        helper: { select: { id: true, name: true } },
        contributions: {
          include: { character: { select: { name: true } } },
        },
      },
      orderBy: { takenAt: 'asc' },
    });
    activeClanTasks = rows.map((r) => mapActiveTask(r, char.id));
  }

  return {
    clan: char.clan
      ? {
          id: char.clan.id,
          name: char.clan.name,
          diamonds: char.clan.diamonds,
        }
      : null,
    me: {
      characterId: char.id,
      activeTaskId: participantLock?.taskId ?? null,
      role: meRole,
    },
    taskDefinitions,
    activeClanTasks,
  };
}

async function loadActiveTaskInTx(tx: Tx, taskId: string, clanId: string) {
  return tx.clanTask.findFirst({
    where: { id: taskId, clanId },
    include: {
      owner: { select: { id: true, name: true } },
      helper: { select: { id: true, name: true } },
      contributions: {
        include: { character: { select: { name: true } } },
      },
    },
  });
}

export async function takeClanTaskForUser(
  userId: string,
  taskTypeRaw: string | undefined
): Promise<ClanTasksViewDto> {
  const taskType = parseClanTaskId(taskTypeRaw);
  if (!taskType) throw new Error('clan_task_not_found');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('character_not_found');
    if (!char.clanId) throw new Error('clan_required');

    const existingLock = await tx.clanTaskParticipantLock.findUnique({
      where: { characterId: char.id },
    });
    if (existingLock) throw new Error('clan_task_participant_busy');

    const def = getClanTaskDefinition(taskType);
    const task = await tx.clanTask.create({
      data: {
        clanId: char.clanId,
        taskType,
        ownerId: char.id,
        target: BigInt(def.target),
        progress: 0n,
        status: 'ACTIVE',
      },
    });

    try {
      await tx.clanTaskParticipantLock.create({
        data: {
          characterId: char.id,
          taskId: task.id,
          role: 'OWNER',
        },
      });
    } catch (err) {
      if (isPrismaUniqueViolation(err)) {
        throw new Error('clan_task_take_conflict');
      }
      throw err;
    }

    await tx.clanTaskContribution.create({
      data: {
        taskId: task.id,
        characterId: char.id,
        progress: 0n,
      },
    });

    await postClanTaskJournalTaken(
      tx,
      char.clanId,
      char.id,
      char.name,
      taskType
    );
  });

  const view = await getClanTasksForUser(userId);
  if (!view) throw new Error('character_not_found');
  return view;
}

export async function helpClanTaskForUser(
  userId: string,
  taskId: string | undefined
): Promise<ClanTasksViewDto> {
  if (!taskId) throw new Error('clan_task_not_found');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('character_not_found');
    if (!char.clanId) throw new Error('clan_required');

    const task = await tx.clanTask.findUnique({
      where: { id: taskId },
      include: { owner: { select: { name: true } } },
    });
    if (!task) throw new Error('clan_task_not_found');
    if (task.clanId !== char.clanId) throw new Error('clan_task_other_clan');
    if (task.ownerId === char.id) throw new Error('clan_task_cannot_help_self');

    const status = clanTaskStatusFromRow(task);
    if (!CLAN_TASK_OPEN_STATUSES.includes(status)) {
      throw new Error('clan_task_not_found');
    }
    if (task.helperId != null) throw new Error('clan_task_helper_exists');

    const existingLock = await tx.clanTaskParticipantLock.findUnique({
      where: { characterId: char.id },
    });
    if (existingLock) throw new Error('clan_task_participant_busy');

    const updated = await tx.clanTask.updateMany({
      where: {
        id: taskId,
        clanId: char.clanId,
        helperId: null,
        rewardPaidAt: null,
        cancelledAt: null,
        status: { in: [...CLAN_TASK_OPEN_STATUSES] },
      },
      data: {
        helperId: char.id,
        helperJoinedAt: new Date(),
      },
    });
    if (updated.count !== 1) throw new Error('clan_task_helper_exists');

    try {
      await tx.clanTaskParticipantLock.create({
        data: {
          characterId: char.id,
          taskId,
          role: 'HELPER',
        },
      });
    } catch (err) {
      if (isPrismaUniqueViolation(err)) {
        throw new Error('clan_task_participant_busy');
      }
      throw err;
    }

    await tx.clanTaskContribution.create({
      data: {
        taskId,
        characterId: char.id,
        progress: 0n,
      },
    });

    await postClanTaskJournalHelped(
      tx,
      char.clanId,
      char.id,
      char.name,
      task.owner.name,
      task.taskType as ClanTaskId
    );
  });

  const view = await getClanTasksForUser(userId);
  if (!view) throw new Error('character_not_found');
  return view;
}

export async function claimClanTaskForUser(
  userId: string,
  taskId: string | undefined
): Promise<ClanTasksViewDto> {
  if (!taskId) throw new Error('clan_task_not_found');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('character_not_found');
    if (!char.clanId) throw new Error('clan_required');

    const task = await tx.clanTask.findFirst({
      where: { id: taskId, clanId: char.clanId },
      include: { owner: { select: { id: true, name: true } } },
    });
    if (!task) throw new Error('clan_task_not_found');
    if (char.id !== task.ownerId && char.id !== task.helperId) {
      throw new Error('clan_task_claim_forbidden');
    }
    if (task.progress < task.target) throw new Error('clan_task_not_ready');
    if (task.rewardPaidAt != null) return;

    const now = new Date();
    const finalized = await tx.clanTask.updateMany({
      where: {
        id: taskId,
        rewardPaidAt: null,
        completedAt: null,
        progress: { gte: task.target },
        status: { in: ['ACTIVE', 'READY_TO_CLAIM'] },
      },
      data: {
        status: 'COMPLETED',
        completedAt: now,
        completedById: char.id,
        rewardPaidAt: now,
      },
    });
    if (finalized.count !== 1) {
      const fresh = await tx.clanTask.findUnique({ where: { id: taskId } });
      if (fresh?.rewardPaidAt != null) return;
      throw new Error('clan_task_claim_conflict');
    }

    const def = getClanTaskDefinition(task.taskType as ClanTaskId);
    await grantClanTaskPersonalRewardInTx(tx, task.ownerId, def.personalReward);
    await tx.clan.update({
      where: { id: task.clanId },
      data: { diamonds: { increment: def.clanRewardDiamonds } },
    });
    await tx.clanTaskParticipantLock.deleteMany({ where: { taskId } });

    await postClanTaskJournalCompleted(
      tx,
      task.clanId,
      char.id,
      task.owner.name,
      task.taskType as ClanTaskId,
      def.clanRewardDiamonds
    );
  });

  const view = await getClanTasksForUser(userId);
  if (!view) throw new Error('character_not_found');
  return view;
}

export async function cancelClanTaskForUser(
  userId: string,
  taskId: string | undefined
): Promise<ClanTasksViewDto> {
  if (!taskId) throw new Error('clan_task_not_found');

  await prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) throw new Error('character_not_found');
    if (!char.clanId) throw new Error('clan_required');

    const task = await tx.clanTask.findFirst({
      where: { id: taskId, clanId: char.clanId },
    });
    if (!task) throw new Error('clan_task_not_found');
    if (task.ownerId !== char.id) throw new Error('clan_task_cancel_forbidden');

    const status = clanTaskStatusFromRow(task);
    if (!CLAN_TASK_OPEN_STATUSES.includes(status)) {
      throw new Error('clan_task_not_found');
    }

    const updated = await tx.clanTask.updateMany({
      where: {
        id: taskId,
        ownerId: char.id,
        rewardPaidAt: null,
        cancelledAt: null,
        status: { in: [...CLAN_TASK_OPEN_STATUSES] },
      },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });
    if (updated.count !== 1) throw new Error('clan_task_cancel_conflict');

    await tx.clanTaskParticipantLock.deleteMany({ where: { taskId } });

    await postClanTaskJournalCancelled(
      tx,
      char.clanId,
      char.id,
      char.name,
      task.taskType as ClanTaskId
    );
  });

  const view = await getClanTasksForUser(userId);
  if (!view) throw new Error('character_not_found');
  return view;
}

export { loadActiveTaskInTx };
