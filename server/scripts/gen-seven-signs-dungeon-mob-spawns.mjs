/**
 * Генерує розкидані спавни мобів для Seven Signs подземель.
 * Запуск: node server/scripts/gen-seven-signs-dungeon-mob-spawns.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const MAP_DIR = path.join(ROOT, 'server/public/assets/maps/catacombs');
const OUT_FILE = path.join(
  ROOT,
  'server/src/data/sevenSignsDungeonMobSpawns.generated.ts'
);

const STEP = 4;
const MIN_WALK_LUM = 52;
const PER_TYPE_COUNT = 10;
const SEED = 0x7f11a5;

const NECROPOLIS_OF_SACRIFICE_MOBS = [
  { npcId: 21208, name: 'Hallowed Watchman', level: 20, aggressive: false },
  { npcId: 21187, name: 'Gigant Slave', level: 21, aggressive: false },
  { npcId: 21166, name: 'Lith Scout', level: 21, aggressive: false },
  { npcId: 21209, name: 'Hallowed Seer', level: 22, aggressive: true },
  { npcId: 21139, name: 'Catacomb Barbed Bat', level: 23, aggressive: true },
  { npcId: 21188, name: 'Gigant Acolyte', level: 24, aggressive: false },
  { npcId: 21167, name: 'Lith Witch', level: 24, aggressive: false },
  { npcId: 21210, name: 'Vault Guardian', level: 25, aggressive: true },
  { npcId: 21140, name: 'Catacomb Wisp', level: 26, aggressive: true },
  { npcId: 21189, name: 'Gigant Overseer', level: 27, aggressive: false },
  { npcId: 21168, name: 'Lith Warrior', level: 27, aggressive: false },
  { npcId: 21211, name: 'Vault Seer', level: 27, aggressive: true },
  { npcId: 21141, name: 'Catacomb Serpent', level: 28, aggressive: true },
  { npcId: 21142, name: 'Grave Keeper Spartoi', level: 29, aggressive: true },
  { npcId: 21190, name: 'Gigant Footman', level: 30, aggressive: false },
  { npcId: 21169, name: 'Lith Guard', level: 30, aggressive: false },
];

const DUNGEON_MOB_CONFIG = {
  necropolis_of_sacrifice: {
    mobs: NECROPOLIS_OF_SACRIFICE_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
};

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(arr, rnd) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function sampleKind(r, g, b) {
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
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

async function buildWalkGrid(filePath) {
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
      if (!cellIsWalkable(data, w, h, info.channels, cx, cy, STEP)) continue;
      walk[cy * cols + cx] = 1;
    }
  }
  for (let cy = 0; cy < rows; cy++) {
    for (let cx = 0; cx < cols; cx++) {
      if (!walk[cy * cols + cx]) continue;
      const px = cx * STEP + Math.floor(STEP / 2);
      const py = cy * STEP + Math.floor(STEP / 2);
      if (px >= w || py >= h) continue;
      const idx = (py * w + px) * info.channels;
      const kind = sampleKind(data[idx], data[idx + 1], data[idx + 2]);
      if (kind !== 'start') continue;
      if (startGx < 0 || cy < startGy || (cy === startGy && cx < startGx)) {
        startGx = cx;
        startGy = cy;
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
  return { cols, rows, walk, startGx, startGy, step: STEP };
}

function gridCenterPx(step, gx, gy) {
  const half = Math.floor(step / 2);
  return { mapX: gx * step + half, mapY: gy * step + half, gx, gy };
}

function cellDist(a, b) {
  return Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
}

function collectCandidates(grid, startBufferCells, startGx, startGy) {
  const out = [];
  for (let gy = 0; gy < grid.rows; gy++) {
    for (let gx = 0; gx < grid.cols; gx++) {
      if (!grid.walk[gy * grid.cols + gx]) continue;
      if (cellDist({ gx, gy }, { gx: startGx, gy: startGy }) <= startBufferCells) {
        continue;
      }
      out.push(gridCenterPx(grid.step, gx, gy));
    }
  }
  return out;
}

function placeMobs(candidates, mobTypes, perType, rnd, minCellDist) {
  const assignments = [];
  for (const mob of mobTypes) {
    for (let i = 0; i < perType; i++) assignments.push(mob);
  }
  shuffle(assignments, rnd);
  shuffle(candidates, rnd);

  const placed = [];
  const used = new Set();
  for (const mob of assignments) {
    let picked = null;
    for (const cell of candidates) {
      const key = cell.gx + ',' + cell.gy;
      if (used.has(key)) continue;
      let ok = true;
      for (const p of placed) {
        if (cellDist(p, cell) < minCellDist) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      picked = cell;
      break;
    }
    if (!picked) return null;
    used.add(picked.gx + ',' + picked.gy);
    placed.push({ ...picked, ...mob });
  }
  return placed;
}

function generateForDungeon(dungeonId, cfg, grid, rnd) {
  let minDist = cfg.minCellDistStart;
  let placed = null;
  while (minDist >= 4) {
    const candidates = collectCandidates(
      grid,
      cfg.startBufferCells,
      grid.startGx,
      grid.startGy
    );
    placed = placeMobs(
      candidates,
      cfg.mobs,
      cfg.perType,
      rnd,
      minDist
    );
    if (placed && placed.length === cfg.mobs.length * cfg.perType) break;
    minDist -= 2;
  }
  if (!placed) {
    throw new Error('Failed to place mobs for ' + dungeonId);
  }
  return placed.map((row, idx) => ({
    id: `sdms_${dungeonId}_${String(idx + 1).padStart(3, '0')}`,
    dungeonId,
    mapX: row.mapX,
    mapY: row.mapY,
    npcId: row.npcId,
    name: row.name,
    level: row.level,
    aggressive: row.aggressive,
  }));
}

async function main() {
  const all = {};
  for (const [dungeonId, cfg] of Object.entries(DUNGEON_MOB_CONFIG)) {
    const png = path.join(MAP_DIR, dungeonId + '.png');
    if (!fs.existsSync(png)) {
      console.warn('skip missing png', dungeonId);
      continue;
    }
    const grid = await buildWalkGrid(png);
    const rnd = mulberry32(SEED + dungeonId.length * 9973);
    const spawns = generateForDungeon(dungeonId, cfg, grid, rnd);
    all[dungeonId] = spawns;
    console.log(dungeonId, spawns.length, 'spawns');
  }

  const body = `/** AUTO-GENERATED — node server/scripts/gen-seven-signs-dungeon-mob-spawns.mjs */\n\nexport interface SevenSignsDungeonMobSpawn {\n  id: string;\n  dungeonId: string;\n  mapX: number;\n  mapY: number;\n  npcId: number;\n  name: string;\n  level: number;\n  aggressive: boolean;\n}\n\nexport const SEVEN_SIGNS_DUNGEON_MOB_SPAWNS: Record<string, SevenSignsDungeonMobSpawn[]> = ${JSON.stringify(all, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, body, 'utf8');
  console.log('Wrote', OUT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
