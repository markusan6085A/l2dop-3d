/**
 * Client smoke: identity renderer runs in DOM without recursion.
 * npm run test:identity-renderer-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commonPath = path.join(__dirname, '../public/common.js');
const commonSrc = fs.readFileSync(commonPath, 'utf8');
const siegeSrc = fs.readFileSync(path.join(__dirname, '../public/siege.js'), 'utf8');

function createMemoryStorage() {
  const map = new Map();
  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, String(value));
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

function createMinimalDom() {
  const elementsById = new Map();

  class Element {
    constructor(tagName) {
      this.tagName = String(tagName || 'div').toLowerCase();
      this.nodeName = this.tagName.toUpperCase();
      this.nodeType = 1;
      this.children = [];
      this.childNodes = this.children;
      this.attributes = {};
      this.style = {
        setProperty(name, value) {
          this[name] = value;
        },
      };
      this.className = '';
      this.textContent = '';
      this.hidden = false;
      this.disabled = false;
      this.id = '';
      this.parentNode = null;
      this._listeners = {};
      const self = this;
      this.classList = {
        _set: new Set(),
        add(...cls) {
          cls.forEach((c) => self.classList._set.add(c));
          self.className = [...self.classList._set].join(' ');
        },
        remove(...cls) {
          cls.forEach((c) => self.classList._set.delete(c));
          self.className = [...self.classList._set].join(' ');
        },
        contains(cls) {
          if (self.classList._set.size) return self.classList._set.has(cls);
          return (' ' + self.className + ' ').includes(' ' + cls + ' ');
        },
      };
    }

    appendChild(child) {
      if (!child) return child;
      if (child.parentNode) {
        const idx = child.parentNode.children.indexOf(child);
        if (idx >= 0) child.parentNode.children.splice(idx, 1);
      }
      this.children.push(child);
      child.parentNode = this;
      return child;
    }

    setAttribute(name, value) {
      this.attributes[name] = String(value);
      if (name === 'id') {
        this.id = String(value);
        elementsById.set(this.id, this);
      }
      if (name === 'hidden') {
        this.hidden = value !== 'false' && value !== '';
      }
    }

    getAttribute(name) {
      return Object.prototype.hasOwnProperty.call(this.attributes, name)
        ? this.attributes[name]
        : null;
    }

    addEventListener(type, fn) {
      if (!this._listeners[type]) this._listeners[type] = [];
      this._listeners[type].push(fn);
    }

    querySelectorAll(sel) {
      const out = [];
      if (sel.startsWith('.')) {
        const cls = sel.slice(1);
        walkClass(this, cls, out);
      }
      return out;
    }

    querySelector(sel) {
      const all = this.querySelectorAll(sel);
      return all.length ? all[0] : null;
    }
  }

  function walkClass(node, cls, out) {
    for (const ch of node.children || []) {
      if (ch.classList && ch.classList.contains(cls)) out.push(ch);
      walkClass(ch, cls, out);
    }
  }

  const head = new Element('head');
  const body = new Element('body');
  body.classList.add('l2-app-l2-chrome');

  const document = {
    createElement(tag) {
      return new Element(tag);
    },
    createTextNode(text) {
      return { nodeType: 3, textContent: String(text) };
    },
    getElementById(id) {
      return elementsById.get(id) || null;
    },
    querySelector(sel) {
      if (sel.startsWith('#')) return elementsById.get(sel.slice(1)) || null;
      if (sel === '.l2-hud-legacy-bars') {
        return elementsById.get('l2-hud-legacy-bars') || null;
      }
      return body.querySelector(sel);
    },
    body,
    head,
    documentElement: body,
    readyState: 'complete',
    addEventListener() {},
  };

  return { document, elementsById, Element };
}

function loadCommonJs() {
  const dom = createMinimalDom();
  const { document, elementsById, Element } = dom;
  const window = {
    document,
    localStorage: createMemoryStorage(),
    sessionStorage: createMemoryStorage(),
    addEventListener() {},
    location: { search: '', href: 'http://localhost/' },
    navigator: {},
    setTimeout(fn) {
      if (typeof fn === 'function') fn();
      return 1;
    },
    clearTimeout() {},
    requestAnimationFrame(fn) {
      if (typeof fn === 'function') fn();
      return 1;
    },
    fetch: async () => ({
      ok: false,
      status: 401,
      json: async () => ({}),
    }),
  };
  window.window = window;
  window.globalThis = window;

  const context = vm.createContext(window);
  vm.runInContext(commonSrc, context, { filename: commonPath });
  assert.ok(window.L2, 'L2 must exist after loading common.js');
  return { L2: window.L2, document, elementsById, Element };
}

function countNodes(node) {
  if (!node) return 0;
  let n = 1;
  for (const ch of node.children || []) n += countNodes(ch);
  return n;
}

function collectByTag(root, tag, out = []) {
  if (!root) return out;
  if (root.tagName === tag) out.push(root);
  for (const ch of root.children || []) collectByTag(ch, tag, out);
  return out;
}

// Static guard: primitive nick helper must not call identity renderer.
const nickFnMatch = commonSrc.match(
  /createPlayerProfileNickEl:\s*function\s*\([^)]*\)\s*\{([\s\S]*?)\n\s*\},/
);
assert.ok(nickFnMatch, 'createPlayerProfileNickEl source must be found');
assert.doesNotMatch(
  nickFnMatch[1],
  /renderPlayerIdentity/,
  'createPlayerProfileNickEl must not call renderPlayerIdentity'
);
assert.match(
  commonSrc,
  /renderPlayerIdentity:[\s\S]*createPlayerProfileNickEl/,
  'renderPlayerIdentity should call createPlayerProfileNickEl'
);

const { L2, document, elementsById, Element } = loadCommonJs();

// 1. createPlayerProfileNickEl returns one terminal DOM node.
const nickOnly = L2.createPlayerProfileNickEl({ name: 'TestNick', className: 'nick-test' });
assert.ok(nickOnly.tagName === 'a' || nickOnly.tagName === 'span');
assert.equal(nickOnly.textContent, 'TestNick');
assert.equal(countNodes(nickOnly), 1);

// 2. createPlayerProfileNickEl does not invoke renderPlayerIdentity.
let renderCallsDuringNick = 0;
const origRender = L2.renderPlayerIdentity.bind(L2);
L2.renderPlayerIdentity = function (...args) {
  renderCallsDuringNick += 1;
  return origRender(...args);
};
L2.createPlayerProfileNickEl({ name: 'GuardNick', characterId: '42' });
assert.equal(renderCallsDuringNick, 0, 'nick primitive must not call renderPlayerIdentity');
L2.renderPlayerIdentity = origRender;

// 3. renderPlayerIdentity with emblemId → wrapper + img + nick.
const withEmblem = L2.renderPlayerIdentity({
  name: 'Hero',
  clanEmblemId: 7,
  characterId: 'c1',
  emblemSize: 16,
  className: 'wrap-test',
  nickClassName: 'nick-extra',
});
assert.equal(withEmblem.classList.contains('l2-player-identity'), true);
assert.equal(withEmblem.classList.contains('wrap-test'), true);
assert.equal(withEmblem.classList.contains('nick-extra'), false);
const emblemImgs = collectByTag(withEmblem, 'img');
const nickLinks = collectByTag(withEmblem, 'a');
assert.equal(emblemImgs.length, 1);
assert.equal(nickLinks.length, 1);
assert.equal(emblemImgs[0].src, '/clans-emblems/7.jpg');
assert.equal(nickLinks[0].classList.contains('nick-extra'), true);
assert.equal(nickLinks[0].classList.contains('wrap-test'), false);

// 4. renderPlayerIdentity without emblemId must not create broken img.
const noEmblem = L2.renderPlayerIdentity({ name: 'Plain', characterId: 'c2' });
assert.equal(collectByTag(noEmblem, 'img').length, 0);
assert.equal(collectByTag(noEmblem, 'a').length, 1);

// 5. 1000 calls must not throw or explode DOM.
for (let i = 0; i < 1000; i++) {
  const emblemIds = L2.listClanEmblemIds();
  const emblemId = emblemIds[i % emblemIds.length];
  const node = L2.renderPlayerIdentity({
    name: 'Nick' + i,
    clanEmblemId: emblemId,
    characterId: 'char-' + i,
  });
  assert.ok(node);
  assert.ok(countNodes(node) <= 3);
}

// 6. Nick with characterId stays a profile link.
const linked = L2.createPlayerProfileNickEl({
  characterId: '777',
  name: 'LinkedHero',
});
assert.equal(linked.tagName, 'a');
assert.match(linked.href, /\/player\.html\?id=777/);

// 7. Nick without characterId renders as span when linking disabled.
document.body.classList.remove('l2-app-l2-chrome');
const plainSpan = L2.createPlayerProfileNickEl({ name: 'NoLink' });
assert.equal(plainSpan.tagName, 'span');
document.body.classList.add('l2-app-l2-chrome');

// 8. HUD snapshot renders nick + emblem in legacy name slot.
const legacyBars = new Element('div');
legacyBars.id = 'l2-hud-legacy-bars';
legacyBars.classList.add('l2-hud-legacy-bars');
elementsById.set('l2-hud-legacy-bars', legacyBars);
document.body.appendChild(legacyBars);

const legacyName = new Element('span');
legacyName.id = 'l2-hud-legacy-name';
elementsById.set('l2-hud-legacy-name', legacyName);
document.body.appendChild(legacyName);

L2.applyHudFromSnapshot({
  name: 'HudHero',
  clanEmblemId: 12,
  level: 40,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  cp: 10,
  maxCp: 10,
  expBarPct: 0,
});
assert.equal(legacyName.children.length, 1);
assert.equal(legacyName.children[0].classList.contains('l2-player-identity'), true);
assert.equal(collectByTag(legacyName, 'img').length, 1);

// 9. Siege participant path renders nick + emblem.
const siegeRow = { nickname: 'SiegeHero', clanEmblemId: 3 };
const siegeContent = document.createElement('span');
siegeContent.appendChild(
  L2.renderPlayerIdentity({
    name: siegeRow.nickname,
    clanEmblemId: siegeRow.clanEmblemId,
    emblemSize: 16,
  })
);
assert.equal(collectByTag(siegeContent, 'img').length, 1);
assert.match(siegeSrc, /renderPlayerIdentity/);

// 10. Legacy createPlayerProfileNickEl without emblemId still works.
document.body.classList.remove('l2-app-l2-chrome');
const legacyNick = L2.createPlayerProfileNickEl({
  name: 'Legacy',
  className: 'legacy-nick',
});
document.body.classList.add('l2-app-l2-chrome');
assert.equal(legacyNick.tagName, 'span');
assert.equal(legacyNick.classList.contains('legacy-nick'), true);
assert.equal(collectByTag(legacyNick, 'img').length, 0);

// Picker paginates emblem buttons (~3 pages for 76).
const pickerHost = document.createElement('div');
L2.mountClanEmblemPicker(pickerHost, { selectedId: 5, size: 32 });
assert.equal(L2.listClanEmblemIds().length, 76);
assert.equal(L2.clanEmblemPickerPerPage(76), 26);
assert.equal(
  pickerHost.querySelectorAll('.l2-clan-emblem-picker__btn').length,
  26
);
assert.ok(pickerHost.querySelector('.l2-clan-emblem-picker-nav'));
assert.equal(
  pickerHost.querySelector('.l2-clan-emblem-picker__btn--selected').getAttribute(
    'data-emblem-id'
  ),
  '5'
);

console.log('identity-renderer-client-smoke: OK');
