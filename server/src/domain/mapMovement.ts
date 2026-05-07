/**
 * Рух по карті як у l2dop/map.php: швидкість min(Speed2*2, 2000), лінійна інтерполяція за часом.
 */
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { parseInventory } from '../data/inventory.js';
import {
  computeCombatStats,
  computeCombatStatsOptionsForCharacter,
} from '../data/l2dopCombatFormulas.js';
import { getEffectiveCharacterLevel } from './effectiveCharacterLevel.js';

/** Як map.php: $speed = $Speed2 * 2; if($speed>2000){$speed=2000;} */
export function mapMoveSpeedFromRunSpeed(runSpeed: number): number {
  return Math.min(Math.floor(runSpeed * 2), 2000);
}

/** Макс. відстань однієї команди руху (світові одиниці). */
export const MAX_MAP_MOVE_DISTANCE = 120_000;

export interface MapMovementFields {
  id: string;
  worldX: number;
  worldY: number;
  targetX: number;
  targetY: number;
  moveStartAt: Date | null;
  moveFromX: number;
  moveFromY: number;
  /** Кеш з БД; для формул використовуйте exp + getEffectiveCharacterLevel. */
  level: number;
  exp: bigint;
  race: string;
  classBranch: string;
  inventoryJson: Prisma.JsonValue | null;
  activeBuffsJson?: Prisma.JsonValue | null;
  buffHeroicTier?: number | null;
  buffZealotStacks?: number | null;
  skillsLearnedJson?: Prisma.JsonValue | null;
  l2Profession?: string;
  /** Поза боєм: toggle-стійки расових Fighter / Mystic у `battleMods.raceToggleRanks`. */
  worldCombatStateJson?: Prisma.JsonValue | null;
}

/**
 * Оновлює worldX/worldY у БД за часом руху; при прибутті обнуляє target.
 * Не змінює revision (пасивний ефект часу).
 */
export async function resolveMapMovement<T extends MapMovementFields>(
  row: T
): Promise<T> {
  if (row.targetX === 0 && row.targetY === 0) {
    return row;
  }
  if (!row.moveStartAt) {
    return row;
  }

  const inv = parseInventory(row.inventoryJson);
  const combat = computeCombatStats(
    getEffectiveCharacterLevel(row.exp),
    row.race,
    row.classBranch,
    inv,
    computeCombatStatsOptionsForCharacter({
      activeBuffsJson: row.activeBuffsJson,
      buffHeroicTier: row.buffHeroicTier,
      buffZealotStacks: row.buffZealotStacks,
      skillsLearnedJson: row.skillsLearnedJson,
      l2Profession: row.l2Profession,
      inventoryJson: row.inventoryJson,
      race: row.race,
      classBranch: row.classBranch,
      worldCombatStateJson: row.worldCombatStateJson,
    })
  );
  const speed = mapMoveSpeedFromRunSpeed(combat.runSpeed);
  const now = Date.now();
  const startMs = row.moveStartAt.getTime();
  const dx = row.targetX - row.moveFromX;
  const dy = row.targetY - row.moveFromY;
  const dist = Math.hypot(dx, dy);

  if (dist <= 0) {
    const updated = await prisma.character.update({
      where: { id: row.id },
      data: {
        worldX: row.targetX,
        worldY: row.targetY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: row.targetX,
        moveFromY: row.targetY,
      },
    });
    return updated as unknown as T;
  }

  const elapsedSec = (now - startMs) / 1000;
  const travelled = elapsedSec * speed;

  if (travelled >= dist) {
    const updated = await prisma.character.update({
      where: { id: row.id },
      data: {
        worldX: row.targetX,
        worldY: row.targetY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: row.targetX,
        moveFromY: row.targetY,
      },
    });
    return updated as unknown as T;
  }

  const t = travelled / dist;
  const worldX = Math.floor(row.moveFromX + dx * t);
  const worldY = Math.floor(row.moveFromY + dy * t);

  if (worldX === row.worldX && worldY === row.worldY) {
    return row;
  }

  const updated = await prisma.character.update({
    where: { id: row.id },
    data: { worldX, worldY },
  });
  return updated as unknown as T;
}
