#!/usr/bin/env node
/**
 * Сканує server/public/icons/drops і генерує server/src/data/dropsShopCatalog.generated.ts
 *
 * Корінь: weapon_*, earring_*, arrom_* (броня й щити) — суфікс грейду: ng, d, c, b, a, s
 * Також суфікс кирилична «а» (U+0430) → грейд A.
 *
 * Запуск із кореня репо: node server/scripts/gen-drops-shop-catalog.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..', 'public', 'icons', 'drops');
const OUT_TS = path.resolve(__dirname, '..', 'src', 'data', 'dropsShopCatalog.generated.ts');

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const GRADE_BY_SUFFIX = new Map([
  ['ng', 'NG'],
  ['n', 'NG'],
  ['d', 'D'],
  ['c', 'C'],
  ['b', 'B'],
  ['a', 'A'],
  ['s', 'S'],
  ['а', 'A'], // кирилична літера «а»
]);

function classifyFolder(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('weapon_')) return 'weapon';
  if (lower.startsWith('earring_')) return 'earring';
  if (lower.startsWith('arrom_')) return 'armor';
  return null;
}

function gradeFromFolderName(name, categoryPrefix) {
  const prefix = `${categoryPrefix}_`;
  if (!name.toLowerCase().startsWith(prefix)) return null;
  const raw = name.slice(prefix.length);
  const g = GRADE_BY_SUFFIX.get(raw) ?? GRADE_BY_SUFFIX.get(raw.toLowerCase());
  return g ?? null;
}

/** У межах папки arrom_*: щити vs решта броні (за ім’ям файлу). */
function armorFolderRowCategory(base) {
  const b = base.toLowerCase().replace(/\.[^/.]+$/, '');
  if (b.startsWith('shield_') || b.includes('_shield')) return 'shield';
  return 'armor';
}

/** Сміттєві / помилково покладені асети в arrom_* (не потрапляють у крамницю). */
function shouldSkipArmorAssetBase(baseLower) {
  if (baseLower === 'monster') return true;
  if (baseLower.startsWith('weapon_')) return true;
  return false;
}

/** Назва з файлу без розширення — для підпису в UI (латиниця L2 як у класиці клієнта). */
function labelFromBase(base) {
  const noShieldPrefix = base.replace(/^shield_/i, '');
  const bits = noShieldPrefix.replace(/-/g, '_').split('_').filter(Boolean);
  return bits
    .map((w) =>
      w.length ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ''
    )
    .filter(Boolean)
    .join(' ')
    || base;
}

function walk(root) {
  const rows = [];
  if (!fs.existsSync(root)) return rows;

  const top = fs.readdirSync(root, { withFileTypes: true });
  for (const dirent of top) {
    if (!dirent.isDirectory()) continue;
    const fname = dirent.name;
    const folderSeg = fname.toLowerCase().replace(/\\/g, '/');
    const cat = classifyFolder(folderSeg);
    if (!cat) continue;

    const prefix =
      cat === 'weapon'
        ? 'weapon'
        : cat === 'earring'
          ? 'earring'
          : 'arrom';
    const grade = gradeFromFolderName(folderSeg, prefix);
    if (!grade) {
      console.warn('Пропущено каталог (невідомий грейд):', fname);
      continue;
    }

    const dirAbs = path.join(root, fname);
    function visitDir(currentAbs, relParts) {
      const ents = fs.readdirSync(currentAbs, { withFileTypes: true });
      for (const e of ents) {
        const p = path.join(currentAbs, e.name);
        if (e.isDirectory()) {
          visitDir(p, [...relParts, e.name]);
          continue;
        }
        const ext = path.extname(e.name).toLowerCase();
        if (!IMG_EXT.has(ext)) continue;
        const fileSeg = e.name.toLowerCase();
        const nested =
          relParts.length > 0
            ? relParts.map((s) => s.toLowerCase()).join('/') + '/'
            : '';
        const relFromDrops = `${folderSeg}/${nested}${fileSeg}`;
        const shopKey = relFromDrops.replace(/\\/g, '/');
        const baseNoExt = path.basename(fileSeg, ext);
        if (
          cat === 'armor' &&
          shouldSkipArmorAssetBase(baseNoExt.toLowerCase())
        )
          continue;
        const rowCat =
          cat === 'armor' ? armorFolderRowCategory(baseNoExt) : cat;
        rows.push({
          shopKey,
          category: rowCat,
          grade,
          iconUrl: '/icons/drops/' + shopKey,
          nameUk: labelFromBase(baseNoExt),
        });
      }
    }
    visitDir(dirAbs, []);
  }

  rows.sort((a, b) =>
    a.grade.localeCompare(b.grade, undefined, { sensitivity: 'base' })
      || a.category.localeCompare(b.category)
      || a.nameUk.localeCompare(b.nameUk, undefined, { sensitivity: 'base' })
  );
  return rows;
}

function emitTs(rows) {
  return `// AUTO-GENERATED — node server/scripts/gen-drops-shop-catalog.mjs

export type DropsShopGradeUk = 'NG' | 'D' | 'C' | 'B' | 'A' | 'S';

export type DropsShopCategory = 'weapon' | 'shield' | 'armor' | 'earring' | 'consumable';

export interface DropsShopCatalogRow {
  shopKey: string;
  category: DropsShopCategory;
  grade: DropsShopGradeUk;
  iconUrl: string;
  nameUk: string;
}

export const DROPS_SHOP_CATALOG: DropsShopCatalogRow[] = ${JSON.stringify(rows, null, 2)};
`;
}

function main() {
  const rows = walk(ROOT);
  fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
  fs.writeFileSync(OUT_TS, emitTs(rows), 'utf8');
  console.log(`OK: записано ${rows.length} позицій → ${OUT_TS}`);
}

main();
