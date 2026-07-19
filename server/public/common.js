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
  var snapshotFetchInFlight = null;
  var sessionCatalogMerged = false;
  var sessionCatalogFetchPromise = null;
  var hudFirstFillDone = false;
  var clanInviteRespondInFlight = false;
  var SESSION_SNAPSHOT_CACHE_KEY = 'l2-char-snapshot-cache-v1';
  var ONLINE_COUNT_CACHE_KEY = 'l2-online-count-cache-v1';
  var CATALOG_HINTS_LS_KEY = 'l2-catalog-hints-v1';
  var CRAFT_BOOK_LS_KEY = 'l2-craft-book-v1';
  var ITEM_ICON_HINTS_CACHE_KEY = 'l2-item-icon-hints-v1';
  var itemIconHintsPersistTimer = null;
  var knownCatalogVersion = null;
  var craftBookCache = null;
  var craftBookFetchPromise = null;
  var ONLINE_COUNT_FRESH_MS = 45000;
  var APP_DATA_VERSION = '20260719partyHudPollOpt1';
  var APP_DATA_VERSION_KEY = 'l2.appDataVersion';

  function resetCatalogSessionState() {
    sessionCatalogMerged = false;
    sessionCatalogFetchPromise = null;
    knownCatalogVersion = null;
    craftBookCache = null;
    craftBookFetchPromise = null;
  }

  function clearPersonalClientCaches() {
    lastSnapshot = null;
    resetCatalogSessionState();
    try {
      sessionStorage.removeItem(SESSION_SNAPSHOT_CACHE_KEY);
      sessionStorage.removeItem('l2-map-snapshot-cache-v1');
      sessionStorage.removeItem(ONLINE_COUNT_CACHE_KEY);
      sessionStorage.removeItem(ITEM_ICON_HINTS_CACHE_KEY);
      localStorage.removeItem(CATALOG_HINTS_LS_KEY);
      localStorage.removeItem(CRAFT_BOOK_LS_KEY);
    } catch (eClear) {
      /* ignore */
    }
  }

  function invalidateOldClientCaches() {
    try {
      var stored = localStorage.getItem(APP_DATA_VERSION_KEY);
      if (stored === APP_DATA_VERSION) return;
      localStorage.removeItem(CATALOG_HINTS_LS_KEY);
      localStorage.removeItem(CRAFT_BOOK_LS_KEY);
      sessionStorage.removeItem(SESSION_SNAPSHOT_CACHE_KEY);
      sessionStorage.removeItem('l2-map-snapshot-cache-v1');
      resetCatalogSessionState();
      lastSnapshot = null;
      localStorage.setItem(APP_DATA_VERSION_KEY, APP_DATA_VERSION);
    } catch (eInv) {
      /* ignore */
    }
  }

  invalidateOldClientCaches();

  function getSnapshotRevision(snapshot) {
    var revision = Number(snapshot && snapshot.revision);
    return Number.isFinite(revision) ? revision : null;
  }

  function getSnapshotGeneratedAt(snapshot) {
    var ts = Number(snapshot && snapshot.snapshotGeneratedAt);
    return Number.isFinite(ts) ? ts : null;
  }

  function getClientSnapshotVersion(snapshot) {
    var ver = Number(snapshot && snapshot.clientSnapshotVersion);
    return Number.isFinite(ver) ? ver : null;
  }

  /**
   * Transport ordering guard — не гарантує актуальність даних при однаковому revision.
   * clientSnapshotVersion = порядок формування відповіді, не порядок read/commit.
   * Довгостроково: revision + battleVersion + chatUnreadVersion окремо.
   */
  function shouldRejectIncomingSnapshot(current, snapshot) {
    if (!snapshot) return true;
    if (!current) return false;
    var sameCharacter =
      !current.id ||
      !snapshot.id ||
      String(current.id) === String(snapshot.id);
    if (!sameCharacter) return false;

    var incomingRevision = getSnapshotRevision(snapshot);
    var currentRevision = getSnapshotRevision(current);

    if (
      incomingRevision !== null &&
      currentRevision !== null &&
      incomingRevision < currentRevision
    ) {
      return true;
    }
    if (
      incomingRevision !== null &&
      currentRevision !== null &&
      incomingRevision > currentRevision
    ) {
      return false;
    }

    if (
      incomingRevision !== null &&
      currentRevision !== null &&
      incomingRevision === currentRevision
    ) {
      var incomingVer = getClientSnapshotVersion(snapshot);
      var currentVer = getClientSnapshotVersion(current);
      if (currentVer !== null && incomingVer === null) {
        return true;
      }
      if (currentVer === null && incomingVer !== null) {
        return false;
      }
      if (currentVer !== null && incomingVer !== null) {
        if (incomingVer < currentVer) return true;
        if (incomingVer > currentVer) return false;
      }

      var incomingAt = getSnapshotGeneratedAt(snapshot);
      var currentAt = getSnapshotGeneratedAt(current);
      if (currentAt !== null && incomingAt === null) {
        return true;
      }
      if (currentAt === null && incomingAt !== null) {
        return false;
      }
      if (currentAt !== null && incomingAt !== null) {
        return incomingAt < currentAt;
      }
      return false;
    }

    return false;
  }

  function rememberCatalogVersion(version) {
    if (version == null || String(version).trim() === '') return;
    knownCatalogVersion = String(version).trim();
  }

  function readCatalogHintsFromLocalStorage() {
    try {
      var tok = global.L2 && global.L2.token ? global.L2.token() : null;
      if (!tok) return null;
      var raw = localStorage.getItem(CATALOG_HINTS_LS_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      if (!j || typeof j !== 'object') return null;
      if (j.tokenSig !== global.L2.tokenSessionSig(tok)) return null;
      if (!j.catalogVersion || !j.payload) return null;
      return j;
    } catch (e) {
      return null;
    }
  }

  function writeCatalogHintsToLocalStorage(catalogVersion, payload) {
    try {
      var tok = global.L2.token();
      if (!tok || !payload) return;
      localStorage.setItem(
        CATALOG_HINTS_LS_KEY,
        JSON.stringify({
          tokenSig: global.L2.tokenSessionSig(tok),
          catalogVersion: String(catalogVersion),
          payload: payload,
        })
      );
      rememberCatalogVersion(catalogVersion);
    } catch (e) {
      /* ignore quota */
    }
  }

  function hydrateCatalogHintsFromLocalStorage() {
    if (sessionCatalogMerged) return true;
    var cached = readCatalogHintsFromLocalStorage();
    if (!cached || !cached.payload) return false;
    mergeCharacterCatalogHints(cached.payload);
    rememberCatalogVersion(cached.catalogVersion);
    return sessionCatalogMerged;
  }

  function readCraftBookFromLocalStorage() {
    try {
      var raw = localStorage.getItem(CRAFT_BOOK_LS_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      if (!j || typeof j !== 'object' || !j.bookVersion || !j.tiers) return null;
      return j;
    } catch (e) {
      return null;
    }
  }

  function writeCraftBookToLocalStorage(bookVersion, tiers) {
    try {
      if (!bookVersion || !tiers) return;
      localStorage.setItem(
        CRAFT_BOOK_LS_KEY,
        JSON.stringify({
          bookVersion: String(bookVersion),
          tiers: tiers,
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function loadItemIconHintsFromSession() {
    try {
      var raw = sessionStorage.getItem(ITEM_ICON_HINTS_CACHE_KEY);
      if (!raw) return;
      var j = JSON.parse(raw);
      if (!j || typeof j !== 'object') return;
      var icons = global.L2 && global.L2.itemIconById;
      if (!icons) return;
      Object.keys(j).forEach(function (k) {
        var id = normalizePositiveInt(k);
        var url = j[k];
        if (id > 0 && url != null && String(url).trim() !== '') {
          icons[id] = String(url);
        }
      });
    } catch (eLoadIcons) {
      /* ignore */
    }
  }

  function persistItemIconHintsToSession() {
    try {
      var icons = global.L2 && global.L2.itemIconById;
      if (!icons) return;
      var keys = Object.keys(icons);
      if (keys.length > 800) keys = keys.slice(keys.length - 800);
      var out = {};
      for (var i = 0; i < keys.length; i++) {
        out[keys[i]] = icons[keys[i]];
      }
      sessionStorage.setItem(ITEM_ICON_HINTS_CACHE_KEY, JSON.stringify(out));
    } catch (eSaveIcons) {
      /* ignore quota */
    }
  }

  function schedulePersistItemIconHints() {
    if (itemIconHintsPersistTimer) return;
    itemIconHintsPersistTimer = setTimeout(function () {
      itemIconHintsPersistTimer = null;
      persistItemIconHintsToSession();
    }, 250);
  }

  function hasCatalogHintsPayload(j) {
    if (!j || typeof j !== 'object') return false;
    return !!(
      j.gearCatalog ||
      j.itemNamesEn ||
      j.itemNamesUk ||
      j.itemSlotHints ||
      j.itemInventoryTabHints ||
      j.itemGradeHints ||
      j.itemStatsHints ||
      j.itemBlocksShieldById ||
      j.craftResourceIconByItemId ||
      j.itemNameColorSlugById
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
    if (j.itemNamesEn && typeof j.itemNamesEn === 'object' && global.L2.itemNameById) {
      Object.keys(j.itemNamesEn).forEach(function (k) {
        global.L2.itemNameById[k] = j.itemNamesEn[k];
      });
    } else if (j.itemNamesUk && typeof j.itemNamesUk === 'object' && global.L2.itemNameById) {
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
    if (
      j.itemNameColorSlugById &&
      typeof j.itemNameColorSlugById === 'object' &&
      global.L2.itemNameColorSlugById
    ) {
      Object.keys(j.itemNameColorSlugById).forEach(function (k) {
        global.L2.itemNameColorSlugById[k] = j.itemNameColorSlugById[k];
      });
    }
  }

  async function ensureCatalogHintsLoaded(token, opts) {
    opts = opts || {};
    if (!token) return false;
    if (sessionCatalogMerged && !opts.force) return true;
    if (!opts.force && hydrateCatalogHintsFromLocalStorage()) {
      return true;
    }
    if (sessionCatalogFetchPromise) return sessionCatalogFetchPromise;
    sessionCatalogFetchPromise = fetch('/character/catalog-hints', {
      headers: { Authorization: 'Bearer ' + token },
      cache: 'no-store',
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
        if (!j) return sessionCatalogMerged;
        var ver = j.catalogVersion;
        var cached = readCatalogHintsFromLocalStorage();
        if (
          !opts.force &&
          ver &&
          cached &&
          cached.catalogVersion === String(ver) &&
          cached.payload
        ) {
          sessionCatalogMerged = false;
          mergeCharacterCatalogHints(cached.payload);
          rememberCatalogVersion(ver);
          return sessionCatalogMerged;
        }
        sessionCatalogMerged = false;
        mergeCharacterCatalogHints(j);
        if (ver) {
          writeCatalogHintsToLocalStorage(ver, j);
        }
        return sessionCatalogMerged;
      })
      .catch(function () {
        return hydrateCatalogHintsFromLocalStorage();
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
    /** Alias для діагностики revision у battle.js. */
    getLastSnapshot: function () {
      return lastSnapshot;
    },
    setLastSnapshot: function (s) {
      lastSnapshot = s;
      if (s && typeof s === 'object') {
        global.L2.writeSessionSnapshotCache(SESSION_SNAPSHOT_CACHE_KEY, s);
      }
    },
    /**
     * Примусово записати revision у memory + sessionStorage cache.
     * Використовувати після 409, коли serverRevision — єдине джерело правди.
     */
    applyAuthoritativeRevision: function (snapshot, serverRevision) {
      if (!snapshot || typeof snapshot !== 'object') return null;
      var rev = normalizePositiveInt(serverRevision);
      if (!rev) rev = normalizePositiveInt(snapshot.revision);
      if (!rev) return snapshot;
      var auth = Object.assign({}, snapshot, { revision: rev });
      lastSnapshot = auth;
      global.L2.writeSessionSnapshotCache(SESSION_SNAPSHOT_CACHE_KEY, auth);
      return auth;
    },
    /** Поточний snapshot з memory або sessionStorage (без мережі). */
    getCachedCharacter: function () {
      return global.L2.getSessionSnapshotOrNull();
    },
    setCachedCharacter: function (snapshot) {
      if (!snapshot) return null;
      lastSnapshot = snapshot;
      global.L2.writeSessionSnapshotCache(
        SESSION_SNAPSHOT_CACHE_KEY,
        snapshot
      );
      return snapshot;
    },
    clearCachedCharacter: function () {
      return global.L2.clearSessionCharacterCache();
    },
    /** Після мутації: snapshot з відповіді сервера — єдине джерело правди. */
    applyMutationSnapshot: function (snapshot, applyScreenSpecific) {
      return global.L2.applyCharacterSnapshot(snapshot, applyScreenSpecific);
    },
    /** Одразу малює HUD/бари з кешу; повертає snapshot або null. */
    renderCharacterFromCache: function () {
      return global.L2.hydrateCharacterFromSessionCache();
    },
    /**
     * GET /character лише якщо немає кешу, force, claimWorld або resync після 409.
     * Навігація між сторінками — без мережі.
     */
    resyncCharacterWhenRequired: async function (opts) {
      opts = opts || {};
      if (opts.force === true || opts.claimWorld === true || opts.claimWorld === 1) {
        return global.L2.fetchSnapshot(opts);
      }
      var cached = global.L2.getCachedCharacter();
      if (cached) {
        lastSnapshot = cached;
        return cached;
      }
      return global.L2.fetchSnapshot(opts);
    },
    /** Екран PvE-поразки (РБ/моб) — battle.html з кнопкою «Повернутися в місто». */
    redirectToPveDefeatScreen: function (snapshot) {
      var snap = snapshot || lastSnapshot;
      if (!snap || !snap.pveDefeat) return false;
      var sid = snap.pveDefeat.spawnId;
      if (sid) {
        window.location.replace(
          '/battle.html?spawnId=' + encodeURIComponent(String(sid))
        );
        return true;
      }
      window.location.replace('/battle.html?pveDeath=1');
      return true;
    },
    /** Оновити лише поля карти/HUD у глобальному snapshot (poll map-state). */
    mergeMapStateIntoSnapshot: function (partial) {
      if (!partial || typeof partial !== 'object') return lastSnapshot;
      if (!lastSnapshot) {
        lastSnapshot = partial;
        return lastSnapshot;
      }
      var keys = [
        'id',
        'revision',
        'worldX',
        'worldY',
        'targetX',
        'targetY',
        'level',
        'hp',
        'maxHp',
        'expBarCur',
        'expBarMax',
        'expBarPct',
        'name',
      ];
      var patch = {};
      for (var ki = 0; ki < keys.length; ki++) {
        var k = keys[ki];
        if (Object.prototype.hasOwnProperty.call(partial, k)) {
          patch[k] = partial[k];
        }
      }
      lastSnapshot = Object.assign({}, lastSnapshot, patch);
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
    /** itemId → seal-green | seal-blue | seal-red — з catalog-hints itemNameColorSlugById */
    itemNameColorSlugById: {},
    itemGradeSlugForId: function (itemId) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return '';
      var g = global.L2.itemGradeById && global.L2.itemGradeById[id];
      if (g == null || String(g).trim() === '') {
        g =
          global.L2.itemGradeById &&
          global.L2.itemGradeById[String(id)];
      }
      if (g == null || String(g).trim() === '') return '';
      return String(g).trim().toLowerCase();
    },
    /** NG | D | C | B | A | S для підпису в UI. */
    itemGradeLabelForId: function (itemId) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return '';
      var g = global.L2.itemGradeById && global.L2.itemGradeById[id];
      if (g == null || String(g).trim() === '') {
        g =
          global.L2.itemGradeById &&
          global.L2.itemGradeById[String(id)];
      }
      if (g == null || String(g).trim() === '') return '';
      return String(g).trim().toUpperCase();
    },
    itemNameAlreadyShowsGrade: function (name, gradeLabel) {
      if (!gradeLabel) return true;
      var n = String(name || '');
      if (!n.trim()) return false;
      var g = String(gradeLabel).trim();
      if (!g) return true;
      var esc = g.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(
        '(?:\\[\\s*' +
          esc +
          '\\s*\\]|\\(\\s*' +
          esc +
          '\\s*\\)|\\b' +
          esc +
          '-grade\\b)',
        'i'
      ).test(n);
    },
    /** Назва предмета з грейдом: «Devotion Boots [NG]». */
    itemDisplayNameWithGrade: function (itemId, baseNameOpt) {
      var id = normalizePositiveInt(itemId);
      var name =
        baseNameOpt != null && String(baseNameOpt).trim() !== ''
          ? String(baseNameOpt).trim()
          : (function () {
              var map = global.L2.itemNameById;
              if (!map || id <= 0) return id > 0 ? '#' + id : '';
              var n = map[id] != null ? map[id] : map[String(id)];
              if (n != null && String(n).trim() !== '') return String(n).trim();
              return '#' + id;
            })();
      var grade = global.L2.itemGradeLabelForId(id);
      if (!grade || global.L2.itemNameAlreadyShowsGrade(name, grade)) return name;
      return name + ' [' + grade + ']';
    },
    itemNameClassNames: function (itemId, baseClass) {
      var base =
        baseClass != null && String(baseClass).trim() !== ''
          ? String(baseClass).trim()
          : 'l2-item-name';
      var id = normalizePositiveInt(itemId);
      var colorMap = global.L2.itemNameColorSlugById || {};
      var colorSlug = id > 0 ? colorMap[id] || colorMap[String(id)] : null;
      if (colorSlug && String(colorSlug).trim() !== '') {
        return base + ' l2-item-name--' + String(colorSlug).trim();
      }
      var slug = global.L2.itemGradeSlugForId(itemId);
      if (!slug) return base;
      return base + ' l2-item-name--grade-' + slug;
    },
    decorateItemNameEl: function (el, itemId, baseClass) {
      if (!el) return el;
      el.className = global.L2.itemNameClassNames(itemId, baseClass || el.className);
      return el;
    },
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
      schedulePersistItemIconHints();
    },
    rememberItemIconHint: function (itemId, iconUrl) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return;
      if (iconUrl == null || String(iconUrl).trim() === '') return;
      global.L2.itemIconById[id] = String(iconUrl);
      schedulePersistItemIconHints();
    },
    resolveItemIconUrl: function (itemId, fallbackUrl) {
      var id = normalizePositiveInt(itemId);
      var fb =
        fallbackUrl != null && String(fallbackUrl).trim() !== ''
          ? String(fallbackUrl)
          : '/icons/drops/other.svg';
      var safeFb = global.L2.sanitizeClientIconUrl
        ? global.L2.sanitizeClientIconUrl(fb)
        : fb;
      if (id <= 0) return safeFb;
      var u = global.L2.itemIconById && global.L2.itemIconById[id];
      if (u != null && String(u).trim() !== '') {
        return global.L2.sanitizeClientIconUrl
          ? global.L2.sanitizeClientIconUrl(String(u))
          : String(u);
      }
      return '/game/item-icon/' + id;
    },
    /** Лише відносні шляхи /assets, /icons, /game — без javascript:/data:. */
    sanitizeClientIconUrl: function (url) {
      var raw = url != null ? String(url).trim() : '';
      if (!raw) return '/icons/drops/other.svg';
      if (
        raw.charAt(0) === '/' &&
        (raw.indexOf('/assets/') === 0 ||
          raw.indexOf('/icons/') === 0 ||
          raw.indexOf('/game/') === 0 ||
          raw.indexOf('/skills/') === 0 ||
          raw.indexOf('/ref/') === 0)
      ) {
        return raw;
      }
      return '/icons/drops/other.svg';
    },
    /** Тон підпису стата (магазин / сумка / модалка). */
    itemStatLineTone: function (labelUk) {
      var raw = String(labelUk || '').trim();
      var s = raw.toLowerCase();
      if (/hp\s*макс|hp\s*max\b/i.test(s)) return 'hpmax';
      if (/mp\s*макс|mp\s*max\b/i.test(s)) return 'mpmax';
      if (/блок\s*щитом/i.test(s)) return 'shield-block';
      if (/захист\s*щита/i.test(s)) return 'shield-def';
      if (/маг\.?\s*захист|^m\.?\s*def\b/i.test(s)) return 'mdef';
      if (/фіз\.?\s*захист/i.test(s)) return 'pdef';
      if (/^p\.?\s*def$/i.test(raw)) return 'pdef-shield';
      if (/^p\.?\s*atk|фіз\.?\s*атак/i.test(s)) return 'patk';
      if (/^m\.?\s*atk|маг\.?\s*атак/i.test(s)) return 'matk';
      if (/швидк|speed|spd\.?|скор\.?|atk\s*spd|cast\s*spd/i.test(s)) return 'speed';
      if (/крит|crit/i.test(s)) return 'crit';
      return 'default';
    },
    /** Пара «Підпис: значення» з кольорами як у магазині. */
    appendColoredItemStatPair: function (parent, labelUk, valueUk) {
      if (!parent) return;
      var label = labelUk != null ? String(labelUk).trim() : '';
      var val = valueUk != null ? String(valueUk).trim() : '';
      if (!label && !val) return;
      if (!label) {
        var plain = document.createElement('span');
        plain.className = 'l2-item-stat-plain';
        plain.textContent = val;
        parent.appendChild(plain);
        return;
      }
      var tone = global.L2.itemStatLineTone(label);
      var lblSpan = document.createElement('span');
      lblSpan.className = 'l2-item-stat-lbl l2-item-stat-lbl--' + tone;
      lblSpan.textContent = label + ':';
      var sp = document.createElement('span');
      sp.className = 'l2-item-stat-sp';
      sp.textContent = ' ';
      var valSpan = document.createElement('span');
      valSpan.className = 'l2-item-stat-val';
      valSpan.textContent = val;
      parent.appendChild(lblSpan);
      parent.appendChild(sp);
      parent.appendChild(valSpan);
    },
    /** Рядок stat preview (може містити «|» між частинами). */
    appendColoredItemStatSegments: function (parent, labelUk, valueUk) {
      if (!parent) return;
      var label = labelUk != null ? String(labelUk).trim() : '';
      var val = valueUk != null ? String(valueUk).trim() : '';
      var raw = label ? label + ': ' + val : val;
      var segments = raw.split('|');
      for (var si = 0; si < segments.length; si++) {
        if (si > 0) {
          var sep = document.createElement('span');
          sep.className = 'l2-item-stat-sep';
          sep.textContent = ' | ';
          parent.appendChild(sep);
        }
        var chunk = segments[si].trim();
        var ci = chunk.indexOf(':');
        if (ci === -1) {
          var plain = document.createElement('span');
          plain.className = 'l2-item-stat-plain';
          plain.textContent = chunk;
          parent.appendChild(plain);
          continue;
        }
        var lbl = chunk.slice(0, ci).trim();
        var num = chunk.slice(ci + 1).trim();
        global.L2.appendColoredItemStatPair(parent, lbl, num);
      }
    },
    /** Один рядок «Підпис: значення» у модалці предмета. */
    appendItemStatLine: function (parent, labelUk, valueUk) {
      if (!parent) return;
      var p = document.createElement('p');
      p.className = 'l2-item-modal-stat';
      global.L2.appendColoredItemStatPair(p, labelUk, valueUk);
      parent.appendChild(p);
    },
    /** Тип зброї українською — як у магазині (dropsShopStatsPreviewUk). */
    weaponKindUk: function (kind) {
      var map = {
        sword: 'Меч',
        blunt: 'Булава',
        dagger: 'Кинджал',
        bow: 'Лук',
        bigsword: 'Дворучний меч',
        bigblunt: 'Дворучний тупий',
        dual: 'Подвійні мечі',
        pole: 'Спис',
        fist: 'Кастети',
      };
      return map[kind] || String(kind || '');
    },
    /** Рядки статів предмета — єдина логіка з магазином (labelUk / valueUk). */
    buildItemStatsPreviewLines: function (itemId) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return [];
      var st = global.L2.itemStatsById && global.L2.itemStatsById[id];
      var slot = global.L2.itemSlotById && global.L2.itemSlotById[id];
      if (!st || typeof st !== 'object') return [];
      var lines = [];
      function pctFromMul(mul) {
        var p = Math.round((Number(mul) - 1) * 100);
        return (p >= 0 ? '+' : '') + p + '%';
      }
      if (slot === 'consumable') {
        lines.push({ labelUk: 'Тип', valueUk: 'Розхідник' });
        lines.push({
          labelUk: 'Примітка',
          valueUk: 'Не екіпірується; лише сумка.',
        });
        return lines;
      }
      if (slot === 'rhand') {
        if (st.pAtk != null) {
          lines.push({ labelUk: 'Фіз. атака', valueUk: String(st.pAtk) });
        }
        if (st.mAtk != null) {
          lines.push({ labelUk: 'Маг. атака', valueUk: String(st.mAtk) });
        }
        if (st.atkSpd != null) {
          lines.push({ labelUk: 'Швидкість бою', valueUk: String(st.atkSpd) });
        }
        var wk =
          global.L2.itemWeaponTypeById && global.L2.itemWeaponTypeById[id];
        if (wk) {
          lines.push({
            labelUk: 'Тип зброї',
            valueUk: global.L2.weaponKindUk(wk),
          });
        }
        if (st.wpnCrit != null) {
          lines.push({ labelUk: 'Крит.', valueUk: String(st.wpnCrit) });
        }
        if (st.rCrit != null && Number(st.rCrit) > 0) {
          lines.push({ labelUk: 'Крит.', valueUk: '+' + String(st.rCrit) });
        }
        return lines;
      }
      if (
        slot === 'chest' ||
        slot === 'legs' ||
        slot === 'head' ||
        slot === 'gloves' ||
        slot === 'feet' ||
        slot === 'fullarmor' ||
        slot === 'lhand'
      ) {
        if (st.pDef != null) {
          lines.push({
            labelUk: 'Фіз. захист (P.Def)',
            valueUk: String(st.pDef),
          });
        }
        if (slot === 'lhand' || slot === 'shield') {
          if (st.shieldRatePercent != null) {
            lines.push({
              labelUk: 'Блок щитом',
              valueUk: String(st.shieldRatePercent) + '%',
            });
          }
          if (st.shieldDef != null) {
            lines.push({
              labelUk: 'Захист щита',
              valueUk: String(st.shieldDef),
            });
          }
        }
        var slotUkMap = {
          head: 'Голова',
          chest: 'Нагрудник',
          legs: 'Низ',
          gloves: 'Рукавиці',
          feet: 'Черевики',
          fullarmor: 'Повний доспех',
          lhand: 'Ліва рука (щит)',
        };
        if (slotUkMap[slot]) {
          lines.push({ labelUk: 'Слот', valueUk: slotUkMap[slot] });
        }
        var armT =
          global.L2.itemArmorTypeById && global.L2.itemArmorTypeById[id];
        if (armT) {
          var armUk =
            armT === 'heavy'
              ? 'Тяжка'
              : armT === 'light'
                ? 'Легка'
                : armT === 'magic'
                  ? 'Мантія'
                  : String(armT);
          lines.push({ labelUk: 'Тип броні', valueUk: armUk });
        }
        return lines;
      }
      if (slot === 'ring' || slot === 'neck' || slot === 'earring') {
        var mdef =
          st.jewelMdefFlat != null
            ? st.jewelMdefFlat
            : st.jewelryMAtk != null
              ? st.jewelryMAtk
              : st.mAtk;
        if (mdef != null) {
          lines.push({
            labelUk: 'Маг. захист (M.Def)',
            valueUk: String(mdef),
          });
        }
        if (st.jewelMaxHp != null && st.jewelMaxHp > 0) {
          lines.push({ labelUk: 'HP макс.', valueUk: '+' + String(st.jewelMaxHp) });
        }
        if (st.jewelMaxMp != null && st.jewelMaxMp > 0) {
          lines.push({ labelUk: 'MP макс.', valueUk: '+' + String(st.jewelMaxMp) });
        }
        if (st.jewelAcc != null && st.jewelAcc > 0) {
          lines.push({ labelUk: 'Точність', valueUk: '+' + String(st.jewelAcc) });
        }
        if (st.jewelEva != null && st.jewelEva > 0) {
          lines.push({ labelUk: 'Ухилення', valueUk: '+' + String(st.jewelEva) });
        }
        if (st.jewelMpRegenMul != null && st.jewelMpRegenMul > 1) {
          lines.push({
            labelUk: 'Реген MP',
            valueUk: pctFromMul(st.jewelMpRegenMul),
          });
        }
        if (st.jewelHoldResistMul != null && st.jewelHoldResistMul > 1) {
          lines.push({
            labelUk: 'Стійкість до утримання',
            valueUk: pctFromMul(st.jewelHoldResistMul),
          });
        }
        if (st.pDef != null && st.pDef > 0) {
          lines.push({ labelUk: 'Фіз. захист', valueUk: String(st.pDef) });
        }
        var accUk =
          slot === 'neck'
            ? 'Прикраса шиї'
            : slot === 'ring'
              ? 'Персень'
              : 'Сережка';
        lines.push({ labelUk: 'Тип аксесуара', valueUk: accUk });
        return lines;
      }
      if (slot) {
        lines.push({
          labelUk: 'Примітка',
          valueUk: 'Слот предмета: ' + String(slot),
        });
      }
      return lines;
    },
    /** Компактний рядок статів як у крамниці: P.Atk: 25 | Speed: 379 | Crit: 40 */
    buildItemStatsCompactLine: function (itemId) {
      var id = normalizePositiveInt(itemId);
      if (id <= 0) return '';
      var st = global.L2.itemStatsById && global.L2.itemStatsById[id];
      var slot = global.L2.itemSlotById && global.L2.itemSlotById[id];
      if (!st || typeof st !== 'object') return '';
      function dashOrNum(v) {
        return v != null ? String(v) : '—';
      }
      if (slot === 'rhand') {
        var pAtk = st.pAtk != null ? st.pAtk : null;
        var mAtk = st.mAtk != null ? st.mAtk : null;
        var speedStr = dashOrNum(st.atkSpd);
        var isMagic = mAtk != null && (pAtk == null || mAtk > pAtk);
        if (isMagic) {
          return 'M.Atk: ' + mAtk + ' | Speed: ' + speedStr + ' | Crit: —';
        }
        var parts = [];
        if (pAtk != null) parts.push('P.Atk: ' + pAtk);
        else if (mAtk != null) parts.push('M.Atk: ' + mAtk);
        parts.push('Speed: ' + speedStr);
        parts.push('Crit: ' + (st.wpnCrit != null ? String(st.wpnCrit) : '—'));
        return parts.join(' | ');
      }
      if (
        slot === 'chest' ||
        slot === 'legs' ||
        slot === 'head' ||
        slot === 'gloves' ||
        slot === 'feet' ||
        slot === 'fullarmor' ||
        slot === 'lhand'
      ) {
        if (st.pDef != null) return 'P.Def: ' + st.pDef;
        return '';
      }
      if (slot === 'ring' || slot === 'neck' || slot === 'earring') {
        var mdef =
          st.jewelMdefFlat != null
            ? st.jewelMdefFlat
            : st.jewelryMAtk != null
              ? st.jewelryMAtk
              : st.mAtk;
        if (mdef != null) return 'M.Def: ' + mdef;
        return '';
      }
      return '';
    },
    /** Інлайн-стати в рядку списку (магазин / сумка / склад). */
    appendItemStatsPreviewInline: function (parent, itemId) {
      if (!parent) return;
      var lines = global.L2.buildItemStatsPreviewLines(itemId);
      if (!lines.length) return;
      for (var si = 0; si < lines.length; si++) {
        if (si > 0) {
          var dotSep = document.createElement('span');
          dotSep.className = 'l2-item-stat-sep';
          dotSep.textContent = ' · ';
          parent.appendChild(dotSep);
        }
        global.L2.appendColoredItemStatSegments(
          parent,
          lines[si].labelUk,
          lines[si].valueUk
        );
      }
    },
    resolveSkillIconUrl: function (skillId, iconUrl) {
      if (iconUrl != null && String(iconUrl).charAt(0) === '/') {
        return global.L2.sanitizeClientIconUrl
          ? global.L2.sanitizeClientIconUrl(String(iconUrl))
          : String(iconUrl);
      }
      var id = normalizePositiveInt(skillId);
      if (id === 1) return '/skills/0001.jpg';
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
    /** Підпис поточної JWT-сесії для прив’язки snapshot-кешу (не characterId). */
    tokenSessionSig: function (t) {
      t = t != null ? String(t) : global.L2.token() || '';
      return t.length >= 8 ? t.slice(-16) : t;
    },
    /** Кеш snapshot у sessionStorage — лише для поточного token (без «чужого» героя). */
    readSessionSnapshotCache: function (key) {
      try {
        var tok = global.L2.token();
        if (!tok) return null;
        var raw = sessionStorage.getItem(key);
        if (!raw) return null;
        var j = JSON.parse(raw);
        if (!j || typeof j !== 'object') return null;
        if (j.tokenSig !== global.L2.tokenSessionSig(tok)) return null;
        var snap = j.snapshot;
        return snap && typeof snap === 'object' ? snap : null;
      } catch (e) {
        return null;
      }
    },
    writeSessionSnapshotCache: function (key, snapshot) {
      if (!snapshot || typeof snapshot !== 'object') return;
      var tok = global.L2.token();
      if (!tok) return;
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            tokenSig: global.L2.tokenSessionSig(tok),
            snapshot: snapshot,
            fetchedAt: Date.now(),
          })
        );
      } catch (e) {
        /* ignore quota */
      }
    },
    readSessionSnapshotFetchedAt: function (key) {
      try {
        var tok = global.L2.token();
        if (!tok) return null;
        var raw = sessionStorage.getItem(key || SESSION_SNAPSHOT_CACHE_KEY);
        if (!raw) return null;
        var j = JSON.parse(raw);
        if (!j || typeof j !== 'object') return null;
        if (j.tokenSig !== global.L2.tokenSessionSig(tok)) return null;
        return typeof j.fetchedAt === 'number' ? j.fetchedAt : null;
      } catch (e) {
        return null;
      }
    },
    readOnlineCountCache: function () {
      try {
        var tok = global.L2.token();
        if (!tok) return null;
        var raw = sessionStorage.getItem(ONLINE_COUNT_CACHE_KEY);
        if (!raw) return null;
        var j = JSON.parse(raw);
        if (!j || typeof j !== 'object') return null;
        if (j.tokenSig !== global.L2.tokenSessionSig(tok)) return null;
        if (typeof j.fetchedAt !== 'number') return null;
        if (Date.now() - j.fetchedAt > ONLINE_COUNT_FRESH_MS) return null;
        return typeof j.count === 'number' ? j.count : null;
      } catch (e) {
        return null;
      }
    },
    writeOnlineCountCache: function (count) {
      try {
        var tok = global.L2.token();
        if (!tok) return;
        sessionStorage.setItem(
          ONLINE_COUNT_CACHE_KEY,
          JSON.stringify({
            tokenSig: global.L2.tokenSessionSig(tok),
            count: Number(count),
            fetchedAt: Date.now(),
          })
        );
      } catch (e) {
        /* ignore */
      }
    },
    /** Скинути in-memory snapshot і sessionStorage-кеші персонажа (logout / новий акаунт). */
    clearSessionCharacterCache: function () {
      clearPersonalClientCaches();
    },
    setToken: function (t) {
      try {
        if (t) localStorage.setItem('token', t);
        else {
          localStorage.removeItem('token');
          global.L2.clearSessionCharacterCache();
        }
        sessionStorage.removeItem('token');
      } catch (e) {
        /* ignore */
      }
      if (!t) lastSnapshot = null;
    },

    fetchSnapshot: async function (opts) {
      var t = global.L2.token();
      if (!t) {
        lastSnapshot = null;
        return null;
      }
      if (snapshotFetchInFlight) {
        return snapshotFetchInFlight;
      }
      var claimWorld =
        opts && (opts.claimWorld === true || opts.claimWorld === 1);
      var url = claimWorld ? '/character?claimWorld=1' : '/character';
      snapshotFetchInFlight = (async function () {
        try {
          var r = await fetch(url, {
            headers: { Authorization: 'Bearer ' + t },
            cache: 'no-store',
          });
          if (r.status === 401) {
            global.L2.setToken(null);
            lastSnapshot = null;
            return null;
          }
          if (!r.ok) return null;
          var j = await r.json();
          if (!j || !j.character) return null;
          if (j.catalogVersion) {
            rememberCatalogVersion(j.catalogVersion);
          }
          return global.L2.applyCharacterSnapshot(j.character);
        } finally {
          snapshotFetchInFlight = null;
        }
      })();
      return snapshotFetchInFlight;
    },
    /** @deprecated — використовуй resyncCharacterWhenRequired */
    ensureCharacterSnapshot: async function (opts) {
      return global.L2.resyncCharacterWhenRequired(opts);
    },
    fetchCatalogHints: async function (opts) {
      var t = global.L2.token();
      if (!t) return false;
      return ensureCatalogHintsLoaded(t, opts || {});
    },
    fetchCraftBook: async function (opts) {
      opts = opts || {};
      if (craftBookCache && !opts.force) return craftBookCache;
      if (!opts.force) {
        var lsBook = readCraftBookFromLocalStorage();
        if (lsBook && lsBook.tiers) {
          craftBookCache = lsBook;
          return craftBookCache;
        }
      }
      if (craftBookFetchPromise) return craftBookFetchPromise;
      var t = global.L2.token();
      if (!t) return null;
      craftBookFetchPromise = fetch('/game/resource-craft/book', {
        headers: { Authorization: 'Bearer ' + t },
        cache: 'no-store',
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
          if (!j || !Array.isArray(j.tiers)) return null;
          craftBookCache = j;
          if (j.bookVersion) {
            writeCraftBookToLocalStorage(j.bookVersion, j.tiers);
          }
          return craftBookCache;
        })
        .catch(function () {
          return readCraftBookFromLocalStorage();
        })
        .finally(function () {
          craftBookFetchPromise = null;
        });
      return craftBookFetchPromise;
    },
    applyCharacterSnapshot: function (snapshot, applyScreenSpecific) {
      if (!snapshot) return null;

      var current = lastSnapshot || global.L2.getCachedCharacter();
      if (shouldRejectIncomingSnapshot(current, snapshot)) {
        return current;
      }

      lastSnapshot = snapshot;
      global.L2.writeSessionSnapshotCache(
        SESSION_SNAPSHOT_CACHE_KEY,
        snapshot
      );
      if (typeof global.L2.applyHudFromSnapshot === 'function') {
        global.L2.applyHudFromSnapshot(snapshot);
      }
      if (typeof applyScreenSpecific === 'function') {
        applyScreenSpecific(snapshot);
      }
      if (
        global.L2ChatReplyNotify &&
        typeof global.L2ChatReplyNotify.applyFromSnapshot === 'function'
      ) {
        global.L2ChatReplyNotify.applyFromSnapshot(snapshot);
      }
      return snapshot;
    },
    /** Ключ catalog/hints для dedupe renderAll (revision окремо). */
    getSnapshotCatalogRenderKey: function (snapshot) {
      var catVer = String(
        (snapshot && snapshot.catalogVersion) ||
          knownCatalogVersion ||
          ''
      );
      var hintsReady = sessionCatalogMerged ? 1 : 0;
      return catVer + ':' + hintsReady;
    },
    /** @deprecated — використовуй getSnapshotCatalogRenderKey + revision окремо */
    getSnapshotRenderKey: function (snapshot) {
      var rev = getSnapshotRevision(snapshot);
      if (rev === null) rev = 0;
      return (
        String(rev) + ':' + global.L2.getSnapshotCatalogRenderKey(snapshot)
      );
    },
    resyncCharacterAfterConflict: async function (
      applyScreenSpecific,
      conflictPayload,
      opts
    ) {
      opts = opts && typeof opts === 'object' ? opts : {};
      var forceApply = opts.force === true || opts.forceOnConflict === true;
      var snap =
        conflictPayload &&
        conflictPayload.character &&
        typeof conflictPayload.character === 'object'
          ? conflictPayload.character
          : null;
      if (!snap) {
        snap = await global.L2.fetchSnapshot();
      }
      if (!snap) throw new Error('failed_to_refetch_character');
      if (
        forceApply &&
        typeof conflictPayload === 'object' &&
        typeof conflictPayload.serverRevision === 'number'
      ) {
        snap = Object.assign({}, snap, {
          revision: conflictPayload.serverRevision,
        });
      }
      if (forceApply) {
        lastSnapshot = snap;
        global.L2.writeSessionSnapshotCache(SESSION_SNAPSHOT_CACHE_KEY, snap);
        if (typeof global.L2.applyHudFromSnapshot === 'function') {
          global.L2.applyHudFromSnapshot(snap);
        }
        if (typeof applyScreenSpecific === 'function') {
          applyScreenSpecific(snap);
        }
        return snap;
      }
      return global.L2.applyCharacterSnapshot(snap, applyScreenSpecific);
    },
    /**
     * map/city — «світова» сцена: закрити сесію подземелля на сервері (синхрон між пристроями).
     */
    claimWorldMapSession: async function () {
      return global.L2.fetchSnapshot({ claimWorld: true });
    },

    /** Повідомлення купівлі/продажу: зелений префікс + білий текст деталей. */
    renderShopCongratsMessage: function (el, kind, opts) {
      if (!el) return;
      opts = opts || {};
      el.textContent = '';
      var lead = document.createElement('span');
      lead.className = 'l2-shop-congrats-lead';
      lead.textContent =
        kind === 'sell' ? 'Вітаємо! Ви продали ' : 'Вітаємо! Ви придбали ';
      el.appendChild(lead);
      var detail = document.createElement('span');
      detail.className = 'l2-shop-congrats-detail';
      var name = String(opts.itemName || 'предмет').trim();
      var q = Math.max(1, Math.floor(Number(opts.qty) || 1));
      var text = '«' + name + '»';
      if (q > 1) text += ' × ' + q;
      if (kind === 'buy') {
        text += opts.adenaLabel
          ? ' за ' + String(opts.adenaLabel) + ' адени.'
          : '.';
      } else {
        text += ' — +' + String(opts.adenaLabel || '0') + ' адени.';
      }
      detail.textContent = text;
      el.appendChild(detail);
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

    /** Текст EXP% для legacy HUD. */
    formatLegacyExpPctText: function (expPct) {
      var p = Math.max(0, Math.min(100, Number(expPct) || 0));
      return p.toFixed(2) + ' %';
    },

    /** HTML для EXP% у legacy HUD (deprecated — лишено для сумісності). */
    formatLegacyExpPctHtml: function (expPct) {
      return global.L2.formatLegacyExpPctText(expPct);
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
        if (!el) return;
        if (id === 'l2-hud-exp-pct') {
          if (document.querySelector('.l2-hud-legacy-bars')) {
            el.textContent = global.L2.formatLegacyExpPctText(0);
            return;
          }
        }
        el.textContent = '—';
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
      if (typeof global.L2.applyNickColorFromSnapshot === 'function') {
        global.L2.applyNickColorFromSnapshot(null);
      }
    },

    /**
     * Заповнити панель l2-hud-panel з character snapshot (GET /character).
     */
    applyHudFromSnapshot: function (c) {
      if (typeof global.L2.applyNickColorFromSnapshot === 'function') {
        global.L2.applyNickColorFromSnapshot(c);
      }
      var hasWapBars =
        typeof document !== 'undefined' &&
        !!document.querySelector('.l2-hud-legacy-bars');
      var instantFill = hasWapBars && !hudFirstFillDone;
      var barsRoot = instantFill
        ? document.querySelector('.l2-hud-legacy-bars')
        : null;
      if (barsRoot) barsRoot.classList.add('l2-hud-legacy-bars--instant');
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
        if (typeof global.L2.syncGameHelper === 'function') {
          global.L2.syncGameHelper(null);
        }
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
      if (hasWapBars) {
        set(
          'l2-hud-exp-pct',
          global.L2.formatLegacyExpPctText(expPct)
        );
      } else {
        set(
          'l2-hud-exp-pct',
          Math.max(0, Math.min(100, expPct)).toFixed(1) + '%'
        );
      }
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
      if (hasWapBars) {
        var lvlAbbr =
          global.L2 && global.L2.tr ? global.L2.tr('abbr_level') : 'ур.';
        set(
          'l2-hud-legacy-lvl',
          String(c.level != null ? c.level : '—') + ' ' + lvlAbbr
        );
        set('l2-hud-legacy-name', c.name != null ? c.name : '—');
      }
      if (instantFill && barsRoot) {
        hudFirstFillDone = true;
        requestAnimationFrame(function () {
          barsRoot.classList.remove('l2-hud-legacy-bars--instant');
        });
      }
      if (typeof global.L2.syncGameHelper === 'function') {
        global.L2.syncGameHelper(c);
      }
      if (typeof global.L2.applyHudNoticeFromSnapshot === 'function') {
        global.L2.applyHudNoticeFromSnapshot(c);
      }
      if (typeof global.L2.applyPendingClanInviteFromSnapshot === 'function') {
        global.L2.applyPendingClanInviteFromSnapshot(c);
      }
    },

    /** Базовий колір ніка з HUD; пізніше — з snapshot.nickColor після «покраски». */
    applyNickColorFromSnapshot: function (c) {
      var fallback = '#bfa88a';
      var hex = fallback;
      if (c && typeof c.nickColor === 'string') {
        var trimmed = c.nickColor.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) hex = trimmed;
      }
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.setProperty('--l2-nick-color', hex);
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
      /* Головна/реєстрація — без HUD і нижньої сітки; nav-minimal обнуляє pad-top рамки. */
      if (document.body.classList.contains('l2-page-auth')) return;
      if (
        document.getElementById('l2-nav-bottom') ||
        document.body.classList.contains('l2-app-l2-chrome') ||
        document.body.classList.contains('l2-page-has-fixed-nav')
      ) {
        document.body.classList.add('l2-nav-minimal');
      }
    },

    /** Показати основний контент одразу (як char.html), без стрибка після fetch. */
    shouldRevealChromeShell: function (el) {
      if (!el || el.nodeType !== 1) return false;
      if (el.classList && el.classList.contains('l2-gm-modal-overlay')) return false;
      var tag = el.tagName;
      var id = el.id || '';
      if (/^l2-(pvp-incoming|party-hud-slot|clan-invite-hud|hud-notice|chat-reply-notify)$/.test(id)) {
        return false;
      }
      if (tag === 'SECTION' || tag === 'MAIN') {
        if (
          /(?:^|-)(?:err|stub-msg|overlay|modal|toast|hint|pager|confirm|edit-wrap|announce-edit|leave-confirm|smiles-panel|reply-hint|hero-stage|buff-strip|empty|announce-read|leave-wrap|nav-bottom|nav-top|hud-panel-mount|foot-links|craft-wrap|dev-boost-wrap|bag-modal|smiles-pager|load-err|battle-content)$/.test(
            id
          )
        ) {
          return false;
        }
        return true;
      }
      if (tag === 'DIV' && id) {
        if (
          id === 'clan-my-empty' ||
          id === 'chat-smiles-panel' ||
          id === 'battle-content'
        ) {
          return false;
        }
        if (id === 'clan-my-panel') return true;
        if (id.endsWith('-content') || id.endsWith('-panel')) return true;
      }
      return false;
    },

    hideHudOverlayWidgets: function () {
      if (typeof document === 'undefined') return;
      var pvp = document.getElementById('l2-pvp-incoming');
      if (
        pvp &&
        document.body &&
        !document.body.classList.contains('l2-page-map') &&
        !document.body.classList.contains('l2-page-battle')
      ) {
        pvp.hidden = true;
      }
    },

    revealChromePageContentEarly: function () {
      if (typeof document === 'undefined' || !document.body) return;
      if (!document.body.classList.contains('l2-app-l2-chrome')) return;
      if (!document.getElementById('l2-nav-bottom')) return;
      var token = null;
      try {
        token = localStorage.getItem('token');
      } catch (e) {
        token = null;
      }
      if (!token) return;
      var shouldReveal = global.L2.shouldRevealChromeShell;
      document
        .querySelectorAll(
          '.l2-screen-inner section[hidden], .l2-screen-inner main[hidden], .l2-chrome-nav-column section[hidden], .l2-chrome-nav-column main[hidden], .l2-townlive-column section[hidden], .l2-townlive-column main[hidden], .l2-screen-inner div[hidden][id$="-content"]:not(#battle-content), .l2-screen-inner div[hidden][id$="-panel"], .l2-screen-inner div[hidden]#clan-my-panel, .l2-chrome-nav-column div[hidden][id$="-content"]:not(#battle-content), .l2-chrome-nav-column div[hidden][id$="-panel"], .l2-townlive-column div[hidden][id$="-content"]:not(#battle-content), .l2-townlive-column div[hidden][id$="-panel"], .l2-townlive-column div[hidden]#clan-my-panel'
        )
        .forEach(function (el) {
          if (shouldReveal(el)) el.removeAttribute('hidden');
        });
      global.L2.hideHudOverlayWidgets();
    },

    seedOnlineFootEarly: function () {
      if (typeof document === 'undefined' || !document.body) return;
      if (!document.body.classList.contains('l2-app-l2-chrome')) return;
      if (document.body.classList.contains('l2-page-online')) return;
      if (document.body.classList.contains('l2-page-battle')) return;
      if (document.getElementById('l2-online-foot')) return;
      var shell = document.querySelector('.l2-shell');
      if (!shell) return;
      var screen = shell.querySelector('.l2-screen.l2-outer-sframe-host');
      if (!screen) return;
      var foot = document.createElement('div');
      foot.className = 'l2-online-foot';
      foot.id = 'l2-online-foot';
      var link = document.createElement('a');
      link.className = 'l2-online-foot__link';
      link.id = 'l2-online-link';
      link.href = '/online.html';
      link.textContent = 'Онлайн: —';
      foot.appendChild(link);
      if (screen.nextSibling) {
        shell.insertBefore(foot, screen.nextSibling);
      } else {
        shell.appendChild(foot);
      }
    },

    seedChatReplyNotifyEarly: function () {
      if (typeof document === 'undefined' || !document.body) return;
      if (!document.body.classList.contains('l2-app-l2-chrome')) return;
      if (document.body.classList.contains('l2-page-battle')) return;
      if (document.body.classList.contains('l2-page-chat')) return;
      if (document.getElementById('l2-chat-reply-notify')) return;
      var hud =
        document.querySelector(
          '.l2-chrome-nav-column > .l2-hud-panel, .l2-townlive-column > .l2-hud-panel, .l2-screen-inner > .l2-hud-panel'
        ) || document.getElementById('l2-hud-panel-mount');
      if (!hud) return;
      var link = document.createElement('a');
      link.className = 'l2-chat-reply-notify';
      link.id = 'l2-chat-reply-notify';
      link.href = '/chat.html';
      link.hidden = true;
      hud.insertAdjacentElement('afterend', link);
    },

    bootstrapChromeShellEarly: function () {
      if (typeof document === 'undefined' || !document.body) return;
      if (!document.body.classList.contains('l2-app-l2-chrome')) return;
      global.L2.ensureNavMinimalChrome();
      if (!document.getElementById('l2-nav-bottom')) return;
      global.L2.revealChromePageContentEarly();
      if (typeof global.L2.mountStandardHudPanel === 'function') {
        global.L2.mountStandardHudPanel();
      }
      if (typeof global.L2.hydrateCharacterFromSessionCache === 'function') {
        global.L2.hydrateCharacterFromSessionCache();
      }
      global.L2.seedOnlineFootEarly();
      global.L2.seedChatReplyNotifyEarly();
      global.L2.seedPartyHudEarly();
    },

    getPartyHudSlotMarkup: function () {
      return (
        '<div id="l2-party-hud-slot" class="l2-party-hud-slot" aria-live="polite">' +
        '<div id="l2-party-hud-inner" class="l2-party-hud-inner l2-party-hud-inner--empty"></div>' +
        '</div>'
      );
    },

    /** Єдині Wap-бари HP/MP/CP/EXP для всіх сторінок. */
    getHudWapBarsMarkup: function () {
      return (
        '<div class="l2-hud-legacy-bars" role="group" aria-label="HP, MP, CP, досвід">' +
        '<div class="l2-hud-legacy-bar l2-hud-legacy-bar--hp">' +
        '<div class="l2-hud-legacy-bar-outer">' +
        '<div class="l2-hud-legacy-bar-inner" id="l2-hud-hp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-legacy-bar-lbl">HP</span>' +
        '<span class="l2-hud-legacy-bar-val"><span id="l2-hud-hp-cur">—</span>/<span id="l2-hud-hp-max">—</span></span>' +
        '</div></div>' +
        '<div class="l2-hud-legacy-bar l2-hud-legacy-bar--mp">' +
        '<div class="l2-hud-legacy-bar-outer">' +
        '<div class="l2-hud-legacy-bar-inner" id="l2-hud-mp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-legacy-bar-lbl">MP</span>' +
        '<span class="l2-hud-legacy-bar-val"><span id="l2-hud-mp-cur">—</span>/<span id="l2-hud-mp-max">—</span></span>' +
        '</div></div>' +
        '<div class="l2-hud-legacy-bar l2-hud-legacy-bar--cp">' +
        '<div class="l2-hud-legacy-bar-outer">' +
        '<div class="l2-hud-legacy-bar-inner" id="l2-hud-cp-inner" style="width:0%"></div>' +
        '<span class="l2-hud-legacy-bar-lbl">CP</span>' +
        '<span class="l2-hud-legacy-bar-val"><span id="l2-hud-cp-cur">—</span>/<span id="l2-hud-cp-max">—</span></span>' +
        '</div></div>' +
        '<div class="l2-hud-legacy-bar l2-hud-legacy-bar--exp">' +
        '<div class="l2-hud-legacy-bar-outer">' +
        '<div class="l2-hud-legacy-bar-inner" id="l2-hud-exp-fill" style="width:0%"></div>' +
        '<span class="l2-hud-legacy-bar-val" id="l2-hud-exp-pct">0.00 %</span>' +
        '</div></div>' +
        '</div>'
      );
    },

    getHudNoticeMarkup: function () {
      return '<p class="l2-hud-notice" id="l2-hud-notice" hidden role="status"></p>';
    },

    getHudPanelMarkup: function () {
      if (global.L2.ensureNavMinimalChrome) {
        global.L2.ensureNavMinimalChrome();
      }
      return (
        '<header class="l2-hud-panel l2-hud-panel--legacy-minimal" aria-label="Персонаж">' +
        '<div class="l2-hud-legacy-title-inline">L2WAP</div>' +
        '<div class="l2-hud-legacy-body">' +
        '<div class="l2-hud-legacy-headline">' +
        '<span class="l2-hud-legacy-level" id="l2-hud-legacy-lvl">—</span>' +
        ' - ' +
        '<span class="l2-hud-legacy-name" id="l2-hud-legacy-name">—</span>' +
        '</div>' +
        global.L2.getHudWapBarsMarkup() +
        '</div>' +
        '</header>' +
        global.L2.getPartyHudSlotMarkup() +
        global.L2.getClanInviteHudMarkup() +
        global.L2.getHudNoticeMarkup() +
        global.L2.getPvpIncomingMarkup()
      );
    },

    getClanInviteHudMarkup: function () {
      return (
        '<div id="l2-clan-invite-hud" class="l2-clan-invite-hud" hidden role="region" aria-label="Запрошення в клан">' +
        '<p class="l2-clan-invite-hud__text" id="l2-clan-invite-hud-text"></p>' +
        '<p class="l2-clan-invite-hud__actions">' +
        '<button type="button" class="l2-clan-invite-hud__btn l2-clan-invite-hud__btn--accept" id="l2-clan-invite-accept">Прийняти</button> ' +
        '<button type="button" class="l2-clan-invite-hud__btn l2-clan-invite-hud__btn--decline" id="l2-clan-invite-decline">Відхилити</button>' +
        '</p></div>'
      );
    },

    getPvpIncomingMarkup: function () {
      return (
        '<div id="l2-pvp-incoming" class="l2-pvp-incoming" hidden>' +
        '<span class="l2-pvp-incoming__nick l2-pvp-nick--aggressor" id="l2-pvp-incoming-nick"></span> ' +
        '<button type="button" class="l2-pvp-incoming__attack" id="l2-pvp-incoming-attack">Атакувати</button>' +
        '</div>'
      );
    },

    applyHudNoticeFromSnapshot: function (c) {
      var el = document.getElementById('l2-hud-notice');
      if (!el) {
        var clanBox = document.getElementById('l2-clan-invite-hud');
        var hudPanel = document.querySelector('.l2-hud-panel');
        var anchor = clanBox || hudPanel;
        if (anchor && anchor.parentNode) {
          el = document.createElement('p');
          el.id = 'l2-hud-notice';
          el.className = 'l2-hud-notice';
          el.hidden = true;
          el.setAttribute('role', 'status');
          anchor.parentNode.insertBefore(el, anchor.nextSibling);
        }
      }
      if (!el) return;
      var notice =
        c && c.hudNoticeUk != null ? String(c.hudNoticeUk).trim() : '';
      if (notice) {
        el.hidden = false;
        el.textContent = notice;
        if (lastSnapshot && lastSnapshot.hudNoticeUk) {
          delete lastSnapshot.hudNoticeUk;
          global.L2.writeSessionSnapshotCache(
            SESSION_SNAPSHOT_CACHE_KEY,
            lastSnapshot
          );
        }
        return;
      }
      el.hidden = true;
      el.textContent = '';
    },

    clanInviteNoticeText: function (pending) {
      if (!pending) return '';
      var nick =
        pending.inviterName != null ? String(pending.inviterName).trim() : '—';
      var clan =
        pending.clanName != null ? String(pending.clanName).trim() : '—';
      if (!nick) nick = '—';
      if (!clan) clan = '—';
      return (
        'Гравець ' +
        nick +
        ' запрошує вас вступити до клану «' +
        clan +
        '».'
      );
    },

    renderClanInviteNotice: function (pending, textEl) {
      if (!textEl) return;
      textEl.textContent = '';
      if (!pending) return;
      var nick =
        pending.inviterName != null ? String(pending.inviterName).trim() : '—';
      var clan =
        pending.clanName != null ? String(pending.clanName).trim() : '—';
      if (!nick) nick = '—';
      if (!clan) clan = '—';

      function addSpan(className, txt) {
        var s = document.createElement('span');
        if (className) s.className = className;
        s.textContent = txt;
        textEl.appendChild(s);
      }

      addSpan('l2-clan-invite-hud__lead', 'Гравець ');
      addSpan('l2-clan-invite-hud__nick', nick);
      addSpan('l2-clan-invite-hud__lead', ' запрошує вас вступити до клану ');
      addSpan('l2-clan-invite-hud__clan', '«' + clan + '»');
      addSpan('l2-clan-invite-hud__lead', '.');
    },

    applyPendingClanInviteFromSnapshot: function (c) {
      var box = document.getElementById('l2-clan-invite-hud');
      if (!box) {
        var hudPanel = document.querySelector('.l2-hud-panel');
        var mount = document.getElementById('l2-hud-panel-mount');
        var anchor = hudPanel || mount;
        if (anchor && anchor.parentNode) {
          var wrap = document.createElement('div');
          wrap.innerHTML = global.L2.getClanInviteHudMarkup();
          var created = wrap.firstElementChild;
          if (created) {
            anchor.parentNode.insertBefore(created, anchor.nextSibling);
            box = created;
          }
        }
      }
      if (!box) return;

      var hudPanel = document.querySelector('.l2-hud-panel');
      if (box && hudPanel && hudPanel.parentNode) {
        if (hudPanel.contains(box)) {
          hudPanel.parentNode.insertBefore(box, hudPanel.nextSibling);
        } else if (
          box.parentNode === hudPanel.parentNode &&
          box.previousElementSibling !== hudPanel
        ) {
          hudPanel.insertAdjacentElement('afterend', box);
        }
      }

      var textEl = document.getElementById('l2-clan-invite-hud-text');
      var acceptEl = document.getElementById('l2-clan-invite-accept');
      var declineEl = document.getElementById('l2-clan-invite-decline');
      var pending = c && c.pendingClanInvite ? c.pendingClanInvite : null;

      if (!pending || !pending.inviteId) {
        box.hidden = true;
        if (textEl) textEl.textContent = '';
        return;
      }

      box.hidden = false;
      if (textEl && typeof global.L2.renderClanInviteNotice === 'function') {
        global.L2.renderClanInviteNotice(pending, textEl);
      }

      function wireBtn(el, action) {
        if (!el) return;
        el.onclick = function (ev) {
          ev.preventDefault();
          if (typeof global.L2.respondClanInvite === 'function') {
            global.L2.respondClanInvite(action);
          }
        };
      }
      wireBtn(acceptEl, 'accept');
      wireBtn(declineEl, 'decline');
    },

    respondClanInvite: async function (action) {
      if (clanInviteRespondInFlight) return;
      var snap = lastSnapshot || global.L2.lastSnapshot();
      var pending = snap && snap.pendingClanInvite ? snap.pendingClanInvite : null;
      if (!pending || !pending.inviteId) return;

      var token = null;
      try {
        token = localStorage.getItem('token');
      } catch (_eTok) {
        token = null;
      }
      if (!token) {
        window.location.href = '/';
        return;
      }

      clanInviteRespondInFlight = true;
      try {
        var url =
          action === 'accept'
            ? '/game/clans/invite/accept'
            : '/game/clans/invite/decline';
        var body = { inviteId: String(pending.inviteId) };
        if (action === 'accept') {
          if (!snap || snap.revision == null) {
            if (typeof global.L2.resyncCharacterWhenRequired === 'function') {
              snap = await global.L2.resyncCharacterWhenRequired();
            }
          }
          if (!snap || snap.revision == null) return;
          body.expectedRevision = snap.revision;
        }

        var r = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify(body),
        });

        if (r.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/';
          return;
        }

        if (r.status === 409 && action === 'accept') {
          if (typeof global.L2.resyncCharacterAfterConflict === 'function') {
            var conflictBody = {};
            try {
              conflictBody = await r.json();
            } catch (_e409) {
              conflictBody = {};
            }
            await global.L2.resyncCharacterAfterConflict(null, conflictBody);
          }
          return;
        }

        var j = null;
        try {
          j = await r.json();
        } catch (_eJson) {
          j = null;
        }

        if (action === 'accept' && j && j.character) {
          if (typeof global.L2.applyCharacterSnapshot === 'function') {
            global.L2.applyCharacterSnapshot(j.character);
          }
          return;
        }

        if (r.ok) {
          if (lastSnapshot) {
            delete lastSnapshot.pendingClanInvite;
            global.L2.writeSessionSnapshotCache(
              SESSION_SNAPSHOT_CACHE_KEY,
              lastSnapshot
            );
          }
          global.L2.applyPendingClanInviteFromSnapshot(lastSnapshot);
          return;
        }

        if (j && j.messageUk && typeof alert === 'function') {
          alert(String(j.messageUk));
        }
      } catch (_eNet) {
        if (typeof alert === 'function') {
          alert('Збій мережі або сервера.');
        }
      } finally {
        clanInviteRespondInFlight = false;
      }
    },

    applyPvpIncoming: function (incoming, onAttack) {
      var box = document.getElementById('l2-pvp-incoming');
      if (!box) return;
      var nickEl = document.getElementById('l2-pvp-incoming-nick');
      var atkEl = document.getElementById('l2-pvp-incoming-attack');
      if (!incoming || !incoming.attackerCharacterId) {
        box.hidden = true;
        return;
      }
      box.hidden = false;
      if (nickEl) {
        nickEl.textContent = incoming.attackerName || '—';
      }
      if (atkEl) {
        atkEl.onclick = function (ev) {
          ev.preventDefault();
          if (typeof onAttack === 'function') {
            onAttack(incoming.attackerCharacterId);
          }
        };
      }
    },

    /** Одразу після mount HUD — snapshot з sessionStorage (нік, lvl, бари). */
    hydrateCharacterFromSessionCache: function () {
      var snap = global.L2.readSessionSnapshotCache(SESSION_SNAPSHOT_CACHE_KEY);
      if (!snap) return null;
      lastSnapshot = snap;
      if (typeof global.L2.applyHudFromSnapshot === 'function') {
        global.L2.applyHudFromSnapshot(snap);
      }
      if (typeof document !== 'undefined') {
        try {
          document.dispatchEvent(
            new CustomEvent('l2:character-hydrated', {
              detail: { character: snap },
            })
          );
        } catch (eHydrate) {
          /* ignore */
        }
      }
      return snap;
    },

    /** @deprecated alias */
    hydrateHudFromSessionCache: function () {
      return global.L2.hydrateCharacterFromSessionCache();
    },

    getSessionSnapshotOrNull: function () {
      if (lastSnapshot) return lastSnapshot;
      return global.L2.readSessionSnapshotCache(SESSION_SNAPSHOT_CACHE_KEY);
    },

    fmtAdenaUi: function (adenaRaw) {
      if (adenaRaw == null || adenaRaw === '') return '—';
      try {
        return BigInt(String(adenaRaw))
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f');
      } catch (eFmt) {
        return String(adenaRaw);
      }
    },

    renderShopAdenaMeta: function (el, snap) {
      if (!el || !snap) return;
      el.innerHTML =
        '<span class="l2-gm-shop-adena">Адена: <strong class="l2-gm-shop-adena__amount">' +
        global.L2.fmtAdenaUi(snap.adena) +
        '</strong></span>';
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
      var node = tpl.content.querySelector('.l2-hud-panel');
      var clanInvite = tpl.content.getElementById('l2-clan-invite-hud');
      var hudNotice = tpl.content.getElementById('l2-hud-notice');
      var incoming = tpl.content.getElementById('l2-pvp-incoming');
      if (!node || !node.classList.contains('l2-hud-panel')) return;
      function mountAfterHeader(header) {
        var after = header;
        if (clanInvite && !document.getElementById('l2-clan-invite-hud')) {
          after.insertAdjacentElement('afterend', clanInvite);
          after = clanInvite;
        }
        if (hudNotice && !document.getElementById('l2-hud-notice')) {
          after.insertAdjacentElement('afterend', hudNotice);
          after = hudNotice;
        }
        if (incoming && !document.getElementById('l2-pvp-incoming')) {
          after.insertAdjacentElement('afterend', incoming);
        }
      }
      if (m) {
        m.replaceWith(node);
        mountAfterHeader(node);
        return;
      }
      if (existing) {
        var hasLegacy = existing.classList.contains('l2-hud-panel--legacy-minimal');
        if (!hasLegacy) {
          existing.replaceWith(node);
          mountAfterHeader(node);
        } else {
          mountAfterHeader(existing);
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

  var CHAT_REPLY_NOTIFY_VER = '20260717chatSnap1';
  var PARTY_HUD_VER = '20260719partyHudPollOpt1';
  var ONLINE_FOOT_ASSET_VER = '20260717perf2';
  var GAME_HELPER_ASSET_VER = '20260717perf2';

  function bootstrapChatReplyNotify() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return;
    if (document.body.classList.contains('l2-page-battle')) return;
    if (document.body.classList.contains('l2-page-chat')) return;

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

  function bootstrapPartyHud() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return;
    if (!localStorage.getItem('token')) return;

    function runPartyHudMount() {
      if (global.L2PartyHud && typeof global.L2PartyHud.mount === 'function') {
        global.L2PartyHud.mount();
      }
    }

    if (global.L2PartyHud && global.L2PartyHud.ASSET_VER === PARTY_HUD_VER) {
      runPartyHudMount();
      return;
    }

    if (document.getElementById('l2-party-hud-js')) {
      return;
    }

    var scriptParty = document.createElement('script');
    scriptParty.id = 'l2-party-hud-js';
    scriptParty.src = '/l2-party-hud.js?v=' + PARTY_HUD_VER;
    scriptParty.onload = runPartyHudMount;
    (document.head || document.documentElement).appendChild(scriptParty);
  }

  if (global.L2) {
    global.L2.seedPartyHudEarly = bootstrapPartyHud;
    global.L2.refreshPartyHud = function () {
      if (global.L2PartyHud && typeof global.L2PartyHud.refresh === 'function') {
        global.L2PartyHud.refresh();
      }
    };
  }

  function shouldBootstrapGameHelper() {
    if (typeof document === 'undefined' || !document.body) return false;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return false;
    if (document.body.classList.contains('l2-page-auth')) return false;
    if (document.body.classList.contains('l2-page-battle')) return false;
    if (!getHudPanelForHelperBootstrap()) return false;
    try {
      var step = localStorage.getItem('l2-helper-step');
      if (step === 'learn') step = 'learn5';
      if (step) return true;
      if (localStorage.getItem('l2-helper-buffer-tip') === '1') return true;
    } catch (e) {
      /* ignore */
    }
    return false;
  }

  function bootstrapGameHelper() {
    if (!shouldBootstrapGameHelper()) return;

    if (!document.getElementById('l2-game-helper-css')) {
      var cssHelper = document.createElement('link');
      cssHelper.id = 'l2-game-helper-css';
      cssHelper.rel = 'stylesheet';
      cssHelper.href = '/css/l2-game-helper.css?v=' + GAME_HELPER_ASSET_VER;
      (document.head || document.documentElement).appendChild(cssHelper);
    }

    function runHelperMount() {
      if (global.L2 && typeof global.L2.mountGameHelper === 'function') {
        global.L2.mountGameHelper();
      }
    }

    if (typeof global.L2.mountGameHelper === 'function') {
      runHelperMount();
      return;
    }

    if (document.getElementById('l2-game-helper-js')) {
      return;
    }

    var scriptHelper = document.createElement('script');
    scriptHelper.id = 'l2-game-helper-js';
    scriptHelper.src = '/l2-game-helper.js?v=' + GAME_HELPER_ASSET_VER;
    scriptHelper.onload = runHelperMount;
    (document.head || document.documentElement).appendChild(scriptHelper);
  }

  function getHudPanelForHelperBootstrap() {
    return !!(
      document.getElementById('l2-hud-panel-mount') ||
      document.querySelector('.l2-hud-panel')
    );
  }

  function bootstrapOnlineFoot() {
    if (typeof document === 'undefined' || !document.body) return;
    if (!document.body.classList.contains('l2-app-l2-chrome')) return;
    if (document.body.classList.contains('l2-page-online')) return;
    if (document.body.classList.contains('l2-page-battle')) return;

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

  if (typeof document !== 'undefined' && document.body && global.L2 && typeof global.L2.bootstrapChromeShellEarly === 'function') {
    global.L2.bootstrapChromeShellEarly();
  }

  if (typeof document !== 'undefined') {
    function runHudMount() {
      if (global.L2 && typeof global.L2.bootstrapChromeShellEarly === 'function') {
        global.L2.bootstrapChromeShellEarly();
      }
      loadItemIconHintsFromSession();
      hydrateCatalogHintsFromLocalStorage();
      bootstrapChatReplyNotify();
      function runDeferredChromeBootstraps() {
        bootstrapGameHelper();
        bootstrapOnlineFoot();
      }
      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(runDeferredChromeBootstraps, { timeout: 2200 });
      } else {
        setTimeout(runDeferredChromeBootstraps, 1200);
      }
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
