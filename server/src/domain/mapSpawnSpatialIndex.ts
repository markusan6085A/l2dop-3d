import {
  MAP_WORLD_SPAWNS,
  type MapWorldSpawn,
} from '../data/mapWorldSpawns.js';

/** Межі світу (як clampWorld у mapWorldSpawns). */
const WORLD_X_MIN = -131_000;
const WORLD_Y_MIN = -259_000;
/** Розмір клітинки сітки (світові одиниці). */
const CELL_SIZE = 10_000;

export interface SpawnDistanceRow {
  spawn: MapWorldSpawn;
  distance: number;
}

const grid = new Map<string, MapWorldSpawn[]>();

function cellCoords(worldX: number, worldY: number): { cx: number; cy: number } {
  return {
    cx: Math.floor((worldX - WORLD_X_MIN) / CELL_SIZE),
    cy: Math.floor((worldY - WORLD_Y_MIN) / CELL_SIZE),
  };
}

function cellKey(cx: number, cy: number): string {
  return `${cx},${cy}`;
}

for (const s of MAP_WORLD_SPAWNS) {
  const { cx, cy } = cellCoords(s.worldX, s.worldY);
  const key = cellKey(cx, cy);
  const cell = grid.get(key);
  if (cell) {
    cell.push(s);
  } else {
    grid.set(key, [s]);
  }
}

/** Кандидати в радіусі — лише клітинки сітки, без повного проходу по 1M+ спавнів. */
export function querySpawnsWithinRadius(
  worldX: number,
  worldY: number,
  radius: number
): SpawnDistanceRow[] {
  const R2 = radius * radius;
  const cellRadius = Math.ceil(radius / CELL_SIZE);
  const { cx: cx0, cy: cy0 } = cellCoords(worldX, worldY);
  const out: SpawnDistanceRow[] = [];

  for (let dx = -cellRadius; dx <= cellRadius; dx++) {
    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      const cell = grid.get(cellKey(cx0 + dx, cy0 + dy));
      if (!cell) continue;
      for (const s of cell) {
        const ddx = s.worldX - worldX;
        const ddy = s.worldY - worldY;
        if (ddx * ddx + ddy * ddy > R2) continue;
        out.push({ spawn: s, distance: Math.hypot(ddx, ddy) });
      }
    }
  }
  return out;
}
