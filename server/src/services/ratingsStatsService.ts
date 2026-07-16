import { Prisma } from '@prisma/client';
import { mutateCharacterWithRevision } from './characterMutation.js';

type Tx = Prisma.TransactionClient;

/** +1 участь у перемозі над рейд-босом (внутрішня мутація, без expectedRevision). */
export async function creditRaidBossKillInTx(
  tx: Tx,
  characterId: string
): Promise<void> {
  const id = String(characterId || '').trim();
  if (!id) return;
  const row = await tx.character.findUnique({ where: { id } });
  if (!row) return;
  const next = Math.max(0, Math.floor(Number(row.raidBossKills) || 0)) + 1;
  await mutateCharacterWithRevision(tx, id, null, () => ({
    changed: true,
    data: { raidBossKills: next },
  }));
}
