/**
 * Client smoke: siege page polling + attack guards + WAP UI markers.
 * npm run test:clan-siege-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siegeSrc = fs.readFileSync(
  path.join(__dirname, '../public/siege.js'),
  'utf8'
);
const siegeHtml = fs.readFileSync(
  path.join(__dirname, '../public/siege.html'),
  'utf8'
);
const siegeCss = fs.readFileSync(
  path.join(__dirname, '../public/css/l2-siege-page.css'),
  'utf8'
);
const citySrc = fs.readFileSync(
  path.join(__dirname, '../public/city.js'),
  'utf8'
);
const cityHtml = fs.readFileSync(
  path.join(__dirname, '../public/city.html'),
  'utf8'
);
const cityCss = fs.readFileSync(
  path.join(__dirname, '../public/css/l2-city-222-skin.css'),
  'utf8'
);

var SIEGE_ACTIVE_POLL_MS = 4000;
var SIEGE_WAITING_SYNC_MS = 60000;

function resolvePollDelay(data) {
  if (data && data.state === 'active') return SIEGE_ACTIVE_POLL_MS;
  if (data && data.state === 'finished') return 0;
  return SIEGE_WAITING_SYNC_MS;
}

assert.match(siegeSrc, /setTimeout\(function \(\)/);
assert.doesNotMatch(siegeSrc, /pollTimer = setInterval/);
assert.match(siegeSrc, /fetchInFlight/);
assert.match(siegeSrc, /attackInFlight/);
assert.match(siegeSrc, /visibilitychange/);
assert.match(siegeSrc, /stopSiegePolling/);
assert.match(siegeSrc, /scheduleNextSiegePoll/);
assert.match(siegeSrc, /applyAttackResponse/);
assert.match(siegeSrc, /ATTACK_MIN_INTERVAL_MS = 350/);
assert.match(siegeSrc, /siege-attack-link/);
assert.match(siegeSrc, /lastOwnDamage/);
assert.match(siegeSrc, /renderScheduleHeader/);
assert.match(siegeSrc, /data\.startsAt/);
assert.match(siegeSrc, /data\.endsAt/);
assert.match(siegeHtml, /\/assets\/gorod\.png/);
assert.match(siegeHtml, /Початок:/);
assert.match(siegeHtml, /Кінець:/);
assert.match(siegeHtml, /siege-start-time/);
assert.match(siegeHtml, /siege-end-time/);
assert.doesNotMatch(siegeHtml, /l2-siege-btn/);
assert.doesNotMatch(siegeHtml, /l2-siege-panel/);
assert.match(siegeHtml, /l2-siege-wap/);
assert.match(siegeCss, /\.l2-siege-time-label[\s\S]*#bfa88a/);
assert.match(siegeCss, /\.l2-siege-time-value[\s\S]*#ffffff/);
assert.match(siegeCss, /overflow-x:\s*hidden/);
assert.match(siegeCss, /flex-wrap:\s*wrap/);
assert.doesNotMatch(citySrc, /Захоплення міста/);
assert.doesNotMatch(citySrc, /Облога міста/);
assert.match(citySrc, /\/siege\.html\?cityId=/);
assert.match(citySrc, /loadSiegeCityOwner/);
assert.match(citySrc, /\/game\/siege\//);
assert.match(citySrc, /ownerClan/);
assert.match(citySrc, /Немає/);
assert.match(cityHtml, /city-siege-owner-line/);
assert.match(cityHtml, /l2-town-miru-loc-owner-label/);
assert.match(cityHtml, /Під владою клану/);
assert.match(cityCss, /\.l2-town-miru-loc-link[\s\S]*#ffffff/);
assert.match(cityCss, /\.l2-town-miru-loc-owner-label[\s\S]*#bfa88a/);
assert.match(cityCss, /\.l2-town-miru-loc-owner-name[\s\S]*#ffffff/);
assert.match(
  citySrc,
  /l2dop_oren[\s\S]*l2dop_giran[\s\S]*l2dop_aden[\s\S]*l2dop_goddard[\s\S]*l2dop_rune[\s\S]*l2dop_gludio[\s\S]*l2dop_dion[\s\S]*l2dop_schuttgart/
);

assert.equal(resolvePollDelay({ state: 'active' }), 4000);
assert.equal(resolvePollDelay({ state: 'scheduled' }), 60000);
assert.equal(resolvePollDelay({ state: 'finished' }), 0);

console.log('clan-siege-client-smoke: OK');
