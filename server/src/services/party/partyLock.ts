import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export type LockedPartyRow = {
  id: string;
  leaderCharacterId: string;
  version: number;
};

/** Row lock для атомарних мутацій паті (accept, leave, kick, invite, …). */
export async function lockPartyForUpdateInTx(
  tx: Tx,
  partyId: string
): Promise<LockedPartyRow | null> {
  const id = String(partyId || '').trim();
  if (!id) return null;
  const rows = await tx.$queryRaw<
    Array<{ id: string; leaderCharacterId: string; version: number }>
  >`
    SELECT id, "leaderCharacterId", version
    FROM "Party"
    WHERE id = ${id}
    FOR UPDATE
  `;
  return rows[0] ?? null;
}

export function assertPartyVersion(
  locked: LockedPartyRow,
  expectedPartyVersion: number
): void {
  if (locked.version !== expectedPartyVersion) {
    throw new Error('party_version_mismatch');
  }
}

export async function bumpPartyVersionInTx(
  tx: Tx,
  partyId: string
): Promise<number> {
  const updated = await tx.party.update({
    where: { id: partyId },
    data: { version: { increment: 1 } },
    select: { version: true },
  });
  return updated.version;
}
