import type { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

/** Ідемпотентно позначити учасника вибулим з конкретної облоги (лише siege PvP смерть). */
export async function markSiegeParticipantEliminatedInTx(
  tx: Tx,
  args: {
    siegeId: string;
    characterId: string;
    eliminatedByCharacterId: string;
    nowMs?: number;
  }
): Promise<boolean> {
  const siegeId = String(args.siegeId || '').trim();
  const characterId = String(args.characterId || '').trim();
  const eliminatedByCharacterId = String(args.eliminatedByCharacterId || '').trim();
  if (!siegeId || !characterId || !eliminatedByCharacterId) return false;

  const existing = await tx.clanSiegeParticipant.findUnique({
    where: {
      siegeId_characterId: { siegeId, characterId },
    },
    select: { id: true, eliminatedAt: true },
  });
  if (!existing) return false;
  if (existing.eliminatedAt) return false;

  const eliminatedAt = new Date(args.nowMs ?? Date.now());
  await tx.clanSiegeParticipant.update({
    where: { id: existing.id },
    data: {
      eliminatedAt,
      eliminatedByCharacterId,
    },
  });
  return true;
}

export function isSiegeParticipantAlive(args: {
  eliminatedAt: Date | null | undefined;
  hp: number | null | undefined;
}): boolean {
  if (args.eliminatedAt) return false;
  return Math.max(0, Math.floor(Number(args.hp) || 0)) > 0;
}
