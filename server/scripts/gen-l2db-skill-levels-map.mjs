#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROF_TO_SLUG = {
  human_fighter: 'fighter',
  human_warrior: 'warrior',
  human_knight: 'knight',
  human_rogue: 'rogue',
  human_warlord: 'warlord',
  human_gladiator: 'gladiator',
  human_paladin: 'paladin',
  human_dark_avenger: 'dark_avenger',
  human_treasure_hunter: 'treasure_hunter',
  human_hawkeye: 'hawkeye',
  human_dreadnought: 'dreadnought',
  human_duelist: 'duelist',
  human_phoenix_knight: 'phoenix_knight',
  human_hell_knight: 'hell_knight',
  human_adventurer: 'adventurer',
  human_sagittarius: 'sagittarius',
  human_mage: 'mage',
  human_wizard: 'wizard',
  human_cleric: 'cleric',
  human_sorcerer: 'sorcerer',
  human_necromancer: 'necromancer',
  human_warlock: 'warlock',
  human_bishop: 'bishop',
  human_prophet: 'prophet',
  human_archmage: 'archmage',
  human_soultaker: 'soultaker',
  human_arcana_lord: 'arcana_lord',
  human_cardinal: 'cardinal',
  human_hierophant: 'hierophant',
  elf_fighter: 'elven_fighter',
  elf_elven_knight: 'elven_knight',
  elf_elven_scout: 'elven_scout',
  elf_temple_knight: 'temple_knight',
  elf_swordsinger: 'swordsinger',
  elf_plainswalker: 'plains_walker',
  elf_silver_ranger: 'silver_ranger',
  elf_evas_templar: 'evas_templar',
  elf_sword_muse: 'sword_muse',
  elf_wind_rider: 'wind_rider',
  elf_moonlight_sentinel: 'moonlight_sentinel',
  elf_mage: 'elven_mage',
  elf_elven_wizard: 'elven_wizard',
  elf_elven_oracle: 'elven_oracle',
  elf_elemental_summoner: 'elemental_summoner',
  elf_spellsinger: 'spellsinger',
  elf_elven_elder: 'elven_elder',
  elf_elemental_master: 'elemental_master',
  elf_mystic_muse: 'mystic_muse',
  elf_evas_saint: 'evas_saint',
  dark_elf_fighter: 'dark_fighter',
  dark_elf_palus_knight: 'palus_knight',
  dark_elf_assassin: 'assassin',
  dark_elf_shillien_knight: 'shillien_knight',
  dark_elf_bladedancer: 'bladedancer',
  dark_elf_abyss_walker: 'abyss_walker',
  dark_elf_phantom_ranger: 'phantom_ranger',
  dark_elf_shillien_templar: 'shilliens_templar',
  dark_elf_spectral_dancer: 'spectral_dancer',
  dark_elf_ghost_hunter: 'ghost_hunter',
  dark_elf_ghost_sentinel: 'ghost_sentinel',
  dark_elf_mage: 'dark_mage',
  dark_elf_dark_wizard: 'dark_wizard',
  dark_elf_shillien_oracle: 'shillien_oracle',
  dark_elf_phantom_summoner: 'phantom_summoner',
  dark_elf_spellhowler: 'spellhowler',
  dark_elf_shillien_elder: 'shillien_elder',
  dark_elf_spectral_master: 'spectral_master',
  dark_elf_storm_screamer: 'storm_screamer',
  dark_elf_shillien_saint: 'shilliens_saint',
  orc_fighter: 'orc_fighter',
  orc_raider: 'orc_raider',
  orc_monk: 'orc_monk',
  orc_destroyer: 'destroyer',
  orc_tyrant: 'tyrant',
  orc_titan: 'titan',
  orc_grand_khavatari: 'grand_khavatari',
  orc_mage: 'orc_mage',
  orc_shaman: 'shaman',
  orc_overlord: 'overlord',
  orc_warcryer: 'warcryer',
  orc_dominator: 'dominator',
  orc_doomcryer: 'doomcryer',
  dwarf_fighter: 'dwarven_fighter',
  dwarf_scavenger: 'scavenger',
  dwarf_artisan: 'artisan',
  dwarf_bounty_hunter: 'bounty_hunter',
  dwarf_warsmith: 'warsmith',
  dwarf_fortune_seeker: 'fortune_seeker',
  dwarf_maestro: 'maestro',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

function decodeHtml(s) {
  return String(s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function parseIntSafe(v) {
  const n = Number.parseInt(String(v || '').trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

function parsePowerFromDesc(desc) {
  const m = String(desc || '').match(/Мощн(?:ость)?\.?\s*:?\s*(\d+)/i);
  return m ? parseIntSafe(m[1]) : 0;
}

function parseClassRows(html) {
  const out = [];
  const sectionRe =
    /<b>\s*Уровень:\s*(\d+)\s*<\/b>([\s\S]*?)(?=<b>\s*Уровень:|<div\s+class="line"|<\/body>)/gi;
  let sec;
  while ((sec = sectionRe.exec(html)) !== null) {
    const reqLevel = parseIntSafe(sec[1]);
    const body = sec[2];
    const rowRe =
      /<tr[^>]*>\s*<td><img[^>]*skill_icons\/0*(\d+)\.jpg[^>]*><\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>(?:да|нет)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<td>(\d+)<\/td>\s*<\/tr>/gi;
    let row;
    while ((row = rowRe.exec(body)) !== null) {
      const skillId = parseIntSafe(row[1]);
      const skillCell = decodeHtml(row[2]).replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
      const [headRaw, ...rest] = skillCell.split('\n');
      const head = String(headRaw || '').trim();
      const desc = rest.join(' ').replace(/\s+/g, ' ').trim();
      const rankM = head.match(/(\d+)\s*$/);
      const rank = rankM ? parseIntSafe(rankM[1]) : 1;
      const mpCost = parseIntSafe(row[3]);
      const spCost = parseIntSafe(row[5]);
      const power = parsePowerFromDesc(desc);
      if (skillId > 0 && rank > 0) {
        out.push({
          skillId,
          rank,
          requiredLevel: reqLevel > 0 ? reqLevel : 1,
          spCost,
          mpCost,
          power,
        });
      }
    }
  }
  return out;
}

async function fetchRowsForSlug(slug) {
  const url = `https://l2db.ru/skills/${slug}/_/rg/`;
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
  });
  if (!res.ok) throw new Error(`fetch_failed ${slug} ${res.status}`);
  const html = await res.text();
  return parseClassRows(html);
}

function upsertLevel(map, row) {
  let byRank = map.get(row.skillId);
  if (!byRank) {
    byRank = new Map();
    map.set(row.skillId, byRank);
  }
  const prev = byRank.get(row.rank);
  if (!prev) {
    byRank.set(row.rank, row);
    return;
  }
  byRank.set(row.rank, {
    skillId: row.skillId,
    rank: row.rank,
    requiredLevel: Math.min(prev.requiredLevel, row.requiredLevel),
    spCost: prev.spCost > 0 && row.spCost > 0 ? Math.min(prev.spCost, row.spCost) : Math.max(prev.spCost, row.spCost),
    mpCost: prev.mpCost > 0 && row.mpCost > 0 ? Math.min(prev.mpCost, row.mpCost) : Math.max(prev.mpCost, row.mpCost),
    power: Math.max(prev.power, row.power),
  });
}

function renderTs(map) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Автоген з l2db (`/skills/<class>/_/rg/`): ранги/вимоги/SP/MP/power.');
  lines.push(' * Не редагувати вручну.');
  lines.push(' */');
  lines.push('export type L2dbSkillLevelRow = {');
  lines.push('  level: number;');
  lines.push('  requiredLevel: number;');
  lines.push('  spCost: number;');
  lines.push('  mpCost: number;');
  lines.push('  power: number;');
  lines.push('};');
  lines.push('');
  lines.push('export const L2DB_SKILL_LEVELS_BY_ID: Readonly<');
  lines.push('  Partial<Record<number, readonly L2dbSkillLevelRow[]>>');
  lines.push('> = {');
  const ids = [...map.keys()].sort((a, b) => a - b);
  for (const id of ids) {
    const rows = [...map.get(id).values()].sort((a, b) => a.rank - b.rank);
    const json = JSON.stringify(
      rows.map((r) => ({
        level: r.rank,
        requiredLevel: r.requiredLevel,
        spCost: r.spCost,
        mpCost: r.mpCost,
        power: r.power,
      }))
    );
    lines.push(`  ${id}: ${json},`);
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const merged = new Map();
  for (const [prof, slug] of Object.entries(PROF_TO_SLUG)) {
    const rows = await fetchRowsForSlug(slug);
    for (const row of rows) upsertLevel(merged, row);
    console.log(`ok ${prof} (${slug}) rows=${rows.length}`);
  }
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outFile = path.resolve(
    __dirname,
    '../src/data/l2dbSkillLevelsById.generated.ts'
  );
  await writeFile(outFile, renderTs(merged), 'utf8');
  console.log('written', outFile, 'skills=', merged.size);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
