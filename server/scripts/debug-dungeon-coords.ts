import sharp from 'sharp';
import {
  getDungeonWalkGrid,
  gridCenterPx,
  pixelToGrid,
  isWalkableCell,
  dungeonStartPixel,
  nearestWalkableCell,
} from '../src/domain/dungeonMapWalkGrid.js';
import { findDungeonPathPixels } from '../src/domain/dungeonMapPathfind.js';
import { buildDungeonMovePatch } from '../src/domain/dungeonMoveLogic.js';
import type { CharacterRow } from '../src/services/charTypes.js';

async function main() {
const id = 'necropolis_of_devotion';
const g = getDungeonWalkGrid(id)!;
const start = dungeonStartPixel(id)!;
console.log('grid start', g.startGx, g.startGy, 'pixel', start);

const path = '../server/public/assets/maps/catacombs/necropolis_of_devotion.png';
const { data, info } = await sharp(path).raw().toBuffer({ resolveWithObject: true });
const w = info.width;
const h = info.height;
const greens: number[][] = [];
for (let y = 0; y < h; y += 2) {
  for (let x = 0; x < w; x += 2) {
    const i = (y * w + x) * info.channels;
    const r = data[i];
    const gr = data[i + 1];
    const b = data[i + 2];
    if (gr > 120 && r < 90 && b < 90) greens.push([x, y]);
  }
}
console.log('green pixels', greens.length);
if (greens.length) {
  const minX = Math.min(...greens.map((p) => p[0]));
  const maxX = Math.max(...greens.map((p) => p[0]));
  const minY = Math.min(...greens.map((p) => p[1]));
  const maxY = Math.max(...greens.map((p) => p[1]));
  console.log('green bbox', { minX, minY, maxX, maxY });
  const cx = Math.floor((minX + maxX) / 2);
  const cy = Math.floor((minY + maxY) / 2);
  console.log('green center', cx, cy, 'cell', pixelToGrid(g, cx, cy));
}

const from = pixelToGrid(g, start.x, start.y);
console.log('from cell', from, 'walkable', isWalkableCell(g, from.gx, from.gy));

for (const click of [
  { mx: 500, my: 100 },
  { mx: 200, my: 50 },
  { mx: 150, my: 30 },
  { mx: start.x + 40, my: start.y },
]) {
  const cell = pixelToGrid(g, click.mx, click.my);
  const goal = nearestWalkableCell(g, cell.gx, cell.gy);
  const p = goal
    ? findDungeonPathPixels(g, from.gx, from.gy, goal.gx, goal.gy)
    : [];
  console.log('click', click, 'cell', cell, 'goal', goal, 'path', p.length);
}

const fakeRow = {
  worldX: -56064,
  worldY: 78720,
  dungeonStateJson: {
    v: 1,
    dungeonId: id,
    mapX: start.x,
    mapY: start.y,
    targetMapX: 0,
    targetMapY: 0,
    moveStartAt: null,
    moveFromMapX: start.x,
    moveFromMapY: start.y,
    pathPts: [],
  },
} as unknown as CharacterRow;

try {
  const patch = buildDungeonMovePatch(fakeRow, id, 500, 100);
  console.log('move patch ok', patch?.nextState.mapX, patch?.nextState.targetMapX);
} catch (e) {
  console.log('move patch err', (e as Error).message);
}
}

main().catch(console.error);
