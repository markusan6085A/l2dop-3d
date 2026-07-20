import {
  buildRbDropBagA,
  RB_DROP_TIER_61_66,
  RB_DROP_TIER_67_71,
  RB_DROP_TIER_72_75,
  type RbBossDropPickA,
} from './l2dopRaidBossDropSharedA.js';
import type { NpcDropBag } from './npcDropsResolved.js';

type TierKey = '61_66' | '67_71' | '72_75';

interface RbBossDropRowA extends RbBossDropPickA {
  tier: TierKey;
}

const TIER_BY_KEY = {
  '61_66': RB_DROP_TIER_61_66,
  '67_71': RB_DROP_TIER_67_71,
  '72_75': RB_DROP_TIER_72_75,
} as const;

/** Таблиця дропу РБ 61–75: лише A-grade, незалежні rolls. */
const RB_61_75_DROP_ROWS: Readonly<Record<number, RbBossDropRowA>> = {
  // —— 61–66 ——
  25423: {
    tier: '61_66',
    weapon: 'branchOfMotherTree',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticBoots',
    jewelry: 'phoenixsNecklace',
    jewelrySlot: 'necklace',
  },
  25226: {
    tier: '61_66',
    weapon: 'darkLegionsEdge',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalGloves',
    shield: 'darkCrystalShield',
  },
  25467: {
    tier: '61_66',
    weapon: 'dragonGrinder',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaLeatherGloves',
    jewelry: 'cerberussRing',
    jewelrySlot: 'ring',
  },
  25444: {
    tier: '61_66',
    weapon: 'spiritualEye',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticCirclet',
    jewelry: 'necklaceOfPhantom',
    jewelrySlot: 'necklace',
  },
  25255: {
    tier: '61_66',
    weapon: 'tiphonsSpear',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalHelmet',
    shield: 'shieldOfNightmare',
  },
  25051: {
    tier: '61_66',
    weapon: 'bloodTornado',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaBoots',
    jewelry: 'earingOfPhantom',
    jewelrySlot: 'earring',
  },
  25125: {
    tier: '61_66',
    weapon: 'nagaStorm',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaHelm',
    jewelry: 'phoenixsRing',
    jewelrySlot: 'ring',
  },
  25140: {
    tier: '61_66',
    weapon: 'barakielsAxe',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalBoots',
    jewelry: 'infernoEaring',
    jewelrySlot: 'earring',
  },
  25478: {
    tier: '61_66',
    weapon: 'themisTongue',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticGauntlets',
    jewelry: 'infernoNecklace',
    jewelrySlot: 'necklace',
  },
  25322: {
    tier: '61_66',
    weapon: 'daimonCrystal',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticCirclet',
    jewelry: 'infernoRing',
    jewelrySlot: 'ring',
  },
  25470: {
    tier: '61_66',
    weapon: 'dragonSlayer',
    mainArmor: 'darkCrystalBreastplate',
    leggings: 'darkCrystalGaiters',
    shield: 'shieldOfNightmare',
  },
  // —— 67–71 ——
  25263: {
    tier: '67_71',
    weapon: 'sirrasBlade',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalGloves',
    jewelry: 'cerberussEaring',
    jewelrySlot: 'earring',
  },
  25233: {
    tier: '67_71',
    weapon: 'soulSeparator',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaLeatherGloves',
    jewelry: 'ringOfPhantom',
    jewelrySlot: 'ring',
  },
  25073: {
    tier: '67_71',
    weapon: 'dasparionsStaff',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticBoots',
    jewelry: 'infernoNecklaceI02',
    jewelrySlot: 'necklace',
  },
  25281: {
    tier: '67_71',
    weapon: 'swordOfMiracles',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticGauntlets',
    jewelry: 'phoenixsEaringI02',
    jewelrySlot: 'earring',
  },
  25092: {
    tier: '67_71',
    weapon: 'meteorShower',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalHelmet',
    shield: 'darkCrystalShield',
  },
  25252: {
    tier: '67_71',
    weapon: 'bloodyOrchid',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaBoots',
    jewelry: 'phoenixsNecklaceI02',
    jewelrySlot: 'necklace',
  },
  25269: {
    tier: '67_71',
    weapon: 'behemothsTuningFork',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalGloves',
    jewelry: 'cerberussNecklace',
    jewelrySlot: 'necklace',
  },
  25453: {
    tier: '67_71',
    weapon: 'infernalMaster',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalBoots',
    jewelry: 'infernoRingI02',
    jewelrySlot: 'ring',
  },
  25198: {
    tier: '67_71',
    weapon: 'carnageBow',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaHelm',
    jewelry: 'cerberussEaring',
    jewelrySlot: 'earring',
  },
  25163: {
    tier: '67_71',
    weapon: 'tallumGlaive',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalBoots',
    shield: 'shieldOfNightmare',
  },
  25328: {
    tier: '67_71',
    weapon: 'darkLegionsEdge',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'phoenixsRing',
    jewelrySlot: 'ring',
  },
  25447: {
    tier: '67_71',
    weapon: 'apprenticesSpellbook',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticCirclet',
    jewelry: 'infernoEaring',
    jewelrySlot: 'earring',
  },
  // —— 72–75 ——
  25235: {
    tier: '72_75',
    weapon: 'baguettesDualsword',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalGloves',
    shield: 'darkCrystalShield',
  },
  25248: {
    tier: '72_75',
    weapon: 'swordOfIpos',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'cerberussRing',
    jewelrySlot: 'ring',
  },
  25199: {
    tier: '72_75',
    weapon: 'shyeedsBow',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaBoots',
    jewelry: 'phoenixsNecklace',
    jewelrySlot: 'necklace',
  },
  25220: {
    tier: '72_75',
    weapon: 'soulBow',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalBoots',
    shield: 'shieldOfNightmare',
  },
  25523: {
    tier: '72_75',
    weapon: 'elysian',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalGloves',
    jewelry: 'infernoRingI02',
    jewelrySlot: 'ring',
  },
  25109: {
    tier: '72_75',
    weapon: 'daimonCrystal',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticCirclet',
    jewelry: 'infernoNecklaceI02',
    jewelrySlot: 'necklace',
  },
  25296: {
    tier: '72_75',
    weapon: 'sirrasBlade',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'phoenixsEaringI02',
    jewelrySlot: 'earring',
  },
  25202: {
    tier: '72_75',
    weapon: 'sobekksHurricane',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaLeatherGloves',
    jewelry: 'cerberussNecklace',
    jewelrySlot: 'necklace',
  },
  25325: {
    tier: '72_75',
    weapon: 'barakielsAxe',
    mainArmor: 'darkCrystalBreastplate',
    leggings: 'darkCrystalGaiters',
    shield: 'shieldOfNightmare',
    jewelry: 'cerberussEaring',
    jewelrySlot: 'earring',
  },
  25054: {
    tier: '72_75',
    weapon: 'tallumBlade',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'phoenixsRingI02',
    jewelrySlot: 'ring',
  },
  25266: {
    tier: '72_75',
    weapon: 'bloodyOrchid',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaBoots',
    jewelry: 'phoenixsNecklaceI02',
    jewelrySlot: 'necklace',
    jewelry2: 'phoenixsEaringI02',
    jewelry2Slot: 'earring',
  },
  25276: {
    tier: '72_75',
    weapon: 'swordOfIpos',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalGloves',
    shield: 'darkCrystalShield',
  },
  25282: {
    tier: '72_75',
    weapon: 'darkLegionsEdge',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'infernoRingI02',
    jewelrySlot: 'ring',
  },
  25229: {
    tier: '72_75',
    weapon: 'nagaStorm',
    mainArmor: 'apellaBrigandine',
    minorArmor: 'apellaLeatherGloves',
    jewelry: 'ringOfPhantom',
    jewelrySlot: 'ring',
  },
  25249: {
    tier: '72_75',
    weapon: 'dragonSlayer',
    mainArmor: 'darkCrystalBreastplate',
    minorArmor: 'darkCrystalBoots',
    shield: 'shieldOfNightmare',
  },
  25035: {
    tier: '72_75',
    weapon: 'dasparionsStaff',
    mainArmor: 'majesticRobe',
    minorArmor: 'majesticGauntlets',
    jewelry: 'infernoNecklaceI02',
    jewelrySlot: 'necklace',
    jewelry2: 'infernoEaringI02',
    jewelry2Slot: 'earring',
  },
  25244: {
    tier: '72_75',
    weapon: 'tiphonsSpear',
    leggings: 'darkCrystalGaiters',
    minorArmor: 'darkCrystalHelmet',
    jewelry: 'cerberussNecklace',
    jewelrySlot: 'necklace',
  },
};

function buildRb61_75DropBags(): Readonly<Record<number, NpcDropBag>> {
  const out: Record<number, NpcDropBag> = {};
  for (const [npcIdRaw, row] of Object.entries(RB_61_75_DROP_ROWS)) {
    const npcId = Number(npcIdRaw);
    const { tier, ...pick } = row;
    out[npcId] = buildRbDropBagA(npcId, TIER_BY_KEY[tier], pick);
  }
  return out;
}

export const RB_61_75_DROP_BAG_BY_NPC_ID = buildRb61_75DropBags();

export const RB_61_75_NPC_IDS = Object.keys(RB_61_75_DROP_ROWS).map(Number);

export const RB_61_75_BOSS_COUNT = RB_61_75_NPC_IDS.length;
