/**
 * Прибирає сіру/бежеву «рамку» в GIF + tight crop.
 * node server/scripts/chat-smile-strip-texture.mjs [34 35 ...]
 */
import { BitmapImage, GifFrame, GifUtil } from 'gifwrap';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('server/public/ref/chat-smiles');
const SOURCE = path.resolve(
  'C:/Users/KDFX Modes/Desktop/KOLOBOK/aiwan_smiles/light_skin'
);
const INDEX = path.join(DIR, 'chat-smiles-index.json');
const TMP = '__tex__';
const DEFAULT_NUMS = [34, 35, 36, 79, 80, 81];
const ALPHA = 12;
const WHITE = 235;
const BBOX_PAD = 1;

function isBackground(r, g, b, a) {
  if (a < ALPHA) return true;
  if (r >= WHITE && g >= WHITE && b >= WHITE) return true;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const spread = max - min;
  if (spread < 28 && max >= 125 && max <= 235) return true;
  if (spread < 18 && max >= 165 && max <= 240) return true;
  return false;
}

function stripFrame(frame) {
  const { data } = frame.bitmap;
  for (let i = 0; i < data.length; i += 4) {
    if (isBackground(data[i], data[i + 1], data[i + 2], data[i + 3])) {
      data[i + 3] = 0;
    }
  }
}

function composeFrame(frame, maxW, maxH) {
  const canvas = new BitmapImage(maxW, maxH, 0x00000000);
  const src = new BitmapImage(frame.bitmap);
  src.blit(
    canvas,
    frame.xOffset || 0,
    frame.yOffset || 0,
    0,
    0,
    frame.bitmap.width,
    frame.bitmap.height
  );
  return canvas;
}

function fullCanvasSize(frames) {
  let maxW = 0;
  let maxH = 0;
  for (const frame of frames) {
    maxW = Math.max(maxW, frame.bitmap.width + (frame.xOffset || 0));
    maxH = Math.max(maxH, frame.bitmap.height + (frame.yOffset || 0));
  }
  return { maxW: Math.max(1, maxW), maxH: Math.max(1, maxH) };
}

function bounds(bitmap) {
  const { data, width, height } = bitmap;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i + 3] < ALPHA) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX) return null;
  minX = Math.max(0, minX - BBOX_PAD);
  minY = Math.max(0, minY - BBOX_PAD);
  maxX = Math.min(width - 1, maxX + BBOX_PAD);
  maxY = Math.min(height - 1, maxY + BBOX_PAD);
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function crop(bitmap, box) {
  const out = new BitmapImage(box.w, box.h, 0x00000000);
  const src = new BitmapImage(bitmap);
  src.blit(out, 0, 0, box.x, box.y, box.w, box.h);
  return out;
}

async function processFile(srcPath, outPath) {
  const gif = await GifUtil.read(srcPath);
  const { maxW, maxH } = fullCanvasSize(gif.frames);
  let union = null;
  const composed = [];

  for (const frame of gif.frames) {
    const canvas = composeFrame(frame, maxW, maxH);
    stripFrame(canvas);
    composed.push({ canvas, frame });
    const b = bounds(canvas.bitmap);
    if (!b) continue;
    if (!union) union = { ...b };
    else {
      const x2 = Math.max(union.x + union.w, b.x + b.w);
      const y2 = Math.max(union.y + union.h, b.y + b.h);
      union.x = Math.min(union.x, b.x);
      union.y = Math.min(union.y, b.y);
      union.w = x2 - union.x;
      union.h = y2 - union.y;
    }
  }

  if (!union) {
    await GifUtil.write(outPath, gif.frames, { loops: gif.loops, transparentIndex: 0 });
    return;
  }

  const outFrames = composed.map(({ canvas, frame }) => {
    const cropped = crop(canvas.bitmap, union);
    return new GifFrame(cropped, {
      delayCentisecs: frame.delayCentisecs,
      disposalMethod: frame.disposalMethod,
    });
  });

  await GifUtil.write(outPath, outFrames, { loops: gif.loops, transparentIndex: 0 });
}

const index = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
const byNum = new Map(index.map((r) => [r.n, r.oldName]));
const nums = process.argv.slice(2).map(Number).filter(Boolean);
const list = nums.length ? nums : DEFAULT_NUMS;

for (const n of list) {
  const name = n + '.gif';
  const oldName = byNum.get(n);
  const src = oldName
    ? path.join(SOURCE, oldName)
    : path.join(DIR, name);
  const out = path.join(DIR, name);
  const tmp = path.join(DIR, TMP + name);
  if (!fs.existsSync(src)) {
    console.error('MISSING', src);
    continue;
  }
  await processFile(src, tmp);
  fs.renameSync(tmp, out);
  const g = await GifUtil.read(out);
  console.log('OK', name, oldName || '', g.frames[0].bitmap.width + 'x' + g.frames[0].bitmap.height);
}
