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

const mapHtmlPath = path.join(publicDir, 'map.html');
const mapJsPath = path.join(publicDir, 'map.js');
const renderJsPath = path.join(publicDir, 'mapHeroRowRender.js');
const swJsPath = path.join(publicDir, 'sw.js');

function readScriptVersion(html, scriptName) {
  const escaped = scriptName.replace(/\./g, '\\.');
  const re = new RegExp(escaped + '\\?v=([^"\'\\s>]+)');
  const match = html.match(re);
  assert.ok(
    match,
    'map.html must reference ' + scriptName + ' with ?v= cache-bust'
  );
  return match[1];
}

assert.ok(fs.existsSync(mapHtmlPath), 'server/public/map.html must exist');
assert.ok(fs.existsSync(mapJsPath), 'server/public/map.js must exist');
assert.ok(fs.existsSync(renderJsPath), 'server/public/mapHeroRowRender.js must exist');
assert.ok(fs.existsSync(swJsPath), 'server/public/sw.js must exist');

const mapHtml = fs.readFileSync(mapHtmlPath, 'utf8');
const rendererVersion = readScriptVersion(mapHtml, 'mapHeroRowRender.js');
const mapVersion = readScriptVersion(mapHtml, 'map.js');

const renderJs = fs.readFileSync(renderJsPath, 'utf8');
assert.match(renderJs, /renderHeroList/, 'mapHeroRowRender.js must export renderHeroList');

const swJs = fs.readFileSync(swJsPath, 'utf8');
const swMatch = swJs.match(/GAME_CACHE_VERSION = '([^']+)'/);
assert.ok(swMatch, 'sw.js must define GAME_CACHE_VERSION');
const swVersion = swMatch[1];
assert.ok(swVersion.length > 0, 'sw.js GAME_CACHE_VERSION must be non-empty');

console.log(
  'verify-world-pk-map-assets: OK (renderer=' +
    rendererVersion +
    ', map=' +
    mapVersion +
    ', sw=' +
    swVersion +
    ')'
);
