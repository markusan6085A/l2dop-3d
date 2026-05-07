/**
 * Синхронізує `cooldownSec` у всіх generated skill-catalog файлах з l2db:
 * https://l2db.ru/skillEnchant/skillInfo/<skillId>/1
 *
 * Алгоритм:
 * 1) Зчитує всі `l2SkillId` з generated каталогів.
 * 2) Тягне "Время перезарядки" з l2db (Interlude skill info).
 * 3) Пише карту в `server/src/data/l2dbSkillCooldowns.generated.ts`.
 * 4) Оновлює `cooldownSec` у кожному каталозі лише для skillId, які знайдено в l2db.
 *
 * Запуск:
 *   node server/scripts/sync-l2db-skill-cooldowns.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverDir = path.join(__dirname, '..');
const dataDir = path.join(serverDir, 'src', 'data');

const CATALOG_FILES = [
  'humanMysticSkillCatalog.generated.ts',
  'elvenMysticSkillCatalog.generated.ts',
  'darkMysticSkillCatalog.generated.ts',
  'orcMysticSkillCatalog.generated.ts',
  'elvenFighterSkillCatalog.generated.ts',
  'darkFighterSkillCatalog.generated.ts',
  'orcFighterSkillCatalog.generated.ts',
  'dwarfFighterSkillCatalog.generated.ts',
].map((f) => path.join(dataDir, f));

const OUT_COOLDOWN_MAP_FILE = path.join(
  dataDir,
  'l2dbSkillCooldowns.generated.ts'
);

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Ручні override-и для skillId, яких немає у `l2db skillInfo`.
 * Джерело: Linedia (коли skillInfo у l2db відсутній або повертає invalid).
 * 420  Zealot (420): Время повтора 300 с.
 * 1273 Eva's Serenade (1273): Время повтора 900 с.
 * 1388 Greater Might (1388): Время повтора 2 с.
 * 1389 Greater Shield (1389): Skill_List_G -> {{Skilld|Greater_Shield_(1389)|2}}
 * 1410 Salvation (1410): Время повтора 3600 с.
 * 1453: за вимогою геймдизайну проєкту — 2 сек.
 * 1532 Enlightenment (1532): Время повтора 600 с.
 * 5164: у L2DB/Linedia не знайдено валідної сторінки скіла, лишаємо поточний canonical 6 сек.
 */
const MANUAL_COOLDOWN_OVERRIDES = new Map([
  [420, 300],
  [1273, 900],
  [1388, 2],
  [1389, 2],
  [1410, 3600],
  [1453, 2],
  [1532, 600],
  [5164, 6],
]);

function collectSkillIdsFromCatalog(sourceText) {
  const ids = new Set();
  const re = /l2SkillId:\s*(\d+)/g;
  let m;
  while ((m = re.exec(sourceText)) !== null) {
    const id = Number(m[1]);
    if (Number.isFinite(id) && id > 0) ids.add(id);
  }
  return ids;
}

function parseCooldownSecFromL2dbPage(html) {
  if (/Не верный номер скила/i.test(html)) return null;
  const m = html.match(/Время перезарядки:\s*([0-9]+(?:[.,][0-9]+)?)/i);
  if (!m) return null;
  const n = Number(String(m[1]).replace(',', '.'));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function formatCooldownValue(v) {
  if (!Number.isFinite(v)) return 'null';
  const rounded = Math.round(v * 1000) / 1000;
  if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
    return String(Math.round(rounded));
  }
  return String(rounded);
}

async function fetchL2dbCooldownSec(skillId) {
  const url = `https://l2db.ru/skillEnchant/skillInfo/${skillId}/1`;
  const res = await fetch(url, {
    headers: {
      'user-agent': USER_AGENT,
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  return parseCooldownSecFromL2dbPage(html);
}

async function fetchAllCooldowns(skillIds) {
  const sortedIds = [...skillIds].sort((a, b) => a - b);
  const result = new Map();
  const concurrency = 8;
  let cursor = 0;

  async function worker() {
    while (true) {
      const idx = cursor++;
      if (idx >= sortedIds.length) return;
      const id = sortedIds[idx];
      try {
        const cd = await fetchL2dbCooldownSec(id);
        if (cd !== null) result.set(id, cd);
      } catch (err) {
        console.warn('l2db fetch failed for skill', id, String(err));
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return result;
}

function writeCooldownMapFile(cooldownsById) {
  const rows = [...cooldownsById.entries()].sort((a, b) => a[0] - b[0]);
  const lines = rows
    .map(([id, cd]) => `  ${id}: ${formatCooldownValue(cd)},`)
    .join('\n');
  const content = `/**
 * Автоген з l2db skill info:
 * https://l2db.ru/skillEnchant/skillInfo/<id>/1
 * Не правити вручну.
 */
export const L2DB_INTERLUDE_SKILL_COOLDOWN_SEC: Readonly<
  Partial<Record<number, number>>
> = {
${lines}
};
`;
  fs.writeFileSync(OUT_COOLDOWN_MAP_FILE, content, 'utf8');
}

function patchCatalogCooldowns(sourceText, cooldownsById) {
  let changedEntries = 0;
  const next = sourceText.replace(
    /(l2SkillId:\s*(\d+),[\s\S]*?cooldownSec:\s*)(null|[0-9]+(?:\.[0-9]+)?)(,)/g,
    (full, prefix, idRaw, oldCd, suffix) => {
      const id = Number(idRaw);
      if (!cooldownsById.has(id)) return full;
      const newCd = formatCooldownValue(cooldownsById.get(id));
      if (newCd === oldCd) return full;
      changedEntries += 1;
      return `${prefix}${newCd}${suffix}`;
    }
  );
  return { text: next, changedEntries };
}

async function main() {
  const existingFiles = CATALOG_FILES.filter((p) => fs.existsSync(p));
  if (existingFiles.length === 0) {
    throw new Error('No generated catalog files found.');
  }

  const allSkillIds = new Set();
  for (const filePath of existingFiles) {
    const text = fs.readFileSync(filePath, 'utf8');
    const ids = collectSkillIdsFromCatalog(text);
    for (const id of ids) allSkillIds.add(id);
  }

  console.log('Collected skill ids:', allSkillIds.size);
  const cooldownsById = await fetchAllCooldowns(allSkillIds);
  for (const [id, cd] of MANUAL_COOLDOWN_OVERRIDES) {
    cooldownsById.set(id, cd);
  }
  console.log('Fetched cooldowns from l2db:', cooldownsById.size);

  writeCooldownMapFile(cooldownsById);
  console.log('Wrote map:', OUT_COOLDOWN_MAP_FILE);

  let totalChanged = 0;
  for (const filePath of existingFiles) {
    const oldText = fs.readFileSync(filePath, 'utf8');
    const patched = patchCatalogCooldowns(oldText, cooldownsById);
    if (patched.changedEntries > 0) {
      fs.writeFileSync(filePath, patched.text, 'utf8');
      totalChanged += patched.changedEntries;
      console.log(
        'Updated',
        path.basename(filePath),
        'entries:',
        patched.changedEntries
      );
    } else {
      console.log('No cooldown updates in', path.basename(filePath));
    }
  }

  console.log('Total updated entries:', totalChanged);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
