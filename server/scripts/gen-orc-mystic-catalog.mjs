/**
 * Каталог Orc Mystic з text-rpg → `orcMysticSkillCatalog.generated.ts`.
 * `npm run gen:om-skills`
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  MYSTIC_SKILL_HINT_UK,
  ORC_MYSTIC_HINT_UK,
} from './mysticSkillHintsUk.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEXT_OM = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'text-rpg',
  'src',
  'data',
  'skills',
  'classes',
  'OrcMystic'
);
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'orcMysticSkillCatalog.generated.ts'
);

const ORC_MAGE = new Set(['orc_mage']);
const SHAMAN_UP = new Set([
  'orc_shaman',
  'orc_overlord',
  'orc_warcryer',
  'orc_dominator',
  'orc_doomcryer',
]);
const ALL_ORC_MYSTIC = new Set([...ORC_MAGE, ...SHAMAN_UP]);

const FOLDER_PROFS = {
  common: ALL_ORC_MYSTIC,
  OrcShaman: new Set(['orc_shaman']),
  Overlord: new Set(['orc_overlord', 'orc_dominator']),
  Warcryer: new Set(['orc_warcryer', 'orc_doomcryer']),
  Dominator: new Set(['orc_dominator']),
  Doomcryer: new Set(['orc_doomcryer']),
};

const NAME_UK = {
  72: 'Гімн захисту',
  100: 'Удар духовної сили',
  141: 'Майстерність легкої броні',
  231: 'Майстерність мантії',
  260: 'Звуковий удар',
  331: 'Майстерність умінь',
  1003: 'Гімн атаки',
  1100: 'Початковий залп',
  1104: 'Сповільнення атаки',
  1108: 'Руйнівний залп',
  1229: 'Гімн відновлення',
  1244: 'Залякування',
  1362: 'Стійкість до скасувань',
  1363: 'Пісня тріумфу',
  1364: 'Пісня криту',
  1365: 'Пісня чарів',
  1366: 'Прокляття знемоги',
  1367: 'Прокляття лікування',
  118: 'Рух мага',
  146: 'Антимагія',
  163: 'Майстерність чар',
  164: 'Швидке відновлення',
  172: 'Ремесло',
  194: 'Удача',
  211: 'Підсилення HP',
  212: 'Швидке відновлення HP',
  213: 'Підсилення мани',
  214: 'Відновлення мани',
  228: 'Швидке зачарування',
  229: 'Швидке відновлення MP',
  234: 'Майстерність мантії',
  235: 'Майстерність мантії',
  236: 'Майстерність легкої броні',
  244: 'Майстерність обладунків',
  249: 'Майстерність зброї',
  258: 'Майстерність легкої броні',
  259: 'Майстерність важкої броні',
  285: 'Більший приріст мани',
  328: 'Мудрість',
  329: 'Здоров’я',
  330: 'Майстерність умінь',
  336: 'Таємна мудрість',
  337: 'Таємна сила',
  338: 'Таємна спритність',
  1001: 'Підсилення вітру',
  1002: 'Підсилення полум’я',
  1004: 'Підсилення вогню',
  1005: 'Підсилення вогню',
  1006: 'Підсилення вітру',
  1007: 'Підсилення землі',
  1008: 'Підсилення води',
  1009: 'Підсилення духу',
  1010: 'Чари вогню',
  1011: 'Зцілення',
  1068: 'Сила',
  1090: 'Крок вітру',
  1092: 'Швидке відновлення MP',
  1095: 'Дух вовка',
  1096: 'Дух лева',
  1097: 'Дух медведя',
  1099: 'Дух кобри',
  1101: 'Дух сокола',
  1102: 'Дух кабана',
  1105: 'Дух кабана',
  1107: 'Дух сокола',
  1208: 'Прокляття слабкості',
  1209: 'Прокляття отрути',
  1210: 'Прокляття кровотечі',
  1213: 'Прокляття страху',
  1245: 'Перемога',
  1246: 'Покликання слуги',
  1247: 'Покликання слуги',
  1248: 'Покликання слуги',
  1249: 'Покликання слуги',
  1250: 'Покликання слуги',
  1251: 'Покликання слуги',
  1252: 'Покликання слуги',
  1253: 'Покликання слуги',
  1256: 'Покликання слуги',
  1260: 'Покликання слуги',
  1261: 'Покликання слуги',
  1268: 'Бойовий гімн',
  1283: 'Покликання слуги',
  1284: 'Пісня вітру',
  1306: 'Пісня землі',
  1307: 'Пісня води',
  1308: 'Пісня вогню',
  1309: 'Пісня вітру',
  1310: 'Пісня вогню',
  1311: 'Пісня вітру',
  1335: 'Прокляття слабкості',
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

function folderOf(filePath) {
  const rel = path.relative(TEXT_OM, filePath);
  return rel.split(path.sep)[0] || 'common';
}

function parseLevels(s) {
  const levels = [];
  const re =
    /\{\s*level:\s*(\d+),\s*requiredLevel:\s*(\d+),\s*spCost:\s*(\d+),\s*mpCost:\s*(\d+),\s*power:\s*(\d+)/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    levels.push({
      level: Number(m[1]),
      requiredLevel: Number(m[2]),
      spCost: Number(m[3]),
      mpCost: Number(m[4]),
      power: Number(m[5]),
    });
  }
  return levels;
}

function parseEffects(s) {
  const m = s.match(/effects:\s*\[([\s\S]*?)\]\s*,/);
  if (!m) return [];
  const inner = m[1];
  const out = [];
  const re =
    /\{\s*stat:\s*"([^"]+)"\s*,\s*mode:\s*"([^"]+)"(?:\s*,\s*value:\s*(\d+))?/g;
  let x;
  while ((x = re.exec(inner)) !== null) {
    out.push({
      stat: x[1],
      mode: x[2],
      value: x[3] != null ? Number(x[3]) : undefined,
    });
  }
  return out;
}

function mergeProfSets(folders) {
  const acc = new Set();
  for (const f of folders) {
    const st = FOLDER_PROFS[f] ?? ALL_ORC_MYSTIC;
    for (const p of st) acc.add(p);
  }
  return [...acc].sort();
}

function catalogKind(category, toggle) {
  if (category === 'passive' || category === 'none') return 'passive';
  if (toggle || category === 'toggle') return 'toggle';
  return 'battle';
}

function battleActionSkipsMobHp(category, kind) {
  if (kind === 'toggle') return true;
  if (category === 'buff') return true;
  if (category === 'debuff') return true;
  if (category === 'heal') return true;
  if (category === 'special') return true;
  if (category === 'passive' || category === 'none') return true;
  return false;
}

const byId = new Map();

for (const filePath of walkTs(TEXT_OM)) {
  const s = fs.readFileSync(filePath, 'utf8');
  const idM = s.match(/\bid:\s*(\d+)/);
  if (!idM) continue;
  const id = Number(idM[1]);
  const nameM = s.match(/name:\s*"([^"]+)"/);
  const catM = s.match(/category:\s*"([^"]+)"/);
  const cdM = s.match(/cooldown:\s*(\d+)/);
  const toggleM = /toggle:\s*true/.test(s);
  const name = nameM ? nameM[1].trim() : '';
  let category = catM ? catM[1] : 'none';
  const levels = parseLevels(s);
  const effects = parseEffects(s);
  const folder = folderOf(filePath);
  const cooldown = cdM ? Number(cdM[1]) : undefined;

  let row = byId.get(id);
  if (!row) {
    row = {
      id,
      names: [],
      categories: new Set(),
      folders: new Set(),
      levels: [],
      effects: [],
      cooldownCommon: [],
      cooldownOther: [],
      toggle: false,
    };
    byId.set(id, row);
  }
  if (name) row.names.push(name);
  row.categories.add(category);
  row.folders.add(folder);
  if (levels.length > row.levels.length) row.levels = levels;
  if (effects.length > row.effects.length) row.effects = effects;
  if (cooldown != null) {
    if (folder === 'common') row.cooldownCommon.push(cooldown);
    else row.cooldownOther.push(cooldown);
  }
  row.toggle = row.toggle || toggleM;
}

const entries = [];
for (const row of byId.values()) {
  const namePick =
    [...row.names].sort((a, b) => b.length - a.length)[0] || `Skill ${row.id}`;
  const catPick =
    [...row.categories].find((c) => c !== 'none') ||
    [...row.categories][0] ||
    'none';
  const kind = catalogKind(catPick, row.toggle);
  const minLevel =
    row.levels.length > 0
      ? Math.min(...row.levels.map((l) => l.requiredLevel))
      : 1;
  const spFirst = row.levels.length > 0 ? row.levels[0].spCost : 0;
  const visibleForProfessions = mergeProfSets(row.folders);
  const nameUk = NAME_UK[row.id] ?? `Скіл №${row.id}`;
  const hintUk =
    ORC_MYSTIC_HINT_UK[row.id] ?? MYSTIC_SKILL_HINT_UK[row.id] ?? nameUk;
  const skipMob = battleActionSkipsMobHp(catPick, kind);

  const cdC = row.cooldownCommon ?? [];
  const cdO = row.cooldownOther ?? [];
  const mergedCd =
    cdC.length > 0
      ? Math.min(...cdC)
      : cdO.length > 0
        ? Math.min(...cdO)
        : null;

  entries.push({
    battleId: `l2_${row.id}`,
    l2SkillId: row.id,
    minLevel,
    spCost: spFirst,
    nameUk,
    hintUk,
    kind,
    category: catPick,
    visibleForProfessions,
    levels: row.levels,
    effects: row.effects,
    cooldownSec: mergedCd,
    skipMobHp: skipMob,
  });
}

entries.sort((a, b) => a.l2SkillId - b.l2SkillId);

const activeIds = entries
  .filter((e) => e.kind !== 'passive')
  .map((e) => e.l2SkillId);

const head = `/**
 * Автоген з text-rpg OrcMystic (\`npm run gen:om-skills\`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ORC_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = `;

const body = JSON.stringify(entries, null, 2).replace(/"(\w+)":/g, '$1:');

const tail = `;

export const ORC_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [${activeIds.join(', ')}];
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, head + body + tail, 'utf8');
console.log('Wrote', OUT, 'entries', entries.length);
