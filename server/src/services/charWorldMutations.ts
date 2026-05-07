import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import {
  MAX_MAP_MOVE_DISTANCE,
  resolveMapMovement,
} from '../domain/mapMovement.js';
import {
  getTeleportDestination,
  nearestMapTown,
} from '../data/mapLocalities.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { GameConflictError } from './charErrors.js';
import {
  applyPassiveHpRegen,
  PASSIVE_REGEN_MAX_SECONDS,
  PASSIVE_REGEN_TICK_SECONDS,
} from './charPassiveRegen.js';
import {
  combatOptsFromRow,
  effectiveMaxHpWithBattleRoar,
  toSnapshot,
} from './charSnapshotLogic.js';
import type { CharacterRow, CharacterSnapshot } from './charTypes.js';

export async function performHunt(
  userId: string,
  expectedRevision: number
): Promise<CharacterSnapshot> {
  let pre = await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!pre) {
    throw new Error('no_character');
  }
  pre = await applyPassiveHpRegen(pre as CharacterRow);
  pre = (await resolveMapMovement(pre as CharacterRow)) as CharacterRow;

  return prisma.$transaction(async (tx) => {
    const char = await tx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    });
    if (!char) {
      throw new Error('no_character');
    }
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }

    const cr = char as CharacterRow;
    const inv = parseInventory(cr.inventoryJson);
    const huntLv = levelFromTotalExp(cr.exp);
    const combat = computeCombatStats(
      huntLv,
      char.race,
      char.classBranch,
      inv,
      combatOptsFromRow(cr)
    );
    const vit = computeVitals(
      huntLv,
      char.race,
      char.classBranch,
      combat.con,
      combat.men
    );
    const maxHpBase = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
    const maxHp = effectiveMaxHpWithBattleRoar(cr, maxHpBase);
    const elapsedMs = Date.now() - char.lastUpdate.getTime();
    const sec = Math.min(
      PASSIVE_REGEN_MAX_SECONDS,
      Math.max(
        0,
        Math.floor(elapsedMs / (PASSIVE_REGEN_TICK_SECONDS * 1000)) *
          PASSIVE_REGEN_TICK_SECONDS
      )
    );
    const hpAfterRegen =
      combat.regenHp > 0
        ? Math.min(maxHp, char.hp + combat.regenHp * sec)
        : Math.min(char.hp, maxHp);

    const adenaGain = BigInt(Math.floor(Math.random() * 50) + 1);
    const dmg = Math.floor(Math.random() * 6) + 1;
    const newHp = Math.max(0, hpAfterRegen - dmg);

    const updated = await tx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        adena: { increment: adenaGain },
        hp: newHp,
        revision: { increment: 1 },
      },
    });

    if (updated.count === 0) {
      throw new GameConflictError();
    }

    const row = await tx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(row as CharacterRow);
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

  let row = (await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  })) as CharacterRow | null;
  if (!row) throw new Error('no_character');
  row = await applyPassiveHpRegen(row);
  row = (await resolveMapMovement(row)) as CharacterRow;

  const dist = Math.hypot(tgx - row.worldX, tgy - row.worldY);
  if (dist > MAX_MAP_MOVE_DISTANCE) {
    throw new Error('map_target_too_far');
  }
  if (dist < 8) {
    throw new Error('map_target_too_close');
  }

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }
    const updated = await trx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        targetX: tgx,
        targetY: tgy,
        moveStartAt: new Date(),
        moveFromX: char.worldX,
        moveFromY: char.worldY,
        revision: { increment: 1 },
      } as unknown as Prisma.CharacterUpdateManyMutationInput,
    });
    if (updated.count === 0) throw new GameConflictError();
    const next = await trx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
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

  let row = (await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  })) as CharacterRow | null;
  if (!row) throw new Error('no_character');
  row = await applyPassiveHpRegen(row);
  row = (await resolveMapMovement(row)) as CharacterRow;

  return prisma.$transaction(async (trx) => {
    const char = (await trx.character.findFirst({
      where: { userId },
      orderBy: { lastUpdate: 'desc' },
    })) as CharacterRow | null;
    if (!char) throw new Error('no_character');
    if (char.revision !== expectedRevision) {
      throw new GameConflictError();
    }
    const updated = await trx.character.updateMany({
      where: {
        id: char.id,
        userId,
        revision: expectedRevision,
      },
      data: {
        worldX: wx,
        worldY: wy,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: wx,
        moveFromY: wy,
        cityId: dest.cityId,
        battleJson: Prisma.JsonNull,
        revision: { increment: 1 },
      } as unknown as Prisma.CharacterUpdateManyMutationInput,
    });
    if (updated.count === 0) throw new GameConflictError();
    const next = await trx.character.findUniqueOrThrow({
      where: { id: char.id },
    });
    return toSnapshot(next as CharacterRow);
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
  let row = (await prisma.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  })) as CharacterRow | null;
  if (!row) throw new Error('no_character');
  row = (await applyPassiveHpRegen(row)) as CharacterRow;
  row = (await resolveMapMovement(row)) as CharacterRow;
  if (row.revision !== expectedRevision) throw new GameConflictError();
  if (row.battleJson != null) {
    throw new Error('battle_still_active');
  }
  const near = nearestMapTown(row.worldX, row.worldY);
  return performTeleport(userId, near.teleportId, row.revision);
}
