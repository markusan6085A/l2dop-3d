import { Prisma } from '@prisma/client';
import { findSevenSignsDungeonById } from '../data/sevenSignsDungeons.js';
import { nearestMapTown } from '../data/mapLocalities.js';
import { parseBattleJson } from '../domain/battle.js';
import {
  mergeMobSpawnHpEntry,
  mobSpawnHpFromBattleJson,
  parseMobSpawnHpState,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import { prisma } from '../lib/prisma.js';
import {
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  movementFieldsChanged,
  normalizePassiveAndMove,
} from './charWorldMutations.js';
import { SEVEN_SIGNS_DUNGEON_TELEPORT_ADENA_COST } from './sevenSignsDungeonListService.js';

/**
 * Телепорт до входу некрополя/катакомби на світовій карті (без авто-входу всередину).
 */
export async function performSevenSignsDungeonTeleport(
  userId: string,
  dungeonId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const key = String(dungeonId || '').trim();
  const dungeon = findSevenSignsDungeonById(key);
  if (!dungeon) throw new Error('seven_signs_dungeon_unknown');

  const wx = Math.floor(dungeon.worldX);
  const wy = Math.floor(dungeon.worldY);
  const fee = BigInt(SEVEN_SIGNS_DUNGEON_TELEPORT_ADENA_COST);

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        if (fee > 0n && base.adena < fee) {
          throw new Error('seven_signs_dungeon_teleport_not_enough_adena');
        }
        const near = nearestMapTown(wx, wy);
        const hadDungeonState =
          current.dungeonStateJson != null && current.dungeonStateJson !== Prisma.JsonNull;
        const changed =
          base.hp !== current.hp ||
          movementFieldsChanged(current as CharacterRow, base) ||
          base.worldX !== wx ||
          base.worldY !== wy ||
          base.targetX !== 0 ||
          base.targetY !== 0 ||
          base.moveStartAt != null ||
          base.moveFromX !== wx ||
          base.moveFromY !== wy ||
          base.cityId !== near.cityId ||
          base.battleJson != null ||
          hadDungeonState ||
          fee > 0n;
        if (!changed) return { changed: false };

        const bj = parseBattleJson(base.battleJson);
        const hpSnap = mobSpawnHpFromBattleJson(bj);
        let nextMobSpawnHpJson: Prisma.InputJsonValue | typeof Prisma.JsonNull =
          serializeMobSpawnHpState(parseMobSpawnHpState(base.mobSpawnHpJson));
        if (hpSnap) {
          const merged = mergeMobSpawnHpEntry(
            parseMobSpawnHpState(base.mobSpawnHpJson),
            hpSnap.spawnId,
            hpSnap.mobHp,
            hpSnap.mobHpMax
          );
          nextMobSpawnHpJson = serializeMobSpawnHpState(merged);
        }

        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: wx,
            worldY: wy,
            targetX: 0,
            targetY: 0,
            moveStartAt: null,
            moveFromX: wx,
            moveFromY: wy,
            cityId: near.cityId,
            battleJson: Prisma.JsonNull,
            dungeonStateJson: Prisma.JsonNull,
            mobSpawnHpJson: nextMobSpawnHpJson,
            ...(fee > 0n ? { adena: { decrement: fee } } : {}),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return toSnapshot(result.character as CharacterRow);
  });
}
