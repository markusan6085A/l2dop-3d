import type { CharacterRow } from './charService.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
  HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
  HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ,
  isHumanFighter,
  resolveL2ProfessionForSkillsRow,
} from '../data/l2dopHumanFighterBattleSkills.js';
import { HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL } from '../data/humanFighterSkillCatalog.js';
import {
  HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
  HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
  HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  isL2DarkElfRace,
  isL2ElfRace,
  isL2HumanRace,
  isL2OrcRace,
  isMysticClassBranch,
} from '../data/l2dopHumanMysticBattleSkills.js';
import type { MagisterProfessionBanner } from './skillLearnMagisterTypes.js';
import { nonHumanFighterProfessionBanner } from './nonHumanFighterMagisterBanner.js';
import { parseQuestProgressJson } from '../domain/humanFighterFirstProfessionQuest.js';

function humanMysticProfessionBannerFor(
  row: CharacterRow
): MagisterProfessionBanner {
  const prof = resolveL2ProfessionForSkillsRow(row);
  const lv = levelFromTotalExp(row.exp);
  const firstOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL;
  const secondOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL;
  const thirdOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL;

  const canBecomeHumanWizard = prof === 'human_mage' && firstOk;
  const canBecomeHumanCleric = prof === 'human_mage' && firstOk;
  const canBecomeHumanSorcerer = prof === 'human_wizard' && secondOk;
  const canBecomeHumanNecromancer = prof === 'human_wizard' && secondOk;
  const canBecomeHumanWarlock = prof === 'human_wizard' && secondOk;
  const canBecomeHumanBishop = prof === 'human_cleric' && secondOk;
  const canBecomeHumanProphet = prof === 'human_cleric' && secondOk;
  const canBecomeHumanArchmage = prof === 'human_sorcerer' && thirdOk;
  const canBecomeHumanSoultaker = prof === 'human_necromancer' && thirdOk;
  const canBecomeHumanArcanaLord = prof === 'human_warlock' && thirdOk;
  const canBecomeHumanCardinal = prof === 'human_bishop' && thirdOk;
  const canBecomeHumanHierophant = prof === 'human_prophet' && thirdOk;

  const testNote = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? ' Тест: вимоги рівня 20/40/76 тимчасово знято.'
    : '';

  let messageUk: string;
  if (prof === 'human_mage') {
    messageUk = firstOk
      ? 'Перша профа людини-мага: Чарівник (Wizard) або Клірик (Cleric) — з ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' р. (l2db).' +
        testNote
      : 'До першої профи — дійти до ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_wizard') {
    messageUk = secondOk
      ? 'Друга профа (чарівник): Чаклун (Sorcerer), Некромант (Necromancer) або Чорнокнижник (Warlock) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_cleric') {
    messageUk = secondOk
      ? 'Друга профа (жрець): Єпископ (Bishop) або Пророк (Prophet) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_sorcerer') {
    messageUk = thirdOk
      ? 'Третя профа: Архімаг (Archmage) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_necromancer') {
    messageUk = thirdOk
      ? 'Третя профа: Збирач душ (Soultaker) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_warlock') {
    messageUk = thirdOk
      ? 'Третя профа: Володар Аркани (Arcana Lord) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_bishop') {
    messageUk = thirdOk
      ? 'Третя профа: Кардинал (Cardinal) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_prophet') {
    messageUk = thirdOk
      ? 'Третя профа: Ієрофант (Hierophant) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'human_archmage') {
    messageUk = 'Третя профа: Archmage. Гілка чаклуна завершена.';
  } else if (prof === 'human_soultaker') {
    messageUk = 'Третя профа: Soultaker. Гілка некроманта завершена.';
  } else if (prof === 'human_arcana_lord') {
    messageUk = 'Третя профа: Arcana Lord. Гілка чорнокнижника завершена.';
  } else if (prof === 'human_cardinal') {
    messageUk = 'Третя профа: Cardinal. Гілка єпископа завершена.';
  } else if (prof === 'human_hierophant') {
    messageUk = 'Третя профа: Hierophant. Гілка пророка завершена.';
  } else {
    messageUk = 'Професія: ' + prof + '.';
  }

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
    canBecomeHumanWizard,
    canBecomeHumanCleric,
    humanMysticFirstMinLevel: HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
    canBecomeHumanSorcerer,
    canBecomeHumanNecromancer,
    canBecomeHumanWarlock,
    canBecomeHumanBishop,
    canBecomeHumanProphet,
    humanMysticSecondMinLevel: HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
    canBecomeHumanArchmage,
    canBecomeHumanSoultaker,
    canBecomeHumanArcanaLord,
    canBecomeHumanCardinal,
    canBecomeHumanHierophant,
    humanMysticThirdMinLevel: HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  };
}

function elfMysticProfessionBannerFor(
  row: CharacterRow
): MagisterProfessionBanner {
  const prof = resolveL2ProfessionForSkillsRow(row);
  const lv = levelFromTotalExp(row.exp);
  const firstOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL;
  const secondOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL;
  const thirdOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL;

  const canBecomeElfElvenWizard = prof === 'elf_mage' && firstOk;
  const canBecomeElfElvenOracle = prof === 'elf_mage' && firstOk;
  const canBecomeElfElementalSummoner =
    prof === 'elf_elven_wizard' && secondOk;
  const canBecomeElfSpellsinger = prof === 'elf_elven_wizard' && secondOk;
  const canBecomeElfElvenElder = prof === 'elf_elven_oracle' && secondOk;
  const canBecomeElfElementalMaster =
    prof === 'elf_elemental_summoner' && thirdOk;
  const canBecomeElfMysticMuse = prof === 'elf_spellsinger' && thirdOk;
  const canBecomeElfEvasSaint = prof === 'elf_elven_elder' && thirdOk;

  const testNote = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? ' Тест: вимоги рівня 20/40/76 тимчасово знято.'
    : '';

  let messageUk: string;
  if (prof === 'elf_mage') {
    messageUk = firstOk
      ? 'Перша профа ельфа-мага: обери Ельфійського чарівника (Elven Wizard) або Ельфійського оракула (Elven Oracle) — з ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' р. (l2db).' +
        testNote
      : 'До першої профи — дійти до ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_elven_wizard') {
    messageUk = secondOk
      ? 'Друга профа (чарівник): Покликувач стихій (Elemental Summoner) або Співак чарів (Spellsinger) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_elven_oracle') {
    messageUk = secondOk
      ? 'Друга профа (жрець): Ельфійський старійшина (Elven Elder) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_elemental_summoner') {
    messageUk = thirdOk
      ? 'Третя профа: Володар стихій (Elemental Master) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_spellsinger') {
    messageUk = thirdOk
      ? 'Третя профа: Містична муза (Mystic Muse) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_elven_elder') {
    messageUk = thirdOk
      ? 'Третя профа: Святий Еви (Eva\'s Saint) — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'elf_elemental_master') {
    messageUk =
      'Третя профа: Володар стихій (Elemental Master). Гілка саммонера завершена.';
  } else if (prof === 'elf_mystic_muse') {
    messageUk =
      'Третя профа: Містична муза (Mystic Muse). Гілка співака чарів завершена.';
  } else if (prof === 'elf_evas_saint') {
    messageUk =
      'Третя профа: Святий Еви (Eva\'s Saint). Гілка жреця завершена.';
  } else {
    messageUk = 'Професія: ' + prof + '.';
  }

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
    canBecomeElfElvenWizard,
    canBecomeElfElvenOracle,
    elfMysticFirstMinLevel: HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
    canBecomeElfElementalSummoner,
    canBecomeElfSpellsinger,
    canBecomeElfElvenElder,
    elfMysticSecondMinLevel: HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
    canBecomeElfElementalMaster,
    canBecomeElfMysticMuse,
    canBecomeElfEvasSaint,
    elfMysticThirdMinLevel: HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  };
}

function darkElfMysticProfessionBannerFor(
  row: CharacterRow
): MagisterProfessionBanner {
  const prof = resolveL2ProfessionForSkillsRow(row);
  const lv = levelFromTotalExp(row.exp);
  const firstOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL;
  const secondOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL;
  const thirdOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL;

  const canBecomeDarkElfDarkWizard = prof === 'dark_elf_mage' && firstOk;
  const canBecomeDarkElfShillienOracle = prof === 'dark_elf_mage' && firstOk;
  const canBecomeDarkElfPhantomSummoner =
    prof === 'dark_elf_dark_wizard' && secondOk;
  const canBecomeDarkElfSpellhowler =
    prof === 'dark_elf_dark_wizard' && secondOk;
  const canBecomeDarkElfShillienElder =
    prof === 'dark_elf_shillien_oracle' && secondOk;
  const canBecomeDarkElfSpectralMaster =
    prof === 'dark_elf_phantom_summoner' && thirdOk;
  const canBecomeDarkElfStormScreamer =
    prof === 'dark_elf_spellhowler' && thirdOk;
  const canBecomeDarkElfShillienSaint =
    prof === 'dark_elf_shillien_elder' && thirdOk;

  const testNote = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? ' Тест: вимоги рівня 20/40/76 тимчасово знято.'
    : '';

  let messageUk: string;
  if (prof === 'dark_elf_mage') {
    messageUk = firstOk
      ? 'Перша профа темного ельфа-мага: обери Темного чарівника (Dark Wizard) або Оракула Шиллен (Shillien Oracle) — з ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' р. (l2db).' +
        testNote
      : 'До першої профи — дійти до ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_dark_wizard') {
    messageUk = secondOk
      ? 'Друга профа (чарівник): Підступний заклинатель (Phantom Summoner) або Заклинатель вітрів (Spellhowler) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_shillien_oracle') {
    messageUk = secondOk
      ? 'Друга профа (жрець): Старійшина Шиллен (Shillien Elder) — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_phantom_summoner') {
    messageUk = thirdOk
      ? 'Третя профа: Spectral Master — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_spellhowler') {
    messageUk = thirdOk
      ? 'Третя профа: Storm Screamer — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_shillien_elder') {
    messageUk = thirdOk
      ? 'Третя профа: Shillien Saint — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'dark_elf_spectral_master') {
    messageUk =
      'Третя профа: Spectral Master. Гілка саммонера завершена.';
  } else if (prof === 'dark_elf_storm_screamer') {
    messageUk =
      'Третя профа: Storm Screamer. Гілка заклинателя вітрів завершена.';
  } else if (prof === 'dark_elf_shillien_saint') {
    messageUk =
      'Третя профа: Shillien Saint. Гілка жреця завершена.';
  } else {
    messageUk = 'Професія: ' + prof + '.';
  }

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
    canBecomeDarkElfDarkWizard,
    canBecomeDarkElfShillienOracle,
    darkElfMysticFirstMinLevel: HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
    canBecomeDarkElfPhantomSummoner,
    canBecomeDarkElfSpellhowler,
    canBecomeDarkElfShillienElder,
    darkElfMysticSecondMinLevel: HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
    canBecomeDarkElfSpectralMaster,
    canBecomeDarkElfStormScreamer,
    canBecomeDarkElfShillienSaint,
    darkElfMysticThirdMinLevel: HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  };
}

function orcMysticProfessionBannerFor(row: CharacterRow): MagisterProfessionBanner {
  const prof = resolveL2ProfessionForSkillsRow(row);
  const lv = levelFromTotalExp(row.exp);
  const firstOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL;
  const secondOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL;
  const thirdOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL;

  const canBecomeOrcShaman = prof === 'orc_mage' && firstOk;
  const canBecomeOrcOverlord = prof === 'orc_shaman' && secondOk;
  const canBecomeOrcWarcryer = prof === 'orc_shaman' && secondOk;
  const canBecomeOrcDominator = prof === 'orc_overlord' && thirdOk;
  const canBecomeOrcDoomcryer = prof === 'orc_warcryer' && thirdOk;

  const testNote = HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ
    ? ' Тест: вимоги рівня 20/40/76 тимчасово знято.'
    : '';

  let messageUk: string;
  if (prof === 'orc_mage') {
    messageUk = firstOk
      ? 'Перша профа орка-мага: Шаман орків (Orc Shaman) — з ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' р. (l2db).' +
        testNote
      : 'До першої профи — дійти до ' +
        HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'orc_shaman') {
    messageUk = secondOk
      ? 'Друга профа: Overlord або Warcryer — з ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' р.'
      : 'До другої профи — дійти до ' +
        HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'orc_overlord') {
    messageUk = thirdOk
      ? 'Третя профа: Dominator — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'orc_warcryer') {
    messageUk = thirdOk
      ? 'Третя профа: Doomcryer — з ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' р.'
      : 'До третьої профи — дійти до ' +
        HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL +
        ' рівня.';
  } else if (prof === 'orc_dominator') {
    messageUk = 'Третя профа: Dominator. Гілка вождя завершена.';
  } else if (prof === 'orc_doomcryer') {
    messageUk = 'Третя профа: Doomcryer. Гілка воплотителя завершена.';
  } else {
    messageUk = 'Професія: ' + prof + '.';
  }

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
    canBecomeOrcShaman,
    orcMysticFirstMinLevel: HUMAN_MYSTIC_FIRST_PROFESSION_LEVEL,
    canBecomeOrcOverlord,
    canBecomeOrcWarcryer,
    orcMysticSecondMinLevel: HUMAN_MYSTIC_SECOND_PROFESSION_LEVEL,
    canBecomeOrcDominator,
    canBecomeOrcDoomcryer,
    orcMysticThirdMinLevel: HUMAN_MYSTIC_THIRD_PROFESSION_LEVEL,
  };
}

export function professionBannerFor(row: CharacterRow): MagisterProfessionBanner | null {
  if (isL2HumanRace(row.race) && isMysticClassBranch(row.classBranch)) {
    return humanMysticProfessionBannerFor(row);
  }
  if (isL2ElfRace(row.race) && isMysticClassBranch(row.classBranch)) {
    return elfMysticProfessionBannerFor(row);
  }
  if (isL2DarkElfRace(row.race) && isMysticClassBranch(row.classBranch)) {
    return darkElfMysticProfessionBannerFor(row);
  }
  if (isL2OrcRace(row.race) && isMysticClassBranch(row.classBranch)) {
    return orcMysticProfessionBannerFor(row);
  }
  const nhFighterBanner = nonHumanFighterProfessionBanner(row);
  if (nhFighterBanner) return nhFighterBanner;
  if (!isHumanFighter(row.race, row.classBranch)) return null;
  const prof =
    typeof row.l2Profession === 'string' && row.l2Profession.trim()
      ? row.l2Profession.trim()
      : 'human_fighter';
  const lv = levelFromTotalExp(row.exp);
  const warLvlOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL;
  const warlordLvlOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL;
  const dreadnoughtLvlOk =
    HUMAN_FIGHTER_TEST_SKIP_SKILL_LEVEL_REQ ||
    lv >= HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL;
  const lockedFirstProfTarget =
    prof === 'human_fighter'
      ? parseQuestProgressJson(row.questProgressJson).active?.targetProfession ??
        null
      : null;
  const canWar =
    prof === 'human_fighter' &&
    warLvlOk &&
    (!lockedFirstProfTarget || lockedFirstProfTarget === 'human_warrior');
  const canKnight =
    prof === 'human_fighter' &&
    warLvlOk &&
    (!lockedFirstProfTarget || lockedFirstProfTarget === 'human_knight');
  const canRogue =
    prof === 'human_fighter' &&
    warLvlOk &&
    (!lockedFirstProfTarget || lockedFirstProfTarget === 'human_rogue');
  const canWarlord = prof === 'human_warrior' && warlordLvlOk;
  const canGladiator = prof === 'human_warrior' && warlordLvlOk;
  const canPaladin = prof === 'human_knight' && warlordLvlOk;
  const canDarkAvenger = prof === 'human_knight' && warlordLvlOk;
  const canDreadnought = prof === 'human_warlord' && dreadnoughtLvlOk;
  const canDuelist = prof === 'human_gladiator' && dreadnoughtLvlOk;
  const canPhoenixKnight = prof === 'human_paladin' && dreadnoughtLvlOk;
  const canHellKnight = prof === 'human_dark_avenger' && dreadnoughtLvlOk;
  const canTreasureHunter = prof === 'human_rogue' && warlordLvlOk;
  const canAdventurer = prof === 'human_treasure_hunter' && dreadnoughtLvlOk;
  const canHawkeye = prof === 'human_rogue' && warlordLvlOk;
  const canSagittarius = prof === 'human_hawkeye' && dreadnoughtLvlOk;
  let messageUk =
    prof === 'human_warrior'
      ? 'Перша профа: Воїн (Warrior). Доступні воїнські скіли.' +
        (warlordLvlOk
          ? ' Друга профа: обери гілку — Воєначальник (Warlord, алебарда) або Гладіатор (Gladiator) — з ' +
            HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
            ' р.'
          : ' До другої профи — дійти до ' +
            HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
            ' рівня.')
      : prof === 'human_knight'
        ? 'Перша профа гілки лицаря: Лицар (Human Knight). Скіли щита та одноручної зброї (text-rpg).' +
          (warlordLvlOk
            ? ' Друга профа: обери Паладина (Paladin) або Темного месника (Dark Avenger) — з ' +
              HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
              ' р.'
            : ' До другої профи — дійти до ' +
              HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
              ' рівня.')
      : prof === 'human_paladin'
        ? 'Друга профа: Паладин (Paladin).' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Лицар Фенікса (Phoenix Knight) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р.'
            : ' До третьої профи (Phoenix Knight) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_phoenix_knight'
        ? 'Третя профа: Лицар Фенікса (Phoenix Knight). Світла гілка лицаря завершена.'
      : prof === 'human_dark_avenger'
        ? 'Друга профа (темна гілка): Темний месник (Dark Avenger).' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Лицар пекла (Hell Knight) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р.'
            : ' До третьої профи (Hell Knight) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_hell_knight'
        ? 'Третя профа: Лицар пекла (Hell Knight). Темна гілка лицаря завершена.'
      : prof === 'human_rogue'
        ? 'Перша профа: Розбійник (Rogue).' +
          (warlordLvlOk
            ? ' Друга профа: обери Мисливця за скарбами (Treasure Hunter) або Яструба (Hawkeye) — з ' +
              HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
              ' р.'
            : ' До другої профи — дійти до ' +
              HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL +
              ' рівня.')
      : prof === 'human_treasure_hunter'
        ? 'Друга профа: Мисливець за скарбами (Treasure Hunter).' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Авантюрист (Adventurer) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р.'
            : ' До третьої профи (Adventurer) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_adventurer'
        ? 'Третя профа: Авантюрист (Adventurer). Гілка розбійника завершена.'
      : prof === 'human_hawkeye'
        ? 'Друга профа: Яструб (Hawkeye).' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Стрілець (Sagittarius) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р.'
            : ' До третьої профи (Sagittarius) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_sagittarius'
        ? 'Третя профа: Стрілець (Sagittarius). Гілка лучника завершена.'
      : prof === 'human_warlord'
        ? 'Друга профа: Воєначальник (Warlord). Скіли гілки алебарди та воїнська база.' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Дредноут (Dreadnought) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р. обери кнопку нижче.'
            : ' До третьої профи (Dreadnought) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_gladiator'
        ? 'Друга профа: Гладіатор (Gladiator). Спільні детекти з гілкою воїна; унікальні скіли гілки — з каталогу (text-rpg).' +
          (dreadnoughtLvlOk
            ? ' Третя профа: Дуелянт (Duelist) — з ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' р.'
            : ' До третьої профи (Duelist) — дійти до ' +
              HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL +
              ' рівня.')
      : prof === 'human_dreadnought'
        ? 'Третя профа: Дредноут (Dreadnought). Повний набір гілки алебарди.'
        : prof === 'human_duelist'
          ? 'Третя профа: Дуелянт (Duelist). Гілка подвійних мечів.'
          : prof === 'human_fighter'
            ? warLvlOk
              ? ''
              : 'До першої профи — дійти до ' +
                HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL +
                ' рівня.'
            : 'Профа: ' + prof + '.';
  return {
    l2Profession: prof,
    canBecomeWarrior: canWar,
    warriorMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeKnight: canKnight,
    knightMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeRogue: canRogue,
    rogueMinLevel: HUMAN_FIGHTER_PROFESSION_WARRIOR_MIN_LEVEL,
    canBecomeWarlord: canWarlord,
    warlordMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeGladiator: canGladiator,
    gladiatorMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomePaladin: canPaladin,
    paladinMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeDarkAvenger: canDarkAvenger,
    darkAvengerMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeDreadnought: canDreadnought,
    dreadnoughtMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeDuelist: canDuelist,
    duelistMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomePhoenixKnight: canPhoenixKnight,
    phoenixKnightMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeHellKnight: canHellKnight,
    hellKnightMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeTreasureHunter: canTreasureHunter,
    treasureHunterMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeAdventurer: canAdventurer,
    adventurerMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    canBecomeHawkeye: canHawkeye,
    hawkeyeMinLevel: HUMAN_FIGHTER_SECOND_PROFESSION_LEVEL,
    canBecomeSagittarius: canSagittarius,
    sagittariusMinLevel: HUMAN_FIGHTER_PRO_DREADNOUGHT_LEVEL,
    messageUk,
  };
}
