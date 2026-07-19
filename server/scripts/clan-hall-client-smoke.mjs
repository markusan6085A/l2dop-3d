/**
 * Client smoke: clan hall UI level 0 + active bonus display.
 * npm run test:clan-hall-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hallHtml = fs.readFileSync(
  path.join(__dirname, '../public/clan-hall.html'),
  'utf8'
);
const hallJs = fs.readFileSync(
  path.join(__dirname, '../public/clan-hall.js'),
  'utf8'
);

assert.match(hallHtml, /clan-hall-clan-level/);
assert.match(hallHtml, /clan-hall-active-none/);
assert.match(hallHtml, /clan-hall-active-stats/);
assert.match(hallHtml, /Рівень клану:/);
assert.match(hallHtml, /Активний бонус:/);
assert.match(hallHtml, /20260719clanHallLevel1/);

assert.match(hallJs, /renderStatus/);
assert.match(hallJs, /hall\.clanLevel != null \? String\(hall\.clanLevel\) : '0'/);
assert.match(hallJs, /hall\.activeBonus/);
assert.match(hallJs, /row\.level === clanLevel/);
assert.match(hallJs, /l2-clan-hall-stats__row--achieved/);
assert.doesNotMatch(hallJs, /row\.level <= clanLevel/);
assert.doesNotMatch(hallJs, /clanLevel \|\| 1/);
assert.doesNotMatch(hallJs, /level \|\| 1/);

console.log('clan-hall-client-smoke: OK');
