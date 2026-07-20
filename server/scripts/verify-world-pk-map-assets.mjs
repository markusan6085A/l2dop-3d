/**
 * Post-deploy smoke: map.html references world PK renderer assets.
 * npm run verify:world-pk-map-assets
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const publicDir = path.join(repoRoot, 'server/public');
const expectedVersion = '20260720worldPkList1';

const mapHtmlPath = path.join(publicDir, 'map.html');
const mapJsPath = path.join(publicDir, 'map.js');
const renderJsPath = path.join(publicDir, 'mapHeroRowRender.js');
const swJsPath = path.join(publicDir, 'sw.js');

assert.ok(fs.existsSync(mapHtmlPath), 'server/public/map.html must exist');
assert.ok(fs.existsSync(mapJsPath), 'server/public/map.js must exist');
assert.ok(fs.existsSync(renderJsPath), 'server/public/mapHeroRowRender.js must exist');

const mapHtml = fs.readFileSync(mapHtmlPath, 'utf8');
assert.match(
  mapHtml,
  new RegExp('mapHeroRowRender\\.js\\?v=' + expectedVersion),
  'map.html must reference mapHeroRowRender.js with expected cache-bust'
);
assert.match(
  mapHtml,
  new RegExp('map\\.js\\?v=' + expectedVersion),
  'map.html must reference map.js with expected cache-bust'
);

const renderJs = fs.readFileSync(renderJsPath, 'utf8');
assert.match(renderJs, /renderHeroList/, 'mapHeroRowRender.js must export renderHeroList');

const swJs = fs.readFileSync(swJsPath, 'utf8');
assert.match(
  swJs,
  new RegExp("GAME_CACHE_VERSION = '" + expectedVersion + "'"),
  'sw.js cache version must match map asset cache-bust'
);

console.log('verify-world-pk-map-assets: OK (' + expectedVersion + ')');
