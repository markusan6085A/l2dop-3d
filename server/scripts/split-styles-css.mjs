/**
 * Пересікання monolith CSS на partials із коректними топ-ровними межами (depth {} = 0).
 *
 *   node server/scripts/split-styles-css.mjs           — робить частини + перевизначає styles.css на @import
 *   node server/scripts/split-styles-css.mjs --verify-only — лише скільки буде частин / межі
 *
 * Як склеїти моноліт з частин без зміни агрегатора сторінок:
 *
 *   node server/scripts/split-styles-css.mjs --merge-partials
 *
 * створює server/public/styles.full.restored.css (можна підмінити ним файл для подальшого split).
 *
 * Після першого розбиття повторний split без моноліта в styles.css блокується.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const stylesPath = path.join(repoRoot, 'server', 'public', 'styles.css');
const outDir = path.join(repoRoot, 'server', 'public', 'css', 'styles-partials');

/** Скласти частини в один файл (повний моноліт). Не замінює styles.css автоматично — перейменуй/підміни сам. */
function mergePartials(destPath) {
  const names = [];
  for (let i = 1; i <= 20; i++) {
    const f = path.join(outDir, `part-${String(i).padStart(2, '0')}.css`);
    if (!fs.existsSync(f)) break;
    names.push(`part-${String(i).padStart(2, '0')}.css`);
  }
  if (!names.length) {
    console.error(`Нічого складати: немає part-*.css у ${path.relative(repoRoot, outDir)}`);
    process.exit(1);
  }
  let agg = '';
  for (const n of names) {
    agg += fs.readFileSync(path.join(outDir, n), 'utf8');
  }
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, agg, 'utf8');
  console.log(`Складено ${names.length} файлів у`, path.relative(repoRoot, destPath));
}

if (process.argv.includes('--merge-partials')) {
  const mergedPath = path.join(repoRoot, 'server', 'public', 'styles.full.restored.css');
  mergePartials(mergedPath);
  process.exit(0);
}

const MIN_LINES = 650;
const MAX_LINES = 1150;

function depthEnds(lines) {
  let d = 0;
  const zeroEndLines = []; // inclusive line indices (0-based) where depth ends 0 after line
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    d += (ln.match(/\{/g) || []).length - (ln.match(/\}/g) || []).length;
    if (d === 0) zeroEndLines.push(i);
  }
  if (d !== 0) {
    throw new Error(`Unbalanced braces in styles.css, final depth=${d}`);
  }
  return zeroEndLines;
}

function partition(zeroEnds, n) {
  /** @type {Array<[number, number]>} inclusive [start,end] line indices */
  const parts = [];
  let cs = 0;
  while (cs < n) {
    const eligible = zeroEnds.filter(
      (z) => z >= cs && z - cs + 1 >= MIN_LINES && z - cs + 1 <= MAX_LINES
    );
    let end;
    if (eligible.length) {
      end = Math.max(...eligible);
    } else {
      const forced = zeroEnds.find((z) => z >= cs && z - cs + 1 >= MIN_LINES);
      end = forced != null ? forced : zeroEnds.find((z) => z >= cs);
      if (end == null) {
        end = n - 1;
      }
    }
    parts.push([cs, end]);
    if (end === n - 1) break;
    cs = end + 1;
  }
  return parts;
}

function main() {
  const verifyOnly = process.argv.includes('--verify-only');
  const raw = fs.readFileSync(stylesPath, 'utf8');
  if (
    /^@import\s+url\s*\(\s*"\/css\/styles-partials\//m.test(raw) &&
    !/:root\b/.test(raw)
  ) {
    console.error(
      'Цей styles.css уже агрегатор із @import. Віднови моноліт у файл або склей partials перед повторним запуском split.'
    );
    process.exit(1);
  }

  const lines = raw.split(/\r?\n/);
  const Z = depthEnds(lines);
  const parts = partition(Z, lines.length);

  const total = parts.reduce((a, [s, e]) => a + (e - s + 1), 0);
  if (total !== lines.length) {
    throw new Error(`Line count mismatch: parts sum ${total} vs ${lines.length}`);
  }
  for (let i = 1; i < parts.length; i++) {
    if (parts[i - 1][1] + 1 !== parts[i][0]) {
      throw new Error(`Non-contiguous partition at part ${i}`);
    }
  }

  if (verifyOnly) {
    console.log('OK verify-only:', parts.length, 'chunks,', lines.length, 'lines');
    console.log(
      parts.map(([s, e]) => ({ from: s + 1, to: e + 1, len: e - s + 1 }))
    );
    return;
  }

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const importVersion = '20260509split';
  const names = [];
  for (let i = 0; i < parts.length; i++) {
    const [s, e] = parts[i];
    const chunk = lines.slice(s, e + 1).join('\n') + '\n';
    const name = `part-${String(i + 1).padStart(2, '0')}.css`;
    names.push(name);
    fs.writeFileSync(path.join(outDir, name), chunk, 'utf8');
  }

  const header = `/* Згенеровано розбиттям моноліту; порядок @import = каскад оригіналу. Не переставляти. */\n`;
  const imports = names
    .map(
      (n) =>
        `@import url("/css/styles-partials/${n}?v=${importVersion}");`
    )
    .join('\n');
  fs.writeFileSync(stylesPath, header + imports + '\n', 'utf8');

  console.log('Wrote', names.length, 'partials to', path.relative(repoRoot, outDir));
  console.log('Updated', path.relative(repoRoot, stylesPath));
}

main();
