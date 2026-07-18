/**
 * Панель швидкого доступу в бою (як text-rpg SkillBar): слоти, модалка.
 * Розкладка зберігається в localStorage (per characterId). Нижнє меню сторінки не чіпаємо.
 */
(function (global) {
  var HOTBAR_SLOTS = 41;
  var HOTBAR_GRID_COLS = 7;

  /** ItemId зарядів душі воїна — узгоджено з `fighterPhysicalSoulshot.ts`. */
  var FIGHTER_SOULSHOT_ITEM_IDS = {
    1835: true,
    1463: true,
    1464: true,
    1465: true,
    1466: true,
    1467: true,
  };

  /** Благословені заряди духу (маг) — узгоджено з `mysticBlessedSpiritshot.ts`. */
  var MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS = {
    3947: true,
    3948: true,
    3949: true,
    3950: true,
    3951: true,
    3952: true,
  };

  /** HP/MP зілля в бою — `battleCombatPotions.ts`. */
  var BATTLE_POTION_ITEM_IDS = {
    1060: true,
    1061: true,
    726: true,
    728: true,
  };

  function bagQtyPlain(character, itemId) {
    var inv = character && character.inventory;
    if (!inv || !Array.isArray(inv.stacks)) return 0;
    var n = 0;
    for (var qi = 0; qi < inv.stacks.length; qi++) {
      var st = inv.stacks[qi];
      if (!st || st.itemId !== itemId) continue;
      if ((st.enchant || 0) !== 0) continue;
      n += st.qty || 0;
    }
    return n;
  }

  /**
   * Fallback, якщо в /game/battle немає l2SkillId (має завжди бути з сервера).
   * Числа збігаються з `l2SkillIdForBattleActionIcon` у humanFighterSkillCatalog.ts і каталогом магістра.
   */
  var ACTION_L2_ICON = {
    attack: 1,
    power: 3,
    bolt: 1177,
    stun: 100,
    power_strike: 3,
    mortal_blow: 16,
    power_shot: 56,
    double_shot: 19,
    burst_shot: 24,
    war_cry: 78,
    dash: 4,
    rapid_shot: 99,
    hawk_eye: 131,
    soul_of_sagittarius: 303,
    snipe: 313,
    stun_shot: 101,
    lethal_shot: 343,
    hamstring_shot: 354,
    stun_attack: 100,
    wild_sweep: 245,
    power_smash: 255,
    whirlwind: 36,
    thunder_storm: 48,
    provoke: 286,
    accuracy_stance: 256,
    vicious_stance: 312,
    parry_stance: 339,
    riposte_stance: 340,
    detect_insect_weakness: 75,
    detect_monster_weakness: 80,
    detect_animal_weakness: 87,
    detect_dragon_weakness: 88,
    detect_plant_weakness: 104,
    howl: 116,
    battle_roar: 121,
    thrill_fight: 130,
    revival: 181,
    lionheart: 287,
    focus_attack: 317,
    wrath: 320,
    earthquake: 347,
    eye_hunter: 359,
    eye_slayer: 360,
    shock_blast: 361,
    backstab: 30,
    deadly_blow_dagger: 263,
    switch_target: 12,
    unlock: 27,
    lure: 51,
    fake_death: 60,
    ultimate_evasion: 111,
    silent_move: 221,
    lethal_blow_adv: 344,
    focus_chance: 356,
    focus_power: 357,
    bluff: 358,
    aggression: 28,
    hate_aura: 18,
    divine_heal: 45,
    remedy: 44,
    holy_strike: 49,
    drain_health: 70,
    majesty: 82,
    ultimate_defense: 110,
    deflect_arrow: 112,
    shield_stun: 92,
    shield_slam: 353,
    sanctuary: 97,
    aegis_stance: 318,
    horror: 65,
    reflect_damage: 86,
    corpse_plague: 103,
    hamstring_slash: 127,
    summon_dark_panther: 283,
    shield_fortress: 322,
    fortitude: 335,
    touch_of_life: 341,
    touch_of_death: 342,
    physical_mirror: 350,
    vengeance: 368,
    zealot: 420,
    triple_slash: 1,
    double_sonic_slash: 5,
    sonic_blaster: 6,
    sonic_storm: 7,
    sonic_focus: 8,
    sonic_buster: 9,
    fatal_strike: 190,
    hammer_crush: 260,
    triple_sonic_slash: 261,
    sonic_guard: 442,
    sonic_rage: 345,
    sonic_move: 451,
    l2_94: 94,
    l2_139: 139,
  };

  /**
   * Канонічний battleId з каталогу (`l2_256`) → id дії для POST /game/battle/action.
   * У localStorage могли зберегти `l2_*` — без цього сервер відхиляв «Невідома дія».
   * Узгоджено з `CANONICAL_L2_SKILL_TO_BATTLE_ACTION` у humanFighterSkillCatalog.ts.
   */
  var L2_BATTLE_ID_TO_ACTION = {
    l2_3: 'power_strike',
    l2_16: 'mortal_blow',
    l2_56: 'power_shot',
    l2_19: 'double_shot',
    l2_24: 'burst_shot',
    l2_78: 'war_cry',
    l2_4: 'dash',
    l2_99: 'rapid_shot',
    l2_131: 'hawk_eye',
    l2_303: 'soul_of_sagittarius',
    l2_101: 'stun_shot',
    l2_313: 'snipe',
    l2_343: 'lethal_shot',
    l2_354: 'hamstring_shot',
    l2_100: 'stun_attack',
    l2_245: 'wild_sweep',
    l2_255: 'power_smash',
    l2_36: 'whirlwind',
    l2_48: 'thunder_storm',
    l2_286: 'provoke',
    l2_256: 'accuracy_stance',
    l2_312: 'vicious_stance',
    l2_339: 'parry_stance',
    l2_340: 'riposte_stance',
    l2_75: 'detect_insect_weakness',
    l2_80: 'detect_monster_weakness',
    l2_87: 'detect_animal_weakness',
    l2_88: 'detect_dragon_weakness',
    l2_104: 'detect_plant_weakness',
    l2_116: 'howl',
    l2_121: 'battle_roar',
    l2_130: 'thrill_fight',
    l2_181: 'revival',
    l2_287: 'lionheart',
    l2_317: 'focus_attack',
    l2_320: 'wrath',
    l2_347: 'earthquake',
    l2_359: 'eye_hunter',
    l2_360: 'eye_slayer',
    l2_361: 'shock_blast',
    l2_30: 'backstab',
    l2_263: 'deadly_blow_dagger',
    l2_12: 'switch_target',
    l2_27: 'unlock',
    l2_51: 'lure',
    l2_60: 'fake_death',
    l2_111: 'ultimate_evasion',
    l2_221: 'silent_move',
    l2_344: 'lethal_blow_adv',
    l2_356: 'focus_chance',
    l2_357: 'focus_power',
    l2_358: 'bluff',
    l2_28: 'aggression',
    l2_45: 'divine_heal',
    l2_262: 'holy_blessing',
    l2_69: 'sacrifice',
    l2_72: 'iron_will',
    l2_18: 'hate_aura',
    l2_44: 'remedy',
    l2_49: 'holy_strike',
    l2_70: 'drain_health',
    l2_82: 'majesty',
    l2_92: 'shield_stun',
    l2_353: 'shield_slam',
    l2_110: 'ultimate_defense',
    l2_112: 'deflect_arrow',
    l2_97: 'sanctuary',
    l2_318: 'aegis_stance',
    l2_65: 'horror',
    l2_86: 'reflect_damage',
    l2_103: 'corpse_plague',
    l2_127: 'hamstring_slash',
    l2_283: 'summon_dark_panther',
    l2_322: 'shield_fortress',
    l2_335: 'fortitude',
    l2_341: 'touch_of_life',
    l2_342: 'touch_of_death',
    l2_350: 'physical_mirror',
    l2_368: 'vengeance',
    l2_420: 'zealot',
    l2_1: 'triple_slash',
    l2_5: 'double_sonic_slash',
    l2_6: 'sonic_blaster',
    l2_7: 'sonic_storm',
    l2_8: 'sonic_focus',
    l2_9: 'sonic_buster',
    l2_190: 'fatal_strike',
    l2_260: 'hammer_crush',
    l2_261: 'triple_sonic_slash',
    l2_442: 'sonic_guard',
    l2_345: 'sonic_rage',
    l2_451: 'sonic_move',
    l2_94: 'l2_94',
    l2_139: 'l2_139',
  };

  function canonicalBattleActionId(id) {
    if (typeof id !== 'string' || !id) return id;
    var t = id.trim().replace(/^L2_/i, 'l2_');
    return L2_BATTLE_ID_TO_ACTION[t] != null ? L2_BATTLE_ID_TO_ACTION[t] : t;
  }

  /** Рядок `battle.skills[].id` може бути `zealot` або `l2_420` — зіставляємо з канонічною дією. */
  function battleSkillRowMatchesAction(skillRowId, canonicalActionId) {
    if (typeof skillRowId !== 'string' || !skillRowId) return false;
    var aid = String(canonicalActionId || '').trim();
    var sid = String(skillRowId).trim();
    if (sid === aid) return true;
    var toAct = L2_BATTLE_ID_TO_ACTION[sid];
    if (toAct != null && toAct === aid) return true;
    return false;
  }

  /** Видалені скіли — не показувати в «Магія» (захист від кешу/залишків). l2 297 — колишній Дух дуелянта. */
  var BLOCKED_L2_SKILL = { 297: true };
  function isBlockedBattleSkillRow(sk) {
    if (!sk || typeof sk !== 'object') return true;
    if (sk.id === 'duelist_spirit') return true;
    if (typeof sk.l2SkillId === 'number' && BLOCKED_L2_SKILL[sk.l2SkillId]) return true;
    if (typeof sk.labelUk === 'string' && /Дух дуелянта|Duelist Spirit/i.test(sk.labelUk)) {
      return true;
    }
    return false;
  }
  function filterBattleSkillsForUi(skills) {
    if (!skills || !skills.length) return [];
    var out = [];
    for (var i = 0; i < skills.length; i++) {
      if (!isBlockedBattleSkillRow(skills[i])) out.push(skills[i]);
    }
    return out;
  }

  /** l2SkillId з відповіді /game/battle для правильної іконки. */
  function l2SkillIdForBattleAction(battle, actionId) {
    var aid = canonicalBattleActionId(actionId);
    var skills = filterBattleSkillsForUi((battle && battle.skills) || []);
    for (var i = 0; i < skills.length; i++) {
      if (battleSkillRowMatchesAction(skills[i].id, aid)) {
        var n = skills[i].l2SkillId;
        return typeof n === 'number' && n > 0 ? n : null;
      }
    }
    return null;
  }

  function skillIconUrlForBattleAction(battle, actionId) {
    var aid = canonicalBattleActionId(actionId);
    var skills = filterBattleSkillsForUi((battle && battle.skills) || []);
    for (var i = 0; i < skills.length; i++) {
      if (!battleSkillRowMatchesAction(skills[i].id, aid)) continue;
      return skillIconUrl(
        aid,
        skills[i].l2SkillId,
        skills[i].iconUrl
      );
    }
    return skillIconUrl(aid, l2SkillIdForBattleAction(battle, aid));
  }

  function mergeCharacterCatalog(j) {
    if (!j || !global.L2) return;
    if (j.gearCatalog && L2.mergeGearCatalog) {
      L2.mergeGearCatalog(j.gearCatalog);
    }
    if (L2.mergeCraftResourceIconHints) {
      L2.mergeCraftResourceIconHints(j);
    }
    if (j.itemNamesEn && typeof j.itemNamesEn === 'object' && L2.itemNameById) {
      Object.keys(j.itemNamesEn).forEach(function (k) {
        L2.itemNameById[k] = j.itemNamesEn[k];
      });
    } else if (j.itemNamesUk && typeof j.itemNamesUk === 'object' && L2.itemNameById) {
      Object.keys(j.itemNamesUk).forEach(function (k) {
        L2.itemNameById[k] = j.itemNamesUk[k];
      });
    }
    if (j.itemSlotHints && typeof j.itemSlotHints === 'object' && L2.itemSlotById) {
      Object.keys(j.itemSlotHints).forEach(function (k) {
        if (L2.itemSlotById[k] == null) {
          L2.itemSlotById[k] = j.itemSlotHints[k];
        }
      });
    }
    if (
      j.itemInventoryTabHints &&
      typeof j.itemInventoryTabHints === 'object' &&
      L2.itemInventoryTabById
    ) {
      Object.keys(j.itemInventoryTabHints).forEach(function (k) {
        if (L2.itemInventoryTabById[k] == null) {
          L2.itemInventoryTabById[k] = j.itemInventoryTabHints[k];
        }
      });
    }
    if (j.itemGradeHints && typeof j.itemGradeHints === 'object' && L2.itemGradeById) {
      Object.keys(j.itemGradeHints).forEach(function (k) {
        L2.itemGradeById[k] = j.itemGradeHints[k];
      });
    }
    if (j.itemStatsHints && typeof j.itemStatsHints === 'object' && L2.itemStatsById) {
      Object.keys(j.itemStatsHints).forEach(function (k) {
        var st = j.itemStatsHints[k];
        if (!st || typeof st !== 'object') return;
        var prev = L2.itemStatsById[k] || {};
        L2.itemStatsById[k] = Object.assign({}, prev, st);
      });
    }
    if (
      j.itemBlocksShieldById &&
      typeof j.itemBlocksShieldById === 'object' &&
      L2.itemBlocksShieldById
    ) {
      Object.keys(j.itemBlocksShieldById).forEach(function (k) {
        L2.itemBlocksShieldById[k] = j.itemBlocksShieldById[k];
      });
    }
  }

  function appendHotbarPickImg(button, src) {
    var safe =
      global.L2 && typeof L2.sanitizeClientIconUrl === 'function'
        ? L2.sanitizeClientIconUrl(src)
        : src;
    var img = document.createElement('img');
    img.src = safe;
    img.alt = '';
    img.className = 'l2-battle-hotbar-pick-img';
    img.loading = 'lazy';
    button.appendChild(img);
  }

  function skillIconUrl(actionId, l2SkillId, iconUrlHint) {
    /* Файл з пакета: public/skills/attack.jpg (не обов’язково той самий арт, що 0001.jpg). */
    if (actionId === 'attack') {
      return '/skills/attack.jpg';
    }
    if (iconUrlHint && String(iconUrlHint).charAt(0) === '/') {
      return global.L2 && typeof L2.sanitizeClientIconUrl === 'function'
        ? L2.sanitizeClientIconUrl(String(iconUrlHint))
        : String(iconUrlHint);
    }
    if (global.L2 && typeof L2.resolveSkillIconUrl === 'function') {
      var fallbackN =
        typeof l2SkillId === 'number' && l2SkillId > 0
          ? l2SkillId
          : ACTION_L2_ICON[actionId] != null
            ? ACTION_L2_ICON[actionId]
            : 1;
      return L2.resolveSkillIconUrl(fallbackN, null);
    }
    if (typeof l2SkillId === 'number' && l2SkillId > 0) {
      return '/game/skill-icon/' + l2SkillId;
    }
    var n = ACTION_L2_ICON[actionId] != null ? ACTION_L2_ICON[actionId] : 1;
    return '/game/skill-icon/' + n;
  }

  function itemIconUrl(itemId) {
    if (global.L2 && typeof L2.resolveItemIconUrl === 'function') {
      return L2.resolveItemIconUrl(itemId, '/icons/drops/other.svg');
    }
    if (itemId > 0) return '/game/item-icon/' + itemId;
    return '/icons/drops/other.svg';
  }

  function itemIconUrlForBattleItem(itemId) {
    return itemIconUrl(itemId);
  }

  function itemNameUk(itemId) {
    var n = global.L2 && L2.itemNameById && L2.itemNameById[itemId];
    return n != null ? n : '#' + itemId;
  }

  function labelForBattleAction(battle, actionId) {
    var aid = canonicalBattleActionId(actionId);
    var skills = filterBattleSkillsForUi((battle && battle.skills) || []);
    for (var i = 0; i < skills.length; i++) {
      if (battleSkillRowMatchesAction(skills[i].id, aid)) {
        return skills[i].labelUk || aid;
      }
    }
    return aid;
  }

  function storageKey(characterId) {
    return 'l2dop_battle_hotbar_v3_' + characterId;
  }

  function slotsHaveContent(slots) {
    if (!slots || !slots.length) return false;
    for (var hi = 0; hi < slots.length; hi++) {
      if (slots[hi]) return true;
    }
    return false;
  }

  function loadSlots(characterId, serverSlots) {
    var out = new Array(HOTBAR_SLOTS);
    for (var i = 0; i < HOTBAR_SLOTS; i++) out[i] = null;
    if (!characterId) return out;

    if (serverSlots && Array.isArray(serverSlots)) {
      var fromServer = [];
      var hasServer = false;
      for (var si = 0; si < HOTBAR_SLOTS; si++) {
        var norm =
          si < serverSlots.length ? normalizeSlot(serverSlots[si]) : null;
        fromServer[si] = norm;
        if (norm) hasServer = true;
      }
      if (hasServer) return fromServer;
    }

    try {
      var raw = localStorage.getItem(storageKey(characterId));
      if (!raw) {
        raw = localStorage.getItem('l2dop_battle_hotbar_v2_' + characterId);
      }
      if (!raw) {
        raw = localStorage.getItem('l2dop_battle_hotbar_v1_' + characterId);
      }
      if (!raw) return out;
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return out;
      for (var j = 0; j < HOTBAR_SLOTS; j++) {
        out[j] = j < arr.length ? normalizeSlot(arr[j]) : null;
      }
      return out;
    } catch (e) {
      return out;
    }
  }

  function normalizeSlot(x) {
    if (x == null) return null;
    if (typeof x === 'object' && x.k === 'a' && typeof x.a === 'string') {
      return { k: 'a', a: canonicalBattleActionId(x.a) };
    }
    if (typeof x === 'object' && x.k === 'i' && typeof x.id === 'number') {
      return { k: 'i', id: x.id, e: typeof x.e === 'number' ? x.e : 0 };
    }
    if (typeof x === 'object' && x.k === 'u' && typeof x.id === 'number') {
      return { k: 'u', id: Math.floor(x.id) };
    }
    return null;
  }

  var hotbarPersistCtx = null;
  var hotbarPersistTimer = null;
  var hotbarPersistQueue = Promise.resolve();
  var hotbarPersistSeq = 0;
  /** Локальні зміни панелі ще не на сервері — не перезаписувати зі snapshot. */
  var hotbarSlotsDirty = false;

  function setHotbarPersistCtx(ctx) {
    hotbarPersistCtx = ctx;
  }

  function hotbarSlotsSignature(slots) {
    try {
      return JSON.stringify(slots || []);
    } catch (eSig) {
      return '';
    }
  }

  function applyHotbarSlotsLocally(characterId, slots, characterOpt) {
    if (!characterId || !slots) return;
    try {
      localStorage.setItem(storageKey(characterId), JSON.stringify(slots));
    } catch (eStore) {
      /* ignore */
    }
    if (characterOpt) {
      characterOpt.battleHotbarSlots = slots.slice();
    }
    hotbarSlotsDirty = false;
  }

  function scheduleHotbarPersist(character, slots) {
    if (!hotbarPersistCtx || !character || !character.id) return;
    if (hotbarPersistTimer != null) clearTimeout(hotbarPersistTimer);
    hotbarPersistTimer = setTimeout(function () {
      hotbarPersistTimer = null;
      enqueueHotbarPersist(character, slots);
    }, 500);
  }

  function enqueueHotbarPersist(character, slots) {
    var seq = ++hotbarPersistSeq;
    hotbarPersistQueue = hotbarPersistQueue
      .catch(function () {
        /* keep queue alive */
      })
      .then(function () {
        return flushHotbarPersist(character, slots, seq);
      });
    return hotbarPersistQueue;
  }

  async function flushHotbarPersist(character, slots, seq) {
    if (seq !== hotbarPersistSeq) return;
    var ctx = hotbarPersistCtx;
    if (!ctx) return;
    if (window.L2 && window.L2.battleMutationInFlight) {
      enqueueHotbarPersist(character, slots);
      return;
    }
    var t = ctx.getToken ? ctx.getToken() : null;
    if (!t) return;
    var c = ctx.getCharacter ? ctx.getCharacter() : character;
    if (!c || !c.id) return;
    try {
      var r = await fetch('/game/battle/hotbar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({
          slots: slots,
          characterId: c.id,
        }),
      });
      if (seq !== hotbarPersistSeq) return;
      if (r.status === 401) {
        if (window.L2 && L2.setToken) L2.setToken(null);
        window.location.href = '/';
        return;
      }
      if (!r.ok) return;
      var j = await r.json().catch(function () {
        return null;
      });
      if (!j || !j.ok || !j.battleHotbarSlots) return;
      applyHotbarSlotsLocally(c.id, j.battleHotbarSlots, c);
      if (typeof ctx.onHotbarPersisted === 'function') {
        ctx.onHotbarPersisted(j.battleHotbarSlots, c.id);
      } else if (typeof ctx.renderHotbar === 'function') {
        ctx.renderHotbar();
      }
    } catch (e) {
      /* ignore */
    }
  }

  function saveSlots(characterId, slots, characterOpt) {
    if (!characterId) return;
    try {
      localStorage.setItem(storageKey(characterId), JSON.stringify(slots));
    } catch (e) {
      /* ignore */
    }
    if (characterOpt) {
      hotbarSlotsDirty = true;
      characterOpt.battleHotbarSlots = slots.slice();
      scheduleHotbarPersist(characterOpt, slots);
    }
  }

  /**
   * Узгоджено з `BATTLE_ACTIONS_NO_MOB_HP` у `server/src/domain/battle.ts`:
   * бафи/тогли не залежать від `battle.skills` у пікері — інакше слоти без жовтої «недоступно».
   * Фактична перевірка — лише на сервері.
   */
  var BUFF_TOGGLE_ACTION_IDS = {
    war_cry: true,
    dash: true,
    rapid_shot: true,
    hawk_eye: true,
    soul_of_sagittarius: true,
    snipe: true,
    battle_roar: true,
    accuracy_stance: true,
    vicious_stance: true,
    parry_stance: true,
    riposte_stance: true,
    detect_insect_weakness: true,
    detect_monster_weakness: true,
    detect_animal_weakness: true,
    detect_dragon_weakness: true,
    detect_plant_weakness: true,
    howl: true,
    thrill_fight: true,
    revival: true,
    lionheart: true,
    eye_hunter: true,
    eye_slayer: true,
    focus_attack: true,
    provoke: true,
    fake_death: true,
    silent_move: true,
    ultimate_evasion: true,
    aegis_stance: true,
    iron_will: true,
    shield_fortress: true,
    fortitude: true,
    holy_blessing: true,
    majesty: true,
    ultimate_defense: true,
    deflect_arrow: true,
    zealot: true,
    l2_94: true,
    l2_139: true,
  };

  function allowedActionsSet(battle) {
    var o = Object.create(null);
    var skills = filterBattleSkillsForUi((battle && battle.skills) || []);
    for (var i = 0; i < skills.length; i++) {
      o[skills[i].id] = true;
      var ca = canonicalBattleActionId(skills[i].id);
      if (ca && ca !== skills[i].id) o[ca] = true;
    }
    for (var bid in BUFF_TOGGLE_ACTION_IDS) {
      if (BUFF_TOGGLE_ACTION_IDS[bid]) {
        o[bid] = true;
      }
    }
    return o;
  }

  /**
   * Лише явно заборонені id (не синхронізуємо з battle.skills — інакше стійки/рідкі дії зникали з панелі).
   */
  function sanitizeSlotsAgainstBattle(slots, characterId, character) {
    var out = slots.slice();
    var changed = false;
    for (var i = 0; i < out.length; i++) {
      var s = out[i];
      if (s && s.k === 'a' && s.a === 'duelist_spirit') {
        out[i] = null;
        changed = true;
      }
      if (s && (s.k === 'i' || s.k === 'u') && bagQtyPlain(character, s.id) < 1) {
        out[i] = null;
        changed = true;
      }
    }
    if (changed && characterId) {
      saveSlots(characterId, out, character);
    }
    return out;
  }

  function weaponStacksFromInventory(character) {
    var inv = character && character.inventory;
    if (!inv || !Array.isArray(inv.stacks)) return [];
    var out = [];
    for (var i = 0; i < inv.stacks.length; i++) {
      var s = inv.stacks[i];
      if (!s || s.qty < 1) continue;
      var id = s.itemId;
      var sl = global.L2 && L2.itemSlotById && L2.itemSlotById[id];
      if (sl === 'rhand') {
        out.push({ itemId: id, enchant: s.enchant || 0, qty: s.qty });
      }
    }
    return out;
  }

  function isConsumableBagRow(itemId) {
    var sl = global.L2 && L2.itemSlotById && L2.itemSlotById[itemId];
    if (sl === 'consumable') return true;
    var tab =
      global.L2 && L2.itemInventoryTabById && L2.itemInventoryTabById[itemId];
    return tab === 'consumable';
  }

  function consumableStacksFromInventory(character) {
    var inv = character && character.inventory;
    if (!inv || !Array.isArray(inv.stacks)) return [];
    var out = [];
    for (var i = 0; i < inv.stacks.length; i++) {
      var s = inv.stacks[i];
      if (!s || s.qty < 1) continue;
      var id = s.itemId;
      if (!isConsumableBagRow(id)) continue;
      out.push({ itemId: id, qty: s.qty });
    }
    out.sort(function (a, b) {
      return a.itemId - b.itemId;
    });
    return out;
  }

  /** Запас на межі КД: узгоджено з сервером `COOLDOWN_READY_GRACE_MS` (50 ms). */
  var SKILL_CD_UI_GRACE_MS = 50;

  /** Тривалість КД у мс — як `skillCooldownDurationMs` на сервері. */
  function skillCooldownDurationMs(cdSec) {
    if (typeof cdSec !== 'number' || !Number.isFinite(cdSec) || cdSec <= 0) {
      return 0;
    }
    return Math.max(0, Math.round(cdSec * 1000));
  }

  /** Секунди для overlay: ceil — 999 ms → 1 с; 0 ms → доступний. */
  function skillCooldownDisplaySec(remainingMs) {
    if (
      typeof remainingMs !== 'number' ||
      !Number.isFinite(remainingMs) ||
      remainingMs <= 0
    ) {
      return 0;
    }
    return Math.max(1, Math.ceil(remainingMs / 1000));
  }

  /**
   * @param {{ container: HTMLElement, getBattle: function(): object, getCharacter: function(): object, setCharacter: function(c: object): void, onBattleAction: function(actionId: string): void, onFighterSoulshotToggle?: function(itemId: number): void, onMysticSpiritshotToggle?: function(itemId: number): void, onBattlePotionUse?: function(itemId: number): void, getToken: function(): string|null, showToast: function(msg: string): void }} opts
   */
  function mountBattleHotbar(opts) {
    var modal = null;
    var pickerSlot = null;
    var category = 'magic';
    var slotsCache = [];
    var slotsLoadedForCharacterId = null;
    var slotsLoadedSig = '';
    var cdTimer = null;
    var equipInFlight = false;
    /** Локальний КД (лише дзеркало серверного), ключі як у `mysticSkillCdUntil`. */
    var localCdUntil = Object.create(null);
    /** Фіксована тривалість поточного КД для sweep (legacy; sweep вимкнено). */
    var localCdDuration = Object.create(null);

    function estimatedServerNowMs() {
      var off =
        typeof opts.getServerTimeOffsetMs === 'function'
          ? opts.getServerTimeOffsetMs()
          : 0;
      return Date.now() + (typeof off === 'number' && Number.isFinite(off) ? off : 0);
    }

    function cdTrackKey(aid, rowL2) {
      if (typeof rowL2 === 'number' && rowL2 > 0) {
        return 'l2_' + Math.floor(rowL2);
      }
      return String(aid || '');
    }

    function ensureCdDuration(trackKey, until, cdSec, now) {
      var remMs = until - now;
      if (remMs <= 0) {
        delete localCdDuration[trackKey];
        return 100;
      }
      var prev = localCdDuration[trackKey];
      if (!prev || until > prev.until + 80) {
        /** Джерело правди — `until` з сервера; не роздувати cdMs через `cooldownSec`. */
        var cdMs = Math.max(remMs, 100);
        localCdDuration[trackKey] = { until: until, cdMs: cdMs };
        return cdMs;
      }
      prev.until = until;
      /** Якщо сервер скоротив until — підтягуємо тривалість sweep. */
      if (remMs < prev.cdMs) {
        prev.cdMs = Math.max(remMs, 100);
      }
      return prev.cdMs;
    }

    function clearCdDurationForAction(aid, rowL2) {
      delete localCdDuration[cdTrackKey(aid, rowL2)];
    }

    function clearCdTimer() {
      if (cdTimer != null) {
        clearInterval(cdTimer);
        cdTimer = null;
      }
    }

    function skillRowForAction(battle, actionId) {
      if (!battle) return null;
      var aid = canonicalBattleActionId(actionId);
      var skills = filterBattleSkillsForUi(battle.skills || []);
      for (var i = 0; i < skills.length; i++) {
        if (battleSkillRowMatchesAction(skills[i].id, aid)) return skills[i];
      }
      return null;
    }

    function cdInfoForAction(battle, actionId) {
      var aid = canonicalBattleActionId(actionId);
      var row = skillRowForAction(battle, actionId);
      var cdSec = null;
      var rowL2 = null;
      if (row) {
        if (typeof row.cooldownSec === 'number' && row.cooldownSec > 0) {
          cdSec = row.cooldownSec;
        }
        if (typeof row.l2SkillId === 'number' && row.l2SkillId > 0) {
          rowL2 = row.l2SkillId;
        }
      }
      if (cdSec == null && aid === 'zealot') cdSec = 900;
      if (cdSec == null && (aid === 'attack' || aid === 'bolt')) cdSec = 0.5;
      return { aid: aid, cdSec: cdSec, rowL2: rowL2 };
    }

    function stampLocalCd(aid, rowL2, untilMs) {
      if (typeof untilMs !== 'number' || !Number.isFinite(untilMs)) return;
      localCdUntil[aid] = untilMs;
      if (typeof rowL2 === 'number' && rowL2 > 0) {
        localCdUntil['l2_' + Math.floor(rowL2)] = untilMs;
      }
      if (ACTION_L2_ICON[aid] != null) {
        localCdUntil['l2_' + ACTION_L2_ICON[aid]] = untilMs;
      }
      var battle = opts.getBattle();
      var info = cdInfoForAction(battle, aid);
      ensureCdDuration(
        cdTrackKey(aid, rowL2),
        untilMs,
        info.cdSec,
        Date.now()
      );
    }

    function clearPendingSkillCd(aid, rowL2) {
      void aid;
      void rowL2;
    }

    function markPendingSkillCd(aid, rowL2) {
      void aid;
      void rowL2;
    }

    function mergedCdMap(battle) {
      var out = Object.create(null);
      var srv = battle && battle.mysticSkillCdUntil;
      if (srv && typeof srv === 'object') {
        for (var sk in srv) {
          if (!Object.prototype.hasOwnProperty.call(srv, sk)) continue;
          var sv = srv[sk];
          if (typeof sv === 'number' && Number.isFinite(sv)) out[sk] = sv;
        }
      }
      var estNow = estimatedServerNowMs();
      for (var lk in localCdUntil) {
        if (!Object.prototype.hasOwnProperty.call(localCdUntil, lk)) continue;
        var lv = localCdUntil[lk];
        if (typeof lv !== 'number' || !Number.isFinite(lv) || lv <= estNow) continue;
        if (!Object.prototype.hasOwnProperty.call(out, lk) || lv > out[lk]) {
          out[lk] = lv;
        }
      }
      return out;
    }

    function syncLocalCdFromBattle(battle) {
      var srv = battle && battle.mysticSkillCdUntil;
      if (!srv || typeof srv !== 'object') {
        localCdUntil = Object.create(null);
        localCdDuration = Object.create(null);
        return;
      }
      var estNow = estimatedServerNowMs();
      var nextLocal = Object.create(null);
      for (var k in srv) {
        if (!Object.prototype.hasOwnProperty.call(srv, k)) continue;
        var v = srv[k];
        if (typeof v !== 'number' || !Number.isFinite(v)) continue;
        if (v > estNow) nextLocal[k] = v;
      }
      localCdUntil = nextLocal;
      for (var dk in localCdDuration) {
        if (!Object.prototype.hasOwnProperty.call(localCdDuration, dk)) continue;
        var dur = localCdDuration[dk];
        if (!dur || typeof dur.until !== 'number' || dur.until <= estNow) {
          delete localCdDuration[dk];
        }
      }
    }

    function pruneLocalCd(now) {
      for (var k in localCdUntil) {
        if (!Object.prototype.hasOwnProperty.call(localCdUntil, k)) continue;
        if (localCdUntil[k] <= now) {
          delete localCdUntil[k];
        }
      }
      for (var dk in localCdDuration) {
        if (!Object.prototype.hasOwnProperty.call(localCdDuration, dk)) continue;
        var dur = localCdDuration[dk];
        if (!dur || typeof dur.until !== 'number' || dur.until <= now) {
          delete localCdDuration[dk];
        }
      }
    }

    /** КД: `cooldownSec` з battle.skills + `mysticSkillCdUntil` (ключі `l2_<id>` або дія). */
    function mysticCdUntilForAction(m, aid, l2SkillId) {
      if (!m || typeof m !== 'object') return null;
      var until = m[aid];
      if (typeof until === 'number' && Number.isFinite(until)) return until;
      if (typeof l2SkillId === 'number' && l2SkillId > 0) {
        until = m['l2_' + Math.floor(l2SkillId)];
        if (typeof until === 'number' && Number.isFinite(until)) return until;
      }
      if (ACTION_L2_ICON[aid] != null) {
        until = m['l2_' + ACTION_L2_ICON[aid]];
        if (typeof until === 'number' && Number.isFinite(until)) return until;
      }
      return null;
    }

    /** Канонічний cooldown-ключ (`l2_<id>`) для action. */
    function effectiveCooldownUntilForAction(battle, actionId) {
      if (!battle) return null;
      var info = cdInfoForAction(battle, actionId);
      var m = mergedCdMap(battle);
      var skillUntil = mysticCdUntilForAction(m, info.aid, info.rowL2);
      var atk = m.attack;
      var blt = m.bolt;
      var globalUntil = null;
      if (typeof atk === 'number' || typeof blt === 'number') {
        globalUntil = Math.max(
          typeof atk === 'number' ? atk : 0,
          typeof blt === 'number' ? blt : 0
        );
        if (!Number.isFinite(globalUntil) || globalUntil <= 0) globalUntil = null;
      }
      if (info.aid === 'attack' || info.aid === 'bolt') {
        var parts = [];
        if (typeof skillUntil === 'number') parts.push(skillUntil);
        if (typeof globalUntil === 'number') parts.push(globalUntil);
        if (!parts.length) return null;
        return Math.max.apply(null, parts);
      }
      return typeof skillUntil === 'number' ? skillUntil : null;
    }

    function skillCooldownMeta(battle, actionId) {
      if (!battle) return null;
      var info = cdInfoForAction(battle, actionId);
      var aid = info.aid;
      var cdSec = info.cdSec;
      var rowL2 = info.rowL2;
      var until = effectiveCooldownUntilForAction(battle, actionId);
      if (typeof until !== 'number' || !Number.isFinite(until)) {
        clearCdDurationForAction(aid, rowL2);
        return null;
      }
      var estNow = estimatedServerNowMs();
      var remMs = until - estNow;
      if (remMs <= 0) {
        clearCdDurationForAction(aid, rowL2);
        return null;
      }
      var trackKey = cdTrackKey(aid, rowL2);
      var cdMs = ensureCdDuration(trackKey, until, cdSec, estNow);
      return { until: until, cdMs: cdMs, remMs: remMs };
    }

    /** Чи скіл заблокований КД (сервер + in-flight optimistic). */
    function isSkillOnCooldown(battle, actionId) {
      return skillCooldownMeta(battle, actionId) != null;
    }

    function setCdOverlayVisible(cdRoot, visible) {
      if (!cdRoot) return;
      if (visible) {
        cdRoot.removeAttribute('hidden');
        cdRoot.classList.add('l2-battle-hotbar-slot-cd--on');
      } else {
        cdRoot.setAttribute('hidden', '');
        cdRoot.classList.remove('l2-battle-hotbar-slot-cd--on');
      }
    }

    /** @deprecated КД лише з серверної відповіді — не викликати до action. */
    function primeSkillCd(actionId) {
      void actionId;
    }

    function logSkillCooldownClient(battleNow, actionId) {
      var meta = skillCooldownMeta(battleNow, actionId);
      var info = cdInfoForAction(battleNow, actionId);
      var until =
        meta && typeof meta.until === 'number'
          ? meta.until
          : mysticCdUntilForAction(mergedCdMap(battleNow), info.aid, info.rowL2);
      var estNow = estimatedServerNowMs();
      var remMs =
        typeof until === 'number' && Number.isFinite(until) ? until - estNow : 0;
      var bv =
        typeof opts.getBattleVersion === 'function' ? opts.getBattleVersion() : 0;
      console.log('[skill-cooldown-client]', {
        skillId: info.aid,
        cooldownUntilMs: until,
        estimatedServerNowMs: estNow,
        remainingMs: remMs,
        secondsLeft: skillCooldownDisplaySec(remMs),
        battleVersion: bv,
      });
    }

    function applyServerCooldown(skillId, cooldownUntilMs) {
      if (typeof cooldownUntilMs !== 'number' || !Number.isFinite(cooldownUntilMs)) {
        return;
      }
      var battle = opts.getBattle();
      if (!battle) return;
      if (!battle.mysticSkillCdUntil) battle.mysticSkillCdUntil = {};
      battle.mysticSkillCdUntil[String(skillId)] = cooldownUntilMs;
      stampLocalCd(String(skillId), null, cooldownUntilMs);
    }

    function syncCooldownsFromBattle(battleOpt) {
      var battle = battleOpt || opts.getBattle();
      if (!battle) return;
      syncLocalCdFromBattle(battle);
    }

    function clearBattleCooldowns() {
      localCdUntil = Object.create(null);
      localCdDuration = Object.create(null);
    }

    /** Скасувати локальний КД (помилка мережі — без optimistic prime). */
    function abortPendingSkillCd(actionId, battleOpt) {
      void actionId;
      void battleOpt;
    }

    /** Після успішної дії — синхронізувати КД із snapshot бою. */
    function notifySkillUsed(actionId, battleOpt) {
      var battle = battleOpt || opts.getBattle();
      if (!battle) return;
      syncLocalCdFromBattle(battle);
      var info = cdInfoForAction(battle, actionId);
      clearPendingSkillCd(info.aid, info.rowL2);
      var until = mysticCdUntilForAction(
        mergedCdMap(battle),
        info.aid,
        info.rowL2
      );
      if (typeof until === 'number' && Number.isFinite(until)) {
        stampLocalCd(info.aid, info.rowL2, until);
      }
      var box = opts.container;
      var existing = box && box.querySelector('.l2-battle-hotbar');
      if (existing) {
        updateDynamicState(existing, battle, opts.getCharacter(), slotsCache);
      } else {
        render();
      }
    }

    /**
     * КД на панелі: лише червоні цифри секунд (без conic/sweep обводки).
     */
    function applySkillCdOverlay(cdRoot, meta, tnow) {
      if (!cdRoot) return false;
      var shortEl = cdRoot.querySelector('.l2-battle-hotbar-slot-cd__short');
      var longEl = cdRoot.querySelector('.l2-battle-hotbar-slot-cd__long');
      if (!shortEl || !longEl) return false;
      shortEl.style.background = '';
      shortEl.hidden = true;
      if (
        !meta ||
        typeof meta.until !== 'number' ||
        !Number.isFinite(meta.until)
      ) {
        setCdOverlayVisible(cdRoot, false);
        longEl.textContent = '';
        return false;
      }
      var remMs =
        typeof meta.remMs === 'number' && Number.isFinite(meta.remMs)
          ? meta.remMs
          : meta.until - tnow;
      if (remMs <= 0) {
        setCdOverlayVisible(cdRoot, false);
        longEl.textContent = '';
        return false;
      }
      setCdOverlayVisible(cdRoot, true);
      longEl.textContent = String(skillCooldownDisplaySec(remMs));
      longEl.hidden = false;
      longEl.style.color = '#ff2222';
      longEl.style.webkitTextFillColor = '#ff2222';
      cdRoot.style.color = '#ff2222';
      return true;
    }

    function startCdTicker(wrap) {
      clearCdTimer();
      if (!wrap) return;
      function tick() {
        var battleNow = opts.getBattle();
        if (!battleNow) {
          clearCdTimer();
          return;
        }
        syncLocalCdFromBattle(battleNow);
        pruneLocalCd(estimatedServerNowMs());
        var els = wrap.querySelectorAll('[data-slot-cd]');
        var any = false;
        for (var i = 0; i < els.length; i++) {
          var el = els[i];
          var act = el.getAttribute('data-slot-cd');
          var meta = skillCooldownMeta(battleNow, act);
          if (applySkillCdOverlay(el, meta, estimatedServerNowMs())) any = true;
        }
        if (!any) clearCdTimer();
      }
      tick();
      cdTimer = setInterval(tick, 100);
    }

    function hotbarHasSkillSlots(wrap) {
      return wrap && wrap.querySelector('[data-slot-cd]');
    }

    function ensureModal() {
      if (modal) return modal;
      modal = document.createElement('div');
      modal.className = 'l2-battle-hotbar-modal';
      modal.setAttribute('hidden', '');
      modal.innerHTML =
        '<div class="l2-battle-hotbar-modal__backdrop"></div>' +
        '<div class="l2-battle-hotbar-modal__panel" role="dialog" aria-modal="true">' +
        '<div class="l2-battle-hotbar-modal__head">' +
        '<span class="l2-battle-hotbar-modal__title" id="l2-bh-modal-title"></span>' +
        '<button type="button" class="l2-battle-hotbar-modal__close btn-l2" id="l2-bh-modal-close">Закрити</button>' +
        '</div>' +
        '<div class="l2-battle-hotbar-modal__tabs" id="l2-bh-modal-tabs"></div>' +
        '<div class="l2-battle-hotbar-modal__body" id="l2-bh-modal-body"></div>' +
        '<div class="l2-battle-hotbar-modal__foot">' +
        '<button type="button" class="btn-l2 btn-l2-primary" id="l2-bh-modal-done">Готово</button>' +
        '</div>' +
        '</div>';
      document.body.appendChild(modal);
      modal.querySelector('.l2-battle-hotbar-modal__backdrop').addEventListener('click', closeModal);
      modal.querySelector('#l2-bh-modal-close').addEventListener('click', closeModal);
      modal.querySelector('#l2-bh-modal-done').addEventListener('click', closeModal);
      return modal;
    }

    function closeModal() {
      var m = ensureModal();
      m.setAttribute('hidden', '');
    }

    function openModal() {
      var m = ensureModal();
      m.removeAttribute('hidden');
      syncModalContent();
    }

    function setCategory(cat) {
      category = cat;
      syncModalContent();
    }

    function syncModalContent() {
      var m = ensureModal();
      var battle = opts.getBattle();
      var character = opts.getCharacter();
      var titleEl = m.querySelector('#l2-bh-modal-title');
      var tabsEl = m.querySelector('#l2-bh-modal-tabs');
      var bodyEl = m.querySelector('#l2-bh-modal-body');

      if (category === 'remove') {
        if (titleEl) {
          titleEl.textContent = 'Прибрати з панелі';
        }
      } else if (pickerSlot != null) {
        if (titleEl) {
          titleEl.textContent = 'Оберіть дію для слота ' + (pickerSlot + 1);
        }
      } else {
        if (titleEl) {
          titleEl.textContent = 'Панель швидкого доступу';
        }
      }

      var tabMagic = category === 'magic';
      var tabUse = category === 'consumable';
      var tabItem = category === 'item';
      var tabRm = category === 'remove';

      if (tabsEl) {
        tabsEl.innerHTML = '';
        function addTab(key, label, active) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'l2-battle-hotbar-tab' + (active ? ' l2-battle-hotbar-tab--on' : '');
          b.dataset.tabKey = key;
          b.textContent = label;
          b.addEventListener('click', function () {
            setCategory(key);
          });
          tabsEl.appendChild(b);
        }
        addTab('magic', 'Магія', tabMagic);
        addTab('consumable', 'Розхідники', tabUse);
        addTab('item', 'Предмети', tabItem);
        addTab('remove', 'Прибрати', tabRm);
      }

      if (!bodyEl) return;
      bodyEl.innerHTML = '';

      if (category === 'magic') {
        var grid = document.createElement('div');
        grid.className = 'l2-battle-hotbar-grid';
        var skills = filterBattleSkillsForUi((battle && battle.skills) || []);
        if (skills.length === 0) {
          var empty = document.createElement('p');
          empty.className = 'l2-battle-hotbar-empty';
          empty.textContent = 'Немає доступних скілів.';
          bodyEl.appendChild(empty);
        } else {
          for (var si = 0; si < skills.length; si++) {
            (function (sk) {
              var b = document.createElement('button');
              b.type = 'button';
              b.className = 'l2-battle-hotbar-pick';
              b.title = sk.labelUk || sk.id;
              appendHotbarPickImg(
                b,
                skillIconUrl(sk.id, sk.l2SkillId, sk.iconUrl)
              );
              b.addEventListener('click', function () {
                if (pickerSlot == null) return;
                slotsCache[pickerSlot] = { k: 'a', a: canonicalBattleActionId(sk.id) };
                saveSlots(character.id, slotsCache, character);
                closeModal();
                render();
              });
              grid.appendChild(b);
            })(skills[si]);
          }
          bodyEl.appendChild(grid);
        }
      } else if (category === 'consumable') {
        var cs = consumableStacksFromInventory(character);
        if (cs.length === 0) {
          var pe = document.createElement('p');
          pe.className = 'l2-battle-hotbar-empty';
          pe.textContent =
            'У сумці немає розхідників (зілля, стріли, заряди з крамниці дропів тощо).';
          bodyEl.appendChild(pe);
        } else {
          var gridC = document.createElement('div');
          gridC.className = 'l2-battle-hotbar-grid';
          for (var ci = 0; ci < cs.length; ci++) {
            (function (row) {
              var bc = document.createElement('button');
              bc.type = 'button';
              bc.className = 'l2-battle-hotbar-pick';
              bc.title = itemNameUk(row.itemId) + ' ×' + row.qty;
              appendHotbarPickImg(bc, itemIconUrlForBattleItem(row.itemId));
              bc.addEventListener('click', function () {
                if (pickerSlot == null) return;
                slotsCache[pickerSlot] = { k: 'u', id: row.itemId };
                saveSlots(character.id, slotsCache, character);
                closeModal();
                render();
              });
              gridC.appendChild(bc);
            })(cs[ci]);
          }
          bodyEl.appendChild(gridC);
        }
      } else if (category === 'item') {
        var ws = weaponStacksFromInventory(character);
        if (ws.length === 0) {
          var p2 = document.createElement('p');
          p2.className = 'l2-battle-hotbar-empty';
          p2.textContent = 'Немає зброї в сумці (тип rhand у каталозі).';
          bodyEl.appendChild(p2);
        } else {
          var grid2 = document.createElement('div');
          grid2.className = 'l2-battle-hotbar-grid';
          for (var wi = 0; wi < ws.length; wi++) {
            (function (row) {
              var b2 = document.createElement('button');
              b2.type = 'button';
              b2.className = 'l2-battle-hotbar-pick';
              b2.title = itemNameUk(row.itemId);
              appendHotbarPickImg(b2, itemIconUrlForBattleItem(row.itemId));
              b2.addEventListener('click', function () {
                if (pickerSlot == null) return;
                slotsCache[pickerSlot] = { k: 'i', id: row.itemId, e: row.enchant };
                saveSlots(character.id, slotsCache, character);
                closeModal();
                render();
              });
              grid2.appendChild(b2);
            })(ws[wi]);
          }
          bodyEl.appendChild(grid2);
        }
      } else if (category === 'remove') {
        var filled = [];
        for (var ri = 0; ri < slotsCache.length; ri++) {
          if (slotsCache[ri]) filled.push({ idx: ri, slot: slotsCache[ri] });
        }
        if (filled.length === 0) {
          var p3 = document.createElement('p');
          p3.className = 'l2-battle-hotbar-empty';
          p3.textContent = 'Панель порожня.';
          bodyEl.appendChild(p3);
        } else {
          var grid3 = document.createElement('div');
          grid3.className = 'l2-battle-hotbar-grid';
          for (var fi = 0; fi < filled.length; fi++) {
            (function (ent) {
              var b3 = document.createElement('button');
              b3.type = 'button';
              b3.className = 'l2-battle-hotbar-pick';
              var s = ent.slot;
              var src;
              var tit;
              if (s.k === 'a') {
                var ca = canonicalBattleActionId(s.a);
                src = skillIconUrlForBattleAction(battle, ca);
                tit = labelForBattleAction(battle, ca);
              } else {
                src = itemIconUrlForBattleItem(s.id);
                tit = itemNameUk(s.id);
              }
              b3.title = tit;
              appendHotbarPickImg(b3, src);
              b3.addEventListener('click', function () {
                slotsCache[ent.idx] = null;
                saveSlots(character.id, slotsCache, character);
                syncModalContent();
                render();
              });
              grid3.appendChild(b3);
            })(filled[fi]);
          }
          bodyEl.appendChild(grid3);
        }
      }
    }

    function firstEmptySlotIndex(slots) {
      var lastFilled = -1;
      var firstEmpty = -1;
      for (var i = 0; i < HOTBAR_SLOTS; i++) {
        if (slots[i]) {
          lastFilled = i;
        } else if (firstEmpty < 0) {
          firstEmpty = i;
        }
      }
      if (firstEmpty < 0) return -1;
      var appendIdx = lastFilled + 1;
      if (appendIdx >= 0 && appendIdx < HOTBAR_SLOTS && !slots[appendIdx]) {
        return appendIdx;
      }
      return firstEmpty;
    }

    function battleModTruthy(v) {
      return v === true || v === 1 || v === '1';
    }

    function isRiposteStanceActiveBm(bm) {
      if (!bm || !bm.raceToggleRanks) return false;
      var r = bm.raceToggleRanks.l2_340;
      return typeof r === 'number' && Number.isFinite(r) && r >= 1;
    }

    /** Активні toggle-скілі: `battleMods` (delta) + `battleBuffIcons` (повний snapshot). */
    function activeToggleSkillIdSet(battle) {
      var out = {};
      var bm = battle && battle.battleMods;
      if (bm) {
        if (battleModTruthy(bm.stanceAccuracy)) out[256] = true;
        if (battleModTruthy(bm.stanceVicious)) out[312] = true;
        if (battleModTruthy(bm.stanceParry)) out[339] = true;
        if (battleModTruthy(bm.aegisStanceActive)) out[318] = true;
        if (battleModTruthy(bm.focusAttackActive)) out[317] = true;
        if (isRiposteStanceActiveBm(bm)) out[340] = true;
      }
      var icons = battle && battle.battleBuffIcons;
      if (!icons || !icons.length) return out;
      for (var i = 0; i < icons.length; i++) {
        var b = icons[i];
        if (!b || b.isToggle !== true) continue;
        var sid = Number(b.l2SkillId);
        if (!Number.isFinite(sid) || sid <= 0) continue;
        out[Math.floor(sid)] = true;
      }
      return out;
    }

    function appendFilledSlot(grid, idx, slot, battle, character) {
      var allowed = allowedActionsSet(battle);
      var toggleSkillIds = activeToggleSkillIdSet(battle);
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-battle-hotbar-slot';
      btn.setAttribute('data-slot-idx', String(idx));

      if (slot.k === 'a') {
        var actId = canonicalBattleActionId(slot.a);
        var wrapI = document.createElement('span');
        wrapI.className = 'l2-battle-hotbar-slot-iconwrap';
        var imgA = document.createElement('img');
        imgA.className = 'l2-battle-hotbar-slot-img';
        imgA.alt = '';
        imgA.src = skillIconUrlForBattleAction(battle, actId);
        imgA.addEventListener('error', function () {
          imgA.src = '/icons/drops/other.svg';
        });
        var metaCd = skillCooldownMeta(battle, slot.a);
        var cdEl = document.createElement('span');
        cdEl.className = 'l2-battle-hotbar-slot-cd';
        cdEl.setAttribute('data-slot-cd', actId);
        cdEl.hidden = true;
        var cdShort = document.createElement('span');
        cdShort.className = 'l2-battle-hotbar-slot-cd__short';
        cdShort.setAttribute('aria-hidden', 'true');
        var cdLong = document.createElement('span');
        cdLong.className = 'l2-battle-hotbar-slot-cd__long';
        cdEl.appendChild(cdShort);
        cdEl.appendChild(cdLong);
        wrapI.appendChild(imgA);
        wrapI.appendChild(cdEl);
        if (metaCd) {
          applySkillCdOverlay(cdEl, metaCd, Date.now());
        }
        btn.appendChild(wrapI);
        if (!allowed[actId]) {
          btn.className += ' l2-battle-hotbar-slot--warn';
        }
        var actL2 = l2SkillIdForBattleAction(battle, actId);
        if (
          Number.isFinite(actL2) &&
          actL2 > 0 &&
          toggleSkillIds[Math.floor(actL2)] === true
        ) {
          btn.className += ' l2-battle-hotbar-slot--toggle-on';
        }
        btn.title = labelForBattleAction(battle, slot.a);
        btn.addEventListener('click', function () {
          var actNow = canonicalBattleActionId(slot.a);
          var battleNow = opts.getBattle();
          logSkillCooldownClient(battleNow, actNow);
          if (battleNow && isSkillOnCooldown(battleNow, actNow)) {
            if (typeof opts.showToast === 'function') {
              opts.showToast('Скіл на перезарядці.');
            }
            return;
          }
          opts.onBattleAction(actNow);
        });
      } else if (slot.k === 'i') {
        var imgI = document.createElement('img');
        imgI.className = 'l2-battle-hotbar-slot-img';
        imgI.alt = '';
        imgI.src = itemIconUrlForBattleItem(slot.id);
        imgI.addEventListener('error', function () {
          imgI.src = '/icons/drops/other.svg';
        });
        btn.appendChild(imgI);
        btn.title = itemNameUk(slot.id);
        btn.addEventListener('click', function () {
          var iid = Math.floor(Number(slot.id));
          if (opts.onBattlePotionUse && BATTLE_POTION_ITEM_IDS[iid]) {
            opts.onBattlePotionUse(iid);
            return;
          }
          equipFromBar(slot);
        });
      } else if (slot.k === 'u') {
        var wrapU = document.createElement('span');
        wrapU.className = 'l2-battle-hotbar-slot-iconwrap';
        var imgU = document.createElement('img');
        imgU.className = 'l2-battle-hotbar-slot-img';
        imgU.alt = '';
        imgU.src = itemIconUrlForBattleItem(slot.id);
        imgU.addEventListener('error', function () {
          imgU.src = '/icons/drops/other.svg';
        });
        wrapU.appendChild(imgU);
        btn.appendChild(wrapU);
        var bmU = battle && battle.battleMods;
        var mulU =
          bmU &&
          bmU.fighterSoulshotPatkMul != null &&
          Number(bmU.fighterSoulshotPatkMul) > 1
            ? Number(bmU.fighterSoulshotPatkMul)
            : 0;
        var idU =
          bmU && bmU.fighterSoulshotItemId != null
            ? Math.floor(Number(bmU.fighterSoulshotItemId))
            : 0;
        var soulOn =
          mulU > 1 &&
          idU === slot.id &&
          FIGHTER_SOULSHOT_ITEM_IDS[slot.id] === true;

        var blessedMul =
          bmU &&
          bmU.mysticBlessedSpiritshotMatkMul != null &&
          Number(bmU.mysticBlessedSpiritshotMatkMul) > 1
            ? Number(bmU.mysticBlessedSpiritshotMatkMul)
            : 0;
        var blessedIdU =
          bmU && bmU.mysticBlessedSpiritshotItemId != null
            ? Math.floor(Number(bmU.mysticBlessedSpiritshotItemId))
            : 0;
        var blessedOn =
          blessedMul > 1 &&
          blessedIdU === slot.id &&
          MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS[slot.id] === true;

        if (soulOn || blessedOn) {
          btn.className += ' l2-battle-hotbar-slot--soulshot-on';
        }

        var isSoulRow = FIGHTER_SOULSHOT_ITEM_IDS[slot.id] === true;
        var isBlessRow = MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS[slot.id] === true;
        var isPotionRow = BATTLE_POTION_ITEM_IDS[slot.id] === true;

        if (isSoulRow || isBlessRow || isPotionRow) {
          var qtyEl = document.createElement('span');
          qtyEl.className = 'l2-battle-hotbar-slot-uqty';
          qtyEl.setAttribute('aria-hidden', 'true');
          qtyEl.textContent = String(bagQtyPlain(character, slot.id));
          btn.appendChild(qtyEl);
        }

        if (isSoulRow) {
          btn.title = soulOn
            ? itemNameUk(slot.id) + ' — активний'
            : itemNameUk(slot.id) + ' — заряд душі: натисни для активації';
        } else if (isBlessRow) {
          btn.title = blessedOn
            ? itemNameUk(slot.id) + ' — активний'
            : itemNameUk(slot.id) + ' — благословений заряд духу: натисни для активації';
        } else if (isPotionRow) {
          btn.title =
            itemNameUk(slot.id) +
            ' — зілля: натисни для використання (' +
            bagQtyPlain(character, slot.id) +
            ' у сумці)';
        } else {
          btn.title = itemNameUk(slot.id);
        }

        btn.addEventListener('click', function () {
          if (isSoulRow) {
            if (typeof opts.onFighterSoulshotToggle === 'function') {
              opts.onFighterSoulshotToggle(slot.id);
            }
            return;
          }
          if (isBlessRow) {
            if (typeof opts.onMysticSpiritshotToggle === 'function') {
              opts.onMysticSpiritshotToggle(slot.id);
            }
            return;
          }
          if (isPotionRow) {
            if (bagQtyPlain(character, slot.id) < 1) {
              if (typeof opts.showToast === 'function') {
                opts.showToast('Немає цього зілля в сумці.');
              }
              return;
            }
            if (typeof opts.onBattlePotionUse === 'function') {
              opts.onBattlePotionUse(slot.id);
            }
            return;
          }
          if (typeof opts.showToast === 'function') {
            opts.showToast(
              'Цей розхідник з панелі ще не підтримується — лише HP/MP зілля, заряд душі (воїн) або благословений заряд духу (маг).'
            );
          }
        });
      }
      grid.appendChild(btn);
    }

    function appendAddSlotButton(grid, fe) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'l2-battle-hotbar-slot l2-battle-hotbar-slot--empty';
      btn.setAttribute('data-slot-idx', String(fe));
      btn.innerHTML = '<span class="l2-battle-hotbar-slot-plus">+</span>';
      btn.title = 'Додати скіл (слот ' + (fe + 1) + ')';
      btn.addEventListener('click', function () {
        pickerSlot = fe;
        category = 'magic';
        openModal();
      });
      grid.appendChild(btn);
    }

    function ensureSlotsCache(character) {
      if (!character || !character.id) {
        slotsCache = new Array(HOTBAR_SLOTS);
        for (var zi = 0; zi < HOTBAR_SLOTS; zi++) slotsCache[zi] = null;
        slotsLoadedForCharacterId = null;
        slotsLoadedSig = '';
        return;
      }
      if (hotbarSlotsDirty && slotsLoadedForCharacterId === character.id) {
        return;
      }
      var sig = hotbarSlotsSignature(character.battleHotbarSlots);
      if (
        slotsLoadedForCharacterId === character.id &&
        slotsLoadedSig === sig &&
        slotsCache.length === HOTBAR_SLOTS
      ) {
        return;
      }
      slotsCache = loadSlots(character.id, character.battleHotbarSlots);
      slotsLoadedForCharacterId = character.id;
      slotsLoadedSig = sig;
    }

    var lastRenderKey = '';

    function slotsRenderKey(slots) {
      var parts = [];
      for (var i = 0; i < HOTBAR_SLOTS; i++) {
        var s = slots[i];
        if (!s) {
          parts.push('-');
        } else if (s.k === 'a') {
          parts.push('a:' + canonicalBattleActionId(s.a));
        } else if (s.k === 'i') {
          parts.push('i:' + s.id + ':' + (s.e || 0));
        } else if (s.k === 'u') {
          parts.push('u:' + s.id);
        } else {
          parts.push('?');
        }
      }
      return parts.join('|');
    }

    function updateDynamicState(wrap, battle, character, slots) {
      syncLocalCdFromBattle(battle);
      var allowed = allowedActionsSet(battle);
      var toggleSkillIds = activeToggleSkillIdSet(battle);
      var bmU = battle && battle.battleMods;
      var soulMul =
        bmU && typeof bmU.fighterSoulshotPatkMul === 'number'
          ? bmU.fighterSoulshotPatkMul
          : 1;
      var soulId =
        bmU && bmU.fighterSoulshotItemId != null
          ? Math.floor(Number(bmU.fighterSoulshotItemId))
          : 0;
      var blessedMul =
        bmU && typeof bmU.mysticBlessedSpiritshotMatkMul === 'number'
          ? bmU.mysticBlessedSpiritshotMatkMul
          : 1;
      var blessedId =
        bmU && bmU.mysticBlessedSpiritshotItemId != null
          ? Math.floor(Number(bmU.mysticBlessedSpiritshotItemId))
          : 0;
      var btns = wrap.querySelectorAll('.l2-battle-hotbar-slot[data-slot-idx]');
      for (var bi = 0; bi < btns.length; bi++) {
        var btn = btns[bi];
        var idx = parseInt(btn.getAttribute('data-slot-idx'), 10);
        if (!Number.isFinite(idx)) continue;
        var slot = slots[idx];
        if (!slot) continue;
        if (slot.k === 'a') {
          var actId = canonicalBattleActionId(slot.a);
          btn.className = 'l2-battle-hotbar-slot';
          if (!allowed[actId]) btn.className += ' l2-battle-hotbar-slot--warn';
          var actL2 = l2SkillIdForBattleAction(battle, actId);
          if (
            Number.isFinite(actL2) &&
            actL2 > 0 &&
            toggleSkillIds[Math.floor(actL2)] === true
          ) {
            btn.className += ' l2-battle-hotbar-slot--toggle-on';
          }
          var wrapI = btn.querySelector('.l2-battle-hotbar-slot-iconwrap');
          var metaCd = skillCooldownMeta(battle, slot.a);
          var cdEl = btn.querySelector('[data-slot-cd]');
          if (!cdEl && wrapI) {
            cdEl = document.createElement('span');
            cdEl.className = 'l2-battle-hotbar-slot-cd';
            cdEl.setAttribute('data-slot-cd', actId);
            cdEl.hidden = true;
            var cdShort = document.createElement('span');
            cdShort.className = 'l2-battle-hotbar-slot-cd__short';
            cdShort.setAttribute('aria-hidden', 'true');
            var cdLong = document.createElement('span');
            cdLong.className = 'l2-battle-hotbar-slot-cd__long';
            cdEl.appendChild(cdShort);
            cdEl.appendChild(cdLong);
            wrapI.appendChild(cdEl);
          }
          if (cdEl) {
            if (metaCd) {
              applySkillCdOverlay(cdEl, metaCd, Date.now());
            } else {
              setCdOverlayVisible(cdEl, false);
            }
          }
        } else if (slot.k === 'u') {
          btn.className = 'l2-battle-hotbar-slot';
          var soulOn =
            soulMul > 1 &&
            soulId === slot.id &&
            FIGHTER_SOULSHOT_ITEM_IDS[slot.id] === true;
          var blessedOn =
            blessedMul > 1 &&
            blessedId === slot.id &&
            MYSTIC_BLESSED_SPIRITSHOT_ITEM_IDS[slot.id] === true;
          if (soulOn || blessedOn) {
            btn.className += ' l2-battle-hotbar-slot--soulshot-on';
          }
          var qtyElU = btn.querySelector('.l2-battle-hotbar-slot-uqty');
          var qtyU = bagQtyPlain(character, slot.id);
          if (qtyElU) qtyElU.textContent = String(qtyU);
        }
      }
      if (hotbarHasSkillSlots(wrap)) startCdTicker(wrap);
    }

    function render() {
      var box = opts.container;
      if (!box) return;
      var battle = opts.getBattle();
      var character = opts.getCharacter();
      if (!battle || !character) {
        clearCdTimer();
        box.innerHTML = '';
        lastRenderKey = '';
        localCdUntil = Object.create(null);
        localCdDuration = Object.create(null);
        return;
      }

      syncLocalCdFromBattle(battle);

      ensureSlotsCache(character);
      if (
        !slotsHaveContent(character.battleHotbarSlots || []) &&
        slotsHaveContent(slotsCache)
      ) {
        saveSlots(character.id, slotsCache, character);
      }
      slotsCache = sanitizeSlotsAgainstBattle(
        slotsCache,
        character && character.id,
        character
      );

      var key =
        String(battle.spawnId || '') +
        '|' +
        String(character.id || '') +
        '|' +
        slotsRenderKey(slotsCache);
      var existing = box.querySelector('.l2-battle-hotbar');
      if (existing && key === lastRenderKey) {
        updateDynamicState(existing, battle, character, slotsCache);
        return;
      }
      lastRenderKey = key;
      clearCdTimer();
      box.innerHTML = '';
      var allowed = allowedActionsSet(battle);

      var wrap = document.createElement('div');
      wrap.className = 'l2-battle-hotbar';

      var line = document.createElement('div');
      line.className = 'l2-battle-hotbar__rule l2-battle-hotbar__rule--top';
      wrap.appendChild(line);

      var grid = document.createElement('div');
      grid.className = 'l2-battle-hotbar__grid';
      grid.style.setProperty('--l2-bh-cols', String(HOTBAR_GRID_COLS));

      var filledIdx = [];
      for (var si = 0; si < HOTBAR_SLOTS; si++) {
        if (slotsCache[si]) filledIdx.push(si);
      }
      filledIdx.sort(function (a, b) {
        return a - b;
      });
      for (var fi = 0; fi < filledIdx.length; fi++) {
        var ix = filledIdx[fi];
        appendFilledSlot(grid, ix, slotsCache[ix], battle, character);
      }
      var fe = firstEmptySlotIndex(slotsCache);
      if (fe >= 0) {
        appendAddSlotButton(grid, fe);
      }

      wrap.appendChild(grid);

      box.appendChild(wrap);
      if (hotbarHasSkillSlots(wrap)) startCdTicker(wrap);
    }

    async function equipFromBar(slot) {
      if (equipInFlight) return;
      var c = opts.getCharacter();
      var t = opts.getToken();
      if (!t || !c) return;
      equipInFlight = true;
      try {
        var r = await fetch('/character/equip', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            action: 'equip',
            itemId: slot.id,
            enchant: typeof slot.e === 'number' ? slot.e : 0,
            expectedRevision: c.revision,
          }),
        });
        var j = await r.json().catch(function () {
          return {};
        });
        if (r.status === 401) {
          global.L2 && L2.setToken && L2.setToken(null);
          global.location.href = '/';
          return;
        }
        if (r.status === 409) {
          if (global.L2 && typeof L2.fetchSnapshot === 'function') {
            await L2.fetchSnapshot();
            var snap = L2.lastSnapshot && L2.lastSnapshot();
            if (snap) opts.setCharacter(snap);
          }
          opts.showToast('Дані оновлено — спробуй ще раз.');
          return;
        }
        if (!r.ok) {
          opts.showToast(j.messageUk || 'Не вдалося змінити зброю.');
          return;
        }
        if (j.character) {
          opts.setCharacter(j.character);
          if (global.L2 && L2.setLastSnapshot) {
            L2.setLastSnapshot(j.character);
          }
          if (global.L2 && typeof L2.applyHudFromSnapshot === 'function') {
            L2.applyHudFromSnapshot(j.character);
          }
        }
        opts.showToast('Зброю змінено.');
        render();
      } catch (e) {
        opts.showToast('Помилка мережі.');
      } finally {
        equipInFlight = false;
      }
    }

    function destroy() {
      clearCdTimer();
      closeModal();
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      modal = null;
      slotsLoadedForCharacterId = null;
      slotsLoadedSig = '';
      slotsCache = [];
      hotbarSlotsDirty = false;
      lastRenderKey = '';
      localCdUntil = Object.create(null);
      localCdDuration = Object.create(null);
      setHotbarPersistCtx(null);
    }

    setHotbarPersistCtx(
      Object.assign({}, opts, {
        renderHotbar: render,
        onHotbarPersisted: function (slots, characterId) {
          hotbarSlotsDirty = false;
          slotsCache = loadSlots(characterId, slots);
          slotsLoadedForCharacterId = characterId;
          slotsLoadedSig = hotbarSlotsSignature(slots);
          render();
        },
      })
    );

    return {
      render: render,
      destroy: destroy,
      primeSkillCd: primeSkillCd,
      notifySkillUsed: notifySkillUsed,
      abortPendingSkillCd: abortPendingSkillCd,
      isSkillOnCooldown: isSkillOnCooldown,
      applyServerCooldown: applyServerCooldown,
      syncCooldownsFromBattle: syncCooldownsFromBattle,
      clearBattleCooldowns: clearBattleCooldowns,
    };
  }

  function normalizeBattleSkillId(action, battle) {
    var aid = canonicalBattleActionId(action);
    if (typeof aid === 'string' && /^l2_\d+$/i.test(aid)) {
      return aid.replace(/^L2_/i, 'l2_');
    }
    var l2 = l2SkillIdForBattleAction(battle, aid);
    if (typeof l2 === 'number' && l2 > 0) return 'l2_' + Math.floor(l2);
    return String(aid || action || '');
  }

  global.L2BattleHotbar = {
    mount: mountBattleHotbar,
    mergeCharacterCatalog: mergeCharacterCatalog,
    canonicalBattleActionId: canonicalBattleActionId,
    normalizeBattleSkillId: normalizeBattleSkillId,
  };
})(typeof window !== 'undefined' ? window : globalThis);
