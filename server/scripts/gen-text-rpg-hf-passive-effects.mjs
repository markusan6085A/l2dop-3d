/**
 * Витягує пасиви Human Fighter з text-rpg: effects + power по рангу (як applySkillPassives.ts).
 * Вихід: server/src/data/textRpgPassiveEffects.generated.ts
 *
 * node server/scripts/gen-text-rpg-hf-passive-effects.mjs
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
  'textRpgPassiveEffects.generated.ts'
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

function mergeEffectPairs(curPairs, p) {
  const incoming =
    p.effects.length > 0
      ? p.effects
      : p.stat != null
        ? [{ stat: p.stat, mode: p.mode }]
        : [];
  /** Один і той самий stat — останній файл виграє (різні підкласи). */
  const byStat = new Map(curPairs.map((e) => [e.stat, e]));
  for (const e of incoming) {
    byStat.set(e.stat, e);
  }
  return [...byStat.values()];
}

function parsePassiveFile(filePath) {
  const s = fs.readFileSync(filePath, 'utf8');
  if (!/category:\s*"passive"/.test(s)) return null;
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) return null;
  const id = Number(idM[1]);

  const effRe =
    /(?:"stat"|stat):\s*"(\w+)"\s*,\s*(?:"mode"|mode):\s*"(\w+)"/g;
  const effects = [];
  let em;
  while ((em = effRe.exec(s)) !== null) {
    effects.push({ stat: em[1], mode: em[2] });
  }
  let stat = effects[0]?.stat ?? null;
  let mode = effects[0]?.mode ?? 'percent';
  if (effects.length === 0) {
    const ptM = s.match(/powerType:\s*"(\w+)"/);
    if (ptM && ptM[1] === 'flat') mode = 'flat';
  }

  let requiresArmor = null;
  const raM = s.match(/requiresArmor:\s*"(\w+)"/);
  if (raM) requiresArmor = raM[1];

  let requiresWeapon = null;
  const rwM = s.match(/requiresWeapon:\s*"(\w+)"/);
  if (rwM) requiresWeapon = rwM[1];

  const levels = [];
  const re =
    /\{\s*(?:"level"|level):\s*(\d+),\s*(?:"requiredLevel"|requiredLevel):\s*(\d+),\s*(?:"spCost"|spCost):\s*(\d+),\s*(?:"mpCost"|mpCost):\s*(\d+),\s*(?:"power"|power):\s*([0-9.]+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    levels.push({
      level: Number(m[1]),
      power: Number(m[5]),
    });
  }
  if (levels.length === 0) return null;

  return {
    id,
    effects,
    stat,
    mode,
    requiresArmor,
    requiresWeapon,
    levels,
  };
}

function mergePassives(parsedList) {
  /** id -> Map(level, power) */
  const byLevel = new Map();
  /** id -> meta */
  const meta = new Map();

  for (const p of parsedList) {
    if (!byLevel.has(p.id)) {
      byLevel.set(p.id, new Map());
      meta.set(p.id, {
        effectPairs: mergeEffectPairs([], p),
        requiresArmor: p.requiresArmor,
        requiresWeapon: p.requiresWeapon,
      });
    }
    const lm = byLevel.get(p.id);
    const cur = meta.get(p.id);
    cur.effectPairs = mergeEffectPairs(cur.effectPairs, p);
    if (p.requiresArmor) cur.requiresArmor = p.requiresArmor;
    if (p.requiresWeapon) cur.requiresWeapon = p.requiresWeapon;
    for (const L of p.levels) {
      lm.set(L.level, L.power);
    }
  }

  const out = [];
  for (const [id, lm] of byLevel) {
    const keys = [...lm.keys()].sort((a, b) => a - b);
    const maxRank = keys.length;
    const powerByRank = [0];
    let ri = 1;
    for (const k of keys) {
      powerByRank[ri] = lm.get(k);
      ri++;
    }
    const m = meta.get(id);
    const ep =
      m.effectPairs.length > 0
        ? m.effectPairs
        : [{ stat: 'pDef', mode: 'percent' }];
    out.push({
      battleId: `l2_${id}`,
      l2SkillId: id,
      effectPairs: ep,
      stat: ep[0].stat,
      mode: ep[0].mode,
      requiresArmor: m.requiresArmor,
      requiresWeapon: m.requiresWeapon,
      maxRank,
      powerByRank,
    });
  }
  return out.sort((a, b) => a.l2SkillId - b.l2SkillId);
}

function main() {
  if (!fs.existsSync(TEXT_RPG_HF)) {
    console.error('Немає text-rpg:', TEXT_RPG_HF);
    process.exit(1);
  }
  /** Усі підпапки HumanFighter (Rogue, Gladiator, …), не лише common/Warrior. */
  const parsed = [];
  for (const f of walkTs(TEXT_RPG_HF)) {
    const p = parsePassiveFile(f);
    if (p) parsed.push(p);
  }
  let rows = mergePassives(parsed);

  /** Rogue-файли: канон для спільних id (merge по всіх підкласах змішував stat/power). */
  const ROGUE_CANON = [
    'Rogue/Skill_0137.ts',
    'Rogue/Skill_0168.ts',
    'Rogue/Skill_0169.ts',
    'Rogue/Skill_0208.ts',
    'Rogue/Skill_0209.ts',
    'Rogue/Skill_0225.ts',
  ];
  for (const rel of ROGUE_CANON) {
    const full = path.join(TEXT_RPG_HF, rel);
    if (!fs.existsSync(full)) continue;
    const p = parsePassiveFile(full);
    if (!p) continue;
    const one = mergePassives([p]);
    if (one.length === 0) continue;
    const row = one[0];
    const idx = rows.findIndex((r) => r.l2SkillId === row.l2SkillId);
    if (idx >= 0) rows[idx] = row;
    else rows.push(row);
  }
  rows.sort((a, b) => a.l2SkillId - b.l2SkillId);

  let ts = `/* eslint-disable */\n/**\n * Автоген: node server/scripts/gen-text-rpg-hf-passive-effects.mjs\n * Дані з text-rpg HumanFighter (effects + power по рангу).\n */\n\n`;
  ts += `export type TextRpgHfPassiveEffectPair = {\n`;
  ts += `  readonly stat: string;\n`;
  ts += `  readonly mode: 'percent' | 'flat' | 'multiplier';\n`;
  ts += `};\n\n`;
  ts += `export type TextRpgHfPassiveRow = {\n`;
  ts += `  battleId: string;\n  l2SkillId: number;\n`;
  ts += `  /** Усі ефекти одного рівня (напр. Esprit 171: hpRegen + mpRegen). */\n`;
  ts += `  effectPairs: readonly TextRpgHfPassiveEffectPair[];\n`;
  ts += `  /** Дубль першої пари (зручність / старий код). */\n`;
  ts += `  stat: string;\n  mode: 'percent' | 'flat' | 'multiplier';\n`;
  ts += `  requiresArmor: 'light' | 'heavy' | 'robe' | null;\n`;
  ts += `  requiresWeapon: string | null;\n`;
  ts += `  maxRank: number;\n`;
  ts += `  powerByRank: readonly number[];\n};\n\n`;

  ts += `export const TEXT_RPG_HF_PASSIVE_EFFECTS: readonly TextRpgHfPassiveRow[] = [\n`;
  for (const r of rows) {
    ts += `  {\n`;
    ts += `    battleId: ${JSON.stringify(r.battleId)},\n`;
    ts += `    l2SkillId: ${r.l2SkillId},\n`;
    ts += `    effectPairs: ${JSON.stringify(r.effectPairs)} as const,\n`;
    ts += `    stat: ${JSON.stringify(r.stat)},\n`;
    ts += `    mode: ${JSON.stringify(r.mode)},\n`;
    ts += `    requiresArmor: ${JSON.stringify(r.requiresArmor)},\n`;
    ts += `    requiresWeapon: ${JSON.stringify(r.requiresWeapon)},\n`;
    ts += `    maxRank: ${r.maxRank},\n`;
    ts += `    powerByRank: ${JSON.stringify(r.powerByRank)} as const,\n`;
    ts += `  },\n`;
  }
  ts += `] as const;\n`;

  fs.writeFileSync(OUT, ts, 'utf8');
  console.log('OK:', OUT, 'passives:', rows.length);
}

main();
