/**
 * Тогли (category: "toggle") Human Fighter з text-rpg.
 * Вихід: server/src/data/textRpgHfToggleEffects.generated.ts
 *
 * node server/scripts/gen-text-rpg-hf-toggle-effects.mjs
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
  'textRpgHfToggleEffects.generated.ts'
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

function parseEffectsBlock(s) {
  const effM = s.match(/effects:\s*\[([\s\S]*?)\]\s*,/);
  if (!effM) return [];
  const block = effM[1];
  const effects = [];
  const re =
    /\{\s*"?stat"?\s*:\s*"([^"]+)"\s*,\s*"?mode"?\s*:\s*"(\w+)"(?:\s*,\s*"?value"?\s*:\s*([0-9.-]+))?\s*\}/g;
  let m;
  while ((m = re.exec(block)) !== null) {
    const o = { stat: m[1], mode: m[2] };
    if (m[3] !== undefined) o.value = Number(m[3]);
    effects.push(o);
  }
  return effects;
}

function defaultEffectsFromPowerType(s) {
  const ptM = s.match(/powerType:\s*"(\w+)"/);
  const pt = ptM ? ptM[1] : 'percent';
  if (pt === 'multiplier') return [{ stat: 'pAtk', mode: 'multiplier' }];
  if (pt === 'flat') return [{ stat: 'pAtk', mode: 'flat' }];
  return [{ stat: 'pAtk', mode: 'percent' }];
}

function parseToggleFile(filePath) {
  const s = fs.readFileSync(filePath, 'utf8');
  if (!/category:\s*"toggle"/.test(s)) return null;
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) return null;
  const id = Number(idM[1]);
  const fromBlock = parseEffectsBlock(s);
  const explicitEffects = fromBlock.length > 0;
  const effects = explicitEffects ? fromBlock : defaultEffectsFromPowerType(s);

  const levels = [];
  const re =
    /\{\s*"?level"?\s*:\s*(\d+)\s*,[\s\S]*?"?power"?\s*:\s*([0-9.]+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    levels.push({
      level: Number(m[1]),
      power: Number(m[2]),
    });
  }
  if (levels.length === 0) return null;

  return { id, effects, levels, explicitEffects };
}

function effectKey(e) {
  const v = e.value !== undefined && e.value !== null ? String(e.value) : '';
  return `${e.stat}:${e.mode}:${v}`;
}

function mergeToggles(parsedList) {
  const groups = new Map();
  for (const p of parsedList) {
    if (!groups.has(p.id)) groups.set(p.id, []);
    groups.get(p.id).push(p);
  }

  const out = [];
  for (const [id, list] of groups) {
    const anyExplicit = list.some((x) => x.explicitEffects);
    const effectKeys = new Set();
    const effects = [];
    for (const p of list) {
      if (anyExplicit && !p.explicitEffects) continue;
      for (const e of p.effects) {
        const k = effectKey(e);
        if (!effectKeys.has(k)) {
          effectKeys.add(k);
          effects.push(e);
        }
      }
    }
    const levelMap = new Map();
    for (const p of list) {
      for (const L of p.levels) {
        const prev = levelMap.get(L.level) ?? 0;
        levelMap.set(L.level, Math.max(prev, L.power));
      }
    }

    const keys = [...levelMap.keys()].sort((a, b) => a - b);
    const maxLevel = keys.length ? Math.max(...keys) : 1;
    const powerByLevel = [];
    for (let lv = 0; lv <= maxLevel; lv++) {
      const v = levelMap.get(lv);
      powerByLevel[lv] = v !== undefined ? v : 0;
    }
    out.push({
      l2SkillId: id,
      maxLevel,
      effects,
      powerByLevel,
    });
  }
  return out.sort((a, b) => a.l2SkillId - b.l2SkillId);
}

function main() {
  if (!fs.existsSync(TEXT_RPG_HF)) {
    console.error('Немає text-rpg:', TEXT_RPG_HF);
    process.exit(1);
  }
  const dirs = ['common', 'Warrior', 'Warlord', 'Dreadnought'].map((d) =>
    path.join(TEXT_RPG_HF, d)
  );
  const parsed = [];
  for (const dir of dirs) {
    for (const f of walkTs(dir)) {
      const p = parseToggleFile(f);
      if (p) parsed.push(p);
    }
  }
  const rows = mergeToggles(parsed);

  let ts = `/* eslint-disable */\n/**\n * Автоген: node server/scripts/gen-text-rpg-hf-toggle-effects.mjs\n * Тогли HumanFighter з text-rpg.\n */\n\n`;
  ts += `export type TextRpgHfToggleEffectMod = {\n`;
  ts += `  readonly stat: string;\n  readonly mode: 'percent' | 'flat' | 'multiplier';\n`;
  ts += `  readonly value?: number;\n};\n\n`;
  ts += `export type TextRpgHfToggleRow = {\n`;
  ts += `  readonly l2SkillId: number;\n`;
  ts += `  readonly maxLevel: number;\n`;
  ts += `  readonly effects: readonly TextRpgHfToggleEffectMod[];\n`;
  ts += `  readonly powerByLevel: readonly number[];\n};\n\n`;

  ts += `export const TEXT_RPG_HF_TOGGLE_EFFECTS: readonly TextRpgHfToggleRow[] = [\n`;
  for (const r of rows) {
    ts += `  {\n`;
    ts += `    l2SkillId: ${r.l2SkillId},\n`;
    ts += `    maxLevel: ${r.maxLevel},\n`;
    ts += `    effects: ${JSON.stringify(r.effects)} as const,\n`;
    ts += `    powerByLevel: ${JSON.stringify(r.powerByLevel)} as const,\n`;
    ts += `  },\n`;
  }
  ts += `] as const;\n`;

  fs.writeFileSync(OUT, ts, 'utf8');
  console.log('OK:', OUT, 'toggle skills:', rows.length);
}

main();
