/**
 * Обрізка GIF до контенту (без зміни масштабу) — прибирає «поле» навколо смайла.
 * node server/scripts/chat-smile-crop-listed.mjs
 */
import { BitmapImage, GifFrame, GifUtil } from 'gifwrap';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('server/public/ref/chat-smiles');
const TMP_PREFIX = '__crop__';
const WHITE_THRESHOLD = 235;
const ALPHA_THRESHOLD = 12;
const BBOX_PAD = 1;

const LISTED = [
  72, 46, 25, 28, 71, 95, 118, 124, 125, 97, 148, 140, 139, 137, 136, 146, 149,
  138, 141, 197, 186,
];

function isBackground(r, g, b, a) {
  if (a < ALPHA_THRESHOLD) return true;
  if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
    return true;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 25 && max >= 130 && max <= 210) return true;
  return false;
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

function boundsOfBitmap(bitmap) {
  const { data, width, height } = bitmap;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (
        !isBackground(data[i], data[i + 1], data[i + 2], data[i + 3])
      ) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  minX = Math.max(0, minX - BBOX_PAD);
  minY = Math.max(0, minY - BBOX_PAD);
  maxX = Math.min(width - 1, maxX + BBOX_PAD);
  maxY = Math.min(height - 1, maxY + BBOX_PAD);

  return {
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
  };
}

function cropBitmap(bitmap, box) {
  const out = new BitmapImage(box.w, box.h, 0x00000000);
  const src = new BitmapImage(bitmap);
  src.blit(out, 0, 0, box.x, box.y, box.w, box.h);
  return out;
}

async function cropGif(filePath, outPath) {
  const gif = await GifUtil.read(filePath);
  const { maxW, maxH } = fullCanvasSize(gif.frames);
  let union = null;

  for (const frame of gif.frames) {
    const canvas = composeFrame(frame, maxW, maxH);
    const b = boundsOfBitmap(canvas.bitmap);
    if (!b) continue;
    if (!union) {
      union = { ...b };
    } else {
      const x2 = Math.max(union.x + union.w, b.x + b.w);
      const y2 = Math.max(union.y + union.h, b.y + b.h);
      union.x = Math.min(union.x, b.x);
      union.y = Math.min(union.y, b.y);
      union.w = x2 - union.x;
      union.h = y2 - union.y;
    }
  }

  if (!union) {
    fs.copyFileSync(filePath, outPath);
    return false;
  }

  const outFrames = [];
  for (const frame of gif.frames) {
    const canvas = composeFrame(frame, maxW, maxH);
    const cropped = cropBitmap(canvas.bitmap, union);
    outFrames.push(
      new GifFrame(cropped, {
        delayCentisecs: frame.delayCentisecs,
        disposalMethod: frame.disposalMethod,
      })
    );
  }

  await GifUtil.write(outPath, outFrames, {
    loops: gif.loops,
    transparentIndex: 0,
  });
  return true;
}

let ok = 0;
let skip = 0;
let fail = 0;

for (const n of LISTED) {
  const name = n + '.gif';
  const filePath = path.join(DIR, name);
  const tmpPath = path.join(DIR, TMP_PREFIX + name);
  if (!fs.existsSync(filePath)) {
    fail++;
    console.error('MISSING', name);
    continue;
  }
  try {
    const changed = await cropGif(filePath, tmpPath);
    fs.renameSync(tmpPath, filePath);
    if (changed) ok++;
    else skip++;
  } catch (err) {
    fail++;
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error('FAIL', name, err.message || err);
  }
}

console.log(`Done: ${ok} cropped, ${skip} unchanged, ${fail} failed`);
