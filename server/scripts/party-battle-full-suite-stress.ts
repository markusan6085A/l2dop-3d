import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');
const suite = [
  'test:party-social',
  'test:party-battle-stage-a',
  'test:party-battle-stage-b0.5',
  'test:party-battle-stage-b',
  'test:party-battle-stage-c',
  'test:party-battle-stage-d',
];
const runs = Number(process.argv[2] ?? 5);

for (let run = 1; run <= runs; run += 1) {
  console.log(`\n=== full-suite run ${run}/${runs} ===`);
  for (const script of suite) {
    const r = spawnSync('npm', ['run', script], {
      cwd: root,
      shell: true,
      encoding: 'utf8',
    });
    if (r.status !== 0) {
      console.error(`FAIL run ${run} ${script}`);
      console.error((r.stdout + r.stderr).slice(-1200));
      process.exit(1);
    }
    console.log(`  ok ${script}`);
  }
}
console.log(`\nfull-suite ${runs}/${runs} OK`);
