/**
 * Нормалізує чат-смайли з оригіналів Aiwan → 1.gif … N.gif
 * Еталон розміру: 206.gif (tommy.gif) — покадрова обрізка + однакова max-сторона.
 */
import { BitmapImage, GifFrame, GifUtil } from 'gifwrap';
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('server/public/ref/chat-smiles');
const AIWAN_DIR = path.resolve('server/public/ref/Aiwan');
const INDEX_FILE = path.join(DIR, 'chat-smiles-index.json');
const REF_OLD = 'tommy.gif';
const FALLBACK_REF_NUM = 100;
const TMP_PREFIX = '__norm__';
const TARGET_SIZE = 48;
const WHITE_THRESHOLD = 235;
const ALPHA_THRESHOLD = 12;
const BBOX_PAD = 1;

function isVisible(r, g, b, a) {
  if (a < ALPHA_THRESHOLD) return false;
  return !(r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD);
}

function stripWhite(bitmap) {
  const { data } = bitmap;
  for (let i = 0; i < data.length; i += 4) {
    if (
      data[i] >= WHITE_THRESHOLD &&
      data[i + 1] >= WHITE_THRESHOLD &&
      data[i + 2] >= WHITE_THRESHOLD
    ) {
      data[i + 3] = 0;
    }
  }
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
      if (isVisible(data[i], data[i + 1], data[i + 2], data[i + 3])) {
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

function resizeToRefMaxSide(srcBmp, refMaxSide, canvasSize) {
  const sw = srcBmp.bitmap.width;
  const sh = srcBmp.bitmap.height;
  if (sw <= 0 || sh <= 0) {
    return new BitmapImage(canvasSize, canvasSize, 0x00000000);
  }

  const scale = refMaxSide / Math.max(sw, sh);
  const dw = Math.max(1, Math.round(sw * scale));
  const dh = Math.max(1, Math.round(sh * scale));
  const ox = Math.floor((canvasSize - dw) / 2);
  const oy = Math.floor((canvasSize - dh) / 2);
  const canvas = new BitmapImage(canvasSize, canvasSize, 0x00000000);
  const srcData = srcBmp.bitmap.data;
  const outData = canvas.bitmap.data;

  for (let y = 0; y < dh; y++) {
    const sy = Math.min(sh - 1, Math.floor(y / scale));
    for (let x = 0; x < dw; x++) {
      const sx = Math.min(sw - 1, Math.floor(x / scale));
      const si = (sy * sw + sx) * 4;
      const di = ((oy + y) * canvasSize + (ox + x)) * 4;
      outData[di] = srcData[si];
      outData[di + 1] = srcData[si + 1];
      outData[di + 2] = srcData[si + 2];
      outData[di + 3] = srcData[si + 3];
    }
  }

  return canvas;
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

function buildAiwanMap() {
  const map = new Map();
  function walk(dir) {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(full);
      else if (/\.gif$/i.test(ent.name)) map.set(ent.name.toLowerCase(), full);
    }
  }
  if (fs.existsSync(AIWAN_DIR)) walk(AIWAN_DIR);
  return map;
}

function perFrameMaxSides(filePath) {
  return GifUtil.read(filePath).then((gif) => {
    const { maxW, maxH } = fullCanvasSize(gif.frames);
    const sides = [];
    for (const frame of gif.frames) {
      const canvas = composeFrame(frame, maxW, maxH);
      stripWhite(canvas.bitmap);
      const b = boundsOfBitmap(canvas.bitmap);
      if (b) sides.push(Math.max(b.w, b.h));
    }
    return sides;
  });
}

function refMaxSideFromSides(sides) {
  const good = sides.filter((s) => s >= 14).sort((a, b) => a - b);
  if (!good.length) return 40;
  const idx = Math.min(good.length - 1, Math.floor(good.length * 0.85));
  return good[idx];
}

async function normalizeGif(filePath, outPath, refMaxSide) {
  const gif = await GifUtil.read(filePath);
  const { maxW, maxH } = fullCanvasSize(gif.frames);
  const outFrames = [];

  for (const frame of gif.frames) {
    const canvas = composeFrame(frame, maxW, maxH);
    stripWhite(canvas.bitmap);
    const b = boundsOfBitmap(canvas.bitmap);
    let normalized;
    if (!b) {
      normalized = new BitmapImage(TARGET_SIZE, TARGET_SIZE, 0x00000000);
    } else {
      const cropped = cropBitmap(canvas.bitmap, b);
      normalized = resizeToRefMaxSide(cropped, refMaxSide, TARGET_SIZE);
    }
    outFrames.push(
      new GifFrame(normalized, {
        delayCentisecs: frame.delayCentisecs,
        disposalMethod: frame.disposalMethod,
      })
    );
  }

  await GifUtil.write(outPath, outFrames, {
    loops: gif.loops,
    transparentIndex: 0,
  });
}

const aiwanMap = buildAiwanMap();
const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
const byNum = new Map(index.map((row) => [row.n, row.oldName]));

const refEntry =
  index.find((row) => row.oldName.toLowerCase() === REF_OLD.toLowerCase()) ||
  index[Math.min(index.length - 1, FALLBACK_REF_NUM - 1)];
const refNum = refEntry.n;
const refSource = path.join(DIR, refNum + '.gif');
const refSides = await perFrameMaxSides(refSource);
const refMaxSide = refMaxSideFromSides(refSides);
console.log(
  `Reference #${refNum} (${refEntry.oldName}) → maxSide=${refMaxSide}px`
);

let ok = 0;
let fail = 0;
let fromAiwan = 0;

for (let n = 1; n <= index.length; n++) {
  const oldName = byNum.get(n);
  const outName = n + '.gif';
  const outPath = path.join(DIR, outName);
  const tmpPath = path.join(DIR, TMP_PREFIX + outName);
  const sourcePath = outPath;

  if (sourcePath !== outPath) fromAiwan++;

  try {
    await normalizeGif(sourcePath, tmpPath, refMaxSide);
    fs.renameSync(tmpPath, outPath);
    ok++;
    if (ok % 25 === 0 || ok === index.length) {
      console.log(`Normalized ${ok}/${index.length}…`);
    }
  } catch (err) {
    fail++;
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
    console.error('FAIL', outName, oldName || '', err.message || err);
  }
}

console.log(
  `Done: ${ok} ok, ${fail} failed, ${fromAiwan} from Aiwan originals, canvas ${TARGET_SIZE}px, refSide=${refMaxSide}`
);
