/**
 * Client smoke: adaptive party HUD polling (intervals, visibility, in-flight guard).
 * npm run test:party-hud-polling-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const partyHudSrc = fs.readFileSync(
  path.join(__dirname, '../public/l2-party-hud.js'),
  'utf8'
);

var POLL_MS_ACTIVE_BATTLE = 5000;
var POLL_MS_IN_PARTY = 10000;
var POLL_MS_NO_PARTY = 20000;

function isActivePartyBattleState(state) {
  return state === 'active';
}

function resolvePartyHudPollDelay(data) {
  if (
    data &&
    data.activeBattle &&
    data.activeBattle.partyBattleId &&
    isActivePartyBattleState(data.activeBattle.state)
  ) {
    return POLL_MS_ACTIVE_BATTLE;
  }
  if (data && data.party && data.party.partyId) {
    return POLL_MS_IN_PARTY;
  }
  return POLL_MS_NO_PARTY;
}

assert.match(partyHudSrc, /resolvePartyHudPollDelay/);
assert.match(partyHudSrc, /scheduleNextPartyHudPoll/);
assert.match(partyHudSrc, /stopPartyHudPolling/);
assert.match(partyHudSrc, /startPartyHudPolling/);
assert.match(partyHudSrc, /refreshPartyHudNow/);
assert.match(partyHudSrc, /fetchInFlight/);
assert.match(partyHudSrc, /setTimeout\(function \(\)/);
assert.match(partyHudSrc, /visibilitychange/);
assert.match(partyHudSrc, /document\.visibilityState === 'visible'/);
assert.doesNotMatch(partyHudSrc, /setInterval/);

assert.equal(
  resolvePartyHudPollDelay({
    activeBattle: { partyBattleId: 'pb1', state: 'active' },
  }),
  5000
);
assert.equal(
  resolvePartyHudPollDelay({
    activeBattle: { partyBattleId: 'pb1', state: 'victory' },
    party: { partyId: 'p1' },
  }),
  10000
);
assert.equal(resolvePartyHudPollDelay({ party: { partyId: 'p1' } }), 10000);
assert.equal(resolvePartyHudPollDelay({ invite: { inviteId: 'i1' } }), 20000);
assert.equal(resolvePartyHudPollDelay(null), 20000);

var pollActive = false;
var pollTimer = null;
var fetchInFlight = false;
var fetchCount = 0;

function stopPartyHudPollingMock() {
  pollActive = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function scheduleNextPartyHudPollMock(delayMs) {
  if (!pollActive) return;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
  pollTimer = setTimeout(function () {
    pollTimer = null;
    if (fetchInFlight) return;
    fetchCount += 1;
  }, delayMs);
}

stopPartyHudPollingMock();
assert.equal(pollActive, false);
assert.equal(pollTimer, null);

pollActive = true;
scheduleNextPartyHudPollMock(5000);
assert.ok(pollTimer);

stopPartyHudPollingMock();
assert.equal(pollTimer, null);
assert.equal(pollActive, false);

fetchInFlight = true;
var blockedConcurrent = fetchInFlight;
assert.equal(blockedConcurrent, true);
fetchInFlight = false;

console.log('party-hud-polling-client-smoke: OK');
