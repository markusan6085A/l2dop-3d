import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..');

function run(label: string, script: string): boolean {
  const r = spawnSync('npm', ['run', script], {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    stdio: 'pipe',
  });
  const ok = r.status === 0;
  const tail = (r.stdout + r.stderr).split('\n').slice(-4).join('\n');
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}\n${tail}\n`);
  return ok;
}

const suites = [
  ['Stage B x10', 'test:party-battle-stage-b', 10],
  ['Stage C x10', 'test:party-battle-stage-c', 10],
] as const;

let failed = false;
for (const [label, script, count] of suites) {
  for (let i = 1; i <= count; i += 1) {
    if (!run(`${label} #${i}`, script)) {
      failed = true;
      break;
    }
  }
}

const full = [
  'test:party-social',
  'test:party-battle-stage-a',
  'test:party-battle-stage-b0.5',
  'test:party-battle-stage-b',
  'test:party-battle-stage-c',
  'test:party-battle-stage-d',
];

if (!failed) {
  for (let i = 1; i <= 5; i += 1) {
    console.log(`=== FULL SUITE RUN ${i}/5 ===`);
    for (const script of full) {
      if (!run(`${script} (full ${i})`, script)) {
        failed = true;
        break;
      }
    }
    if (failed) break;
  }
}

process.exit(failed ? 1 : 0);
