/**
 * Генерує walk-grid для Seven Signs подземель (сіра/зелена = прохід, чорна = стіна).
 * Запуск: node server/scripts/gen-seven-signs-dungeon-walk-grids.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MAP_DIR = path.join(ROOT, 'server/public/assets/maps/catacombs');
const OUT_FILE = path.join(ROOT, 'server/src/data/sevenSignsDungeonWalkGrids.generated.ts');

const STEP = 4;
/** Темні коридори на PNG мають lum ~50–55; 58 відрізало старт від лабіринту. */
const MIN_WALK_LUM = 52;

function sampleKind(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  /** Текстурована зелена кімната — темна, не яскраво-зелена. */
  if (g > r + 8 && g > b + 8 && g > 20) return 'start';
  if (lum >= MIN_WALK_LUM) return 'walk';
  return 'block';
}

function cellIsWalkable(data, width, height, channels, cx, cy, step) {
  let walk = 0;
  let total = 0;
  for (let dy = 0; dy < step; dy++) {
    for (let dx = 0; dx < step; dx++) {
      const px = cx * step + dx;
      const py = cy * step + dy;
      if (px >= width || py >= height) continue;
      total++;
      const idx = (py * width + px) * channels;
      const kind = sampleKind(data[idx], data[idx + 1], data[idx + 2]);
      if (kind === 'start' || kind === 'walk') walk++;
    }
  }
  return total > 0 && walk / total >= 0.55;
}

async function buildGridForPng(filePath) {
  const { data, info } = await sharp(filePath)
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const cols = Math.ceil(w / STEP);
  const rows = Math.ceil(h / STEP);
  const walk = new Uint8Array(cols * rows);
  let startGx = -1;
  let startGy = -1;
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      const ci = cy * cols + cx;
      if (!cellIsWalkable(data, w, h, info.channels, cx, cy, STEP)) continue;
      walk[ci] = 1;
    }
  }
  const startCells = [];
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      if (!walk[cy * cols + cx]) continue;
      const px = cx * STEP + Math.floor(STEP / 2);
      const py = cy * STEP + Math.floor(STEP / 2);
      if (px >= w || py >= h) continue;
      const idx = (py * w + px) * info.channels;
      const kind = sampleKind(data[idx], data[idx + 1], data[idx + 2]);
      if (kind !== 'start') continue;
      startCells.push({ gx: cx, gy: cy });
    }
  }
  if (startCells.length > 0) {
    const avgGx =
      startCells.reduce((sum, c) => sum + c.gx, 0) / startCells.length;
    const avgGy =
      startCells.reduce((sum, c) => sum + c.gy, 0) / startCells.length;
    let bestDist = Infinity;
    for (const cell of startCells) {
      const d = (cell.gx - avgGx) ** 2 + (cell.gy - avgGy) ** 2;
      if (d < bestDist) {
        bestDist = d;
        startGx = cell.gx;
        startGy = cell.gy;
      }
    }
  }
  if (startGx < 0) {
    outer: for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        if (walk[cy * cols + cx]) {
          startGx = cx;
          startGy = cy;
          break outer;
        }
      }
    }
  }
  return {
    step: STEP,
    widthPx: w,
    heightPx: h,
    cols,
    rows,
    startGx,
    startGy,
    walkBits: Buffer.from(walk).toString('base64'),
  };
}

async function main() {
  const files = fs
    .readdirSync(MAP_DIR)
    .filter((f) => f.endsWith('.png'))
    .sort();
  const grids = {};
  for (const file of files) {
    const id = file.replace(/\.png$/, '');
    grids[id] = await buildGridForPng(path.join(MAP_DIR, file));
    console.log(
      id,
      grids[id].cols + 'x' + grids[id].rows,
      'start',
      grids[id].startGx + ',' + grids[id].startGy
    );
  }
  const body = `/** AUTO-GENERATED — node server/scripts/gen-seven-signs-dungeon-walk-grids.mjs */\n\nexport interface SevenSignsDungeonWalkGrid {\n  step: number;\n  widthPx: number;\n  heightPx: number;\n  cols: number;\n  rows: number;\n  startGx: number;\n  startGy: number;\n  walkBits: string;\n}\n\nexport const SEVEN_SIGNS_DUNGEON_WALK_GRIDS: Record<string, SevenSignsDungeonWalkGrid> = ${JSON.stringify(grids, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, body, 'utf8');
  console.log('Wrote', OUT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
