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

const PILGRIMS_NECROPOLIS_MOBS = [
  { npcId: 21213, name: 'Hallowed Monk', level: 32, aggressive: true },
  { npcId: 21191, name: 'Gigant Cleric', level: 33, aggressive: false },
  { npcId: 21170, name: 'Lith Medium', level: 33, aggressive: false },
  { npcId: 21144, name: 'Catacomb Shadow', level: 34, aggressive: true },
  { npcId: 21214, name: 'Vault Sentinel', level: 35, aggressive: true },
  { npcId: 21192, name: 'Gigant Officer', level: 36, aggressive: false },
  { npcId: 21171, name: 'Lith Overlord', level: 36, aggressive: false },
  { npcId: 21215, name: 'Vault Monk', level: 37, aggressive: true },
  { npcId: 21145, name: 'Catacomb Stakato Soldier', level: 38, aggressive: true },
  { npcId: 21193, name: 'Gigant Raider', level: 39, aggressive: false },
  { npcId: 21172, name: 'Lith Patrolman', level: 39, aggressive: false },
  { npcId: 21146, name: 'Grave Keeper Dark Horror', level: 40, aggressive: true },
];

const NECROPOLIS_OF_WORSHIP_MOBS = [
  { npcId: 21217, name: 'Hallowed Priest', level: 42, aggressive: true },
  { npcId: 21147, name: 'Catacomb Gargoyle', level: 43, aggressive: true },
  { npcId: 21148, name: 'Catacomb Liviona', level: 44, aggressive: true },
  { npcId: 21195, name: 'Gigant Commander', level: 45, aggressive: false },
  { npcId: 21174, name: 'Lith Commander', level: 45, aggressive: false },
  { npcId: 21218, name: 'Vault Overlord', level: 45, aggressive: true },
  { npcId: 21149, name: 'Decayed Ancient Pikeman', level: 46, aggressive: true },
  { npcId: 21219, name: 'Vault Priest', level: 47, aggressive: true },
  { npcId: 21175, name: 'Lilim Butcher', level: 48, aggressive: false },
  { npcId: 21196, name: 'Nephilim Sentinel', level: 48, aggressive: false },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false },
];

const PATRIOTS_NECROPOLIS_MOBS = [
  { npcId: 21221, name: 'Sepulcher Inquisitor', level: 57, aggressive: true },
  { npcId: 21177, name: 'Lilim Knight Errant', level: 54, aggressive: false },
  { npcId: 21198, name: 'Nephilim Swordsman', level: 54, aggressive: false },
  { npcId: 21220, name: 'Sepulcher Archon', level: 55, aggressive: true },
  { npcId: 21153, name: 'Purgatory Serpent', level: 56, aggressive: true },
  { npcId: 21178, name: 'Lilim Marauder', level: 57, aggressive: false },
  { npcId: 21199, name: 'Nephilim Guard', level: 57, aggressive: false },
  { npcId: 21154, name: 'Hell Keeper Medusa', level: 58, aggressive: true },
  { npcId: 21155, name: 'Purgatory Conjurer', level: 59, aggressive: true },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false },
];

const NECROPOLIS_OF_DEVOTION_MOBS = [
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false },
  { npcId: 21224, name: 'Sepulcher Guardian', level: 65, aggressive: true },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false },
  { npcId: 21156, name: 'Purgatory Shadow', level: 61, aggressive: true },
  { npcId: 21225, name: 'Sepulcher Sage', level: 62, aggressive: true },
  { npcId: 21180, name: 'Lilim Knight', level: 63, aggressive: false },
  { npcId: 21201, name: 'Nephilim Centurion', level: 63, aggressive: false },
  { npcId: 21157, name: 'Purgatory Tarantula', level: 64, aggressive: true },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false },
  { npcId: 21158, name: 'Hell Keeper Crimson Doll', level: 67, aggressive: true },
];

const NECROPOLIS_OF_MARTYRDOM_MOBS = [
  { npcId: 21224, name: 'Sepulcher Guardian', level: 65, aggressive: true },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false },
  { npcId: 21158, name: 'Hell Keeper Crimson Doll', level: 67, aggressive: true },
  { npcId: 21225, name: 'Sepulcher Sage', level: 67, aggressive: true },
  { npcId: 21159, name: 'Purgatory Gargoyle', level: 68, aggressive: true },
  { npcId: 21182, name: 'Lilim Soldier', level: 69, aggressive: false },
  { npcId: 21203, name: 'Nephilim Archbishop', level: 69, aggressive: false },
  { npcId: 21228, name: 'Sepulcher Guard', level: 70, aggressive: false },
  { npcId: 21160, name: 'Purgatory Liviona', level: 71, aggressive: true },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false },
];

const SAINTS_NECROPOLIS_MOBS = [
  { npcId: 21228, name: 'Sepulcher Guard', level: 75, aggressive: true },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false },
  { npcId: 21229, name: 'Sepulcher Preacher', level: 72, aggressive: true },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false },
  { npcId: 21161, name: 'Lesser Ancient Soldier', level: 73, aggressive: true },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false },
];

const DISCIPLES_NECROPOLIS_MOBS = [
  { npcId: 21228, name: 'Sepulcher Guard', level: 75, aggressive: true },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false },
  { npcId: 21229, name: 'Sepulcher Preacher', level: 77, aggressive: true },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false },
  { npcId: 21161, name: 'Lesser Ancient Soldier', level: 73, aggressive: true },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false },
  { npcId: 21164, name: 'Guardian Spirit of Ancient Holy Ground', level: 78, aggressive: true },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false },
];

const DISCIPLES_NECROPOLIS_BOSSES = [
  { npcId: 25282, name: 'Death Lord Shax', level: 75, aggressive: false, kind: 'raid' },
];

const CATACOMB_OF_THE_HERETIC_MOBS = [
  { npcId: 21236, name: 'Barrow Sentinel', level: 30, aggressive: false },
  { npcId: 21190, name: 'Gigant Footman', level: 30, aggressive: false },
  { npcId: 21169, name: 'Lith Guard', level: 30, aggressive: false },
  { npcId: 21143, name: 'Catacomb Scavenger Bat', level: 31, aggressive: true },
  { npcId: 21237, name: 'Barrow Monk', level: 32, aggressive: true },
  { npcId: 21191, name: 'Gigant Cleric', level: 33, aggressive: false },
  { npcId: 21170, name: 'Lith Medium', level: 33, aggressive: false },
  { npcId: 21144, name: 'Catacomb Shadow', level: 34, aggressive: true },
  { npcId: 21238, name: 'Grave Sentinel', level: 35, aggressive: true },
  { npcId: 21192, name: 'Gigant Officer', level: 36, aggressive: false },
  { npcId: 21171, name: 'Lith Overlord', level: 36, aggressive: false },
  { npcId: 21239, name: 'Grave Monk', level: 37, aggressive: true },
  { npcId: 21145, name: 'Catacomb Stakato Soldier', level: 38, aggressive: true },
  { npcId: 21193, name: 'Gigant Raider', level: 39, aggressive: false },
  { npcId: 21172, name: 'Lith Patrolman', level: 39, aggressive: false },
  { npcId: 21146, name: 'Grave Keeper Dark Horror', level: 40, aggressive: true },
];

const CATACOMB_OF_THE_BRANDED_MOBS = [
  { npcId: 21240, name: 'Barrow Overlord', level: 40, aggressive: false },
  { npcId: 21241, name: 'Barrow Priest', level: 42, aggressive: true },
  { npcId: 21194, name: 'Gigant Confessor', level: 42, aggressive: false },
  { npcId: 21173, name: 'Lith Shaman', level: 42, aggressive: false },
  { npcId: 21147, name: 'Catacomb Gargoyle', level: 43, aggressive: true },
  { npcId: 21195, name: 'Gigant Commander', level: 45, aggressive: false },
  { npcId: 21242, name: 'Grave Overlord', level: 45, aggressive: true },
  { npcId: 21174, name: 'Lith Commander', level: 45, aggressive: false },
  { npcId: 21149, name: 'Decayed Ancient Pikeman', level: 46, aggressive: true },
  { npcId: 21243, name: 'Grave Priest', level: 47, aggressive: true },
  { npcId: 21175, name: 'Lilim Butcher', level: 48, aggressive: false },
  { npcId: 21196, name: 'Nephilim Sentinel', level: 48, aggressive: false },
  { npcId: 21150, name: 'Decayed Ancient Soldier', level: 49, aggressive: true },
  { npcId: 21151, name: 'Decayed Ancient Knight', level: 50, aggressive: true },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false },
];

const CATACOMB_OF_THE_APOSTATE_MOBS = [
  { npcId: 21244, name: 'Crypt Archon', level: 50, aggressive: false },
  { npcId: 21176, name: 'Lilim Magus', level: 51, aggressive: false },
  { npcId: 21197, name: 'Nephilim Priest', level: 51, aggressive: false },
  { npcId: 21245, name: 'Crypt Inquisitor', level: 52, aggressive: true },
  { npcId: 21152, name: 'Purgatory Wisp', level: 53, aggressive: true },
  { npcId: 21177, name: 'Lilim Knight Errant', level: 54, aggressive: false },
  { npcId: 21198, name: 'Nephilim Swordsman', level: 54, aggressive: false },
  { npcId: 21246, name: 'Tomb Archon', level: 55, aggressive: true },
  { npcId: 21153, name: 'Purgatory Serpent', level: 56, aggressive: true },
  { npcId: 21178, name: 'Lilim Marauder', level: 57, aggressive: false },
  { npcId: 21199, name: 'Nephilim Guard', level: 57, aggressive: false },
  { npcId: 21247, name: 'Tomb Inquisitor', level: 57, aggressive: true },
  { npcId: 21154, name: 'Hell Keeper Medusa', level: 58, aggressive: true },
  { npcId: 21155, name: 'Purgatory Conjurer', level: 59, aggressive: true },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false },
];

const CATACOMB_OF_THE_WITCH_MOBS = [
  { npcId: 21248, name: 'Crypt Guardian', level: 60, aggressive: false },
  { npcId: 21179, name: 'Lilim Priest', level: 60, aggressive: false },
  { npcId: 21200, name: 'Nephilim Bishop', level: 60, aggressive: false },
  { npcId: 21156, name: 'Purgatory Shadow', level: 61, aggressive: true },
  { npcId: 21249, name: 'Crypt Sage', level: 62, aggressive: true },
  { npcId: 21180, name: 'Lilim Knight', level: 63, aggressive: false },
  { npcId: 21201, name: 'Nephilim Centurion', level: 63, aggressive: false },
  { npcId: 21157, name: 'Purgatory Tarantula', level: 64, aggressive: true },
  { npcId: 21250, name: 'Tomb Guardian', level: 65, aggressive: true },
  { npcId: 21181, name: 'Lilim Assassin', level: 66, aggressive: false },
  { npcId: 21202, name: 'Nephilim Scout', level: 66, aggressive: false },
  { npcId: 21251, name: 'Tomb Sage', level: 67, aggressive: true },
  { npcId: 21159, name: 'Purgatory Gargoyle', level: 68, aggressive: true },
  { npcId: 21182, name: 'Lilim Soldier', level: 69, aggressive: false },
  { npcId: 21203, name: 'Nephilim Archbishop', level: 69, aggressive: false },
  { npcId: 21252, name: 'Crypt Guard', level: 70, aggressive: false },
  { npcId: 21160, name: 'Purgatory Liviona', level: 71, aggressive: true },
  { npcId: 21183, name: 'Lilim Knight Banneret', level: 72, aggressive: false },
  { npcId: 21204, name: 'Nephilim Praetorian', level: 72, aggressive: false },
];

const CATACOMB_OF_DARK_OMENS_MOBS = [
  { npcId: 21253, name: 'Crypt Preacher', level: 72, aggressive: true },
  { npcId: 21162, name: 'Lesser Ancient Scout', level: 74, aggressive: true },
  { npcId: 21184, name: 'Lilim Slayer', level: 75, aggressive: false },
  { npcId: 21205, name: 'Nephilim Royal Guard', level: 75, aggressive: false },
  { npcId: 21254, name: 'Tomb Guard', level: 75, aggressive: true },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true },
  { npcId: 21255, name: 'Tomb Preacher', level: 77, aggressive: true },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false },
];

const CATACOMB_OF_THE_FORBIDDEN_PATH_MOBS = [
  { npcId: 21254, name: 'Tomb Guard', level: 75, aggressive: true },
  { npcId: 21163, name: 'Lesser Ancient Shaman', level: 76, aggressive: true },
  { npcId: 21255, name: 'Tomb Preacher', level: 77, aggressive: true },
  { npcId: 21164, name: 'Guardian Spirit of Ancient Holy Ground', level: 78, aggressive: true },
  { npcId: 21165, name: 'Lesser Ancient Warrior', level: 78, aggressive: true },
  { npcId: 21185, name: 'Lilim Great Mystic', level: 78, aggressive: false },
  { npcId: 21186, name: 'Lilim Court Knight', level: 78, aggressive: false },
  { npcId: 21206, name: 'Nephilim Cardinal', level: 78, aggressive: false },
  { npcId: 21207, name: 'Nephilim Commander', level: 78, aggressive: false },
];

const DUNGEON_MOB_CONFIG = {
  necropolis_of_sacrifice: {
    mobs: NECROPOLIS_OF_SACRIFICE_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  pilgrims_necropolis: {
    mobs: PILGRIMS_NECROPOLIS_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  necropolis_of_worship: {
    mobs: NECROPOLIS_OF_WORSHIP_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  patriots_necropolis: {
    mobs: PATRIOTS_NECROPOLIS_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  necropolis_of_devotion: {
    mobs: NECROPOLIS_OF_DEVOTION_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  necropolis_of_martyrdom: {
    mobs: NECROPOLIS_OF_MARTYRDOM_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  saints_necropolis: {
    mobs: SAINTS_NECROPOLIS_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  disciples_necropolis: {
    mobs: DISCIPLES_NECROPOLIS_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
    bossMobs: DISCIPLES_NECROPOLIS_BOSSES,
  },
  catacomb_of_the_heretic: {
    mobs: CATACOMB_OF_THE_HERETIC_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  catacomb_of_the_branded: {
    mobs: CATACOMB_OF_THE_BRANDED_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  catacomb_of_the_apostate: {
    mobs: CATACOMB_OF_THE_APOSTATE_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  catacomb_of_the_witch: {
    mobs: CATACOMB_OF_THE_WITCH_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  catacomb_of_dark_omens: {
    mobs: CATACOMB_OF_DARK_OMENS_MOBS,
    perType: PER_TYPE_COUNT,
    startBufferCells: 6,
    minCellDistStart: 14,
  },
  catacomb_of_the_forbidden_path: {
    mobs: CATACOMB_OF_THE_FORBIDDEN_PATH_MOBS,
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

function pickFarthestCandidate(candidates, used, startGx, startGy, minCellDist) {
  let best = null;
  let bestDist = -1;
  for (const cell of candidates) {
    const key = cell.gx + ',' + cell.gy;
    if (used.has(key)) continue;
    const d = cellDist(cell, { gx: startGx, gy: startGy });
    if (d < minCellDist) continue;
    if (d > bestDist) {
      bestDist = d;
      best = cell;
    }
  }
  return best;
}

function generateForDungeon(dungeonId, cfg, grid, rnd) {
  let minDist = cfg.minCellDistStart;
  let placed = null;
  const candidates = collectCandidates(
    grid,
    cfg.startBufferCells,
    grid.startGx,
    grid.startGy
  );
  while (minDist >= 4) {
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

  const used = new Set(placed.map((row) => row.gx + ',' + row.gy));
  const bossRows = [];
  for (const boss of cfg.bossMobs ?? []) {
    const cell = pickFarthestCandidate(
      candidates,
      used,
      grid.startGx,
      grid.startGy,
      cfg.minCellDistStart
    );
    if (!cell) {
      throw new Error('Failed to place boss for ' + dungeonId);
    }
    used.add(cell.gx + ',' + cell.gy);
    bossRows.push({ ...cell, ...boss });
  }

  return [...placed, ...bossRows].map((row, idx) => {
    const out = {
      id: `sdms_${dungeonId}_${String(idx + 1).padStart(3, '0')}`,
      dungeonId,
      mapX: row.mapX,
      mapY: row.mapY,
      npcId: row.npcId,
      name: row.name,
      level: row.level,
      aggressive: row.kind === 'raid' ? true : row.aggressive,
    };
    if (row.kind === 'raid') out.kind = 'raid';
    return out;
  });
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

  const body = `/** AUTO-GENERATED — node server/scripts/gen-seven-signs-dungeon-mob-spawns.mjs */\n\nexport interface SevenSignsDungeonMobSpawn {\n  id: string;\n  dungeonId: string;\n  mapX: number;\n  mapY: number;\n  npcId: number;\n  name: string;\n  level: number;\n  aggressive: boolean;\n  kind?: 'raid';\n}\n\nexport const SEVEN_SIGNS_DUNGEON_MOB_SPAWNS: Record<string, SevenSignsDungeonMobSpawn[]> = ${JSON.stringify(all, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, body, 'utf8');
  console.log('Wrote', OUT_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
