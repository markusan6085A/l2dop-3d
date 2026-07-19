/**
 * Client smoke: party HUD revision signal → single snapshot refresh.
 * npm run test:party-hud-revision-client
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

function getCachedRevision(lastSnapshot, getCachedCharacter) {
  var snap = lastSnapshot;
  if (!snap && typeof getCachedCharacter === 'function') {
    snap = getCachedCharacter();
  }
  var rev = Number(snap && snap.revision);
  return Number.isFinite(rev) ? rev : 0;
}

function shouldRefreshSnapshot(serverRevision, cachedRevision) {
  var serverRev = Number(serverRevision);
  if (!Number.isFinite(serverRev)) return false;
  return serverRev > cachedRevision;
}

assert.match(partyHudSrc, /refreshSnapshotIfRevisionAhead/);
assert.match(partyHudSrc, /characterRevision/);
assert.match(partyHudSrc, /L2\.fetchSnapshot\(\)/);
assert.match(partyHudSrc, /shownRewardNoticeKeys/);
assert.match(partyHudSrc, /pendingPartyReward/);
assert.match(partyHudSrc, /resolvePartyHudPollDelay/);
assert.match(partyHudSrc, /scheduleNextPartyHudPoll/);
assert.doesNotMatch(partyHudSrc, /setInterval/);
assert.doesNotMatch(
  partyHudSrc,
  /if \(data\.rewardNotice && data\.rewardNotice\.partyBattleId\) \{\s*renderRewardNoticeRow/
);

assert.equal(getCachedRevision({ revision: 5 }), 5);
assert.equal(getCachedRevision(null, () => ({ revision: 9 })), 9);
assert.equal(getCachedRevision(null, () => null), 0);

assert.equal(shouldRefreshSnapshot(10, 9), true);
assert.equal(shouldRefreshSnapshot(9, 9), false);
assert.equal(shouldRefreshSnapshot(8, 9), false);
assert.equal(shouldRefreshSnapshot(undefined, 0), false);

console.log('party-hud-revision-client-smoke: OK');
