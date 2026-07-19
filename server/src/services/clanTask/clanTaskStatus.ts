import type { ClanTask } from '@prisma/client';

export type ClanTaskStatus =
  | 'ACTIVE'
  | 'READY_TO_CLAIM'
  | 'COMPLETED'
  | 'CANCELLED';

export const CLAN_TASK_OPEN_STATUSES: readonly ClanTaskStatus[] = [
  'ACTIVE',
  'READY_TO_CLAIM',
] as const;

export function deriveClanTaskStatus(row: {
  progress: bigint;
  target: bigint;
  rewardPaidAt: Date | null;
  cancelledAt: Date | null;
  status: string;
}): ClanTaskStatus {
  if (row.cancelledAt) return 'CANCELLED';
  if (row.rewardPaidAt) return 'COMPLETED';
  if (row.progress >= row.target) return 'READY_TO_CLAIM';
  if (row.status === 'CANCELLED') return 'CANCELLED';
  if (row.status === 'COMPLETED') return 'COMPLETED';
  return 'ACTIVE';
}

export function isClanTaskOpen(status: ClanTaskStatus): boolean {
  return status === 'ACTIVE' || status === 'READY_TO_CLAIM';
}

export function clanTaskStatusFromRow(row: ClanTask): ClanTaskStatus {
  return deriveClanTaskStatus(row);
}

export function bigintToJsonNumber(value: bigint): number {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) {
    throw new Error('bigint_unsafe_for_json');
  }
  return n;
}
