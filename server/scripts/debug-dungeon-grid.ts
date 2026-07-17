import {
  getDungeonWalkGrid,
  isWalkableCell,
  dungeonStartPixel,
  pixelToGrid,
} from '../src/domain/dungeonMapWalkGrid.js';
import { findDungeonPathPixels } from '../src/domain/dungeonMapPathfind.js';
import { buildDungeonMovePatch } from '../src/domain/dungeonMoveLogic.js';

const id = 'necropolis_of_devotion';
const g = getDungeonWalkGrid(id)!;
const start = dungeonStartPixel(id)!;
const from = pixelToGrid(g, start.x, start.y);

let walk = 0;
for (let cy = 0; cy < g.rows; cy++) {
  for (let cx = 0; cx < g.cols; cx++) {
    if (isWalkableCell(g, cx, cy)) walk++;
  }
}

const seen = new Set([from.gx + ',' + from.gy]);
const q = [{ gx: from.gx, gy: from.gy }];
const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
while (q.length) {
  const c = q.shift()!;
  for (const [dx, dy] of dirs) {
    const nx = c.gx + dx;
    const ny = c.gy + dy;
    const k = nx + ',' + ny;
    if (seen.has(k) || !isWalkableCell(g, nx, ny)) continue;
    seen.add(k);
    q.push({ gx: nx, gy: ny });
  }
}

console.log('start pixel', start, 'grid', from, 'walk', walk, 'reachable', seen.size);

for (const [mx, my] of [
  [500, 100],
  [150, 30],
  [300, 300],
  [400, 150],
]) {
  const goal = pixelToGrid(g, mx, my);
  const path = findDungeonPathPixels(g, from.gx, from.gy, goal.gx, goal.gy);
  console.log('click', mx, my, 'goal', goal, 'path', path.length);
}

const fakeRow = {
  worldX: -56064,
  worldY: 78720,
  dungeonStateJson: null,
} as any;

const patch = buildDungeonMovePatch(fakeRow, id, 300, 300);
console.log('move patch', patch ? 'ok path' : 'null', patch?.nextState?.mapMoving);
