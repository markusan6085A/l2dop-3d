/**
 * Спільний рендер героя на сцені (char.html + character.html).
 */
(function (global) {
  function normRace(race) {
    if (!race) return 'Human';
    var s = String(race).trim();
    if (/^dark\s*elf$/i.test(s)) return 'Dark Elf';
    return s;
  }

  /** Повний шлях до портрета в /characters (legacy fallback). */
  function portraitUrl(c) {
    if (!c) return '/characters/Human-voin.jpg';
    var nm = c.name != null ? String(c.name).trim().toLowerCase() : '';
    if (nm === 'existence') return '/characters/admin.png';
    var race = normRace(c.race);
    var branch = c.classBranch != null ? String(c.classBranch).toLowerCase() : 'fighter';
    var mystic = branch === 'mystic';
    if (race === 'Human') return mystic ? '/characters/Human-mistsk.jpg' : '/characters/Human-voin.jpg';
    if (race === 'Elf') return mystic ? '/characters/Elf-mag.jpg' : '/characters/Elf-voin.jpg';
    if (race === 'Dark Elf') return mystic ? '/characters/Dark_Elf_mag.jpg' : '/characters/Dark_Elf-voinn.jpg';
    if (race === 'Dwarf') return '/characters/Dwarf_voin.jpg';
    if (race === 'Orc') return mystic ? '/characters/Orc_mag.jpg' : '/characters/Orc_voinn.jpg';
    return '/characters/Human-voin.jpg';
  }

  /** Герой поверх сцени — ключ `l2Profession` або `race|branch|gender`. */
  var SCENE_HERO_OVERLAYS = {
    human_fighter: {
      url: '/characters/photo_5_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-m',
      blackKey: false,
    },
    human_rogue: {
      url: '/characters/photo_4_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-rogue-m',
      blackKey: false,
    },
    human_warrior: {
      url: '/characters/photo_3_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_knight: {
      url: '/characters/photo_3_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_dark_avenger: {
      url: '/characters/photo_3_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_paladin: {
      url: '/characters/photo_3_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_treasure_hunter: {
      url: '/characters/photo_3_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warrior-m',
      blackKey: false,
    },
    human_warlord: {
      url: '/characters/photo_2_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warlord-m',
      blackKey: false,
    },
    human_gladiator: {
      url: '/characters/photo_1_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-gladiator-m',
      blackKey: false,
    },
    'human_fighter|female': {
      url: '/characters/photo_6_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warrior|female': {
      url: '/characters/photo_8_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_knight|female': {
      url: '/characters/photo_8_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_paladin|female': {
      url: '/characters/photo_8_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_dark_avenger|female': {
      url: '/characters/photo_8_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_treasure_hunter|female': {
      url: '/characters/photo_8_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_warlord|female': {
      url: '/characters/photo_9_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-warlord-f',
      blackKey: false,
    },
    'human_gladiator|female': {
      url: '/characters/photo_7_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-fighter-f',
      blackKey: false,
    },
    'human_hawkeye|female': {
      url: '/characters/photo_10_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    'human_rogue|female': {
      url: '/characters/photo_10_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    'human_sagittarius|female': {
      url: '/characters/photo_10_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-hawkeye-f',
      blackKey: false,
    },
    dwarf_fighter: {
      url: '/characters/photo_24_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-fighter-m',
      blackKey: false,
    },
    'dwarf_fighter|female': {
      url: '/characters/photo_23_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    dwarf_scavenger: {
      url: '/characters/photo_26_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    dwarf_artisan: {
      url: '/characters/photo_26_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-scavenger-m',
      blackKey: false,
    },
    'dwarf_scavenger|female': {
      url: '/characters/photo_25_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    'dwarf_artisan|female': {
      url: '/characters/photo_25_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'dwarf-fighter-f',
      blackKey: false,
    },
    orc_fighter: {
      url: '/characters/photo_15_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-fighter-m',
      blackKey: false,
    },
    orc_raider: {
      url: '/characters/photo_19_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-raider-m',
      blackKey: false,
    },
    orc_monk: {
      url: '/characters/photo_21_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-monk-m',
      blackKey: false,
    },
    orc_mage: {
      url: '/characters/photo_17_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-mystic-m',
      blackKey: false,
    },
    'orc_fighter|female': {
      url: '/characters/photo_16_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-fighter-f',
      blackKey: false,
    },
    'orc_raider|female': {
      url: '/characters/photo_22_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-raider-f',
      blackKey: false,
    },
    'orc_monk|female': {
      url: '/characters/photo_20_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-monk-f',
      blackKey: false,
    },
    'orc_mage|female': {
      url: '/characters/photo_18_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'orc-mystic-f',
      blackKey: false,
    },
    human_mage: {
      url: '/characters/photo_12_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-mage-m',
      blackKey: false,
    },
    human_wizard: {
      url: '/characters/photo_14_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    human_cleric: {
      url: '/characters/photo_14_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-wizard-m',
      blackKey: false,
    },
    'human_mage|female': {
      url: '/characters/photo_11_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-mage-f',
      blackKey: false,
    },
    'human_wizard|female': {
      url: '/characters/photo_13_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'human_cleric|female': {
      url: '/characters/photo_13_2026-07-05_18-17-32-removebg-preview.png',
      skin: 'human-wizard-f',
      blackKey: false,
    },
    'dark-elf|mystic|male': {
      url: '/characters/photo_2026-07-05_14-45-08-removebg-preview.png',
      skin: 'dark-elf-mystic-m',
      blackKey: false,
    },
  };

  /** 2–3 профа гілки — та сама картинка, що на базовій 2-й (або 1-й для rogue/luk). */
  var SCENE_HERO_PROF_ALIAS = {
    human_dreadnought: 'human_warlord',
    human_duelist: 'human_gladiator',
    human_adventurer: 'human_treasure_hunter',
    human_hell_knight: 'human_dark_avenger',
    human_phoenix_knight: 'human_paladin',
    human_hawkeye: 'human_rogue',
    human_sagittarius: 'human_rogue',
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
    if (race === 'Dark Elf' && branch === 'mystic') return 'dark-elf|mystic|male';
    return null;
  }

  function resolveSceneHeroOverlay(c) {
    if (!c) return null;
    var gender = snapshotGender(c);
    var profRaw = c.l2Profession != null ? String(c.l2Profession).trim() : '';
    /** Спочатку prof|female до alias (hawkeye ≠ rogue на жіночих артах). */
    var directKey = sceneHeroOverlayLookupKey(profRaw, gender);
    if (directKey && SCENE_HERO_OVERLAYS[directKey]) return SCENE_HERO_OVERLAYS[directKey];
    var prof = profRaw;
    if (prof && SCENE_HERO_PROF_ALIAS[prof]) prof = SCENE_HERO_PROF_ALIAS[prof];
    var key = sceneHeroOverlayLookupKey(prof, gender);
    if (key && SCENE_HERO_OVERLAYS[key]) return SCENE_HERO_OVERLAYS[key];
    var legacy = sceneHeroLegacyKey(c);
    if (!legacy) return null;
    key = sceneHeroOverlayLookupKey(legacy, gender);
    return key && SCENE_HERO_OVERLAYS[key] ? SCENE_HERO_OVERLAYS[key] : null;
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
