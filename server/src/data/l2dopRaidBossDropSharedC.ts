import type { DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';
import {
  dropLine,
  type RbDropTierChances,
  type RbJewelrySlot,
  type RaidBossDropSpec,
} from './l2dopRaidBossDropShared.js';

const Wc = '/icons/drops/weapon_c';
const Ac = '/icons/drops/arrom_c';
const Jc = '/icons/drops/earring_c';
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

/** Канонічні C-grade предмети для таблиць дропу РБ 40–51. */
export const RB_DROP_ITEM_C = {
  akatLongBow: item(283, 'Akat Long Bow', `${Wc}/akat_long_bow.jpg`),
  battleAxe: item(160, 'Battle Axe', `${Wc}/battle_axe.jpg`),
  berserkerBlade: item(5286, 'Berserker Blade', `${Wc}/berserker_blade.jpg`),
  bigHammer: item(89, 'Big Hammer', `${Wc}/big_hammer.jpg`),
  crystalDagger: item(228, 'Crystal Dagger', `${Wc}/crystal_dagger.jpg`),
  darkScreamer: item(233, 'Dark Screamer', `${Wc}/dark_screamer.jpg`),
  demonsStaff: item(206, "Demon's Staff", `${Wc}/demon_s_staff.jpg`),
  dwarvenHammer: item(7897, 'Dwarven Hammer', `${Wc}/dwarven_hammer.jpg`),
  eclipticSword: item(7888, 'Ecliptic Sword', `${Wc}/ecliptic_sword.jpg`),
  eminenceBow: item(286, 'Eminence Bow', `${Wc}/eminence_bow.jpg`),
  fistedBlade: item(265, 'Fisted Blade', `${Wc}/fisted_blade.jpg`),
  greatPata: item(266, 'Great Pata', `${Wc}/great_pata.jpg`),
  heavyDoomAxe: item(194, 'Heavy Doom Axe', `${Wc}/heavy_doom_axe.jpg`),
  heavyDoomHammer: item(191, 'Heavy Doom Hammer', `${Wc}/heavy_doom_hammer.jpg`),
  heathensBook: item(326, "Heathen's Book", `${Wc}/heathens_book.jpg`),
  homunkulusSword: item(84, "Homunkulus's Sword", `${Wc}/homunkulus_s_sword.jpg`),
  knuckleDuster: item(4233, 'Knuckle Duster', `${Wc}/knuckle_duster.jpg`),
  orcishPoleaxe: item(299, 'Orcish Poleaxe', `${Wc}/orcish_poleaxe.jpg`),
  paagrioSword: item(7882, "Pa'agrio Sword", `${Wc}/pa_agrian_sword.jpg`),
  samuraiLongsword: item(135, 'Samurai Longsword', `${Wc}/samurai_longsword.jpg`),
  scorpion: item(301, 'Scorpion', `${Wc}/scorpion.jpg`),
  spellbookApprentice: item(99, "Apprentice's Spellbook", `${Wc}/apprentices_spellbook.jpg`),
  warAxe: item(162, 'War Axe', `${Wc}/war_axe.jpg`),
  widowMaker: item(303, 'Widow Maker', `${Wc}/widow_maker.jpg`),
  yaksaMace: item(2503, 'Yaksa Mace', `${Wc}/yaksa_mace.jpg`),
  platedLeatherArmor: item(398, 'Plated Leather Armor', `${Ac}/plated_leather_armor.jpg`),
  platedLeatherGaiters: item(418, 'Plated Leather Gaiters', `${Ac}/plated_leather_gaiters.jpg`),
  platedLeatherBoots: item(2431, 'Plated Leather Boots', `${Ac}/plated_leather_boots.jpg`),
  platedLeatherGloves: item(2455, 'Plated Leather Gloves', `${Ac}/plated_leather_gloves.jpg`),
  platedLeatherHelmet: item(20003, 'Plated Leather Helmet', `${Ac}/plated_leather_helmet.jpg`),
  karmianTunic: item(439, 'Karmian Tunic', `${Ac}/karmian_tunic.jpg`),
  karmianStockings: item(471, 'Karmian Stockings', `${Ac}/karmian_stockings.jpg`),
  karmianBots: item(2430, 'Karmian Bots', `${Ac}/karmian_bots.jpg`),
  karmianGloves: item(2454, 'Karmian Gloves', `${Ac}/karmian_gloves.jpg`),
  karmianHelmet: item(20002, 'Karmian Helmet', `${Ac}/karmian_helmet.jpg`),
  demonsTunic: item(441, "Demon's Tunic", `${Ac}/demon's_tunic.jpg`),
  demonsStockings: item(472, "Demon's Stockings", `${Ac}/demon's_stockings.jpg`),
  demonsBots: item(2435, "Demon's Bots", `${Ac}/demon's_bots.jpg`),
  demonsGloves: item(2459, "Demon's Gloves", `${Ac}/demon's_gloves.jpg`),
  demonsHelmet: item(20001, "Demon's Helmet", `${Ac}/demon's_helmet.jpg`),
  compositeShield: item(107, 'Composite Shield', `${Ac}/shield_composite_shield_i00_0.jpg`),
  fullPlateShield: item(2497, 'Full Plate Shield', `${Ac}/shield_full_plate_shield_i00_0.jpg`),
  necklaceOfMermaid: item(
    917,
    'Accessary Necklace Of Mermaid I00',
    `${Jc}/accessary_necklace_of_mermaid_i00.png`
  ),
  necklaceOfBinding: item(
    119,
    'Accessary Necklace Of Binding I00',
    `${Jc}/accessary_necklace_of_binding_i00.png`
  ),
  necklaceOfProtection: item(
    916,
    'Accessary Necklace Of Protection I00',
    `${Jc}/accessary_necklace_of_protection_i00.png`
  ),
  aquastoneNecklace: item(
    915,
    'Accessary Aquastone Necklace I00',
    `${Jc}/accessary_aquastone_necklace_i00.png`
  ),
  blessedNecklace: item(
    919,
    'Accessary Blessed Necklace I00',
    `${Jc}/accessary_blessed_necklace_i00.png`
  ),
  moonstoneEaring: item(
    852,
    'Accessary Moonstone Earing I00',
    `${Jc}/accessary_moonstone_earing_i00.png`
  ),
  earingOfBinding: item(
    854,
    'Accessary Earing Of Binding I00',
    `${Jc}/accessary_earing_of_binding_i00.png`
  ),
  blessedEaring: item(
    857,
    'Accessary Blessed Earing I00',
    `${Jc}/accessary_blessed_earing_i00.png`
  ),
  nassensEaring: item(
    855,
    'Accessary Nassens Earing I00',
    `${Jc}/accessary_nassens_earing_i00.png`
  ),
  earingOfProtection: item(
    853,
    'Accessary Earing Of Protection I00',
    `${Jc}/accessary_earing_of_protection_i00.png`
  ),
  ringOfAges: item(
    885,
    'Accessary Ring Of Ages I00',
    `${Jc}/accessary_ring_of_ages_i00.png`
  ),
  ringOfBinding: item(
    886,
    'Accessary Ring Of Binding I00',
    `${Jc}/accessary_ring_of_binding_i00.png`
  ),
  aquastoneRing: item(
    883,
    'Accessary Aquastone Ring I00',
    `${Jc}/accessary_aquastone_ring_i00.png`
  ),
  blessedRing: item(
    888,
    'Accessary Blessed Ring I00',
    `${Jc}/accessary_blessed_ring_i00.png`
  ),
  ringOfProtection: item(
    884,
    'Accessary Ring Of Protection I00',
    `${Jc}/accessary_ring_of_protection_i00.png`
  ),
} as const satisfies Record<string, ItemDef>;

export type RbDropItemCKey = keyof typeof RB_DROP_ITEM_C;

export interface RbDropTierChancesC extends RbDropTierChances {
  shield: number;
}

export const RB_DROP_TIER_40_44: RbDropTierChancesC = {
  weapon: 4,
  mainArmor: 7,
  minorArmor: 9,
  shield: 6,
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

export const RB_DROP_TIER_45_49: RbDropTierChancesC = {
  weapon: 5,
  mainArmor: 8,
  minorArmor: 10,
  shield: 7,
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

export const RB_DROP_TIER_50_51: RbDropTierChancesC = {
  weapon: 6,
  mainArmor: 9,
  minorArmor: 11,
  shield: 8,
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

export interface RbBossDropPickC {
  weapon: RbDropItemCKey;
  mainArmor: RbDropItemCKey;
  minorArmor: RbDropItemCKey;
  jewelry?: RbDropItemCKey;
  jewelrySlot?: RbJewelrySlot;
  shield?: RbDropItemCKey;
  jewelry2?: RbDropItemCKey;
  jewelry2Slot?: RbJewelrySlot;
}

function withChance(def: ItemDef, chancePercent: number): RaidBossDropSpec {
  return { ...def, chancePercent };
}

function jewelryChance(tier: RbDropTierChancesC, slot: RbJewelrySlot): number {
  if (slot === 'necklace') return tier.necklace;
  if (slot === 'earring') return tier.earring;
  return tier.ring;
}

function enchantScrollDropsC(tier: RbDropTierChancesC): RaidBossDropSpec[] {
  return [
    {
      l2ItemId: 910512,
      displayName: 'Сувій заточення броні C-grade',
      iconUrl: `${R}/scroll_enchant_armor_c.png`,
      chancePercent: tier.armorScrollChance,
      minQuantity: tier.armorScrollMin,
      maxQuantity: tier.armorScrollMax,
      kind: 'resource',
    },
    {
      l2ItemId: 910513,
      displayName: 'Сувій заточення зброї C-grade',
      iconUrl: `${R}/scroll_enchant_weapon_c.png`,
      chancePercent: tier.weaponScrollChance,
      minQuantity: tier.weaponScrollMin,
      maxQuantity: tier.weaponScrollMax,
      kind: 'resource',
    },
  ];
}

export function buildRbBossDropSpecsC(
  tier: RbDropTierChancesC,
  pick: RbBossDropPickC
): RaidBossDropSpec[] {
  const specs: RaidBossDropSpec[] = [
    withChance(RB_DROP_ITEM_C[pick.weapon], tier.weapon),
    withChance(RB_DROP_ITEM_C[pick.mainArmor], tier.mainArmor),
    withChance(RB_DROP_ITEM_C[pick.minorArmor], tier.minorArmor),
  ];
  if (pick.jewelry && pick.jewelrySlot) {
    specs.push(
      withChance(
        RB_DROP_ITEM_C[pick.jewelry],
        jewelryChance(tier, pick.jewelrySlot)
      )
    );
  }
  if (pick.shield) {
    specs.push(withChance(RB_DROP_ITEM_C[pick.shield], tier.shield));
  }
  if (pick.jewelry2 && pick.jewelry2Slot) {
    specs.push(
      withChance(
        RB_DROP_ITEM_C[pick.jewelry2],
        jewelryChance(tier, pick.jewelry2Slot)
      )
    );
  }
  specs.push(...enchantScrollDropsC(tier));
  return specs;
}

export function buildRbDropBagC(
  npcId: number,
  tier: RbDropTierChancesC,
  pick: RbBossDropPickC
): NpcDropBag {
  const specs = buildRbBossDropSpecsC(tier, pick);
  return {
    drops: [raidBossAdenaDropEntry(npcId), ...specs.map((row) => dropLine(npcId, row))],
    spoil: [],
  };
}
