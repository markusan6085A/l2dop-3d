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

const ids = new Set();
for (const f of walk(root)) {
  const s = fs.readFileSync(f, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) continue;
  ids.add(Number(idM[1]));
}
console.log('HumanMystic skill files, unique id count:', ids.size);
