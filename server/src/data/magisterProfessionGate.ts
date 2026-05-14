/**
 * Логіка майстра на кшталт GuildScreen (text-rpg): приховування скілів «наступної» професії,
 * доки гравець не змінив клас (навіть якщо рівень уже достатній для переходу).
 *
 * Для расових каталогів воїна еталон — людський HF-каталог за тим самим battleId + мапінг профи
 * (`fighterProfessionHumanCatalogMap`), бо автоген інколи дублює visibleForProfessions.
 */
import { canonicalBattleSkillId } from './humanFighterSkillCatalog.legacyIds.js';
import {
  catalogEntryAllowsSkillRank,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
} from './humanFighterSkillCatalog.js';
import { mapFighterProfessionToHumanSkillCatalog } from './fighterProfessionHumanCatalogMap.js';
import { fighterCatalogEntryForRace } from './fighterSkillCatalog.byRace.js';
import { mysticCatalogEntryForRace } from './mysticSkillCatalog.byRace.js';
import { mysticCatalogEntryVisibleForProfession } from './humanMysticSkillCatalog.js';
import { isFighterClassBranch } from './l2dopHumanFighterBattleSkills.js';
import { raceFighterCatalogEntryAllowsSkillRank } from './raceFighterSkillCatalog.professionRules.js';

/** Для резолву каталогу за расою / гілкою — без залежності від charService. */
export type MagisterProfessionGateRow = {
  race: string;
  classBranch: string;
};

const BASE_CLASSES = new Set([
  'human_fighter',
  'elf_fighter',
  'dark_elf_fighter',
  'orc_fighter',
  'dwarf_fighter',
  'human_mage',
  'elf_mage',
  'dark_elf_mage',
  'orc_mage',
]);

const FIRST_JOB_LEVEL = 20;
const SECOND_TIER_LEVEL = 40;
const THIRD_TIER_LEVEL = 76;

const L20_FIRST_JOB = new Set([
  'human_warrior',
  'human_knight',
  'human_rogue',
  'elf_elven_knight',
  'elf_elven_scout',
  'dark_elf_palus_knight',
  'dark_elf_assassin',
  'orc_raider',
  'orc_monk',
  'dwarf_scavenger',
  'dwarf_artisan',
  'human_wizard',
  'human_cleric',
  'elf_elven_wizard',
  'elf_elven_oracle',
  'dark_elf_dark_wizard',
  'dark_elf_shillien_oracle',
  'orc_shaman',
]);

const L40_SECOND_TIER = new Set([
  'human_warlord',
  'human_gladiator',
  'human_paladin',
  'human_dark_avenger',
  'human_treasure_hunter',
  'human_hawkeye',
  'elf_temple_knight',
  'elf_swordsinger',
  'elf_plainswalker',
  'elf_silver_ranger',
  'dark_elf_shillien_knight',
  'dark_elf_bladedancer',
  'dark_elf_abyss_walker',
  'dark_elf_phantom_ranger',
  'orc_destroyer',
  'orc_tyrant',
  'dwarf_bounty_hunter',
  'dwarf_warsmith',
  'human_sorcerer',
  'human_necromancer',
  'human_warlock',
  'human_bishop',
  'human_prophet',
  'elf_elemental_summoner',
  'elf_spellsinger',
  'elf_elven_elder',
  'dark_elf_phantom_summoner',
  'dark_elf_spellhowler',
  'dark_elf_shillien_elder',
  'orc_overlord',
  'orc_warcryer',
]);

const L76_THIRD = new Set([
  'human_dreadnought',
  'human_duelist',
  'human_phoenix_knight',
  'human_hell_knight',
  'human_adventurer',
  'human_sagittarius',
  'elf_evas_templar',
  'elf_sword_muse',
  'elf_wind_rider',
  'elf_moonlight_sentinel',
  'dark_elf_shillien_templar',
  'dark_elf_spectral_dancer',
  'dark_elf_ghost_hunter',
  'dark_elf_ghost_sentinel',
  'orc_titan',
  'orc_grand_khavatari',
  'dwarf_fortune_seeker',
  'dwarf_maestro',
  'human_archmage',
  'human_soultaker',
  'human_arcana_lord',
  'human_cardinal',
  'human_hierophant',
  'elf_elemental_master',
  'elf_mystic_muse',
  'elf_evas_saint',
  'dark_elf_spectral_master',
  'dark_elf_storm_screamer',
  'dark_elf_shillien_saint',
  'orc_dominator',
  'orc_doomcryer',
]);

/** Мінімальний рівень персонажа для отримання професії (як у сервісах зміни профи). */
export function magisterProfessionAcquireMinLevel(profRaw: string): number {
  const p = String(profRaw || '').trim();
  if (!p) return 1;
  if (BASE_CLASSES.has(p)) return 1;
  if (L20_FIRST_JOB.has(p)) return FIRST_JOB_LEVEL;
  if (L40_SECOND_TIER.has(p)) return SECOND_TIER_LEVEL;
  if (L76_THIRD.has(p)) return THIRD_TIER_LEVEL;
  return 1;
}

/** Безпосередні наступні професії з дерева l2dop (без квестів). */
export const MAGISTER_IMMEDIATE_NEXT_PROFESSIONS: Readonly<
  Record<string, readonly string[]>
> = {
  human_fighter: ['human_warrior', 'human_knight', 'human_rogue'],
  human_warrior: ['human_warlord', 'human_gladiator'],
  human_warlord: ['human_dreadnought'],
  human_gladiator: ['human_duelist'],
  human_knight: ['human_paladin', 'human_dark_avenger'],
  human_paladin: ['human_phoenix_knight'],
  human_dark_avenger: ['human_hell_knight'],
  human_rogue: ['human_treasure_hunter', 'human_hawkeye'],
  human_treasure_hunter: ['human_adventurer'],
  human_hawkeye: ['human_sagittarius'],

  elf_fighter: ['elf_elven_knight', 'elf_elven_scout'],
  elf_elven_knight: ['elf_temple_knight', 'elf_swordsinger'],
  elf_elven_scout: ['elf_plainswalker', 'elf_silver_ranger'],
  elf_temple_knight: ['elf_evas_templar'],
  elf_swordsinger: ['elf_sword_muse'],
  elf_plainswalker: ['elf_wind_rider'],
  elf_silver_ranger: ['elf_moonlight_sentinel'],

  dark_elf_fighter: ['dark_elf_palus_knight', 'dark_elf_assassin'],
  dark_elf_palus_knight: ['dark_elf_shillien_knight', 'dark_elf_bladedancer'],
  dark_elf_assassin: ['dark_elf_abyss_walker', 'dark_elf_phantom_ranger'],
  dark_elf_shillien_knight: ['dark_elf_shillien_templar'],
  dark_elf_bladedancer: ['dark_elf_spectral_dancer'],
  dark_elf_abyss_walker: ['dark_elf_ghost_hunter'],
  dark_elf_phantom_ranger: ['dark_elf_ghost_sentinel'],

  orc_fighter: ['orc_raider', 'orc_monk'],
  orc_raider: ['orc_destroyer'],
  orc_monk: ['orc_tyrant'],
  orc_destroyer: ['orc_titan'],
  orc_tyrant: ['orc_grand_khavatari'],

  dwarf_fighter: ['dwarf_scavenger', 'dwarf_artisan'],
  dwarf_scavenger: ['dwarf_bounty_hunter'],
  dwarf_artisan: ['dwarf_warsmith'],
  dwarf_bounty_hunter: ['dwarf_fortune_seeker'],
  dwarf_warsmith: ['dwarf_maestro'],

  human_mage: ['human_wizard', 'human_cleric'],
  human_wizard: ['human_sorcerer', 'human_necromancer', 'human_warlock'],
  human_cleric: ['human_bishop', 'human_prophet'],
  human_sorcerer: ['human_archmage'],
  human_necromancer: ['human_soultaker'],
  human_warlock: ['human_arcana_lord'],
  human_bishop: ['human_cardinal'],
  human_prophet: ['human_hierophant'],

  elf_mage: ['elf_elven_wizard', 'elf_elven_oracle'],
  elf_elven_wizard: ['elf_elemental_summoner', 'elf_spellsinger'],
  elf_elven_oracle: ['elf_elven_elder'],
  elf_elemental_summoner: ['elf_elemental_master'],
  elf_spellsinger: ['elf_mystic_muse'],
  elf_elven_elder: ['elf_evas_saint'],

  dark_elf_mage: ['dark_elf_dark_wizard', 'dark_elf_shillien_oracle'],
  dark_elf_dark_wizard: ['dark_elf_phantom_summoner', 'dark_elf_spellhowler'],
  dark_elf_shillien_oracle: ['dark_elf_shillien_elder'],
  dark_elf_phantom_summoner: ['dark_elf_spectral_master'],
  dark_elf_spellhowler: ['dark_elf_storm_screamer'],
  dark_elf_shillien_elder: ['dark_elf_shillien_saint'],

  orc_mage: ['orc_shaman'],
  orc_shaman: ['orc_overlord', 'orc_warcryer'],
  orc_overlord: ['orc_dominator'],
  orc_warcryer: ['orc_doomcryer'],
};

export function magisterImmediateNextProfessions(
  profRaw: string
): readonly string[] {
  const p = String(profRaw || '').trim();
  return MAGISTER_IMMEDIATE_NEXT_PROFESSIONS[p] ?? [];
}

function magisterSkillOfferVisibleForProfessionAtRank(
  row: MagisterProfessionGateRow,
  battleId: string,
  prof: string,
  rank: number
): boolean {
  const canon = canonicalBattleSkillId(battleId);
  const rf = fighterCatalogEntryForRace(row.race, row.classBranch, canon);
  if (rf) return raceFighterCatalogEntryAllowsSkillRank(rf, prof, rank);
  const hm = mysticCatalogEntryForRace(row.race, canon);
  if (hm) return mysticCatalogEntryVisibleForProfession(hm, prof);
  const hf = humanFighterCatalogEntry(canon);
  if (!hf) return false;
  return (
    catalogEntryVisibleForProfession(hf, prof) &&
    catalogEntryAllowsSkillRank(hf, prof, rank)
  );
}

/**
 * Приховати рядок майстра: рівень уже досягає порогу наступної професії, але клас ще не змінений,
 * і скіл належить лише до однієї з наступних проф (text-rpg GuildScreen).
 */
export function magisterHideOfferExclusiveToNextProfession(args: {
  row: MagisterProfessionGateRow;
  currentProf: string;
  effLevel: number;
  battleId: string;
  catalogMinLevel: number;
}): boolean {
  const { row, currentProf, effLevel, battleId, catalogMinLevel } = args;
  const prof = String(currentProf || '').trim();
  const nextList = magisterImmediateNextProfessions(prof);
  if (!nextList.length) return false;

  const rankProbe = 1;
  const canon = canonicalBattleSkillId(battleId);
  const hfBridgeEntry =
    isFighterClassBranch(row.classBranch) && humanFighterCatalogEntry(canon);
  const hpMapped = hfBridgeEntry
    ? mapFighterProfessionToHumanSkillCatalog(prof)
    : '';

  const visibleNowRace = magisterSkillOfferVisibleForProfessionAtRank(
    row,
    battleId,
    prof,
    rankProbe
  );

  for (const nextPid of nextList) {
    const gate = magisterProfessionAcquireMinLevel(nextPid);
    if (effLevel < gate) continue;
    if (catalogMinLevel < gate) continue;

    if (hfBridgeEntry) {
      const hnMapped = mapFighterProfessionToHumanSkillCatalog(nextPid);
      const visNextH =
        catalogEntryVisibleForProfession(hfBridgeEntry, hnMapped) &&
        catalogEntryAllowsSkillRank(hfBridgeEntry, hnMapped, rankProbe);
      const visNowH =
        catalogEntryVisibleForProfession(hfBridgeEntry, hpMapped) &&
        catalogEntryAllowsSkillRank(hfBridgeEntry, hpMapped, rankProbe);
      if (visNextH && !visNowH) return true;
    }

    const visibleNextRace = magisterSkillOfferVisibleForProfessionAtRank(
      row,
      battleId,
      nextPid,
      rankProbe
    );
    if (visibleNextRace && !visibleNowRace) return true;
  }
  return false;
}
