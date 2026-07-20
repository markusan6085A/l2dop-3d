/**
 * Level-20 raid bosses — D-grade enchant scroll bundle drops.
 * npm run test:rb20-enchant-scroll-drops
 */
import assert from 'node:assert/strict';
import { customNpcDropBagForMob } from '../src/data/l2dopRaidBossDropPatches.js';
import type { DropEntry } from '../src/types/combatDrop.js';

const RB20_NPC_IDS = [25372, 25375, 25378] as const;

function findScrollDrop(
  drops: DropEntry[],
  itemId: number
): DropEntry | undefined {
  return drops.find((d) => d.l2ItemId === itemId);
}

function rollInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function rollDropLine(d: DropEntry): number {
  const p = d.chancePerMillion != null ? d.chancePerMillion / 1_000_000 : d.chance;
  if (!Number.isFinite(p) || p <= 0) return 0;
  if (Math.random() >= p) return 0;
  return rollInt(Math.max(0, d.min), Math.max(d.min, d.max));
}

function assertDropBag(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);

  const armor = findScrollDrop(bag!.drops, 910510);
  const weapon = findScrollDrop(bag!.drops, 910511);
  assert.ok(armor, `${npcId}: armor scroll drop line missing`);
  assert.ok(weapon, `${npcId}: weapon scroll drop line missing`);

  assert.equal(armor!.displayName, 'Сувій заточення броні D-grade');
  assert.equal(weapon!.displayName, 'Сувій заточення зброї D-grade');
  assert.equal(armor!.chance, 0.15);
  assert.equal(weapon!.chance, 0.08);
  assert.equal(armor!.min, 3);
  assert.equal(armor!.max, 6);
  assert.equal(weapon!.min, 2);
  assert.equal(weapon!.max, 4);
  assert.equal(armor!.kind, 'resource');
  assert.equal(weapon!.kind, 'resource');
}

function assertIndependentRollBounds(): void {
  const bag = customNpcDropBagForMob(25372)!;
  const armor = findScrollDrop(bag.drops, 910510)!;
  const weapon = findScrollDrop(bag.drops, 910511)!;

  const originalRandom = Math.random;
  try {
    Math.random = () => 0;
    assert.equal(rollDropLine(armor), 3);
    assert.equal(rollDropLine(weapon), 2);

    let call = 0;
    Math.random = () => {
      call += 1;
      return call % 2 === 1 ? 0 : 0.999999;
    };
    const armorQty = rollDropLine(armor);
    const weaponQty = rollDropLine(weapon);
    assert.ok(armorQty >= 3 && armorQty <= 6, `armor qty ${armorQty}`);
    assert.ok(weaponQty >= 2 && weaponQty <= 4, `weapon qty ${weaponQty}`);
  } finally {
    Math.random = originalRandom;
  }
}

function run(): void {
  for (const npcId of RB20_NPC_IDS) {
    assertDropBag(npcId);
  }
  assertIndependentRollBounds();
  console.log('test:rb20-enchant-scroll-drops OK');
}

run();
