/**
 * Client smoke: clan tasks UI.
 * npm run test:clan-tasks-client
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, '../public/clan-tasks.html'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, '../public/clan-tasks.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '../public/css/l2-clan-tasks.css'), 'utf8');
const clanMyHtml = fs.readFileSync(path.join(__dirname, '../public/clan-my.html'), 'utf8');
const domainTs = fs.readFileSync(
  path.join(__dirname, '../src/domain/clanTasks.ts'),
  'utf8'
);

assert.match(html, /Кланові завдання/);
assert.match(html, /Алмази клану/);
assert.match(html, /clan-my\.html/);
assert.match(html, /clan-tasks-definitions/);
assert.match(html, /clan-tasks-active-list/);
assert.match(html, /ui-i18n\.js/);

assert.match(js, /\/game\/clan-tasks/);
assert.match(js, /takeInFlight/);
assert.match(js, /helpInFlight/);
assert.match(js, /claimInFlight/);
assert.match(js, /cancelInFlight/);
assert.match(js, /Допомогти/);
assert.match(js, /Завершити завдання/);
assert.match(js, /r\.status === 409/);
assert.doesNotMatch(js, /innerHTML\s*=/);
assert.doesNotMatch(js, /L2\.getToken/);
assert.doesNotMatch(js, /L2\.api\b/);
assert.doesNotMatch(js, /L2\.fetch\b/);
assert.doesNotMatch(js, /L2\.authFetch\b/);
assert.match(js, /L2\.token\s*\(/);
assert.match(js, /\/game\/clan-tasks/);
assert.match(js, /function init|async function init/);
assert.match(js, /DOMContentLoaded|document\.readyState/);
assert.match(js, /await loadView|loadView\(\)/);
assert.match(js, /r\.status === 401/);
assert.match(js, /login\.html/);

assert.match(clanMyHtml, /href="\/clan-tasks\.html"/);
assert.doesNotMatch(clanMyHtml, /clan_my_stub_quests/);

assert.match(html, /diamond-\.png/);
assert.match(js, /appendPersonalRewardLine/);
assert.match(js, /createPlayerProfileNickEl/);
assert.match(css, /l2-clan-tasks-personal-reward/);
assert.match(js, /appendMetaSpan/);
assert.match(js, /patchActiveTaskCard/);
assert.match(js, /dataset\.tasksKey/);
assert.match(js, /dataset\.defKey/);
assert.match(js, /setBusyTaskButton/);
assert.match(html, /clan-tasks-active-empty/);
assert.match(html, /l2-clan-common\.css/);
assert.match(html, /Завантаження…/);
assert.match(css, /l2-clan-tasks-meta/);
assert.match(js, /appendClanTasksDivider/);
assert.match(css, /l2-clan-tasks-divider/);
assert.match(css, /\.l2-clan-tasks-card \{\s*margin:[\s\S]*?padding: 0;/);

assert.match(domainTs, /target: 150_000/);
assert.match(domainTs, /target: 500/);
assert.match(domainTs, /clanRewardDiamonds: 3/);
assert.match(domainTs, /clanRewardDiamonds: 10/);

console.log('clan-tasks-client-smoke: OK');
