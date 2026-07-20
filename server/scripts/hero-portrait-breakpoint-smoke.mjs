import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const portraitScriptPath = path.resolve('server/public/charHeroPortrait.js');
const portraitScriptCode = fs.readFileSync(portraitScriptPath, 'utf8');

function createFakeImageElement() {
  const attrs = new Map();
  return {
    hidden: true,
    src: '',
    alt: '',
    dataset: {},
    classList: {
      add() {},
      remove() {},
    },
    setAttribute(name, value) {
      attrs.set(name, String(value));
    },
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    removeAttribute(name) {
      attrs.delete(name);
      if (name === 'src') this.src = '';
      if (name === 'data-hero-portrait-tier') delete this.dataset.heroPortraitTier;
      if (name === 'data-hero-portrait-raised') delete this.dataset.heroPortraitRaised;
    },
  };
}

function createHarness() {
  const image = createFakeImageElement();
  const stage = { hidden: true };
  const fakeDocument = {
    getElementById(id) {
      if (id === 'char-hero-img') return image;
      if (id === 'char-hero-stage') return stage;
      return null;
    },
    querySelector() {
      return null;
    },
  };
  const sandbox = { window: {}, document: fakeDocument };
  vm.createContext(sandbox);
  vm.runInContext(portraitScriptCode, sandbox, { filename: portraitScriptPath });
  return {
    renderPortrait: sandbox.window?.L2CharHero?.renderPortrait,
    image,
    stage,
  };
}

function renderForLevel(renderPortrait, image, stage, level) {
  image.hidden = true;
  image.src = '';
  image.alt = '';
  image.dataset = {};
  stage.hidden = true;
  renderPortrait(
    {
      level,
      race: 'Human',
      gender: 'male',
      l2Profession: 'human_hawkeye',
    },
    { imgId: 'char-hero-img', stageId: 'char-hero-stage' }
  );
  return {
    src: image.src,
    tier: image.dataset.heroPortraitTier ?? null,
  };
}

const { renderPortrait, image, stage } = createHarness();
assert.equal(typeof renderPortrait, 'function', 'L2CharHero.renderPortrait must exist');

const level60 = renderForLevel(renderPortrait, image, stage, 60);
const level61 = renderForLevel(renderPortrait, image, stage, 61);
const level62 = renderForLevel(renderPortrait, image, stage, 62);

assert.equal(
  level60.src,
  '/characters/photo_19_2026-07-13_10-22-46-removebg-preview.png',
  'На 60 рівні має залишатись стара картинка'
);
assert.equal(level60.tier, '52', 'На 60 рівні має лишатись tier 52');

assert.equal(
  level61.src,
  '/characters/photo_27_2026-07-13_10-22-46-removebg-preview.png',
  'На 61 рівні має вмикатись нова картинка'
);
assert.equal(level61.tier, '61', 'На 61 рівні має бути новий tier');

assert.equal(
  level62.src,
  '/characters/photo_27_2026-07-13_10-22-46-removebg-preview.png',
  'На 62+ рівні має лишатись нова картинка'
);
assert.equal(level62.tier, '61', 'На 62+ рівні має лишатись новий tier');

console.log('OK: hero portrait breakpoint 60/61/62');
