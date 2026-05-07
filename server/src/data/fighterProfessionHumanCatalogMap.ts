/**
 * Не-людські гілки воїна використовують той самий бойовий каталог, що й HumanFighter;
 * для перевірок `professionReq` зводимо профу до «еквівалента» людини (Interlude, без GoD).
 */
const MAP: Readonly<Record<string, string>> = {
  // Elf fighter
  elf_fighter: 'human_fighter',
  elf_elven_knight: 'human_knight',
  elf_elven_scout: 'human_rogue',
  elf_temple_knight: 'human_paladin',
  elf_swordsinger: 'human_gladiator',
  elf_plainswalker: 'human_treasure_hunter',
  elf_silver_ranger: 'human_hawkeye',
  elf_evas_templar: 'human_phoenix_knight',
  elf_sword_muse: 'human_duelist',
  elf_wind_rider: 'human_adventurer',
  elf_moonlight_sentinel: 'human_sagittarius',
  // Dark elf fighter
  dark_elf_fighter: 'human_fighter',
  dark_elf_palus_knight: 'human_knight',
  dark_elf_assassin: 'human_rogue',
  dark_elf_shillien_knight: 'human_paladin',
  dark_elf_bladedancer: 'human_gladiator',
  dark_elf_abyss_walker: 'human_treasure_hunter',
  dark_elf_phantom_ranger: 'human_hawkeye',
  dark_elf_shillien_templar: 'human_phoenix_knight',
  dark_elf_spectral_dancer: 'human_duelist',
  dark_elf_ghost_hunter: 'human_adventurer',
  dark_elf_ghost_sentinel: 'human_sagittarius',
  // Orc fighter
  orc_fighter: 'human_fighter',
  orc_raider: 'human_warrior',
  orc_monk: 'human_gladiator',
  orc_destroyer: 'human_warlord',
  orc_tyrant: 'human_gladiator',
  orc_titan: 'human_dreadnought',
  orc_grand_khavatari: 'human_duelist',
  // Dwarf fighter
  dwarf_fighter: 'human_fighter',
  dwarf_scavenger: 'human_rogue',
  dwarf_artisan: 'human_warrior',
  dwarf_bounty_hunter: 'human_treasure_hunter',
  dwarf_warsmith: 'human_warlord',
  dwarf_fortune_seeker: 'human_adventurer',
  dwarf_maestro: 'human_dreadnought',
};

export function mapFighterProfessionToHumanSkillCatalog(l2Profession: string): string {
  const p = String(l2Profession || '').trim();
  return MAP[p] ?? p;
}
