import { Prisma } from '@prisma/client';
import {
  buildMoveIntent,
  MIN_DUNGEON_MOVE_DIST_PX,
  resolveDungeonMovementPatch,
} from '../domain/dungeonMapMovement.js';
import { findDungeonPathPixels } from '../domain/dungeonMapPathfind.js';
import { resolveDungeonMoveSpeedStatsForRow } from '../domain/dungeonRunSpeed.js';
import {
  dungeonStartPixel,
  getDungeonWalkGrid,
  gridCenterPx,
  isWalkableCell,
  nearestWalkableCell,
  pixelToGrid,
} from '../domain/dungeonMapWalkGrid.js';
import {
  buildDungeonEnterState,
  createInitialDungeonState,
  dungeonPlayerViewFromState,
  parseDungeonStateJson,
  serializeDungeonState,
  type DungeonPlayerView,
  type DungeonStateV1,
} from '../domain/dungeonState.js';
import { findSevenSignsDungeonById } from '../data/sevenSignsDungeons.js';
import { isWithinMapNearbyHeroRadius } from '../domain/mapNearbyRadius.js';
import type { CharacterRow } from '../services/charTypes.js';

function isNearDungeonEntrance(row: CharacterRow, dungeonId: string): boolean {
  const dungeon = findSevenSignsDungeonById(dungeonId);
  if (!dungeon) return false;
  return isWithinMapNearbyHeroRadius(
    row.worldX,
    row.worldY,
    dungeon.worldX,
    dungeon.worldY
  );
}

function playerMayUseDungeonSession(row: CharacterRow, dungeonId: string): boolean {
  return isNearDungeonEntrance(row, dungeonId);
}

export function resolveDungeonStateForRow(
  row: CharacterRow,
  dungeonId: string,
  nowMs: number = Date.now()
): DungeonStateV1 | null {
  if (!playerMayUseDungeonSession(row, dungeonId)) return null;

  const start = dungeonStartPixel(dungeonId);
  if (!start) return null;

  let state =
    parseDungeonStateJson(row.dungeonStateJson)?.dungeonId === dungeonId
      ? parseDungeonStateJson(row.dungeonStateJson)!
      : createInitialDungeonState(dungeonId, start.x, start.y);

  const speed = resolveDungeonMoveSpeedStatsForRow(row, nowMs);
  const patch = resolveDungeonMovementPatch(state, speed.mapMoveSpeedPx, nowMs);
  return patch.state;
}

export function dungeonPlayerViewForRow(
  row: CharacterRow,
  dungeonId: string,
  nowMs: number = Date.now()
): DungeonPlayerView | null {
  const state = resolveDungeonStateForRow(row, dungeonId, nowMs);
  if (!state) return null;
  const speed = resolveDungeonMoveSpeedStatsForRow(row, nowMs);
  return dungeonPlayerViewFromState(state, speed);
}

export function buildDungeonMovePatch(
  row: CharacterRow,
  dungeonId: string,
  targetMapX: number,
  targetMapY: number,
  nowMs: number = Date.now()
): { nextState: DungeonStateV1; changed: boolean } | null {
  const grid = getDungeonWalkGrid(dungeonId);
  if (!grid) return null;
  if (!playerMayUseDungeonSession(row, dungeonId)) return null;

  const start = dungeonStartPixel(dungeonId);
  if (!start) return null;

  let state =
    parseDungeonStateJson(row.dungeonStateJson)?.dungeonId === dungeonId
      ? parseDungeonStateJson(row.dungeonStateJson)!
      : createInitialDungeonState(dungeonId, start.x, start.y);

  const speed = resolveDungeonMoveSpeedStatsForRow(row, nowMs);
  state = resolveDungeonMovementPatch(state, speed.mapMoveSpeedPx, nowMs).state;

  const dist = Math.hypot(targetMapX - state.mapX, targetMapY - state.mapY);
  if (dist < MIN_DUNGEON_MOVE_DIST_PX) {
    throw new Error('dungeon_target_too_close');
  }

  const clickCell = pixelToGrid(grid, targetMapX, targetMapY);
  const goal = nearestWalkableCell(grid, clickCell.gx, clickCell.gy);
  if (!goal) throw new Error('dungeon_target_blocked');

  const fromCell = pixelToGrid(grid, state.mapX, state.mapY);
  if (!isWalkableCell(grid, fromCell.gx, fromCell.gy)) {
    throw new Error('dungeon_no_path');
  }

  const pathCells = findDungeonPathPixels(
    grid,
    fromCell.gx,
    fromCell.gy,
    goal.gx,
    goal.gy
  );
  if (pathCells.length === 0) throw new Error('dungeon_no_path');

  const fromCenter = gridCenterPx(grid, fromCell.gx, fromCell.gy);
  const snappedState: DungeonStateV1 = {
    ...state,
    mapX: fromCenter.x,
    mapY: fromCenter.y,
  };
  const nextState = serializeDungeonState(
    buildMoveIntent(snappedState, pathCells, nowMs)
  );

  const oldJson = JSON.stringify(parseDungeonStateJson(row.dungeonStateJson));
  const newJson = JSON.stringify(nextState);
  return {
    nextState,
    changed: oldJson !== newJson,
  };
}

export function dungeonStateToJson(
  state: DungeonStateV1
): Prisma.InputJsonValue {
  return serializeDungeonState(state) as unknown as Prisma.InputJsonValue;
}

export function dungeonStatesEqual(a: unknown, b: DungeonStateV1): boolean {
  return JSON.stringify(parseDungeonStateJson(a)) === JSON.stringify(b);
}

export function buildDungeonEnterPatch(
  row: CharacterRow,
  dungeonId: string
): { nextState: DungeonStateV1 } | null {
  if (!isNearDungeonEntrance(row, dungeonId)) return null;
  const nextState = buildDungeonEnterState(dungeonId);
  if (!nextState) return null;
  return { nextState: serializeDungeonState(nextState) };
}
