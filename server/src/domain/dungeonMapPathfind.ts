import {
  gridCenterPx,
  isWalkableCell,
} from './dungeonMapWalkGrid.js';
import type { SevenSignsDungeonWalkGrid } from '../data/sevenSignsDungeonWalkGrids.generated.js';

type Cell = { gx: number; gy: number };

function cellKey(gx: number, gy: number): string {
  return gx + ',' + gy;
}

function heuristic(a: Cell, b: Cell): number {
  return Math.abs(a.gx - b.gx) + Math.abs(a.gy - b.gy);
}

/** A* по сітці катакомб (4-напрямковий рух). Повертає піксельні waypoints. */
export function findDungeonPathPixels(
  grid: SevenSignsDungeonWalkGrid,
  fromGx: number,
  fromGy: number,
  toGx: number,
  toGy: number
): { x: number; y: number }[] {
  if (!isWalkableCell(grid, fromGx, fromGy) || !isWalkableCell(grid, toGx, toGy)) {
    return [];
  }
  if (fromGx === toGx && fromGy === toGy) {
    return [gridCenterPx(grid, toGx, toGy)];
  }

  const start: Cell = { gx: fromGx, gy: fromGy };
  const goal: Cell = { gx: toGx, gy: toGy };
  const open = [start];
  const openSet = new Set([cellKey(fromGx, fromGy)]);
  const cameFrom = new Map<string, Cell>();
  const gScore = new Map<string, number>([[cellKey(fromGx, fromGy), 0]]);
  const fScore = new Map<string, number>([
    [cellKey(fromGx, fromGy), heuristic(start, goal)],
  ]);

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  while (open.length > 0) {
    open.sort(
      (a, b) =>
        (fScore.get(cellKey(a.gx, a.gy)) ?? Infinity) -
        (fScore.get(cellKey(b.gx, b.gy)) ?? Infinity)
    );
    const current = open.shift()!;
    const ck = cellKey(current.gx, current.gy);
    openSet.delete(ck);
    if (current.gx === goal.gx && current.gy === goal.gy) {
      const cells: Cell[] = [current];
      let curKey = ck;
      while (cameFrom.has(curKey)) {
        const prev = cameFrom.get(curKey)!;
        cells.unshift(prev);
        curKey = cellKey(prev.gx, prev.gy);
      }
      return cells.map((c) => gridCenterPx(grid, c.gx, c.gy));
    }
    for (const [dx, dy] of dirs) {
      const nx = current.gx + dx;
      const ny = current.gy + dy;
      if (!isWalkableCell(grid, nx, ny)) continue;
      const nk = cellKey(nx, ny);
      const tentative =
        (gScore.get(ck) ?? Infinity) + 1;
      if (tentative >= (gScore.get(nk) ?? Infinity)) continue;
      cameFrom.set(nk, current);
      gScore.set(nk, tentative);
      fScore.set(nk, tentative + heuristic({ gx: nx, gy: ny }, goal));
      if (!openSet.has(nk)) {
        open.push({ gx: nx, gy: ny });
        openSet.add(nk);
      }
    }
  }
  return [];
}
