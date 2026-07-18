import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/** Lazy expiry: видаляє прострочені запрошення без зміни Party.version. */
export async function purgeExpiredPartyInvitesInTx(
  tx: Tx,
  nowMs: number,
  opts?: { partyId?: string; targetCharacterId?: string }
): Promise<number> {
  const where: Prisma.PartyInviteWhereInput = {
    expiresAt: { lt: new Date(nowMs) },
  };
  if (opts?.partyId) where.partyId = opts.partyId;
  if (opts?.targetCharacterId) where.targetCharacterId = opts.targetCharacterId;

  const expired = await tx.partyInvite.findMany({
    where,
    select: { id: true },
  });
  if (expired.length === 0) return 0;

  await tx.partyInvite.deleteMany({
    where: { id: { in: expired.map((e) => e.id) } },
  });
  return expired.length;
}

export function isPartyInviteExpired(expiresAt: Date, nowMs: number): boolean {
  return expiresAt.getTime() <= nowMs;
}
