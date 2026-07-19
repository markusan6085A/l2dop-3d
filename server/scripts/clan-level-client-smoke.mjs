/**
 * Client smoke: clan level page markers + inFlight guard.
 * npm run test:clan-level-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const levelHtml = fs.readFileSync(
  path.join(__dirname, '../public/clan-level.html'),
  'utf8'
);
const levelJs = fs.readFileSync(
  path.join(__dirname, '../public/clan-level.js'),
  'utf8'
);
const manageHtml = fs.readFileSync(
  path.join(__dirname, '../public/clan-manage.html'),
  'utf8'
);
const manageJs = fs.readFileSync(
  path.join(__dirname, '../public/clan-manage.js'),
  'utf8'
);
const myJs = fs.readFileSync(
  path.join(__dirname, '../public/clan-my.js'),
  'utf8'
);

assert.match(levelHtml, /Підвищення рівня клану/);
assert.match(levelHtml, /clan-level-current/);
assert.match(levelHtml, /clan-level-up-btn/);
assert.match(levelHtml, /clan-level-max-msg/);
assert.match(levelHtml, /clan-level-progression/);
assert.match(levelHtml, /20260719clanLevel1/);

assert.match(levelJs, /\/game\/clans\/level/);
assert.match(levelJs, /\/game\/clans\/level-up/);
assert.match(levelJs, /levelUpInFlight/);
assert.match(levelJs, /renderClanIdentity/);
assert.match(levelJs, /view\.clan\.level \?\? 0/);
assert.match(levelJs, /nextUpgrade\.canUpgrade/);
assert.match(levelJs, /clan-level-max-msg/);
assert.match(levelJs, /expectedClanLevel/);
assert.doesNotMatch(levelJs, /targetLevel\s*:/);

assert.match(manageHtml, /clan-manage-level-link/);
assert.match(manageHtml, /Підвищити рівень клану/);
assert.match(manageHtml, /clan-manage-level/);
assert.match(manageHtml, /clan-manage-points/);
assert.match(manageJs, /clan\.level \?\? 0/);
assert.match(manageJs, /canEditAnnouncement/);

assert.match(myJs, /clan\.level != null \? String\(clan\.level\) : '0'/);
assert.doesNotMatch(myJs, /clan\.level != null \? String\(clan\.level\) : '1'/);

console.log('clan-level-client-smoke: OK');
