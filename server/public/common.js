/**
 * Спільне для сторінок: токен, snapshot з сервера, список міст як у text-rpg (l2dop/cities.ts).
 * HUD (рамка 222 + HP/MP/SP): L2.getHudPanelMarkup — тримати в синхроні з /partials/l2-hud-panel.html.
 */
(function (global) {
  /**
   * JWT зберігаємо в localStorage: одна авторизація на всі вкладки цього ж адреса.
   * sessionStorage — окрема «сесія» на кожну вкладку → карта в новій вкладці без входу показувала «Потрібен вхід».
   * Різні адреси (localhost vs LAN IP) лишаються різними origin — там треба входити окремо.
   */
  try {
    var _legacyTok = sessionStorage.getItem('token');
    if (_legacyTok && !localStorage.getItem('token')) {
      localStorage.setItem('token', _legacyTok);
      sessionStorage.removeItem('token');
    }
  } catch (e) {
    /* ignore */
  }

  /** Екстракт з text-rpg src/data/world/l2dop/cities.ts */
  var L2DOP_CITIES = [
    { id: 'floran_village', name: 'Floran Village' },
    { id: 'gludin_village', name: 'Gludin Village' },
    { id: 'l2dop_heine', name: 'Heine' },
    { id: 'hunters_village', name: 'Hunters Village' },
    { id: 'l2dop_rune', name: 'Rune Township' },
    { id: 'l2dop_aden', name: 'Town of Aden' },
    { id: 'l2dop_dion', name: 'Town of Dion' },
    { id: 'l2dop_giran', name: 'Town of Giran' },
    { id: 'l2dop_gludio', name: 'Town of Gludio' },
    { id: 'l2dop_goddard', name: 'Town of Goddard' },
    { id: 'l2dop_oren', name: 'Town of Oren' },
    { id: 'l2dop_schuttgart', name: 'Town of Schuttgart' },
    { id: 'ancient_tomb_fields', name: 'Ancient Tomb Fields' },
  ];

  /** Підписи міст (укр.) — за аналогією з text-rpg locale/worldLabels + L2-назви */
  var CITY_LABELS_UK = {
    floran_village: 'Селище Флоран',
    gludin_village: 'Селище Глудін',
    hunters_village: 'Селище мисливців',
    l2dop_heine: 'Гейне',
    l2dop_rune: 'Рун (Rune Township)',
    l2dop_aden: 'Місто Аден',
    l2dop_dion: 'Місто Діон',
    l2dop_giran: 'Місто Гіран',
    l2dop_gludio: 'Місто Глудіо',
    l2dop_goddard: 'Місто Годдарт',
    l2dop_oren: 'Місто Орен',
    l2dop_schuttgart: 'Місто Штутгарт',
    ancient_tomb_fields: 'Поля стародавніх могил',
  };

  function cityDisplayName(cityId) {
    var cid = cityId != null ? String(cityId).trim() : '';
    if (cid && global.L2 && global.L2.tr && global.L2.UI) {
      var i18nKey = 'cityid_' + cid;
      if (global.L2.UI[i18nKey]) return global.L2.tr(i18nKey);
    }
    if (cid && CITY_LABELS_UK[cid]) return CITY_LABELS_UK[cid];
    var c = L2DOP_CITIES.find(function (x) {
      return x.id === cityId;
    });
    return c ? c.name : String(cityId || '—');
  }

  var lastSnapshot = null;
  var sessionCatalogMerged = false;
  var sessionCatalogFetchPromise = null;

  function hasCatalogHintsPayload(j) {
    if (!j || typeof j !== 'object') return false;
    return !!(
      j.gearCatalog ||
      j.itemNamesUk ||
      j.itemSlotHints ||
      j.itemInventoryTabHints ||
      j.itemGradeHints ||
      j.itemStatsHints ||
      j.itemBlocksShieldById ||
      j.craftResourceIconByItemId
    );
  }

  function mergeCharacterCatalogHints(j) {
    if (!hasCatalogHintsPayload(j) || sessionCatalogMerged) return;
    sessionCatalogMerged = true;
    if (j.gearCatalog && global.L2.mergeGearCatalog) {
      global.L2.mergeGearCatalog(j.gearCatalog);
    }
    if (global.L2.mergeCraftResourceIconHints) {
      global.L2.mergeCraftResourceIconHints(j);
    }
    if (j.itemNamesUk && typeof j.itemNamesUk === 'object' && global.L2.itemNameById) {
      Object.keys(j.itemNamesUk).forEach(function (k) {
        global.L2.itemNameById[k] = j.itemNamesUk[k];
      });
    }
    if (j.itemSlotHints && typeof j.itemSlotHints === 'object' && global.L2.itemSlotById) {
      Object.keys(j.itemSlotHints).forEach(function (k) {
        if (global.L2.itemSlotById[k] == null) {
          global.L2.itemSlotById[k] = j.itemSlotHints[k];
        }
      });
    }
    if (
      j.itemInventoryTabHints &&
      typeof j.itemInventoryTabHints === 'object' &&
      global.L2.itemInventoryTabById
    ) {
      Object.keys(j.itemInventoryTabHints).forEach(function (k) {
        global.L2.itemInventoryTabById[k] = j.itemInventoryTabHints[k];
      });
    }
    if (j.itemGradeHints && typeof j.itemGradeHints === 'object' && global.L2.itemGradeById) {
      Object.keys(j.itemGradeHints).forEach(function (k) {
        global.L2.itemGradeById[k] = j.itemGradeHints[k];
      });
    }
    if (j.itemStatsHints && typeof j.itemStatsHints === 'object' && global.L2.itemStatsById) {
      Object.keys(j.itemStatsHints).forEach(function (k) {
        var st = j.itemStatsHints[k];
        if (!st || typeof st !== 'object') return;
        var prev = global.L2.itemStatsById[k] || {};
        global.L2.itemStatsById[k] = Object.assign({}, prev, st);
      });
    }
    if (
      j.itemBlocksShieldById &&
      typeof j.itemBlocksShieldById === 'object' &&
      global.L2.itemBlocksShieldById
    ) {
      Object.keys(j.itemBlocksShieldById).forEach(function (k) {
        global.L2.itemBlocksShieldById[k] = j.itemBlocksShieldById[k];
      });
    }
  }

  async function ensureCatalogHintsLoaded(token) {
    if (!token) return false;
    if (sessionCatalogMerged) return true;
    if (sessionCatalogFetchPromise) return sessionCatalogFetchPromise;
    sessionCatalogFetchPromise = fetch('/character/catalog-hints', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(function (r) {
        if (r.status === 401) {
          global.L2.setToken(null);
          return null;
        }
        if (!r.ok) return null;
        return r.json();
      })
      .then(function (j) {
        if (j) mergeCharacterCatalogHints(j);
        return sessionCatalogMerged;
      })
      .catch(function () {
        return false;
      })
      .finally(function () {
        sessionCatalogFetchPromise = null;
      });
    return sessionCatalogFetchPromise;
  }

  /** Коди помилок API → повідомлення для гравця (uk/ru через ui-i18n.js). */
  function apiErrorUk(code) {
    if (code == null || code === '') {
      return global.L2 && global.L2.tr ? global.L2.tr('api_unknown') : 'Невідома помилка.';
    }
    var key =
      'api_' +
      String(code)
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_');
    if (global.L2 && global.L2.tr && global.L2.UI && global.L2.UI[key]) {
      return global.L2.tr(key);
    }
    var m = {
      invalid_input: 'Некоректні дані.',
      forbidden: 'Немає доступу або невірні облікові дані.',
      Unauthorized: 'Потрібна авторизація.',
      revision_conflict: 'Конфлікт версії даних — оновлено з сервера.',
      database_unavailable:
        'База даних недоступна. Запусти PostgreSQL або перевір DATABASE_URL у .env.',
      too_many_requests: 'Забагато спроб. Зачекай хвилину і спробуй знову.',
    };
    return m[code] != null ? m[code] : String(code);
  }

  function normalizePositiveInt(val) {
    var n = Number(val);
    if (!Number.isFinite(n) || n <= 0) return 0;
    return Math.floor(n);
  }

  global.L2 = {
    lastSnapshot: function () {
      return lastSnapshot;
    },
    setLastSnapshot: function (s) {
      lastSnapshot = s;
    },
    /** Оновити лише поля карти/HUD у глобальному snapshot (poll map-state). */
    mergeMapStateIntoSnapshot: function (partial) {
      if (!partial || typeof partial !== 'object') return lastSnapshot;
      if (!lastSnapshot) {
        lastSnapshot = partial;
        return lastSnapshot;
      }
      lastSnapshot = Object.assign({}, lastSnapshot, partial);
      return lastSnapshot;
    },

    /** Заповнюється з GET /shop/gm: itemId → iconUrl, nameUk */
    itemIconById: {},
    itemNameById: {},
    /** GET /character/catalog-hints gearCatalog: itemId → stats (pAtk, mAtk, pDef, atkSpd, wpnCrit …) */
    itemStatsById: {},
    /** rhand | chest | legs — для fallback іконки й підпису типу */
    itemSlotById: {},
    /** NG | D | C | B | A | S — з GET /character/catalog-hints itemGradeHints + gearCatalog */
    itemGradeById: {},
    /** Тип зброї (рядок каталогу) — для фільтра сумки */
    itemWeaponTypeById: {},
    /** Тип броні (heavy/light/magic) — з каталогу */
    itemArmorTypeById: {},
    /** Тип біжутерії — з каталогу */
    itemJewelryKindById: {},
    /** Вкладка сумки (не екіп): enchantment, recipe… — GET /character/catalog-hints itemInventoryTabHints */
    itemInventoryTabById: {},
    /** GET /character/catalog-hints itemBlocksShieldById: дворуч — іконка зброї також у слоті щита */
    itemBlocksShieldById: {},
    mergeShopCatalog: function (items) {
      var icons = global.L2.itemIconById;
      var names = global.L2.itemNameById;
      var stats = global.L2.itemStatsById;
      var slots = global.L2.itemSlotById;
      var grades = global.L2.itemGradeById;
      var wpnT = (global.L2.itemWeaponTypeById =
        global.L2.itemWeaponTypeById || {});
      var armT = (global.L2.itemArmorTypeById =
        global.L2.itemArmorTypeById || {});
      var jewK = (global.L2.itemJewelryKindById =
        global.L2.itemJewelryKindById || {});
      (items || []).forEach(function (x) {
        if (x.itemId == null) return;
        var id = x.itemId;
        if (x.iconUrl) icons[id] = x.iconUrl;
        if (x.nameUk) names[id] = x.nameUk;
        if (x.stats && typeof x.stats === 'object') stats[id] = x.stats;
        if (x.slot) slots[id] = x.slot;
        if (x.grade != null && String(x.grade).trim() !== '') {
          grades[id] = x.grade;
        }
        if (x.weaponType != null && String(x.weaponType).trim() !== '') {
          wpnT[id] = x.weaponType;
        }
        if (x.armorType != null && String(x.armorType).trim() !== '') {
          armT[id] = x.armorType;
        }
        if (x.jewelryKind != null && String(x.jewelryKind).trim() !== '') {
          jewK[id] = x.jewelryKind;
        }
      });
    },
    mergeGearCatalog: function (items) {
      global.L2.mergeShopCatalog(items);
    },
    mergeCraftResourceIconHints: function (payload) {
      var h = payload && payload.craftResourceIconByItemId;
      if (!h || typeof h !== 'object') return;
      var icons = global.L2.itemIconById;
      Object.keys(h).forEach(function (k) {
        var url = h[k];
        if (url != null && String(url).trim() !== '') icons[k] = String(url);
      });
    },
    rememberItemIconHint: function (itemId, iconUrl) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return;
      if (iconUrl == null || String(iconUrl).trim() === '') return;
      global.L2.itemIconById[id] = String(iconUrl);
    },
    resolveItemIconUrl: function (itemId, fallbackUrl) {
      var id = normalizePositiveInt(itemId);
      var fb =
        fallbackUrl != null && String(fallbackUrl).trim() !== ''
          ? String(fallbackUrl)
          : '/icons/drops/other.svg';
      if (id <= 0) return fb;
      var u = global.L2.itemIconById && global.L2.itemIconById[id];
      if (u != null && String(u).trim() !== '') return String(u);
      return '/game/item-icon/' + id;
    },
    /** Тон рядка статів модалки предмета (як у класичному L2-клієнті). */
    itemStatLineTone: function (labelUk) {
      var s = String(labelUk || '').toLowerCase();
      if (/фіз\.?\s*атак|p\.?\s*atk\b/i.test(s)) return 'patk';
      if (/маг\.?\s*атак|m\.?\s*atk\b/i.test(s)) return 'matk';
      if (/крит|crit/i.test(s)) return 'crit';
      return 'default';
    },
    /** Один рядок «Підпис: значення» у модалці предмета. */
    appendItemStatLine: function (parent, labelUk, valueUk) {
      if (!parent) return;
      var label = labelUk != null ? String(labelUk).trim() : '';
      var val = valueUk != null ? String(valueUk) : '';
      var p = document.createElement('p');
      var tone = global.L2.itemStatLineTone(label);
      p.className = 'l2-item-modal-stat l2-item-modal-stat--' + tone;
      p.textContent = label ? label + ': ' + val : val;
      parent.appendChild(p);
    },
    resolveSkillIconUrl: function (skillId, iconUrl) {
      if (iconUrl != null && String(iconUrl).charAt(0) === '/') {
        return String(iconUrl);
      }
      var id = normalizePositiveInt(skillId);
      if (id > 0) return '/game/skill-icon/' + id;
      return '/icons/drops/other.svg';
    },
    cityDisplayName: cityDisplayName,
    apiErrorUk: apiErrorUk,

    /** Мова інтерфейсу: uk | ru (`localStorage`, ключ l2dop_ui_lang). */
    getUiLang: function () {
      try {
        var v = localStorage.getItem('l2dop_ui_lang');
        if (v === 'ru' || v === 'uk') return v;
      } catch (e) {
        /* ignore */
      }
      return 'uk';
    },
    setUiLang: function (lang) {
      try {
        if (lang === 'ru' || lang === 'uk') {
          localStorage.setItem('l2dop_ui_lang', lang);
          if (typeof document !== 'undefined' && document.documentElement) {
            document.documentElement.lang = lang === 'ru' ? 'ru' : 'uk';
          }
        }
      } catch (e) {
        /* ignore */
      }
    },
    /** Підписи: за замовчуванням укр.; для ru передайте другий рядок. */
    t: function (ukStr, ruStr) {
      return global.L2.getUiLang() === 'ru' &&
        ruStr != null &&
        String(ruStr) !== ''
        ? String(ruStr)
        : String(ukStr);
    },
    /** Рядок у шапці міста/профілю/бою: лише нік і рівень. */
    formatHeroHeadlineShort: function (c) {
      if (!c) return '—';
      var lvl =
        global.L2 && global.L2.tr ? global.L2.tr('abbr_level') : 'ур.';
      return (
        (c.name != null ? String(c.name) : '—') +
        ' · ' +
        lvl +
        ' ' +
        (c.level != null ? c.level : '—')
      );
    },
    /** Текст для смуг (напр. HP моба): відсоток з одним знаком після коми. */
    formatBarPct: function (cur, max) {
      var m = max > 0 ? Number(max) : 1;
      var x = Number(cur);
      if (!Number.isFinite(x)) x = 0;
      x = Math.max(0, Math.min(x, m));
      return ((x / m) * 100).toFixed(1) + '%';
    },
    /** Текст для смуг HP/MP/CP гравця: поточне / макс (цілі числа). */
    formatBarPair: function (cur, max) {
      var m = max > 0 ? Number(max) : 1;
      var x = Number(cur);
      if (!Number.isFinite(x)) x = 0;
      x = Math.max(0, Math.min(x, m));
      return Math.round(x) + ' / ' + Math.round(m);
    },

    token: function () {
      return localStorage.getItem('token');
    },
    setToken: function (t) {
      try {
        if (t) localStorage.setItem('token', t);
        else localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      } catch (e) {
        /* ignore */
      }
    },

    fetchSnapshot: async function () {
      var t = global.L2.token();
      if (!t) {
        lastSnapshot = null;
        return null;
      }
      var r = await fetch('/character', {
        headers: { Authorization: 'Bearer ' + t },
      });
      if (r.status === 401) {
        global.L2.setToken(null);
        lastSnapshot = null;
        return null;
      }
      if (!r.ok) return null;
      var j = await r.json();
      lastSnapshot = j.character;
      if (!sessionCatalogMerged) {
        await ensureCatalogHintsLoaded(t);
      }
      if (j.character && typeof global.L2.applyHudFromSnapshot === 'function') {
        global.L2.applyHudFromSnapshot(j.character);
      }
      return lastSnapshot;
    },
    fetchCatalogHints: async function () {
      var t = global.L2.token();
      if (!t) return false;
      return ensureCatalogHintsLoaded(t);
    },
    applyCharacterSnapshot: function (snapshot, applyScreenSpecific) {
      if (!snapshot) return null;
      lastSnapshot = snapshot;
      if (typeof global.L2.applyHudFromSnapshot === 'function') {
        global.L2.applyHudFromSnapshot(snapshot);
      }
      if (typeof applyScreenSpecific === 'function') {
        applyScreenSpecific(snapshot);
      }
      return snapshot;
    },
    resyncCharacterAfterConflict: async function (applyScreenSpecific) {
      var snap = await global.L2.fetchSnapshot();
      if (!snap) throw new Error('failed_to_refetch_character');
      return global.L2.applyCharacterSnapshot(snap, applyScreenSpecific);
    },

    renderStats: function (ids, c) {
      if (global.L2._applySnapshot) {
        global.L2._applySnapshot(c);
        return;
      }
      if (!ids) return;
      if (ids.hp) document.getElementById(ids.hp).textContent = c.hp + ' / ' + c.maxHp;
      if (ids.adena) document.getElementById(ids.adena).textContent = c.adena;
      if (ids.rev) document.getElementById(ids.rev).textContent = String(c.revision);
      if (ids.name) document.getElementById(ids.name).textContent = c.name;
      if (ids.city) document.getElementById(ids.city).textContent = cityDisplayName(c.cityId);
      if (ids.msg) document.getElementById(ids.msg).textContent = '';
    },

    clearStats: function (ids) {
      if (global.L2._clearSnapshot) {
        global.L2._clearSnapshot();
      }
      if (!ids) return;
      if (ids.hp) document.getElementById(ids.hp).textContent = '—';
      if (ids.adena) document.getElementById(ids.adena).textContent = '—';
      if (ids.rev) document.getElementById(ids.rev).textContent = '—';
      if (ids.name) document.getElementById(ids.name).textContent = '—';
      if (ids.city) document.getElementById(ids.city).textContent = '—';
      if (ids.msg) {
        var mx = document.getElementById(ids.msg);
        if (mx) {
          mx.hidden = true;
          mx.textContent = '';
        }
      }
      lastSnapshot = null;
    },

    /** Футер (перший ряд) — вимкнено; ті самі пункти в нижній сітці l2-nav.js. */
    FOOT_LINK_ITEMS: [],

    /** Раніше тут був другий ряд (чат/карта/…) — прибрано, бо ті самі пункти в верхній сітці l2-nav.js. */
    FOOT_LINK_ROW2: [],

    /**
     * Вставити блок посилань у контейнер (порожній div з id або елемент).
     * @param {HTMLElement|string} containerOrId
     * @param {{ inset?: boolean, ariaLabel?: string }} opts inset — звуження як у екіп/опціях
     */
    mountFootLinkBar: function (containerOrId, opts) {
      opts = opts || {};
      var el =
        typeof containerOrId === 'string'
          ? document.getElementById(containerOrId)
          : containerOrId;
      if (!el) return;

      function footTitle(item) {
        var tk = item.i18nTitleKey || item.i18nKey;
        if (tk && global.L2 && global.L2.tr) return global.L2.tr(tk);
        return item.title || '';
      }

      function appendFootItem(parent, item, btnMod) {
        btnMod = btnMod || '';
        var label =
          item.i18nKey && global.L2 && global.L2.tr
            ? global.L2.tr(item.i18nKey)
            : item.label || '';
        var span = document.createElement('span');
        span.className = 'l2-foot-linkbar__label';
        span.textContent = label;
        var tip = footTitle(item);
        if (item.href) {
          var a = document.createElement('a');
          a.href = item.href;
          a.className =
            'l2-foot-linkbar__btn l2-foot-linkbar__btn--link' +
            (item.wide ? ' l2-foot-linkbar__btn--wide' : '') +
            btnMod;
          if (tip) a.title = tip;
          a.appendChild(span);
          parent.appendChild(a);
        } else {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className =
            'l2-foot-linkbar__btn' +
            (item.wide ? ' l2-foot-linkbar__btn--wide' : '') +
            btnMod;
          if (tip) btn.title = tip;
          var stubTxt =
            item.stubKey && global.L2 && global.L2.tr
              ? global.L2.tr(item.stubKey)
              : item.stub;
          if (stubTxt) btn.setAttribute('data-stub', stubTxt);
          btn.appendChild(span);
          parent.appendChild(btn);
        }
      }

      var items = global.L2.FOOT_LINK_ITEMS;
      el.textContent = '';
      if (!items || !items.length) {
        el.className = '';
        el.hidden = true;
        el.setAttribute('aria-hidden', 'true');
        return;
      }
      el.hidden = false;
      el.removeAttribute('aria-hidden');
      el.className =
        'l2-foot-linkbar' + (opts.inset ? ' l2-foot-linkbar--inset' : '');
      el.setAttribute(
        'aria-label',
        opts.ariaLabel ||
          (global.L2 && global.L2.tr ? global.L2.tr('foot_aria') : 'Посилання')
      );
      items.forEach(function (item) {
        appendFootItem(el, item, ' l2-foot-linkbar__btn--frame4187');
      });

      var row2 = global.L2.FOOT_LINK_ROW2;
      if (row2 && row2.length) {
        var sub = document.createElement('div');
        sub.className = 'l2-foot-linkbar__subrow';
        sub.setAttribute('role', 'group');
        sub.setAttribute(
          'aria-label',
          global.L2 && global.L2.tr ? global.L2.tr('foot_row2_aria') : ''
        );
        row2.forEach(function (item) {
          appendFootItem(sub, item, ' l2-foot-linkbar__btn--subrow');
        });
        el.appendChild(sub);
      }
    },

    /** Бойова гілка (classBranch) — лише «Воїн» / «Маг», без l2Profession. */
    hudClassUkFromSnapshot: function (c) {
      if (!c) return '—';
      var b = c.classBranch != null ? String(c.classBranch).toLowerCase() : '';
      if (b === 'fighter') return 'Воїн';
      if (b === 'mystic') return 'Маг';
      return '—';
    },

    /** l2Profession з БД -> коротка назва професії (без race-префіксів і `_`). */
    hudL2ProfessionUkFromSnapshot: function (c) {
      if (!c || c.l2Profession == null) return '—';
      var p = String(c.l2Profession).trim().toLowerCase();
      if (!p) return '—';
      var core = p;
      var prefixes = ['dark_elf_', 'human_', 'elf_', 'orc_', 'dwarf_'];
      for (var i = 0; i < prefixes.length; i++) {
        var pref = prefixes[i];
        if (core.indexOf(pref) === 0) {
          core = core.slice(pref.length);
          break;
        }
      }
      if (!core) return '—';
      var words = core.split('_').filter(Boolean);
      if (!words.length) return core;
      var text = words.join(' ').toLowerCase();
      return text.charAt(0).toUpperCase() + text.slice(1);
    },

    hudL2ProfessionSlugFromSnapshot: function (c) {
      if (!c || c.l2Profession == null) return '';
      var p = String(c.l2Profession).trim();
      return p || '';
    },

    /** Ціле для HUD (HP/MP/SP): без дубля cur/max, лише поточне значення з snapshot. */
    hudStatInt: function (v) {
      if (v == null || v === '') return '—';
      var n = Math.round(Number(v));
      if (!Number.isFinite(n)) return '—';
      return String(n);
    },

    /** Очистити плейсхолдери l2-hud-* (немає вхідних даних). */
    clearHudPanel: function () {
      [
        'l2-hud-nick',
        'l2-hud-lvl',
        'l2-hud-class-val',
        'l2-hud-exp-cur',
        'l2-hud-exp-max',
        'l2-hud-exp-pct',
        'l2-hud-hp-cur',
        'l2-hud-hp-max',
        'l2-hud-mp-cur',
        'l2-hud-mp-max',
        'l2-hud-cp-cur',
        'l2-hud-cp-max',
        'l2-hud-sp-val',
        'l2-hud-prof-val',
        'l2-top-strip-lvl',
        'l2-top-strip-class',
        'l2-top-strip-prof',
        'l2-top-strip-hp-cur',
        'l2-top-strip-hp-max',
        'l2-top-strip-mp-cur',
        'l2-top-strip-mp-max',
      ].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.textContent = '—';
      });
      ['l2-hud-exp-fill', 'l2-hud-hp-inner', 'l2-hud-mp-inner', 'l2-hud-cp-inner'].forEach(function (id) {
        var el = document.getElementById(id);
        if (!el) return;
        if (id === 'l2-hud-exp-fill') {
          el.style.width = '0%';
          el.style.height = '100%';
        } else {
          el.style.width = '0%';
        }
      });
    },

    /**
     * Заповнити панель l2-hud-panel з character snapshot (GET /character).
     */
    applyHudFromSnapshot: function (c) {
      var isLegacyMinimal =
        typeof document !== 'undefined' &&
        document.body &&
        document.body.classList.contains('l2-nav-minimal');
      function set(id, txt) {
        var el = document.getElementById(id);
        if (el) el.textContent = txt != null ? String(txt) : '—';
      }
      function setWidthPct(id, pct) {
        var el = document.getElementById(id);
        if (!el) return;
        var p = Number(pct);
        if (!Number.isFinite(p)) p = 0;
        p = Math.max(0, Math.min(100, p));
        el.style.width = p + '%';
      }
      function setExpFillPct(pct) {
        var el = document.getElementById('l2-hud-exp-fill');
        if (!el) return;
        var p = Number(pct);
        if (!Number.isFinite(p)) p = 0;
        p = Math.max(0, Math.min(100, p));
        el.style.width = p + '%';
        el.style.height = '100%';
      }
      if (!c) {
        global.L2.clearHudPanel();
        return;
      }
      set('l2-hud-nick', c.name);
      set('l2-hud-lvl', c.level);
      set('l2-hud-class-val', global.L2.hudClassUkFromSnapshot(c));
      set('l2-hud-prof-val', global.L2.hudL2ProfessionUkFromSnapshot(c));
      var profEl = document.getElementById('l2-hud-prof-val');
      if (profEl) {
        var slug = global.L2.hudL2ProfessionSlugFromSnapshot(c);
        profEl.title = slug ? 'l2Profession: ' + slug : '';
      }
      set('l2-hud-exp-cur', c.expBarCur != null ? c.expBarCur : '—');
      set('l2-hud-exp-max', c.expBarMax != null ? c.expBarMax : '—');
      var expPct = c.expBarPct != null ? Number(c.expBarPct) : 0;
      setExpFillPct(expPct);
      set(
        'l2-hud-exp-pct',
        isLegacyMinimal
          ? Math.max(0, Math.min(100, expPct)).toFixed(2) + ' %'
          : Math.max(0, Math.min(100, expPct)).toFixed(1) + '%'
      );
      var expBar = document.getElementById('l2-hud-exp-bar');
      if (expBar) {
        expBar.setAttribute('aria-valuenow', String(Math.round(expPct)));
      }
      set('l2-hud-hp-cur', global.L2.hudStatInt(c.hp));
      set('l2-hud-hp-max', c.maxHp != null ? Math.round(Number(c.maxHp)) : '—');
      var hpMax = Number(c.maxHp);
      var hpCur = Number(c.hp);
      var hpPct =
        Number.isFinite(hpMax) && hpMax > 0 && Number.isFinite(hpCur) ? (hpCur / hpMax) * 100 : 0;
      setWidthPct('l2-hud-hp-inner', hpPct);
      set('l2-hud-mp-cur', global.L2.hudStatInt(c.mp));
      set('l2-hud-mp-max', c.maxMp != null ? Math.round(Number(c.maxMp)) : '—');
      var mpMax = Number(c.maxMp);
      var mpCur = Number(c.mp);
      var mpPct =
        Number.isFinite(mpMax) && mpMax > 0 && Number.isFinite(mpCur) ? (mpCur / mpMax) * 100 : 0;
      setWidthPct('l2-hud-mp-inner', mpPct);
      set('l2-top-strip-lvl', c.level);
      set('l2-top-strip-class', global.L2.hudClassUkFromSnapshot(c));
      set('l2-top-strip-prof', global.L2.hudL2ProfessionUkFromSnapshot(c));
      var stripProf = document.getElementById('l2-top-strip-prof');
      if (stripProf) {
        var slug2 = global.L2.hudL2ProfessionSlugFromSnapshot(c);
        stripProf.title = slug2 ? 'l2Profession: ' + slug2 : '';
      }
      set('l2-top-strip-hp-cur', c.hp != null ? Math.round(Number(c.hp)) : '—');
      set('l2-top-strip-hp-max', c.maxHp != null ? Math.round(Number(c.maxHp)) : '—');
      set('l2-top-strip-mp-cur', c.mp != null ? Math.round(Number(c.mp)) : '—');
      set('l2-top-strip-mp-max', c.maxMp != null ? Math.round(Number(c.maxMp)) : '—');
      var cpMax = Number(c.maxCp);
      var cpCur = Number(c.cp);
      var cpPct =
        Number.isFinite(cpMax) && cpMax > 0 && Number.isFinite(cpCur) ? (cpCur / cpMax) * 100 : 0;
      set('l2-hud-cp-cur', global.L2.hudStatInt(c.cp));
      set('l2-hud-cp-max', c.maxCp != null ? Math.round(Number(c.maxCp)) : '—');
      setWidthPct('l2-hud-cp-inner', cpPct);
      if (isLegacyMinimal) {
        var lvlAbbr =
          global.L2 && global.L2.tr ? global.L2.tr('abbr_level') : 'ур.';
        set(
          'l2-hud-legacy-lvl',
          String(c.level != null ? c.level : '—') + ' ' + lvlAbbr
        );
        set('l2-hud-legacy-name', c.name != null ? c.name : '—');
      }
    },

    /**
     * Єдина розмітка HUD (рамка + нік/Lv/клас + HP/MP/CP). Тримати в синхроні з /partials/l2-hud-panel.html.
     * Сторінка: замість повного <header> — лише <div id="l2-hud-panel-mount"></div>; mount на DOMContentLoaded.
     */
    /**
     * Сторінки з #l2-nav-bottom — legacy-minimal HUD (як city), без рамки 222 на барах.
     */
    ensureNavMinimalChrome: function () {
      if (typeof document === 'undefined' || !document.body) return;
      if (document.getElementById('l2-nav-bottom')) {
        document.body.classList.add('l2-nav-minimal');
      }
    },

    getHudPanelMarkup: function () {
      if (global.L2.ensureNavMinimalChrome) {
        global.L2.ensureNavMinimalChrome();
      }
      var isLegacyMinimal =
        typeof document !== 'undefined' &&
        document.body &&
        document.body.classList.contains('l2-nav-minimal');
      if (isLegacyMinimal) {
        return (
          '<header class="l2-hud-panel l2-hud-panel--legacy-minimal" aria-label="Персонаж">' +
          '<div class="l2-hud-legacy-title-inline">L2WAP</div>' +
          '<div class="l2-hud-legacy-body">' +
          '<div class="l2-hud-legacy-headline">' +
          '<span class="l2-hud-legacy-level" id="l2-hud-legacy-lvl">—</span>' +
          ' - ' +
          '<span class="l2-hud-legacy-name" id="l2-hud-legacy-name">—</span>' +
          '</div>' +
          '<div class="l2-hud-legacy-line l2-hud-legacy-line--hp"><span class="l2-hud-legacy-key">HP:</span><span class="l2-hud-legacy-val" id="l2-hud-hp-cur">—</span></div>' +
          '<div class="l2-hud-legacy-line l2-hud-legacy-line--mp"><span class="l2-hud-legacy-key">MP:</span><span class="l2-hud-legacy-val" id="l2-hud-mp-cur">—</span></div>' +
          '<div class="l2-hud-legacy-line l2-hud-legacy-line--cp"><span class="l2-hud-legacy-key">CP:</span><span class="l2-hud-legacy-val" id="l2-hud-cp-cur">—</span></div>' +
          '<div class="l2-hud-legacy-line l2-hud-legacy-line--exp"><span class="l2-hud-legacy-key">EXP:</span><span class="l2-hud-legacy-val" id="l2-hud-exp-pct">0.00 %</span></div>' +
          '</div>' +
          '</header>'
        );
      }
      return (
        '<header class="l2-hud-panel l2-hud-panel--city-strip" aria-label="Персонаж">' +
        '<div class="l2-hud-top l2-hud-top--city">' +
        '<div class="l2-hud-identity">' +
        '<div class="l2-hud-identity-text">' +
        '<div class="l2-hud-nick" id="l2-hud-nick">—</div>' +
        '<p class="l2-hud-meta">' +
        '<img class="l2-hud-meta-ic" src="/ref/sheld.png" width="20" height="20" alt="" decoding="async" />' +
        '<span class="l2-hud-meta-txt">Lv. <span id="l2-hud-lvl">—</span> · ' +
        '<span class="l2-hud-class">Клас: <span id="l2-hud-class-val">—</span></span></span>' +
        '</p>' +
        '<p class="l2-hud-prof-line"><span class="l2-hud-prof-label">Професія:</span> <span id="l2-hud-prof-val">—</span></p>' +
        '<div class="l2-hud-exp-inline">' +
        '<div class="l2-hud-exp-bar l2-hud-exp-bar--inline" id="l2-hud-exp-bar" role="progressbar" aria-label="Досвід" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
        '<span class="l2-hud-exp-fill" id="l2-hud-exp-fill" style="width:0%;height:100%"></span>' +
        '</div>' +
        '<span class="l2-hud-exp-inline-pct" id="l2-hud-exp-pct">0.0%</span>' +
        '</div>' +
        '</div></div>' +
        '<div class="l2-hud-city-bars" role="group" aria-label="Життя, мана, CP">' +
        '<div class="l2-hud-stat l2-hud-stat--hp l2-hud-city-bar"><div class="l2-hud-stat-bar">' +
        '<div class="l2-hud-stat-inner" id="l2-hud-hp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-city-bar-nums"><span id="l2-hud-hp-cur">—</span>/<span id="l2-hud-hp-max">—</span></span>' +
        '</div></div>' +
        '<div class="l2-hud-stat l2-hud-stat--mp l2-hud-city-bar"><div class="l2-hud-stat-bar">' +
        '<div class="l2-hud-stat-inner" id="l2-hud-mp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-city-bar-nums"><span id="l2-hud-mp-cur">—</span>/<span id="l2-hud-mp-max">—</span></span>' +
        '</div></div>' +
        '<div class="l2-hud-stat l2-hud-stat--cp l2-hud-city-bar"><div class="l2-hud-stat-bar">' +
        '<div class="l2-hud-stat-inner" id="l2-hud-cp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-city-bar-nums"><span id="l2-hud-cp-cur">—</span>/<span id="l2-hud-cp-max">—</span></span>' +
        '</div></div>' +
        '</div></div></header>'
      );
    },

    mountStandardHudPanel: function () {
      if (global.L2.ensureNavMinimalChrome) {
        global.L2.ensureNavMinimalChrome();
      }
      var m = document.getElementById('l2-hud-panel-mount');
      var existing = document.querySelector(
        '.l2-chrome-nav-column > .l2-hud-panel, .l2-townlive-column > .l2-hud-panel, .l2-screen-inner > .l2-hud-panel'
      );
      var html = global.L2.getHudPanelMarkup();
      var tpl = document.createElement('template');
      /* template розбирає одразу вузол <header> */
      tpl.innerHTML = html;
      var node = tpl.content.firstElementChild;
      if (!node || !node.classList.contains('l2-hud-panel')) return;
      if (m) {
        m.replaceWith(node);
        return;
      }
      if (existing) {
        var needLegacy = document.body.classList.contains('l2-nav-minimal');
        var hasLegacy = existing.classList.contains('l2-hud-panel--legacy-minimal');
        var hasStrip = existing.classList.contains('l2-hud-panel--city-strip');
        if ((needLegacy && !hasLegacy) || (!needLegacy && !hasStrip)) {
          existing.replaceWith(node);
        }
      }
    },

    shouldLinkPlayerProfile: function () {
      if (typeof document === 'undefined' || !document.body) return false;
      if (document.body.classList.contains('l2-page-battle')) return false;
      if (document.body.classList.contains('l2-page-olympiad')) return false;
      return document.body.classList.contains('l2-app-l2-chrome');
    },

    playerProfileHref: function (opts) {
      opts = opts || {};
      var id =
        opts.characterId != null ? String(opts.characterId).trim() : '';
      var name = opts.name != null ? String(opts.name).trim() : '';
      if (id) return '/player.html?id=' + encodeURIComponent(id);
      if (name) return '/player.html?name=' + encodeURIComponent(name);
      return '/player.html';
    },

    createPlayerProfileNickEl: function (opts) {
      opts = opts || {};
      var label = opts.name != null ? String(opts.name) : '—';
      var className = opts.className != null ? String(opts.className) : '';
      var id = opts.characterId != null ? String(opts.characterId).trim() : '';
      var name = opts.name != null ? String(opts.name).trim() : '';
      if (
        !global.L2.shouldLinkPlayerProfile() ||
        (!id && !name)
      ) {
        var span = document.createElement('span');
        if (className) span.className = className;
        span.textContent = label;
        return span;
      }
      var link = document.createElement('a');
      link.className = className
        ? className + ' l2-player-profile-link'
        : 'l2-player-profile-link';
      link.href = global.L2.playerProfileHref({ characterId: id, name: name });
      link.textContent = label;
      return link;
    },

    hunt: async function (ids) {
      var t = global.L2.token();
      var snap = lastSnapshot;
      if (!t || !snap) return false;
      var r = await fetch('/game/hunt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + t,
        },
        body: JSON.stringify({ expectedRevision: snap.revision }),
      });
      if (r.status === 409) {
        if (ids.msg) {
          var m409 = document.getElementById(ids.msg);
          if (m409) {
            m409.hidden = false;
            m409.textContent = 'Конфлікт revision — синхронізація…';
          }
        }
        await global.L2.fetchSnapshot();
        if (lastSnapshot) global.L2.renderStats(ids, lastSnapshot);
        if (ids.msg) {
          var mClear = document.getElementById(ids.msg);
          if (mClear) {
            mClear.hidden = true;
            mClear.textContent = '';
          }
        }
        return true;
      }
      if (!r.ok) {
        if (ids.msg) {
          var mErr = document.getElementById(ids.msg);
          if (mErr) {
            mErr.hidden = false;
            mErr.textContent = 'Полювання не вдалося.';
          }
        }
        return false;
      }
      var j = await r.json();
      lastSnapshot = j.character;
      global.L2.renderStats(ids, lastSnapshot);
      return true;
    },
  };

  try {
    var _uil = global.L2.getUiLang();
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = _uil === 'ru' ? 'ru' : 'uk';
    }
  } catch (e) {
    /* ignore */
  }

  var CHAT_REPLY_NOTIFY_VER = '20260709perf1';
  var ONLINE_FOOT_ASSET_VER = '20260709perfLayout1';

  function bootstrapChatReplyNotify() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return;

    if (!document.getElementById('l2-chat-reply-notify-css')) {
      var cssReply = document.createElement('link');
      cssReply.id = 'l2-chat-reply-notify-css';
      cssReply.rel = 'stylesheet';
      cssReply.href = '/css/l2-chat-reply-notify.css?v=' + CHAT_REPLY_NOTIFY_VER;
      (document.head || document.documentElement).appendChild(cssReply);
    }

    function runReplyMount() {
      if (global.L2ChatReplyNotify && typeof global.L2ChatReplyNotify.mount === 'function') {
        global.L2ChatReplyNotify.mount();
      }
    }

    if (global.L2ChatReplyNotify) {
      runReplyMount();
      return;
    }

    if (document.getElementById('l2-chat-reply-notify-js')) {
      return;
    }

    var scriptReply = document.createElement('script');
    scriptReply.id = 'l2-chat-reply-notify-js';
    scriptReply.src = '/l2-chat-reply-notify.js?v=' + CHAT_REPLY_NOTIFY_VER;
    scriptReply.onload = runReplyMount;
    (document.head || document.documentElement).appendChild(scriptReply);
  }

  function bootstrapOnlineFoot() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return;
    if (document.body.classList.contains('l2-page-online')) return;

    if (!document.getElementById('l2-online-foot-css')) {
      var css = document.createElement('link');
      css.id = 'l2-online-foot-css';
      css.rel = 'stylesheet';
      css.href = '/css/l2-online-foot.css?v=' + ONLINE_FOOT_ASSET_VER;
      (document.head || document.documentElement).appendChild(css);
    }

    function runMount() {
      if (global.L2OnlineFoot && typeof global.L2OnlineFoot.mount === 'function') {
        global.L2OnlineFoot.mount();
      }
    }

    if (global.L2OnlineFoot) {
      runMount();
      return;
    }

    if (document.getElementById('l2-online-foot-js')) {
      return;
    }

    var script = document.createElement('script');
    script.id = 'l2-online-foot-js';
    script.src = '/l2-online-foot.js?v=' + ONLINE_FOOT_ASSET_VER;
    script.onload = runMount;
    (document.head || document.documentElement).appendChild(script);
  }

  if (typeof document !== 'undefined') {
    function runHudMount() {
      if (global.L2 && typeof global.L2.mountStandardHudPanel === 'function') {
        global.L2.mountStandardHudPanel();
      }
      bootstrapOnlineFoot();
      bootstrapChatReplyNotify();
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runHudMount);
    } else {
      runHudMount();
    }
  }

  if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
    if (!global.__l2SwRegisterStarted) {
      global.__l2SwRegisterStarted = true;
      window.addEventListener('load', function () {
        navigator.serviceWorker
          .register('/sw.js', { scope: '/', updateViaCache: 'none' })
          .catch(function () {
            /* ignore */
          });
      });
    }
  }
})(window);
