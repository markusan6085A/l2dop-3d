import { L2DB_RG_SKILL_IDS_BY_PROFESSION } from './l2dbRgProfessionSkillAllowlist.generated.js';

const PREV_PROFESSION: Readonly<Record<string, string>> = {
  human_warrior: 'human_fighter',
  human_knight: 'human_fighter',
  human_rogue: 'human_fighter',
  human_warlord: 'human_warrior',
  human_gladiator: 'human_warrior',
  human_paladin: 'human_knight',
  human_dark_avenger: 'human_knight',
  human_treasure_hunter: 'human_rogue',
  human_hawkeye: 'human_rogue',
  human_dreadnought: 'human_warlord',
  human_duelist: 'human_gladiator',
  human_phoenix_knight: 'human_paladin',
  human_hell_knight: 'human_dark_avenger',
  human_adventurer: 'human_treasure_hunter',
  human_sagittarius: 'human_hawkeye',
  human_wizard: 'human_mage',
  human_cleric: 'human_mage',
  human_sorcerer: 'human_wizard',
  human_necromancer: 'human_wizard',
  human_warlock: 'human_wizard',
  human_bishop: 'human_cleric',
  human_prophet: 'human_cleric',
  human_archmage: 'human_sorcerer',
  human_soultaker: 'human_necromancer',
  human_arcana_lord: 'human_warlock',
  human_cardinal: 'human_bishop',
  human_hierophant: 'human_prophet',

  elf_elven_knight: 'elf_fighter',
  elf_elven_scout: 'elf_fighter',
  elf_temple_knight: 'elf_elven_knight',
  elf_swordsinger: 'elf_elven_knight',
  elf_plainswalker: 'elf_elven_scout',
  elf_silver_ranger: 'elf_elven_scout',
  elf_evas_templar: 'elf_temple_knight',
  elf_sword_muse: 'elf_swordsinger',
  elf_wind_rider: 'elf_plainswalker',
  elf_moonlight_sentinel: 'elf_silver_ranger',
  elf_elven_wizard: 'elf_mage',
  elf_elven_oracle: 'elf_mage',
  elf_elemental_summoner: 'elf_elven_wizard',
  elf_spellsinger: 'elf_elven_wizard',
  elf_elven_elder: 'elf_elven_oracle',
  elf_elemental_master: 'elf_elemental_summoner',
  elf_mystic_muse: 'elf_spellsinger',
  elf_evas_saint: 'elf_elven_elder',

  dark_elf_palus_knight: 'dark_elf_fighter',
  dark_elf_assassin: 'dark_elf_fighter',
  dark_elf_shillien_knight: 'dark_elf_palus_knight',
  dark_elf_bladedancer: 'dark_elf_palus_knight',
  dark_elf_abyss_walker: 'dark_elf_assassin',
  dark_elf_phantom_ranger: 'dark_elf_assassin',
  dark_elf_shillien_templar: 'dark_elf_shillien_knight',
  dark_elf_spectral_dancer: 'dark_elf_bladedancer',
  dark_elf_ghost_hunter: 'dark_elf_abyss_walker',
  dark_elf_ghost_sentinel: 'dark_elf_phantom_ranger',
  dark_elf_dark_wizard: 'dark_elf_mage',
  dark_elf_shillien_oracle: 'dark_elf_mage',
  dark_elf_phantom_summoner: 'dark_elf_dark_wizard',
  dark_elf_spellhowler: 'dark_elf_dark_wizard',
  dark_elf_shillien_elder: 'dark_elf_shillien_oracle',
  dark_elf_spectral_master: 'dark_elf_phantom_summoner',
  dark_elf_storm_screamer: 'dark_elf_spellhowler',
  dark_elf_shillien_saint: 'dark_elf_shillien_elder',

  orc_raider: 'orc_fighter',
  orc_monk: 'orc_fighter',
  orc_destroyer: 'orc_raider',
  orc_tyrant: 'orc_monk',
  orc_titan: 'orc_destroyer',
  orc_grand_khavatari: 'orc_tyrant',
  orc_shaman: 'orc_mage',
  orc_overlord: 'orc_shaman',
  orc_warcryer: 'orc_shaman',
  orc_dominator: 'orc_overlord',
  orc_doomcryer: 'orc_warcryer',

  dwarf_scavenger: 'dwarf_fighter',
  dwarf_artisan: 'dwarf_fighter',
  dwarf_bounty_hunter: 'dwarf_scavenger',
  dwarf_warsmith: 'dwarf_artisan',
  dwarf_fortune_seeker: 'dwarf_bounty_hunter',
  dwarf_maestro: 'dwarf_warsmith',
};

function professionWithAncestors(l2Profession: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  let cur = String(l2Profession || '').trim();
  while (cur && !seen.has(cur)) {
    out.push(cur);
    seen.add(cur);
    cur = PREV_PROFESSION[cur] ?? '';
  }
  return out;
}

export function isL2dbRgSkillAllowedForProfession(
  l2Profession: string,
  l2SkillId: number
): boolean {
  const p = String(l2Profession || '').trim();
  if (!p) return true;
  if (!Number.isFinite(l2SkillId) || l2SkillId < 1) return false;
  const id = Math.floor(l2SkillId);
  const chain = professionWithAncestors(p);
  let hadAnyAllow = false;
  for (const prof of chain) {
    const allow = L2DB_RG_SKILL_IDS_BY_PROFESSION[prof];
    if (!allow) continue;
    hadAnyAllow = true;
    if (allow.includes(id)) return true;
  }
  return !hadAnyAllow;
}
