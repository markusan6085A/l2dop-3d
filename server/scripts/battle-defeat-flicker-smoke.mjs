import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');

function readPublic(relPath) {
  return fs.readFileSync(path.join(publicDir, relPath), 'utf8');
}

function createDocument() {
  const nodesById = new Map();

  function createElement(tag) {
    const el = {
      tagName: String(tag || '').toUpperCase(),
      id: '',
      hidden: true,
      _textContent: '',
      childNodes: [],
      children: [],
      dataset: {},
      style: { setProperty() {} },
      classList: {
        _classes: new Set(),
        add(cls) {
          String(cls || '')
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => this._classes.add(c));
        },
      },
      setAttribute(name, value) {
        if (name === 'id') el.id = String(value);
        if (name === 'hidden') el.hidden = value != null;
      },
      appendChild(child) {
        el.childNodes.push(child);
        el.children.push(child);
        child.parentNode = el;
        if (child.id) nodesById.set(child.id, child);
      },
      addEventListener() {},
      querySelector() {
        return null;
      },
    };
    return el;
  }

  const body = createElement('body');
  const defeatRoot = createElement('section');
  defeatRoot.id = 'battle-defeat-root';
  defeatRoot.hidden = true;
  body.appendChild(defeatRoot);

  const mapDefeatRoot = createElement('section');
  mapDefeatRoot.id = 'map-defeat-root';
  mapDefeatRoot.hidden = true;
  body.appendChild(mapDefeatRoot);

  return {
    body,
    getElementById(id) {
      return nodesById.get(id) || null;
    },
    createElement,
  };
}

function loadScript(relPath, sandbox, beforeRun) {
  const code = readPublic(relPath);
  if (beforeRun) beforeRun(sandbox);
  vm.runInNewContext(code, sandbox, { filename: relPath });
}

function runBattleDefeatGateSmoke(doc) {
  const sandbox = {
    window: {
      __L2_BATTLE_DEFEAT_TEST_MODE: true,
      location: { search: '?spawnId=test-spawn', href: '/battle.html' },
      addEventListener() {},
    },
    document: doc,
    localStorage: {
      _data: {
        token: 'test-token',
        'l2battle_pending_defeat_v1': JSON.stringify({
          mobName: 'Stale Mob',
          mobLevel: 9,
        }),
      },
      getItem(key) {
        return this._data[key] ?? null;
      },
      setItem(key, value) {
        this._data[key] = String(value);
      },
      removeItem(key) {
        delete this._data[key];
      },
    },
    sessionStorage: {
      _data: {},
      getItem(key) {
        return this._data[key] ?? null;
      },
      setItem(key, value) {
        this._data[key] = String(value);
      },
      removeItem(key) {
        delete this._data[key];
      },
    },
    console,
    setTimeout,
    clearTimeout,
    fetch() {
      return Promise.resolve({ ok: false });
    },
  };
  sandbox.window = sandbox.window;
  sandbox.window.localStorage = sandbox.localStorage;
  sandbox.window.sessionStorage = sandbox.sessionStorage;
  sandbox.window.document = doc;

  loadScript('battle.js', sandbox);

  const api = sandbox.window.L2BattleDefeatTest;
  assert.ok(api, 'battle.js must export L2BattleDefeatTest in test mode');

  api.resetForTest();
  assert.equal(api.canRenderDefeatUi(), false, 'defeat UI blocked before initial sync');
  assert.equal(api.isDefeatRootVisible(), false, 'defeat root hidden before sync');

  api.tryShowDefeat({ mobName: 'Stale Mob' }, function () {
    const defRoot = doc.getElementById('battle-defeat-root');
    if (defRoot) defRoot.hidden = false;
  });
  assert.equal(
    api.isDefeatRootVisible(),
    false,
    'stale local defeat must not flash before initial sync'
  );

  api.markInitialBattleSyncResolved();
  assert.equal(api.canRenderDefeatUi(), true, 'initial sync gate opens after mark');

  api.tryShowDefeat(null, function () {
    const defRoot = doc.getElementById('battle-defeat-root');
    if (defRoot) defRoot.hidden = false;
  });
  assert.equal(
    api.isDefeatRootVisible(),
    false,
    'canonical null defeat stays hidden after sync'
  );

  api.tryShowDefeat({ mobName: 'Real Mob', mobLevel: 12 }, function () {
    const defRoot = doc.getElementById('battle-defeat-root');
    if (defRoot) defRoot.hidden = false;
  });
  assert.equal(
    api.isDefeatRootVisible(),
    true,
    'real defeat may show only after initial sync'
  );
}

function runMapDefeatGateSmoke() {
  const nodesById = new Map();
  function createElement(tag) {
    const el = {
      tagName: String(tag || '').toUpperCase(),
      id: '',
      hidden: false,
      childNodes: [],
      children: [],
      dataset: {},
      style: { setProperty() {} },
      classList: { add() {}, toggle() {}, remove() {} },
      setAttribute(name, value) {
        if (name === 'id') el.id = String(value);
        if (name === 'hidden') el.hidden = value != null;
      },
      appendChild(child) {
        el.childNodes.push(child);
        el.children.push(child);
        if (child.id) nodesById.set(child.id, child);
      },
      addEventListener() {},
      querySelector() {
        return null;
      },
    };
    return el;
  }

  const doc = {
    createElement,
    getElementById(id) {
      return nodesById.get(id) || null;
    },
  };

  for (const id of [
    'map-load-err',
    'map-content',
    'map-stack',
    'map-mob-section',
    'map-mob-detail',
    'map-mob-detail-list',
    'map-back-to-map',
    'map-viewport',
    'map-img',
    'map-dot',
    'map-view-radius',
    'map-hero-view-radius',
    'map-dungeon-enter',
    'map-dungeon-enter-link',
    'map-dungeon-enter-label',
    'map-hero-markers',
    'map-party-nearby',
    'map-hero-list',
    'map-hero-section',
    'map-move-target',
    'map-mob-markers',
    'map-npc-markers',
    'map-list-mode-npc',
    'map-list-mode-mobs',
    'map-mob-list',
    'map-mob-pager',
    'map-mob-page-prev',
    'map-mob-page-next',
    'map-mob-page-ind',
    'map-mob-detail-pager',
    'map-mob-detail-prev',
    'map-mob-detail-next',
    'map-mob-detail-ind',
    'map-defeat-root',
    'map-defeat-mobhead',
    'map-defeat-shout',
    'map-defeat-town-hint',
    'map-defeat-log',
    'map-defeat-tocity',
  ]) {
    const el = createElement('div');
    el.id = id;
    nodesById.set(id, el);
  }

  const sandbox = {
    window: {
      __L2_MAP_SYNC_TEST_MODE: true,
      location: { search: '', href: '/map.html', replace() {} },
      addEventListener() {},
      L2: {
        lastSnapshot() {
          return {
            id: 'viewer-1',
            revision: 1,
            worldX: 52055,
            worldY: -54485,
            pveDefeat: { mobName: 'Stale cache mob', mobLevel: 8 },
          };
        },
        setLastSnapshot() {},
        mergeMapStateIntoSnapshot() {},
        applyHudFromSnapshot() {},
        applyPvpIncoming() {},
        renderPlayerIdentity(opts) {
          const wrap = doc.createElement('span');
          wrap.textContent = (opts && opts.name) || '—';
          return wrap;
        },
        shouldLinkPlayerProfile() {
          return true;
        },
      },
      localStorage: {
        getItem() {
          return 'test-token';
        },
        setItem() {},
        removeItem() {},
      },
      sessionStorage: {
        getItem() {
          return null;
        },
        setItem() {},
        removeItem() {},
      },
    },
    document: doc,
    console,
    setTimeout,
    clearTimeout,
    setInterval() {
      return 0;
    },
    clearInterval() {},
    requestAnimationFrame(fn) {
      if (typeof fn === 'function') fn();
    },
    fetch() {
      return Promise.resolve({ ok: false, status: 401, json: async () => ({}) });
    },
    alert() {},
  };
  sandbox.globalThis = sandbox.window;
  sandbox.localStorage = sandbox.window.localStorage;
  sandbox.sessionStorage = sandbox.window.sessionStorage;
  sandbox.L2 = sandbox.window.L2;
  sandbox.window.L2 = sandbox.window.L2;

  loadScript('mapHeroRowRender.js', sandbox);
  loadScript('map.js', sandbox);

  const api = sandbox.window.L2MapSyncTest;
  assert.ok(api, 'map.js must export L2MapSyncTest in test mode');
  assert.equal(
    api.isInitialMapSyncResolved(),
    false,
    'map defeat gate closed before first sync'
  );
  assert.equal(api.isMapDefeatVisible(), false, 'map defeat hidden before sync');

  api.applyMapSyncPayload(
    {
      changed: false,
      mapCatalogVersion: 1,
      personalMapSig: 'sig',
      revision: 1,
      mapRadii: {
        mobInteractionRadius: 20000,
        playerVisibilityRadius: 12000,
        partyRewardRadius: 12000,
        pvpInteractionRadius: 20000,
      },
      mapState: {
        id: 'viewer-1',
        revision: 1,
        worldX: 52055,
        worldY: -54485,
        targetX: 0,
        targetY: 0,
        level: 22,
      },
      around: { nearbyHeroes: [], nearbySpawns: [], partyNearbyMembers: [] },
      spawns: [],
      pvpDefeat: null,
      pveDefeat: null,
    },
    { force: true }
  );

  assert.equal(api.isInitialMapSyncResolved(), true, 'first map sync resolves gate');
  assert.equal(
    api.isMapDefeatVisible(),
    false,
    'null server defeat clears stale map defeat UI'
  );
}

const doc = createDocument();
runBattleDefeatGateSmoke(doc);
runMapDefeatGateSmoke();
console.log('battle-defeat-flicker-smoke: 6 passed');
