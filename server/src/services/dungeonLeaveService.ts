import { Prisma } from '@prisma/client';
import { isPartyBattleEngineEnabled } from '../domain/partyBattleFlags.js';
import { gameConflictFromMutation } from './charConflict.js';
import { prisma } from '../lib/prisma.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { peekPartyBattleIdFromBattleJson } from './party/partyBattleActionLock.js';
import { syncPartyBattleOnDungeonExitInTx } from './party/partyBattleSocialSession.js';

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

    const partyBattleId = isPartyBattleEngineEnabled()
      ? peekPartyBattleIdFromBattleJson(char.battleJson)
      : null;

    if (partyBattleId) {
      await syncPartyBattleOnDungeonExitInTx(trx, {
        characterId: char.id,
        skipCharacterMutation: true,
      });
    }

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        const hasDungeon = current.dungeonStateJson != null;
        const pointer = peekPartyBattleIdFromBattleJson(current.battleJson);
        const clearBattle =
          partyBattleId != null && pointer === partyBattleId;
        if (!hasDungeon && !clearBattle) return { changed: false };
        return {
          changed: true,
          data: {
            ...(hasDungeon ? { dungeonStateJson: Prisma.JsonNull } : {}),
            ...(clearBattle
              ? {
                  battleJson: Prisma.JsonNull,
                  worldCombatStateJson: Prisma.JsonNull,
                }
              : {}),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
