import type { ClanSiege, Prisma } from '@prisma/client';
import {
  SIEGE_REWARD_CLAN_POINTS,
  SIEGE_WALL_DAMAGE_MAX,
  SIEGE_WALL_DAMAGE_MIN,
} from '../../domain/clanSiegeConfig.js';
import {
  CLAN_SIEGE_FINISH_REASON,
  CLAN_SIEGE_STATE,
  type ClanSiegeFinishReasonValue,
} from '../../domain/clanSiegeConstants.js';
import { prisma } from '../../lib/prisma.js';
import { isPrismaUniqueViolation } from '../party/partyPrismaErrors.js';

type Tx = Prisma.TransactionClient;

export type SiegeWinnerRow = {
  clanId: string;
  totalDamage: number;
  lastHitAt: Date | null;
};

export async function resolveSiegeWinnerClanInTx(
  tx: Tx,
  siegeId: string,
  ownerClanId: string | null | undefined
): Promise<SiegeWinnerRow | null> {
  const ownerId = ownerClanId ? String(ownerClanId).trim() : '';
  const rows = await tx.clanSiegeClanDamage.findMany({
    where: { siegeId, totalDamage: { gt: 0 } },
    orderBy: [
      { totalDamage: 'desc' },
      { firstHitAt: 'asc' },
      { clanId: 'asc' },
    ],
    select: { clanId: true, totalDamage: true, lastHitAt: true },
  });

  for (const row of rows) {
    if (ownerId && row.clanId === ownerId) continue;
    const aliveCount = await tx.clanSiegeParticipant.count({
      where: {
        siegeId,
        clanId: row.clanId,
        eliminatedAt: null,
        character: { hp: { gt: 0 } },
      },
    });
    if (aliveCount > 0) {
      return {
        clanId: row.clanId,
        totalDamage: row.totalDamage,
        lastHitAt: row.lastHitAt,
      };
    }
  }
  return null;
}

export async function lockClanSiegeInTx(
  tx: Tx,
  siegeId: string
): Promise<ClanSiege | null> {
  const id = String(siegeId || '').trim();
  if (!id) return null;
  const rows = await tx.$queryRaw<ClanSiege[]>`
    SELECT *
    FROM "ClanSiege"
    WHERE id = ${id}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export async function lockClanSiegeParticipantInTx(
  tx: Tx,
  siegeId: string,
  characterId: string
): Promise<{
  id: string;
  totalWallDamage: number;
  lastWallAttackAt: Date | null;
  clanId: string;
  eliminatedAt: Date | null;
} | null> {
  const sid = String(siegeId || '').trim();
  const cid = String(characterId || '').trim();
  if (!sid || !cid) return null;
  const rows = await tx.$queryRaw<
    {
      id: string;
      totalWallDamage: number;
      lastWallAttackAt: Date | null;
      clanId: string;
      eliminatedAt: Date | null;
    }[]
  >`
    SELECT id, "totalWallDamage", "lastWallAttackAt", "clanId", "eliminatedAt"
    FROM "ClanSiegeParticipant"
    WHERE "siegeId" = ${sid} AND "characterId" = ${cid}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

async function readClanSiegeByIdInTx(
  tx: Tx,
  siegeId: string
): Promise<ClanSiege | null> {
  return tx.clanSiege.findUnique({ where: { id: siegeId } });
}

async function grantSiegeRewardOnceInTx(
  tx: Tx,
  siege: ClanSiege,
  winnerClanId: string,
  now: Date
): Promise<boolean> {
  if (siege.rewardGrantedAt) return false;

  try {
    await tx.clanSiegeRewardLedger.create({
      data: {
        siegeId: siege.id,
        clanId: winnerClanId,
        points: SIEGE_REWARD_CLAN_POINTS,
      },
    });
  } catch (err) {
    if (isPrismaUniqueViolation(err)) {
      return false;
    }
    throw err;
  }

  await tx.clan.update({
    where: { id: winnerClanId },
    data: { clanPoints: { increment: SIEGE_REWARD_CLAN_POINTS } },
  });

  await tx.cityCastle.upsert({
    where: { cityId: siege.cityId },
    create: {
      cityId: siege.cityId,
      ownerClanId: winnerClanId,
      capturedAt: now,
    },
    update: {
      ownerClanId: winnerClanId,
      capturedAt: now,
    },
  });

  await tx.clanSiege.update({
    where: { id: siege.id },
    data: { rewardGrantedAt: now },
  });

  return true;
}

export async function finishClanSiegeInTx(
  tx: Tx,
  siegeId: string,
  finishReason: ClanSiegeFinishReasonValue,
  nowMs = Date.now()
): Promise<ClanSiege | null> {
  const locked = await lockClanSiegeInTx(tx, siegeId);
  if (!locked) return null;
  if (locked.state === CLAN_SIEGE_STATE.finished) {
    return readClanSiegeByIdInTx(tx, locked.id);
  }

  const now = new Date(nowMs);
  let winnerClanId: string | null = null;
  let resolvedFinishReason = finishReason;

  if (finishReason === CLAN_SIEGE_FINISH_REASON.wallDestroyed) {
    const castle = await tx.cityCastle.findUnique({
      where: { cityId: locked.cityId },
      select: { ownerClanId: true },
    });
    const winner = await resolveSiegeWinnerClanInTx(
      tx,
      locked.id,
      castle?.ownerClanId ?? null
    );
    winnerClanId = winner?.clanId ?? null;
    if (!winnerClanId) {
      resolvedFinishReason =
        CLAN_SIEGE_FINISH_REASON.wallDestroyedNoEligibleAttacker;
    }
  }

  const claim = await tx.clanSiege.updateMany({
    where: {
      id: locked.id,
      state: CLAN_SIEGE_STATE.active,
    },
    data: {
      state: CLAN_SIEGE_STATE.finished,
      finishedAt: now,
      finishReason: resolvedFinishReason,
      winnerClanId,
      wallHp:
        finishReason === CLAN_SIEGE_FINISH_REASON.wallDestroyed
          ? 0
          : locked.wallHp,
    },
  });

  if (claim.count === 0) {
    return readClanSiegeByIdInTx(tx, locked.id);
  }

  const updated = await readClanSiegeByIdInTx(tx, locked.id);
  if (!updated) return null;

  if (
    resolvedFinishReason === CLAN_SIEGE_FINISH_REASON.wallDestroyed &&
    winnerClanId
  ) {
    await grantSiegeRewardOnceInTx(tx, updated, winnerClanId, now);
  }

  return readClanSiegeByIdInTx(tx, locked.id);
}

export async function finishExpiredActiveSieges(nowMs = Date.now()): Promise<number> {
  const now = new Date(nowMs);
  const rows = await prisma.clanSiege.findMany({
    where: {
      state: CLAN_SIEGE_STATE.active,
      endsAt: { lte: now },
    },
    select: { id: true },
  });
  let count = 0;
  for (const row of rows) {
    await prisma.$transaction((tx) =>
      finishClanSiegeInTx(
        tx,
        row.id,
        CLAN_SIEGE_FINISH_REASON.timeExpired,
        nowMs
      )
    );
    count += 1;
  }
  return count;
}

export function rollSiegeWallDamage(): number {
  const span = SIEGE_WALL_DAMAGE_MAX - SIEGE_WALL_DAMAGE_MIN + 1;
  return SIEGE_WALL_DAMAGE_MIN + Math.floor(Math.random() * span);
}
