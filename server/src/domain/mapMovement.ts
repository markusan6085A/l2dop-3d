/**
 * Рух по карті як у l2dop/map.php: швидкість min(Speed2*2, 2000), лінійна інтерполяція за часом.
 */
import { Prisma } from '@prisma/client';
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

export interface ResolvedMapMovementPatch {
  changed: boolean;
  data: {
    worldX: number;
    worldY: number;
    targetX: number;
    targetY: number;
    moveStartAt: Date | null;
    moveFromX: number;
    moveFromY: number;
  };
}

export function resolveMapMovementPatch<T extends MapMovementFields>(
  row: T,
  nowMs: number = Date.now()
): ResolvedMapMovementPatch {
  const same = {
    worldX: row.worldX,
    worldY: row.worldY,
    targetX: row.targetX,
    targetY: row.targetY,
    moveStartAt: row.moveStartAt,
    moveFromX: row.moveFromX,
    moveFromY: row.moveFromY,
  };
  if (row.targetX === 0 && row.targetY === 0) {
    return { changed: false, data: same };
  }
  if (!row.moveStartAt) {
    return { changed: false, data: same };
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
  const startMs = row.moveStartAt.getTime();
  const dx = row.targetX - row.moveFromX;
  const dy = row.targetY - row.moveFromY;
  const dist = Math.hypot(dx, dy);

  if (dist <= 0) {
    return {
      changed: true,
      data: {
        worldX: row.targetX,
        worldY: row.targetY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: row.targetX,
        moveFromY: row.targetY,
      },
    };
  }

  const elapsedSec = (nowMs - startMs) / 1000;
  const travelled = elapsedSec * speed;
  if (travelled >= dist) {
    return {
      changed: true,
      data: {
        worldX: row.targetX,
        worldY: row.targetY,
        targetX: 0,
        targetY: 0,
        moveStartAt: null,
        moveFromX: row.targetX,
        moveFromY: row.targetY,
      },
    };
  }

  const t = travelled / dist;
  const worldX = Math.floor(row.moveFromX + dx * t);
  const worldY = Math.floor(row.moveFromY + dy * t);
  if (worldX === row.worldX && worldY === row.worldY) {
    return { changed: false, data: same };
  }
  return {
    changed: true,
    data: {
      worldX,
      worldY,
      targetX: row.targetX,
      targetY: row.targetY,
      moveStartAt: row.moveStartAt,
      moveFromX: row.moveFromX,
      moveFromY: row.moveFromY,
    },
  };
}

export function resolveMapMovement<T extends MapMovementFields>(row: T): T {
  const patch = resolveMapMovementPatch(row, Date.now());
  if (!patch.changed) return row;
  return {
    ...row,
    ...patch.data,
  };
}
