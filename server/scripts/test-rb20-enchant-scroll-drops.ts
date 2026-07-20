/**
 * Raid boss D-grade drop tables — level 20 bundles + tiered 21–39 tables.
 * npm run test:rb20-enchant-scroll-drops
 */
import assert from 'node:assert/strict';
import { customNpcDropBagForMob } from '../src/data/l2dopRaidBossDropPatches.js';
import {
  RB_21_39_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables21_39.js';
import {
  RB_DROP_TIER_21_26,
  RB_DROP_TIER_28_34,
  RB_DROP_TIER_35_39,
} from '../src/data/l2dopRaidBossDropShared.js';
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

function assertRb20ScrollBag(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);

  const armor = findScrollDrop(bag!.drops, 910510);
  const weapon = findScrollDrop(bag!.drops, 910511);
  assert.ok(armor, `${npcId}: armor scroll drop line missing`);
  assert.ok(weapon, `${npcId}: weapon scroll drop line missing`);

  assert.equal(armor!.chance, 0.15);
  assert.equal(weapon!.chance, 0.08);
  assert.equal(armor!.min, 3);
  assert.equal(armor!.max, 6);
  assert.equal(weapon!.min, 2);
  assert.equal(weapon!.max, 4);
}

function assertTierScrolls(
  npcId: number,
  tier: {
    armorScrollChance: number;
    armorScrollMin: number;
    armorScrollMax: number;
    weaponScrollChance: number;
    weaponScrollMin: number;
    weaponScrollMax: number;
  }
): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const armor = findScrollDrop(bag!.drops, 910510)!;
  const weapon = findScrollDrop(bag!.drops, 910511)!;
  assert.equal(armor.chance, tier.armorScrollChance / 100);
  assert.equal(weapon.chance, tier.weaponScrollChance / 100);
  assert.equal(armor.min, tier.armorScrollMin);
  assert.equal(armor.max, tier.armorScrollMax);
  assert.equal(weapon.min, tier.weaponScrollMin);
  assert.equal(weapon.max, tier.weaponScrollMax);
}

function assertRb21_39Structure(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const itemLines = bag!.drops.filter((d) => d.kind !== 'adena');
  assert.equal(itemLines.length, 6, `${npcId}: expected 4 equipment + 2 scroll lines`);
  const chances = itemLines.map((d) => d.chance).sort((a, b) => a - b);
  assert.ok(chances.every((c) => c > 0 && c <= 1), `${npcId}: invalid chances`);
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
    assertRb20ScrollBag(npcId);
  }

  assert.equal(RB_21_39_NPC_IDS.length, 54, 'expected 54 RB 21–39 entries');
  for (const npcId of RB_21_39_NPC_IDS) {
    assertRb21_39Structure(npcId);
  }

  assertTierScrolls(25357, RB_DROP_TIER_21_26);
  assertTierScrolls(25272, RB_DROP_TIER_28_34);
  assertTierScrolls(25398, RB_DROP_TIER_35_39);

  const tier21 = customNpcDropBagForMob(25357)!;
  const weaponLine = tier21.drops.find((d) => d.l2ItemId === 241);
  assert.equal(weaponLine?.chance, 0.04);

  const tier34 = customNpcDropBagForMob(25272)!;
  const chestLine = tier34.drops.find((d) => d.l2ItemId === 58);
  assert.equal(chestLine?.chance, 0.08);

  const tier39 = customNpcDropBagForMob(25082)!;
  const ringLine = tier39.drops.find((d) => d.l2ItemId === 882);
  assert.equal(ringLine?.chance, 0.1);

  assertIndependentRollBounds();
  console.log('test:rb20-enchant-scroll-drops OK');
}

run();
