/**
 * Map radii canonical contract + client circle wiring.
 * npm run test:map-radii
 */
import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, '../.env') });

import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { BATTLE_RANGE } from '../src/domain/battleTypes.js';
import {
  MAP_NEARBY_HERO_RADIUS,
  MAP_NEARBY_LIST_RADIUS,
  MAP_WORLD_SPAWNS,
} from '../src/data/mapWorldSpawns.js';
import { getMapRadiiConfig } from '../src/domain/mapRadiiConfig.js';
import {
  isPartyMemberNearbyForReward,
  isWithinMobBattleRange,
} from '../src/domain/mapNearbyRadius.js';

const publicDir = path.resolve(__dirname, '../public');

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

function testServerRadii(): void {
  const radii = getMapRadiiConfig();
  assert.equal(radii.mobInteractionRadius, BATTLE_RANGE);
  assert.equal(radii.playerVisibilityRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(radii.partyRewardRadius, MAP_NEARBY_HERO_RADIUS);
  assert.equal(radii.pvpInteractionRadius, BATTLE_RANGE);
  assert.equal(MAP_NEARBY_LIST_RADIUS, BATTLE_RANGE);
  assert.equal(MAP_WORLD_SPAWNS.length, 33_037);
  ok('server mapRadii DTO (4 fields) + spawn count 33037');

  assert.equal(
    isWithinMobBattleRange({ worldX: 0, worldY: 0 }, { worldX: BATTLE_RANGE, worldY: 0 }),
    true
  );
  assert.equal(
    isWithinMobBattleRange(
      { worldX: 0, worldY: 0 },
      { worldX: BATTLE_RANGE + 1, worldY: 0 }
    ),
    false
  );
  ok('mob battle range boundary uses BATTLE_RANGE');

  const killer = { worldX: 0, worldY: 0, dungeonStateJson: null };
  const partyNear = { worldX: MAP_NEARBY_HERO_RADIUS, worldY: 0, dungeonStateJson: null };
  const partyFar = {
    worldX: MAP_NEARBY_HERO_RADIUS + 1,
    worldY: 0,
    dungeonStateJson: null,
  };
  assert.equal(isPartyMemberNearbyForReward(killer, partyNear), true);
  assert.equal(isPartyMemberNearbyForReward(killer, partyFar), false);
  ok('party reward radius unchanged (MAP_NEARBY_HERO_RADIUS)');
}

function loadMapJsTestApi() {
  const nodesById = new Map<string, Record<string, unknown>>();

  function createElement(tag: string) {
    const el: Record<string, unknown> = {
      tagName: String(tag || '').toUpperCase(),
      id: '',
      hidden: false,
      childNodes: [],
      children: [],
      dataset: {} as Record<string, string>,
      style: {} as Record<string, string>,
      classList: {
        _classes: new Set<string>(),
        add(cls: string) {
          String(cls || '')
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => this._classes.add(c));
        },
        remove(cls: string) {
          String(cls || '')
            .split(/\s+/)
            .filter(Boolean)
            .forEach((c) => this._classes.delete(c));
        },
        toggle(cls: string, force?: boolean) {
          if (force === true) this._classes.add(cls);
          else if (force === false) this._classes.delete(cls);
          else if (this._classes.has(cls)) this._classes.delete(cls);
          else this._classes.add(cls);
        },
      },
      setAttribute(name: string, value: unknown) {
        if (name === 'id') el.id = String(value);
        if (name === 'aria-hidden') el._ariaHidden = String(value);
        if (name === 'hidden') el.hidden = value != null;
      },
      addEventListener() {},
      appendChild(child: Record<string, unknown>) {
        (el.children as Record<string, unknown>[]).push(child);
        if (child.id) nodesById.set(String(child.id), child);
      },
    };
    return el;
  }

  const doc = {
    createElement,
    getElementById(id: string) {
      return nodesById.get(id) ?? null;
    },
  };

  const heroSection = createElement('section');
  heroSection.id = 'map-hero-section';
  heroSection.hidden = true;
  nodesById.set('map-hero-section', heroSection);

  const heroList = createElement('ul');
  heroList.id = 'map-hero-list';
  heroSection.appendChild(heroList);
  nodesById.set('map-hero-list', heroList);

  for (const id of [
    'map-load-err',
    'map-content',
    'map-stack',
    'map-mob-section',
    'map-viewport',
    'map-img',
    'map-dot',
    'map-view-radius',
    'map-hero-view-radius',
    'map-party-reward-radius',
    'map-radii-legend',
    'map-radii-legend-party',
    'map-hero-markers',
    'map-party-nearby',
    'map-move-target',
    'map-mob-markers',
    'map-npc-markers',
    'map-mob-list',
    'map-mob-pager',
    'map-mob-page-prev',
    'map-mob-page-next',
    'map-mob-page-ind',
    'map-list-mode-npc',
    'map-list-mode-mobs',
    'map-dungeon-enter',
    'map-dungeon-enter-link',
    'map-dungeon-enter-label',
    'map-mob-detail',
    'map-mob-detail-list',
    'map-back-to-map',
    'map-mob-detail-pager',
    'map-mob-detail-prev',
    'map-mob-detail-next',
    'map-mob-detail-ind',
  ]) {
    const el = createElement('div');
    el.id = id;
    nodesById.set(id, el);
  }

  const img = nodesById.get('map-img')!;
  img.naturalWidth = 1812;
  img.naturalHeight = 2620;

  const sandbox = {
    window: {
      __L2_MAP_SYNC_TEST_MODE: true,
      L2: {
        lastSnapshot() {
          return { revision: 1, level: 40, worldX: 83400, worldY: 147943 };
        },
        mergeMapStateIntoSnapshot() {},
        applyHudFromSnapshot() {},
        setLastSnapshot() {},
        applyPvpIncoming() {},
        readSessionSnapshotCache() {
          return null;
        },
        writeSessionSnapshotCache() {},
      },
      localStorage: {
        getItem() {
          return 'token';
        },
        setItem() {},
        removeItem() {},
      },
      sessionStorage: { getItem() { return null; }, setItem() {} },
      location: { href: '', replace() {} },
      addEventListener() {},
      requestAnimationFrame(fn: () => void) {
        fn();
        return 0;
      },
    },
    document: doc,
    console,
    setInterval() {
      return 0;
    },
    clearInterval() {},
    fetch() {
      return Promise.resolve({ ok: false, status: 404, json: async () => ({}) });
    },
    alert() {},
  };
  (sandbox as { globalThis: unknown }).globalThis = sandbox.window;
  (sandbox as { requestAnimationFrame: (fn: () => void) => number }).requestAnimationFrame =
    sandbox.window.requestAnimationFrame;
  (sandbox as { L2: unknown }).L2 = sandbox.window.L2;
  (sandbox as { localStorage: unknown }).localStorage = sandbox.window.localStorage;
  (sandbox as { sessionStorage: unknown }).sessionStorage = sandbox.window.sessionStorage;

  vm.runInNewContext(fs.readFileSync(path.join(publicDir, 'mapHeroRowRender.js'), 'utf8'), sandbox, {
    filename: path.join(publicDir, 'mapHeroRowRender.js'),
  });
  vm.runInNewContext(fs.readFileSync(path.join(publicDir, 'map.js'), 'utf8'), sandbox, {
    filename: path.join(publicDir, 'map.js'),
  });

  const api = (sandbox.window as { L2MapSyncTest?: Record<string, unknown> }).L2MapSyncTest;
  assert.ok(api, 'L2MapSyncTest must exist');
  return api!;
}

function testClientRadii(api: Record<string, (...args: unknown[]) => unknown>): void {
  const mobR = BATTLE_RANGE;
  const heroR = MAP_NEARBY_HERO_RADIUS;

  (api.applyMapSyncPayload as (sync: unknown, opts: unknown) => void)(
    {
      changed: false,
      mapCatalogVersion: 1,
      personalMapSig: 'sig',
      revision: 1,
      mapRadii: {
        mobInteractionRadius: mobR,
        playerVisibilityRadius: heroR,
        partyRewardRadius: heroR,
        pvpInteractionRadius: mobR,
      },
      mapState: {
        id: 'c1',
        revision: 1,
        worldX: 83400,
        worldY: 147943,
        targetX: 0,
        targetY: 0,
        level: 40,
        hp: 100,
        maxHp: 100,
        expBarCur: '0',
        expBarMax: '1',
        expBarPct: 0,
        name: 'Hero',
      },
      around: { nearbyHeroes: [], nearbySpawns: [], partyNearbyMembers: [] },
      spawns: [],
    },
    { force: false, centerOnPlayer: false }
  );

  const stored = api.getMapRadii() as Record<string, number>;
  assert.equal(stored.mobInteractionRadius, mobR);
  assert.equal(stored.playerVisibilityRadius, heroR);
  assert.equal(stored.partyRewardRadius, heroR);
  assert.equal(stored.pvpInteractionRadius, mobR);
  ok('client stores all mapRadii from sync');

  (api.paintRadiiAt as (x: number, y: number) => void)(83400, 147943);
  const yellow = api.getRadiusElementStyle('map-view-radius') as {
    hidden: boolean;
    left: string;
    top: string;
    width: string;
  };
  const red = api.getRadiusElementStyle('map-hero-view-radius') as {
    hidden: boolean;
    left: string;
    top: string;
    width: string;
  };
  assert.equal(yellow.hidden, false);
  assert.equal(red.hidden, false);
  assert.ok(parseFloat(yellow.width) > parseFloat(red.width), 'yellow > red on map pixels');
  ok('yellow circle uses mobInteractionRadius, red uses playerVisibilityRadius');

  (api.paintRadiiAt as (x: number, y: number) => void)(90000, 150000);
  const yellowMove = api.getRadiusElementStyle('map-view-radius') as { left: string; top: string };
  assert.notEqual(yellowMove.left, yellow.left);
  ok('radius circles re-center after move/teleport coords');

  (api.paintRadiiAt as (x: number, y: number) => void)(83400, 147943);
  const yellowAgain = api.getRadiusElementStyle('map-view-radius') as { sig: string };
  (api.paintRadiiAt as (x: number, y: number) => void)(83400, 147943);
  const yellowStable = api.getRadiusElementStyle('map-view-radius') as { sig: string };
  assert.equal(yellowStable.sig, yellowAgain.sig);
  ok('repeat paint with same coords does not flicker (radius sig stable)');
}

function main(): void {
  console.log('test-map-radii-smoke\n');
  testServerRadii();
  const api = loadMapJsTestApi();
  testClientRadii(api);
  console.log('\ntest-map-radii-smoke: OK');
}

main();
