/**
 * Raid boss drop tables — D 20 + tiered 21–39 + C/B/A/S grade RB bands.
 * npm run test:rb20-enchant-scroll-drops
 */
import assert from 'node:assert/strict';
import { customNpcDropBagForMob } from '../src/data/l2dopRaidBossDropPatches.js';
import {
  RB_21_39_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables21_39.js';
import {
  RB_40_51_BOSS_COUNT,
  RB_40_51_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables40_51.js';
import {
  RB_52_60_BOSS_COUNT,
  RB_52_60_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables52_60.js';
import {
  RB_61_75_BOSS_COUNT,
  RB_61_75_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables61_75.js';
import {
  RB_76_87_BOSS_COUNT,
  RB_76_87_NPC_IDS,
} from '../src/data/l2dopRaidBossDropTables76_87.js';
import {
  RB_DROP_TIER_21_26,
  RB_DROP_TIER_28_34,
  RB_DROP_TIER_35_39,
} from '../src/data/l2dopRaidBossDropShared.js';
import {
  RB_DROP_TIER_40_44,
  RB_DROP_TIER_45_49,
  RB_DROP_TIER_50_51,
} from '../src/data/l2dopRaidBossDropSharedC.js';
import {
  RB_DROP_TIER_52_54,
  RB_DROP_TIER_55_57,
  RB_DROP_TIER_58_60,
} from '../src/data/l2dopRaidBossDropSharedB.js';
import {
  RB_DROP_TIER_61_66,
  RB_DROP_TIER_67_71,
  RB_DROP_TIER_72_75,
} from '../src/data/l2dopRaidBossDropSharedA.js';
import {
  RB_DROP_TIER_76_79,
  RB_DROP_TIER_80_84,
  RB_DROP_TIER_85_87,
  RB_S_BONUS_WEAPON_CHANCE,
} from '../src/data/l2dopRaidBossDropSharedS.js';
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

function assertTierScrollsC(
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
  const armor = findScrollDrop(bag!.drops, 910512)!;
  const weapon = findScrollDrop(bag!.drops, 910513)!;
  assert.equal(armor.chance, tier.armorScrollChance / 100);
  assert.equal(weapon.chance, tier.weaponScrollChance / 100);
  assert.equal(armor.min, tier.armorScrollMin);
  assert.equal(armor.max, tier.armorScrollMax);
  assert.equal(weapon.min, tier.weaponScrollMin);
  assert.equal(weapon.max, tier.weaponScrollMax);
}

function assertNoDGradeScrolls(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId)!;
  assert.equal(findScrollDrop(bag.drops, 910510), undefined, `${npcId}: D armor scroll`);
  assert.equal(findScrollDrop(bag.drops, 910511), undefined, `${npcId}: D weapon scroll`);
}

function assertRb40_51Structure(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const itemLines = bag!.drops.filter((d) => d.kind !== 'adena');
  assert.ok(itemLines.length >= 5 && itemLines.length <= 8, `${npcId}: drop line count ${itemLines.length}`);
  assert.ok(findScrollDrop(bag!.drops, 910512), `${npcId}: C armor scroll missing`);
  assert.ok(findScrollDrop(bag!.drops, 910513), `${npcId}: C weapon scroll missing`);
  assertNoDGradeScrolls(npcId);
  const chances = itemLines.map((d) => d.chance);
  assert.ok(chances.every((c) => c > 0 && c <= 1), `${npcId}: invalid chances`);
}

function assertTierScrollsB(
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
  const armor = findScrollDrop(bag!.drops, 910514)!;
  const weapon = findScrollDrop(bag!.drops, 910515)!;
  assert.equal(armor.chance, tier.armorScrollChance / 100);
  assert.equal(weapon.chance, tier.weaponScrollChance / 100);
  assert.equal(armor.min, tier.armorScrollMin);
  assert.equal(armor.max, tier.armorScrollMax);
  assert.equal(weapon.min, tier.weaponScrollMin);
  assert.equal(weapon.max, tier.weaponScrollMax);
}

function assertNoCGradeScrolls(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId)!;
  assert.equal(findScrollDrop(bag.drops, 910512), undefined, `${npcId}: C armor scroll`);
  assert.equal(findScrollDrop(bag.drops, 910513), undefined, `${npcId}: C weapon scroll`);
}

function assertRb52_60Structure(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const itemLines = bag!.drops.filter((d) => d.kind !== 'adena');
  assert.ok(itemLines.length >= 4 && itemLines.length <= 9, `${npcId}: drop line count ${itemLines.length}`);
  assert.ok(findScrollDrop(bag!.drops, 910514), `${npcId}: B armor scroll missing`);
  assert.ok(findScrollDrop(bag!.drops, 910515), `${npcId}: B weapon scroll missing`);
  assertNoDGradeScrolls(npcId);
  assertNoCGradeScrolls(npcId);
  const chances = itemLines.map((d) => d.chance);
  assert.ok(chances.every((c) => c > 0 && c <= 1), `${npcId}: invalid chances`);
}

function assertNoBGradeScrolls(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId)!;
  assert.equal(findScrollDrop(bag.drops, 910514), undefined, `${npcId}: B armor scroll`);
  assert.equal(findScrollDrop(bag.drops, 910515), undefined, `${npcId}: B weapon scroll`);
}

function assertTierScrollsA(
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
  const armor = findScrollDrop(bag!.drops, 910516)!;
  const weapon = findScrollDrop(bag!.drops, 910517)!;
  assert.equal(armor.chance, tier.armorScrollChance / 100);
  assert.equal(weapon.chance, tier.weaponScrollChance / 100);
  assert.equal(armor.min, tier.armorScrollMin);
  assert.equal(armor.max, tier.armorScrollMax);
  assert.equal(weapon.min, tier.weaponScrollMin);
  assert.equal(weapon.max, tier.weaponScrollMax);
}

function assertRb61_75Structure(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const itemLines = bag!.drops.filter((d) => d.kind !== 'adena');
  assert.ok(itemLines.length >= 4 && itemLines.length <= 9, `${npcId}: drop line count ${itemLines.length}`);
  assert.ok(findScrollDrop(bag!.drops, 910516), `${npcId}: A armor scroll missing`);
  assert.ok(findScrollDrop(bag!.drops, 910517), `${npcId}: A weapon scroll missing`);
  assertNoDGradeScrolls(npcId);
  assertNoCGradeScrolls(npcId);
  assertNoBGradeScrolls(npcId);
  const chances = itemLines.map((d) => d.chance);
  assert.ok(chances.every((c) => c > 0 && c <= 1), `${npcId}: invalid chances`);
}

function assertNoAGradeScrolls(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId)!;
  assert.equal(findScrollDrop(bag.drops, 910516), undefined, `${npcId}: A armor scroll`);
  assert.equal(findScrollDrop(bag.drops, 910517), undefined, `${npcId}: A weapon scroll`);
}

function assertTierScrollsS(
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
  const armor = findScrollDrop(bag!.drops, 910518)!;
  const weapon = findScrollDrop(bag!.drops, 910519)!;
  assert.equal(armor.chance, tier.armorScrollChance / 100);
  assert.equal(weapon.chance, tier.weaponScrollChance / 100);
  assert.equal(armor.min, tier.armorScrollMin);
  assert.equal(armor.max, tier.armorScrollMax);
  assert.equal(weapon.min, tier.weaponScrollMin);
  assert.equal(weapon.max, tier.weaponScrollMax);
}

function assertRb76_87Structure(npcId: number): void {
  const bag = customNpcDropBagForMob(npcId);
  assert.ok(bag, `npc ${npcId} must have custom drop bag`);
  const itemLines = bag!.drops.filter((d) => d.kind !== 'adena');
  assert.ok(itemLines.length >= 4 && itemLines.length <= 10, `${npcId}: drop line count ${itemLines.length}`);
  assert.ok(findScrollDrop(bag!.drops, 910518), `${npcId}: S armor scroll missing`);
  assert.ok(findScrollDrop(bag!.drops, 910519), `${npcId}: S weapon scroll missing`);
  assertNoDGradeScrolls(npcId);
  assertNoCGradeScrolls(npcId);
  assertNoBGradeScrolls(npcId);
  assertNoAGradeScrolls(npcId);
  const chances = itemLines.map((d) => d.chance);
  assert.ok(chances.every((c) => c > 0 && c <= 1), `${npcId}: invalid chances`);
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

  assert.equal(RB_40_51_BOSS_COUNT, 42, 'expected 42 RB 40–51 entries');
  for (const npcId of RB_40_51_NPC_IDS) {
    assertRb40_51Structure(npcId);
  }

  assertTierScrollsC(25208, RB_DROP_TIER_40_44);
  assertTierScrollsC(25260, RB_DROP_TIER_45_49);
  assertTierScrollsC(25119, RB_DROP_TIER_50_51);

  const ateka = customNpcDropBagForMob(25208)!;
  assert.equal(ateka.drops.find((d) => d.l2ItemId === 283)?.chance, 0.04);
  assert.equal(ateka.drops.find((d) => d.l2ItemId === 917)?.chance, 0.06);

  const panathen = customNpcDropBagForMob(25192)!;
  assert.equal(panathen.drops.find((d) => d.l2ItemId === 107)?.chance, 0.06);
  assert.equal(panathen.drops.find((d) => d.l2ItemId === 119), undefined);

  const verfa = customNpcDropBagForMob(25050)!;
  assert.equal(verfa.drops.find((d) => d.l2ItemId === 855)?.chance, 0.09);
  assert.equal(verfa.drops.find((d) => d.l2ItemId === 885)?.chance, 0.1);

  assert.equal(RB_52_60_BOSS_COUNT, 35, 'expected 35 RB 52–60 entries');
  for (const npcId of RB_52_60_NPC_IDS) {
    assertRb52_60Structure(npcId);
  }

  assertTierScrollsB(25496, RB_DROP_TIER_52_54);
  assertTierScrollsB(25434, RB_DROP_TIER_55_57);
  assertTierScrollsB(25162, RB_DROP_TIER_58_60);

  const pingolpin = customNpcDropBagForMob(25496)!;
  assert.equal(pingolpin.drops.find((d) => d.l2ItemId === 7891)?.chance, 0.03);
  assert.equal(pingolpin.drops.find((d) => d.l2ItemId === 928)?.chance, 0.04);

  const chaosGolem = customNpcDropBagForMob(25512)!;
  assert.equal(chaosGolem.drops.find((d) => d.l2ItemId === 2380)?.chance, 0.06);
  assert.equal(chaosGolem.drops.find((d) => d.l2ItemId === 110)?.chance, 0.05);

  const marpanak = customNpcDropBagForMob(25162)!;
  assert.equal(marpanak.drops.find((d) => d.l2ItemId === 358)?.chance, 0.07);
  assert.equal(marpanak.drops.find((d) => d.l2ItemId === 2380)?.chance, 0.08);

  const sirra = customNpcDropBagForMob(29056)!;
  assert.equal(sirra.drops.find((d) => d.l2ItemId === 860)?.chance, 0.07);
  assert.equal(sirra.drops.find((d) => d.l2ItemId === 891)?.chance, 0.08);

  assert.equal(RB_61_75_BOSS_COUNT, 40, 'expected 40 RB 61–75 entries');
  for (const npcId of RB_61_75_NPC_IDS) {
    assertRb61_75Structure(npcId);
  }

  assertTierScrollsA(25423, RB_DROP_TIER_61_66);
  assertTierScrollsA(25263, RB_DROP_TIER_67_71);
  assertTierScrollsA(25235, RB_DROP_TIER_72_75);

  const timiniel = customNpcDropBagForMob(25423)!;
  assert.equal(timiniel.drops.find((d) => d.l2ItemId === 900207)?.chance, 0.025);
  assert.equal(timiniel.drops.find((d) => d.l2ItemId === 933)?.chance, 0.035);

  const hekaton = customNpcDropBagForMob(25140)!;
  assert.equal(hekaton.drops.find((d) => d.l2ItemId === 388)?.chance, 0.05);
  assert.equal(hekaton.drops.find((d) => d.l2ItemId === 862)?.chance, 0.045);

  const decarbia = customNpcDropBagForMob(25266)!;
  assert.equal(decarbia.drops.find((d) => d.l2ItemId === 6323)?.chance, 0.055);
  assert.equal(decarbia.drops.find((d) => d.l2ItemId === 6324)?.chance, 0.065);

  assert.equal(RB_76_87_BOSS_COUNT, 23, 'expected 23 RB 76–87 entries');
  for (const npcId of RB_76_87_NPC_IDS) {
    assertRb76_87Structure(npcId);
  }

  assertTierScrollsS(25205, RB_DROP_TIER_76_79);
  assertTierScrollsS(25286, RB_DROP_TIER_80_84);
  assertTierScrollsS(25319, RB_DROP_TIER_85_87);

  const ashakiel = customNpcDropBagForMob(25205)!;
  assert.equal(ashakiel.drops.find((d) => d.l2ItemId === 20171)?.chance, 0.02);
  assert.equal(ashakiel.drops.find((d) => d.l2ItemId === 920)?.chance, 0.03);

  const burningGiant = customNpcDropBagForMob(25524)!;
  assert.equal(burningGiant.drops.find((d) => d.l2ItemId === 6374)?.chance, 0.04);

  const gordon = customNpcDropBagForMob(29095)!;
  assert.equal(gordon.drops.find((d) => d.l2ItemId === 6374)?.chance, 0.05);
  assert.equal(gordon.drops.find((d) => d.l2ItemId === 6376)?.chance, 0.06);

  const ember = customNpcDropBagForMob(25319)!;
  assert.equal(ember.drops.find((d) => d.l2ItemId === 20173)?.chance, 0.04);
  assert.equal(ember.drops.find((d) => d.l2ItemId === 20167)?.chance, RB_S_BONUS_WEAPON_CHANCE / 100);

  console.log('test:rb20-enchant-scroll-drops OK');
}

run();
