/**
 * З l2dop/skills/*.xml збирає MP (#mpConsume), power та додаткові таблиці по рівнях скіла.
 * Вихід: server/src/data/l2dopSkillXmlLevels.generated.ts
 *
 * Базові рівні — атрибут `levels` (без enchant-рядків). Якщо `levels` відсутній — довжина
 * за таблицею mpConsume або power.
 *
 * Запуск з кореня репо: node server/scripts/gen-l2dop-skill-xml-tables.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const repoRoot = path.join(serverDir, '..');
/** Desktop/l2dop/skills */
const skillsDir = path.join(repoRoot, '..', 'l2dop', 'skills');
const outFile = path.join(
  serverDir,
  'src',
  'data',
  'l2dopSkillXmlLevels.generated.ts'
);

function parseTableBody(inner) {
  return inner
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n));
}

function extractTables(block) {
  const tables = Object.create(null);
  const re = /<table\s+name="(#\w+(?:-\w+)*)"\s*>\s*([\s\S]*?)\s*<\/table>/gi;
  let m;
  while ((m = re.exec(block)) !== null) {
    const name = m[1];
    const nums = parseTableBody(m[2]);
    if (nums.length) tables[name] = nums;
  }
  return tables;
}

function getSet(block, name) {
  const re = new RegExp(
    `<set\\s+name="${name}"\\s+val="([^"]*)"\\s*/>`,
    'i'
  );
  const m = block.match(re);
  return m ? m[1].trim() : null;
}

function resolveVal(raw, tables, idx, padLen) {
  if (raw == null || raw === '') return 0;
  if (raw.startsWith('#')) {
    const arr = tables[raw];
    if (!arr || arr.length === 0) return 0;
    const i = Math.min(idx, Math.max(0, arr.length - 1));
    return arr[i] ?? 0;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function padSeries(arr, len, fillFromEnd = true) {
  if (len <= 0) return [];
  if (!arr || arr.length === 0) return Array(len).fill(0);
  const out = [];
  for (let i = 0; i < len; i++) {
    if (i < arr.length) out.push(arr[i]);
    else if (fillFromEnd) out.push(arr[arr.length - 1]);
    else out.push(arr[0]);
  }
  return out;
}

function parseSkillBlock(block) {
  const open = block.match(/<skill\s+([^>]+)>/i);
  if (!open) return null;
  const head = open[1];
  const idM = head.match(/\bid="(\d+)"/i);
  if (!idM) return null;
  const id = parseInt(idM[1], 10);
  const levM = head.match(/\blevels="(\d+)"/i);
  const declared = levM ? parseInt(levM[1], 10) : null;

  const tables = extractTables(block);
  const mpRef = getSet(block, 'mpConsume');
  const powRef = getSet(block, 'power');

  let n = declared;
  if (n == null || n < 1) {
    const mpArr =
      mpRef && mpRef.startsWith('#') ? tables[mpRef] : mpRef ? [Number(mpRef)] : [];
    const powArr =
      powRef && powRef.startsWith('#')
        ? tables[powRef]
        : powRef
          ? [Number(powRef)]
          : [];
    n = Math.max(mpArr.length, powArr.length, 1);
  }

  const rows = [];
  for (let i = 0; i < n; i++) {
    const m = Math.floor(resolveVal(mpRef, tables, i, n));
    const p = resolveVal(powRef, tables, i, n);
    const row = { m, p };
    const pAtk = tables['#pAtk'];
    if (pAtk && pAtk.length) {
      const v = pAtk[Math.min(i, pAtk.length - 1)];
      if (Number.isFinite(v)) row.a = v;
    }
    const rate = tables['#rate'];
    if (rate && rate.length) {
      const v = rate[Math.min(i, rate.length - 1)];
      if (Number.isFinite(v)) row.r = v;
    }
    const spd = tables['#spd'];
    if (spd && spd.length) {
      const v = spd[Math.min(i, spd.length - 1)];
      if (Number.isFinite(v)) row.s = Math.floor(v);
    }
    const mxTab = tables['#Tab-maxHp'];
    if (mxTab && mxTab.length) {
      const v = mxTab[Math.min(i, mxTab.length - 1)];
      if (Number.isFinite(v)) row.mx = v;
    }
    rows.push(row);
  }

  return { id, rows };
}

function main() {
  if (!fs.existsSync(skillsDir)) {
    console.error('Немає папки skills:', skillsDir);
    process.exit(1);
  }
  const files = fs
    .readdirSync(skillsDir)
    .filter((f) => f.endsWith('.xml'))
    .sort();
  const byId = Object.create(null);
  for (const f of files) {
    const text = fs.readFileSync(path.join(skillsDir, f), 'utf8');
    const re = /<skill\s+[^>]+>[\s\S]*?<\/skill>/gi;
    let m;
    while ((m = re.exec(text)) !== null) {
      const parsed = parseSkillBlock(m[0]);
      if (!parsed) continue;
      if (byId[parsed.id] != null) {
        console.warn('Пропуск дубля skill id', parsed.id, 'у', f);
        continue;
      }
      byId[parsed.id] = parsed.rows;
    }
  }
  const sorted = Object.create(null);
  for (const k of Object.keys(byId).sort((a, b) => Number(a) - Number(b))) {
    sorted[k] = byId[k];
  }
  fs.writeFileSync(
    outFile,
    `export default ${JSON.stringify(sorted)} as const;\n`,
    'utf8'
  );
  console.log(
    'OK',
    outFile,
    'skills:',
    Object.keys(sorted).length
  );
}

main();
