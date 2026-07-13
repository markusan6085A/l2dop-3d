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
    if (race === 'Elf') return mystic ? heroUrl(42) : heroUrl(28);
    if (race === 'Dark Elf') {
      return mystic ? heroUrl(5) : heroUrl(40);
    }
    if (race === 'Dwarf') return heroUrl(24);
    if (race === 'Orc') return mystic ? heroUrl(17) : heroUrl(15);
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
      url: '/characters/photo_14_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_paladin: {
      url: '/characters/photo_14_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_treasure_hunter: {
      url: '/characters/photo_46_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_warlord: {
      url: heroUrl(2),
      skin: 'human-warlord-m',
      blackKey: false,
    },
    human_gladiator: {
      url: '/characters/photo_13_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-gladiator-m',
      blackKey: false,
    },
    'human_fighter|female': {
      url: '/characters/photo_1_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warrior|female': {
      url: '/characters/photo_10_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_knight|female': {
      url: '/characters/photo_10_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_paladin|female': {
      url: '/characters/photo_17_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_dark_avenger|female': {
      url: '/characters/photo_17_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_treasure_hunter|female': {
      url: '/characters/photo_45_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warlord|female': {
      url: heroUrl(9),
      skin: 'human-warlord-f',
      blackKey: false,
    },
    'human_gladiator|female': {
      url: '/characters/photo_16_2026-07-13_10-22-46-removebg-preview.png',
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
      url: heroUrl(24),
      skin: 'dwarf-fighter-m',
      blackKey: false,
    },
    'dwarf_fighter|female': {
      url: heroUrl(23),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_scavenger: {
      url: heroUrl(26),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    dwarf_artisan: {
      url: heroUrl(26),
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_scavenger|female': {
      url: heroUrl(25),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    'dwarf_artisan|female': {
      url: heroUrl(25),
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    orc_fighter: {
      url: heroUrl(15),
      skin: 'orc-fighter-m',
      blackKey: false,
    },
    orc_raider: {
      url: heroUrl(19),
      skin: 'orc-raider-m',
      blackKey: false,
    },
    orc_monk: {
      url: heroUrl(21),
      skin: 'orc-monk-m',
      blackKey: false,
    },
    orc_mage: {
      url: heroUrl(17),
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    'orc_fighter|female': {
      url: heroUrl(16),
      skin: 'orc-fighter-f',
      blackKey: false,
    },
    'orc_raider|female': {
      url: heroUrl(22),
      skin: 'orc-raider-f',
      blackKey: false,
    },
    'orc_monk|female': {
      url: heroUrl(20),
      skin: 'orc-monk-f',
      blackKey: false,
    },
    'orc_mage|female': {
      url: heroUrl(18),
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
      url: '/characters/photo_11_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_necromancer: {
      url: '/characters/photo_11_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_warlock: {
      url: '/characters/photo_11_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_bishop: {
      url: '/characters/photo_11_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_prophet: {
      url: '/characters/photo_11_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    'human_sorcerer|female': {
      url: '/characters/photo_12_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_necromancer|female': {
      url: '/characters/photo_12_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_warlock|female': {
      url: '/characters/photo_12_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_bishop|female': {
      url: '/characters/photo_12_2026-07-13_10-22-46-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_prophet|female': {
      url: '/characters/photo_12_2026-07-13_10-22-46-removebg-preview.png',
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
      url: heroUrl(42),
      skin: 'elf-mystic-m',
      blackKey: false,
    },
    'elf_mage|female': {
      url: heroUrl(42),
      skin: 'elf-mystic-m',
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
      url: heroUrl(28),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    'elf_fighter|female': {
      url: heroUrl(28),
      skin: 'elf-fighter-m',
      blackKey: false,
    },
    'dark-elf|mystic|male': {
      url: heroUrl(5),
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
  };

  /**
   * Портрет за рівнем (вищий minLevel перевіряється першим).
   * Ключ — точний l2Profession зі snapshot.
   */
  var HERO_PORTRAIT_LEVEL_RULES = {
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
  };

  /** 2–3 профа гілки — та сама картинка, що на базовій 2-й (або 1-й для rogue/luk). */
  var SCENE_HERO_PROF_ALIAS = {
    human_dreadnought: 'human_warlord',
    human_duelist: 'human_gladiator',
    human_adventurer: 'human_treasure_hunter',
    human_hell_knight: 'human_dark_avenger',
    human_phoenix_knight: 'human_paladin',
    human_sorcerer: 'human_wizard',
    human_necromancer: 'human_wizard',
    human_warlock: 'human_wizard',
    human_archmage: 'human_wizard',
    human_soultaker: 'human_wizard',
    human_arcana_lord: 'human_wizard',
    human_bishop: 'human_cleric',
    human_prophet: 'human_cleric',
    human_cardinal: 'human_cleric',
    human_hierophant: 'human_cleric',
    dwarf_bounty_hunter: 'dwarf_scavenger',
    dwarf_fortune_seeker: 'dwarf_scavenger',
    dwarf_warsmith: 'dwarf_artisan',
    dwarf_maestro: 'dwarf_artisan',
    orc_destroyer: 'orc_raider',
    orc_tyrant: 'orc_monk',
    orc_titan: 'orc_raider',
    orc_grand_khavatari: 'orc_monk',
    orc_shaman: 'orc_mage',
    orc_overlord: 'orc_mage',
    orc_warcryer: 'orc_mage',
    orc_dominator: 'orc_mage',
    orc_doomcryer: 'orc_mage',
    elf_elven_wizard: 'elf_mage',
    elf_elven_oracle: 'elf_mage',
    elf_elemental_summoner: 'elf_elven_wizard',
    elf_spellsinger: 'elf_elven_wizard',
    elf_elven_elder: 'elf_elven_oracle',
    elf_elemental_master: 'elf_elemental_summoner',
    elf_mystic_muse: 'elf_spellsinger',
    elf_evas_saint: 'elf_elven_elder',
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
    elf_elven_scout: 'elf_fighter',
    elf_elven_knight: 'elf_fighter',
    elf_temple_knight: 'elf_elven_knight',
    elf_swordsinger: 'elf_elven_knight',
    elf_plainswalker: 'elf_elven_scout',
    elf_silver_ranger: 'elf_elven_scout',
    elf_evas_templar: 'elf_temple_knight',
    elf_sword_muse: 'elf_swordsinger',
    elf_wind_rider: 'elf_plainswalker',
    elf_moonlight_sentinel: 'elf_silver_ranger',
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
    for (var i = 0; i < tiers.length; i++) {
      if (level >= tiers[i].minLevel) {
        url = tiers[i].url;
        break;
      }
    }
    return {
      url: url,
      skin: overlay.skin,
      blackKey: overlay.blackKey,
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
    if (overlay.blackKey) img.classList.add('l2-char-equip-hero-overlay--black-key');
    if (stage) stage.hidden = false;
    if (bg) {
      bg.classList.add(HERO_BG_SKIN_PREFIX + 'on-stairs');
      if (overlay.skin) bg.classList.add(HERO_BG_SKIN_PREFIX + overlay.skin);
    }
  }


  global.L2CharHero = { renderPortrait: renderPortrait };
})(window);
