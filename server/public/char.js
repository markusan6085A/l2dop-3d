/**
 * Перс — сумка (POST /character/equip). Портрет і слоти як у text-rpg CharacterEquipmentFrame.
 */
(function () {
  var RACE_UK = {
    Human: 'Людина',
    'Dark Elf': 'Темний ельф',
    Elf: 'Ельф',
    Orc: 'Орк',
    Dwarf: 'Гном',
  };

  function pctFromMulUk(mul) {
    var p = Math.round((Number(mul) - 1) * 100);
    return (p >= 0 ? '+' : '') + p + '%';
  }

  function itemDisplayName(id) {
    var n = window.L2 && L2.itemNameById && L2.itemNameById[id];
    return n != null ? n : '#' + id;
  }

  function fallbackIconForId(id) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[id];
    if (sl === 'chest') return '/assets/items/drops/armor_d/armor_leather_uk_u_i00.png';
    if (sl === 'legs') return '/assets/items/drops/armor_d/armor_leather_uk_l_i00.png';
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') {
      return '/icons/drops/equipment.svg';
    }
    return '/icons/drops/other.svg';
  }

  /** Іконка: спочатку з каталогу GM, інакше `/game/item-icon` (jpg з l2dop або SVG-заглушка). */
  function itemIconUrlForId(id) {
    if (window.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(id, '/icons/drops/other.svg');
    }
    if (id > 0) return '/game/item-icon/' + id;
    return '/icons/drops/other.svg';
  }

  function setItemIconSrc(img, itemId) {
    if (!img) return;
    img.decoding = 'async';
    img.src = itemIconUrlForId(itemId);
    img.onerror = function () {
      img.onerror = null;
      img.src = fallbackIconForId(itemId);
    };
  }

  function itemStatsLine(id) {
    var st = window.L2 && L2.itemStatsById && L2.itemStatsById[id];
    if (!st || typeof st !== 'object') return '';
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[id];
    var hasJewelAuthor =
      st.jewelMdefFlat != null ||
      st.jewelMaxHp != null ||
      st.jewelMaxMp != null ||
      (st.jewelAcc != null && Number(st.jewelAcc) > 0) ||
      (st.jewelEva != null && Number(st.jewelEva) > 0) ||
      (st.jewelMpRegenMul != null && Number(st.jewelMpRegenMul) > 1) ||
      (st.jewelHoldResistMul != null && Number(st.jewelHoldResistMul) > 1);
    var isJewel =
      sl === 'ring' ||
      sl === 'neck' ||
      sl === 'earring' ||
      hasJewelAuthor;
    var parts = [];
    if (st.pAtk != null) parts.push('P.Atk ' + st.pAtk);
    if (isJewel) {
      var mdef = st.jewelMdefFlat != null ? st.jewelMdefFlat : st.jewelryMAtk != null ? st.jewelryMAtk : st.mAtk;
      if (mdef != null) parts.push('M.Def ' + mdef);
      if (st.jewelMaxHp != null) parts.push('HP +' + st.jewelMaxHp);
      if (st.jewelMaxMp != null) parts.push('MP +' + st.jewelMaxMp);
      if (st.jewelAcc != null) parts.push('Точн. +' + st.jewelAcc);
      if (st.jewelEva != null) parts.push('Ухил. +' + st.jewelEva);
      if (st.jewelMpRegenMul != null && st.jewelMpRegenMul > 1) {
        parts.push('Реген MP ' + pctFromMulUk(st.jewelMpRegenMul));
      }
      if (st.jewelHoldResistMul != null && st.jewelHoldResistMul > 1) {
        parts.push('Стійк. утрим. ' + pctFromMulUk(st.jewelHoldResistMul));
      }
      if (st.pDef != null) parts.push('P.Def ' + st.pDef);
    } else {
      if (st.mAtk != null) parts.push('M.Atk ' + st.mAtk);
      if (st.pDef != null) parts.push('P.Def ' + st.pDef);
    }
    if (st.atkSpd != null) parts.push('Скор. ' + st.atkSpd);
    if (st.wpnCrit != null) parts.push('Крит (база) ' + st.wpnCrit);
    if (st.rCrit != null && Number(st.rCrit) > 0) {
      parts.push('Шанс крит +' + String(st.rCrit));
    }
    return parts.length ? parts.join(' · ') : '';
  }

  /** Дефолтні іконки слотів (як SLOT_ICONS у text-rpg) */
  var SLOT_ICON_DEFAULT = {
    head: '/icons/slot_head.png',
    armor: '/icons/slot_armor.png',
    legs: '/icons/slot_legs.png',
    gloves: '/icons/slot_gloves.png',
    boots: '/icons/slot_boots.png',
    belt: '/icons/slot_belt.png',
    weapon: '/icons/slot_weapon.png',
    shield: '/icons/slot_shield.png',
    jewelry: '/icons/slot_jewelry.png',
    necklace: '/icons/slot_necklace.png',
    earring_left: '/icons/slot_earring_left.png',
    earring_right: '/icons/slot_earring_right.png',
    ring_left: '/icons/slot_ring_left.png',
    ring_right: '/icons/slot_ring_right.png',
    tattoo: '/icons/slot_tattoo.png',
    cloak: '/icons/slot_cloak.png',
  };

  /** server/src/data/inventory.eq: l1, lh, l3, l4, lg, lf; lr/le/neck — біжутерія */
  var EQ_SLOT_TO_UI = [
    { key: 'l1', ui: 'weapon' },
    { key: 'l2', ui: 'shield' },
    { key: 'lh', ui: 'head' },
    { key: 'l3', ui: 'armor' },
    { key: 'l4', ui: 'legs' },
    { key: 'lg', ui: 'gloves' },
    { key: 'lf', ui: 'boots' },
    { key: 'neck', ui: 'necklace' },
    { key: 'lr1', ui: 'ring_left' },
    { key: 'lr2', ui: 'ring_right' },
    { key: 'le1', ui: 'earring_left' },
    { key: 'le2', ui: 'earring_right' },
  ];

  function eqItemId(slotVal) {
    if (slotVal == null) return null;
    if (typeof slotVal === 'number' && slotVal > 0) return slotVal;
    if (typeof slotVal === 'object' && slotVal.itemId != null) {
      var n = Number(slotVal.itemId);
      return Number.isFinite(n) && n > 0 ? n : null;
    }
    return null;
  }

  function gradeLabelForItem(id) {
    var g = window.L2 && L2.itemGradeById && L2.itemGradeById[id];
    if (g != null && String(g).trim() !== '') return String(g);
    return '—';
  }

  var revision = 0;
  var equipRequestInFlight = false;

  function expectedRevisionForMutation() {
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    if (snap && snap.revision != null && Number.isFinite(Number(snap.revision))) {
      return Number(snap.revision);
    }
    return revision;
  }
  var HP_MP_POTION_IDS = { 1060: true, 1061: true, 726: true, 728: true };
  var craftBookIndex = null;
  var bagModalCtx = null;

  /** Як у GM-шопу: категорія + грейд + підтип; '' — усі предмети (кнопка «все предмети»). */
  var bagInvCat = 'weapon';
  var bagInvShowAll = false;
  /** '' — усі грейди (кнопка «Усі»); ng|d|c|b|a|s */
  var bagInvGradeSub = '';
  var bagInvWeaponSub = 'all';
  var bagInvArmorSub = 'all';
  var bagInvJewelrySub = 'all';
  var bagInvConsumableSub = 'all';

  var BAG_CAT_ORDER = ['weapon', 'shield', 'armor', 'accessor', 'consumable'];
  var BAG_CAT_LABEL_UK = {
    weapon: 'Зброя',
    shield: 'Щити',
    armor: 'Броня',
    accessor: 'Аксесуари',
    consumable: 'Розхідники',
  };
  /** Порядок грейду: NG…S та «Усі» в кінці (зліва направо як у магазині). */
  var BAG_GRADE_UI = [
    ['ng', 'NG'],
    ['d', 'D'],
    ['c', 'C'],
    ['b', 'B'],
    ['a', 'A'],
    ['s', 'S'],
    ['all', 'Усі'],
  ];
  var BAG_WEAPON_SUB_ROWS = [
    ['all', 'Усі'],
    ['sword', 'Мечі'],
    ['dagger', 'Кинжали'],
    ['bow', 'Луки'],
    ['blunt', 'Булави'],
    ['pole', 'Списи'],
    ['fist', 'Кастети'],
    ['dual', 'Дуалі'],
    ['magic', 'Магія'],
  ];
  var BAG_ARMOR_SUB_ROWS = [
    ['all', 'Усі'],
    ['head', 'Шолом'],
    ['torso', 'Торс'],
    ['legs', 'Штани'],
    ['gloves', 'Перчатки'],
    ['feet', 'Чоботи'],
  ];
  var BAG_JEWEL_SUB_ROWS = [
    ['all', 'Усі'],
    ['neck', 'Амулет'],
    ['earring', 'Сережки'],
    ['ring', 'Кільця'],
  ];
  var BAG_CONS_SUB_ROWS = [
    ['all', 'Усі'],
    ['vials', 'Банки'],
    ['arrows', 'Стріли'],
    ['charges', 'Заряди'],
    ['resources', 'Ресурси'],
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function classLabel(branch) {
    if (branch === 'mystic') return 'Маг';
    if (branch === 'fighter') return 'Воїн';
    return branch ? String(branch) : '—';
  }

  function raceUk(race) {
    if (!race) return '—';
    var s = String(race).trim();
    return RACE_UK[s] != null ? RACE_UK[s] : s;
  }

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

  function renderHeroPortrait(c) {
    var img = $('char-hero-img');
    var stage = $('char-hero-stage');
    var bg = document.querySelector('.l2-char-equip-bg');
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

  /** Див. GET /character itemBlocksShieldById — дворуч займає слот щита візуально. */
  function weaponBlocksShieldForUi(wId) {
    if (wId == null || wId <= 0) return false;
    var m =
      window.L2 && L2.itemBlocksShieldById && L2.itemBlocksShieldById[wId];
    return m === true;
  }

  function renderEquipSlots(inv) {
    inv = inv || { eq: {} };
    var eq = inv.eq || {};
    var wId = eqItemId(eq.l1);
    var shId = eqItemId(eq.l2);
    var mirrorTwoHand =
      wId && !shId && weaponBlocksShieldForUi(wId);
    EQ_SLOT_TO_UI.forEach(function (m) {
      var el = document.querySelector('[data-l2-slot="' + m.ui + '"]');
      if (!el) return;
      var def = SLOT_ICON_DEFAULT[m.ui] || '/icons/slot_weapon.png';
      var id = eqItemId(eq[m.key]);
      var mirrorHand = false;
      if (m.key === 'l2' && mirrorTwoHand) {
        id = wId;
        mirrorHand = true;
      }
      if (id) {
        el.classList.add('l2-char-slot-icon--filled');
        if (mirrorHand) {
          el.setAttribute('title', 'Дворучна зброя (зняти — клацни, зніметься з обох слотів)');
          el.setAttribute('data-l2-mirror-twohand', '1');
        } else {
          el.setAttribute('title', 'Зняти в сумку');
          el.removeAttribute('data-l2-mirror-twohand');
        }
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.onerror = function () {
          el.onerror = null;
          el.src = def;
        };
        setItemIconSrc(el, id);
      } else {
        el.classList.remove('l2-char-slot-icon--filled');
        el.removeAttribute('title');
        el.removeAttribute('data-l2-mirror-twohand');
        el.removeAttribute('tabindex');
        el.setAttribute('role', 'presentation');
        el.onerror = null;
        el.src = def;
      }
    });
  }

  function defaultInventory() {
    return { v: 1, stacks: [], eq: {} };
  }

  /** Сегмент екіпу в сумці (вкладки як у GM-шопу). */
  function bagEquipSegment(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'rhand') return 'weapon';
    if (sl === 'lhand' || sl === 'shield') return 'shield';
    if (
      sl === 'chest' ||
      sl === 'legs' ||
      sl === 'head' ||
      sl === 'gloves' ||
      sl === 'feet' ||
      sl === 'fullarmor'
    ) {
      return 'armor';
    }
    if (sl === 'ring' || sl === 'neck' || sl === 'earring') return 'accessor';
    return null;
  }

  function catalogLooksMagicWeapon(st, wt) {
    if (!st || typeof st !== 'object') return false;
    var ma = st.mAtk != null ? Number(st.mAtk) : NaN;
    var pa = st.pAtk != null ? Number(st.pAtk) : NaN;
    if (!Number.isFinite(ma)) return false;
    if (!Number.isFinite(pa) || pa === 0) return true;
    if (wt === 'bigblunt' && ma >= pa) return true;
    return ma >= pa + 10;
  }

  function nameLooksLikeMagicWeaponUk(nameRaw) {
    var s = String(nameRaw || '');
    var low = s.toLowerCase();
    return (
      /магічн[а-яії]*\s+зброя/i.test(s) ||
      /\bmagic\w*\s+weapon\b/i.test(low)
    );
  }

  function weaponSubtypeForBag(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl !== 'rhand') return 'sword';
    var name = String(itemDisplayName(itemId) || '');
    if (/dualsword/i.test(name)) return 'dual';
    if (nameLooksLikeMagicWeaponUk(name)) return 'magic';
    var wt = window.L2 && L2.itemWeaponTypeById && L2.itemWeaponTypeById[itemId];
    var st = window.L2 && L2.itemStatsById && L2.itemStatsById[itemId];
    if (st && catalogLooksMagicWeapon(st, wt)) return 'magic';
    if (wt === 'dual') return 'dual';
    if (wt === 'bow') return 'bow';
    if (wt === 'dagger') return 'dagger';
    if (wt === 'pole') return 'pole';
    if (wt === 'fist') return 'fist';
    if (wt === 'blunt' || wt === 'bigblunt') return 'blunt';
    if (wt === 'sword' || wt === 'bigsword') return 'sword';
    return 'sword';
  }

  function armorPieceForBag(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'head') return 'head';
    if (sl === 'chest') return 'torso';
    if (sl === 'legs') return 'legs';
    if (sl === 'gloves') return 'gloves';
    if (sl === 'feet') return 'feet';
    if (sl === 'fullarmor') return 'torso';
    return '';
  }

  function jewelryKindForBag(itemId) {
    var jk =
      window.L2 && L2.itemJewelryKindById && L2.itemJewelryKindById[itemId];
    if (jk != null && String(jk).trim() !== '') {
      return String(jk).trim().toLowerCase();
    }
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'neck') return 'neck';
    if (sl === 'earring') return 'earring';
    if (sl === 'ring') return 'ring';
    return '';
  }

  function consumableSubtypeForBag(itemId) {
    var tab = bagInvTabHint(itemId);
    if (tab === 'resource') return 'resources';
    if (bagInvTabHintFromName(itemId) === 'resource') return 'resources';
    if (tab === 'recipe' || tab === 'book') return 'vials';
    var name = String(itemDisplayName(itemId) || '').toLowerCase();
    if (/soulshot|spiritshot|blessed\s+spiritshot|заряд|заряди/i.test(name)) {
      return 'charges';
    }
    if (/arrow|стріл|bolt|болт/i.test(name)) return 'arrows';
    return 'vials';
  }

  /** Усе, що не екіп: розхід, рецепти, ресурси, свитки, стихії тощо — під «Розхідники». */
  function itemInConsumableBagBucket(itemId) {
    if (bagEquipSegment(itemId) != null) return false;
    var tab = bagInvTabHint(itemId);
    var tabs = [
      'consumable',
      'recipe',
      'resource',
      'quest',
      'book',
      'enchantment',
    ];
    if (tab != null && tabs.indexOf(tab) >= 0) return true;
    if (bagElementItemGuess(itemId)) return true;
    return true;
  }

  /** Не плутати з ремісничим «leather» / матеріалами — щити й дріп екіпу в назві. */
  function nameLooksLikeEquippableGearName(s) {
    if (!s) return false;
    return (
      /\b(shield|armor|breastplate|helmet|boot|boots|gauntlet|gloves|gaiter|gaiters|circlet|robe|tunic|stockings|cloak|jewel)\b/i.test(
        s
      ) ||
      /(щит|броня|шолом|черевик|рукавиц|нагрудник|штани|обладунк|бригантин|діадема|мантія|кольчуг|лат)/i.test(
        s
      )
    );
  }

  function bagInvTabHintFromName(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    if (/^Recipe:/i.test(s) || /^Рецепт/i.test(s)) return 'recipe';
    if (/Scroll:\s*Enchant\s+(Weapon|Armor)/i.test(s)) return 'enchantment';
    if (/Blessed\s+Scroll:\s*Enchant/i.test(s)) return 'enchantment';
    if (/Giant['’]s?\s+Enchant/i.test(s)) return 'enchantment';
    if (/Свиток/i.test(s) && /зачаруван/i.test(s)) return 'enchantment';
    if (/spellbook/i.test(s)) return 'book';
    if (/^quest\s/i.test(s) || /\bquest\s+item\b/i.test(s)) return 'quest';
    if (/soulshot|spiritshot|blessed\s+spiritshot/i.test(s)) return 'consumable';
    if (/potion|elixir|antidote|healing|mana\s+drug|зілл|еліксир|заряд\s+душ/i.test(s))
      return 'consumable';
    if (
      !nameLooksLikeEquippableGearName(s) &&
      /nugget|thread|stem|binder|coal|powder|ore\b|leather|mold\b|cord\b/i.test(s)
    ) {
      return 'resource';
    }
    return null;
  }

  function bagInvTabHint(itemId) {
    var id = Number(itemId);
    var t = window.L2 && L2.itemInventoryTabById && L2.itemInventoryTabById[id];
    if (t != null && String(t).trim() !== '') return String(t);
    return bagInvTabHintFromName(id);
  }

  /** Евристика «стихії» (камені атрибуту тощо), доки немає окремої мітки в каталозі. */
  function bagElementItemGuess(itemId) {
    var name = itemDisplayName(itemId);
    var s = String(name || '');
    var low = s.toLowerCase();
    if (/\b(elemental|attribute)\s+stone\b/i.test(s)) return true;
    if (/камінь\s+стих|стихійн/i.test(s)) return true;
    if (
      /\b(o['’-]?\s*stone|fire\s+stone|water\s+stone|wind\s+stone|earth\s+stone)\b/i.test(low)
    ) {
      return true;
    }
    return false;
  }

  function itemMatchesInvCat(itemId, cat) {
    if (bagInvShowAll) return true;
    var seg = bagEquipSegment(itemId);
    if (cat === 'weapon') return seg === 'weapon';
    if (cat === 'shield') return seg === 'shield';
    if (cat === 'armor') return seg === 'armor';
    if (cat === 'accessor') return seg === 'accessor';
    if (cat === 'consumable') return itemInConsumableBagBucket(itemId);
    return false;
  }

  function itemPassesBagSubFilters(itemId) {
    if (bagInvCat === 'shield') return true;
    if (bagInvCat === 'weapon') {
      if (bagInvWeaponSub === 'all') return true;
      return weaponSubtypeForBag(itemId) === bagInvWeaponSub;
    }
    if (bagInvCat === 'armor') {
      if (bagInvArmorSub === 'all') return true;
      var ap = armorPieceForBag(itemId);
      return ap !== '' && ap === bagInvArmorSub;
    }
    if (bagInvCat === 'accessor') {
      if (bagInvJewelrySub === 'all') return true;
      var j = jewelryKindForBag(itemId);
      return j !== '' && j === bagInvJewelrySub;
    }
    if (bagInvCat === 'consumable') {
      if (bagInvConsumableSub === 'all') return true;
      return consumableSubtypeForBag(itemId) === bagInvConsumableSub;
    }
    return true;
  }

  /** Лише зброя / щит / броня / аксесуари — не розхідники й ресурси. */
  function canEquipFromBag(itemId) {
    if (itemInConsumableBagBucket(itemId)) return false;
    var seg = bagEquipSegment(itemId);
    if (!seg) return false;
    if (
      seg !== 'weapon' &&
      seg !== 'shield' &&
      seg !== 'armor' &&
      seg !== 'accessor'
    ) {
      return false;
    }
    var tab = bagInvTabHint(itemId);
    if (
      tab === 'recipe' ||
      tab === 'consumable' ||
      tab === 'quest' ||
      tab === 'book' ||
      tab === 'enchantment' ||
      tab === 'resource'
    ) {
      return false;
    }
    return true;
  }

  function isHpMpPotion(itemId) {
    return !!HP_MP_POTION_IDS[Number(itemId)];
  }

  /** Розхідники — показуємо ×qty; зброя/броня з qty 1 — без «×1». */
  function bagQtySuffix(itemId, qty) {
    var q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) q = 1;
    if (itemInConsumableBagBucket(itemId)) return ' ×' + q;
    if (q > 1) return ' ×' + q;
    return '';
  }

  function isCraftHintItem(itemId) {
    return itemInConsumableBagBucket(itemId) && !isHpMpPotion(itemId);
  }

  function buildCraftBookIndex(tiers) {
    var asOutput = {};
    var asIngredient = {};
    (tiers || []).forEach(function (tier) {
      (tier.recipes || []).forEach(function (recipe) {
        var outId = Number(recipe.outputL2ItemId);
        if (!Number.isFinite(outId)) return;
        if (!asOutput[outId]) asOutput[outId] = [];
        (recipe.ingredients || []).forEach(function (ing) {
          var ingId = Number(ing.l2ItemId);
          var cnt = Number(ing.count);
          if (!Number.isFinite(ingId) || !Number.isFinite(cnt)) return;
          asOutput[outId].push({ itemId: ingId, count: cnt });
          if (!asIngredient[ingId]) asIngredient[ingId] = [];
          asIngredient[ingId].push({ outId: outId, count: cnt, tier: tier.tier });
        });
      });
    });
    return { asOutput: asOutput, asIngredient: asIngredient };
  }

  function craftHintForItem(itemId) {
    var id = Number(itemId);
    if (!Number.isFinite(id)) return 'Розхідник — не одягається.';
    if (!craftBookIndex) {
      return 'Розхідник — не одягається. Для крафту відкрий меню «Крафт».';
    }
    var lines = [];
    var outs = craftBookIndex.asOutput[id];
    if (outs && outs.length) {
      var parts = outs.map(function (row) {
        return row.count + '× ' + itemDisplayName(row.itemId);
      });
      lines.push('Отримання: ' + parts.join(', '));
    }
    var uses = craftBookIndex.asIngredient[id];
    if (uses && uses.length) {
      uses.forEach(function (row) {
        lines.push(
          'Потрібно для крафту: ' +
            itemDisplayName(row.outId) +
            ' — ' +
            row.count +
            '×'
        );
      });
    }
    if (lines.length) return lines.join('\n');
    return 'Розхідник — не одягається.';
  }

  function loadCraftBookForChar(token) {
    if (!token || craftBookIndex) return Promise.resolve();
    return fetch('/game/resource-craft/book', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(function (r) {
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (j) {
        if (!j || !Array.isArray(j.tiers)) return;
        craftBookIndex = buildCraftBookIndex(j.tiers);
      })
      .catch(function () {
        /* ignore */
      });
  }

  function normalizedItemGradeKey(itemId) {
    var g = window.L2 && L2.itemGradeById && L2.itemGradeById[itemId];
    if (g == null || String(g).trim() === '') return '';
    return String(g).trim().toLowerCase();
  }

  function stackPassesBagFilters(st) {
    if (bagInvShowAll) return true;
    var id = st.itemId;
    if (!itemMatchesInvCat(id, bagInvCat)) return false;
    if (!itemPassesBagSubFilters(id)) return false;
    if (bagInvGradeSub !== '') {
      var ig = normalizedItemGradeKey(id);
      if (ig !== bagInvGradeSub) return false;
    }
    return true;
  }

  function charBagSubsRowsForCat() {
    if (bagInvCat === 'weapon') return BAG_WEAPON_SUB_ROWS;
    if (bagInvCat === 'armor') return BAG_ARMOR_SUB_ROWS;
    if (bagInvCat === 'accessor') return BAG_JEWEL_SUB_ROWS;
    if (bagInvCat === 'consumable') return BAG_CONS_SUB_ROWS;
    return [];
  }

  function charBagSubModClass() {
    if (bagInvCat === 'weapon') return 'l2-drops-shop-tablist--weapon-kind';
    if (bagInvCat === 'armor') return 'l2-drops-shop-tablist--armor-piece';
    if (bagInvCat === 'accessor') return 'l2-drops-shop-tablist--jewelry-sub';
    if (bagInvCat === 'consumable') return 'l2-drops-shop-tablist--consumable-sub';
    return '';
  }

  function charBagCurrentSubKey() {
    if (bagInvCat === 'weapon') return bagInvWeaponSub;
    if (bagInvCat === 'armor') return bagInvArmorSub;
    if (bagInvCat === 'accessor') return bagInvJewelrySub;
    if (bagInvCat === 'consumable') return bagInvConsumableSub;
    return 'all';
  }

  function setCharBagSubKey(k) {
    if (bagInvCat === 'weapon') bagInvWeaponSub = k;
    else if (bagInvCat === 'armor') bagInvArmorSub = k;
    else if (bagInvCat === 'accessor') bagInvJewelrySub = k;
    else if (bagInvCat === 'consumable') bagInvConsumableSub = k;
  }

  function resetCharBagSubsToAll() {
    bagInvWeaponSub = 'all';
    bagInvArmorSub = 'all';
    bagInvJewelrySub = 'all';
    bagInvConsumableSub = 'all';
  }

  function normalizeCharBagSubForCat() {
    var rows = charBagSubsRowsForCat();
    var keys = rows.map(function (r) {
      return r[0];
    });
    function pick(cur) {
      return keys.indexOf(cur) !== -1 ? cur : 'all';
    }
    if (bagInvCat === 'weapon') bagInvWeaponSub = pick(bagInvWeaponSub);
    else if (bagInvCat === 'armor') bagInvArmorSub = pick(bagInvArmorSub);
    else if (bagInvCat === 'accessor')
      bagInvJewelrySub = pick(bagInvJewelrySub);
    else if (bagInvCat === 'consumable')
      bagInvConsumableSub = pick(bagInvConsumableSub);
  }

  function buildCharBagAllItemsBtnOnce() {
    var host = $('char-bag-tab-all-host');
    if (!host || host.getAttribute('data-char-bag-all-built')) return;
    host.setAttribute('data-char-bag-all-built', '1');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'l2-char-inv-all-items-btn';
    btn.setAttribute('data-inv-all-items', '1');
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', 'false');
    btn.textContent = 'все предмети';
    host.appendChild(btn);
  }

  function buildCharBagFilterTabsOnce() {
    buildCharBagAllItemsBtnOnce();
    var catsEl = $('char-bag-tab-cats');
    var gradesEl = $('char-bag-tab-grades');
    if (!catsEl || !gradesEl || catsEl.getAttribute('data-char-bag-built')) {
      return;
    }
    catsEl.setAttribute('data-char-bag-built', '1');
    for (var ci = 0; ci < BAG_CAT_ORDER.length; ci++) {
      var ck = BAG_CAT_ORDER[ci];
      var cb = document.createElement('button');
      cb.type = 'button';
      cb.className = 'l2-drops-shop-tab';
      cb.setAttribute('role', 'tab');
      cb.setAttribute('data-inv-cat', ck);
      cb.textContent = BAG_CAT_LABEL_UK[ck] || ck;
      catsEl.appendChild(cb);
    }
    for (var gi = 0; gi < BAG_GRADE_UI.length; gi++) {
      var gv = BAG_GRADE_UI[gi];
      var gb = document.createElement('button');
      gb.type = 'button';
      gb.className = 'l2-drops-shop-tab';
      gb.setAttribute('role', 'tab');
      gb.setAttribute('data-inv-grade', gv[0]);
      if (gv[0] !== 'all') gb.setAttribute('data-grade', String(gv[1]));
      gb.textContent = gv[1];
      gradesEl.appendChild(gb);
    }
  }

  function rebuildCharBagSubTabs() {
    var subMount = $('char-bag-tab-subs');
    if (!subMount) return;
    if (bagInvShowAll) {
      subMount.hidden = true;
      subMount.innerHTML = '';
      subMount.setAttribute('aria-hidden', 'true');
      return;
    }
    if (bagInvCat === 'shield') {
      subMount.hidden = true;
      subMount.innerHTML = '';
      subMount.removeAttribute('aria-hidden');
      return;
    }
    var rows = charBagSubsRowsForCat();
    var mod = charBagSubModClass();
    subMount.hidden = rows.length === 0;
    subMount.className =
      'l2-drops-shop-tablist ' + (mod ? mod + ' ' : '').trim();
    subMount.innerHTML = '';
    var cur = charBagCurrentSubKey();
    for (var ri = 0; ri < rows.length; ri++) {
      var row = rows[ri];
      var sk = row[0];
      var sb = document.createElement('button');
      sb.type = 'button';
      sb.className = 'l2-drops-shop-tab';
      if (sk === cur) sb.classList.add('l2-drops-shop-tab--active');
      sb.setAttribute('role', 'tab');
      sb.setAttribute('data-inv-sub', sk);
      sb.setAttribute('aria-selected', sk === cur ? 'true' : 'false');
      sb.textContent = row[1];
      subMount.appendChild(sb);
    }
    subMount.setAttribute('aria-hidden', subMount.hidden ? 'true' : 'false');
  }

  function syncBagFilterTabsUi() {
    normalizeCharBagSubForCat();
    var allBtn = document.querySelector('[data-inv-all-items]');
    if (allBtn) {
      allBtn.classList.toggle('l2-char-inv-all-items-btn--active', bagInvShowAll);
      allBtn.setAttribute('aria-selected', bagInvShowAll ? 'true' : 'false');
    }
    var catsEl = $('char-bag-tab-cats');
    if (catsEl) {
      var cats = catsEl.querySelectorAll('[data-inv-cat]');
      for (var i = 0; i < cats.length; i++) {
        var cEl = cats[i];
        var on = !bagInvShowAll && cEl.getAttribute('data-inv-cat') === bagInvCat;
        cEl.classList.toggle('l2-drops-shop-tab--active', on);
        cEl.setAttribute('aria-selected', on ? 'true' : 'false');
      }
    }
    var gradesEl = $('char-bag-tab-grades');
    if (gradesEl) {
      var grades = gradesEl.querySelectorAll('[data-inv-grade]');
      for (var g = 0; g < grades.length; g++) {
        var gEl = grades[g];
        var gv = String(gEl.getAttribute('data-inv-grade') || '').toLowerCase();
        var gOn =
          !bagInvShowAll &&
          (gv === 'all'
            ? bagInvGradeSub === ''
            : gv !== '' && gv === bagInvGradeSub);
        gEl.classList.toggle('l2-drops-shop-tab--active', gOn);
        gEl.setAttribute('aria-selected', gOn ? 'true' : 'false');
      }
    }
    rebuildCharBagSubTabs();
  }

  function wireBagInvFilters() {
    buildCharBagFilterTabsOnce();
    syncBagFilterTabsUi();
    var host = document.querySelector('.l2-char-inv-shop-tabs-host');
    if (!host || host.getAttribute('data-bag-filter-wire')) return;
    host.setAttribute('data-bag-filter-wire', '1');
    host.addEventListener('click', function (e) {
      var allBtn = e.target.closest('[data-inv-all-items]');
      if (allBtn) {
        bagInvShowAll = !bagInvShowAll;
        if (bagInvShowAll) {
          bagInvGradeSub = '';
          resetCharBagSubsToAll();
        }
        syncBagFilterTabsUi();
        renderBagFromSnapshot();
        return;
      }
      var cBtn = e.target.closest('[data-inv-cat]');
      if (cBtn) {
        var cx = cBtn.getAttribute('data-inv-cat');
        if (!cx || BAG_CAT_ORDER.indexOf(cx) === -1) return;
        bagInvShowAll = false;
        bagInvCat = cx;
        bagInvGradeSub = '';
        resetCharBagSubsToAll();
        syncBagFilterTabsUi();
        renderBagFromSnapshot();
        return;
      }
      var grBtn = e.target.closest('[data-inv-grade]');
      if (grBtn) {
        bagInvShowAll = false;
        var gx = String(grBtn.getAttribute('data-inv-grade') || '').toLowerCase();
        bagInvGradeSub = gx === 'all' ? '' : gx;
        syncBagFilterTabsUi();
        renderBagFromSnapshot();
        return;
      }
      var sBtn = e.target.closest('[data-inv-sub]');
      if (sBtn) {
        bagInvShowAll = false;
        var sx = sBtn.getAttribute('data-inv-sub');
        if (!sx) return;
        setCharBagSubKey(sx);
        syncBagFilterTabsUi();
        renderBagFromSnapshot();
      }
    });
  }
  function renderBagFromSnapshot() {
    var snap =
      window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
    var inv = snap && snap.inventory ? snap.inventory : defaultInventory();
    renderBag(inv);
  }

  function bagRenderEntries(inv) {
    inv = inv || defaultInventory();
    var entries = [];
    (inv.stacks || []).forEach(function (st) {
      entries.push({
        itemId: st.itemId,
        qty: st.qty,
        enchant: st.enchant != null ? Number(st.enchant) : 0,
      });
    });
    return entries;
  }

  function renderBag(inv) {
    inv = inv || defaultInventory();
    var root = $('char-bag-list');
    var empty = $('char-bag-empty');
    var filtEmpty = $('char-bag-filter-empty');
    if (!root) return;
    root.innerHTML = '';
    var entries = bagRenderEntries(inv);
    if (entries.length === 0) {
      if (empty) empty.hidden = false;
      if (filtEmpty) filtEmpty.hidden = true;
      return;
    }
    if (empty) empty.hidden = true;
    var filtered = entries.filter(stackPassesBagFilters);
    if (filtered.length === 0) {
      if (filtEmpty) filtEmpty.hidden = false;
      return;
    }
    if (filtEmpty) filtEmpty.hidden = true;
    filtered.forEach(function (st) {
      var en = st.enchant != null ? Number(st.enchant) : 0;
      if (!Number.isFinite(en) || en < 0) en = 0;
      var row = document.createElement('div');
      row.className = 'l2-char-bag-row';
      row.setAttribute(
        'data-item-json',
        JSON.stringify({ itemId: st.itemId, qty: st.qty, enchant: en })
      );
      var ic = document.createElement('img');
      ic.className = 'l2-char-bag-icon l2-char-bag-icon--stats';
      ic.alt = '';
      ic.width = 28;
      ic.height = 28;
      ic.draggable = false;
      ic.setAttribute('role', 'button');
      ic.setAttribute('tabindex', '0');
      ic.setAttribute('aria-label', 'Характеристики предмета');
      setItemIconSrc(ic, st.itemId);
      var mid = document.createElement('div');
      mid.className = 'l2-char-bag-row-text';
      var label = document.createElement('span');
      label.className = 'l2-char-bag-name';
      var nameLine = itemDisplayName(st.itemId) + bagQtySuffix(st.itemId, st.qty);
      if (en > 0) nameLine += ' +' + en;
      label.textContent = nameLine;
      mid.appendChild(label);
      var statLine = itemStatsLine(st.itemId);
      if (statLine) {
        var stEl = document.createElement('span');
        stEl.className = 'l2-char-bag-stats';
        stEl.textContent = statLine;
        mid.appendChild(stEl);
      }
      row.appendChild(ic);
      row.appendChild(mid);
      if (canEquipFromBag(st.itemId)) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'l2-char-bag-equip l2-char-bag-modal-action';
        btn.textContent = 'Одіти';
        btn.setAttribute('data-item-id', String(st.itemId));
        btn.setAttribute('data-item-enchant', String(en));
        row.appendChild(btn);
      }
      root.appendChild(row);
    });
  }

  function stubWeight(inv) {
    inv = inv || defaultInventory();
    var n = (inv.stacks || []).length;
    Object.keys(inv.eq || {}).forEach(function () {
      n += 1;
    });
    return Math.max(1, n);
  }

  function renderAll(c) {
    var inv = c.inventory || defaultInventory();
    renderBag(inv);
    renderHeroPortrait(c);
    renderEquipSlots(inv);
    var wcur = $('char-w-cur');
    var wmax = $('char-w-max');
    if (wcur) wcur.textContent = String(stubWeight(inv));
    if (wmax) wmax.textContent = '80';

    if ($('char-adena')) $('char-adena').textContent = c.adena != null ? String(c.adena) : '0';
    if ($('char-exp')) $('char-exp').textContent = c.exp != null ? String(c.exp) : '0';
    if ($('char-sp')) $('char-sp').textContent = c.sp != null ? String(c.sp) : '0';

    revision = c.revision != null ? Number(c.revision) : 0;
  }

  async function apiEquip(itemId, enchant) {
    if (equipRequestInFlight) return;
    equipRequestInFlight = true;
    try {
      var t = localStorage.getItem('token');
      var en =
        enchant != null && Number.isFinite(Number(enchant))
          ? Math.max(0, Math.min(20, Math.floor(Number(enchant))))
          : 0;
      var r = await fetch('/character/equip', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'equip',
          itemId: itemId,
          enchant: en,
          expectedRevision: revision,
        }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        await resyncCharacterFromServer();
        return;
      }
      if (!r.ok) {
        var msg = 'Не вдалося одягнути.';
        try {
          var j = await r.json();
          if (j && j.messageUk) msg = j.messageUk;
        } catch (e) {
          /* ignore */
        }
        var stub = $('char-stub-msg');
        if (stub) {
          stub.hidden = false;
          stub.textContent = msg;
        }
        return;
      }
      var out = await r.json();
      var c = out.character;
      window.L2.setLastSnapshot(c);
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      renderAll(c);
    } catch (_e) {
      var stubNet = $('char-stub-msg');
      if (stubNet) {
        stubNet.hidden = false;
        stubNet.textContent = 'Збій мережі — спробуй ще раз.';
      }
    } finally {
      equipRequestInFlight = false;
    }
  }

  async function apiUsePotion(itemId, quantity) {
    if (equipRequestInFlight) return;
    equipRequestInFlight = true;
    try {
      var t = localStorage.getItem('token');
      var r = await fetch('/character/consumable/use', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: itemId,
          quantity: quantity,
          expectedRevision: expectedRevisionForMutation(),
        }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        await resyncCharacterFromServer();
        return;
      }
      if (!r.ok) {
        var msg = 'Не вдалося використати зілля.';
        try {
          var j = await r.json();
          if (j && j.messageUk) msg = j.messageUk;
        } catch (e) {
          /* ignore */
        }
        var stub = $('char-stub-msg');
        if (stub) {
          stub.hidden = false;
          stub.textContent = msg;
        }
        return;
      }
      var out = await r.json();
      var c = out.character;
      if (window.L2 && typeof L2.applyCharacterSnapshot === 'function') {
        L2.applyCharacterSnapshot(c);
      } else {
        window.L2.setLastSnapshot(c);
        if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
          L2.applyHudFromSnapshot(c);
        }
      }
      renderAll(c);
      var stubOk = $('char-stub-msg');
      if (stubOk) {
        stubOk.hidden = false;
        stubOk.textContent = 'Зілля використано.';
        window.setTimeout(function () {
          if (stubOk.textContent === 'Зілля використано.') {
            stubOk.hidden = true;
            stubOk.textContent = '';
          }
        }, 2200);
      }
    } catch (_e) {
      var stubNet = $('char-stub-msg');
      if (stubNet) {
        stubNet.hidden = false;
        stubNet.textContent = 'Збій мережі — спробуй ще раз.';
      }
    } finally {
      equipRequestInFlight = false;
    }
  }

  async function apiUnequip(slotKey) {
    if (equipRequestInFlight) return;
    equipRequestInFlight = true;
    try {
      var t = localStorage.getItem('token');
      var r = await fetch('/character/equip', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + t,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'unequip',
          slot: slotKey,
          expectedRevision: revision,
        }),
      });
      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        await resyncCharacterFromServer();
        return;
      }
      if (!r.ok) {
        var msg = 'Не вдалося зняти предмет.';
        try {
          var j = await r.json();
          if (j && j.messageUk) msg = j.messageUk;
        } catch (e) {
          /* ignore */
        }
        var stub = $('char-stub-msg');
        if (stub) {
          stub.hidden = false;
          stub.textContent = msg;
        }
        return;
      }
      var out = await r.json();
      var c = out.character;
      window.L2.setLastSnapshot(c);
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(c);
      }
      renderAll(c);
    } catch (_e) {
      var stubNet = $('char-stub-msg');
      if (stubNet) {
        stubNet.hidden = false;
        stubNet.textContent = 'Збій мережі — спробуй ще раз.';
      }
    } finally {
      equipRequestInFlight = false;
    }
  }

  async function resyncCharacterFromServer() {
    if (!localStorage.getItem('token')) return;
    try {
      var snap =
        window.L2 && typeof L2.fetchSnapshot === 'function'
          ? await L2.fetchSnapshot()
          : null;
      if (!snap) {
        if (!localStorage.getItem('token')) {
          window.location.href = '/';
        }
        return;
      }
      renderAll(snap);
      var stub = $('char-stub-msg');
      if (stub) {
        stub.hidden = false;
        stub.textContent = 'Дані оновлено. Повтори дію.';
      }
    } catch (_e) {
      /* ignore */
    }
  }

  function wireEquipSlotClicks() {
    var frame = document.querySelector('.l2-char-equip-frame');
    if (!frame) return;
    frame.addEventListener('click', function (e) {
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      var mirror = img.getAttribute('data-l2-mirror-twohand') === '1';
      var key = img.getAttribute('data-l2-eq-key');
      if (!key) return;
      var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      var inv = snap && snap.inventory ? snap.inventory : null;
      var eq = inv && inv.eq ? inv.eq : {};
      if (mirror) {
        if (!eqItemId(eq.l1)) return;
        apiUnequip('l1');
        return;
      }
      if (!eqItemId(eq[key])) return;
      apiUnequip(key);
    });
    frame.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var img = e.target.closest('img[data-l2-eq-key].l2-char-slot-icon--filled');
      if (!img) return;
      e.preventDefault();
      var mirror = img.getAttribute('data-l2-mirror-twohand') === '1';
      var key = img.getAttribute('data-l2-eq-key');
      if (!key) return;
      var snap = window.L2 && typeof L2.lastSnapshot === 'function' ? L2.lastSnapshot() : null;
      var inv = snap && snap.inventory ? snap.inventory : null;
      var eq = inv && inv.eq ? inv.eq : {};
      if (mirror) {
        if (!eqItemId(eq.l1)) return;
        apiUnequip('l1');
        return;
      }
      if (!eqItemId(eq[key])) return;
      apiUnequip(key);
    });
  }

  function wireBagClicks() {
    var root = $('char-bag-list');
    if (!root) return;
    function openFromRow(row) {
      if (!row) return;
      var raw = row.getAttribute('data-item-json');
      if (!raw) return;
      try {
        openBagModal(JSON.parse(raw));
      } catch (e0) {
        /* ignore */
      }
    }
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('.l2-char-bag-equip');
      if (btn) {
        e.stopPropagation();
        var id = btn.getAttribute('data-item-id');
        if (!id) return;
        var ben = btn.getAttribute('data-item-enchant');
        apiEquip(Number(id), ben != null ? Number(ben) : 0);
        return;
      }
      var icon = e.target.closest('.l2-char-bag-icon--stats');
      if (icon) {
        e.stopPropagation();
        openFromRow(icon.closest('.l2-char-bag-row'));
        return;
      }
    });
    root.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var icon = e.target.closest('.l2-char-bag-icon--stats');
      if (!icon) return;
      e.preventDefault();
      openFromRow(icon.closest('.l2-char-bag-row'));
    });
  }

  function slotKindUk(itemId) {
    var sl = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'chest') return 'Обладунки (верх)';
    if (sl === 'legs') return 'Обладунки (низ)';
    if (sl === 'rhand') return 'Зброя (права рука)';
    if (sl === 'lhand' || sl === 'shield') return 'Щит (ліва рука)';
    if (sl === 'ring') return 'Кільце';
    if (sl === 'neck') return 'Намисто';
    if (sl === 'earring') return 'Сережки';
    return 'Предмет';
  }

  function closeBagModal() {
    var ov = $('char-bag-modal-overlay');
    if (ov) {
      ov.hidden = true;
      ov.setAttribute('aria-hidden', 'true');
    }
    bagModalCtx = null;
    document.body.classList.remove('l2-gm-modal-open');
  }

  function openBagModal(payload) {
    if (!payload || payload.itemId == null) return;
    var itemId = Number(payload.itemId);
    var qty = payload.qty != null ? Number(payload.qty) : 1;
    var modalEn =
      payload.enchant != null && Number.isFinite(Number(payload.enchant))
        ? Math.max(0, Math.min(20, Math.floor(Number(payload.enchant))))
        : 0;
    var ov = $('char-bag-modal-overlay');
    var title = $('char-bag-modal-title');
    var kind = $('char-bag-modal-kind');
    var gradeEl = $('char-bag-modal-grade');
    var icon = $('char-bag-modal-icon');
    var statsEl = $('char-bag-modal-stats');
    var qtyEl = $('char-bag-modal-qty');
    var equipBtn = $('char-bag-modal-equip');
    var armorSetsEl = $('char-bag-modal-armor-sets');
    if (!ov || !title || !statsEl || !qtyEl || !equipBtn) return;
    title.textContent = itemDisplayName(itemId);
    if (gradeEl) gradeEl.textContent = gradeLabelForItem(itemId);
    if (kind) kind.textContent = slotKindUk(itemId);
    if (icon) setItemIconSrc(icon, itemId);
    statsEl.innerHTML = '';
    function addRow(k, v) {
      var dt = document.createElement('dt');
      dt.textContent = k;
      var dd = document.createElement('dd');
      dd.textContent = v;
      statsEl.appendChild(dt);
      statsEl.appendChild(dd);
    }
    if (modalEn > 0) addRow('Заточка', '+' + modalEn);
    var st = window.L2 && L2.itemStatsById && L2.itemStatsById[itemId];
    var slKind = window.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    var hasJewelAuthorModal =
      st &&
      typeof st === 'object' &&
      (st.jewelMdefFlat != null ||
        st.jewelMaxHp != null ||
        st.jewelMaxMp != null ||
        (st.jewelAcc != null && Number(st.jewelAcc) > 0) ||
        (st.jewelEva != null && Number(st.jewelEva) > 0) ||
        (st.jewelMpRegenMul != null && Number(st.jewelMpRegenMul) > 1) ||
        (st.jewelHoldResistMul != null &&
          Number(st.jewelHoldResistMul) > 1));
    var isJewelModal =
      slKind === 'ring' ||
      slKind === 'neck' ||
      slKind === 'earring' ||
      hasJewelAuthorModal;
    if (st && typeof st === 'object') {
      if (st.pAtk != null) addRow('P. Atk.', String(st.pAtk));
      if (isJewelModal) {
        var mdef =
          st.jewelMdefFlat != null
            ? st.jewelMdefFlat
            : st.jewelryMAtk != null
              ? st.jewelryMAtk
              : st.mAtk;
        if (mdef != null) addRow('Маг. захист (M.Def)', String(mdef));
        if (st.jewelMaxHp != null && st.jewelMaxHp > 0) {
          addRow('HP макс.', '+' + String(st.jewelMaxHp));
        }
        if (st.jewelMaxMp != null && st.jewelMaxMp > 0) {
          addRow('MP макс.', '+' + String(st.jewelMaxMp));
        }
        if (st.jewelAcc != null && st.jewelAcc > 0) {
          addRow('Точність', '+' + String(st.jewelAcc));
        }
        if (st.jewelEva != null && st.jewelEva > 0) {
          addRow('Ухилення', '+' + String(st.jewelEva));
        }
        if (
          st.jewelMpRegenMul != null &&
          st.jewelMpRegenMul > 1 &&
          Number.isFinite(Number(st.jewelMpRegenMul))
        ) {
          addRow('Реген MP', pctFromMulUk(st.jewelMpRegenMul));
        }
        if (
          st.jewelHoldResistMul != null &&
          st.jewelHoldResistMul > 1 &&
          Number.isFinite(Number(st.jewelHoldResistMul))
        ) {
          addRow('Стійкість до утримання', pctFromMulUk(st.jewelHoldResistMul));
        }
        if (st.pDef != null) addRow('P. Def.', String(st.pDef));
      } else {
        if (st.mAtk != null) addRow('M. Atk.', String(st.mAtk));
        if (st.pDef != null) addRow('P. Def.', String(st.pDef));
      }
      if (st.atkSpd != null) addRow('Скор. атаки', String(st.atkSpd));
      if (st.wpnCrit != null) addRow('Крит (база типу)', String(st.wpnCrit));
      if (st.rCrit != null && Number(st.rCrit) > 0) {
        addRow('Шанс крит (зброя)', '+' + String(st.rCrit));
      }
    }
    qtyEl.textContent =
      'У сумці' +
      bagQtySuffix(itemId, Number.isFinite(qty) ? qty : 1);
    if (armorSetsEl && window.L2ArmorSetBonusesUI) {
      if (window.L2ArmorSetBonusesUI.isArmorSlot(slKind)) {
        window.L2ArmorSetBonusesUI.showIn(
          armorSetsEl,
          gradeLabelForItem(itemId),
          itemId
        );
      } else {
        window.L2ArmorSetBonusesUI.hide(armorSetsEl);
      }
    }

    var craftHintEl = $('char-bag-modal-craft-hint');
    var useRow = $('char-bag-modal-use-row');
    var useBtn = $('char-bag-modal-use');
    var useQty = $('char-bag-modal-use-qty');
    var canEq = canEquipFromBag(itemId);
    var isPotion = isHpMpPotion(itemId);
    var showCraft = isCraftHintItem(itemId);

    bagModalCtx = {
      itemId: itemId,
      qty: Number.isFinite(qty) ? qty : 1,
      enchant: modalEn,
    };

    if (canEq) {
      equipBtn.hidden = false;
      equipBtn.removeAttribute('hidden');
      equipBtn.setAttribute('data-item-id', String(itemId));
      equipBtn.setAttribute('data-item-enchant', String(modalEn));
    } else {
      equipBtn.hidden = true;
      equipBtn.setAttribute('hidden', '');
      equipBtn.removeAttribute('data-item-id');
      equipBtn.removeAttribute('data-item-enchant');
    }

    if (craftHintEl) {
      if (showCraft) {
        craftHintEl.hidden = false;
        craftHintEl.removeAttribute('hidden');
        craftHintEl.textContent = craftHintForItem(itemId);
      } else {
        craftHintEl.hidden = true;
        craftHintEl.setAttribute('hidden', '');
        craftHintEl.textContent = '';
      }
    }
    if (useRow) {
      if (isPotion) {
        useRow.hidden = false;
        useRow.removeAttribute('hidden');
      } else {
        useRow.hidden = true;
        useRow.setAttribute('hidden', '');
      }
    }
    if (useBtn) {
      if (isPotion) {
        useBtn.hidden = false;
        useBtn.removeAttribute('hidden');
      } else {
        useBtn.hidden = true;
        useBtn.setAttribute('hidden', '');
      }
    }
    if (isPotion && useQty) {
      var maxQ = Math.max(1, Math.floor(Number.isFinite(qty) ? qty : 1));
      useQty.min = '1';
      useQty.max = String(maxQ);
      useQty.value = '1';
    }
    ov.hidden = false;
    ov.setAttribute('aria-hidden', 'false');
    document.body.classList.add('l2-gm-modal-open');
  }

  function ensureCharBagModalOnBody() {
    var ov = $('char-bag-modal-overlay');
    if (ov && ov.parentNode !== document.body) {
      document.body.appendChild(ov);
    }
  }

  function wireBagModal() {
    ensureCharBagModalOnBody();
    var ov = $('char-bag-modal-overlay');
    var closeBtn = $('char-bag-modal-close');
    var equipBtn = $('char-bag-modal-equip');
    if (closeBtn) closeBtn.addEventListener('click', closeBagModal);
    if (ov) {
      ov.addEventListener('click', function (e) {
        if (e.target === ov) closeBagModal();
      });
    }
    if (equipBtn) {
      equipBtn.addEventListener('click', function () {
        var id = equipBtn.getAttribute('data-item-id');
        if (!id) return;
        var ben = equipBtn.getAttribute('data-item-enchant');
        closeBagModal();
        apiEquip(Number(id), ben != null ? Number(ben) : 0);
      });
    }
    var useBtn = $('char-bag-modal-use');
    var useQty = $('char-bag-modal-use-qty');
    if (useBtn) {
      useBtn.addEventListener('click', function () {
        if (!bagModalCtx || bagModalCtx.itemId == null) return;
        var q = useQty ? Number(useQty.value) : 1;
        if (!Number.isFinite(q) || q < 1) q = 1;
        q = Math.min(Math.max(1, Math.floor(q)), bagModalCtx.qty || 1);
        var useItemId = bagModalCtx.itemId;
        closeBagModal();
        apiUsePotion(useItemId, q);
      });
    }
    if (useQty) {
      useQty.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (useBtn && !useBtn.hidden) useBtn.click();
        }
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var m = $('char-bag-modal-overlay');
      if (!m || m.hidden) return;
      e.preventDefault();
      closeBagModal();
    });
  }

  async function init() {
    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          var el = $('char-stub-msg');
          if (el) {
            el.hidden = false;
            el.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
          }
        },
      });
    }
    if (window.L2 && typeof L2.mountFootLinkBar === 'function') {
      L2.mountFootLinkBar('l2-foot-links', { inset: true });
    }

    document.querySelectorAll('.l2-char-mobi [data-stub]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var label = btn.getAttribute('data-stub');
        if (!label) return;
        var msg = $('char-stub-msg');
        if (msg) {
          msg.hidden = false;
          msg.textContent = '«' + label + '» — заглушка, з’явиться пізніше.';
        }
      });
    });

    wireBagClicks();
    wireBagInvFilters();
    wireBagModal();
    wireEquipSlotClicks();

    var errEl = $('char-load-err');
    var content = $('char-content');
    var t = localStorage.getItem('token');

    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (content) content.hidden = true;
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (content) content.hidden = false;
    var nbEarly = $('char-name-bracket');
    if (nbEarly) nbEarly.textContent = '…';

    loadCraftBookForChar(t);

    var snap =
      window.L2 && typeof L2.fetchSnapshot === 'function'
        ? await L2.fetchSnapshot()
        : null;
    if (!snap) {
      if (content) content.hidden = true;
      if (!localStorage.getItem('token')) {
        window.location.href = '/';
        return;
      }
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити персонажа.';
      }
      return;
    }

    var nb = $('char-name-bracket');
    if (nb && snap.name != null && snap.level != null) {
      nb.textContent = String(snap.name) + '[' + String(snap.level) + ']';
    }

    if (errEl) errEl.hidden = true;
    if (content) content.hidden = false;

    renderAll(snap);
  }

  init();
})();
