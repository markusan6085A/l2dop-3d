import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const script = process.argv[2] ?? 'test:party-battle-stage-c';
const count = Number(process.argv[3] ?? 10);

for (let i = 1; i <= count; i += 1) {
  const r = spawnSync('npm', ['run', script], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    console.error(`FAIL ${script} #${i}`);
    console.error((r.stdout + r.stderr).slice(-900));
    process.exit(1);
  }
  console.log(`pass ${script} #${i}`);
}
console.log(`${script} ${count}/${count} OK`);
