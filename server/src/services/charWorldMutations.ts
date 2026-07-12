import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  MAX_MAP_MOVE_DISTANCE,
  resolveMapMovement,
} from '../domain/mapMovement.js';
import {
  getTeleportDestination,
  getTeleportAdenaCost,
  nearestMapTown,
} from '../data/mapLocalities.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { GameConflictError } from './charErrors.js';
import { applyPassiveHpRegen } from './charPassiveRegen.js';
import { toSnapshot } from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  mergeMobSpawnHpEntry,
  mobSpawnHpFromBattleJson,
  parseMobSpawnHpState,
  serializeMobSpawnHpState,
} from '../domain/mobSpawnHpState.js';

const TELEPORT_FREE_MAX_LEVEL = 40;

function resolveTeleportFee(level: number, teleportId: string): bigint {
  if (level <= TELEPORT_FREE_MAX_LEVEL) return 0n;
  return BigInt(getTeleportAdenaCost(teleportId));
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

export async function performHunt(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) {
      throw new Error('no_character');
    }
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        const adenaGain = BigInt(Math.floor(Math.random() * 50) + 1);
        const dmg = Math.floor(Math.random() * 6) + 1;
        const newHp = Math.max(0, base.hp - dmg);
        const changed =
          movementFieldsChanged(current as CharacterRow, base) ||
          newHp !== current.hp ||
          adenaGain > 0n;
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: newHp,
            adena: { increment: adenaGain },
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: base.targetX,
            targetY: base.targetY,
            moveStartAt: base.moveStartAt,
            moveFromX: base.moveFromX,
            moveFromY: base.moveFromY,
          },
        };
      }
    );
    if (!result.ok) {
      throw new GameConflictError();
    }
    return toSnapshot(result.character as CharacterRow);
  });
}

/**
 * Намір «іти в точку» (l2dop map.php px/py → світ). Оновлює revision.
 */
export async function performMapMove(
  userId: string,
  targetX: number,
  targetY: number,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
    throw new Error('map_move_invalid');
  }
  const tgx = Math.floor(targetX);
  const tgy = Math.floor(targetY);

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
        const dist = Math.hypot(tgx - base.worldX, tgy - base.worldY);
        if (dist > MAX_MAP_MOVE_DISTANCE) {
          throw new Error('map_target_too_far');
        }
        if (dist < 8) {
          throw new Error('map_target_too_close');
        }
        return {
          changed: true,
          data: {
            hp: base.hp,
            worldX: base.worldX,
            worldY: base.worldY,
            targetX: tgx,
            targetY: tgy,
            moveStartAt: new Date(),
            moveFromX: base.worldX,
            moveFromY: base.worldY,
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}

/**
 * Миттєвий телепорт у місто / точку з MAP_TOWNS (l2dop координати).
 * Скидає рух і активний бій; оновлює cityId під призначення.
 */
export async function performTeleport(
  userId: string,
  teleportId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  const dest = getTeleportDestination(teleportId);
  if (!dest) {
    throw new Error('teleport_unknown');
  }
  const wx = Math.floor(dest.worldX);
  const wy = Math.floor(dest.worldY);

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
        const level = levelFromTotalExp(base.exp);
        const fee = resolveTeleportFee(level, teleportId);
        if (fee > 0n && base.adena < fee) {
          throw new Error('teleport_not_enough_adena');
        }
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
          base.cityId !== dest.cityId ||
          base.battleJson != null ||
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
            cityId: dest.cityId,
            battleJson: Prisma.JsonNull,
            mobSpawnHpJson: nextMobSpawnHpJson,
            ...(fee > 0n ? { adena: { decrement: fee } } : {}),
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}

/**
 * Після поразки в бою: миттєво в найближче місто/селище з `MAP_TOWNS` (як телепорт).
 * Потрібен неактивний бій (`battleJson` порожній).
 */
export async function performReturnToNearestTown(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  return prisma.$transaction(async (tx) => {
    const char = (await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    const result = await mutateCharacterWithRevision(
      tx,
      char.id,
      expectedRevision,
      (current) => {
        const base = normalizePassiveAndMove(current as CharacterRow);
        if (base.battleJson != null) {
          throw new Error('battle_still_active');
        }
        const near = nearestMapTown(base.worldX, base.worldY);
        const dest = getTeleportDestination(near.teleportId);
        if (!dest) throw new Error('teleport_unknown');
        const wx = Math.floor(dest.worldX);
        const wy = Math.floor(dest.worldY);
        const recoverHp =
          base.hp <= 0
            ? Math.max(1, Math.floor(base.maxHp * 0.15))
            : base.hp;
        const changed =
          base.hp !== recoverHp ||
          base.pvpPendingDefeatJson != null ||
          movementFieldsChanged(current as CharacterRow, base) ||
          base.worldX !== wx ||
          base.worldY !== wy ||
          base.targetX !== 0 ||
          base.targetY !== 0 ||
          base.moveStartAt != null ||
          base.moveFromX !== wx ||
          base.moveFromY !== wy ||
          base.cityId !== dest.cityId;
        if (!changed) return { changed: false };
        return {
          changed: true,
          data: {
            hp: recoverHp,
            pvpPendingDefeatJson: Prisma.JsonNull,
            worldX: wx,
            worldY: wy,
            targetX: 0,
            targetY: 0,
            moveStartAt: null,
            moveFromX: wx,
            moveFromY: wy,
            cityId: dest.cityId,
          } as Prisma.CharacterUpdateManyMutationInput,
        };
      }
    );
    if (!result.ok) throw new GameConflictError();
    return toSnapshot(result.character as CharacterRow);
  });
}
