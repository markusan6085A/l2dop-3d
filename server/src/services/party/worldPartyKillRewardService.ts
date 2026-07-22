import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export async function hasWorldPartyKillRewardInTx(
  tx: Tx,
  args: {
    killerCharacterId: string;
    spawnId: string;
    killRevision: number;
  }
): Promise<boolean> {
  const count = await tx.worldPartyKillReward.count({
    where: {
      killerCharacterId: args.killerCharacterId,
      spawnId: args.spawnId,
      killRevision: args.killRevision,
    },
  });
  return count > 0;
}

export async function recordWorldPartyKillRewardInTx(
  tx: Tx,
  args: {
    killerCharacterId: string;
    spawnId: string;
    killRevision: number;
    recipientCharacterId: string;
    expGain: number;
    spGain: number;
    adenaGain: bigint;
    notifiedAt?: Date | null;
  }
): Promise<void> {
  await tx.worldPartyKillReward.create({
    data: {
      killerCharacterId: args.killerCharacterId,
      spawnId: args.spawnId,
      killRevision: args.killRevision,
      recipientCharacterId: args.recipientCharacterId,
      expGain: args.expGain,
      spGain: args.spGain,
      adenaGain: args.adenaGain,
      ...(args.notifiedAt ? { notifiedAt: args.notifiedAt } : {}),
    },
  });
}
