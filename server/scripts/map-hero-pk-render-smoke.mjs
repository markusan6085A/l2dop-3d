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
      _textContent: '',
      childNodes: [],
      style: {
        setProperty() {},
      },
      dataset: {},
      classList: {
        add(cls) {
          el.className = el.className ? el.className + ' ' + cls : cls;
        },
      },
      setAttribute() {},
      addEventListener() {},
      appendChild(child) {
        el.childNodes.push(child);
        child.parentNode = el;
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
        if (el._textContent) {
          el.childNodes.push({ tagName: '#text', textContent: el._textContent });
        }
      },
    });
    return el;
  }

  function serialize(node) {
    if (!node) return '';
    if (node.tagName === '#text') return node.textContent || '';
    const tag = node.tagName.toLowerCase();
    const cls = node.className ? ` class="${node.className.trim()}"` : '';
    const inner = node.childNodes.map(serialize).join('');
    return `<${tag}${cls}>${inner}</${tag}>`;
  }

  return {
    createElement,
    serializeList(el) {
      return el.childNodes.map(serialize).join('');
    },
  };
}

function loadRenderer(doc) {
  const sandbox = {
    window: {},
    document: doc,
    console,
  };
  sandbox.globalThis = sandbox.window;
  vm.runInNewContext(renderScriptCode, sandbox, { filename: renderScriptPath });
  assert.ok(sandbox.window.L2MapHeroRowRender, 'L2MapHeroRowRender export');
  return sandbox.window.L2MapHeroRowRender;
}

const doc = createDocument();
const render = loadRenderer(doc);

const eligibleHero = {
  name: 'KofOnline',
  level: 10,
  characterId: 'hero-target',
  showPkButton: true,
  profileOnNameClick: false,
  pvpEligibilityCode: null,
  pvpBlockedReasonUk: null,
};

assert.equal(render.heroShowsPkButton(eligibleHero), true);
const listEl = doc.createElement('ul');
render.appendHeroRow(listEl, eligibleHero, { L2: null });
const html = doc.serializeList(listEl);
assert.match(html, /\[PK\]/, 'eligible hero row HTML must contain [PK]');
assert.match(html, /l2-map-hero-link__pk/, 'eligible hero row HTML must contain PK button class');

const blockedHero = {
  name: 'KofOnline',
  level: 10,
  showPkButton: false,
  profileOnNameClick: true,
  pvpEligibilityCode: 'pvp_level_difference_too_high',
};
assert.equal(render.heroShowsPkButton(blockedHero), false);
const blockedList = doc.createElement('ul');
render.appendHeroRow(blockedList, blockedHero, { L2: null });
const blockedHtml = doc.serializeList(blockedList);
assert.doesNotMatch(blockedHtml, /\[PK\]/, 'blocked hero row must not contain [PK]');

console.log('map-hero-pk-render-smoke: OK');
