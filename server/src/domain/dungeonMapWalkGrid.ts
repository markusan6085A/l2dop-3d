import {
  SEVEN_SIGNS_DUNGEON_WALK_GRIDS,
  type SevenSignsDungeonWalkGrid,
} from '../data/sevenSignsDungeonWalkGrids.generated.js';

const walkCache = new Map<string, Uint8Array>();

function decodeWalkBits(grid: SevenSignsDungeonWalkGrid): Uint8Array {
  const cached = walkCache.get(grid.walkBits);
  if (cached) return cached;
  const buf = Uint8Array.from(Buffer.from(grid.walkBits, 'base64'));
  walkCache.set(grid.walkBits, buf);
  return buf;
}

export function getDungeonWalkGrid(
  dungeonId: string
): SevenSignsDungeonWalkGrid | null {
  return SEVEN_SIGNS_DUNGEON_WALK_GRIDS[dungeonId] ?? null;
}

export function gridCenterPx(
  grid: SevenSignsDungeonWalkGrid,
  gx: number,
  gy: number
): { x: number; y: number } {
  const half = Math.floor(grid.step / 2);
  return {
    x: gx * grid.step + half,
    y: gy * grid.step + half,
  };
}

export function pixelToGrid(
  grid: SevenSignsDungeonWalkGrid,
  px: number,
  py: number
): { gx: number; gy: number } {
  return {
    gx: Math.max(0, Math.min(grid.cols - 1, Math.floor(px / grid.step))),
    gy: Math.max(0, Math.min(grid.rows - 1, Math.floor(py / grid.step))),
  };
}

export function isWalkableCell(
  grid: SevenSignsDungeonWalkGrid,
  gx: number,
  gy: number
): boolean {
  if (gx < 0 || gy < 0 || gx >= grid.cols || gy >= grid.rows) return false;
  const walk = decodeWalkBits(grid);
  return walk[gy * grid.cols + gx] === 1;
}

/** Найближча прохідна клітинка (BFS) від кліку. */
export function nearestWalkableCell(
  grid: SevenSignsDungeonWalkGrid,
  gx: number,
  gy: number
): { gx: number; gy: number } | null {
  if (isWalkableCell(grid, gx, gy)) return { gx, gy };
  const maxR = Math.max(grid.cols, grid.rows);
  for (let r = 1; r <= maxR; r++) {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.abs(dx) !== r && Math.abs(dy) !== r) continue;
        const nx = gx + dx;
        const ny = gy + dy;
        if (isWalkableCell(grid, nx, ny)) return { gx: nx, gy: ny };
      }
    }
  }
  return null;
}

export function dungeonStartPixel(
  dungeonId: string
): { x: number; y: number } | null {
  const grid = getDungeonWalkGrid(dungeonId);
  if (!grid) return null;
  return gridCenterPx(grid, grid.startGx, grid.startGy);
}
