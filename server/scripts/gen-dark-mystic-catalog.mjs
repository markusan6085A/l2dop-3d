/**
 * Каталог Dark Mystic з text-rpg → `darkMysticSkillCatalog.generated.ts`.
 * `npm run gen:dm-skills`
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  HUMAN_MYSTIC_HINT_UK,
  MYSTIC_SKILL_HINT_UK,
} from './mysticSkillHintsUk.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEXT_DM = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'text-rpg',
  'src',
  'data',
  'skills',
  'classes',
  'DarkMystic'
);
const OUT = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'darkMysticSkillCatalog.generated.ts'
);

const DARK_MAGE = new Set(['dark_elf_mage']);
const WIZARD_TRACK = new Set([
  'dark_elf_dark_wizard',
  'dark_elf_phantom_summoner',
  'dark_elf_spectral_master',
  'dark_elf_spellhowler',
  'dark_elf_storm_screamer',
]);
const CLERIC_TRACK = new Set([
  'dark_elf_shillien_oracle',
  'dark_elf_shillien_elder',
  'dark_elf_shillien_saint',
]);
const ALL_DARK_MYSTIC = new Set([
  ...DARK_MAGE,
  ...WIZARD_TRACK,
  ...CLERIC_TRACK,
]);

const SKIP_IDS = new Set([1320]);

const HINT_UK = {
  1206: 'Сповільнює ціль: важче пересуватися, удари слабші.',
};

/** Імена підпапок text-rpg → l2Profession (як у `DarkMystic/`). */
const FOLDER_PROFS = {
  common: ALL_DARK_MYSTIC,
  'Dark Wizard': WIZARD_TRACK,
  PhantomSummoner: new Set([
    'dark_elf_phantom_summoner',
    'dark_elf_spectral_master',
  ]),
  SpectralMaster: new Set(['dark_elf_spectral_master']),
  Spellhowler: new Set(['dark_elf_spellhowler', 'dark_elf_storm_screamer']),
  StormScreamer: new Set(['dark_elf_storm_screamer']),
  ShillienOracle: CLERIC_TRACK,
  ShillienElder: new Set([
    'dark_elf_shillien_elder',
    'dark_elf_shillien_saint',
  ]),
  ShillienSaint: new Set(['dark_elf_shillien_saint']),
};

const NAME_UK = {
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
  1011: 'Зцілення',
  1012: 'Лікування отрути',
  1015: 'Бойове зцілення',
  1016: 'Воскресіння',
  1018: 'Очищення',
  1020: 'Життєва сила',
  1027: 'Групове зцілення',
  1028: 'Міць небес',
  1031: 'Розсіювання мерців',
  1032: 'Бадьорість',
  1033: 'Стійкість до отрути',
  1034: 'Спокій',
  1035: 'Ментальний щит',
  1036: 'Магічний бар’єр',
  1040: 'Щит',
  1042: 'Утримання мерців',
  1043: 'Свята зброя',
  1044: 'Регенерація',
  1045: 'Благословення тіла',
  1048: 'Благословення душі',
  1049: 'Реквієм',
  1056: 'Скасування',
  1062: 'Дух берсерка',
  1064: 'Мовчання',
  1068: 'Сила',
  1069: 'Сон',
  1072: 'Хмара сну',
  1073: 'Поцілунок Еви',
  1074: 'Здача вітру',
  1075: 'Мир',
  1077: 'Фокус',
  1078: 'Концентрація',
  1083: 'Здача вогню',
  1085: 'Кмітливість',
  1086: 'Поспіх',
  1126: 'Перезарядка слуги',
  1127: 'Зцілення слуги',
  1129: 'Покликання віджилого',
  1144: 'Крок вітру слуги',
  1147: 'Вампірний дотик',
  1148: 'Шип смерті',
  1151: 'Витяг життя з трупа',
  1154: 'Покликання скверного',
  1155: 'Вибух трупа',
  1156: 'Забуття',
  1157: 'Тіло в розум',
  1159: 'Прокляття зв’язку смерті',
  1160: 'Сповільнення',
  1163: 'Прокляття розладу',
  1164: 'Прокляття: слабкість',
  1167: 'Отруйна хмара',
  1168: 'Прокляття: отрута',
  1169: 'Прокляття страху',
  1170: 'Якір',
  1171: 'Палюче коло',
  1172: 'Аура полум’я',
  1177: 'Удар вітру',
  1181: 'Удар полум’я',
  1182: 'Стійкість до води',
  1184: 'Крижана блискавка',
  1189: 'Стійкість до вітру',
  1191: 'Стійкість до вогню',
  1201: 'Коріння дріади',
  1204: 'Крок вітру',
  1206: 'Повільність',
  1216: 'Самозцілення',
  1217: 'Велике зцілення',
  1218: 'Велике бойове зцілення',
  1219: 'Велике групове зцілення',
  1220: 'Полум’я',
  1222: 'Прокляття хаосу',
  1225: 'Покликання кота М’яу',
  1230: 'Промінь',
  1231: 'Спалах аури',
  1232: 'Палюча шкіра',
  1233: 'Занепад',
  1234: 'Вампірні кігті',
  1240: 'Настанова',
  1242: 'Шепіт смерті',
  1243: 'Благословення щита',
  1254: 'Масове воскресіння',
  1258: 'Відновлення життя',
  1262: 'Покликання слуги',
  1263: 'Прокляття згуби',
  1269: 'Прокляття хвороби',
  1271: 'Бенедикція',
  1272: 'Слово страху',
  1274: 'Енергетична блискавка',
  1275: 'Блискавка аури',
  1285: 'Насіння вогню',
  1288: 'Симфонія аури',
  1289: 'Пекло',
  1292: 'Стихійний натиск',
  1296: 'Дощ вогню',
  1298: 'Масове сповільнення',
  1299: 'Остання оборона слуги',
  1307: 'Молитва',
  1311: 'Тіло аватара',
  1331: 'Покликання котячої королеви',
  1334: 'Покликання проклятого',
  1335: 'Масове воскресіння',
  1336: 'Прокляття загибелі',
  1337: 'Прокляття безодні',
  1338: 'Таємний хаос',
  1339: 'Вогняний вихор',
  1343: 'Темний вихор',
  1344: 'Масове прокляття воїнів',
  1345: 'Масове прокляття магів',
  1346: 'Підсилення воїна',
  1349: 'Останній слуга',
  1350: 'Прокляття воїна',
  1351: 'Прокляття мага',
  1352: 'Стихійний захист',
  1353: 'Божественний захист',
  1356: 'Пророцтво вогню',
  1358: 'Блок щита',
  1359: 'Блок кроку вітру',
  1360: 'Масовий блок щита',
  1361: 'Масовий блок швидкості',
  1388: 'Велика сила',
  1389: 'Великий щит',
  1410: 'Спасіння',
  1453: 'Морозний вітер',
  1532: 'Просвітлення',
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
  const rel = path.relative(TEXT_DM, filePath);
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
    const st = FOLDER_PROFS[f] ?? ALL_DARK_MYSTIC;
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

for (const filePath of walkTs(TEXT_DM)) {
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
  if (SKIP_IDS.has(row.id)) continue;
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
    HINT_UK[row.id] ??
    HUMAN_MYSTIC_HINT_UK[row.id] ??
    MYSTIC_SKILL_HINT_UK[row.id] ??
    nameUk;
  const skipMob = battleActionSkipsMobHp(catPick, kind);

  let effectsOut = row.effects;
  if (row.id === 1206) {
    effectsOut = [{ stat: 'runSpeed', mode: 'percent' }];
  }

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
    effects: effectsOut,
    cooldownSec: mergedCd,
    skipMobHp: skipMob,
  });
}

entries.sort((a, b) => a.l2SkillId - b.l2SkillId);

const activeIds = entries
  .filter((e) => e.kind !== 'passive')
  .map((e) => e.l2SkillId);

const head = `/**
 * Автоген з text-rpg DarkMystic (\`npm run gen:dm-skills\`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const DARK_MYSTIC_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = `;

const body = JSON.stringify(entries, null, 2).replace(/"(\w+)":/g, '$1:');

const tail = `;

export const DARK_MYSTIC_ACTIVE_L2_IDS: readonly number[] = [${activeIds.join(', ')}];
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, head + body + tail, 'utf8');
console.log('Wrote', OUT, 'entries', entries.length);
