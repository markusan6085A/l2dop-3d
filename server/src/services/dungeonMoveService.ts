import { Prisma } from '@prisma/client';
import { gameConflictFromMutation } from './charConflict.js';
import { prisma } from '../lib/prisma.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import {
  buildDungeonMovePatch,
  buildDungeonEnterPatch,
  dungeonPlayerViewForRow,
  dungeonStateToJson,
  resolveDungeonStateForRow,
} from '../domain/dungeonMoveLogic.js';
import {
  getDungeonViewForPlayer,
  type DungeonViewPayload,
} from './sevenSignsDungeonService.js';

export interface DungeonViewWithPlayer extends DungeonViewPayload {
  player: NonNullable<ReturnType<typeof dungeonPlayerViewForRow>>;
}

export function getDungeonViewWithPlayer(
  row: CharacterRow,
  dungeonId: string,
  nowMs: number = Date.now()
): DungeonViewWithPlayer | null {
  const player = dungeonPlayerViewForRow(row, dungeonId, nowMs);
  if (!player) return null;
  const view = getDungeonViewForPlayer(
    {
      id: row.id,
      revision: row.revision,
      worldX: row.worldX,
      worldY: row.worldY,
      targetX: row.targetX,
      targetY: row.targetY,
      level: row.level,
      hp: row.hp,
      maxHp: row.maxHp,
      expBarCur: '0',
      expBarMax: '0',
      expBarPct: 0,
      name: row.name,
    },
    dungeonId,
    player.mapX,
    player.mapY,
    row.mobSpawnHpJson,
    nowMs
  );
  if (!view) return null;
  return { ...view, player };
}

export async function performDungeonMove(
  userId: string,
  dungeonId: string,
  targetMapX: number,
  targetMapY: number,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; dungeon: DungeonViewWithPlayer }> {
  if (!Number.isFinite(targetMapX) || !Number.isFinite(targetMapY)) {
    throw new Error('dungeon_move_invalid');
  }
  const tx = Math.floor(targetMapX);
  const ty = Math.floor(targetMapY);
  const key = String(dungeonId || '').trim();
  if (!key) throw new Error('dungeon_move_invalid');

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');

    const nowMs = Date.now();
    const patch = buildDungeonMovePatch(char, key, tx, ty, nowMs);
    if (!patch) throw new Error('dungeon_move_forbidden');

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        const livePatch = buildDungeonMovePatch(
          current as CharacterRow,
          key,
          tx,
          ty,
          nowMs
        );
        if (!livePatch) throw new Error('dungeon_move_forbidden');
        return {
          changed: true,
          data: {
            dungeonStateJson: dungeonStateToJson(livePatch.nextState),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const nextRow = result.character as CharacterRow;
    const dungeon = getDungeonViewWithPlayer(nextRow, key, nowMs);
    if (!dungeon) throw new Error('dungeon_move_forbidden');
    return {
      character: toSnapshot(nextRow),
      dungeon,
    };
  });
}

export async function performDungeonEnter(
  userId: string,
  dungeonId: string,
  expectedRevision: number
): Promise<{ character: CharacterSnapshot; dungeon: DungeonViewWithPlayer }> {
  const key = String(dungeonId || '').trim();
  if (!key) throw new Error('dungeon_enter_invalid');

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');

    const nowMs = Date.now();
    const patch = buildDungeonEnterPatch(char, key);
    if (!patch) throw new Error('dungeon_enter_forbidden');

    const result = await mutateCharacterWithRevision(
      trx,
      char.id,
      expectedRevision,
      (current) => {
        const livePatch = buildDungeonEnterPatch(current as CharacterRow, key);
        if (!livePatch) throw new Error('dungeon_enter_forbidden');
        return {
          changed: true,
          data: {
            dungeonStateJson: dungeonStateToJson(livePatch.nextState),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);

    const nextRow = result.character as CharacterRow;
    const dungeon = getDungeonViewWithPlayer(nextRow, key, nowMs);
    if (!dungeon) throw new Error('dungeon_enter_forbidden');
    return {
      character: toSnapshot(nextRow),
      dungeon,
    };
  });
}

export function readDungeonPlayerState(
  row: CharacterRow,
  dungeonId: string,
  nowMs: number = Date.now()
) {
  return resolveDungeonStateForRow(row, dungeonId, nowMs);
}
