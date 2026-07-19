/**
 * Aggregated clan UI layout stability smoke.
 * npm run test:clan-ui
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '../public');

const clanCommonCss = fs.readFileSync(
  path.join(root, 'css/l2-clan-common.css'),
  'utf8'
);
const clanUiJs = fs.readFileSync(path.join(root, 'l2-clan-ui.js'), 'utf8');
const siegeJs = fs.readFileSync(path.join(root, 'siege.js'), 'utf8');
const clanTasksJs = fs.readFileSync(path.join(root, 'clan-tasks.js'), 'utf8');
const dragonJs = fs.readFileSync(path.join(root, 'dragon-dungeon.js'), 'utf8');
const siegeCss = fs.readFileSync(path.join(root, 'css/l2-siege-page.css'), 'utf8');

const pages = [
  'city.html',
  'siege.html',
  'clan-tasks.html',
  'dragon-dungeon.html',
];

pages.forEach(function (page) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  assert.match(html, /l2-clan-common\.css/, page + ' must include l2-clan-common.css');
});

assert.match(clanCommonCss, /\.l2-clan-page/);
assert.match(clanCommonCss, /\.l2-clan-card/);
assert.match(clanCommonCss, /\.l2-clan-row/);
assert.match(clanCommonCss, /\.l2-clan-label/);
assert.match(clanCommonCss, /\.l2-clan-value/);
assert.match(clanCommonCss, /\.l2-clan-actions/);
assert.match(clanCommonCss, /\.l2-clan-loading/);
assert.match(clanCommonCss, /prefers-reduced-motion/);

assert.match(clanUiJs, /participantsFingerprint/);
assert.match(clanUiJs, /setBusyButton/);

assert.match(siegeJs, /patchActiveBody/);
assert.match(siegeJs, /buildActiveBody/);
assert.match(siegeJs, /patchScheduledBody/);
assert.match(siegeJs, /dataset\.siegeBuilt/);
assert.doesNotMatch(siegeJs, /\[Зачекайте…\]/);

assert.match(clanTasksJs, /dataset\.built/);
assert.match(clanTasksJs, /dataset\.tasksKey/);
assert.match(clanTasksJs, /patchActiveTaskCard/);
assert.match(clanTasksJs, /setBusyTaskButton/);
assert.doesNotMatch(clanTasksJs, /Зачекайте…/);

assert.match(dragonJs, /patchActiveDungeon/);
assert.match(dragonJs, /dataset\.built/);
assert.match(dragonJs, /ensureDragonImg/);
assert.match(dragonJs, /width = 170/);

assert.match(siegeCss, /tabular-nums/);
assert.match(siegeCss, /min-height:\s*8rem/);

console.log('clan-ui-smoke: OK');
