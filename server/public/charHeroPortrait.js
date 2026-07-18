/**
 * Спільний рендер героя на сцені (char.html + character.html).
 */
(function (global) {
  function heroUrl(n) {
    return '/characters/hero_' + String(n).padStart(2, '0') + '.jpg';
  }

  function charPng(n) {
    return '/characters/photo_' + n + '_2026-07-13_10-22-46-removebg-preview.png';
  }

  function charPngWarlord(n) {
    return '/characters/photo_' + n + '_2026-07-13_13-06-13-removebg-preview.png';
  }

  function charPngDwarf(n) {
    return (
      '/characters/гном/photo_' +
      n +
      '_2026-07-13_10-24-36-removebg-preview.png'
    );
  }

  function charPngOrc(n) {
    return (
      '/characters/орк/photo_' +
      n +
      '_2026-07-13_10-25-16-removebg-preview.png'
    );
  }

  function charPngElf(n) {
    return (
      '/characters/светлий ельф/photo_' +
      n +
      '_2026-07-13_10-26-29-removebg-preview.png'
    );
  }

  function snapshotLevel(c) {
    var n = c && c.level != null ? Number(c.level) : 1;
    return isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }

  function normRace(race) {
    if (!race) return 'Human';
    var s = String(race).trim();
    if (/^dark\s*elf$/i.test(s)) return 'Dark Elf';
    return s;
  }

  /** Повний шлях до портрета в /characters (legacy fallback). */
  function portraitUrl(c) {
    if (!c) return heroUrl(2);
    var nm = c.name != null ? String(c.name).trim().toLowerCase() : '';
    if (nm === 'existence') return '/characters/admin.png';
    var race = normRace(c.race);
    var branch = c.classBranch != null ? String(c.classBranch).toLowerCase() : 'fighter';
    var mystic = branch === 'mystic';
    if (race === 'Human') return mystic ? heroUrl(12) : heroUrl(2);
    if (race === 'Elf') {
      if (mystic) {
        return c.gender === 'female' ? charPngElf(1) : charPngElf(2);
      }
      return c.gender === 'female'
        ? '/characters/светлий ельф/photo_2026-07-18_14-14-19-removebg-preview.png'
        : charPngElf(3);
    }
    if (race === 'Dark Elf') {
      return mystic ? heroUrl(5) : heroUrl(40);
    }
    if (race === 'Dwarf') {
      return c.gender === 'female' ? charPngDwarf(2) : charPngDwarf(1);
    }
    if (race === 'Orc') {
      return mystic
        ? c.gender === 'female'
          ? charPngOrc(3)
          : charPngOrc(6)
        : c.gender === 'female'
          ? charPngOrc(2)
          : charPngOrc(1);
    }
    return heroUrl(2);
  }

  /** Герой поверх сцени — ключ `l2Profession` або `race|branch|gender`. */
  var SCENE_HERO_OVERLAYS = {
    human_fighter: {
      url: '/characters/photo_2_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-m',
      blackKey: false,
    },
    human_rogue: {
      url: '/characters/photo_8_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-rogue-m',
      blackKey: false,
    },
    human_hawkeye: {
      url: charPng(15),
      skin: 'human-rogue-m',
      blackKey: false,
    },
    human_sagittarius: {
      url: charPng(34),
      skin: 'human-rogue-m',
      blackKey: false,
    },
    human_warrior: {
      url: '/characters/photo_7_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_knight: {
      url: '/characters/photo_7_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_dark_avenger: {
      url: charPng(14),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_paladin: {
      url: charPng(14),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_hell_knight: {
      url: charPng(36),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_phoenix_knight: {
      url: charPng(36),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_treasure_hunter: {
      url: charPng(46),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_adventurer: {
      url: charPng(52),
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_warlord: {
      url: charPngWarlord(1),
      skin: 'human-warlord-m',
      blackKey: false,
    },
    human_dreadnought: {
      url: charPngWarlord(7),
      skin: 'human-warlord-m',
      blackKey: false,
      portraitRaise: true,
    },
    human_gladiator: {
      url: charPng(13),
      skin: 'human-gladiator-m',
      blackKey: false,
    },
    human_duelist: {
      url: charPng(35),
      skin: 'human-gladiator-m',
      blackKey: false,
    },
    'human_fighter|female': {
      url: '/characters/photo_1_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warrior|female': {
      url: charPngWarlord(2),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_knight|female': {
      url: '/characters/photo_10_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_paladin|female': {
      url: charPng(17),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_dark_avenger|female': {
      url: charPng(17),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_hell_knight|female': {
      url: charPng(39),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_phoenix_knight|female': {
      url: charPng(39),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_treasure_hunter|female': {
      url: charPng(45),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_adventurer|female': {
      url: charPng(51),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warlord|female': {
      url: charPngWarlord(2),
      skin: 'human-warlord-f',
      blackKey: false,
    },
    'human_dreadnought|female': {
      url: charPngWarlord(8),
      skin: 'human-warlord-f',
      blackKey: false,
      portraitRaise: true,
    },
    'human_gladiator|female': {
      url: charPng(16),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_duelist|female': {
      url: charPng(37),
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_hawkeye|female': {
      url: '/characters/photo_18_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    'human_rogue|female': {
      url: '/characters/photo_9_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    'human_sagittarius|female': {
      url: charPng(38),
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    dwarf_fighter: {
      url: charPngDwarf(1),
      skin: 'dwarf-fighter-m',
      blackKey: false,
    },
    'dwarf_fighter|female': {
      url: charPngDwarf(2),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_scavenger: {
      url: charPngDwarf(4),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    dwarf_artisan: {
      url: charPngDwarf(4),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_scavenger|female': {
      url: charPngDwarf(3),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    'dwarf_artisan|female': {
      url: charPngDwarf(3),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_bounty_hunter: {
      url: charPngDwarf(5),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_bounty_hunter|female': {
      url: charPngDwarf(6),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_warsmith: {
      url: charPngDwarf(5),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_warsmith|female': {
      url: charPngDwarf(6),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_fortune_seeker: {
      url: charPngDwarf(11),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_fortune_seeker|female': {
      url: charPngDwarf(12),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_maestro: {
      url: charPngDwarf(11),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_maestro|female': {
      url: charPngDwarf(12),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    orc_fighter: {
      url: charPngOrc(1),
      skin: 'orc-fighter-m',
      blackKey: false,
    },
    orc_raider: {
      url: charPngOrc(5),
      skin: 'orc-raider-m',
      blackKey: false,
    },
    orc_monk: {
      url: charPngOrc(9),
      skin: 'orc-monk-m',
      blackKey: false,
    },
    orc_mage: {
      url: charPngOrc(6),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    orc_shaman: {
      url: charPngOrc(7),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    'orc_fighter|female': {
      url: charPngOrc(2),
      skin: 'orc-fighter-f',
      blackKey: false,
    },
    'orc_raider|female': {
      url: charPngOrc(4),
      skin: 'orc-raider-f',
      blackKey: false,
    },
    'orc_monk|female': {
      url: charPngOrc(10),
      skin: 'orc-monk-f',
      blackKey: false,
    },
    orc_destroyer: {
      url: charPngOrc(16),
      skin: 'orc-raider-m',
      blackKey: false,
    },
    orc_titan: {
      url: charPngOrc(32),
      skin: 'orc-raider-m',
      blackKey: false,
    },
    'orc_destroyer|female': {
      url: charPngOrc(14),
      skin: 'orc-raider-f',
      blackKey: false,
    },
    'orc_titan|female': {
      url: charPngOrc(33),
      skin: 'orc-raider-f',
      blackKey: false,
    },
    orc_tyrant: {
      url: charPngOrc(15),
      skin: 'orc-monk-m',
      blackKey: false,
    },
    orc_grand_khavatari: {
      url: charPngOrc(31),
      skin: 'orc-monk-m',
      blackKey: false,
    },
    'orc_tyrant|female': {
      url: charPngOrc(13),
      skin: 'orc-monk-f',
      blackKey: false,
    },
    'orc_grand_khavatari|female': {
      url: charPngOrc(34),
      skin: 'orc-monk-f',
      blackKey: false,
    },
    'orc_mage|female': {
      url: charPngOrc(3),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    'orc_shaman|female': {
      url: charPngOrc(8),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    orc_overlord: {
      url: charPngOrc(12),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    orc_warcryer: {
      url: charPngOrc(12),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    orc_dominator: {
      url: charPngOrc(29),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    orc_doomcryer: {
      url: charPngOrc(29),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    'orc_overlord|female': {
      url: charPngOrc(11),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    'orc_warcryer|female': {
      url: charPngOrc(11),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    'orc_dominator|female': {
      url: charPngOrc(28),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    'orc_doomcryer|female': {
      url: charPngOrc(28),
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    human_mage: {
      url: '/characters/photo_4_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-mage-m',
      blackKey: false,
    },
    human_wizard: {
      url: '/characters/photo_5_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_cleric: {
      url: '/characters/photo_5_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    'human_mage|female': {
      url: '/characters/photo_3_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-mage-f',
      blackKey: false,
    },
    'human_wizard|female': {
      url: '/characters/photo_6_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_cleric|female': {
      url: '/characters/photo_6_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    human_sorcerer: {
      url: charPng(11),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_necromancer: {
      url: charPng(11),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_warlock: {
      url: charPng(11),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_bishop: {
      url: charPng(11),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_prophet: {
      url: charPng(11),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_archmage: {
      url: charPng(41),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_soultaker: {
      url: charPng(41),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_arcana_lord: {
      url: charPng(41),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_cardinal: {
      url: charPng(41),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_hierophant: {
      url: charPng(41),
      skin: 'human-wizard-m',
      blackKey: false,
    },
    'human_sorcerer|female': {
      url: charPng(12),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_necromancer|female': {
      url: charPng(12),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_warlock|female': {
      url: charPng(12),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_bishop|female': {
      url: charPng(12),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_prophet|female': {
      url: charPng(12),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_archmage|female': {
      url: charPng(42),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_soultaker|female': {
      url: charPng(42),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_arcana_lord|female': {
      url: charPng(42),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_cardinal|female': {
      url: charPng(42),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_hierophant|female': {
      url: charPng(42),
      skin: 'human-wizard-f',
      blackKey: false,
    },
    dark_elf_mage: {
      url: heroUrl(5),
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
    'dark_elf_mage|female': {
      url: heroUrl(42),
      skin: 'dark-elf-mystic-f',
      blackKey: false,
    },
    dark_elf_dark_wizard: {
      url: heroUrl(41),
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
    'dark_elf_dark_wizard|female': {
      url: heroUrl(26),
      skin: 'dark-elf-mystic-f',
      blackKey: false,
    },
    dark_elf_shillien_oracle: {
      url: heroUrl(41),
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
    'dark_elf_shillien_oracle|female': {
      url: heroUrl(26),
      skin: 'dark-elf-mystic-f',
      blackKey: false,
    },
    elf_mage: {
      url: charPngElf(2),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_elven_wizard: {
      url: charPngElf(11),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_elven_oracle: {
      url: charPngElf(11),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_spellsinger: {
      url: charPngElf(21),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_elemental_summoner: {
      url: charPngElf(21),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_elven_elder: {
      url: charPngElf(21),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_mystic_muse: {
      url: charPngElf(41),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_elemental_master: {
      url: charPngElf(41),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    elf_evas_saint: {
      url: charPngElf(41),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    'elf_mage|female': {
      url: charPngElf(1),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_elven_wizard|female': {
      url: charPngElf(10),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_elven_oracle|female': {
      url: charPngElf(10),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_spellsinger|female': {
      url: charPngElf(20),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_elemental_summoner|female': {
      url: charPngElf(20),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_elven_elder|female': {
      url: charPngElf(20),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_mystic_muse|female': {
      url: charPngElf(51),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_elemental_master|female': {
      url: charPngElf(51),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    'elf_evas_saint|female': {
      url: charPngElf(51),
      skin: 'elf-mystic-f',
      blackKey: false,
    },
    dark_elf_fighter: {
      url: heroUrl(40),
      skin: 'dark-elf-fighter-m',
      blackKey: false,
    },
    'dark_elf_fighter|female': {
      url: heroUrl(40),
      skin: 'dark-elf-fighter-m',
      blackKey: false,
    },
    elf_fighter: {
      url: charPngElf(3),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_elven_knight: {
      url: charPngElf(5),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_temple_knight: {
      url: charPngElf(16),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_evas_templar: {
      url: charPngElf(46),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_swordsinger: {
      url: charPngElf(13),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_sword_muse: {
      url: '/characters/светлий ельф/4514511.png',
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_elven_scout: {
      url: charPngElf(4),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_silver_ranger: {
      url: charPngElf(12),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_moonlight_sentinel: {
      url: charPngElf(43),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_plainswalker: {
      url: charPngElf(14),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    elf_wind_rider: {
      url: charPngElf(45),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    'elf_fighter|female': {
      url: '/characters/светлий ельф/photo_2026-07-18_14-14-19-removebg-preview.png',
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_elven_knight|female': {
      url: charPngElf(8),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_temple_knight|female': {
      url: charPngElf(19),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_evas_templar|female': {
      url: charPngElf(49),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_swordsinger|female': {
      url: charPngElf(17),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_sword_muse|female': {
      url: charPngElf(50),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_elven_scout|female': {
      url: charPngElf(7),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_silver_ranger|female': {
      url: charPngElf(15),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_moonlight_sentinel|female': {
      url: charPngElf(47),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_plainswalker|female': {
      url: charPngElf(18),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'elf_wind_rider|female': {
      url: charPngElf(48),
      skin: 'elf-fighter-f',
      blackKey: false,
    },
    'dark-elf|mystic|male': {
      url: heroUrl(5),
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
  };

  var HUMAN_WARLORD_BRANCH_FEMALE_LEVELS = {
    female: [
      { minLevel: 62, url: charPngWarlord(6) },
      { minLevel: 52, url: charPngWarlord(3) },
    ],
  };

  var HUMAN_MYSTIC_SECOND_PROF_LEVELS = {
    male: [
      { minLevel: 62, url: charPng(43) },
      { minLevel: 52, url: charPng(25) },
    ],
    female: [
      { minLevel: 62, url: charPng(44) },
      { minLevel: 52, url: charPng(26) },
    ],
  };

  /** Світлий ельф 2 профа (Plainswalker): 52+ → photo_28/24, 62+ → photo_39/37. */
  var ELF_PLAINSWALKER_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngElf(39) },
      { minLevel: 52, url: charPngElf(28) },
    ],
    female: [
      { minLevel: 62, url: charPngElf(37) },
      { minLevel: 52, url: charPngElf(24) },
    ],
  };

  /** Світлий ельф 2 профа (Silver Ranger): 52+ → photo_26/22, 62+ → photo_42/34. */
  var ELF_RANGER_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngElf(42) },
      { minLevel: 52, url: charPngElf(26) },
    ],
    female: [
      { minLevel: 62, url: charPngElf(34) },
      { minLevel: 52, url: charPngElf(22) },
    ],
  };

  /** Світлий ельф 2 профа (Swordsinger): 52+ → photo_29/25, 62+ → photo_38/35. */
  var ELF_SWORDSINGER_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngElf(38) },
      { minLevel: 52, url: charPngElf(29) },
    ],
    female: [
      { minLevel: 62, url: charPngElf(35) },
      { minLevel: 52, url: charPngElf(25) },
    ],
  };

  /** Світлий ельф 2 профа (Temple Knight): 52+ → photo_27/23, 62+ → photo_40/36. */
  var ELF_KNIGHT_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngElf(40) },
      { minLevel: 52, url: charPngElf(27) },
    ],
    female: [
      { minLevel: 62, url: charPngElf(36) },
      { minLevel: 52, url: charPngElf(23) },
    ],
  };

  /** Світлий ельф 2 профа (маги): 52+ → photo_30/31, 62+ → photo_33/32. */
  var ELF_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngElf(33) },
      { minLevel: 52, url: charPngElf(30) },
    ],
    female: [
      { minLevel: 62, url: charPngElf(32) },
      { minLevel: 52, url: charPngElf(31) },
    ],
  };

  /** Орк 2 профа (Tyrant): 52+ → photo_19 / photo_2026-07-18, 62+ → photo_25/24. */
  var ORC_MONK_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngOrc(25) },
      { minLevel: 52, url: charPngOrc(19) },
    ],
    female: [
      { minLevel: 62, url: charPngOrc(24) },
      {
        minLevel: 52,
        url: '/characters/орк/photo_2026-07-18_14-03-18-removebg-preview.png',
      },
    ],
  };

  /** Орк 2 профа (Destroyer): 52+ → photo_20/21, 62+ → photo_26/27. */
  var ORC_FIGHTER_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngOrc(26) },
      { minLevel: 52, url: charPngOrc(20) },
    ],
    female: [
      { minLevel: 62, url: charPngOrc(27) },
      { minLevel: 52, url: charPngOrc(21) },
    ],
  };

  /** Орк 2 профа (Overlord / Warcryer): 52+ → photo_18/17, 62+ → photo_22/23. */
  var ORC_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngOrc(22) },
      { minLevel: 52, url: charPngOrc(18) },
    ],
    female: [
      { minLevel: 62, url: charPngOrc(23) },
      { minLevel: 52, url: charPngOrc(17) },
    ],
  };

  /** Гном 1–2 профа: 52+ → photo_7/8, 62+ → photo_10/9. */
  var DWARF_PROF_LEVEL_PORTRAITS = {
    male: [
      { minLevel: 62, url: charPngDwarf(10) },
      { minLevel: 52, url: charPngDwarf(7) },
    ],
    female: [
      { minLevel: 62, url: charPngDwarf(9) },
      { minLevel: 52, url: charPngDwarf(8) },
    ],
  };

  /** Гном 3 профа: Fortune Seeker / Maestro — photo_11/12 (без перекриття 52/62). */
  var DWARF_THIRD_PROF_LEVEL_PORTRAITS = {
    male: [{ minLevel: 76, url: charPngDwarf(11) }],
    female: [{ minLevel: 76, url: charPngDwarf(12) }],
  };

  /**
   * Портрет за рівнем (вищий minLevel перевіряється першим).
   * Ключ — точний l2Profession зі snapshot.
   */
  var HERO_PORTRAIT_LEVEL_RULES = {
    dwarf_scavenger: DWARF_PROF_LEVEL_PORTRAITS,
    dwarf_artisan: DWARF_PROF_LEVEL_PORTRAITS,
    dwarf_bounty_hunter: DWARF_PROF_LEVEL_PORTRAITS,
    dwarf_warsmith: DWARF_PROF_LEVEL_PORTRAITS,
    dwarf_fortune_seeker: DWARF_THIRD_PROF_LEVEL_PORTRAITS,
    dwarf_maestro: DWARF_THIRD_PROF_LEVEL_PORTRAITS,
    human_hawkeye: {
      male: [
        { minLevel: 62, url: charPng(27) },
        { minLevel: 52, url: charPng(19) },
      ],
      female: [
        { minLevel: 62, url: charPng(30) },
        { minLevel: 52, url: charPng(24) },
      ],
    },
    human_treasure_hunter: {
      male: [
        { minLevel: 62, url: charPng(50) },
        { minLevel: 52, url: charPng(47) },
      ],
      female: [
        { minLevel: 62, url: charPng(49) },
        { minLevel: 52, url: charPng(48) },
      ],
    },
    human_gladiator: {
      male: [
        { minLevel: 62, url: charPng(28) },
        { minLevel: 52, url: charPng(20) },
      ],
      female: [
        { minLevel: 62, url: charPng(32) },
        { minLevel: 52, url: charPng(22) },
      ],
    },
    human_paladin: {
      male: [
        { minLevel: 62, url: charPng(29) },
        { minLevel: 52, url: charPng(21) },
      ],
      female: [
        { minLevel: 62, url: charPng(31) },
        { minLevel: 52, url: charPng(23) },
      ],
    },
    human_dark_avenger: {
      male: [
        { minLevel: 62, url: charPng(29) },
        { minLevel: 52, url: charPng(21) },
      ],
      female: [
        { minLevel: 62, url: charPng(31) },
        { minLevel: 52, url: charPng(23) },
      ],
    },
    human_sorcerer: HUMAN_MYSTIC_SECOND_PROF_LEVELS,
    human_necromancer: HUMAN_MYSTIC_SECOND_PROF_LEVELS,
    human_warlock: HUMAN_MYSTIC_SECOND_PROF_LEVELS,
    human_bishop: HUMAN_MYSTIC_SECOND_PROF_LEVELS,
    human_prophet: HUMAN_MYSTIC_SECOND_PROF_LEVELS,
    human_warlord: {
      male: [
        { minLevel: 62, url: charPngWarlord(5) },
        { minLevel: 52, url: charPngWarlord(4) },
      ],
      female: HUMAN_WARLORD_BRANCH_FEMALE_LEVELS.female,
    },
    human_warrior: {
      female: HUMAN_WARLORD_BRANCH_FEMALE_LEVELS.female,
    },
    orc_overlord: ORC_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS,
    orc_warcryer: ORC_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS,
    orc_destroyer: ORC_FIGHTER_SECOND_PROF_LEVEL_PORTRAITS,
    orc_tyrant: ORC_MONK_SECOND_PROF_LEVEL_PORTRAITS,
    elf_spellsinger: ELF_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS,
    elf_elemental_summoner: ELF_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS,
    elf_elven_elder: ELF_MYSTIC_SECOND_PROF_LEVEL_PORTRAITS,
    elf_temple_knight: ELF_KNIGHT_SECOND_PROF_LEVEL_PORTRAITS,
    elf_swordsinger: ELF_SWORDSINGER_SECOND_PROF_LEVEL_PORTRAITS,
    elf_silver_ranger: ELF_RANGER_SECOND_PROF_LEVEL_PORTRAITS,
    elf_plainswalker: ELF_PLAINSWALKER_SECOND_PROF_LEVEL_PORTRAITS,
  };

  /** 2–3 профа гілки — та сама картинка, що на базовій 2-й (або 1-й для rogue/luk). */
  var SCENE_HERO_PROF_ALIAS = {
    dark_elf_phantom_summoner: 'dark_elf_dark_wizard',
    dark_elf_spellhowler: 'dark_elf_dark_wizard',
    dark_elf_shillien_elder: 'dark_elf_shillien_oracle',
    dark_elf_spectral_master: 'dark_elf_phantom_summoner',
    dark_elf_storm_screamer: 'dark_elf_spellhowler',
    dark_elf_shillien_saint: 'dark_elf_shillien_elder',
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
  };

  var HERO_BG_SKIN_PREFIX = 'l2-char-equip-bg--hero-';

  function snapshotGender(c) {
    return c && c.gender === 'female' ? 'female' : 'male';
  }

  function sceneHeroOverlayLookupKey(prof, gender) {
    if (gender === 'female') {
      var femKey = prof + '|female';
      if (SCENE_HERO_OVERLAYS[femKey]) return femKey;
    }
    return prof;
  }

  function sceneHeroLegacyKey(c) {
    if (!c) return null;
    var race = normRace(c.race);
    var branch = c.classBranch != null ? String(c.classBranch).toLowerCase() : 'fighter';
    if (race === 'Dark Elf' && branch === 'mystic') return 'dark_elf_mage';
    if (race === 'Dark Elf' && branch === 'fighter') return 'dark_elf_fighter';
    if (race === 'Elf' && branch === 'mystic') return 'elf_mage';
    if (race === 'Elf' && branch === 'fighter') return 'elf_fighter';
    if (race === 'Dwarf' && branch === 'fighter') return 'dwarf_fighter';
    if (race === 'Orc' && branch === 'fighter') return 'orc_fighter';
    if (race === 'Orc' && branch === 'mystic') return 'orc_mage';
    return null;
  }

  function applyLevelPortraitUrl(c, overlay, prof) {
    if (!overlay || !prof) return overlay;
    var rules = HERO_PORTRAIT_LEVEL_RULES[prof];
    if (!rules) return overlay;
    var gender = snapshotGender(c);
    var tiers = rules[gender] || rules.male;
    if (!tiers || !tiers.length) return overlay;
    var level = snapshotLevel(c);
    var url = overlay.url;
    var portraitTier = null;
    for (var i = 0; i < tiers.length; i++) {
      if (level >= tiers[i].minLevel) {
        url = tiers[i].url;
        portraitTier = String(tiers[i].minLevel);
        break;
      }
    }
    return {
      url: url,
      skin: overlay.skin,
      blackKey: overlay.blackKey,
      portraitTier: portraitTier,
      portraitRaise: overlay.portraitRaise,
    };
  }

  function resolveSceneHeroOverlay(c) {
    if (!c) return null;
    var gender = snapshotGender(c);
    var profRaw = c.l2Profession != null ? String(c.l2Profession).trim() : '';
    /** Спочатку prof|female до alias (hawkeye ≠ rogue на жіночих артах). */
    var directKey = sceneHeroOverlayLookupKey(profRaw, gender);
    if (directKey && SCENE_HERO_OVERLAYS[directKey]) {
      return applyLevelPortraitUrl(c, SCENE_HERO_OVERLAYS[directKey], profRaw);
    }
    var prof = profRaw;
    if (prof && SCENE_HERO_PROF_ALIAS[prof]) prof = SCENE_HERO_PROF_ALIAS[prof];
    var key = sceneHeroOverlayLookupKey(prof, gender);
    if (key && SCENE_HERO_OVERLAYS[key]) {
      return applyLevelPortraitUrl(c, SCENE_HERO_OVERLAYS[key], profRaw);
    }
    var legacy = sceneHeroLegacyKey(c);
    if (!legacy) return null;
    key = sceneHeroOverlayLookupKey(legacy, gender);
    if (!key || !SCENE_HERO_OVERLAYS[key]) return null;
    return applyLevelPortraitUrl(c, SCENE_HERO_OVERLAYS[key], profRaw);
  }

  function clearHeroBgSkins(bg) {
    if (!bg || !bg.classList) return;
    var cl = bg.classList;
    for (var i = cl.length - 1; i >= 0; i--) {
      var name = cl[i];
      if (name.indexOf(HERO_BG_SKIN_PREFIX) === 0) cl.remove(name);
    }
  }

  function renderPortrait(c, opts) {
    opts = opts || {};
    var img = opts.imgId ? document.getElementById(opts.imgId) : document.getElementById('char-hero-img');
    var stage = opts.stageId ? document.getElementById(opts.stageId) : document.getElementById('char-hero-stage');
    var bg = opts.bgSelector ? document.querySelector(opts.bgSelector) : document.querySelector('.l2-char-equip-bg');
    if (!img) return;
    var overlay = resolveSceneHeroOverlay(c);
    img.dataset.portraitUrl = portraitUrl(c);
    clearHeroBgSkins(bg);
    img.classList.remove('l2-char-equip-hero-overlay--black-key');
    if (!overlay || !overlay.url) {
      img.hidden = true;
      img.removeAttribute('src');
      img.onerror = null;
      img.alt = '';
      img.removeAttribute('data-hero-portrait-tier');
      img.removeAttribute('data-hero-portrait-raised');
      if (stage) stage.hidden = true;
      return;
    }
    img.onerror = function () {
      img.onerror = null;
      var fallback = portraitUrl(c);
      if (fallback && img.getAttribute('src') !== fallback) {
        img.src = fallback;
        img.hidden = false;
        if (stage) stage.hidden = false;
        return;
      }
      img.hidden = true;
      img.removeAttribute('src');
      if (stage) stage.hidden = true;
      clearHeroBgSkins(bg);
      img.classList.remove('l2-char-equip-hero-overlay--black-key');
    };
    img.src = overlay.url;
    img.hidden = false;
    img.alt = 'Герой';
    if (overlay.portraitTier) img.dataset.heroPortraitTier = overlay.portraitTier;
    else img.removeAttribute('data-hero-portrait-tier');
    if (overlay.portraitRaise) img.dataset.heroPortraitRaised = '1';
    else img.removeAttribute('data-hero-portrait-raised');
    if (overlay.blackKey) img.classList.add('l2-char-equip-hero-overlay--black-key');
    if (stage) stage.hidden = false;
    if (bg) {
      bg.classList.add(HERO_BG_SKIN_PREFIX + 'on-stairs');
      if (overlay.skin) bg.classList.add(HERO_BG_SKIN_PREFIX + overlay.skin);
    }
  }


  global.L2CharHero = { renderPortrait: renderPortrait };
})(window);
