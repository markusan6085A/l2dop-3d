/**
 * Жорстко обрізає hero/photo портрети: без браузерного UI, рівний кадр.
 * Запуск: node server/scripts/normalize-character-portraits.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const CHAR_DIR = path.resolve('server/public/characters');
const OUT_W = 480;
const OUT_H = 1000;
const BODY_MAX_H = OUT_H - 28 - 16;
const BODY_MAX_W = OUT_W - 16;
const FEET_PAD = 28;
const HEAD_PAD = 16;
const STUDIO_BG = { r: 220, g: 220, b: 220 };

function fileNum(filename) {
  const m = filename.match(/^(?:photo|hero)_(\d+)/);
  return m ? parseInt(m[1], 10) : NaN;
}

function isSourceName(filename) {
  return /^photo_\d+_/.test(filename) || /^hero_\d+\.jpg$/.test(filename);
}

function isStudio(r, g, b) {
  const lum = (r + g + b) / 3;
  const ch = Math.max(r, g, b) - Math.min(r, g, b);
  return lum > 172 && lum < 250 && ch < 42;
}

function isDarkChrome(r, g, b) {
  const lum = (r + g + b) / 3;
  return lum < 95;
}

function isLetterbox(r, g, b, ref) {
  return (
    Math.abs(r - ref[0]) + Math.abs(g - ref[1]) + Math.abs(b - ref[2]) < 28
  );
}

function isCharacterPixel(r, g, b) {
  if (isDarkChrome(r, g, b)) return true;
  return !isStudio(r, g, b);
}

async function loadRaw(filePath) {
  return sharp(filePath)
    .flatten({ background: STUDIO_BG })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
}

function detectPanel(data, w, h) {
  const ref = [data[0], data[1], data[2]];
  let top = 0;
  let bottom = h - 1;
  let left = 0;
  let right = w - 1;

  for (let y = 0; y < h; y++) {
    let lb = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isLetterbox(data[i], data[i + 1], data[i + 2], ref)) lb++;
    }
    if (lb > w * 0.04) {
      top = y;
      break;
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    let lb = 0;
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (!isLetterbox(data[i], data[i + 1], data[i + 2], ref)) lb++;
    }
    if (lb > w * 0.04) {
      bottom = y;
      break;
    }
  }
  for (let x = 0; x < w; x++) {
    let lb = 0;
    for (let y = top; y <= bottom; y++) {
      const i = (y * w + x) * 4;
      if (!isLetterbox(data[i], data[i + 1], data[i + 2], ref)) lb++;
    }
    if (lb > (bottom - top + 1) * 0.04) {
      left = x;
      break;
    }
  }
  for (let x = w - 1; x >= 0; x--) {
    let lb = 0;
    for (let y = top; y <= bottom; y++) {
      const i = (y * w + x) * 4;
      if (!isLetterbox(data[i], data[i + 1], data[i + 2], ref)) lb++;
    }
    if (lb > (bottom - top + 1) * 0.04) {
      right = x;
      break;
    }
  }

  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function detectStudioAndCharacter(data, w, panel) {
  const x0 = panel.left;
  const x1 = panel.left + panel.width - 1;
  const y0 = panel.top;
  const y1 = panel.top + panel.height - 1;
  const rowW = x1 - x0 + 1;

  let studioTop = y0;
  let stable = 0;
  for (let y = y0; y <= y1; y++) {
    let dark = 0;
    let studio = 0;
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (isDarkChrome(r, g, b)) dark++;
      else if (isStudio(r, g, b)) studio++;
    }
    if (dark / rowW > 0.35) {
      stable = 0;
      continue;
    }
    if (studio / rowW > 0.78) {
      stable++;
      if (stable >= 2) {
        studioTop = y - 1;
        break;
      }
    } else {
      stable = 0;
    }
  }

  const rowCounts = [];
  for (let y = studioTop; y <= y1; y++) {
    let chars = 0;
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4;
      if (isCharacterPixel(data[i], data[i + 1], data[i + 2])) chars++;
    }
    rowCounts.push({ y, chars });
  }

  const minChars = Math.max(4, Math.floor(rowW * 0.004));
  let bestStart = -1;
  let bestEnd = -1;
  let bestLen = 0;
  let curStart = -1;
  for (const row of rowCounts) {
    if (row.chars >= minChars) {
      if (curStart < 0) curStart = row.y;
    } else if (curStart >= 0) {
      const len = row.y - curStart;
      if (len > bestLen) {
        bestLen = len;
        bestStart = curStart;
        bestEnd = row.y - 1;
      }
      curStart = -1;
    }
  }
  if (curStart >= 0) {
    const len = y1 - curStart + 1;
    if (len > bestLen) {
      bestLen = len;
      bestStart = curStart;
      bestEnd = y1;
    }
  }

  if (bestStart < 0 || bestLen < 80) {
    return {
      left: x0,
      top: studioTop,
      width: rowW,
      height: y1 - studioTop + 1,
    };
  }

  let minY = bestStart;
  let maxY = bestEnd;
  let minX = x1;
  let maxX = x0;

  for (let y = minY; y <= maxY; y++) {
    for (let x = x0; x <= x1; x++) {
      const i = (y * w + x) * 4;
      if (!isCharacterPixel(data[i], data[i + 1], data[i + 2])) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
    }
  }

  const padX = Math.max(4, Math.round((maxX - minX + 1) * 0.02));
  const padY = Math.max(4, Math.round((maxY - minY + 1) * 0.02));
  return {
    left: Math.max(x0, minX - padX),
    top: Math.max(studioTop, minY - padY),
    width: Math.min(x1, maxX + padX) - Math.max(x0, minX - padX) + 1,
    height: Math.min(y1, maxY + padY) - Math.max(studioTop, minY - padY) + 1,
  };
}

async function normalizeOne(srcPath, outPath) {
  const { data, info } = await loadRaw(srcPath);
  const panel = detectPanel(data, info.width, info.height);
  const box = detectStudioAndCharacter(data, info.width, panel);

  const scale = Math.min(
    BODY_MAX_H / box.height,
    BODY_MAX_W / box.width
  );
  const scaledW = Math.max(1, Math.round(box.width * scale));
  const scaledH = Math.max(1, Math.round(box.height * scale));
  const left = Math.max(0, Math.round((OUT_W - scaledW) / 2));
  const top = Math.max(
    HEAD_PAD,
    OUT_H - FEET_PAD - scaledH
  );

  const subject = await sharp(srcPath)
    .flatten({ background: STUDIO_BG })
    .extract(box)
    .resize(scaledW, scaledH, { fit: 'fill' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: OUT_W,
      height: OUT_H,
      channels: 3,
      background: STUDIO_BG,
    },
  })
    .composite([{ input: subject, left, top }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(outPath);
}

async function main() {
  const all = fs.readdirSync(CHAR_DIR).filter(isSourceName);
  const byNum = new Map();

  for (const f of all.filter((x) => /^photo_\d+_/.test(x))) {
    const n = fileNum(f);
    if (Number.isFinite(n)) byNum.set(n, f);
  }
  if (byNum.size === 0) {
    for (const f of all.filter((x) => /^hero_\d+\.jpg$/.test(x))) {
      const n = fileNum(f);
      if (Number.isFinite(n)) byNum.set(n, f);
    }
  } else {
    for (const f of all.filter((x) => /^hero_\d+\.jpg$/.test(x))) {
      const n = fileNum(f);
      if (Number.isFinite(n) && !byNum.has(n)) byNum.set(n, f);
    }
  }

  if (!byNum.size) {
    console.error('No photo_* or hero_*.jpg files in', CHAR_DIR);
    process.exit(1);
  }

  const tmpDir = path.join(CHAR_DIR, '_normalize_tmp');
  fs.mkdirSync(tmpDir, { recursive: true });

  const replacedNums = [];
  for (const [n, src] of [...byNum.entries()].sort((a, b) => a[0] - b[0])) {
    const outName = `hero_${String(n).padStart(2, '0')}.jpg`;
    await normalizeOne(path.join(CHAR_DIR, src), path.join(tmpDir, outName));
    replacedNums.push(n);
    console.log(`${src} -> ${outName}`);
  }

  for (const n of replacedNums) {
    const heroName = `hero_${String(n).padStart(2, '0')}.jpg`;
    const heroPath = path.join(CHAR_DIR, heroName);
    if (fs.existsSync(heroPath)) fs.unlinkSync(heroPath);
  }
  for (const f of all.filter((x) => /^photo_\d+_/.test(x))) {
    const full = path.join(CHAR_DIR, f);
    if (fs.existsSync(full)) fs.unlinkSync(full);
  }

  for (const f of fs.readdirSync(tmpDir)) {
    fs.renameSync(path.join(tmpDir, f), path.join(CHAR_DIR, f));
  }
  fs.rmdirSync(tmpDir);

  console.log(`Done: updated ${replacedNums.length} portrait(s)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
