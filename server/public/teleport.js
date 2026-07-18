/**
 * Сторінка телепорту: miru-список «Города», POST /game/teleport.
 */
(function () {
  var teleportInFlight = false;
  var TELEPORT_SNAPSHOT_CACHE_KEY = 'l2-teleport-snapshot-cache-v1';
  var TP_ICON = '/assets/assets/photo_2026-07-05_12-52-33.jpg';
  var TP_SURROUNDINGS_ICON = '/assets/assets/photo_2026-07-05_12-53-23.jpg';
  var TELEPORT_DEFAULT_ADENA_COST = 1;
  var TELEPORT_FREE_MAX_LEVEL = 40;
  var activeSurroundingsKey = null;
  var availableTeleportIds = null;
  var teleportCostById = null;
  var teleportMobRangeById = null;
  var citiesListRendered = false;
  var layoutDebug = false;
  var TP_SKELETON_ROWS = 6;

  /** Фіксований порядок міст; окремі блоки «Окресности» — через surroundingsKey. */
  var TELEPORT_CITIES = [
    { label: 'Talking Island Village', teleportId: 'talking_island', surroundingsKey: 'talking_island' },
    { label: 'Elven Village', teleportId: 'elf_village', surroundingsKey: 'elf_village' },
    { label: 'Dark Elven Village', teleportId: 'dark_elf_village', surroundingsKey: 'dark_elf_village' },
    { label: 'Orc Village', teleportId: 'orc_village', surroundingsKey: 'orc_village' },
    { label: 'Dwarven Village', teleportId: 'dwarf_village', surroundingsKey: 'dwarf_village' },
    { label: 'Gludin Village', teleportId: 'gludin', surroundingsKey: 'gludin' },
    { label: 'Town of Gludio', teleportId: 'gludio', surroundingsKey: 'gludio' },
    { label: 'Town of Dion', teleportId: 'dion', surroundingsKey: 'dion' },
    { label: 'Giran Castle Town', teleportId: 'giran', surroundingsKey: 'giran' },
    { label: 'Town of Oren', teleportId: 'oren', surroundingsKey: 'oren' },
    { label: 'Town of Aden', teleportId: 'aden', surroundingsKey: 'aden' },
    { label: 'Town of Goddard', teleportId: 'goddard', surroundingsKey: 'goddard' },
    { label: 'Rune Township', teleportId: 'rune', surroundingsKey: 'rune' },
    { label: 'Town of Schuttgart', teleportId: 'schuttgart', surroundingsKey: 'schuttgart' },
    { label: 'Heine', teleportId: 'heine', surroundingsKey: 'heine' },
    { label: 'Hunters Village', teleportId: 'hunters', surroundingsKey: 'hunters' },
  ];

  var TELEPORT_SURROUNDINGS = {
    talking_island: [
      { label: 'Elven Ruins', teleportId: 'elven_ruins' },
      { label: 'Talking Island Harbor', teleportId: 'talking_island_harbor' },
      { label: "Cedric's Training Hall", teleportId: 'cedrics_training_hall' },
    ],
    elf_village: [
      { label: 'Elven Forest', teleportId: 'elven_forest' },
      { label: 'Neutral Zone', teleportId: 'neutral_zone' },
      { label: 'Elven Fortress', teleportId: 'elven_fortress' },
    ],
    dark_elf_village: [
      { label: 'Dark Elven Forest', teleportId: 'dark_elven_forest' },
      { label: 'Swampland', teleportId: 'swampland' },
      { label: 'Spider Nest', teleportId: 'spider_nest' },
      { label: 'Neutral Zone', teleportId: 'neutral_zone' },
      { label: 'School of Dark Arts', teleportId: 'school_of_dark_arts' },
    ],
    orc_village: [
      { label: 'Immortal Plateau, Southern Region', teleportId: 'immortal_plateau_southern' },
      { label: 'The Immortal Plateau', teleportId: 'immortal_plateau' },
      { label: 'Cave of Trials', teleportId: 'cave_of_trials' },
      { label: 'Frozen Waterfall', teleportId: 'frozen_waterfall' },
    ],
    dwarf_village: [
      { label: 'Mithril Mines', teleportId: 'mithril_mines' },
      { label: 'Abandoned Coal Mines', teleportId: 'abandoned_coal_mines' },
      { label: 'Eastern Mining Zone', teleportId: 'eastern_mining_zone' },
    ],
    gludin: [
      { label: 'Langk Lizardman Dwelling', teleportId: 'langk_lizardman_dwelling' },
      { label: 'Windmill Hill', teleportId: 'windmill_hill' },
      { label: 'Fellmere Hunting Grounds', teleportId: 'fellmere_hunting_grounds' },
      { label: 'Forgotten Temple', teleportId: 'forgotten_temple' },
      { label: 'Orc Barracks', teleportId: 'orc_barracks' },
      { label: 'Windy Hill', teleportId: 'windy_hill' },
      { label: 'Abandon Camp', teleportId: 'abandoned_camp' },
      { label: 'Wastelands', teleportId: 'wastelands' },
    ],
    gludio: [
      { label: 'Ruins of Agony', teleportId: 'ruins_of_agony' },
      { label: 'Ruins of Despair', teleportId: 'ruins_of_despair' },
      { label: 'The Ant Nest', teleportId: 'ant_nest' },
      { label: 'Windawood Manor', teleportId: 'windawood_manor' },
    ],
    dion: [
      { label: 'Cruma Marshlands', teleportId: 'cruma_marshlands' },
      { label: 'Cruma Tower', teleportId: 'cruma_tower' },
      { label: 'Fortress of Resistance', teleportId: 'fortress_of_resistance' },
      { label: 'Plains of Dion', teleportId: 'plains_of_dion' },
      { label: 'Bee Hive', teleportId: 'bee_hive' },
      { label: 'Tanor Canyon', teleportId: 'tanor_canyon' },
    ],
    giran: [
      { label: 'Giran Harbor', teleportId: 'giran_harbor' },
      { label: 'Dragon Valley', teleportId: 'dragon_valley' },
      { label: "Antharas' Lair", teleportId: 'antharas_lair' },
      { label: "Devil's Isle", teleportId: 'devils_isle' },
      { label: "Breka's Stronghold", teleportId: 'brekas_stronghold' },
    ],
    oren: [
      { label: 'Ivory Tower', teleportId: 'ivory_tower' },
      { label: 'Skyshadow Meadow', teleportId: 'skyshadow_meadow' },
      { label: 'Plains of the Lizardman', teleportId: 'plains_of_the_lizardman' },
      { label: 'Outlaw Forest', teleportId: 'outlaw_forest' },
      { label: 'Sea of Spores', teleportId: 'sea_of_spores' },
    ],
    aden: [
      { label: 'Coliseum', teleportId: 'coliseum' },
      { label: 'Forsaken Plains', teleportId: 'forsaken_plains' },
      { label: 'Forest of Mirrors', teleportId: 'forest_of_mirrors' },
      { label: 'Blazing Swamp', teleportId: 'blazing_swamp' },
      { label: 'Fields of Massacre', teleportId: 'fields_of_massacre' },
      { label: 'Ancient Battleground', teleportId: 'ancient_battleground' },
      { label: 'Silent Valley', teleportId: 'silent_valley' },
      { label: 'Tower of Insolence', teleportId: 'tower_of_insolence' },
    ],
    goddard: [
      { label: 'Varka Silenos Stronghold', teleportId: 'varka_silenos_stronghold' },
      { label: 'Ketra Orc Outpost', teleportId: 'ketra_orc_outpost' },
      { label: 'Hot Springs', teleportId: 'hot_springs' },
      { label: 'Wall of Argos', teleportId: 'wall_of_argos' },
      { label: 'Monastery of Silence', teleportId: 'monastery_of_silence' },
    ],
    rune: [
      { label: 'Wild Beast Pastures', teleportId: 'wild_beast_pastures' },
      { label: 'Valley of Saints', teleportId: 'valley_of_saints' },
      { label: 'Forest of the Dead', teleportId: 'forest_of_the_dead' },
      { label: 'Swamp of Screams', teleportId: 'swamp_of_screams' },
      { label: 'Monastery of Silence', teleportId: 'monastery_of_silence' },
    ],
    schuttgart: [
      { label: 'Den of Evil', teleportId: 'den_of_evil' },
      { label: 'Plunderous Plains', teleportId: 'plunderous_plains' },
      { label: 'Frozen Labyrinth', teleportId: 'frozen_labyrinth' },
      { label: 'Crypts of Disgrace', teleportId: 'crypts_of_disgrace' },
      { label: 'Pavel Ruins', teleportId: 'pavel_ruins' },
    ],
    heine: [
      { label: 'Field of Silence', teleportId: 'field_of_silence' },
      { label: 'Field of Whispers', teleportId: 'field_of_whispers' },
      { label: 'Alligator Island', teleportId: 'alligator_island' },
      { label: 'Garden of Eva', teleportId: 'garden_of_eva' },
    ],
    hunters: [
      { label: 'Enchanted Valley - Southern Region', teleportId: 'enchanted_valley_south' },
      { label: 'Enchanted Valley - Northern Region', teleportId: 'enchanted_valley_north' },
      { label: 'Forest of Mirrors', teleportId: 'forest_of_mirrors' },
    ],
  };

  function $(id) {
    return document.getElementById(id);
  }

  function isLayoutDebugEnabled() {
    try {
      return (
        /(?:^|[?&])layoutDebug=1(?:&|$)/.test(String(location.search || '')) ||
        localStorage.getItem('l2-layout-debug') === '1'
      );
    } catch (_e) {
      return false;
    }
  }

  function logLayoutPhase(phase) {
    if (!layoutDebug) return;
    var contentEl = $('tp-content');
    var hudMount = $('l2-hud-panel-mount');
    var navMount = $('l2-nav-bottom');
    var listEl = $('tp-cities-list');
    console.log('[page-layout-phase]', {
      page: 'teleport',
      phase: phase,
      scrollY: window.scrollY,
      contentHeight: contentEl ? contentEl.getBoundingClientRect().height : null,
      listHeight: listEl ? listEl.getBoundingClientRect().height : null,
      hudHeight: hudMount ? hudMount.getBoundingClientRect().height : null,
      navHeight: navMount ? navMount.getBoundingClientRect().height : null,
    });
  }

  function installLayoutShiftObserver() {
    if (!layoutDebug || typeof PerformanceObserver === 'undefined') return;
    try {
      new PerformanceObserver(function (list) {
        for (var i = 0; i < list.getEntries().length; i++) {
          var entry = list.getEntries()[i];
          if (!entry.hadRecentInput && entry.value > 0) {
            console.log('[layout-shift]', {
              page: 'teleport',
              value: entry.value,
              sources: entry.sources
                ? entry.sources.map(function (s) {
                    return {
                      node: s.node,
                      previousRect: s.previousRect,
                      currentRect: s.currentRect,
                    };
                  })
                : [],
            });
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    } catch (_e) {
      /* ignore */
    }
  }

  function replaceListContent(listEl, frag) {
    listEl.innerHTML = '';
    listEl.appendChild(frag);
  }

  function readCachedTeleportSnapshot() {
    try {
      var raw = sessionStorage.getItem(TELEPORT_SNAPSHOT_CACHE_KEY);
      if (!raw) return null;
      var j = JSON.parse(raw);
      return j && typeof j === 'object' ? j : null;
    } catch (_e) {
      return null;
    }
  }

  function writeCachedTeleportSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    try {
      sessionStorage.setItem(TELEPORT_SNAPSHOT_CACHE_KEY, JSON.stringify(snapshot));
    } catch (_e) {
      /* ignore */
    }
  }

  function cityNameFromSnapshot(c) {
    if (!c) return '—';
    return window.L2 && typeof L2.cityDisplayName === 'function'
      ? L2.cityDisplayName(c.cityId)
      : String(c.cityId || '—');
  }

  function applyCurrentLocation(c) {
    var name = cityNameFromSnapshot(c);
    var current = $('tp-current-city');
    if (current) current.textContent = name;
  }

  function wireMiruIcons(root) {
    if (!root) return;
    root.querySelectorAll('.l2-town-miru-ico').forEach(function (icon) {
      if (icon.dataset.fallbackWired === '1') return;
      icon.dataset.fallbackWired = '1';
      icon.addEventListener('error', function onIconError() {
        icon.removeEventListener('error', onIconError);
        icon.src = '/icons/drops/other.svg';
      });
    });
  }

  function resolveRowAdenaCost(row) {
    if (!row || !row.teleportId) return TELEPORT_DEFAULT_ADENA_COST;
    if (row.adenaCost != null) {
      var rowCost = Number(row.adenaCost);
      if (Number.isFinite(rowCost) && rowCost >= 0) return Math.floor(rowCost);
    }
    if (teleportCostById && teleportCostById[row.teleportId] != null) {
      var apiCost = Number(teleportCostById[row.teleportId]);
      if (Number.isFinite(apiCost) && apiCost >= 0) return Math.floor(apiCost);
    }
    return TELEPORT_DEFAULT_ADENA_COST;
  }

  function formatAdenaAmount(amount) {
    var n = Math.floor(Number(amount) || 0);
    if (n < 0) n = 0;
    var raw = String(n);
    if (raw.length < 4) return raw;
    return raw.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  function resolveRowMobLevelRange(row) {
    if (!row || !row.teleportId) return null;
    if (row.mobLevelMin != null && row.mobLevelMax != null) {
      var minRow = Math.floor(Number(row.mobLevelMin));
      var maxRow = Math.floor(Number(row.mobLevelMax));
      if (Number.isFinite(minRow) && Number.isFinite(maxRow) && minRow >= 1 && maxRow >= minRow) {
        return { min: minRow, max: maxRow };
      }
    }
    if (teleportMobRangeById && teleportMobRangeById[row.teleportId]) {
      return teleportMobRangeById[row.teleportId];
    }
    return null;
  }

  function createPriceMeta(row, showMobRange) {
    var meta = document.createElement('span');
    meta.className = 'l2-teleport-miru-price-meta';

    var adenaPart = document.createElement('span');
    adenaPart.className = 'l2-teleport-miru-price-adena';
    adenaPart.textContent =
      '(' + formatAdenaAmount(resolveRowAdenaCost(row)) + ' аден';
    meta.appendChild(adenaPart);

    if (showMobRange) {
      var mobRange = resolveRowMobLevelRange(row);
      if (mobRange) {
        var sep = document.createElement('span');
        sep.className = 'l2-teleport-miru-price-adena';
        sep.textContent = ' ';
        meta.appendChild(sep);

        var mobPart = document.createElement('span');
        mobPart.className = 'l2-teleport-miru-mob-level';
        mobPart.textContent = mobRange.min + '-' + mobRange.max;
        meta.appendChild(mobPart);
      }
    }

    var closeParen = document.createElement('span');
    closeParen.className = 'l2-teleport-miru-price-adena';
    closeParen.textContent = ')';
    meta.appendChild(closeParen);
    return meta;
  }

  function getSnapshotLevel() {
    if (!window.L2 || typeof L2.lastSnapshot !== 'function') return 1;
    var snap = L2.lastSnapshot();
    var lv = snap && snap.level != null ? Number(snap.level) : 1;
    return Number.isFinite(lv) && lv >= 1 ? Math.floor(lv) : 1;
  }

  function isTeleportFreeForPlayer() {
    return getSnapshotLevel() <= TELEPORT_FREE_MAX_LEVEL;
  }

  function createTeleportPay(row, disabled) {
    var pay = document.createElement('div');
    pay.className = 'l2-teleport-miru-tp-pay';
    var isFree = isTeleportFreeForPlayer();

    var tpBtn = document.createElement('button');
    tpBtn.type = 'button';
    tpBtn.className = 'l2-teleport-miru-tp-btn';
    if (isFree) {
      tpBtn.classList.add('l2-teleport-miru-tp-btn--free');
      tpBtn.textContent = 'Безплатно';
    } else {
      tpBtn.textContent = 'Телепорт';
    }
    if (row.teleportId) {
      tpBtn.setAttribute('data-teleport-id', row.teleportId);
    }
    if (disabled || !isTeleportIdAvailable(row.teleportId)) {
      tpBtn.disabled = true;
    }

    pay.appendChild(tpBtn);
    return pay;
  }

  function createSurroundingsRow(row, disabled) {
    var wrap = document.createElement('div');
    wrap.className = 'l2-teleport-miru-surroundings-row';

    var label = document.createElement('div');
    label.className = 'l2-teleport-miru-surroundings-label';

    var img = document.createElement('img');
    img.className = 'l2-town-miru-ico';
    img.src = TP_SURROUNDINGS_ICON;
    img.alt = '';
    img.width = 14;
    img.height = 14;
    img.decoding = 'async';

    var span = document.createElement('span');
    span.textContent = row.label || '—';

    label.appendChild(img);
    label.appendChild(span);
    var priceMeta = createPriceMeta(row, true);
    if (priceMeta) label.appendChild(priceMeta);

    wrap.appendChild(label);
    wrap.appendChild(createTeleportPay(row, disabled));
    return wrap;
  }

  function isTeleportIdAvailable(teleportId) {
    if (!teleportId) return false;
    if (!availableTeleportIds) return true;
    return !!availableTeleportIds[teleportId];
  }

  function createCityRow(row, disabled) {
    var wrap = document.createElement('div');
    wrap.className = 'l2-teleport-miru-city-row';

    var cityBtn = document.createElement('button');
    cityBtn.type = 'button';
    cityBtn.className = 'l2-town-miru-item l2-teleport-miru-city-btn';
    if (row.surroundingsKey) {
      cityBtn.setAttribute('data-surroundings-key', row.surroundingsKey);
    }
    if (disabled) cityBtn.disabled = true;

    var img = document.createElement('img');
    img.className = 'l2-town-miru-ico';
    img.src = TP_ICON;
    img.alt = '';
    img.width = 14;
    img.height = 14;
    img.decoding = 'async';

    var span = document.createElement('span');
    span.className = 'l2-teleport-miru-city-label';
    span.textContent = row.label || '—';

    cityBtn.appendChild(img);
    cityBtn.appendChild(span);
    var priceMeta = createPriceMeta(row, false);
    if (priceMeta) cityBtn.appendChild(priceMeta);

    wrap.appendChild(cityBtn);
    wrap.appendChild(createTeleportPay(row, disabled));
    return wrap;
  }

  function createInlineSurroundingsPanel() {
    var panel = document.createElement('div');
    panel.className = 'l2-teleport-miru-surroundings l2-teleport-miru-surroundings--inline';
    panel.hidden = true;

    var head = document.createElement('h2');
    head.className = 'l2-teleport-miru-surroundings-head';

    var headIco = document.createElement('img');
    headIco.className = 'l2-teleport-miru-surroundings-head-ico';
    headIco.src = TP_SURROUNDINGS_ICON;
    headIco.alt = '';
    headIco.width = 14;
    headIco.height = 14;
    headIco.decoding = 'async';

    var headLbl = document.createElement('span');
    headLbl.textContent = 'Окресности:';

    head.appendChild(headIco);
    head.appendChild(headLbl);

    var surroundList = document.createElement('nav');
    surroundList.className = 'l2-town-miru-list l2-teleport-miru-surroundings-list';
    surroundList.setAttribute('aria-label', 'Окресности');

    panel.appendChild(head);
    panel.appendChild(surroundList);
    return panel;
  }

  function createCityBlock(row, disabled) {
    var block = document.createElement('div');
    block.className = 'l2-teleport-miru-city-block';
    if (row.surroundingsKey) {
      block.setAttribute('data-surroundings-key', row.surroundingsKey);
    }
    block.appendChild(createCityRow(row, disabled));
    if (row.surroundingsKey) {
      block.appendChild(createInlineSurroundingsPanel());
    }
    return block;
  }

  function renderSkeletonList(listEl) {
    if (!listEl) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TP_SKELETON_ROWS; i++) {
      var block = createCityBlock({ label: '…' }, true);
      block.classList.add('l2-teleport-miru-city-block--skeleton');
      block.setAttribute('aria-hidden', 'true');
      frag.appendChild(block);
    }
    replaceListContent(listEl, frag);
    wireMiruIcons(listEl);
  }

  function renderListError(listEl, message) {
    if (!listEl) return;
    var err = document.createElement('p');
    err.className = 'l2-teleport-miru-list__error';
    err.textContent = message || 'Не вдалося завантажити точки телепорту.';
    var frag = document.createDocumentFragment();
    frag.appendChild(err);
    replaceListContent(listEl, frag);
  }

  function renderCityList(listEl) {
    if (!listEl) return;
    hideSurroundings(listEl);
    var frag = document.createDocumentFragment();
    for (var i = 0; i < TELEPORT_CITIES.length; i++) {
      var row = TELEPORT_CITIES[i];
      var item = createCityBlock(row, false);
      if (i === TELEPORT_CITIES.length - 1) {
        item.classList.add('l2-teleport-miru-city-block--last');
      }
      frag.appendChild(item);
    }
    replaceListContent(listEl, frag);
    wireMiruIcons(listEl);
    citiesListRendered = true;
  }

  function clearSurroundingsActive(listEl) {
    if (!listEl) return;
    listEl.querySelectorAll('.l2-teleport-miru-city-btn--surroundings-active').forEach(function (el) {
      el.classList.remove('l2-teleport-miru-city-btn--surroundings-active');
    });
  }

  function hideSurroundings(listEl) {
    activeSurroundingsKey = null;
    clearSurroundingsActive(listEl);
    if (!listEl) return;
    listEl.querySelectorAll('.l2-teleport-miru-surroundings--inline').forEach(function (panel) {
      panel.hidden = true;
    });
    listEl.querySelectorAll('.l2-teleport-miru-surroundings-list').forEach(function (surroundList) {
      surroundList.innerHTML = '';
    });
  }

  function findCityBlock(listEl, key) {
    if (!listEl || !key) return null;
    return listEl.querySelector('.l2-teleport-miru-city-block[data-surroundings-key="' + key + '"]');
  }

  function filterAvailableSurroundRows(rows) {
    if (!rows || !rows.length) return [];
    if (!availableTeleportIds) return rows;
    return rows.filter(function (row) {
      return row.teleportId && availableTeleportIds[row.teleportId];
    });
  }

  function renderSurroundingsList(key, listEl) {
    var rows = filterAvailableSurroundRows(TELEPORT_SURROUNDINGS[key]);
    var block = findCityBlock(listEl, key);
    if (!block) return false;
    var panel = block.querySelector('.l2-teleport-miru-surroundings--inline');
    var surroundList = block.querySelector('.l2-teleport-miru-surroundings-list');
    if (!panel || !surroundList) return false;

    surroundList.innerHTML = '';
    if (!rows.length) {
      panel.hidden = true;
      return false;
    }

    for (var i = 0; i < rows.length; i++) {
      var item = createSurroundingsRow(rows[i], false);
      if (i === rows.length - 1) {
        item.classList.add('l2-teleport-miru-surroundings-row--last');
      }
      surroundList.appendChild(item);
    }

    wireMiruIcons(surroundList);
    panel.hidden = false;
    return true;
  }

  async function loadAvailableTeleportIds(token) {
    try {
      var r = await fetch('/game/teleport/locations', {
        headers: { Authorization: 'Bearer ' + token },
      });
      if (!r.ok) return false;
      var j = await r.json();
      var map = {};
      var costs = {};
      var mobRanges = {};
      var locations = j && j.locations ? j.locations : [];
      for (var i = 0; i < locations.length; i++) {
        var id = locations[i].teleportId;
        if (id) {
          map[id] = true;
          if (locations[i].adenaCost != null) {
            costs[id] = locations[i].adenaCost;
          }
          if (locations[i].mobLevelMin != null && locations[i].mobLevelMax != null) {
            mobRanges[id] = {
              min: locations[i].mobLevelMin,
              max: locations[i].mobLevelMax,
            };
          }
        }
      }
      availableTeleportIds = map;
      teleportCostById = costs;
      teleportMobRangeById = mobRanges;
      return true;
    } catch (_e) {
      return false;
    }
  }

  function toggleSurroundings(key, listEl, tpOk) {
    if (!listEl) return;
    if (tpOk) {
      tpOk.hidden = true;
      tpOk.textContent = '';
    }
    if (activeSurroundingsKey === key) {
      hideSurroundings(listEl);
      return;
    }
    hideSurroundings(listEl);
    activeSurroundingsKey = key;
    var trigger = listEl.querySelector(
      '.l2-teleport-miru-city-btn[data-surroundings-key="' + key + '"]'
    );
    if (trigger) trigger.classList.add('l2-teleport-miru-city-btn--surroundings-active');
    if (!renderSurroundingsList(key, listEl)) {
      activeSurroundingsKey = null;
      clearSurroundingsActive(listEl);
      if (tpOk) {
        tpOk.hidden = false;
        tpOk.textContent = 'Немає доступних точок телепорту для цього розділу.';
      }
    }
  }

  async function resyncCharacter(errEl) {
    if (!window.L2) return null;
    try {
      var c =
        typeof L2.fetchSnapshot === 'function'
          ? await L2.fetchSnapshot({ force: true })
          : null;
      if (!c) return null;
      if (typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(c);
      }
      applyCurrentLocation(c);
      writeCachedTeleportSnapshot(c);
      return c;
    } catch (_e) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося синхронізувати персонажа.';
      }
      return null;
    }
  }

  async function doTeleport(teleportId, errEl, okEl) {
    if (teleportInFlight) return;
    var t = localStorage.getItem('token');
    if (!t || !window.L2 || typeof L2.lastSnapshot !== 'function') return;
    var snap = L2.lastSnapshot();
    if (!snap || snap.revision == null) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Немає даних персонажа — онови сторінку.';
      }
      return;
    }
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (okEl) {
      okEl.hidden = true;
      okEl.textContent = '';
    }
    teleportInFlight = true;
    try {
      async function callTeleportWithRevision(revision) {
        return fetch('/game/teleport', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + t,
          },
          body: JSON.stringify({
            teleportId: teleportId,
            expectedRevision: revision,
          }),
        });
      }

      var r = await callTeleportWithRevision(snap.revision);
      if (r.status === 409) {
        var synced = await resyncCharacter(errEl);
        if (!synced || synced.revision == null) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = 'Дані оновлено. Спробуй телепорт ще раз.';
          }
          return;
        }
        r = await callTeleportWithRevision(synced.revision);
      }

      if (r.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/';
        return;
      }
      if (r.status === 409) {
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = 'Не вдалося виконати телепорт через конфлікт стану. Спробуй ще раз.';
        }
        return;
      }
      if (!r.ok) {
        var msg = 'Не вдалося телепортуватися.';
        try {
          var ej = await r.json();
          if (ej && ej.messageUk) msg = ej.messageUk;
        } catch (e) {
          /* ignore */
        }
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = msg;
        }
        return;
      }

      var out = await r.json();
      if (out.character && typeof L2.applyMutationSnapshot === 'function') {
        L2.applyMutationSnapshot(out.character);
      }
      window.location.href = '/map.html';
    } finally {
      teleportInFlight = false;
    }
  }

  function showStub(label, okEl) {
    if (!okEl) return;
    okEl.hidden = false;
    okEl.textContent = '«' + label + '» — скоро з’явиться.';
  }

  async function init() {
    layoutDebug = isLayoutDebugEnabled();
    installLayoutShiftObserver();
    logLayoutPhase('html-ready');

    if (window.L2 && typeof L2.mountL2Nav === 'function') {
      L2.mountL2Nav({
        onStub: function (label) {
          showStub(label, $('tp-ok'));
        },
      });
    }
    logLayoutPhase('chrome-mounted');

    var errEl = $('tp-load-err');
    var listEl = $('tp-cities-list');
    var tpErr = $('tp-err');
    var tpOk = $('tp-ok');

    var t = localStorage.getItem('token');
    if (!t) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Потрібен вхід. Перейди на головну.';
      }
      if (window.L2 && typeof L2.clearHudPanel === 'function') L2.clearHudPanel();
      return;
    }

    if (window.L2 && typeof L2.renderCharacterFromCache === 'function') {
      L2.renderCharacterFromCache();
    }
    logLayoutPhase('cache-rendered');

    var cached =
      window.L2 && typeof L2.getCachedCharacter === 'function'
        ? L2.getCachedCharacter()
        : window.L2 && typeof L2.lastSnapshot === 'function'
          ? L2.lastSnapshot()
          : null;
    if (!cached) cached = readCachedTeleportSnapshot();
    if (cached) {
      if (window.L2 && typeof L2.setLastSnapshot === 'function') {
        L2.setLastSnapshot(cached);
      }
      if (window.L2 && typeof L2.applyHudFromSnapshot === 'function') {
        L2.applyHudFromSnapshot(cached);
      }
      applyCurrentLocation(cached);
    }

    if (!citiesListRendered) {
      renderSkeletonList(listEl);
    }
    logLayoutPhase('skeleton-rendered');

    var resyncPromise =
      window.L2 && typeof L2.resyncCharacterWhenRequired === 'function'
        ? L2.resyncCharacterWhenRequired()
        : Promise.resolve(null);
    var catalogPromise =
      window.L2 && typeof L2.fetchCatalogHints === 'function'
        ? L2.fetchCatalogHints().catch(function () {
            return false;
          })
        : Promise.resolve(false);

    logLayoutPhase('fetch-start');
    var locationsOk = await loadAvailableTeleportIds(t);
    if (locationsOk) {
      renderCityList(listEl);
      if (errEl) errEl.hidden = true;
      logLayoutPhase('fetch-finished');
    } else if (!citiesListRendered) {
      renderListError(listEl, 'Не вдалося завантажити точки телепорту.');
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити точки телепорту.';
      }
    }

    var c = await resyncPromise;
    var snapCached =
      window.L2 && typeof L2.getCachedCharacter === 'function'
        ? L2.getCachedCharacter()
        : cached;
    if (!c && !snapCached) {
      if (errEl) {
        errEl.hidden = false;
        errEl.textContent = 'Не вдалося завантажити героя.';
      }
      return;
    }
    if (c && window.L2 && typeof L2.applyMutationSnapshot === 'function') {
      L2.applyMutationSnapshot(c);
    }
    if (c) {
      writeCachedTeleportSnapshot(c);
      applyCurrentLocation(c);
    }
    await catalogPromise;

    logLayoutPhase('content-ready');

    if (listEl && !listEl.dataset.tpClickWired) {
      listEl.dataset.tpClickWired = '1';
      listEl.addEventListener('click', function (e) {
        var tpBtn = e.target && e.target.closest ? e.target.closest('.l2-teleport-miru-tp-btn') : null;
        if (tpBtn && !tpBtn.disabled) {
          var inSurroundings = tpBtn.closest('.l2-teleport-miru-surroundings-list');
          if (!inSurroundings) hideSurroundings(listEl);
          var tpId = tpBtn.getAttribute('data-teleport-id');
          if (tpId) doTeleport(tpId, tpErr, tpOk);
          return;
        }

        var cityBtn =
          e.target && e.target.closest ? e.target.closest('.l2-teleport-miru-city-btn') : null;
        if (!cityBtn || cityBtn.disabled) return;
        var sk = cityBtn.getAttribute('data-surroundings-key');
        if (sk) {
          toggleSurroundings(sk, listEl, tpOk);
          return;
        }
        hideSurroundings(listEl);
      });
    }
  }

  init();
})();
