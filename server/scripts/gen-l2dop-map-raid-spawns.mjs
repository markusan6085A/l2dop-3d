/**
 * Усі рейд-боси та гранд-боси з l2dop/lineage.sql (таблиця `npc`, type = L2RaidBoss | L2GrandBoss).
 * Не text-rpg — саме дамп l2dop біля репо: ../../../l2dop/lineage.sql
 *
 * Запуск з кореня l2dop-3d: npm run gen:map-raid-spawns
 * Вихід: l2dopMapRaidBossSpawns.generated.ts, l2dopMapEpicBossSpawns.generated.ts, l2dopMapChampionSpawns.generated.ts (заглушка).
 */
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT_RAID = path.join(__dirname, '..', 'src', 'data', 'l2dopMapRaidBossSpawns.generated.ts');
const OUT_EPIC = path.join(__dirname, '..', 'src', 'data', 'l2dopMapEpicBossSpawns.generated.ts');
const OUT_CHAMP = path.join(__dirname, '..', 'src', 'data', 'l2dopMapChampionSpawns.generated.ts');

/** За замовчуванням: Desktop/l2dop/lineage.sql (поруч із l2dop-3d). */
function defaultLineageSqlPath() {
  return path.join(__dirname, '..', '..', '..', 'l2dop', 'lineage.sql');
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampWorld(x, y) {
  return {
    x: Math.max(-131000, Math.min(228000, Math.round(x))),
    y: Math.max(-259000, Math.min(262000, Math.round(y))),
  };
}

/**
 * Лише «класичні» 8 епіків з дропом прикрас (Ring/Earring/Necklace) — інші L2GrandBoss з дампу на карту не потрапляють.
 * Координати: raidboss_spawnlist/spawnlist з дампу, якщо немає — тут (L2 retail / L2J GrandBoss).
 */
const CANONICAL_EPIC_JEWELRY_BOSS_IDS = new Set([
  '29001', // Queen Ant
  '29006', // Core
  '29014', // Orfen
  '29022', // Zaken
  '29045', // Frintezza
  '29020', // Baium
  '29019', // Antharas
  '29028', // Valakas
]);

/** Явні точки для 8 епіків (узгоджено з попередніми пінами / зонами). */
const GRAND_BOSS_WORLD_OVERRIDES = {
  '29001': { x: -22332, y: 192767 },
  '29006': { x: 17192, y: 114178 },
  '29014': { x: 54370, y: 20639 },
  '29019': { x: 173235, y: 218675 },
  '29020': { x: 115803, y: 18448 },
  '29022': { x: 52384, y: 220219 },
  '29028': { x: 212852, y: -114842 },
  '29045': { x: 174228, y: -88018 },
};

/** Fallback: детерміновані координати по npc id, якщо в дампі немає точки. */
function worldXYForNpcId(npcIdStr) {
  const h = hashString(`l2dop-lineage-npc:${npcIdStr}`);
  const t = (h % 1000000) / 1000000;
  const u = ((h >> 10) % 1000000) / 1000000;
  const x = -131000 + t * 359000;
  const y = -259000 + u * 521000;
  return clampWorld(x, y);
}

/**
 * Парсить вміст між дужками VALUES (...) для одного рядка INSERT (без вкладених дужок у значеннях).
 */
function parseSqlValuesInner(inner) {
  const out = [];
  let i = 0;
  while (i < inner.length) {
    const c = inner[i];
    if (c === ' ' || c === '\t') {
      i++;
      continue;
    }
    if (c === "'") {
      let val = '';
      i++;
      while (i < inner.length) {
        if (inner[i] === "'" && inner[i + 1] === "'") {
          val += "'";
          i += 2;
        } else if (inner[i] === "'") {
          i++;
          break;
        } else {
          val += inner[i];
          i++;
        }
      }
      out.push(val);
      if (inner[i] === ',') i++;
      continue;
    }
    if (inner.slice(i, i + 4) === 'NULL') {
      out.push(null);
      i += 4;
      if (inner[i] === ',') i++;
      continue;
    }
    let raw = '';
    while (i < inner.length && inner[i] !== ',') {
      raw += inner[i];
      i++;
    }
    if (raw.trim()) out.push(raw.trim());
    if (inner[i] === ',') i++;
  }
  return out;
}

function parseNpcInsertLine(line) {
  if (!line.startsWith('INSERT INTO `npc`')) return null;
  const v = line.indexOf('VALUES (');
  if (v === -1) return null;
  const rest = line.slice(v + 8);
  const end = rest.lastIndexOf(')');
  if (end === -1) return null;
  const inner = rest.slice(0, end);
  const fields = parseSqlValuesInner(inner);
  /** id, npcid, name, … level idx 9, sex 10, type 11 */
  if (fields.length < 12) return null;
  const type = fields[11];
  if (type !== 'L2RaidBoss' && type !== 'L2GrandBoss') return null;
  const id = String(fields[0] ?? '').trim();
  const name = String(fields[2] ?? '').trim() || 'Raid Boss';
  const levelRaw = String(fields[9] ?? '1').trim();
  const level = Math.max(1, Math.min(99, parseInt(levelRaw, 10) || 1));
  const kind = type === 'L2GrandBoss' ? 'epic' : 'raid';
  return { id, name, level, kind };
}

/** boss_id, loc_x, loc_y — індекси як у `INSERT INTO raidboss_spawnlist`. */
function parseRaidbossSpawnlistLine(line) {
  if (!line.startsWith('INSERT INTO `raidboss_spawnlist`')) return null;
  const v = line.indexOf('VALUES (');
  if (v === -1) return null;
  const rest = line.slice(v + 8);
  const end = rest.lastIndexOf(')');
  if (end === -1) return null;
  const fields = parseSqlValuesInner(rest.slice(0, end));
  if (fields.length < 4) return null;
  const bossId = String(fields[0] ?? '').trim();
  const locX = parseInt(String(fields[2] ?? '0').trim(), 10);
  const locY = parseInt(String(fields[3] ?? '0').trim(), 10);
  if (!bossId || Number.isNaN(locX) || Number.isNaN(locY)) return null;
  return { bossId, locX, locY };
}

/** id рядка, npcid, locx, locy — індекси як у `INSERT INTO spawnlist`. */
function parseSpawnlistLine(line) {
  if (!line.startsWith('INSERT INTO `spawnlist`')) return null;
  const v = line.indexOf('VALUES (');
  if (v === -1) return null;
  const rest = line.slice(v + 8);
  const end = rest.lastIndexOf(')');
  if (end === -1) return null;
  const fields = parseSqlValuesInner(rest.slice(0, end));
  if (fields.length < 4) return null;
  const npcId = String(fields[1] ?? '').trim();
  const locX = parseInt(String(fields[2] ?? '0').trim(), 10);
  const locY = parseInt(String(fields[3] ?? '0').trim(), 10);
  if (!npcId || Number.isNaN(locX) || Number.isNaN(locY)) return null;
  return { npcId, locX, locY };
}

async function loadRaidAndSpawnCoords(sqlPath, bossIdSet) {
  const raidByBoss = new Map();
  const spawnByNpc = new Map();
  const rl = readline.createInterface({
    input: fs.createReadStream(sqlPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });
  for await (const line of rl) {
    const rb = parseRaidbossSpawnlistLine(line);
    if (rb) {
      raidByBoss.set(rb.bossId, { x: rb.locX, y: rb.locY });
      continue;
    }
    const sp = parseSpawnlistLine(line);
    if (sp && bossIdSet.has(sp.npcId) && !spawnByNpc.has(sp.npcId)) {
      spawnByNpc.set(sp.npcId, { x: sp.locX, y: sp.locY });
    }
  }
  return { raidByBoss, spawnByNpc };
}

async function main() {
  const sqlPath = process.env.L2DOP_LINEAGE_SQL || defaultLineageSqlPath();
  if (!fs.existsSync(sqlPath)) {
    console.error('Не знайдено lineage.sql:', sqlPath);
    console.error('Вкажи шлях: set L2DOP_LINEAGE_SQL=C:\\path\\to\\l2dop\\lineage.sql');
    process.exit(1);
  }

  const bosses = [];
  const seen = new Set();
  const rl1 = readline.createInterface({
    input: fs.createReadStream(sqlPath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  for await (const line of rl1) {
    const p = parseNpcInsertLine(line);
    if (!p) continue;
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    bosses.push(p);
  }

  const bossIdSet = new Set(bosses.map((b) => b.id));
  const { raidByBoss, spawnByNpc } = await loadRaidAndSpawnCoords(sqlPath, bossIdSet);

  let nRaid = 0;
  let nSpawn = 0;
  let nHash = 0;
  const rows = [];

  for (const p of bosses) {
    const fromRaid = raidByBoss.get(p.id);
    const fromSpawn = spawnByNpc.get(p.id);
    const ovr = GRAND_BOSS_WORLD_OVERRIDES[p.id];
    let x;
    let y;
    if (ovr) {
      ({ x, y } = clampWorld(ovr.x, ovr.y));
    } else if (fromRaid) {
      ({ x, y } = clampWorld(fromRaid.x, fromRaid.y));
      nRaid++;
    } else if (fromSpawn) {
      ({ x, y } = clampWorld(fromSpawn.x, fromSpawn.y));
      nSpawn++;
    } else {
      ({ x, y } = worldXYForNpcId(p.id));
      nHash++;
    }
    const safeId = `l2dop_rb_${p.id}`;
    rows.push({
      id: safeId,
      worldX: x,
      worldY: y,
      templateId: safeId,
      name: p.name,
      level: p.level,
      kind: p.kind,
      aggressive: true,
    });
  }

  const raidRows = rows.filter((r) => r.kind === 'raid');
  const epicOrder = [
    '29001',
    '29006',
    '29014',
    '29022',
    '29045',
    '29020',
    '29019',
    '29028',
  ];
  const epicRowsRaw = rows.filter((r) => r.kind === 'epic');
  const epicByNpc = new Map(
    epicRowsRaw.map((r) => [String(r.id).replace(/^l2dop_rb_/, ''), r]),
  );
  const epicRows = epicOrder
    .filter((id) => CANONICAL_EPIC_JEWELRY_BOSS_IDS.has(id) && epicByNpc.has(id))
    .map((id) => epicByNpc.get(id));
  raidRows.sort((a, b) => a.id.localeCompare(b.id));

  const headerRaid = `/**
 * Автоген: npm run gen:map-raid-spawns
 * Джерело: l2dop/lineage.sql — npc type L2RaidBoss.
 * Координати: raidboss_spawnlist → spawnlist → хеш (див. gen-l2dop-map-raid-spawns.mjs).
 */

`;

  const headerEpic = `/**
 * Автоген: npm run gen:map-raid-spawns
 * На карті лише 8 епіків з дропом прикрас (Queen Ant, Core, Orfen, Zaken, Frintezza, Baium, Antharas, Valakas).
 * Джерело імені/рівня: lineage.sql (L2GrandBoss); координати: GRAND_BOSS_WORLD_OVERRIDES у скрипті.
 */

`;

  const champStub = `/**
 * Зарезервовано під статичні спавни чемпіонів з lineage / окремої таблиці.
 * Зараз на карті kind \`champion\` дає процедурний roll у mapWorldSpawns (dense/scatter).
 * Після наповнення — імпорт тут, окрема бойова логіка в domain — окремо від РБ/епіків.
 */

export const L2DOP_MAP_CHAMPION_SPAWNS = [] as const;
`;

  fs.writeFileSync(
    OUT_RAID,
    `${headerRaid}export const L2DOP_LINEAGE_RAID_BOSS_SPAWNS = ${JSON.stringify(raidRows, null, 2)} as const;\n`,
    'utf8',
  );
  fs.writeFileSync(
    OUT_EPIC,
    `${headerEpic}export const L2DOP_LINEAGE_EPIC_BOSS_SPAWNS = ${JSON.stringify(epicRows, null, 2)} as const;\n`,
    'utf8',
  );
  fs.writeFileSync(OUT_CHAMP, champStub, 'utf8');

  console.log(
    'OK',
    'raid:',
    raidRows.length,
    'epic:',
    epicRows.length,
    'coords raidboss_spawnlist:',
    nRaid,
    'spawnlist:',
    nSpawn,
    'fallback:',
    nHash,
    '←',
    sqlPath,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
