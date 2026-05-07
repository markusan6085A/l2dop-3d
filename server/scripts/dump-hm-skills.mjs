import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..', '..', '..', 'text-rpg', 'src', 'data', 'skills', 'classes', 'HumanMystic');

function walk(d) {
  const out = [];
  if (!fs.existsSync(d)) return out;
  for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else if (/\.ts$/.test(ent.name) && ent.name !== 'index.ts') out.push(p);
  }
  return out;
}

function folderOf(filePath) {
  const rel = path.relative(root, filePath);
  return rel.split(path.sep)[0] || 'common';
}

const rows = [];
for (const f of walk(root)) {
  const s = fs.readFileSync(f, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) continue;
  const id = Number(idM[1]);
  const nmM = s.match(/name:\s*"([^"]+)"/);
  const catM = s.match(/category:\s*"([^"]+)"/);
  rows.push({
    id,
    name: nmM ? nmM[1] : '',
    category: catM ? catM[1] : 'none',
    folder: folderOf(f),
  });
}
rows.sort((a, b) => a.id - b.id);
console.log(JSON.stringify(rows, null, 0));
