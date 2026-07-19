/**
 * Client smoke: clan dragon dungeon UI.
 * npm run test:dragon-dungeon-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '../public/dragon-dungeon.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/dragon-dungeon.js'), 'utf8');
const bossHtml = fs.readFileSync(path.join(__dirname, '../public/dragon-boss.html'), 'utf8');
const bossJs = fs.readFileSync(path.join(__dirname, '../public/dragon-boss.js'), 'utf8');
const menuHtml = fs.readFileSync(path.join(__dirname, '../public/menu.html'), 'utf8');
const clanMyHtml = fs.readFileSync(path.join(__dirname, '../public/clan-my.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../public/css/l2-dragon-dungeon.css'), 'utf8');

assert.match(html, /Підземелля драконів/);
assert.match(html, /Алмази клану/);
assert.match(html, /clan-my\.html/);
assert.match(html, /dragon-dungeon-active/);
assert.match(html, /dragon-dungeon-contrib/);
assert.doesNotMatch(html, /Незабаром/);

assert.match(js, /\/game\/dragon-dungeon/);
assert.match(js, /unlockInFlight/);
assert.match(js, /clan\.diamonds/);
assert.match(js, /clan\.isLeader/);
assert.match(js, /Увійти в бій/);
assert.match(js, /r\.status === 409/);
assert.doesNotMatch(js, /innerHTML\s*=/);

assert.match(bossHtml, /dragon-boss-attack/);
assert.match(bossJs, /\/game\/dragon-dungeon\/active\/enter/);
assert.match(bossJs, /\/game\/dragon-dungeon\/active\/attack/);
assert.match(bossJs, /attackInFlight/);
assert.doesNotMatch(bossHtml, /наступним етапом/);

assert.match(html, /ui-i18n\.js/);
assert.doesNotMatch(menuHtml, /dragon-dungeon\.html/);
assert.match(clanMyHtml, /href="\/dragon-dungeon\.html"/);
assert.doesNotMatch(clanMyHtml, /clan_my_stub_dungeons/);

const cityHtml = fs.readFileSync(path.join(__dirname, '../public/city.html'), 'utf8');
assert.doesNotMatch(cityHtml, /dragon-dungeon\.html/);

assert.match(css, /l2-dragon-hp-bar/);

const domainTs = fs.readFileSync(
  path.join(__dirname, '../src/domain/dragonDungeon.ts'),
  'utf8'
);
assert.match(domainTs, /maxHp: 150_000/);
assert.match(domainTs, /unlockCostDiamonds: 35/);
assert.match(domainTs, /rewardClanAdena|adena: 10_000_000/);

console.log('dragon-dungeon-client-smoke: OK');
