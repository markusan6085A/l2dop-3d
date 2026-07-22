import type { DropEntry, DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';

export interface RaidBossDropSpec {
  l2ItemId: number;
  displayName: string;
  iconUrl: string;
  /** Шанс одного рядка, % (незалежний roll). */
  chancePercent: number;
  minQuantity?: number;
  maxQuantity?: number;
  kind?: DropKind;
}

export function dropLine(npcId: number, spec: RaidBossDropSpec): DropEntry {
  const min = spec.minQuantity ?? 1;
  const max = spec.maxQuantity ?? min;
  return {
    id: `rb${npcId}_${spec.l2ItemId}`,
    kind: spec.kind ?? 'equipment',
    chance: spec.chancePercent / 100,
    min,
    max,
    l2ItemId: spec.l2ItemId,
    displayName: spec.displayName,
    iconUrl: spec.iconUrl,
  };
}

const W = '/icons/drops/weapon_d';
const A = '/icons/drops/arrom_d';
const J = '/icons/drops/earring_d';
const R = '/icons/drops/resours';

type ItemDef = Omit<RaidBossDropSpec, 'chancePercent'>;

function item(
  l2ItemId: number,
  displayName: string,
  iconUrl: string,
  kind: DropKind = 'equipment'
): ItemDef {
  return { l2ItemId, displayName, iconUrl, kind };
}

/** Канонічні D-grade предмети для таблиць дропу РБ. */
export const RB_DROP_ITEM = {
  atubaHammer: item(187, 'Atuba Hammer — булава', `${W}/atuba_hammer.jpg`),
  baguettesDualsword: item(
    261,
    "Baguette's Dualsword — dual sword",
    `${W}/baguette_s_dualsword.jpg`
  ),
  darkElvenBow: item(277, 'Dark Elven Bow — лук', `${W}/dark_elven_bow.jpg`),
  knightsSword: item(128, "Knight's Sword — меч", `${W}/knight_s_sword.jpg`),
  shilenKnife: item(241, 'Shilen Knife — кинжал', `${W}/shilen_knife.jpg`),
  tomahawk: item(86, 'Tomahawk — булава', `${W}/tomahawk.jpg`),
  tomeOfBlood: item(317, 'Tome of Blood — книга', `${W}/tome_of_blood.jpg`),
  tripleEdgedJamadhr: item(
    260,
    'Triple-Edged Jamadhr — кастети',
    `${W}/triple-edged_jamadhr.jpg`
  ),
  twoHandedSword: item(
    124,
    'Two-Handed Sword — двуручний меч',
    `${W}/two_handed_sword.jpg`
  ),
  warHammer: item(293, 'War Hammer', `${W}/war_hammer.jpg`),
  glovesOfKnowledge: item(2447, 'Gloves Of Knowledge', `${A}/gloves_of_knowledge.jpg`),
  knowledHelmet: item(41, 'Knowled Helmet', `${A}/knowled_helmet.jpg`),
  knowledgeBots: item(2423, 'Knowledge Bots', `${A}/knowledge_bots.jpg`),
  mithrilBots: item(62, 'Mithril Bots', `${A}/mithril_bots.jpg`),
  mithrilBreastplate: item(58, 'Mithril Breastplate', `${A}/mithril_breastplate.jpg`),
  mithrilGaiters: item(59, 'Mithril Gaiters', `${A}/mithril_gaiters.jpg`),
  mithrilHelmet: item(499, 'Mithril Helmet', `${A}/mithril_helmet.jpg`),
  mithriGloves: item(61, 'Mithri Gloves', `${A}/mithri_gloves.jpg`),
  reinforcedGloves: item(720, 'Reinforced Gloves', `${A}/reinforced_gloves.jpg`),
  reinforcedHelmet: item(44, 'Reinforced Helmet', `${A}/reinforced_helmet.jpg`),
  reinforcedLeatherBoots: item(
    2422,
    'Reinforced Leather Boots',
    `${A}/reinforced_leather_boots.jpg`
  ),
  reinforcedLeatherShirt: item(
    394,
    'Reinforced Leather Shirt',
    `${A}/reinforced_leather_shirt.jpg`
  ),
  reinforcedLeathrGaiters: item(
    416,
    'Reinforced Leathr Gaiters',
    `${A}/reinforced_leathr_gaiters.jpg`
  ),
  stockingsOfKnowledge: item(
    469,
    'Stockings Of Knowledge',
    `${A}/stockings_of_knowledge.jpg`
  ),
  tunicOfKnowledge: item(436, 'Tunic Of Knowledge', `${A}/tunic_of_knowledge.jpg`),
  bronzeShield: item(626, 'Bronze Shield', `${A}/shield_bronze_shield_i00_0.jpg`),
  hoplon: item(628, 'Hoplon', `${A}/shield_hoplon_i00_0.jpg`),
  plateShield: item(2494, 'Plate Shield', `${A}/shield_plate_shield_i00_0.jpg`),
  blackPearlRing: item(
    880,
    'Accessary Black Pearl Ring I00',
    `${J}/accessary_black_pearl_ring_i00.png`
  ),
  elvenEaring: item(
    850,
    'Accessary Elven Earing I00',
    `${J}/accessary_elven_earing_i00.png`
  ),
  elvenNecklace: item(
    913,
    'Accessary Elven Necklace I00',
    `${J}/accessary_elven_necklace_i00.png`
  ),
  elvenRing: item(
    881,
    'Accessary Elven Ring I00',
    `${J}/accessary_elven_ring_i00.png`
  ),
  enchantedEaring: item(
    848,
    'Accessary Enchanted Earing I00',
    `${J}/accessary_enchanted_earing_i00.png`
  ),
  enchantedNecklace: item(
    911,
    'Accessary Enchanted Necklace I00',
    `${J}/accessary_enchanted_necklace_i00.png`
  ),
  enchantedRing: item(
    879,
    'Accessary Enchanted Ring I00',
    `${J}/accessary_enchanted_ring_i00.png`
  ),
  mithrilRing: item(
    882,
    'Accessary Mithril Ring I00',
    `${J}/accessary_mithril_ring_i00.png`
  ),
  nearForestNecklace: item(
    912,
    'Accessary Near Forest Necklace I00',
    `${J}/accessary_near_forest_necklace_i00.png`
  ),
  necklaceOfDarkness: item(
    914,
    'Accessary Necklace Of Darkness I00',
    `${J}/accessary_necklace_of_darkness_i00.png`
  ),
  necklaceOfDevotion: item(
    910,
    'Accessary Necklace Of Devotion I00',
    `${J}/accessary_necklace_of_devotion_i00.png`
  ),
  onyxbeastseyeEaring: item(
    851,
    'Accessary Onyxbeastseye Earing I00',
    `${J}/accessary_onyxbeastseye_earing_i00.png`
  ),
  redCresentEaring: item(
    847,
    'Accessary Red Cresent Earing I00',
    `${J}/accessary_red_cresent_earing_i00.png`
  ),
  ringOfDevotion: item(
    890,
    'Accessary Ring Of Devotion I00',
    `${J}/accessary_ring_of_devotion_i00.png`
  ),
  tigerseyeEaring: item(
    849,
    'Accessary Tigerseye Earing I00',
    `${J}/accessary_tigerseye_earing_i00.png`
  ),
} as const satisfies Record<string, ItemDef>;

export type RbDropItemKey = keyof typeof RB_DROP_ITEM;
export type RbJewelrySlot = 'necklace' | 'earring' | 'ring';

export interface RbDropTierChances {
  weapon: number;
  mainArmor: number;
  minorArmor: number;
  necklace: number;
  earring: number;
  ring: number;
  armorScrollChance: number;
  armorScrollMin: number;
  armorScrollMax: number;
  weaponScrollChance: number;
  weaponScrollMin: number;
  weaponScrollMax: number;
}

export const RB_DROP_TIER_21_26: RbDropTierChances = {
  weapon: 4,
  mainArmor: 7,
  minorArmor: 9,
  necklace: 6,
  earring: 7,
  ring: 8,
  armorScrollChance: 15,
  armorScrollMin: 3,
  armorScrollMax: 6,
  weaponScrollChance: 8,
  weaponScrollMin: 2,
  weaponScrollMax: 4,
};

export const RB_DROP_TIER_28_34: RbDropTierChances = {
  weapon: 5,
  mainArmor: 8,
  minorArmor: 10,
  necklace: 7,
  earring: 8,
  ring: 9,
  armorScrollChance: 18,
  armorScrollMin: 4,
  armorScrollMax: 7,
  weaponScrollChance: 10,
  weaponScrollMin: 3,
  weaponScrollMax: 5,
};

export const RB_DROP_TIER_35_39: RbDropTierChances = {
  weapon: 6,
  mainArmor: 9,
  minorArmor: 11,
  necklace: 8,
  earring: 9,
  ring: 10,
  armorScrollChance: 20,
  armorScrollMin: 5,
  armorScrollMax: 8,
  weaponScrollChance: 12,
  weaponScrollMin: 3,
  weaponScrollMax: 6,
};

export interface RbBossDropPick {
  weapon: RbDropItemKey;
  mainArmor: RbDropItemKey;
  minorArmor: RbDropItemKey;
  jewelry: RbDropItemKey;
  jewelrySlot: RbJewelrySlot;
  /** D-grade щит; шанс у відсотках (зазвичай 6–8). */
  shield?: RbDropItemKey;
  shieldChancePercent?: number;
}

export function withChance(def: ItemDef, chancePercent: number): RaidBossDropSpec {
  return { ...def, chancePercent };
}

function enchantScrollDrops(tier: RbDropTierChances): RaidBossDropSpec[] {
  return [
    {
      l2ItemId: 910510,
      displayName: 'Сувій заточення броні D-grade',
      iconUrl: `${R}/scroll_enchant_armor_d.png`,
      chancePercent: tier.armorScrollChance,
      minQuantity: tier.armorScrollMin,
      maxQuantity: tier.armorScrollMax,
      kind: 'resource',
    },
    {
      l2ItemId: 910511,
      displayName: 'Сувій заточення зброї D-grade',
      iconUrl: `${R}/scroll_enchant_weapon_d.png`,
      chancePercent: tier.weaponScrollChance,
      minQuantity: tier.weaponScrollMin,
      maxQuantity: tier.weaponScrollMax,
      kind: 'resource',
    },
  ];
}

export function buildRbBossDropSpecs(
  tier: RbDropTierChances,
  pick: RbBossDropPick
): RaidBossDropSpec[] {
  const jewelryChance =
    pick.jewelrySlot === 'necklace'
      ? tier.necklace
      : pick.jewelrySlot === 'earring'
        ? tier.earring
        : tier.ring;
  const lines: RaidBossDropSpec[] = [
    withChance(RB_DROP_ITEM[pick.weapon], tier.weapon),
    withChance(RB_DROP_ITEM[pick.mainArmor], tier.mainArmor),
    withChance(RB_DROP_ITEM[pick.minorArmor], tier.minorArmor),
    withChance(RB_DROP_ITEM[pick.jewelry], jewelryChance),
  ];
  if (pick.shield != null && pick.shieldChancePercent != null) {
    lines.push(withChance(RB_DROP_ITEM[pick.shield], pick.shieldChancePercent));
  }
  return [...lines, ...enchantScrollDrops(tier)];
}

export function buildRbDropBag(
  npcId: number,
  tier: RbDropTierChances,
  pick: RbBossDropPick
): NpcDropBag {
  const specs = buildRbBossDropSpecs(tier, pick);
  const adena = raidBossAdenaDropEntry(npcId);
  return {
    drops: [
      ...(adena ? [adena] : []),
      ...specs.map((row) => dropLine(npcId, row)),
    ],
    spoil: [],
  };
}

export function buildRbDropBagFromSpecs(
  npcId: number,
  specs: readonly RaidBossDropSpec[],
  scrollSpecs?: readonly RaidBossDropSpec[]
): NpcDropBag {
  const scrolls = scrollSpecs ?? [];
  const adena = raidBossAdenaDropEntry(npcId);
  return {
    drops: [
      ...(adena ? [adena] : []),
      ...specs.map((row) => dropLine(npcId, row)),
      ...scrolls.map((row) => dropLine(npcId, row)),
    ],
    spoil: [],
  };
}

/** RB 20 lvl — фіксовані scroll bundles (окремо від tier 21–26). */
export const RB20_ENCHANT_SCROLL_DROPS: readonly RaidBossDropSpec[] = [
  {
    l2ItemId: 910510,
    displayName: 'Сувій заточення броні D-grade',
    iconUrl: `${R}/scroll_enchant_armor_d.png`,
    chancePercent: 15,
    minQuantity: 3,
    maxQuantity: 6,
    kind: 'resource',
  },
  {
    l2ItemId: 910511,
    displayName: 'Сувій заточення зброї D-grade',
    iconUrl: `${R}/scroll_enchant_weapon_d.png`,
    chancePercent: 8,
    minQuantity: 2,
    maxQuantity: 4,
    kind: 'resource',
  },
];
