import { readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const failures = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walk(full);
      continue;
    }
    if (!name.endsWith('.js')) continue;
    const result = spawnSync(process.execPath, ['--check', full], { encoding: 'utf8' });
    if (result.status !== 0) {
      failures.push({
        file: full,
        message: (result.stderr || result.stdout || 'node --check failed').trim(),
      });
    }
  }
}

walk(root);

if (failures.length) {
  for (const f of failures) {
    console.error('SYNTAX ERROR:', f.file);
    console.error(f.message);
  }
  process.exit(1);
}

console.log('check-public-js-syntax: OK (' + root + ')');
