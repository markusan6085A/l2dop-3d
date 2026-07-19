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
const citySrc = fs.readFileSync(
  path.join(__dirname, '../public/city.js'),
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
assert.match(siegeHtml, /\/assets\/gorod\.png/);
assert.doesNotMatch(siegeHtml, /l2-siege-btn/);
assert.doesNotMatch(siegeHtml, /l2-siege-panel/);
assert.match(siegeHtml, /l2-siege-wap/);
assert.doesNotMatch(citySrc, /Захоплення міста/);
assert.doesNotMatch(citySrc, /Облога міста/);
assert.match(citySrc, /\/siege\.html\?cityId=/);

assert.equal(resolvePollDelay({ state: 'active' }), 4000);
assert.equal(resolvePollDelay({ state: 'scheduled' }), 60000);
assert.equal(resolvePollDelay({ state: 'finished' }), 0);

console.log('clan-siege-client-smoke: OK');
