import { Prisma } from '@prisma/client';
import type { DragonBossConfig } from '../domain/dragonDungeon.js';
import { getDragonBossConfig, parseDragonBossId } from '../domain/dragonDungeon.js';

type DbClient = Prisma.TransactionClient;

export type ClanDragonDungeonRow = {
  id: string;
  clanId: string;
  dragonId: string;
  maxHp: bigint;
  currentHp: bigint;
  openedAt: Date;
  expiresAt: Date;
  defeatedAt: Date | null;
  expiredAt: Date | null;
  rewardPaidAt: Date | null;
};

export function isClanDragonDungeonActive(
  row: Pick<
    ClanDragonDungeonRow,
    'defeatedAt' | 'expiredAt' | 'expiresAt' | 'currentHp'
  >,
  now = new Date()
): boolean {
  if (row.defeatedAt || row.expiredAt) return false;
  if (row.expiresAt <= now) return false;
  return row.currentHp > 0n;
}

export function isClanDragonDungeonAlive(
  row: Pick<ClanDragonDungeonRow, 'defeatedAt' | 'currentHp'>
): boolean {
  return !row.defeatedAt && row.currentHp > 0n;
}

export async function findActiveClanDragonDungeon(
  db: DbClient,
  clanId: string
): Promise<ClanDragonDungeonRow | null> {
  const now = new Date();
  const rows = await db.clanDragonDungeon.findMany({
    where: {
      clanId,
      defeatedAt: null,
      expiredAt: null,
      expiresAt: { gt: now },
      currentHp: { gt: 0n },
    },
    orderBy: { openedAt: 'desc' },
    take: 1,
    select: {
      id: true,
      clanId: true,
      dragonId: true,
      maxHp: true,
      currentHp: true,
      openedAt: true,
      expiresAt: true,
      defeatedAt: true,
      expiredAt: true,
      rewardPaidAt: true,
    },
  });
  return rows[0] ?? null;
}

export async function loadClanDragonDungeonById(
  db: DbClient,
  dungeonId: string
): Promise<ClanDragonDungeonRow | null> {
  return db.clanDragonDungeon.findUnique({
    where: { id: dungeonId },
    select: {
      id: true,
      clanId: true,
      dragonId: true,
      maxHp: true,
      currentHp: true,
      openedAt: true,
      expiresAt: true,
      defeatedAt: true,
      expiredAt: true,
      rewardPaidAt: true,
    },
  });
}

export function resolveDragonConfigForRow(row: ClanDragonDungeonRow): DragonBossConfig | null {
  const id = parseDragonBossId(row.dragonId);
  if (!id) return null;
  return getDragonBossConfig(id);
}

/** Lazy expire: 24h без перемоги. */
export async function expireClanDragonDungeonIfNeeded(
  db: DbClient,
  dungeonId: string,
  now = new Date()
): Promise<ClanDragonDungeonRow | null> {
  const row = await loadClanDragonDungeonById(db, dungeonId);
  if (!row) return null;
  if (row.defeatedAt || row.expiredAt) return row;
  if (row.expiresAt > now) return row;

  await db.clanDragonDungeon.update({
    where: { id: dungeonId, expiredAt: null, defeatedAt: null },
    data: { expiredAt: now },
  });
  await db.clanDragonContribution.updateMany({
    where: { dungeonId, activeBattleAt: { not: null } },
    data: {
      activeBattleAt: null,
      battleEndsAt: null,
      battleStateJson: Prisma.DbNull,
      nextEntryAt: now,
    },
  });
  return loadClanDragonDungeonById(db, dungeonId);
}

/** Завершити прострочену спробу гравця та встановити cooldown. */
export async function finalizeStaleContributionAttempt(
  db: DbClient,
  contributionId: string,
  entryCooldownSeconds: number,
  now = new Date()
): Promise<void> {
  const row = await db.clanDragonContribution.findUnique({
    where: { id: contributionId },
    select: {
      id: true,
      activeBattleAt: true,
      battleEndsAt: true,
    },
  });
  if (!row?.activeBattleAt || !row.battleEndsAt) return;
  if (row.battleEndsAt > now) return;
  const nextEntryAt = new Date(now.getTime() + entryCooldownSeconds * 1000);
  await db.clanDragonContribution.update({
    where: { id: contributionId },
    data: {
      activeBattleAt: null,
      battleEndsAt: null,
      battleStateJson: Prisma.DbNull,
      nextEntryAt,
    },
  });
}

/** Завершити активну спробу (вихід/смерть/таймаут). */
export async function endContributionAttempt(
  db: DbClient,
  contributionId: string,
  opts: { death?: boolean; entryCooldownSeconds: number },
  now = new Date()
): Promise<void> {
  const nextEntryAt = new Date(now.getTime() + opts.entryCooldownSeconds * 1000);
  await db.clanDragonContribution.update({
    where: { id: contributionId },
    data: {
      activeBattleAt: null,
      battleEndsAt: null,
      battleStateJson: Prisma.DbNull,
      nextEntryAt,
      ...(opts.death ? { deaths: { increment: 1 } } : {}),
    },
  });
}

/** Atomic finalization on dragon defeat. Returns true if this tx paid reward. */
export async function finalizeClanDragonDefeatIfNeeded(
  db: DbClient,
  dungeonId: string,
  boss: DragonBossConfig,
  now = new Date()
): Promise<boolean> {
  const dungeonMeta = await db.clanDragonDungeon.findUnique({
    where: { id: dungeonId },
    select: { clanId: true, currentHp: true, defeatedAt: true, rewardPaidAt: true },
  });
  if (!dungeonMeta || dungeonMeta.defeatedAt || dungeonMeta.rewardPaidAt) return false;
  if (dungeonMeta.currentHp > 0n) return false;

  const paid = await db.clanDragonDungeon.updateMany({
    where: {
      id: dungeonId,
      currentHp: { lte: 0n },
      defeatedAt: null,
      rewardPaidAt: null,
    },
    data: {
      defeatedAt: now,
      rewardPaidAt: now,
      currentHp: 0n,
    },
  });
  if (paid.count !== 1) return false;

  await db.clan.update({
    where: { id: dungeonMeta.clanId },
    data: {
      treasuryAdena: { increment: BigInt(boss.reward.adena) },
      treasuryCoinOfLuck: { increment: boss.reward.coinOfLuck },
      clanPoints: { increment: boss.reward.clanReputation },
    },
  });

  await db.clanDragonContribution.updateMany({
    where: { dungeonId, activeBattleAt: { not: null } },
    data: {
      activeBattleAt: null,
      battleEndsAt: null,
      battleStateJson: Prisma.DbNull,
    },
  });
  return true;
}
