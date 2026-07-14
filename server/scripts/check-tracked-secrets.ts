/**
 * Перевірка: у git-tracked файлах немає JWT_SECRET з реальним значенням і JWT-токенів.
 * Запуск: npm run check:secrets
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..');

const TRACKED = execSync('git ls-files', { encoding: 'utf8', cwd: ROOT })
  .split(/\r?\n/)
  .filter(Boolean);

const failures: string[] = [];

const jwtSecretLine = /JWT_SECRET\s*=\s*["']?([^"'\s#]+)/i;
const weakPlaceholders = new Set([
  'replace-with-long-random-string-min-32-chars',
  'changeme',
  'secret',
  'jwt-secret',
]);
const jwtToken = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/;

for (const rel of TRACKED) {
  if (rel.endsWith('.env') || rel.includes('.env.')) {
    if (!rel.endsWith('.env.example')) {
      failures.push(`${rel}: .env-файл не повинен бути в git`);
    }
    continue;
  }
  const abs = path.join(ROOT, rel);
  let text: string;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    continue;
  }
  const secretMatch = text.match(jwtSecretLine);
  if (secretMatch) {
    const val = secretMatch[1] ?? '';
    if (val.length >= 16 && !weakPlaceholders.has(val)) {
      failures.push(`${rel}: виглядає як реальний JWT_SECRET у git`);
    }
  }
  if (jwtToken.test(text)) {
    failures.push(`${rel}: знайдено JWT access token у tracked-файлі`);
  }
}

if (failures.length > 0) {
  console.error('[check:secrets] Знайдено проблеми:\n' + failures.map((f) => '  - ' + f).join('\n'));
  process.exit(1);
}

console.log('[check:secrets] OK: JWT_SECRET і токени не в tracked-файлах.');
