#!/usr/bin/env node
/**
 * Рекурсивно перейменовує файли й папки під server/public/icons/drops —
 * лише нижній регістр назв (великі → малі букви).
 *
 * На Windows (регістр імен): зміна лише регістру через проміжну назву.
 *
 * Використання (з кореня репо):
 *   node server/scripts/rename-icons-drops-lowercase.mjs
 *   node server/scripts/rename-icons-drops-lowercase.mjs --dry-run
 *   node server/scripts/rename-icons-drops-lowercase.mjs "D:/icons/drops"
 */

import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes('--dry-run') || argv.includes('-n');
  const rest = argv.filter((a) => a !== '--dry-run' && a !== '-n');
  const customRoot = rest[0]?.trim()
    ? path.resolve(rest[0])
    : path.resolve(__dirname, '..', 'public', 'icons', 'drops');
  return { dryRun, root: customRoot };
}

async function exists(p) {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function walkDirs(root) {
  const dirs = [];
  async function visit(dirAbs) {
    let entries;
    try {
      entries = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch (e) {
      console.error('Не прочитати каталог:', dirAbs, String(e.message || e));
      return;
    }
    for (const ent of entries) {
      const full = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) {
        dirs.push(full);
        await visit(full);
      }
    }
  }
  await visit(root);
  return dirs;
}

async function walkFiles(root) {
  const files = [];
  async function visit(dirAbs) {
    let entries;
    try {
      entries = await fs.readdir(dirAbs, { withFileTypes: true });
    } catch (e) {
      return;
    }
    for (const ent of entries) {
      const full = path.join(dirAbs, ent.name);
      if (ent.isDirectory()) await visit(full);
      else if (ent.isFile()) files.push(full);
    }
  }
  await visit(root);
  return files;
}

/** Глибина відносно root (ігнорує дискові відмінності). */
function depthFromRoot(rootAbs, entryAbs) {
  const rel = path.relative(rootAbs, entryAbs);
  if (!rel || rel.startsWith('..')) return 0;
  return rel.split(path.sep).filter(Boolean).length;
}

async function safeRenameLeaf(oldAbs, lcBaseName) {
  const dir = path.dirname(oldAbs);
  const oldBase = path.basename(oldAbs);
  const newAbs = path.join(dir, lcBaseName);
  if (oldBase === lcBaseName) return { changed: false, oldAbs, newAbs };

  if (!(await exists(oldAbs))) return { changed: false, oldAbs, newAbs };

  if (oldBase.toLowerCase() === lcBaseName.toLowerCase()) {
    const tmp = path.join(
      dir,
      `.__lc_tmp_${crypto.randomBytes(6).toString('hex')}__` + oldBase
    );
    await fs.rename(oldAbs, tmp);
    await fs.rename(tmp, newAbs);
    return { changed: true, oldAbs, newAbs };
  }

  if (await exists(newAbs)) {
    throw new Error(
      `Ціль уже існує (колізія): ${newAbs}\n  було: ${oldAbs}`
    );
  }
  await fs.rename(oldAbs, newAbs);
  return { changed: true, oldAbs, newAbs };
}

/** У межах одного каталогу два записи не можуть давати один і той же lowercase-базнейм */
function detectCollisionsInTree(items, root, kindLabel) {
  const map = new Map();
  for (const p of items) {
    const parent = path.dirname(p);
    const base = path.basename(p);
    const key = parent + '\0' + base.toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(p);
  }
  const collisions = [];
  for (const arr of map.values()) {
    const uniqOriginal = new Set(arr.map((x) => path.basename(x)));
    if (uniqOriginal.size > 1) collisions.push(arr);
  }
  if (collisions.length) {
    console.error(`${kindLabel}: колізії (різні імена → одне після lowercase):`);
    for (const group of collisions) {
      console.error(
        '  •',
        group.map((x) => path.relative(root, x)).join(' | ')
      );
    }
    throw new Error('Зупинка: виріши конфлікт імен перед запуском.');
  }
}

async function main() {
  const { dryRun, root } = parseArgs();
  if (!(await exists(root))) {
    console.error('Каталог не знайдено:', root);
    console.error(
      '(Створи server/public/icons/drops або передай абсолютний шлях першим аргументом.)'
    );
    process.exit(1);
  }

  console.log(`${dryRun ? '[DRY-RUN] ' : ''}Корінь:`, root);

  const dirsFirst = await walkDirs(root);
  detectCollisionsInTree(dirsFirst, root, 'Папки');

  dirsFirst.sort(
    (a, b) => depthFromRoot(root, b) - depthFromRoot(root, a)
  );

  let nDir = 0;
  for (const d of dirsFirst) {
    const lc = path.basename(d).toLowerCase();
    if (path.basename(d) === lc) continue;
    const rel = path.relative(root, d) || '.';
    console.log('📁', rel, '→', lc);
    if (!dryRun) {
      try {
        const { changed } = await safeRenameLeaf(d, lc);
        if (changed) nDir += 1;
      } catch (e) {
        console.error('Помилка:', d, String(e.message || e));
        process.exit(1);
      }
    } else {
      nDir += 1;
    }
  }

  const files = await walkFiles(root);
  detectCollisionsInTree(files, root, 'Файли');

  files.sort(
    (a, b) => depthFromRoot(root, b) - depthFromRoot(root, a)
  );

  let nFile = 0;
  for (const f of files) {
    const lc = path.basename(f).toLowerCase();
    if (path.basename(f) === lc) continue;
    const rel = path.relative(root, f);
    console.log('📄', rel, '→', lc);
    if (!dryRun) {
      try {
        const { changed } = await safeRenameLeaf(f, lc);
        if (changed) nFile += 1;
      } catch (e) {
        console.error('Помилка:', f, String(e.message || e));
        process.exit(1);
      }
    } else {
      nFile += 1;
    }
  }

  if (dryRun) {
    console.log(
      `\nDry-run: папок позначено ${nDir}, файлів позначено ${nFile}. Запуск без --dry-run застосує зміни.`
    );
  } else {
    console.log(`\nГотово. Перейменовано каталогів: ${nDir}, файлів: ${nFile}.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
