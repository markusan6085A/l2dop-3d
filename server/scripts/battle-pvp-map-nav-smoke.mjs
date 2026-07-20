/**
 * Regression smoke: clearPvpBattlePageContext must not reference outer spawnId.
 * npm run test:battle-pvp-map-nav
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const battleJsPath = path.join(__dirname, '..', 'public', 'battle.js');
const battleHtmlPath = path.join(__dirname, '..', 'public', 'battle.html');

const BATTLE_PAGE_CTX_KEY = 'l2dop_battle_page_ctx_v1';

function isPvpSpawnContext(spawnIdValue) {
  return String(spawnIdValue || '').indexOf('pvp:') === 0;
}

function createClearPvpBattlePageContextHarness() {
  var battlePageSpawnId = null;
  var storage = new Map();

  function clearPvpBattlePageContext(spawnIdValue) {
    var currentSpawnId =
      spawnIdValue != null ? String(spawnIdValue) : '';
    if (
      !isPvpSpawnContext(battlePageSpawnId) &&
      !isPvpSpawnContext(currentSpawnId)
    ) {
      return;
    }
    battlePageSpawnId = null;
    storage.delete(BATTLE_PAGE_CTX_KEY);
  }

  return {
    clearPvpBattlePageContext,
    setBattlePageSpawnId(value) {
      battlePageSpawnId = value;
    },
    getBattlePageSpawnId() {
      return battlePageSpawnId;
    },
    setSessionItem(key, value) {
      storage.set(key, value);
    },
    hasSessionItem(key) {
      return storage.has(key);
    },
  };
}

function assertBattleJsSourceContract() {
  const src = readFileSync(battleJsPath, 'utf8');
  assert.match(
    src,
    /function clearPvpBattlePageContext\(spawnIdValue\)/,
    'battle.js: clearPvpBattlePageContext must accept spawnIdValue'
  );
  assert.match(
    src,
    /clearPvpBattlePageContext\(spawnId\)/,
    'battle.js: goToMap must pass spawnId into clearPvpBattlePageContext'
  );
  const fnBodyMatch = src.match(
    /function clearPvpBattlePageContext\(spawnIdValue\)\s*\{([\s\S]*?)\n  \}/
  );
  assert.ok(fnBodyMatch, 'battle.js: clearPvpBattlePageContext body not found');
  assert.doesNotMatch(
    fnBodyMatch[1],
    /\bisPvpSpawnContext\s*\(\s*spawnId\s*\)/,
    'battle.js: clearPvpBattlePageContext must not reference bare spawnId'
  );

  const html = readFileSync(battleHtmlPath, 'utf8');
  assert.match(
    html,
    /battle\.js\?v=20260719siegeDeathFix1/,
    'battle.html cache bust must be 20260719siegeDeathFix1'
  );
}

function runBehaviorSmoke() {
  const h = createClearPvpBattlePageContextHarness();
  h.setBattlePageSpawnId('dense_test');
  h.setSessionItem(BATTLE_PAGE_CTX_KEY, '{"spawnId":"dense_test"}');

  assert.doesNotThrow(function () {
    h.clearPvpBattlePageContext('dense_test');
  });
  assert.equal(h.getBattlePageSpawnId(), 'dense_test');
  assert.equal(h.hasSessionItem(BATTLE_PAGE_CTX_KEY), true);

  h.setBattlePageSpawnId('pvp:character-id');
  h.setSessionItem(BATTLE_PAGE_CTX_KEY, '{"spawnId":"pvp:character-id"}');

  assert.doesNotThrow(function () {
    h.clearPvpBattlePageContext('pvp:character-id');
  });
  assert.equal(h.getBattlePageSpawnId(), null);
  assert.equal(h.hasSessionItem(BATTLE_PAGE_CTX_KEY), false);

  h.setBattlePageSpawnId(null);
  h.setSessionItem(BATTLE_PAGE_CTX_KEY, '{"spawnId":"pvp:character-id"}');

  assert.doesNotThrow(function () {
    h.clearPvpBattlePageContext('pvp:character-id');
  });
  assert.equal(h.hasSessionItem(BATTLE_PAGE_CTX_KEY), false);
}

assertBattleJsSourceContract();
runBehaviorSmoke();
console.log('battle-pvp-map-nav-smoke: OK');
