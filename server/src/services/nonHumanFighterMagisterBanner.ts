/**
 * Магістр: кнопки зміни профи для не-людських воїнів (elf / dark elf / orc / dwarf).
 */
import type { CharacterRow } from './charService.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL } from '../data/humanFighterSkillCatalog.constants.js';
import {
  HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isFighterClassBranch,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import {
  isL2DarkElfRace,
  isL2DwarfRace,
  isL2ElfRace,
  isL2HumanRace,
  isL2OrcRace,
} from '../data/l2dopHumanMysticBattleSkills.js';
import type { MagisterProfessionBanner } from './skillLearnMagisterTypes.js';

function emptyFighterShell(
  prof: string,
  messageUk: string,
  fighterProfessionChoices: ReadonlyArray<{ slug: string; labelUk: string }>
): MagisterProfessionBanner {
  return {
    l2Profession: prof,
    canBecomeWarrior: false,
    warriorMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeKnight: false,
    knightMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeRogue: false,
    rogueMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeWarlord: false,
    warlordMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeGladiator: false,
    gladiatorMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomePaladin: false,
    paladinMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeDarkAvenger: false,
    darkAvengerMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeDreadnought: false,
    dreadnoughtMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeDuelist: false,
    duelistMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomePhoenixKnight: false,
    phoenixKnightMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeHellKnight: false,
    hellKnightMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeTreasureHunter: false,
    treasureHunterMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeAdventurer: false,
    adventurerMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeHawkeye: false,
    hawkeyeMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeSagittarius: false,
    sagittariusMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    messageUk,
    fighterProfessionChoices,
  };
}

export function nonHumanFighterProfessionBanner(
  row: CharacterRow
): MagisterProfessionBanner | null {
  if (!isFighterClassBranch(row.classBranch) || isL2HumanRace(row.race)) {
    return null;
  }
  const prof = resolveL2ProfessionForSkillsRow(row);
  const lv = levelFromTotalExp(row.exp);
  const firstOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL;
  const secondOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL;
  const thirdOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL;
  const testNote = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? ' Тест: вимоги 20/40/76 тимчасово знято.'
    : '';

  if (isL2ElfRace(row.race)) {
    let messageUk = '';
    const choices: { slug: string; labelUk: string }[] = [];
    if (prof === 'elf_fighter') {
      messageUk = firstOk
        ? 'Перша профа ельфа-воїна: Ельфійський лицар (Elven Knight) або Ельфійський скаут (Elven Scout) — з 20 р.' +
          testNote
        : 'До першої профи — 20 рівень.';
      if (firstOk) {
        choices.push(
          {
            slug: 'elf-elven-knight',
            labelUk: 'Ельфійський лицар (Elven Knight)',
          },
          {
            slug: 'elf-elven-scout',
            labelUk: 'Ельфійський скаут (Elven Scout)',
          }
        );
      }
    } else if (prof === 'elf_elven_knight') {
      messageUk = secondOk
        ? 'Друга профа: Храмовий лицар (Temple Knight) або Співак мечів (Swordsinger) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk) {
        choices.push(
          {
            slug: 'elf-temple-knight',
            labelUk: 'Храмовий лицар (Temple Knight)',
          },
          { slug: 'elf-swordsinger', labelUk: 'Співак мечів (Swordsinger)' }
        );
      }
    } else if (prof === 'elf_elven_scout') {
      messageUk = secondOk
        ? 'Друга профа: Степовий мандрівник (Plainswalker) або Срібний рейнджер (Silver Ranger) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk) {
        choices.push(
          {
            slug: 'elf-plainswalker',
            labelUk: 'Степовий мандрівник (Plainswalker)',
          },
          {
            slug: 'elf-silver-ranger',
            labelUk: 'Срібний рейнджер (Silver Ranger)',
          }
        );
      }
    } else if (prof === 'elf_temple_knight') {
      messageUk = thirdOk
        ? 'Третя профа: Темплар Еви (Eva\'s Templar) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'elf-evas-templar',
          labelUk: "Темплар Еви (Eva's Templar)",
        });
    } else if (prof === 'elf_swordsinger') {
      messageUk = thirdOk
        ? 'Третя профа: Муза меча (Sword Muse) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'elf-sword-muse',
          labelUk: 'Муза меча (Sword Muse)',
        });
    } else if (prof === 'elf_plainswalker') {
      messageUk = thirdOk
        ? 'Третя профа: Вітрогін (Wind Rider) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'elf-wind-rider',
          labelUk: 'Вітрогін (Wind Rider)',
        });
    } else if (prof === 'elf_silver_ranger') {
      messageUk = thirdOk
        ? 'Третя профа: Місячний страж (Moonlight Sentinel) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'elf-moonlight-sentinel',
          labelUk: 'Місячний страж (Moonlight Sentinel)',
        });
    } else {
      messageUk = 'Гілка ельфа-воїна (3-я профа обрана або завершена).';
    }
    return emptyFighterShell(prof, messageUk, choices);
  }

  if (isL2DarkElfRace(row.race)) {
    const choices: { slug: string; labelUk: string }[] = [];
    let messageUk = '';
    if (prof === 'dark_elf_fighter') {
      messageUk = firstOk
        ? 'Перша профа: Лицар Палуса (Palus Knight) або Асасин (Assassin) — з 20 р.' + testNote
        : 'До першої профи — 20 рівень.';
      if (firstOk) {
        choices.push(
          {
            slug: 'dark-elf-palus-knight',
            labelUk: 'Лицар Палуса (Palus Knight)',
          },
          { slug: 'dark-elf-assassin', labelUk: 'Асасин (Assassin)' }
        );
      }
    } else if (prof === 'dark_elf_palus_knight') {
      messageUk = secondOk
        ? 'Друга профа: Лицар Шиллен (Shillien Knight) або Танцюрист клинків (Bladedancer) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk) {
        choices.push(
          {
            slug: 'dark-elf-shillien-knight',
            labelUk: 'Лицар Шиллен (Shillien Knight)',
          },
          {
            slug: 'dark-elf-bladedancer',
            labelUk: 'Танцюрист клинків (Bladedancer)',
          }
        );
      }
    } else if (prof === 'dark_elf_assassin') {
      messageUk = secondOk
        ? 'Друга профа: Ходок безодні (Abyss Walker) або Фантомний рейнджер (Phantom Ranger) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk) {
        choices.push(
          {
            slug: 'dark-elf-abyss-walker',
            labelUk: 'Ходок безодні (Abyss Walker)',
          },
          {
            slug: 'dark-elf-phantom-ranger',
            labelUk: 'Фантомний рейнджер (Phantom Ranger)',
          }
        );
      }
    } else if (prof === 'dark_elf_shillien_knight') {
      messageUk = thirdOk
        ? 'Третя профа: Темплар Шиллен (Shillien Templar) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'dark-elf-shillien-templar',
          labelUk: 'Темплар Шиллен (Shillien Templar)',
        });
    } else if (prof === 'dark_elf_bladedancer') {
      messageUk = thirdOk
        ? 'Третя профа: Спектральний танцюрист (Spectral Dancer) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'dark-elf-spectral-dancer',
          labelUk: 'Спектральний танцюрист (Spectral Dancer)',
        });
    } else if (prof === 'dark_elf_abyss_walker') {
      messageUk = thirdOk
        ? 'Третя профа: Мисливець за привидами (Ghost Hunter) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'dark-elf-ghost-hunter',
          labelUk: 'Мисливець за привидами (Ghost Hunter)',
        });
    } else if (prof === 'dark_elf_phantom_ranger') {
      messageUk = thirdOk
        ? 'Третя профа: Привидний страж (Ghost Sentinel) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'dark-elf-ghost-sentinel',
          labelUk: 'Привидний страж (Ghost Sentinel)',
        });
    } else {
      messageUk = 'Гілка темного ельфа-воїна.';
    }
    return emptyFighterShell(prof, messageUk, choices);
  }

  if (isL2OrcRace(row.race)) {
    const choices: { slug: string; labelUk: string }[] = [];
    let messageUk = '';
    if (prof === 'orc_fighter') {
      messageUk = firstOk
        ? 'Перша профа: Рейдер (Raider) або Монах (Monk) — з 20 р.' + testNote
        : 'До першої профи — 20 рівень.';
      if (firstOk) {
        choices.push(
          { slug: 'orc-raider', labelUk: 'Рейдер (Raider)' },
          { slug: 'orc-monk', labelUk: 'Монах (Monk)' }
        );
      }
    } else if (prof === 'orc_raider') {
      messageUk = secondOk
        ? 'Друга профа: Руйнівник (Destroyer) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk)
        choices.push({ slug: 'orc-destroyer', labelUk: 'Руйнівник (Destroyer)' });
    } else if (prof === 'orc_monk') {
      messageUk = secondOk
        ? 'Друга профа: Тиран (Tyrant) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk)
        choices.push({ slug: 'orc-tyrant', labelUk: 'Тиран (Tyrant)' });
    } else if (prof === 'orc_destroyer') {
      messageUk = thirdOk
        ? 'Третя профа: Титан (Titan) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({ slug: 'orc-titan', labelUk: 'Титан (Titan)' });
    } else if (prof === 'orc_tyrant') {
      messageUk = thirdOk
        ? 'Третя профа: Великий каватарі (Grand Khavatari) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'orc-grand-khavatari',
          labelUk: 'Великий каватарі (Grand Khavatari)',
        });
    } else {
      messageUk = 'Гілка орка-воїна.';
    }
    return emptyFighterShell(prof, messageUk, choices);
  }

  if (isL2DwarfRace(row.race)) {
    const choices: { slug: string; labelUk: string }[] = [];
    let messageUk = '';
    if (prof === 'dwarf_fighter') {
      messageUk = firstOk
        ? 'Перша профа гнома: Збирач (Scavenger) або Ремісник (Artisan) — з 20 р.' + testNote
        : 'До першої профи — 20 рівень.';
      if (firstOk) {
        choices.push(
          { slug: 'dwarf-scavenger', labelUk: 'Збирач (Scavenger)' },
          { slug: 'dwarf-artisan', labelUk: 'Ремісник (Artisan)' }
        );
      }
    } else if (prof === 'dwarf_scavenger') {
      messageUk = secondOk
        ? 'Друга профа: Мисливець за головами (Bounty Hunter) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk)
        choices.push({
          slug: 'dwarf-bounty-hunter',
          labelUk: 'Мисливець за головами (Bounty Hunter)',
        });
    } else if (prof === 'dwarf_artisan') {
      messageUk = secondOk
        ? 'Друга профа: Воєнний коваль (Warsmith) — з 40 р.'
        : 'До другої профи — 40 рівень.';
      if (secondOk)
        choices.push({
          slug: 'dwarf-warsmith',
          labelUk: 'Воєнний коваль (Warsmith)',
        });
    } else if (prof === 'dwarf_bounty_hunter') {
      messageUk = thirdOk
        ? 'Третя профа: Шукач фортуни (Fortune Seeker) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({
          slug: 'dwarf-fortune-seeker',
          labelUk: 'Шукач фортуни (Fortune Seeker)',
        });
    } else if (prof === 'dwarf_warsmith') {
      messageUk = thirdOk
        ? 'Третя профа: Маестро (Maestro) — з 76 р.'
        : 'До третьої профи — 76 рівень.';
      if (thirdOk)
        choices.push({ slug: 'dwarf-maestro', labelUk: 'Маестро (Maestro)' });
    } else {
      messageUk = 'Гілка гнома-воїна.';
    }
    return emptyFighterShell(prof, messageUk, choices);
  }

  return null;
}
