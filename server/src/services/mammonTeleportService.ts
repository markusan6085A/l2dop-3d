import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { nearestMapTown } from '../data/mapLocalities.js';
import { resolveMapMovement } from '../domain/mapMovement.js';
import {
  mergeMobSpawnHpEntry,
  mobSpawnHpFromBattleJson,
  parseMobSpawnHpState,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';
import { gameConflictFromMutation } from './charConflict.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { buildCharacterClientSnapshot } from './charClientSnapshot.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { getMammonBlacksmithState } from './mammonBlacksmithService.js';
import { getMammonMerchantState } from './mammonMerchantService.js';

export const MAMMON_TELEPORT_ADENA_COST = 1;

export type MammonTeleportKind = 'merchant' | 'blacksmith';

function hadDungeonState(row: CharacterRow): boolean {
  return row.dungeonStateJson != null;
}

function clearDungeonStatePatch(
  row: CharacterRow
): Pick<Prisma.CharacterUpdateManyMutationInput, 'dungeonStateJson'> {
  return hadDungeonState(row) ? { dungeonStateJson: Prisma.JsonNull } : {};
}

function normalizePassiveAndMove(row: CharacterRow): CharacterRow {
  return resolveMapMovement(applyPassiveHpRegen(row));
}

function movementFieldsChanged(a: CharacterRow, b: CharacterRow): boolean {
  return (
    a.worldX !== b.worldX ||
    a.worldY !== b.worldY ||
    a.targetX !== b.targetX ||
    a.targetY !== b.targetY ||
    (a.moveStartAt?.getTime() ?? 0) !== (b.moveStartAt?.getTime() ?? 0) ||
    a.moveFromX !== b.moveFromX ||
    a.moveFromY !== b.moveFromY
  );
}

function resolveMammonCoords(
  kind: MammonTeleportKind
): { wx: number; wy: number } | null {
  if (kind === 'merchant') {
    const cur = getMammonMerchantState().current;
    return { wx: Math.floor(cur.worldX), wy: Math.floor(cur.worldY) };
  }
  if (kind === 'blacksmith') {
    const cur = getMammonBlacksmithState().current;
    return { wx: Math.floor(cur.worldX), wy: Math.floor(cur.worldY) };
  }
  return null;
}

export function parseMammonTeleportKind(raw: unknown): MammonTeleportKind | null {
  if (typeof raw !== 'string') return null;
  const k = raw.trim().toLowerCase();
  if (k === 'merchant' || k === 'blacksmith') return k;
  return null;
}

/** Телепорт до поточної позиції Маммона (торговець або коваль), ціна — 1 adena. */
export async function performMammonTeleport(
  userId: string,
  kind: MammonTeleportKind,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const coords = resolveMammonCoords(kind);
  if (!coords) throw new Error('invalid_mammon_kind');
  const wx = coords.wx;
  const wy = coords.wy;
  const fee = BigInt(MAMMON_TELEPORT_ADENA_COST);

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
          throw new Error('mammon_teleport_not_enough_adena');
        }
        const near = nearestMapTown(wx, wy);
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
          hadDungeonState(current as CharacterRow) ||
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
            hpSnap.mobMaxHp
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
            mobSpawnHpJson: nextMobSpawnHpJson,
            ...clearDungeonStatePatch(current as CharacterRow),
            ...(fee > 0n ? { adena: { decrement: fee } } : {}),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw gameConflictFromMutation(result);
    return buildCharacterClientSnapshot(result.character as CharacterRow, userId);
  });
}
