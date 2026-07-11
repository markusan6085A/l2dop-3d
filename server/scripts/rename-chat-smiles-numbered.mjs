/**
 * Перейменовує всі GIF у server/public/ref/chat-smiles/ → 1.gif … N.gif
 * Порядок: уже пронумеровані (1.gif, 2.gif …) за числом, решта — A→Z.
 * Зберігає мапу oldName → newName у chat-smiles-index.json
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = path.resolve('server/public/ref/chat-smiles');
const TMP_PREFIX = '__ren__';

function isNumbered(name) {
  return /^\d+\.gif$/i.test(name);
}

function sortFiles(files) {
  const numbered = [];
  const named = [];
  for (const f of files) {
    if (isNumbered(f)) numbered.push(f);
    else named.push(f);
  }
  numbered.sort((a, b) => {
    const na = parseInt(a.replace(/\.gif$/i, ''), 10);
    const nb = parseInt(b.replace(/\.gif$/i, ''), 10);
    return na - nb;
  });
  named.sort((a, b) => a.localeCompare(b, 'uk', { sensitivity: 'base' }));
  return [...numbered, ...named];
}

if (!fs.existsSync(DIR)) {
  console.error('Folder not found:', DIR);
  process.exit(1);
}

const all = fs
  .readdirSync(DIR)
  .filter((f) => f.toLowerCase().endsWith('.gif') && !f.startsWith(TMP_PREFIX));

if (!all.length) {
  console.error('No GIF files found.');
  process.exit(1);
}

const ordered = sortFiles(all);
const mapping = [];

// Фаза 1: тимчасові імена (уникнути колізій 1.gif ↔ banned.gif)
for (let i = 0; i < ordered.length; i++) {
  const oldName = ordered[i];
  const tmpName = `${TMP_PREFIX}${String(i + 1).padStart(4, '0')}.gif`;
  fs.renameSync(path.join(DIR, oldName), path.join(DIR, tmpName));
  mapping.push({ n: i + 1, oldName, newName: `${i + 1}.gif` });
}

// Фаза 2: фінальні номери
for (let i = 0; i < mapping.length; i++) {
  const tmpName = `${TMP_PREFIX}${String(i + 1).padStart(4, '0')}.gif`;
  const newName = `${i + 1}.gif`;
  fs.renameSync(path.join(DIR, tmpName), path.join(DIR, newName));
}

const indexPath = path.join(DIR, 'chat-smiles-index.json');
fs.writeFileSync(indexPath, JSON.stringify(mapping, null, 2), 'utf8');

console.log(`Renamed ${mapping.length} files → 1.gif … ${mapping.length}.gif`);
console.log('Index:', indexPath);
