/**
 * Пакетно прибирає білий фон у всіх N.gif у /ref/chat-smiles/
 */
import { GifUtil } from 'gifwrap';
import fs from 'node:fs';
import path from 'node:path';

const THRESHOLD = 235;
const DIR = path.resolve('server/public/ref/chat-smiles');
const TMP_PREFIX = '__nobg__';

function isNearWhite(r, g, b) {
  return r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD;
}

function stripWhiteFromFrame(frame) {
  const { data, width, height } = frame.bitmap;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (isNearWhite(data[i], data[i + 1], data[i + 2])) {
        data[i + 3] = 0;
      }
    }
  }
}

async function processOne(filePath, outPath) {
  const gif = await GifUtil.read(filePath);
  for (const frame of gif.frames) {
    stripWhiteFromFrame(frame);
  }
  await GifUtil.write(outPath, gif.frames, {
    loops: gif.loops,
    transparentIndex: 0,
  });
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => /^\d+\.gif$/i.test(f))
  .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

if (!files.length) {
  console.error('No numbered GIF files in', DIR);
  process.exit(1);
}

let ok = 0;
let fail = 0;

for (let i = 0; i < files.length; i++) {
  const name = files[i];
  const full = path.join(DIR, name);
  const tmp = path.join(DIR, TMP_PREFIX + name);
  try {
    await processOne(full, tmp);
    fs.renameSync(tmp, full);
    ok++;
    if (ok % 25 === 0 || ok === files.length) {
      console.log(`Processed ${ok}/${files.length}…`);
    }
  } catch (err) {
    fail++;
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
    console.error('FAIL', name, err.message || err);
  }
}

console.log(`Done: ${ok} ok, ${fail} failed, total ${files.length}`);
