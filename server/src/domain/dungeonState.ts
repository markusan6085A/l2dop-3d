export interface DungeonStateV1 {
  v: 1;
  dungeonId: string;
  mapX: number;
  mapY: number;
  targetMapX: number;
  targetMapY: number;
  moveStartAt: number | null;
  moveFromMapX: number;
  moveFromMapY: number;
  /** Плоский масив [x0,y0,x1,y1,…] — маршрут по коридорах. */
  pathPts: number[];
}

import type { DungeonMoveSpeedStats } from './dungeonRunSpeed.js';
import { dungeonStartPixel } from './dungeonMapWalkGrid.js';

export interface DungeonPlayerView {
  mapX: number;
  mapY: number;
  targetMapX: number;
  targetMapY: number;
  mapMoving: boolean;
  runSpeed: number;
  mapMoveSpeed: number;
  mapMoveSpeedPx: number;
  moveStartAt: number | null;
  pathPts: number[];
}

export function parseDungeonStateJson(raw: unknown): DungeonStateV1 | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return null;
  if (typeof o.dungeonId !== 'string' || !o.dungeonId.trim()) return null;
  const nums = [
    'mapX',
    'mapY',
    'targetMapX',
    'targetMapY',
    'moveFromMapX',
    'moveFromMapY',
  ] as const;
  for (const k of nums) {
    if (typeof o[k] !== 'number' || !Number.isFinite(o[k])) return null;
  }
  const pathPts = Array.isArray(o.pathPts)
    ? o.pathPts.filter((n): n is number => typeof n === 'number' && Number.isFinite(n))
    : [];
  return {
    v: 1,
    dungeonId: o.dungeonId.trim(),
    mapX: Math.floor(o.mapX as number),
    mapY: Math.floor(o.mapY as number),
    targetMapX: Math.floor(o.targetMapX as number),
    targetMapY: Math.floor(o.targetMapY as number),
    moveStartAt:
      o.moveStartAt == null
        ? null
        : typeof o.moveStartAt === 'number' && Number.isFinite(o.moveStartAt)
          ? Math.floor(o.moveStartAt)
          : null,
    moveFromMapX: Math.floor(o.moveFromMapX as number),
    moveFromMapY: Math.floor(o.moveFromMapY as number),
    pathPts,
  };
}

export function serializeDungeonState(state: DungeonStateV1): DungeonStateV1 {
  return {
    v: 1,
    dungeonId: state.dungeonId,
    mapX: Math.floor(state.mapX),
    mapY: Math.floor(state.mapY),
    targetMapX: Math.floor(state.targetMapX),
    targetMapY: Math.floor(state.targetMapY),
    moveStartAt: state.moveStartAt,
    moveFromMapX: Math.floor(state.moveFromMapX),
    moveFromMapY: Math.floor(state.moveFromMapY),
    pathPts: state.pathPts.map((n) => Math.floor(n)),
  };
}

export function createInitialDungeonState(
  dungeonId: string,
  startX: number,
  startY: number
): DungeonStateV1 {
  return {
    v: 1,
    dungeonId,
    mapX: startX,
    mapY: startY,
    targetMapX: 0,
    targetMapY: 0,
    moveStartAt: null,
    moveFromMapX: startX,
    moveFromMapY: startY,
    pathPts: [],
  };
}

/** Старт на зеленому квадраті (кожен вхід у подземелля). */
export function buildDungeonEnterState(dungeonId: string): DungeonStateV1 | null {
  const start = dungeonStartPixel(dungeonId);
  if (!start) return null;
  return createInitialDungeonState(dungeonId, start.x, start.y);
}

export function dungeonPlayerViewFromState(
  state: DungeonStateV1,
  speed: DungeonMoveSpeedStats
): DungeonPlayerView {
  const mapMoving = state.targetMapX !== 0 || state.targetMapY !== 0;
  return {
    mapX: state.mapX,
    mapY: state.mapY,
    targetMapX: state.targetMapX,
    targetMapY: state.targetMapY,
    mapMoving,
    runSpeed: speed.runSpeed,
    mapMoveSpeed: speed.mapMoveSpeed,
    mapMoveSpeedPx: speed.mapMoveSpeedPx,
    moveStartAt: state.moveStartAt,
    pathPts: state.pathPts.slice(),
  };
}
