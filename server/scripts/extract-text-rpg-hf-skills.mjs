/**
 * Одноразове витягування метаданих скілів з text-rpg HumanFighter (common + Warrior + Warlord).
 * Запуск з кореня репо: node server/scripts/extract-text-rpg-hf-skills.mjs
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

function parseSkillFile(filePath) {
  const s = fs.readFileSync(filePath, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  const nameM = s.match(/\bname:\s*"((?:[^"\\]|\\.)*)"/);
  const catM = s.match(/\bcategory:\s*"([^"]*)"/);
  const toggleM = /\btoggle:\s*true/.test(s);
  /** Перший рядок levels[] з requiredLevel + spCost */
  const firstLevelM = s.match(
    /\{\s*level:\s*\d+,\s*requiredLevel:\s*(\d+),\s*spCost:\s*(\d+)/
  );
  if (!idM || !nameM || !firstLevelM) return null;
  const category = catM ? catM[1] : 'unknown';
  let kind = 'battle';
  if (category === 'passive' || toggleM) kind = 'passive';
  return {
    id: Number(idM[1]),
    nameEn: JSON.parse('"' + nameM[1].replace(/\\"/g, '"') + '"'),
    category,
    toggle: toggleM,
    minLevel: Number(firstLevelM[1]),
    spCost: Number(firstLevelM[2]),
  };
}

function walkTs(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walkTs(p));
    else if (/\.ts$/.test(ent.name) && ent.name !== 'index.ts') {
      const d = parseSkillFile(p);
      if (d) {
        d._rel = path.relative(TEXT_RPG_HF, p).replace(/\\/g, '/');
        out.push(d);
      }
    }
  }
  return out;
}

const common = walkTs(path.join(TEXT_RPG_HF, 'common'));
const warrior = walkTs(path.join(TEXT_RPG_HF, 'Warrior'));
const warlord = walkTs(path.join(TEXT_RPG_HF, 'Warlord'));

const commonIds = new Set(common.map((x) => x.id));
const warriorIds = new Set(warrior.map((x) => x.id));
const warlordIds = new Set(warlord.map((x) => x.id));

const byId = new Map();
function addList(list, source) {
  for (const x of list) {
    if (!byId.has(x.id)) {
      byId.set(x.id, { ...x, source });
    }
  }
}
addList(common, 'common');
addList(warrior, 'warrior');
addList(warlord, 'warlord');

const merged = [...byId.values()].sort((a, b) => a.id - b.id);

function professionFor(id) {
  if (commonIds.has(id)) return null;
  const inW = warriorIds.has(id);
  const inL = warlordIds.has(id);
  if (inW && !inL) return 'human_warrior';
  if (inL && !inW) return 'human_warlord';
  /** У обох папках (Warrior + Warlord) — гілка воїна після 1-ї профи */
  if (inW && inL) return 'human_warrior';
  return 'human_warrior';
}

const report = merged.map((x) => ({
  battleId: `l2_${x.id}`,
  l2SkillId: x.id,
  minLevel: x.minLevel,
  spCost: x.spCost,
  nameEn: x.nameEn,
  kind: x.kind,
  professionReq: professionFor(x.id),
  source: x.source,
  file: x._rel,
}));

console.log(JSON.stringify({ TEXT_RPG_HF, count: report.length, skills: report }, null, 2));
