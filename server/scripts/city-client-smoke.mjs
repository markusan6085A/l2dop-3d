/**
 * Client smoke: stable city siege card layout.
 * npm run test:city-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cityHtml = fs.readFileSync(path.join(__dirname, '../public/city.html'), 'utf8');
const cityJs = fs.readFileSync(path.join(__dirname, '../public/city.js'), 'utf8');
const cityCss = fs.readFileSync(
  path.join(__dirname, '../public/css/l2-city-222-skin.css'),
  'utf8'
);
const clanCommonCss = fs.readFileSync(
  path.join(__dirname, '../public/css/l2-clan-common.css'),
  'utf8'
);
const clanUiJs = fs.readFileSync(path.join(__dirname, '../public/l2-clan-ui.js'), 'utf8');

assert.match(cityHtml, /city-siege-card/);
assert.match(cityHtml, /data-siege-schedule/);
assert.match(cityHtml, /data-siege-owner/);
assert.match(cityHtml, /aria-busy="true"/);
assert.match(cityHtml, /Завантаження…/);
assert.match(cityHtml, /l2-clan-common\.css/);
assert.match(cityHtml, /l2-clan-ui\.js/);
assert.doesNotMatch(cityHtml, /city-siege-schedule-line/);
assert.doesNotMatch(cityHtml, /city-siege-owner-line/);

assert.match(cityJs, /renderSiegeSchedule/);
assert.match(cityJs, /renderSiegeOwnerName/);
assert.match(cityJs, /setSiegeCardBusy/);
assert.match(cityJs, /textContent/);
assert.doesNotMatch(cityJs, /city-siege-schedule-line/);
assert.doesNotMatch(cityJs, /Початок:/);
assert.doesNotMatch(cityJs, /innerHTML\s*=/);
assert.match(cityJs, /siegeCityScheduleParts|L2\.clanUi/);

assert.match(clanCommonCss, /\.city-siege-card/);
assert.match(clanCommonCss, /min-height/);
assert.match(clanCommonCss, /tabular-nums/);

assert.match(clanUiJs, /formatScheduleRange/);
assert.match(clanUiJs, /siegeCityScheduleParts/);
assert.match(clanUiJs, /debugLayout/);

console.log('city-client-smoke: OK');
