import { Prisma } from '@prisma/client';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';

type Tx = Prisma.TransactionClient;

/** +1 участь у перемозі над рейд-босом — Prisma increment, без Character.revision++. */
export async function creditRaidBossKillInTx(
  tx: Tx,
  characterId: string
): Promise<void> {
  const id = String(characterId || '').trim();
  if (!id) return;
  await persistCharacterFieldsInTx(tx, id, {
    raidBossKills: { increment: 1 },
  });
}
