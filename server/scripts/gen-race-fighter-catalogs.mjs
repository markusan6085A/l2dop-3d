/**
 * Каталоги воїнів (elf / dark elf / orc / dwarf) з text-rpg → `*FighterSkillCatalog.generated.ts`.
 * Гном: лише `skills/classes/DwarvenFighter` (як у text-rpg `getSkillModulesForProfession`), без HumanFighter Warlord/Dreadnought.
 * Запуск з кореня репо: `npm run gen:race-fighter-skills`
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  EXCLUDE_COMMON_CRAFT_FROM_ELVEN_AND_DARK_FIGHTER,
  EXCLUDE_DWARF_ONLY_CRAFT_BOOK_SKILLS,
} from './magisterExcludedSkillIds.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEXT_RPG_ROOT = path.resolve(
  __dirname,
  '..',
  '..',
  '..',
  'text-rpg',
  'src',
  'data',
  'skills',
  'classes'
);
const OUT_DIR = path.join(__dirname, '..', 'src', 'data');
const HF_ENTRIES = path.join(OUT_DIR, 'humanFighterSkillCatalog.entries.ts');
const COMMON_PASSIVE_DISPLAY = path.join(
  OUT_DIR,
  'fighterCommonPassiveSkillDisplay.ts'
);

const BASE_FIGHTER_MIN_LEVEL = 20;

const set = (...xs) => new Set(xs);

const ELF_ALL = set(
  'elf_fighter',
  'elf_elven_knight',
  'elf_elven_scout',
  'elf_temple_knight',
  'elf_swordsinger',
  'elf_plainswalker',
  'elf_silver_ranger',
  'elf_evas_templar',
  'elf_sword_muse',
  'elf_wind_rider',
  'elf_moonlight_sentinel'
);
const ELF_KNIGHT = set('elf_elven_knight', 'elf_temple_knight', 'elf_evas_templar');
const ELF_SCOUT_TREE = set(
  'elf_elven_scout',
  'elf_plainswalker',
  'elf_wind_rider',
  'elf_silver_ranger',
  'elf_moonlight_sentinel'
);

const ELF_FOLDER_PROFS = {
  common: ELF_ALL,
  ElvenKnight: ELF_KNIGHT,
  TempleKnight: set('elf_temple_knight', 'elf_evas_templar'),
  EvasTemplar: set('elf_evas_templar'),
  Swordsinger: set('elf_swordsinger', 'elf_sword_muse'),
  SwordMuse: set('elf_sword_muse'),
  ElvenScout: ELF_SCOUT_TREE,
  Plainswalker: set('elf_plainswalker', 'elf_wind_rider'),
  WindRider: set('elf_wind_rider'),
  SilverRanger: set('elf_silver_ranger', 'elf_moonlight_sentinel'),
  MoonlightSentinel: set('elf_moonlight_sentinel'),
};

const DARK_ALL = set(
  'dark_elf_fighter',
  'dark_elf_palus_knight',
  'dark_elf_assassin',
  'dark_elf_shillien_knight',
  'dark_elf_bladedancer',
  'dark_elf_abyss_walker',
  'dark_elf_phantom_ranger',
  'dark_elf_shillien_templar',
  'dark_elf_spectral_dancer',
  'dark_elf_ghost_hunter',
  'dark_elf_ghost_sentinel'
);

const DARK_FOLDER_PROFS = {
  common: DARK_ALL,
  PalusKnight: set(
    'dark_elf_palus_knight',
    'dark_elf_shillien_knight',
    'dark_elf_shillien_templar'
  ),
  ShillienKnight: set('dark_elf_shillien_knight', 'dark_elf_shillien_templar'),
  ShillienTemplar: set('dark_elf_shillien_templar'),
  Assasin: set(
    'dark_elf_assassin',
    'dark_elf_abyss_walker',
    'dark_elf_ghost_hunter',
    'dark_elf_phantom_ranger',
    'dark_elf_ghost_sentinel'
  ),
  PhantomRanger: set('dark_elf_phantom_ranger', 'dark_elf_ghost_sentinel'),
  GhostSentinel: set('dark_elf_ghost_sentinel'),
  Bladedancer: set('dark_elf_bladedancer', 'dark_elf_spectral_dancer'),
  SpectralDancer: set('dark_elf_spectral_dancer'),
};

const ORC_ALL = set(
  'orc_fighter',
  'orc_raider',
  'orc_monk',
  'orc_destroyer',
  'orc_tyrant',
  'orc_titan',
  'orc_grand_khavatari'
);

const ORC_FOLDER_PROFS = {
  common: ORC_ALL,
  OrcRaider: set('orc_raider', 'orc_destroyer', 'orc_titan'),
  Destroyer: set('orc_destroyer', 'orc_titan'),
  Titan: set('orc_titan'),
  OrcMonk: set('orc_monk', 'orc_tyrant', 'orc_grand_khavatari'),
  Tyrant: set('orc_tyrant', 'orc_grand_khavatari'),
  GrandKhavatari: set('orc_grand_khavatari'),
};

const DWARF_ALL = set(
  'dwarf_fighter',
  'dwarf_scavenger',
  'dwarf_artisan',
  'dwarf_bounty_hunter',
  'dwarf_warsmith',
  'dwarf_fortune_seeker',
  'dwarf_maestro'
);

/** Верхні папки в text-rpg `classes/DwarvenFighter/` → l2dop `dwarf_*` (ланцюжок як у professionChain). */
const DWARF_FOLDER_PROFS = {
  common: DWARF_ALL,
  Scavenger: set('dwarf_scavenger', 'dwarf_bounty_hunter', 'dwarf_fortune_seeker'),
  BountyHunter: set('dwarf_bounty_hunter', 'dwarf_fortune_seeker'),
  FortuneSeeker: set('dwarf_fortune_seeker'),
  Artisan: set('dwarf_artisan', 'dwarf_warsmith', 'dwarf_maestro'),
  Warsmith: set('dwarf_warsmith', 'dwarf_maestro'),
  Maestro: set('dwarf_maestro'),
};

function walkTs(root) {
  const out = [];
  if (!fs.existsSync(root)) return out;
  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    const p = path.join(root, ent.name);
    if (ent.isDirectory()) {
      out.push(...walkTs(p));
    } else if (/\.ts$/.test(ent.name) && ent.name !== 'index.ts') {
      out.push(p);
    }
  }
  return out;
}

function folderOf(filePath, textRoot) {
  const rel = path.relative(textRoot, filePath);
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

function mergeProfSets(folders, folderProfs, allProfs) {
  const acc = new Set();
  for (const f of folders) {
    const st = folderProfs[f] ?? allProfs;
    for (const p of st) acc.add(p);
  }
  return [...acc].sort();
}

function loadCommonPassiveUkHints() {
  const byId = new Map();
  if (!fs.existsSync(COMMON_PASSIVE_DISPLAY)) return byId;
  const s = fs.readFileSync(COMMON_PASSIVE_DISPLAY, 'utf8');
  const re =
    /(\d+):\s*\{\s*nameUk:\s*'([^']*)',\s*hintUk:\s*(?:'([^']*)'|\n\s*'([^']*)')/g;
  let m;
  while ((m = re.exec(s)) !== null) {
    byId.set(Number(m[1]), {
      nameUk: m[2],
      hintUk: m[3] || m[4] || m[2],
    });
  }
  return byId;
}

function loadHumanFighterUkHints() {
  const byId = loadCommonPassiveUkHints();
  if (!fs.existsSync(HF_ENTRIES)) return byId;
  const s = fs.readFileSync(HF_ENTRIES, 'utf8');
  const parts = s.split(/\n  \},\n/);
  for (const b of parts) {
    const idM = b.match(/l2SkillId:\s*(\d+)/);
    if (!idM) continue;
    const id = Number(idM[1]);
    const nameM = b.match(/nameUk:\s*'([^']*)'/);
    let hint = '';
    const hint1 = b.match(/hintUk:\s*'([^']*)'/);
    const hint2 = b.match(/hintUk:\s*\n\s*'([^']*)'/);
    if (hint1 && !b.includes('hintUk:\n')) hint = hint1[1];
    else if (hint2) hint = hint2[1];
    else if (hint1) hint = hint1[1];
    if (nameM && !byId.has(id)) {
      byId.set(id, { nameUk: nameM[1], hintUk: hint || nameM[1] });
    }
  }
  return byId;
}

function buildCatalog({ textSubdir, folderProfs, allProfsSet, excludeSkillIds }, uk) {
  const skipIds = excludeSkillIds ?? new Set();
  const textRoot = path.join(TEXT_RPG_ROOT, textSubdir);
  const files = walkTs(textRoot);

  const byId = new Map();
  for (const filePath of files) {
    const s = fs.readFileSync(filePath, 'utf8');
    const idM = s.match(/\bid:\s*(\d+)/);
    if (!idM) continue;
    const id = Number(idM[1]);
    if (skipIds.has(id)) continue;
    const nameM = s.match(/name:\s*"([^"]+)"/);
    const catM = s.match(/category:\s*"([^"]+)"/);
    const cdM = s.match(/cooldown:\s*(\d+)/);
    const toggleM = /toggle:\s*true/.test(s);
    const nameEn = nameM ? nameM[1].trim() : '';
    let category = catM ? catM[1] : 'none';
    const levels = parseLevels(s);
    const effects = parseEffects(s);
    const folder = folderOf(filePath, textRoot);
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
    if (nameEn) row.names.push(nameEn);
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
    const visibleForProfessions = mergeProfSets(
      row.folders,
      folderProfs,
      allProfsSet
    );
    const ukRow = uk.get(row.id);
    const isKnightFlatHa =
      row.id === 231 &&
      row.effects.some((fx) => fx.stat === 'pDef' && fx.mode === 'flat');
    const hintUkSource = isKnightFlatHa ? uk.get(232) ?? ukRow : ukRow;
    const nameUk = hintUkSource?.nameUk ?? ukRow?.nameUk ?? namePick;
    const hintUk = hintUkSource?.hintUk ?? ukRow?.hintUk ?? nameUk;
    const skipMob = battleActionSkipsMobHp(catPick, kind);
    const primaryFolders = [...row.folders];
    const onlyCommon =
      primaryFolders.length === 1 && primaryFolders[0] === 'common';
    const hideAtBaseFighterUntilFirstProf =
      onlyCommon && minLevel > BASE_FIGHTER_MIN_LEVEL;

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
      hideAtBaseFighterUntilFirstProf,
    });
  }

  entries.sort((a, b) => a.l2SkillId - b.l2SkillId);
  return entries;
}

function emitTs(constPrefix, entries) {
  const activeIds = entries
    .filter((e) => e.kind !== 'passive')
    .map((e) => e.l2SkillId);
  const head = `/**
 * Автоген з text-rpg (\`npm run gen:race-fighter-skills\`). Не правити вручну.
 */
import type { HumanMysticSkillCatalogEntry } from './humanMysticSkillCatalog.types.js';

export const ${constPrefix}_SKILL_CATALOG_GENERATED: readonly HumanMysticSkillCatalogEntry[] = `;
  const body = JSON.stringify(entries, null, 2).replace(/"(\w+)":/g, '$1:');
  const tail = `;

/** Активні / toggle l2 id (пасивки виключено). */
export const ${constPrefix}_ACTIVE_L2_IDS: readonly number[] = [${activeIds.join(', ')}];
`;
  return head + body + tail;
}

const JOBS = [
  {
    constPrefix: 'ELVEN_FIGHTER',
    textSubdir: 'ElvenFighter',
    outFile: 'elvenFighterSkillCatalog.generated.ts',
    folderProfs: ELF_FOLDER_PROFS,
    allProfsSet: ELF_ALL,
    excludeSkillIds: EXCLUDE_COMMON_CRAFT_FROM_ELVEN_AND_DARK_FIGHTER,
  },
  {
    constPrefix: 'DARK_FIGHTER',
    textSubdir: 'DarkFighter',
    outFile: 'darkFighterSkillCatalog.generated.ts',
    folderProfs: DARK_FOLDER_PROFS,
    allProfsSet: DARK_ALL,
    excludeSkillIds: EXCLUDE_COMMON_CRAFT_FROM_ELVEN_AND_DARK_FIGHTER,
  },
  {
    constPrefix: 'ORC_FIGHTER',
    textSubdir: 'OrcFighter',
    outFile: 'orcFighterSkillCatalog.generated.ts',
    folderProfs: ORC_FOLDER_PROFS,
    allProfsSet: ORC_ALL,
    excludeSkillIds: new Set(),
  },
  {
    constPrefix: 'DWARF_FIGHTER',
    textSubdir: 'DwarvenFighter',
    outFile: 'dwarfFighterSkillCatalog.generated.ts',
    folderProfs: DWARF_FOLDER_PROFS,
    allProfsSet: DWARF_ALL,
    excludeSkillIds: EXCLUDE_DWARF_ONLY_CRAFT_BOOK_SKILLS,
  },
];

const ukHints = loadHumanFighterUkHints();

for (const job of JOBS) {
  const entries = buildCatalog(job, ukHints);
  const ts = emitTs(job.constPrefix, entries);
  const outPath = path.join(OUT_DIR, job.outFile);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, ts, 'utf8');
  console.log('Wrote', outPath, 'entries', entries.length);
}
