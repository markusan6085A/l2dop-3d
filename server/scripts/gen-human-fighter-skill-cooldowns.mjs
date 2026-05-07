/**
 * КД (сек) для скілів HumanFighter з text-rpg → `humanFighterSkillCooldowns.generated.ts`.
 * Правило злиття: якщо є визначення в `common/` — беремо **мінімум** серед файлів common
 * (рідко дублікати); інакше **мінімум** серед усіх інших папок (узгоджено з l2dop: коротший КД
 * при протиріччях копій Rogue/TH тощо).
 * Запуск: `npm run gen:hf-cooldowns`
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEXT_HF = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'text-rpg',
  'src',
  'data',
  'skills',
  'classes',
  'HumanFighter'
);
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'humanFighterSkillCooldowns.generated.ts'
);

function walkTs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkTs(p));
    else if (/\.ts$/.test(ent.name) && ent.name !== 'index.ts') out.push(p);
  }
  return out;
}

function parseCooldownSec(source) {
  const cdM = source.match(/cooldown:\s*(\d+)/);
  return cdM ? Number(cdM[1]) : undefined;
}

function relToHumanFighter(filePath) {
  return path.relative(TEXT_HF, filePath);
}

/** @type {Map<number, { common: number[]; other: number[] }>} */
const groups = new Map();

for (const filePath of walkTs(TEXT_HF)) {
  const s = fs.readFileSync(filePath, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) continue;
  const id = Number(idM[1]);
  const cd = parseCooldownSec(s);
  if (cd == null) continue;
  const rel = relToHumanFighter(filePath);
  const top = rel.split(path.sep)[0] || '';
  const isCommon = top === 'common';
  let g = groups.get(id);
  if (!g) {
    g = { common: [], other: [] };
    groups.set(id, g);
  }
  (isCommon ? g.common : g.other).push(cd);
}

const byId = new Map();
for (const [id, g] of groups) {
  const pick =
    g.common.length > 0
      ? Math.min(...g.common)
      : g.other.length > 0
        ? Math.min(...g.other)
        : null;
  if (pick == null) continue;
  if (g.common.length > 1 && new Set(g.common).size > 1) {
    console.warn(
      `HF skill ${id}: common/ cooldowns differ ${g.common.join(',')}, using min=${pick}`
    );
  }
  if (
    g.common.length === 0 &&
    g.other.length > 1 &&
    new Set(g.other).size > 1
  ) {
    console.warn(
      `HF skill ${id}: branch copies differ ${g.other.join(',')}, using min=${pick}`
    );
  }
  byId.set(id, pick);
}

const sorted = [...byId.entries()].sort((a, b) => a[0] - b[0]);
const lines = sorted.map(([id, sec]) => `  ${id}: ${sec},`).join('\n');

const head = `/**
 * Автоген з text-rpg HumanFighter (\`npm run gen:hf-cooldowns\`). Не правити вручну.
 * Секунди перезарядки; id без запису — у джерелі немає числового cooldown.
 */
export const HUMAN_FIGHTER_L2_COOLDOWN_SEC: Readonly<
  Partial<Record<number, number>>
> = {
`;
const tail = `
};
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, head + lines + tail, 'utf8');
console.log('Wrote', OUT, 'skills with cooldown', sorted.length);
