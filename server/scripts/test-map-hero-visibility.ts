/**
 * Map hero visibility (city vs open field).
 * npm run test:map-hero-visibility
 */
import assert from 'node:assert/strict';
import { getCityHubTeleportDestination } from '../src/data/mapLocalities.js';
import { isCharacterVisibleOnWorldMap } from '../src/domain/mapHeroWorldVisibility.js';

function ok(name: string): void {
  console.log('  ✓ ' + name);
}

const hub = getCityHubTeleportDestination('l2dop_giran');
assert.ok(hub, 'giran hub');

assert.equal(
  isCharacterVisibleOnWorldMap({
    worldX: hub!.worldX,
    worldY: hub!.worldY,
    dungeonStateJson: null,
  }),
  false
);
ok('city hub coords hidden from world map');

assert.equal(
  isCharacterVisibleOnWorldMap({
    worldX: hub!.worldX + 25_000,
    worldY: hub!.worldY + 25_000,
    dungeonStateJson: null,
  }),
  true
);
ok('open field far from hub visible');

console.log('\ntest-map-hero-visibility: OK');
