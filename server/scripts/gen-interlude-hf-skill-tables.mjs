/**
 * Зліплює рівні скілів Human Fighter з text-rpg (common + Warrior + Warlord + Dreadnought).
 * Ранг = порядковий номер рядка в levels (після сорту за полем level), не обов’язково 1..N підряд.
 * Генерує `l2dbInterludeHumanFighterSkillLevels.generated.ts` (лише battleId з каталогу l2dop-3d).
 *
 * node server/scripts/gen-interlude-hf-skill-tables.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const TEXT_RPG_HF = path.resolve(
  REPO_ROOT,
  '..',
  'text-rpg',
  'src',
  'data',
  'skills',
  'classes',
  'HumanFighter'
);
const OUT = path.join(
  REPO_ROOT,
  'server',
  'src',
  'data',
  'l2dbInterludeHumanFighterSkillLevels.generated.ts'
);

/** Синхронно з `humanFighterSkillCatalog.ts` — усі `battleId` у каталозі магістра. */
const CATALOG_BATTLE_IDS = new Set([
  'l2_3',
  'l2_16',
  'l2_56',
  'l2_141',
  'l2_142',
  'l2_75',
  'l2_78',
  'l2_100',
  'l2_148',
  'l2_211',
  'l2_212',
  'l2_216',
  'l2_227',
  'l2_231',
  'l2_245',
  'l2_255',
  'l2_256',
  'l2_257',
  'l2_287',
  'l2_312',
  'l2_36',
  'l2_48',
  'l2_80',
  'l2_87',
  'l2_88',
  'l2_104',
  'l2_116',
  'l2_121',
  'l2_130',
  'l2_181',
  'l2_286',
  'l2_290',
  'l2_317',
  'l2_320',
  'l2_328',
  'l2_329',
  'l2_330',
  'l2_339',
  'l2_347',
  'l2_359',
  'l2_360',
  'l2_361',
  'l2_19',
  'l2_24',
  'l2_99',
  'l2_171',
  'l2_313',
  'l2_323',
  'l2_324',
  'l2_334',
  'l2_343',
  'l2_354',
]);

/** SP з l2db Interlude, де відрізняється від text-rpg (індекс 0 не використовується). */
const L2DB_SP_OVERRIDES = {
  312: [
    0, 3700, 6400, 12000, 18000, 31000, 39000, 46000, 55000, 82000, 150000,
    167000, 173000, 320000, 360000, 530000, 500000, 780000, 780000, 1300000,
    1700000,
  ],
};

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

function parseFile(filePath) {
  const s = fs.readFileSync(filePath, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) return null;
  const id = Number(idM[1]);
  const levels = [];
  const re =
    /\{\s*level:\s*(\d+),\s*requiredLevel:\s*(\d+),\s*spCost:\s*(\d+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    levels.push({
      level: Number(m[1]),
      requiredLevel: Number(m[2]),
      spCost: Number(m[3]),
    });
  }
  if (levels.length === 0) return null;
  return { id, levels };
}

function mergeBySkillId(parsedList) {
  /** @type {Map<number, Map<number, {requiredLevel:number, spCost:number}>>} */
  const byId = new Map();
  for (const p of parsedList) {
    if (!byId.has(p.id)) byId.set(p.id, new Map());
    const lm = byId.get(p.id);
    for (const L of p.levels) {
      lm.set(L.level, {
        requiredLevel: L.requiredLevel,
        spCost: L.spCost,
      });
    }
  }
  return byId;
}

/** Ранги 1..N — N рядків після сорту за полем `level` у файлі. */
function toArrays(mergedMap) {
  /** @type {Record<string, { maxRank: number, sp: number[], minLv: number[] }>} */
  const out = {};
  for (const [id, levelMap] of mergedMap) {
    const bid = `l2_${id}`;
    if (!CATALOG_BATTLE_IDS.has(bid)) continue;
    const sortedKeys = [...levelMap.keys()].sort((a, b) => a - b);
    const maxRank = sortedKeys.length;
    const sp = [0];
    const minLv = [0];
    let rank = 1;
    for (const k of sortedKeys) {
      const row = levelMap.get(k);
      sp[rank] = row.spCost;
      minLv[rank] = row.requiredLevel;
      rank++;
    }
    out[bid] = { maxRank, sp, minLv };
  }
  return out;
}

function applyOverrides(tables) {
  for (const [key, spArr] of Object.entries(L2DB_SP_OVERRIDES)) {
    const bid = `l2_${key}`;
    if (!tables[bid]) continue;
    const t = tables[bid];
    const n = Math.min(spArr.length - 1, t.maxRank);
    for (let r = 1; r <= n; r++) {
      t.sp[r] = spArr[r];
    }
  }
}

function main() {
  if (!fs.existsSync(TEXT_RPG_HF)) {
    console.error('Немає папки text-rpg:', TEXT_RPG_HF);
    process.exit(1);
  }
  const dirs = [
    'common',
    'Warrior',
    'Warlord',
    'Dreadnought',
    'Hawkeye',
    'Sagittarius',
  ].map((d) => path.join(TEXT_RPG_HF, d));
  const parsed = [];
  for (const dir of dirs) {
    for (const f of walkTs(dir)) {
      const p = parseFile(f);
      if (p) parsed.push(p);
    }
  }
  const merged = mergeBySkillId(parsed);
  const tables = toArrays(merged);
  applyOverrides(tables);
  /** Rapid Shot (99): два ранги в магістрі; SP сумарно як у каталозі (12000), розбито на два кроки. */
  if (tables.l2_99) {
    tables.l2_99.maxRank = 2;
    tables.l2_99.sp = [0, 6000, 6000];
    tables.l2_99.minLv = [0, 40, 40];
  }

  const missing = [...CATALOG_BATTLE_IDS].filter((b) => !tables[b]);
  if (missing.length) {
    console.warn('Немає levels у text-rpg для:', missing.join(', '));
  }

  const battleIds = [...CATALOG_BATTLE_IDS].filter((b) => tables[b]).sort();
  let ts = `/* eslint-disable */\n`;
  ts += `/**\n * Автоген: node server/scripts/gen-interlude-hf-skill-tables.mjs\n`;
  ts += ` * Рядки: text-rpg HumanFighter; SP для 312 — override l2db Interlude.\n */\n\n`;

  ts += `export const INTERLUDE_HF_MAX_RANK_BY_BATTLE_ID: Record<string, number> = {\n`;
  for (const bid of battleIds) {
    ts += `  ${JSON.stringify(bid)}: ${tables[bid].maxRank},\n`;
  }
  ts += `};\n\n`;

  ts += `export const INTERLUDE_HF_SP_BY_RANK: Record<string, readonly number[]> = {\n`;
  for (const bid of battleIds) {
    ts += `  ${JSON.stringify(bid)}: ${JSON.stringify(tables[bid].sp)} as const,\n`;
  }
  ts += `};\n\n`;

  ts += `export const INTERLUDE_HF_MIN_CHAR_LEVEL_BY_RANK: Record<string, readonly number[]> = {\n`;
  for (const bid of battleIds) {
    ts += `  ${JSON.stringify(bid)}: ${JSON.stringify(tables[bid].minLv)} as const,\n`;
  }
  ts += `};\n`;

  fs.writeFileSync(OUT, ts, 'utf8');
  console.log('OK:', OUT, 'skills:', battleIds.length);
}

main();
