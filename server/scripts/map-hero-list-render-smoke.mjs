import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const renderScriptPath = path.resolve(__dirname, '../public/mapHeroRowRender.js');
const renderScriptCode = fs.readFileSync(renderScriptPath, 'utf8');

function createDocument() {
  function createElement(tag) {
    const el = {
      tagName: String(tag || '').toUpperCase(),
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
        add(cls) {
          el.className = el.className ? el.className + ' ' + cls : cls;
        },
      },
      setAttribute() {},
      addEventListener() {},
      appendChild(child) {
        el.childNodes.push(child);
        el.children.push(child);
        child.parentNode = el;
      },
      replaceChildren() {
        el.childNodes = [];
        el.children = [];
      },
      querySelector(sel) {
        if (sel === '.l2-map-hero-link__pk') {
          for (let i = 0; i < el.children.length; i++) {
            const row = el.children[i];
            const found = walkQuery(row, sel);
            if (found) return found;
          }
        }
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
          const textNode = { tagName: '#text', textContent: el._textContent };
          el.childNodes.push(textNode);
        }
      },
    });
    return el;
  }

  function walkQuery(node, sel) {
    if (!node) return null;
    if (node.className && sel === '.l2-map-hero-link__pk') {
      const classes = String(node.className).split(/\s+/);
      if (classes.indexOf('l2-map-hero-link__pk') >= 0) return node;
    }
    const kids = node.children || node.childNodes || [];
    for (let i = 0; i < kids.length; i++) {
      const hit = walkQuery(kids[i], sel);
      if (hit) return hit;
    }
    return null;
  }

  return { createElement };
}

function loadRenderer(doc, L2) {
  const sandbox = {
    window: { L2: L2 || null },
    document: doc,
    console,
  };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(renderScriptCode, sandbox, { filename: renderScriptPath });
  assert.ok(sandbox.window.L2MapHeroRowRender, 'L2MapHeroRowRender export');
  return sandbox.window.L2MapHeroRowRender;
}

const doc = createDocument();
const L2 = {
  shouldLinkPlayerProfile: () => true,
  renderPlayerIdentity(opts) {
    const wrap = doc.createElement('span');
    wrap.className = 'l2-player-identity';
    const nick = doc.createElement('span');
    nick.className = 'l2-player-identity__nick ' + (opts.nickClassName || '');
    nick.textContent = opts.name || '—';
    wrap.appendChild(nick);
    return wrap;
  },
};
const render = loadRenderer(doc, L2);

const listEl = doc.createElement('ul');
listEl.id = 'map-hero-list';
const sectionEl = doc.createElement('section');
sectionEl.hidden = true;

const kofHero = {
  name: 'KofOnline',
  level: 10,
  characterId: 'hero-kof',
  showPkButton: true,
  profileOnNameClick: false,
  pvpEligibilityCode: null,
  activeBattle: false,
  distance: 400,
  worldX: 420400,
  worldY: 420000,
};

const around = { nearbyHeroes: [kofHero] };

render.renderHeroList(around, listEl, sectionEl, { L2, onPkClick: () => {} });

assert.equal(sectionEl.hidden, false, 'hero section visible when heroes present');
assert.equal(listEl.children.length, 1, 'one hero row rendered');

const pkBtn = listEl.querySelector('.l2-map-hero-link__pk');
assert.ok(pkBtn, 'renderHeroList must create .l2-map-hero-link__pk');
assert.equal(pkBtn.textContent, '[PK]', 'PK button text must be [PK]');

// Same payload: sig skip must keep PK in DOM.
render.renderHeroList(around, listEl, sectionEl, { L2, onPkClick: () => {} });
const pkAfterSkip = listEl.querySelector('.l2-map-hero-link__pk');
assert.ok(pkAfterSkip, 'PK must survive renderHeroList sig skip');
assert.equal(pkAfterSkip.textContent, '[PK]');

// Stale DOM without PK but matching sig: must force re-render.
listEl.replaceChildren();
assert.equal(listEl.children.length, 0);
render.renderHeroList(around, listEl, sectionEl, { L2, onPkClick: () => {} });
const pkAfterRepair = listEl.querySelector('.l2-map-hero-link__pk');
assert.ok(pkAfterRepair, 'renderHeroList must restore PK after stale DOM wipe');
assert.equal(pkAfterRepair.textContent, '[PK]');

// showPkButton false must not render PK.
const blockedAround = {
  nearbyHeroes: [
    Object.assign({}, kofHero, {
      showPkButton: false,
      profileOnNameClick: true,
      pvpEligibilityCode: 'pvp_target_in_battle',
      activeBattle: true,
    }),
  ],
};
render.renderHeroList(blockedAround, listEl, sectionEl, { L2, onPkClick: () => {} });
assert.equal(listEl.querySelector('.l2-map-hero-link__pk'), null, 'blocked hero must not have PK');

console.log('map-hero-list-render-smoke: OK');
