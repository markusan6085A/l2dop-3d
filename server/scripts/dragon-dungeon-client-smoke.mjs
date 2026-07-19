/**
 * Client smoke: dragon dungeon page markers.
 * npm run test:dragon-dungeon-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(
  path.join(__dirname, '../public/dragon-dungeon.html'),
  'utf8'
);
const js = fs.readFileSync(
  path.join(__dirname, '../public/dragon-dungeon.js'),
  'utf8'
);
const menuHtml = fs.readFileSync(
  path.join(__dirname, '../public/menu.html'),
  'utf8'
);

assert.match(html, /Підземелля драконів/);
assert.match(html, /Ваші алмази:/);
assert.match(html, /l2-dragon-dungeon-list/);
assert.match(html, /20260719dragonDungeon1/);

const css = fs.readFileSync(
  path.join(__dirname, '../public/css/l2-dragon-dungeon.css'),
  'utf8'
);
assert.match(css, /flex-direction:\s*column/);

assert.match(js, /\/game\/dragon-dungeon/);
assert.match(js, /unlockInFlight/);
assert.match(js, /createElement/);
assert.match(js, /textContent/);
assert.match(js, /Green_Dragon\.jpg|imageUrl/);
assert.match(js, /unlockCostDiamonds/);
assert.match(js, /btn\.hidden = true/);
assert.match(js, /btn\.disabled = true/);
assert.match(js, /r\.status === 409/);
assert.doesNotMatch(js, /innerHTML\s*=/);
assert.doesNotMatch(js, /innerHTML\s*\+=/);

const domainTs = fs.readFileSync(
  path.join(__dirname, '../src/domain/dragonDungeon.ts'),
  'utf8'
);
assert.match(domainTs, /unlockCostDiamonds: 35/);
assert.match(domainTs, /unlockCostDiamonds: 75/);
assert.match(domainTs, /unlockCostDiamonds: 120/);
assert.match(menuHtml, /dragon-dungeon\.html/);
assert.match(menuHtml, /Підземелля драконів/);

console.log('dragon-dungeon-client-smoke: OK');
