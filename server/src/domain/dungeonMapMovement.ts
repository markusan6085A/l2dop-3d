import type { DungeonStateV1 } from './dungeonState.js';
import { dungeonMapMoveSpeedPxFromRunSpeed } from './dungeonRunSpeed.js';

export { dungeonMapMoveSpeedPxFromRunSpeed } from './dungeonRunSpeed.js';

/** @deprecated використовуй resolveDungeonMoveSpeedStatsForRow */
export function dungeonMoveSpeedPxFromRunSpeed(runSpeed: number): number {
  return dungeonMapMoveSpeedPxFromRunSpeed(runSpeed);
}

function pathSegmentLength(
  pathPts: number[],
  fromIdx: number,
  toIdx: number
): number {
  let dist = 0;
  for (let i = fromIdx; i < toIdx; i++) {
    const x0 = pathPts[i * 2];
    const y0 = pathPts[i * 2 + 1];
    const x1 = pathPts[(i + 1) * 2];
    const y1 = pathPts[(i + 1) * 2 + 1];
    dist += Math.hypot(x1 - x0, y1 - y0);
  }
  return dist;
}

function positionAlongPath(
  pathPts: number[],
  travelled: number
): { x: number; y: number; done: boolean } {
  if (pathPts.length < 4) {
    const tx = pathPts[0] ?? 0;
    const ty = pathPts[1] ?? 0;
    return { x: tx, y: ty, done: true };
  }
  let left = travelled;
  const segments = pathPts.length / 2 - 1;
  for (let i = 0; i < segments; i++) {
    const x0 = pathPts[i * 2];
    const y0 = pathPts[i * 2 + 1];
    const x1 = pathPts[(i + 1) * 2];
    const y1 = pathPts[(i + 1) * 2 + 1];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (seg <= 0) continue;
    if (left <= seg) {
      const t = left / seg;
      return {
        x: Math.floor(x0 + (x1 - x0) * t),
        y: Math.floor(y0 + (y1 - y0) * t),
        done: false,
      };
    }
    left -= seg;
  }
  const lastX = pathPts[pathPts.length - 2];
  const lastY = pathPts[pathPts.length - 1];
  return { x: lastX, y: lastY, done: true };
}

export interface ResolvedDungeonMovement {
  changed: boolean;
  state: DungeonStateV1;
}

export function resolveDungeonMovementPatch(
  state: DungeonStateV1,
  mapMoveSpeedPx: number,
  nowMs: number = Date.now()
): ResolvedDungeonMovement {
  const same = { ...state, pathPts: [...state.pathPts] };
  if (state.targetMapX === 0 && state.targetMapY === 0) {
    return { changed: false, state: same };
  }
  if (!state.moveStartAt || state.pathPts.length < 4) {
    return { changed: false, state: same };
  }

  const speed = Math.max(16, Math.floor(mapMoveSpeedPx));
  const elapsedSec = (nowMs - state.moveStartAt) / 1000;
  const totalDist = pathSegmentLength(state.pathPts, 0, state.pathPts.length / 2 - 1);
  const travelled = elapsedSec * speed;

  if (travelled >= totalDist) {
    const endX = state.targetMapX;
    const endY = state.targetMapY;
    return {
      changed: true,
      state: {
        ...state,
        mapX: endX,
        mapY: endY,
        targetMapX: 0,
        targetMapY: 0,
        moveStartAt: null,
        moveFromMapX: endX,
        moveFromMapY: endY,
        pathPts: [],
      },
    };
  }

  const pos = positionAlongPath(state.pathPts, travelled);
  if (pos.x === state.mapX && pos.y === state.mapY) {
    return { changed: false, state: same };
  }
  return {
    changed: true,
    state: {
      ...state,
      mapX: pos.x,
      mapY: pos.y,
    },
  };
}

export function flattenPathPoints(
  points: { x: number; y: number }[]
): number[] {
  const out: number[] = [];
  for (const p of points) {
    out.push(Math.floor(p.x), Math.floor(p.y));
  }
  return out;
}

export function buildMoveIntent(
  state: DungeonStateV1,
  pathPoints: { x: number; y: number }[],
  nowMs: number
): DungeonStateV1 {
  if (pathPoints.length === 0) return state;
  const end = pathPoints[pathPoints.length - 1];
  const pathPts = flattenPathPoints(pathPoints);
  return {
    ...state,
    targetMapX: Math.floor(end.x),
    targetMapY: Math.floor(end.y),
    moveStartAt: nowMs,
    moveFromMapX: state.mapX,
    moveFromMapY: state.mapY,
    pathPts,
  };
}

/** Мін. відстань кліку від поточної позиції (пікс.). */
export const MIN_DUNGEON_MOVE_DIST_PX = 6;
