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

function extractSkillIds(html) {
  const out = new Set();
  const rx = /skill_icons\/(\d{1,4})\.jpg/g;
  let m = rx.exec(html);
  while (m) {
    const n = Number.parseInt(m[1], 10);
    if (Number.isFinite(n) && n >= 1) out.add(n);
    m = rx.exec(html);
  }
  return [...out].sort((a, b) => a - b);
}

async function fetchSkillIdsForSlug(slug) {
  const url = `https://l2db.ru/skills/${slug}/_/rg/`;
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      accept: 'text/html,application/xhtml+xml',
    },
  });
  if (!res.ok) {
    throw new Error(`fetch_failed ${slug} ${res.status}`);
  }
  const html = await res.text();
  const ids = extractSkillIds(html);
  if (ids.length < 1) {
    throw new Error(`no_skill_icons ${slug}`);
  }
  return ids;
}

function renderTs(map) {
  const lines = [];
  lines.push('/**');
  lines.push(' * Згенеровано з l2db.ru (`/skills/<class>/_/rg/`). Не редагувати вручну.');
  lines.push(' */');
  lines.push(
    'export const L2DB_RG_SKILL_IDS_BY_PROFESSION: Readonly<Record<string, readonly number[]>> = {'
  );
  for (const key of Object.keys(map).sort()) {
    const arr = map[key];
    lines.push(`  ${JSON.stringify(key)}: [${arr.join(', ')}],`);
  }
  lines.push('};');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

async function main() {
  const out = {};
  for (const [prof, slug] of Object.entries(PROF_TO_SLUG)) {
    const ids = await fetchSkillIdsForSlug(slug);
    out[prof] = ids;
    console.log(`ok ${prof} (${slug}) -> ${ids.length}`);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const target = path.resolve(
    __dirname,
    '../src/data/l2dbRgProfessionSkillAllowlist.generated.ts'
  );
  await writeFile(target, renderTs(out), 'utf8');
  console.log(`written ${target}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
