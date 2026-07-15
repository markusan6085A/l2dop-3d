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

/** Канонічні описи, коли l2db змішує однакові skillId між класами (3/16/56 тощо). */
const MANUAL_HINT_OVERRIDES_UK = {
  3: 'Накопичує силу для різкого удару. Лише з мечем або булавою. Можливий надудар.',
  16: 'Потенційно смертельна атака. Лише з кинжалами. Можливий надудар.',
  56: 'Смертельний постріл з лука. Можливий надудар. Лише з луком.',
  231: 'Пасив: підвищує P. Def (%) у важкій броні (1 р. — +1.9%, 50 р. — +79.3%).',
};

function decodeHtml(s) {
  return String(s || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalizeText(raw) {
  return decodeHtml(raw)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ruToUkShort(s) {
  let out = ' ' + String(s || '') + ' ';
  const pairs = [
    [' Мгновенно ', ' Миттєво '],
    [' Увеличивает ', ' Підвищує '],
    [' Увеличиваетcя ', ' Підвищується '],
    [' Уменьшает ', ' Знижує '],
    [' Понижает ', ' Знижує '],
    [' сопротивление ', ' опір '],
    [' скорость ', ' швидкість '],
    [' врага ', ' ворога '],
    [' противника ', ' ворога '],
    [' цели ', ' цілі '],
    [' атакует ', ' атакує '],
    [' нескольких ', ' кількох '],
    [' магические умения ', ' магічні вміння '],
    [' магическую атаку ', ' магічну атаку '],
    [' Маг. Защ. ', ' M.Def '],
    [' Физ. Защ. ', ' P.Def '],
    [' Физ. Атк. ', ' P.Atk '],
    [' Маг. Атк. ', ' M.Atk '],
    [' Уровень ', ' Рівень '],
    [' Мощность ', ' Сила '],
    [' Временно ', ' Тимчасово '],
  ];
  for (const [a, b] of pairs) out = out.split(a).join(b);
  out = out.replace(/\s+/g, ' ').trim();
  if (!out.endsWith('.')) out += '.';
  return out;
}

function parseRows(html) {
  const out = [];
  const rowRe =
    /<tr[^>]*>\s*<td><img[^>]*skill_icons\/0*(\d+)\.jpg[^>]*><\/td>\s*<td>([\s\S]*?)<\/td>\s*<td>(?:да|нет)<\/td>\s*<td>\d+<\/td>\s*<td>\d+<\/td>\s*<td>\d+<\/td>\s*<\/tr>/gi;
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const skillId = Number.parseInt(m[1], 10);
    if (!Number.isFinite(skillId) || skillId <= 0) continue;
    const cell = normalizeText(m[2]);
    const descRaw = cell.replace(/^[^0-9]*\d+\s+/, '').trim();
    if (!descRaw) continue;
    out.push({ skillId, desc: descRaw });
  }
  return out;
}

async function fetchRows(slug) {
  const url = `https://l2db.ru/skills/${slug}/_/rg/`;
  const res = await fetch(url, {
    headers: { 'user-agent': USER_AGENT, accept: 'text/html,application/xhtml+xml' },
  });
  if (!res.ok) throw new Error(`fetch_failed ${slug} ${res.status}`);
  const html = await res.text();
  return parseRows(html);
}

function renderTs(map) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Автоген коротких описів скілів з l2db (`/skills/<class>/_/rg/`).');
  lines.push(' * Не редагувати вручну.');
  lines.push(' */');
  lines.push(
    'export const L2DB_SKILL_HINT_UK_BY_ID: Readonly<Partial<Record<number, string>>> = {'
  );
  const ids = [...map.keys()].sort((a, b) => a - b);
  for (const id of ids) {
    lines.push(`  ${id}: ${JSON.stringify(map.get(id))},`);
  }
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const byId = new Map();
  for (const [prof, slug] of Object.entries(PROF_TO_SLUG)) {
    const rows = await fetchRows(slug);
    for (const row of rows) {
      let stat = byId.get(row.skillId);
      if (!stat) {
        stat = new Map();
        byId.set(row.skillId, stat);
      }
      stat.set(row.desc, (stat.get(row.desc) ?? 0) + 1);
    }
    console.log(`ok ${prof} (${slug}) rows=${rows.length}`);
  }

  const hints = new Map();
  for (const [skillId, variants] of byId.entries()) {
    const manual = MANUAL_HINT_OVERRIDES_UK[skillId];
    if (manual) {
      hints.set(skillId, manual);
      continue;
    }
    const picked = [...variants.entries()].sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return a[0].length - b[0].length;
    })[0]?.[0];
    if (!picked) continue;
    const short = ruToUkShort(picked).slice(0, 220).trim();
    hints.set(skillId, short);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const outFile = path.resolve(
    __dirname,
    '../src/data/l2dbSkillHintUk.generated.ts'
  );
  await writeFile(outFile, renderTs(hints), 'utf8');
  console.log('written', outFile, 'skills=', hints.size);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
