/**
 * Прибирає білий / майже білий фон у GIF (для чат-смайлів).
 * Використання: node server/scripts/chat-smile-remove-white-bg.mjs <input.gif> [output.gif]
 */
import { GifUtil } from 'gifwrap';
import path from 'node:path';
import fs from 'node:fs';

const THRESHOLD = 235;

function isNearWhite(r, g, b) {
  return r >= THRESHOLD && g >= THRESHOLD && b >= THRESHOLD;
}

function stripWhiteFromFrame(frame) {
  const { data, width, height } = frame.bitmap;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isNearWhite(r, g, b)) {
        data[i + 3] = 0;
      }
    }
  }
}

const input = process.argv[2];
if (!input) {
  console.error('Usage: node chat-smile-remove-white-bg.mjs <input.gif> [output.gif]');
  process.exit(1);
}

const resolvedIn = path.resolve(input);
const resolvedOut = path.resolve(
  process.argv[3] ||
    path.join(
      path.dirname(resolvedIn),
      path.basename(resolvedIn, path.extname(resolvedIn)) + '-nobg.gif'
    )
);

if (!fs.existsSync(resolvedIn)) {
  console.error('File not found:', resolvedIn);
  process.exit(1);
}

const gif = await GifUtil.read(resolvedIn);
for (const frame of gif.frames) {
  stripWhiteFromFrame(frame);
}

await GifUtil.write(resolvedOut, gif.frames, {
  loops: gif.loops,
  transparentIndex: 0,
});

console.log('Wrote', resolvedOut, `(${gif.frames.length} frames)`);
