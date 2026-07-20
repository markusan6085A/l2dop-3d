import type { DropEntry, DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';

interface RaidBossDropSpec {
  l2ItemId: number;
  displayName: string;
  iconUrl: string;
  /** Шанс одного рядка, % (незалежний roll). */
  chancePercent: number;
  minQuantity?: number;
  maxQuantity?: number;
  kind?: DropKind;
}

function dropLine(npcId: number, spec: RaidBossDropSpec): DropEntry {
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

/** Спільний bundle-дроп D-grade enchant scrolls для РБ 20 lvl (25372/25375/25378). */
const RB20_ENCHANT_SCROLL_DROPS: readonly RaidBossDropSpec[] = [
  {
    l2ItemId: 910510,
    displayName: 'Сувій заточення броні D-grade',
    iconUrl: '/icons/drops/resours/scroll_enchant_armor_d.png',
    chancePercent: 15,
    minQuantity: 3,
    maxQuantity: 6,
    kind: 'resource',
  },
  {
    l2ItemId: 910511,
    displayName: 'Сувій заточення зброї D-grade',
    iconUrl: '/icons/drops/resours/scroll_enchant_weapon_d.png',
    chancePercent: 8,
    minQuantity: 2,
    maxQuantity: 4,
    kind: 'resource',
  },
];

/** Отверженный Стражник (25372): D-grade з магазину дропів — лише іконка + назва. */
const RB_25372_DROPS: readonly RaidBossDropSpec[] = [
  {
    l2ItemId: 128,
    displayName: "Knight's Sword — меч",
    iconUrl: '/icons/drops/weapon_d/knight_s_sword.jpg',
    chancePercent: 4,
  },
  {
    l2ItemId: 241,
    displayName: 'Shilen Knife — кинжал',
    iconUrl: '/icons/drops/weapon_d/shilen_knife.jpg',
    chancePercent: 6,
  },
  {
    l2ItemId: 277,
    displayName: 'Dark Elven Bow — лук',
    iconUrl: '/icons/drops/weapon_d/dark_elven_bow.jpg',
    chancePercent: 8,
  },
  {
    l2ItemId: 628,
    displayName: 'Hoplon',
    iconUrl: '/icons/drops/arrom_d/shield_hoplon_i00_0.jpg',
    chancePercent: 6,
  },
  {
    l2ItemId: 41,
    displayName: 'Knowled Helmet',
    iconUrl: '/icons/drops/arrom_d/knowled_helmet.jpg',
    chancePercent: 7,
  },
  {
    l2ItemId: 58,
    displayName: 'Mithril Breastplate',
    iconUrl: '/icons/drops/arrom_d/mithril_breastplate.jpg',
    chancePercent: 8,
  },
  {
    l2ItemId: 59,
    displayName: 'Mithril Gaiters',
    iconUrl: '/icons/drops/arrom_d/mithril_gaiters.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 2447,
    displayName: 'Gloves Of Knowledge',
    iconUrl: '/icons/drops/arrom_d/gloves_of_knowledge.jpg',
    chancePercent: 9,
  },
  {
    l2ItemId: 2423,
    displayName: 'Knowledge Bots',
    iconUrl: '/icons/drops/arrom_d/knowledge_bots.jpg',
    chancePercent: 12,
  },
  {
    l2ItemId: 913,
    displayName: 'Accessary Elven Necklace I00',
    iconUrl: '/icons/drops/earring_d/accessary_elven_necklace_i00.png',
    chancePercent: 11,
  },
  {
    l2ItemId: 850,
    displayName: 'Accessary Elven Earing I00',
    iconUrl: '/icons/drops/earring_d/accessary_elven_earing_i00.png',
    chancePercent: 8,
  },
  {
    l2ItemId: 880,
    displayName: 'Accessary Black Pearl Ring I00',
    iconUrl: '/icons/drops/earring_d/accessary_black_pearl_ring_i00.png',
    chancePercent: 11,
  },
];

const RB_25375_DROPS: readonly RaidBossDropSpec[] = [
  {
    l2ItemId: 187,
    displayName: 'Atuba Hammer — булава',
    iconUrl: '/icons/drops/weapon_d/atuba_hammer.jpg',
    chancePercent: 5,
  },
  {
    l2ItemId: 293,
    displayName: 'War Hammer',
    iconUrl: '/icons/drops/weapon_d/war_hammer.jpg',
    chancePercent: 7,
  },
  {
    l2ItemId: 86,
    displayName: 'Tomahawk — булава',
    iconUrl: '/icons/drops/weapon_d/tomahawk.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 628,
    displayName: 'Hoplon',
    iconUrl: '/icons/drops/arrom_d/shield_hoplon_i00_0.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 499,
    displayName: 'Mithril Helmet',
    iconUrl: '/icons/drops/arrom_d/mithril_helmet.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 394,
    displayName: 'Reinforced Leather Shirt',
    iconUrl: '/icons/drops/arrom_d/reinforced_leather_shirt.jpg',
    chancePercent: 5,
  },
  {
    l2ItemId: 416,
    displayName: 'Reinforced Leathr Gaiters',
    iconUrl: '/icons/drops/arrom_d/reinforced_leathr_gaiters.jpg',
    chancePercent: 6,
  },
  {
    l2ItemId: 61,
    displayName: 'Mithri Gloves',
    iconUrl: '/icons/drops/arrom_d/mithri_gloves.jpg',
    chancePercent: 12,
  },
  {
    l2ItemId: 62,
    displayName: 'Mithril Bots',
    iconUrl: '/icons/drops/arrom_d/mithril_bots.jpg',
    chancePercent: 9,
  },
  {
    l2ItemId: 911,
    displayName: 'Accessary Enchanted Necklace I00',
    iconUrl: '/icons/drops/earring_d/accessary_enchanted_necklace_i00.png',
    chancePercent: 11,
  },
  {
    l2ItemId: 912,
    displayName: 'Accessary Near Forest Necklace I00',
    iconUrl: '/icons/drops/earring_d/accessary_near_forest_necklace_i00.png',
    chancePercent: 8,
  },
  {
    l2ItemId: 848,
    displayName: 'Accessary Enchanted Earing I00',
    iconUrl: '/icons/drops/earring_d/accessary_enchanted_earing_i00.png',
    chancePercent: 14,
  },
  {
    l2ItemId: 851,
    displayName: 'Accessary Onyxbeastseye Earing I00',
    iconUrl: '/icons/drops/earring_d/accessary_onyxbeastseye_earing_i00.png',
    chancePercent: 12,
  },
  {
    l2ItemId: 881,
    displayName: 'Accessary Elven Ring I00',
    iconUrl: '/icons/drops/earring_d/accessary_elven_ring_i00.png',
    chancePercent: 8,
  },
  {
    l2ItemId: 879,
    displayName: 'Accessary Enchanted Ring I00',
    iconUrl: '/icons/drops/earring_d/accessary_enchanted_ring_i00.png',
    chancePercent: 7,
  },
];

const RB_25378_DROPS: readonly RaidBossDropSpec[] = [
  {
    l2ItemId: 260,
    displayName: 'Triple-Edged Jamadhr — кастети',
    iconUrl: '/icons/drops/weapon_d/triple-edged_jamadhr.jpg',
    chancePercent: 14,
  },
  {
    l2ItemId: 261,
    displayName: "Baguette's Dualsword — dual sword",
    iconUrl: '/icons/drops/weapon_d/baguette_s_dualsword.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 317,
    displayName: 'Tome of Blood — книга',
    iconUrl: '/icons/drops/weapon_d/tome_of_blood.jpg',
    chancePercent: 13,
  },
  {
    l2ItemId: 2494,
    displayName: 'Plate Shield',
    iconUrl: '/icons/drops/arrom_d/shield_plate_shield_i00_0.jpg',
    chancePercent: 15,
  },
  {
    l2ItemId: 44,
    displayName: 'Reinforced Helmet',
    iconUrl: '/icons/drops/arrom_d/reinforced_helmet.jpg',
    chancePercent: 12,
  },
  {
    l2ItemId: 436,
    displayName: 'Tunic Of Knowledge',
    iconUrl: '/icons/drops/arrom_d/tunic_of_knowledge.jpg',
    chancePercent: 8,
  },
  {
    l2ItemId: 469,
    displayName: 'Stockings Of Knowledge',
    iconUrl: '/icons/drops/arrom_d/stockings_of_knowledge.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 720,
    displayName: 'Reinforced Gloves',
    iconUrl: '/icons/drops/arrom_d/reinforced_gloves.jpg',
    chancePercent: 11,
  },
  {
    l2ItemId: 2422,
    displayName: 'Reinforced Leather Boots',
    iconUrl: '/icons/drops/arrom_d/reinforced_leather_boots.jpg',
    chancePercent: 9,
  },
  {
    l2ItemId: 914,
    displayName: 'Accessary Necklace Of Darkness I00',
    iconUrl: '/icons/drops/earring_d/accessary_necklace_of_darkness_i00.png',
    chancePercent: 11,
  },
  {
    l2ItemId: 910,
    displayName: 'Accessary Necklace Of Devotion I00',
    iconUrl: '/icons/drops/earring_d/accessary_necklace_of_devotion_i00.png',
    chancePercent: 7,
  },
  {
    l2ItemId: 847,
    displayName: 'Accessary Red Cresent Earing I00',
    iconUrl: '/icons/drops/earring_d/accessary_red_cresent_earing_i00.png',
    chancePercent: 8,
  },
  {
    l2ItemId: 849,
    displayName: 'Accessary Tigerseye Earing I00',
    iconUrl: '/icons/drops/earring_d/accessary_tigerseye_earing_i00.png',
    chancePercent: 6,
  },
  {
    l2ItemId: 882,
    displayName: 'Accessary Mithril Ring I00',
    iconUrl: '/icons/drops/earring_d/accessary_mithril_ring_i00.png',
    chancePercent: 7,
  },
  {
    l2ItemId: 890,
    displayName: 'Accessary Ring Of Devotion I00',
    iconUrl: '/icons/drops/earring_d/accessary_ring_of_devotion_i00.png',
    chancePercent: 4,
  },
];

function rb20DropBag(npcId: number, equipment: readonly RaidBossDropSpec[]): NpcDropBag {
  return {
    drops: [
      raidBossAdenaDropEntry(npcId),
      ...equipment.map((row) => dropLine(npcId, row)),
      ...RB20_ENCHANT_SCROLL_DROPS.map((row) => dropLine(npcId, row)),
    ],
    spoil: [],
  };
}

const RAID_BOSS_DROP_BAG_BY_NPC_ID: Readonly<Record<number, NpcDropBag>> = {
  25372: rb20DropBag(25372, RB_25372_DROPS),
  25375: rb20DropBag(25375, RB_25375_DROPS),
  25378: rb20DropBag(25378, RB_25378_DROPS),
};

export function customNpcDropBagForMob(npcId: number): NpcDropBag | undefined {
  return RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId];
}

export function hasCustomNpcDropBag(npcId: number | null | undefined): boolean {
  return npcId != null && RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId] !== undefined;
}
