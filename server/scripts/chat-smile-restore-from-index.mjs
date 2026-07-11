/**
 * Відновлює 1.gif … N.gif з оригіналів за chat-smiles-index.json
 * + лише прозорий фон (без зміни розміру полотна).
 *
 * node server/scripts/chat-smile-restore-from-index.mjs [шлях/до/папки/з/оригіналами]
 */
import { GifUtil } from 'gifwrap';
import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_SOURCE = path.resolve(
  'C:/Users/KDFX Modes/Desktop/KOLOBOK/aiwan_smiles/light_skin'
);
const DIR = path.resolve('server/public/ref/chat-smiles');
const INDEX_FILE = path.join(DIR, 'chat-smiles-index.json');
const TMP_PREFIX = '__nobg__';
const WHITE_THRESHOLD = 235;

function stripWhiteFromFrame(frame) {
  const { data, width, height } = frame.bitmap;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (
        data[i] >= WHITE_THRESHOLD &&
        data[i + 1] >= WHITE_THRESHOLD &&
        data[i + 2] >= WHITE_THRESHOLD
      ) {
        data[i + 3] = 0;
      }
    }
  }
}

async function copyWithTransparentBg(srcPath, outPath) {
  const gif = await GifUtil.read(srcPath);
  for (const frame of gif.frames) {
    stripWhiteFromFrame(frame);
  }
  await GifUtil.write(outPath, gif.frames, {
    loops: gif.loops,
    transparentIndex: 0,
  });
}

const sourceDir = path.resolve(process.argv[2] || DEFAULT_SOURCE);
if (!fs.existsSync(sourceDir)) {
  console.error('Source folder not found:', sourceDir);
  process.exit(1);
}
if (!fs.existsSync(INDEX_FILE)) {
  console.error('Index not found:', INDEX_FILE);
  process.exit(1);
}

const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
let ok = 0;
let fail = 0;

for (const row of index) {
  const src = path.join(sourceDir, row.oldName);
  const out = path.join(DIR, row.newName);
  const tmp = path.join(DIR, TMP_PREFIX + row.newName);

  if (!fs.existsSync(src)) {
    fail++;
    console.error('MISSING', row.oldName, '→', row.newName);
    continue;
  }

  try {
    await copyWithTransparentBg(src, tmp);
    fs.renameSync(tmp, out);
    ok++;
    if (ok % 25 === 0 || ok === index.length) {
      console.log(`Restored ${ok}/${index.length}…`);
    }
  } catch (err) {
    fail++;
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.error('FAIL', row.newName, row.oldName, err.message || err);
  }
}

// Прибрати сміттєві temp-файли від normalize
for (const name of fs.readdirSync(DIR)) {
  if (name.startsWith('__norm__') || name.startsWith('__ren__')) {
    fs.unlinkSync(path.join(DIR, name));
  }
}

console.log(`Done: ${ok} ok, ${fail} failed, source=${sourceDir}`);
