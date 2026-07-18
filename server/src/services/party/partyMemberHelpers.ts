import type { Prisma } from '@prisma/client';
import { PARTY_MAX_MEMBERS } from './partyConstants.js';

type Tx = Prisma.TransactionClient;

export async function assertCharacterNotInPartyInTx(
  tx: Tx,
  characterId: string
): Promise<void> {
  const row = await tx.partyMember.findUnique({
    where: { characterId },
    select: { partyId: true },
  });
  if (row) throw new Error('party_target_in_party');
}

export async function countPartyMembersInTx(
  tx: Tx,
  partyId: string
): Promise<number> {
  return tx.partyMember.count({ where: { partyId } });
}

export async function assertPartyNotFullInTx(
  tx: Tx,
  partyId: string
): Promise<void> {
  const count = await countPartyMembersInTx(tx, partyId);
  if (count >= PARTY_MAX_MEMBERS) throw new Error('party_full');
}

/** Зайняті slotOrder після lock Party — перший вільний 0..4 або null (party_full). */
export async function findFirstFreeSlotOrderInTx(
  tx: Tx,
  partyId: string
): Promise<number | null> {
  const rows = await tx.partyMember.findMany({
    where: { partyId },
    select: { slotOrder: true },
  });
  const taken = new Set(rows.map((r) => r.slotOrder));
  for (let slot = 0; slot < PARTY_MAX_MEMBERS; slot++) {
    if (!taken.has(slot)) return slot;
  }
  return null;
}

/** Видалити всі активні запрошення для target (create/accept). */
export async function purgeAllPartyInvitesForTargetInTx(
  tx: Tx,
  targetCharacterId: string
): Promise<void> {
  await tx.partyInvite.deleteMany({ where: { targetCharacterId } });
}
