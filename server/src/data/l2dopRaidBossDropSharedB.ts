import type { DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';
import {
  dropLine,
  type RbDropTierChances,
  type RbJewelrySlot,
  type RaidBossDropSpec,
} from './l2dopRaidBossDropShared.js';

const Wb = '/icons/drops/weapon_b';
const Ab = '/icons/drops/arrom_b';
const Jb = '/icons/drops/earring_b';
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

/** Канонічні B-grade предмети для таблиць дропу РБ 52–60. */
export const RB_DROP_ITEM_B = {
  apprenticesSpellbook: item(78, "Apprentice's Spellbook", `${Wb}/apprentices_spellbook.jpg`),
  artOfBattleAxe: item(7834, 'Art of Battle Axe', `${Wb}/art_of_battle_axe.jpg`),
  baguettesDualsword: item(7792, "Baguette's Dualsword", `${Wb}/baguette_s_dualsword.jpg`),
  bowOfPeril: item(7891, 'Bow of Peril', `${Wb}/bow_of_peril.jpg`),
  darkElvenLongBow: item(7890, 'Dark Elven Long Bow', `${Wb}/dark_elven_long_bow.jpg`),
  deadmansGlory: item(7791, "Deadman's Glory", `${Wb}/deadman_s_glory.jpg`),
  greatAxe: item(7894, 'Great Axe', `${Wb}/great_axe.jpg`),
  greatSword: item(7895, 'Great Sword', `${Wb}/great_sword.jpg`),
  guardianSword: item(7883, 'Guardian Sword', `${Wb}/guardian_sword.jpg`),
  hellKnife: item(7813, 'Hell Knife', `${Wb}/hell_knife.jpg`),
  iceStormHammer: item(7900, 'Ice Storm Hammer', `${Wb}/ice_storm_hammer.jpg`),
  kaimVanulsBones: item(8340, "Kaim Vanul's Bones", `${Wb}/kaim_vanul_s_bones.jpg`),
  kris: item(7783, 'Kris', `${Wb}/kris.jpg`),
  lance: item(7784, 'Lance', `${Wb}/lance.jpg`),
  spellBreaker: item(7892, 'Spell Breaker', `${Wb}/spell_breaker.jpg`),
  spiritsStaff: item(7889, "Spirit's Staff", `${Wb}/spirit_s_staff.jpg`),
  staffOfEvilSpirits: item(7896, 'Staff of Evil Spirits', `${Wb}/staff_of_evil_spirits.jpg`),
  starBuster: item(7901, 'Star Buster', `${Wb}/star_buster.jpg`),
  swordOfDamascus: item(79, 'Sword of Damascus', `${Wb}/sword_of_damascus.jpg`),
  swordOfValhalla: item(7722, 'Sword of Valhalla', `${Wb}/sword_of_valhalla.jpg`),
  wizardsTear: item(8336, "Wizard's Tear", `${Wb}/wizard_s_tear.jpg`),
  arthroNail: item(7788, 'Arthro Nail', `${Wb}/arthro_nail.jpg`),
  blueWolfBreastplate: item(358, 'Blue Wolf Breastplate', `${Ab}/blue_wolf_breastplate.jpg`),
  blueWolfGaiters: item(2380, 'Blue Wolf Gaiters', `${Ab}/blue_wolf_gaiters.jpg`),
  blueWolfHelmet: item(2416, 'Blue Wolf Helmet', `${Ab}/blue_wolf_helmet.jpg`),
  blueWolfBoots: item(2439, 'Blue Wolf Boots', `${Ab}/blue_wolf_boots.jpg`),
  blueWolfGloves: item(2487, 'Blue Wolf Gloves', `${Ab}/blue_wolf_gloves.jpg`),
  avadonRobe: item(30002, 'Avadon Robe', `${Ab}/avadon_robe.jpg`),
  avadonCirclet: item(30001, 'Avadon Circlet', `${Ab}/avadon_circlet.jpg`),
  avadonGloves: item(30003, 'Avadon Gloves', `${Ab}/avado_gloves.jpg`),
  avadonBoots: item(30004, 'Avadon Boots', `${Ab}/avadon_boots.jpg`),
  leatherArmorOfDoom: item(
    30009,
    'Leather Armor of Doom',
    `${Ab}/leather_armor_of_doom_of_fortune.jpg`
  ),
  doomHelmet: item(
    30008,
    'Doom Helmet',
    `${Ab}/doom_helmet_of_fortune.jpg`
  ),
  doomGloves: item(
    30010,
    'Doom Gloves',
    `${Ab}/doom_gloves_of_fortune_light_armor.jpg`
  ),
  doomBoots: item(
    30011,
    'Doom Boots',
    `${Ab}/doom_boots_of_fortune_light_armor.jpg`
  ),
  avadonShield: item(673, 'Avadon Shield', `${Ab}/shield_avadon_shield_i00_0.jpg`),
  doomShield: item(110, 'Doom Shield I00 0', `${Ab}/shield_doom_shield_i00_0.jpg`),
  shieldOfPledge: item(111, 'Shield Of Pledge I00 0', `${Ab}/shield_shield_of_pledge_i00_0.jpg`),
  anotherWorldsNecklace: item(
    928,
    'Accessary Another Worlds Necklace I00',
    `${Jb}/accessary_another_worlds_necklace_i00.png`
  ),
  anotherWorldsEaring: item(
    866,
    'Accessary Another Worlds Earing I00',
    `${Jb}/accessary_another_worlds_earing_i00.png`
  ),
  adamantiteNecklace: item(
    918,
    'Accessary Adamantite Necklace I00',
    `${Jb}/accessary_adamantite_necklace_i00.png`
  ),
  adamantiteRing: item(
    887,
    'Accessary Adamantite Ring I00',
    `${Jb}/accessary_adamantite_ring_i00.png`
  ),
  necklaceOfMana: item(
    921,
    'Accessary Necklace Of Mana I00',
    `${Jb}/accessary_necklace_of_mana_i00.png`
  ),
  necklaceOfHolySpirit: item(
    932,
    'Accessary Necklace Of Holy Spirit I00',
    `${Jb}/accessary_necklace_of_holy_spirit_i00.png`
  ),
  paradiaEaring: item(
    861,
    'Accessary Paradia Earing I00',
    `${Jb}/accessary_paradia_earing_i00.png`
  ),
  paradiaNecklace: item(
    923,
    'Accessary Paradia Necklace I00',
    `${Jb}/accessary_paradia_necklace_i00.png`
  ),
  paradiaRing: item(
    892,
    'Accessary Paradia Ring I00',
    `${Jb}/accessary_paradia_ring_i00.png`
  ),
  ringOfGrace: item(
    900,
    'Accessary Ring Of Grace I00',
    `${Jb}/accessary_ring_of_grace_i00.png`
  ),
  sagesNecklace: item(
    922,
    'Accessary Sages Necklace I00',
    `${Jb}/accessary_sages_necklace_i00.png`
  ),
  sagesEaring: item(
    860,
    'Accessary Sages Earing I00',
    `${Jb}/accessary_sages_earing_i00.png`
  ),
  sagesRing: item(
    891,
    'Accessary Sages Ring I00',
    `${Jb}/accessary_sages_ring_i00.png`
  ),
  elementalNecklace: item(
    929,
    'Accessary Elemental Necklace I00',
    `${Jb}/accessary_elemental_necklace_i00.png`
  ),
  elementalRing: item(
    898,
    'Accessary Elemental Ring I00',
    `${Jb}/accessary_elemental_ring_i00.png`
  ),
  earingOfBlackOre: item(
    864,
    'Accessary Earing Of Black Ore I00',
    `${Jb}/accessary_earing_of_black_ore_i00.png`
  ),
  ringOfBlackOre: item(
    895,
    'Accessary Ring Of Black Ore I00',
    `${Jb}/accessary_ring_of_black_ore_i00.png`
  ),
  earingOfHolySpirit: item(
    870,
    'Accessary Earing Of Holy Spirit I00',
    `${Jb}/accessary_earing_of_holy_spirit_i00.png`
  ),
  ringOfHolySpirit: item(
    901,
    'Accessary Ring Of Holy Spirit I00',
    `${Jb}/accessary_ring_of_holy_spirit_i00.png`
  ),
  necklaceOfSummons: item(
    927,
    'Accessary Necklace Of Summons I00',
    `${Jb}/accessary_necklace_of_summons_i00.png`
  ),
  earingOfAssistance: item(
    873,
    'Accessary Earing Of Assistance I00',
    `${Jb}/accessary_earing_of_assistance_i00.png`
  ),
  necklaceOfSolaEclipse: item(
    925,
    'Accessary Necklace Of Sola Eclipse I00',
    `${Jb}/accessary_necklace_of_sola_eclipse_i00.png`
  ),
  necklaceOfBlackOre: item(
    926,
    'Accessary Necklace Of Black Ore I00',
    `${Jb}/accessary_necklace_of_black_ore_i00.png`
  ),
  necklaceOfGrace: item(
    931,
    'Accessary Necklace Of Grace I00',
    `${Jb}/accessary_necklace_of_grace_i00.png`
  ),
  necklaceOfAssistance: item(
    935,
    'Accessary Necklace Of Assistance I00',
    `${Jb}/accessary_necklace_of_assistance_i00.png`
  ),
} as const satisfies Record<string, ItemDef>;

export type RbDropItemBKey = keyof typeof RB_DROP_ITEM_B;

export interface RbDropTierChancesB extends RbDropTierChances {
  shield: number;
  leggings: number;
}

export const RB_DROP_TIER_52_54: RbDropTierChancesB = {
  weapon: 3,
  mainArmor: 5,
  minorArmor: 7,
  leggings: 6,
  shield: 5,
  necklace: 4,
  earring: 5,
  ring: 6,
  armorScrollChance: 14,
  armorScrollMin: 3,
  armorScrollMax: 6,
  weaponScrollChance: 7,
  weaponScrollMin: 2,
  weaponScrollMax: 4,
};

export const RB_DROP_TIER_55_57: RbDropTierChancesB = {
  weapon: 4,
  mainArmor: 6,
  minorArmor: 8,
  leggings: 7,
  shield: 6,
  necklace: 5,
  earring: 6,
  ring: 7,
  armorScrollChance: 17,
  armorScrollMin: 4,
  armorScrollMax: 7,
  weaponScrollChance: 9,
  weaponScrollMin: 3,
  weaponScrollMax: 5,
};

export const RB_DROP_TIER_58_60: RbDropTierChancesB = {
  weapon: 5,
  mainArmor: 7,
  minorArmor: 9,
  leggings: 8,
  shield: 7,
  necklace: 6,
  earring: 7,
  ring: 8,
  armorScrollChance: 20,
  armorScrollMin: 5,
  armorScrollMax: 8,
  weaponScrollChance: 11,
  weaponScrollMin: 3,
  weaponScrollMax: 6,
};

export interface RbBossDropPickB {
  weapon: RbDropItemBKey;
  mainArmor?: RbDropItemBKey;
  minorArmor?: RbDropItemBKey;
  leggings?: RbDropItemBKey;
  shield?: RbDropItemBKey;
  jewelry?: RbDropItemBKey;
  jewelrySlot?: RbJewelrySlot;
  jewelry2?: RbDropItemBKey;
  jewelry2Slot?: RbJewelrySlot;
}

function withChance(def: ItemDef, chancePercent: number): RaidBossDropSpec {
  return { ...def, chancePercent };
}

function jewelryChance(tier: RbDropTierChancesB, slot: RbJewelrySlot): number {
  if (slot === 'necklace') return tier.necklace;
  if (slot === 'earring') return tier.earring;
  return tier.ring;
}

function enchantScrollDropsB(tier: RbDropTierChancesB): RaidBossDropSpec[] {
  return [
    {
      l2ItemId: 910514,
      displayName: 'Сувій заточення броні B-grade',
      iconUrl: `${R}/scroll_enchant_armor_b.png`,
      chancePercent: tier.armorScrollChance,
      minQuantity: tier.armorScrollMin,
      maxQuantity: tier.armorScrollMax,
      kind: 'resource',
    },
    {
      l2ItemId: 910515,
      displayName: 'Сувій заточення зброї B-grade',
      iconUrl: `${R}/scroll_enchant_weapon_b.png`,
      chancePercent: tier.weaponScrollChance,
      minQuantity: tier.weaponScrollMin,
      maxQuantity: tier.weaponScrollMax,
      kind: 'resource',
    },
  ];
}

export function buildRbBossDropSpecsB(
  tier: RbDropTierChancesB,
  pick: RbBossDropPickB
): RaidBossDropSpec[] {
  const specs: RaidBossDropSpec[] = [withChance(RB_DROP_ITEM_B[pick.weapon], tier.weapon)];
  if (pick.mainArmor) {
    specs.push(withChance(RB_DROP_ITEM_B[pick.mainArmor], tier.mainArmor));
  }
  if (pick.minorArmor) {
    specs.push(withChance(RB_DROP_ITEM_B[pick.minorArmor], tier.minorArmor));
  }
  if (pick.leggings) {
    specs.push(withChance(RB_DROP_ITEM_B[pick.leggings], tier.leggings));
  }
  if (pick.shield) {
    specs.push(withChance(RB_DROP_ITEM_B[pick.shield], tier.shield));
  }
  if (pick.jewelry && pick.jewelrySlot) {
    specs.push(
      withChance(
        RB_DROP_ITEM_B[pick.jewelry],
        jewelryChance(tier, pick.jewelrySlot)
      )
    );
  }
  if (pick.jewelry2 && pick.jewelry2Slot) {
    specs.push(
      withChance(
        RB_DROP_ITEM_B[pick.jewelry2],
        jewelryChance(tier, pick.jewelry2Slot)
      )
    );
  }
  specs.push(...enchantScrollDropsB(tier));
  return specs;
}

export function buildRbDropBagB(
  npcId: number,
  tier: RbDropTierChancesB,
  pick: RbBossDropPickB
): NpcDropBag {
  const specs = buildRbBossDropSpecsB(tier, pick);
  return {
    drops: [raidBossAdenaDropEntry(npcId), ...specs.map((row) => dropLine(npcId, row))],
    spoil: [],
  };
}
