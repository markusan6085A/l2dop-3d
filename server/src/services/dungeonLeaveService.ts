import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import { prisma } from '../lib/prisma.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { syncPartyBattleOnDungeonExitInTx } from './party/partyBattleSocialSession.js';
import { isPartyBattleEngineEnabled } from '../domain/partyBattleFlags.js';

/**
 * Вихід із сесії подземелля (світова карта / місто).
 * Один акаунт — одне «місце»: відкриття map/city на іншому пристрої закриває катакомби.
 */
export async function performDungeonLeave(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');

    if (isPartyBattleEngineEnabled()) {
      await syncPartyBattleOnDungeonExitInTx(trx, {
        characterId: char.id,
      });
    }

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        if (current.dungeonStateJson == null) return { changed: false };
        return {
          changed: true,
          data: {
            dungeonStateJson: Prisma.JsonNull,
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
