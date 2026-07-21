import type { DropKind } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { raidBossAdenaDropEntry } from './l2dopRaidBossRewardPatches.js';
import {
  dropLine,
  type RbDropTierChances,
  type RbJewelrySlot,
  type RaidBossDropSpec,
} from './l2dopRaidBossDropShared.js';

const Wa = '/icons/drops/weapon_a';
const Aa = '/icons/drops/arrom_а';
const Ja = '/icons/drops/earring_a';
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

/** Канонічні A-grade предмети для таблиць дропу РБ 61–75. */
export const RB_DROP_ITEM_A = {
  apprenticesSpellbook: item(900201, "Apprentice's Spellbook", `${Wa}/apprentices_spellbook.jpg`),
  baguettesDualsword: item(900202, "Baguette's Dualsword", `${Wa}/baguette_s_dualsword.jpg`),
  barakielsAxe: item(900203, "Barakiel's Axe", `${Wa}/barakiel_s_axe.jpg`),
  behemothsTuningFork: item(900204, "Behemoth's Tuning Fork", `${Wa}/behemoth_s_tuning_fork.jpg`),
  bloodTornado: item(900205, 'Blood Tornado', `${Wa}/blood_tornado.jpg`),
  bloodyOrchid: item(900206, 'Bloody Orchid', `${Wa}/bloody_orchid.jpg`),
  branchOfMotherTree: item(900207, 'Branch of the Mother Tree', `${Wa}/branch_of_the_mother_tree.jpg`),
  carnageBow: item(900209, 'Carnage Bow', `${Wa}/carnage_bow.jpg`),
  daimonCrystal: item(900210, 'Daimon Crystal', `${Wa}/daimon_crystal.jpg`),
  darkLegionsEdge: item(2500, "Dark Legion's Edge", `${Wa}/dark_legion_s_edge.jpg`),
  dasparionsStaff: item(212, "Dasparion's Staff", `${Wa}/dasparion_s_staff.jpg`),
  dragonGrinder: item(231, 'Dragon Grinder', `${Wa}/dragon_grinder.jpg`),
  dragonSlayer: item(900211, 'Dragon Slayer', `${Wa}/dragon_slayer.jpg`),
  elysian: item(164, 'Elysian', `${Wa}/elysian.jpg`),
  infernalMaster: item(900212, 'Infernal Master', `${Wa}/infernal_master.jpg`),
  meteorShower: item(2504, 'Meteor Shower', `${Wa}/meteor_shower.jpg`),
  nagaStorm: item(900213, 'Naga Storm', `${Wa}/naga_storm.jpg`),
  shyeedsBow: item(900214, "Shyeed's Bow", `${Wa}/shyeed_s_bow.jpg`),
  sirrasBlade: item(900215, "Sirra's Blade", `${Wa}/sirra_s_blade.jpg`),
  sobekksHurricane: item(900216, "Sobekk's Hurricane", `${Wa}/sobekk_s_hurricane.jpg`),
  soulBow: item(289, 'Soul Bow', `${Wa}/soul_bow.jpg`),
  soulSeparator: item(900217, 'Soul Separator', `${Wa}/soul_separator.jpg`),
  spiritualEye: item(900218, 'Spiritual Eye', `${Wa}/spiritual_eye.jpg`),
  swordOfIpos: item(900219, 'Sword of Ipos', `${Wa}/sword_of_ipos.jpg`),
  swordOfMiracles: item(151, 'Sword of Miracles', `${Wa}/sword_of_miracles.jpg`),
  tallumBlade: item(900220, 'Tallum Blade', `${Wa}/tallum_blade.jpg`),
  tallumGlaive: item(900221, 'Tallum Glaive', `${Wa}/tallum_glaive.jpg`),
  themisTongue: item(900222, "Themis' Tongue", `${Wa}/themis_tongue.jpg`),
  tiphonsSpear: item(900223, "Tiphon's Spear", `${Wa}/tiphon_s_spear.jpg`),
  darkCrystalBreastplate: item(365, 'Dark Crystal Breastplate', `${Aa}/dark_crystal_breastplate.jpg`),
  darkCrystalGaiters: item(388, 'Dark Crystal Gaiters', `${Aa}/dark_crystal_gaiters.jpg`),
  darkCrystalHelmet: item(512, 'Dark Crystal Helmet', `${Aa}/dark_crystal_helmet.jpg`),
  darkCrystalBoots: item(563, 'Dark Crystal Boots [Heavy Armor]', `${Aa}/dark_crystal_boots.jpg`),
  darkCrystalGloves: item(2472, 'Dark Crystal Gloves [Heavy Armor]', `${Aa}/dark_crystal_glove.jpg`),
  darkCrystalShield: item(641, 'Dark Crystal Shield', `${Aa}/shield_dark_crystal_shield_i00_0.jpg`),
  shieldOfNightmare: item(2498, 'Shield of Nightmare', `${Aa}/shield_shield_of_nightmare_i00_0.jpg`),
  majesticRobe: item(2409, 'Majestic Robe', `${Aa}/majestic_robe.jpg`),
  majesticCirclet: item(2419, 'Majestic Circlet', `${Aa}/majestic_circlet.jpg`),
  majesticBoots: item(583, 'Majestic Boots [Robe]', `${Aa}/majestic_boots.jpg`),
  majesticGauntlets: item(2482, 'Majestic Gauntlets [Robe]', `${Aa}/majestic_gauntlets.jpg`),
  apellaBrigandine: item(7864, 'Apella Brigandine', `${Aa}/apella_brigandine.jpg`),
  apellaHelm: item(7860, 'Apella Helm', `${Aa}/apella_helm.jpg`),
  apellaLeatherGloves: item(7865, 'Apella Leather Gloves', `${Aa}/apella_leather_gloves.jpg`),
  apellaBoots: item(7866, 'Apella Boots', `${Aa}/apella_boots.jpg`),
  cerberussEaring: item(872, 'Accessary Cerberuss Earing I00', `${Ja}/accessary_cerberuss_earing_i00.png`),
  cerberussNecklace: item(934, 'Accessary Cerberuss Necklace I00', `${Ja}/accessary_cerberuss_necklace_i00.png`),
  cerberussRing: item(903, 'Accessary Cerberuss Ring I00', `${Ja}/accessary_cerberuss_ring_i00.png`),
  earingOfPhantom: item(868, 'Accessary Earing Of Phantom I00', `${Ja}/accessary_earing_of_phantom_i00.png`),
  necklaceOfPhantom: item(930, 'Accessary Necklace Of Phantom I00', `${Ja}/accessary_necklace_of_phantom_i00.png`),
  ringOfPhantom: item(899, 'Accessary Ring Of Phantom I00', `${Ja}/accessary_ring_of_phantom_i00.png`),
  infernoEaring: item(862, 'Accessary Inferno Earing I00', `${Ja}/accessary_inferno_earing_i00.png`),
  infernoNecklace: item(924, 'Accessary Inferno Necklace I00', `${Ja}/accessary_inferno_necklace_i00.png`),
  infernoRing: item(893, 'Accessary Inferno Ring I00', `${Ja}/accessary_inferno_ring_i00.png`),
  phoenixsEaring: item(871, 'Accessary Phoenixs Earing I00', `${Ja}/accessary_phoenixs_earing_i00.png`),
  phoenixsNecklace: item(933, 'Accessary Phoenixs Necklace I00', `${Ja}/accessary_phoenixs_necklace_i00.png`),
  phoenixsRing: item(902, 'Accessary Phoenixs Ring I00', `${Ja}/accessary_phoenixs_ring_i00.png`),
  infernoEaringI02: item(6327, 'Accessary Inferno Earing I02', `${Ja}/accessary_inferno_earing_i02.png`),
  infernoNecklaceI02: item(6326, 'Accessary Inferno Necklace I02', `${Ja}/accessary_inferno_necklace_i02.png`),
  infernoRingI02: item(6328, 'Accessary Inferno Ring I02', `${Ja}/accessary_inferno_ring_i02.png`),
  phoenixsEaringI02: item(6324, 'Accessary Phoenixs Earing I02', `${Ja}/accessary_phoenixs_earing_i02.png`),
  phoenixsNecklaceI02: item(6323, 'Accessary Phoenixs Necklace I02', `${Ja}/accessary_phoenixs_necklace_i02.png`),
  phoenixsRingI02: item(6325, 'Accessary Phoenixs Ring I02', `${Ja}/accessary_phoenixs_ring_i02.png`),
} as const satisfies Record<string, ItemDef>;

export type RbDropItemAKey = keyof typeof RB_DROP_ITEM_A;

export interface RbDropTierChancesA extends RbDropTierChances {
  shield: number;
  leggings: number;
}

export const RB_DROP_TIER_61_66: RbDropTierChancesA = {
  weapon: 2.5,
  mainArmor: 4.5,
  minorArmor: 6.5,
  leggings: 5,
  shield: 4.5,
  necklace: 3.5,
  earring: 4.5,
  ring: 5.5,
  armorScrollChance: 13,
  armorScrollMin: 3,
  armorScrollMax: 6,
  weaponScrollChance: 6,
  weaponScrollMin: 2,
  weaponScrollMax: 4,
};

export const RB_DROP_TIER_67_71: RbDropTierChancesA = {
  weapon: 3.5,
  mainArmor: 5.5,
  minorArmor: 7.5,
  leggings: 6,
  shield: 5.5,
  necklace: 4.5,
  earring: 5.5,
  ring: 6.5,
  armorScrollChance: 16,
  armorScrollMin: 4,
  armorScrollMax: 7,
  weaponScrollChance: 8,
  weaponScrollMin: 3,
  weaponScrollMax: 5,
};

export const RB_DROP_TIER_72_75: RbDropTierChancesA = {
  weapon: 4.5,
  mainArmor: 6.5,
  minorArmor: 8.5,
  leggings: 7,
  shield: 6.5,
  necklace: 5.5,
  earring: 6.5,
  ring: 7.5,
  armorScrollChance: 19,
  armorScrollMin: 5,
  armorScrollMax: 8,
  weaponScrollChance: 10,
  weaponScrollMin: 3,
  weaponScrollMax: 6,
};

export interface RbBossDropPickA {
  weapon: RbDropItemAKey;
  mainArmor?: RbDropItemAKey;
  minorArmor?: RbDropItemAKey;
  leggings?: RbDropItemAKey;
  shield?: RbDropItemAKey;
  jewelry?: RbDropItemAKey;
  jewelrySlot?: RbJewelrySlot;
  jewelry2?: RbDropItemAKey;
  jewelry2Slot?: RbJewelrySlot;
}

function withChance(def: ItemDef, chancePercent: number): RaidBossDropSpec {
  return { ...def, chancePercent };
}

function jewelryChance(tier: RbDropTierChancesA, slot: RbJewelrySlot): number {
  if (slot === 'necklace') return tier.necklace;
  if (slot === 'earring') return tier.earring;
  return tier.ring;
}

function enchantScrollDropsA(tier: RbDropTierChancesA): RaidBossDropSpec[] {
  return [
    {
      l2ItemId: 910516,
      displayName: 'Сувій заточення броні A-grade',
      iconUrl: `${R}/scroll_enchant_armor_a.png`,
      chancePercent: tier.armorScrollChance,
      minQuantity: tier.armorScrollMin,
      maxQuantity: tier.armorScrollMax,
      kind: 'resource',
    },
    {
      l2ItemId: 910517,
      displayName: 'Сувій заточення зброї A-grade',
      iconUrl: `${R}/scroll_enchant_weapon_a.png`,
      chancePercent: tier.weaponScrollChance,
      minQuantity: tier.weaponScrollMin,
      maxQuantity: tier.weaponScrollMax,
      kind: 'resource',
    },
  ];
}

export function buildRbBossDropSpecsA(
  tier: RbDropTierChancesA,
  pick: RbBossDropPickA
): RaidBossDropSpec[] {
  const specs: RaidBossDropSpec[] = [withChance(RB_DROP_ITEM_A[pick.weapon], tier.weapon)];
  if (pick.mainArmor) specs.push(withChance(RB_DROP_ITEM_A[pick.mainArmor], tier.mainArmor));
  if (pick.minorArmor) specs.push(withChance(RB_DROP_ITEM_A[pick.minorArmor], tier.minorArmor));
  if (pick.leggings) specs.push(withChance(RB_DROP_ITEM_A[pick.leggings], tier.leggings));
  if (pick.shield) specs.push(withChance(RB_DROP_ITEM_A[pick.shield], tier.shield));
  if (pick.jewelry && pick.jewelrySlot) {
    specs.push(withChance(RB_DROP_ITEM_A[pick.jewelry], jewelryChance(tier, pick.jewelrySlot)));
  }
  if (pick.jewelry2 && pick.jewelry2Slot) {
    specs.push(withChance(RB_DROP_ITEM_A[pick.jewelry2], jewelryChance(tier, pick.jewelry2Slot)));
  }
  specs.push(...enchantScrollDropsA(tier));
  return specs;
}

export function buildRbDropBagA(
  npcId: number,
  tier: RbDropTierChancesA,
  pick: RbBossDropPickA
): NpcDropBag {
  const specs = buildRbBossDropSpecsA(tier, pick);
  return {
    drops: [raidBossAdenaDropEntry(npcId), ...specs.map((row) => dropLine(npcId, row))],
    spoil: [],
  };
}
