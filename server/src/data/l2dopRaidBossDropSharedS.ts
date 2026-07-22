import type { DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';
import {
  dropLine,
  type RbDropTierChances,
  type RbJewelrySlot,
  type RaidBossDropSpec,
} from './l2dopRaidBossDropShared.js';

const Ws = '/icons/drops/weapon_s';
const As = '/icons/drops/arrom_s';
const Js = '/icons/drops/earring_s';
const R = '/icons/drops/resours';

/** Другий weapon-roll на топ РБ 85–87 (решта S-зброї). */
export const RB_S_BONUS_WEAPON_CHANCE = 2;

type ItemDef = Omit<RaidBossDropSpec, 'chancePercent'>;

function item(
  l2ItemId: number,
  displayName: string,
  iconUrl: string,
  kind: DropKind = 'equipment'
): ItemDef {
  return { l2ItemId, displayName, iconUrl, kind };
}

/** Канонічні S-grade предмети для таблиць дропу РБ 76–87. */
export const RB_DROP_ITEM_S = {
  apprenticesSpellbook: item(910201, "Apprentice's Spellbook", `${Ws}/apprentices_spellbook.jpg`),
  angelSlayer: item(6367, 'Angel Slayer', `${Ws}/angel_slayer.jpg`),
  arcanaMace: item(6579, 'Arcana Mace', `${Ws}/arcana_mace.jpg`),
  baguettesDualsword: item(910202, "Baguette's Dualsword", `${Ws}/baguette_s_dualsword.jpg`),
  basaltBattlehammer: item(6365, 'Basalt Battlehammer', `${Ws}/basalt_battlehammer.jpg`),
  demonSplinter: item(6371, 'Demon Splinter', `${Ws}/demon_splinter.jpg`),
  draconicBow: item(7575, 'Draconic Bow', `${Ws}/draconic_bow.jpg`),
  dragonHunterAxe: item(6369, 'Dragon Hunter Axe', `${Ws}/dragon_hunter_axe.jpg`),
  godsBlade: item(82, "God's Blade", `${Ws}/god_s_blade.jpg`),
  heavensDivider: item(6372, "Heaven's Divider", `${Ws}/heaven_s_divider.jpg`),
  imperialStaff: item(6366, 'Imperial Staff', `${Ws}/imperial_staff.jpg`),
  saintSpear: item(6370, 'Saint Spear', `${Ws}/saint_spear.jpg`),
  shiningBow: item(6368, 'Shining Bow', `${Ws}/shining_bow.jpg`),
  imperialCrusaderBreastplate: item(
    6373,
    'Imperial Crusader Breastplate',
    `${As}/imperial_crusader_breastplate.jpg`
  ),
  /** Штани Imperial Crusader (canonical slot: legs). */
  imperialCrusaderGaiters: item(
    6374,
    'Imperial Crusader Gaiters',
    `${As}/bound_imperial_crusader.jpg`
  ),
  imperialCrusaderGauntlets: item(
    6375,
    'Imperial Crusader Gauntlets',
    `${As}/imperial_crusader_gauntlets.jpg`
  ),
  imperialCrusaderBoots: item(6376, 'Imperial Crusader Boots', `${As}/bound_imperial_boots.jpg`),
  imperialCrusaderShield: item(
    6377,
    'Imperial Crusader Shield',
    `${As}/imperial_crusader_shield.jpg`
  ),
  imperialCrusaderHelmet: item(
    6378,
    'Imperial Crusader Helmet',
    `${As}/imperial_crusader_helmet.jpg`
  ),
  draconicLeatherArmor: item(
    6379,
    'Draconic Leather Armor',
    `${As}/draconic_leather_armor.jpg`
  ),
  draconicLeatherGloves: item(
    6380,
    'Draconic Leather Gloves',
    `${As}/draconic_leather_gloves.jpg`
  ),
  draconicLeatherBoots: item(6381, 'Draconic Leather Boots', `${As}/draconic_leather_boots.jpg`),
  draconicLeatherHelmet: item(
    6382,
    'Draconic Leather Helmet',
    `${As}/draconic_leather_helmet.jpg`
  ),
  majorArcanaRobe: item(6383, 'Major Arcana Robe', `${As}/major_arcana_robe.jpg`),
  majorArcanaGloves: item(6384, 'Major Arcana Gloves', `${As}/major_arcana_gloves.jpg`),
  majorArcanaBoots: item(6385, 'Major Arcana Boots', `${As}/major_arcana_boots.jpg`),
  majorArcanaCirclet: item(6386, 'Major Arcana Circlet', `${As}/major_arcana_circlet.jpg`),
  tateossianNecklace: item(
    920,
    'Accessory Tateossian Necklace I00',
    `${Js}/accessory_tateossian_necklace_i00.png`
  ),
  tateossianEarring: item(
    858,
    'Accessory Tateossian Earring I00',
    `${Js}/accessory_tateossian_earring_i00.png`
  ),
  tateossianRing: item(
    889,
    'Accessory Tateossian Ring I00',
    `${Js}/accessory_tateossian_ring_i00.png`
  ),
} as const satisfies Record<string, ItemDef>;

export type RbDropItemSKey = keyof typeof RB_DROP_ITEM_S;

export interface RbDropTierChancesS extends RbDropTierChances {
  shield: number;
  leggings: number;
}

export const RB_DROP_TIER_76_79: RbDropTierChancesS = {
  weapon: 2,
  mainArmor: 3.5,
  minorArmor: 5,
  leggings: 4,
  shield: 3.5,
  necklace: 3,
  earring: 4,
  ring: 5,
  armorScrollChance: 12,
  armorScrollMin: 3,
  armorScrollMax: 6,
  weaponScrollChance: 5,
  weaponScrollMin: 2,
  weaponScrollMax: 4,
};

export const RB_DROP_TIER_80_84: RbDropTierChancesS = {
  weapon: 3,
  mainArmor: 4.5,
  minorArmor: 6,
  leggings: 5,
  shield: 4.5,
  necklace: 4,
  earring: 5,
  ring: 6,
  armorScrollChance: 16,
  armorScrollMin: 4,
  armorScrollMax: 7,
  weaponScrollChance: 7,
  weaponScrollMin: 3,
  weaponScrollMax: 5,
};

export const RB_DROP_TIER_85_87: RbDropTierChancesS = {
  weapon: 4,
  mainArmor: 6,
  minorArmor: 7.5,
  leggings: 6.5,
  shield: 6,
  necklace: 5,
  earring: 6,
  ring: 7,
  armorScrollChance: 20,
  armorScrollMin: 5,
  armorScrollMax: 8,
  weaponScrollChance: 10,
  weaponScrollMin: 3,
  weaponScrollMax: 6,
};

export interface RbBossDropPickS {
  weapon: RbDropItemSKey;
  weapon2?: RbDropItemSKey;
  mainArmor?: RbDropItemSKey;
  minorArmor?: RbDropItemSKey;
  minorArmor2?: RbDropItemSKey;
  leggings?: RbDropItemSKey;
  shield?: RbDropItemSKey;
  jewelry?: RbDropItemSKey;
  jewelrySlot?: RbJewelrySlot;
  jewelry2?: RbDropItemSKey;
  jewelry2Slot?: RbJewelrySlot;
}

function withChance(def: ItemDef, chancePercent: number): RaidBossDropSpec {
  return { ...def, chancePercent };
}

function jewelryChance(tier: RbDropTierChancesS, slot: RbJewelrySlot): number {
  if (slot === 'necklace') return tier.necklace;
  if (slot === 'earring') return tier.earring;
  return tier.ring;
}

function enchantScrollDropsS(tier: RbDropTierChancesS): RaidBossDropSpec[] {
  return [
    {
      l2ItemId: 910518,
      displayName: 'Сувій заточення броні S-grade',
      iconUrl: `${R}/scroll_enchant_armor_s.png`,
      chancePercent: tier.armorScrollChance,
      minQuantity: tier.armorScrollMin,
      maxQuantity: tier.armorScrollMax,
      kind: 'resource',
    },
    {
      l2ItemId: 910519,
      displayName: 'Сувій заточення зброї S-grade',
      iconUrl: `${R}/scroll_enchant_weapon_s.png`,
      chancePercent: tier.weaponScrollChance,
      minQuantity: tier.weaponScrollMin,
      maxQuantity: tier.weaponScrollMax,
      kind: 'resource',
    },
  ];
}

export function buildRbBossDropSpecsS(
  tier: RbDropTierChancesS,
  pick: RbBossDropPickS
): RaidBossDropSpec[] {
  const specs: RaidBossDropSpec[] = [withChance(RB_DROP_ITEM_S[pick.weapon], tier.weapon)];
  if (pick.weapon2) {
    specs.push(withChance(RB_DROP_ITEM_S[pick.weapon2], RB_S_BONUS_WEAPON_CHANCE));
  }
  if (pick.mainArmor) specs.push(withChance(RB_DROP_ITEM_S[pick.mainArmor], tier.mainArmor));
  if (pick.minorArmor) specs.push(withChance(RB_DROP_ITEM_S[pick.minorArmor], tier.minorArmor));
  if (pick.minorArmor2) {
    specs.push(withChance(RB_DROP_ITEM_S[pick.minorArmor2], tier.minorArmor));
  }
  if (pick.leggings) specs.push(withChance(RB_DROP_ITEM_S[pick.leggings], tier.leggings));
  if (pick.shield) specs.push(withChance(RB_DROP_ITEM_S[pick.shield], tier.shield));
  if (pick.jewelry && pick.jewelrySlot) {
    specs.push(withChance(RB_DROP_ITEM_S[pick.jewelry], jewelryChance(tier, pick.jewelrySlot)));
  }
  if (pick.jewelry2 && pick.jewelry2Slot) {
    specs.push(withChance(RB_DROP_ITEM_S[pick.jewelry2], jewelryChance(tier, pick.jewelry2Slot)));
  }
  specs.push(...enchantScrollDropsS(tier));
  return specs;
}

export function buildRbDropBagS(
  npcId: number,
  tier: RbDropTierChancesS,
  pick: RbBossDropPickS
): NpcDropBag {
  const specs = buildRbBossDropSpecsS(tier, pick);
  const adena = raidBossAdenaDropEntry(npcId);
  return {
    drops: [...(adena ? [adena] : []), ...specs.map((row) => dropLine(npcId, row))],
    spoil: [],
  };
}
