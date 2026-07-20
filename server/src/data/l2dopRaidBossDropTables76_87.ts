import {
  buildRbDropBagS,
  RB_DROP_TIER_76_79,
  RB_DROP_TIER_80_84,
  RB_DROP_TIER_85_87,
  type RbBossDropPickS,
} from './l2dopRaidBossDropSharedS.js';
import type { NpcDropBag } from './npcDropsResolved.js';

type TierKey = '76_79' | '80_84' | '85_87';

interface RbBossDropRowS extends RbBossDropPickS {
  tier: TierKey;
}

const TIER_BY_KEY = {
  '76_79': RB_DROP_TIER_76_79,
  '80_84': RB_DROP_TIER_80_84,
  '85_87': RB_DROP_TIER_85_87,
} as const;

/** Таблиця дропу РБ 76–87: лише S-grade, незалежні rolls. */
const RB_76_87_DROP_ROWS: Readonly<Record<number, RbBossDropRowS>> = {
  // —— 76 ——
  25205: {
    tier: '76_79',
    weapon: 'imperialStaff',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaGloves',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
  },
  25524: {
    tier: '76_79',
    weapon: 'basaltBattlehammer',
    mainArmor: 'imperialCrusaderBreastplate',
    leggings: 'boundImperialCrusader',
    shield: 'imperialCrusaderShield',
  },
  // —— 78 ——
  25290: {
    tier: '76_79',
    weapon: 'angelSlayer',
    mainArmor: 'draconicLeatherArmor',
    minorArmor: 'draconicLeatherGloves',
    jewelry: 'tateossianRing',
    jewelrySlot: 'ring',
  },
  25293: {
    tier: '76_79',
    weapon: 'arcanaMace',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaBoots',
    jewelry: 'tateossianEarring',
    jewelrySlot: 'earring',
  },
  25245: {
    tier: '76_79',
    weapon: 'heavensDivider',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderGauntlets',
    shield: 'imperialCrusaderShield',
  },
  25143: {
    tier: '76_79',
    weapon: 'godsBlade',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderHelmet',
    jewelry: 'tateossianRing',
    jewelrySlot: 'ring',
  },
  // —— 79 ——
  25126: {
    tier: '76_79',
    weapon: 'saintSpear',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'boundImperialBoots',
    shield: 'imperialCrusaderShield',
  },
  25450: {
    tier: '76_79',
    weapon: 'apprenticesSpellbook',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaCirclet',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
  },
  // —— 80 ——
  25286: {
    tier: '80_84',
    weapon: 'arcanaMace',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaCirclet',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
    jewelry2: 'tateossianEarring',
    jewelry2Slot: 'earring',
  },
  25309: {
    tier: '80_84',
    weapon: 'dragonHunterAxe',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderGauntlets',
    jewelry: 'tateossianRing',
    jewelrySlot: 'ring',
  },
  25299: {
    tier: '80_84',
    weapon: 'basaltBattlehammer',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderHelmet',
    shield: 'imperialCrusaderShield',
  },
  29095: {
    tier: '80_84',
    weapon: 'heavensDivider',
    mainArmor: 'imperialCrusaderBreastplate',
    leggings: 'boundImperialCrusader',
    minorArmor: 'boundImperialBoots',
  },
  25514: {
    tier: '80_84',
    weapon: 'demonSplinter',
    mainArmor: 'draconicLeatherArmor',
    minorArmor: 'draconicLeatherBoots',
    jewelry: 'tateossianEarring',
    jewelrySlot: 'earring',
  },
  25283: {
    tier: '80_84',
    weapon: 'imperialStaff',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaGloves',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
    jewelry2: 'tateossianRing',
    jewelry2Slot: 'ring',
  },
  // —— 84 ——
  25312: {
    tier: '80_84',
    weapon: 'baguettesDualsword',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderGauntlets',
    shield: 'imperialCrusaderShield',
  },
  25302: {
    tier: '80_84',
    weapon: 'saintSpear',
    mainArmor: 'imperialCrusaderBreastplate',
    leggings: 'boundImperialCrusader',
    minorArmor: 'imperialCrusaderHelmet',
  },
  // —— 85 ——
  25319: {
    tier: '85_87',
    weapon: 'draconicBow',
    weapon2: 'angelSlayer',
    mainArmor: 'draconicLeatherArmor',
    minorArmor: 'draconicLeatherHelmet',
    minorArmor2: 'draconicLeatherGloves',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
  },
  // —— 87 ——
  25315: {
    tier: '85_87',
    weapon: 'dragonHunterAxe',
    weapon2: 'baguettesDualsword',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderGauntlets',
    shield: 'imperialCrusaderShield',
    jewelry: 'tateossianRing',
    jewelrySlot: 'ring',
  },
  25305: {
    tier: '85_87',
    weapon: 'heavensDivider',
    weapon2: 'saintSpear',
    mainArmor: 'imperialCrusaderBreastplate',
    leggings: 'boundImperialCrusader',
    minorArmor: 'imperialCrusaderHelmet',
  },
  25316: {
    tier: '85_87',
    weapon: 'shiningBow',
    weapon2: 'demonSplinter',
    mainArmor: 'draconicLeatherArmor',
    minorArmor: 'draconicLeatherBoots',
    jewelry: 'tateossianEarring',
    jewelrySlot: 'earring',
    jewelry2: 'tateossianRing',
    jewelry2Slot: 'ring',
  },
  25306: {
    tier: '85_87',
    weapon: 'basaltBattlehammer',
    weapon2: 'apprenticesSpellbook',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'boundImperialBoots',
    shield: 'imperialCrusaderShield',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
  },
  25527: {
    tier: '85_87',
    weapon: 'godsBlade',
    weapon2: 'baguettesDualsword',
    mainArmor: 'imperialCrusaderBreastplate',
    minorArmor: 'imperialCrusaderHelmet',
    minorArmor2: 'imperialCrusaderGauntlets',
    jewelry: 'tateossianEarring',
    jewelrySlot: 'earring',
  },
  25517: {
    tier: '85_87',
    weapon: 'arcanaMace',
    weapon2: 'imperialStaff',
    mainArmor: 'majorArcanaRobe',
    minorArmor: 'majorArcanaCirclet',
    minorArmor2: 'majorArcanaGloves',
    jewelry: 'tateossianNecklace',
    jewelrySlot: 'necklace',
    jewelry2: 'tateossianEarring',
    jewelry2Slot: 'earring',
  },
};

function buildRb76_87DropBags(): Readonly<Record<number, NpcDropBag>> {
  const out: Record<number, NpcDropBag> = {};
  for (const [npcIdRaw, row] of Object.entries(RB_76_87_DROP_ROWS)) {
    const npcId = Number(npcIdRaw);
    const { tier, ...pick } = row;
    out[npcId] = buildRbDropBagS(npcId, TIER_BY_KEY[tier], pick);
  }
  return out;
}

export const RB_76_87_DROP_BAG_BY_NPC_ID = buildRb76_87DropBags();

export const RB_76_87_NPC_IDS = Object.keys(RB_76_87_DROP_ROWS).map(Number);

export const RB_76_87_BOSS_COUNT = RB_76_87_NPC_IDS.length;
