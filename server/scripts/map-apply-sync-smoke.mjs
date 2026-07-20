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
      className: '',
      hidden: false,
      _textContent: '',
      childNodes: [],
      children: [],
      dataset: {},
      style: {
        setProperty() {},
      },
      classList: {
        _classes: new Set(),
        add(cls) {
          String(cls || '')
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => this._classes.add(c));
          el.className = [...this._classes].join(' ');
        },
        toggle(cls, force) {
          if (force === true) {
            this._classes.add(cls);
          } else if (force === false) {
            this._classes.delete(cls);
          } else if (this._classes.has(cls)) {
            this._classes.delete(cls);
          } else {
            this._classes.add(cls);
          }
          el.className = [...this._classes].join(' ');
        },
        remove(cls) {
          String(cls || '')
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => this._classes.delete(c));
          el.className = [...this._classes].join(' ');
        },
      },
      setAttribute(name, value) {
        if (name === 'id') el.id = String(value);
        if (name === 'aria-selected') el._ariaSelected = String(value);
        if (name === 'aria-hidden') el._ariaHidden = String(value);
        if (name === 'hidden') el.hidden = value != null;
      },
      getAttribute(name) {
        if (name === 'id') return el.id;
        return null;
      },
      addEventListener() {},
      appendChild(child) {
        el.childNodes.push(child);
        el.children.push(child);
        child.parentNode = el;
        if (child.id) nodesById.set(child.id, child);
      },
      replaceChildren() {
        for (const child of el.children) {
          if (child.id) nodesById.delete(child.id);
        }
        el.childNodes = [];
        el.children = [];
      },
      querySelector(sel) {
        return walkQuery(el, sel);
      },
    };
    Object.defineProperty(el, 'textContent', {
      get() {
        if (el.childNodes.length) {
          return el.childNodes.map((n) => n.textContent || '').join('');
        }
        return el._textContent;
      },
      set(value) {
        el._textContent = String(value ?? '');
        el.childNodes = [];
        el.children = [];
        if (el._textContent) {
          el.childNodes.push({ tagName: '#text', textContent: el._textContent });
        }
      },
    });
    return el;
  }

  function walkQuery(node, sel) {
    if (!node) return null;
    if (sel.startsWith('#') && node.id === sel.slice(1)) return node;
    if (sel.includes('[data-character-id=')) {
      const m = sel.match(/\[data-character-id="([^"]+)"\]/);
      const wantedId = m ? m[1] : '';
      if (node.dataset && node.dataset.characterId === wantedId) {
        if (sel.endsWith(' .l2-map-hero-link__pk')) {
          return walkQuery(node, '.l2-map-hero-link__pk');
        }
        return node;
      }
    }
    if (node.className && sel === '.l2-map-hero-link__pk') {
      const classes = String(node.className).split(/\s+/);
      if (classes.includes('l2-map-hero-link__pk')) return node;
    }
    const kids = node.children || node.childNodes || [];
    for (let i = 0; i < kids.length; i++) {
      const hit = walkQuery(kids[i], sel);
      if (hit) return hit;
    }
    return null;
  }

  const doc = {
    createElement,
    getElementById(id) {
      return nodesById.get(id) || null;
    },
  };

  const heroSection = createElement('section');
  heroSection.id = 'map-hero-section';
  heroSection.hidden = true;
  nodesById.set('map-hero-section', heroSection);

  const heroList = createElement('ul');
  heroList.id = 'map-hero-list';
  heroSection.appendChild(heroList);
  nodesById.set('map-hero-list', heroList);

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
  ]) {
    const el = createElement('div');
    el.id = id;
    nodesById.set(id, el);
  }

  return { doc, heroList, heroSection, nodesById };
}

function loadScript(filename, sandbox) {
  vm.runInNewContext(readPublic(filename), sandbox, {
    filename: path.join(publicDir, filename),
  });
}

const { doc, heroList, heroSection } = createDocument();

const storage = new Map([['token', 'smoke-token']]);
const sandbox = {
  window: {
    __L2_MAP_SYNC_TEST_MODE: true,
    L2: {
      lastSnapshot() {
        return { revision: 1, level: 22, worldX: 420000, worldY: 420000 };
      },
      mergeMapStateIntoSnapshot() {},
      applyHudFromSnapshot() {},
      setLastSnapshot() {},
      applyPvpIncoming() {},
      renderPlayerIdentity(opts) {
        const wrap = doc.createElement('span');
        wrap.className = 'l2-player-identity';
        const nick = doc.createElement('span');
        nick.className = 'l2-map-hero-name-link';
        nick.textContent = opts.name || '—';
        wrap.appendChild(nick);
        return wrap;
      },
      shouldLinkPlayerProfile() {
        return true;
      },
    },
    localStorage: {
      getItem(key) {
        return storage.get(key) ?? null;
      },
      setItem(key, value) {
        storage.set(key, String(value));
      },
      removeItem(key) {
        storage.delete(key);
      },
    },
    sessionStorage: {
      getItem() {
        return null;
      },
      setItem() {},
    },
    location: { href: '', replace() {} },
    addEventListener() {},
  },
  document: doc,
  console,
  setInterval() {
    return 0;
  },
  clearInterval() {},
  fetch() {
    return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
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

assert.ok(sandbox.window.L2MapSyncTest, 'map.js must export L2MapSyncTest in test mode');
const api = sandbox.window.L2MapSyncTest;

const targetId = 'target-1';
const syncPayload = {
  changed: true,
  mapCatalogVersion: 1,
  personalMapSig: 'sig',
  mammonRotationSig: 'mammon',
  revision: 1,
  mapRadii: { mobInteractionRadius: 28000, playerVisibilityRadius: 12000 },
  mapState: {
    id: 'viewer-1',
    revision: 1,
    worldX: 420000,
    worldY: 420000,
    targetX: 0,
    targetY: 0,
    level: 22,
    hp: 100,
    maxHp: 100,
    expBarCur: '0',
    expBarMax: '1',
    expBarPct: 0,
    name: 'markusan',
  },
  around: {
    nearbyHeroes: [
      {
        characterId: targetId,
        name: 'KofOnline',
        level: 10,
        showPkButton: true,
        profileOnNameClick: false,
        pvpEligibilityCode: null,
        pvpBlockedReasonUk: null,
        pvpAllowed: true,
        activeBattle: false,
        targetLocationKey: 'world:giran_wild',
        viewerLevelUsed: 22,
        worldX: 420400,
        worldY: 420000,
        distance: 400,
      },
    ],
    nearbySpawns: [],
    partyNearbyMembers: [],
  },
  spawns: [],
  pvpIncoming: null,
  pvpDefeat: null,
  pveDefeat: null,
};

api.applyMapSyncPayload(syncPayload, { force: true, centerOnPlayer: false });

assert.equal(heroList.children.length, 1, '#map-hero-list must contain one hero row');
assert.match(heroList.textContent, /KofOnline/, 'hero row text must include KofOnline');
assert.match(heroList.textContent, /\[PK\]/, 'hero row text must include [PK]');

const pkNode = heroList.querySelector(
  `#map-hero-list [data-character-id="${targetId}"] .l2-map-hero-link__pk`
) || doc.getElementById('map-hero-list').querySelector(
  `[data-character-id="${targetId}"] .l2-map-hero-link__pk`
);
const row = heroList.children[0];
assert.ok(row, 'hero row must exist');
assert.equal(row.dataset.characterId, targetId, 'hero row must expose data-character-id');
const pkBtn = row.querySelector('.l2-map-hero-link__pk');
assert.ok(pkBtn, '.l2-map-hero-link__pk must exist in hero row');
assert.equal(pkBtn.dataset.targetCharacterId, targetId, 'PK button must carry targetCharacterId');
assert.equal(heroSection.hidden, false, 'hero section must be visible');

api.applyMapSyncPayload(syncPayload, { force: false, centerOnPlayer: false });
const pkAfterResync = row.querySelector('.l2-map-hero-link__pk');
assert.ok(pkAfterResync, 'repeat applyMapSyncPayload must keep PK button');

heroList.replaceChildren();
assert.equal(heroList.children.length, 0);
api.applyMapSyncPayload(syncPayload, { force: false, centerOnPlayer: false });
const pkAfterRepair = heroList.querySelector('.l2-map-hero-link__pk');
assert.ok(pkAfterRepair, 'sig-skip repair must restore PK after manual DOM wipe');
assert.match(heroList.textContent, /\[PK\]/, 'restored row must contain [PK] text');

console.log('map-apply-sync-smoke: OK');
