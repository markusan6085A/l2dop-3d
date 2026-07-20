import {
  buildRbDropBagC,
  RB_DROP_TIER_40_44,
  RB_DROP_TIER_45_49,
  RB_DROP_TIER_50_51,
  type RbBossDropPickC,
} from './l2dopRaidBossDropSharedC.js';
import type { NpcDropBag } from './npcDropsResolved.js';

type TierKey = '40_44' | '45_49' | '50_51';

interface RbBossDropRowC extends RbBossDropPickC {
  tier: TierKey;
}

const TIER_BY_KEY = {
  '40_44': RB_DROP_TIER_40_44,
  '45_49': RB_DROP_TIER_45_49,
  '50_51': RB_DROP_TIER_50_51,
} as const;

/** Таблиця дропу РБ 40–51: лише C-grade, незалежні rolls. */
const RB_40_51_DROP_ROWS: Readonly<Record<number, RbBossDropRowC>> = {
  // —— 40 lvl ——
  25208: {
    tier: '40_44',
    weapon: 'akatLongBow',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'necklaceOfMermaid',
    jewelrySlot: 'necklace',
  },
  25134: {
    tier: '40_44',
    weapon: 'battleAxe',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'ringOfAges',
    jewelrySlot: 'ring',
  },
  25490: {
    tier: '40_44',
    weapon: 'crystalDagger',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    jewelry: 'moonstoneEaring',
    jewelrySlot: 'earring',
  },
  25487: {
    tier: '40_44',
    weapon: 'spellbookApprentice',
    mainArmor: 'karmianTunic',
    minorArmor: 'karmianBots',
    jewelry: 'aquastoneNecklace',
    jewelrySlot: 'necklace',
  },
  25155: {
    tier: '40_44',
    weapon: 'paagrioSword',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsGloves',
    jewelry: 'ringOfBinding',
    jewelrySlot: 'ring',
  },
  25064: {
    tier: '40_44',
    weapon: 'demonsStaff',
    mainArmor: 'demonsStockings',
    minorArmor: 'demonsHelmet',
    jewelry: 'blessedNecklace',
    jewelrySlot: 'necklace',
  },
  25415: {
    tier: '40_44',
    weapon: 'knuckleDuster',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'aquastoneRing',
    jewelrySlot: 'ring',
  },
  25410: {
    tier: '40_44',
    weapon: 'darkScreamer',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'earingOfBinding',
    jewelrySlot: 'earring',
  },
  25214: {
    tier: '40_44',
    weapon: 'eminenceBow',
    mainArmor: 'karmianTunic',
    minorArmor: 'karmianGloves',
    jewelry: 'necklaceOfMermaid',
    jewelrySlot: 'necklace',
  },
  25115: {
    tier: '40_44',
    weapon: 'berserkerBlade',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsBots',
    jewelry: 'blessedRing',
    jewelrySlot: 'ring',
  },
  // —— 42–44 lvl ——
  25007: {
    tier: '40_44',
    weapon: 'scorpion',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'ringOfBinding',
    jewelrySlot: 'ring',
  },
  25192: {
    tier: '40_44',
    weapon: 'bigHammer',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherHelmet',
    shield: 'compositeShield',
  },
  25088: {
    tier: '40_44',
    weapon: 'dwarvenHammer',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'ringOfProtection',
    jewelrySlot: 'ring',
  },
  25438: {
    tier: '40_44',
    weapon: 'crystalDagger',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'moonstoneEaring',
    jewelrySlot: 'earring',
  },
  25085: {
    tier: '40_44',
    weapon: 'orcishPoleaxe',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    jewelry: 'necklaceOfBinding',
    jewelrySlot: 'necklace',
  },
  25418: {
    tier: '40_44',
    weapon: 'samuraiLongsword',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'blessedEaring',
    jewelrySlot: 'earring',
  },
  25431: {
    tier: '40_44',
    weapon: 'heavyDoomHammer',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsGloves',
    shield: 'compositeShield',
  },
  25099: {
    tier: '40_44',
    weapon: 'heathensBook',
    mainArmor: 'karmianTunic',
    minorArmor: 'karmianBots',
    jewelry: 'necklaceOfProtection',
    jewelrySlot: 'necklace',
  },
  // —— 45 lvl ——
  25260: {
    tier: '45_49',
    weapon: 'heavyDoomAxe',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    shield: 'fullPlateShield',
  },
  25441: {
    tier: '45_49',
    weapon: 'demonsStaff',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsHelmet',
    jewelry: 'blessedNecklace',
    jewelrySlot: 'necklace',
  },
  25173: {
    tier: '45_49',
    weapon: 'fistedBlade',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'ringOfAges',
    jewelrySlot: 'ring',
  },
  25437: {
    tier: '45_49',
    weapon: 'warAxe',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'earingOfProtection',
    jewelrySlot: 'earring',
  },
  25498: {
    tier: '45_49',
    weapon: 'eminenceBow',
    mainArmor: 'karmianStockings',
    minorArmor: 'karmianGloves',
    jewelry: 'necklaceOfMermaid',
    jewelrySlot: 'necklace',
  },
  25057: {
    tier: '45_49',
    weapon: 'akatLongBow',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    jewelry: 'nassensEaring',
    jewelrySlot: 'earring',
  },
  25395: {
    tier: '45_49',
    weapon: 'eclipticSword',
    mainArmor: 'demonsStockings',
    minorArmor: 'demonsGloves',
    jewelry: 'ringOfProtection',
    jewelrySlot: 'ring',
  },
  25102: {
    tier: '45_49',
    weapon: 'greatPata',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'blessedRing',
    jewelrySlot: 'ring',
  },
  // —— 47–49 lvl ——
  25044: {
    tier: '45_49',
    weapon: 'berserkerBlade',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    shield: 'fullPlateShield',
  },
  25412: {
    tier: '45_49',
    weapon: 'samuraiLongsword',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsHelmet',
    jewelry: 'necklaceOfBinding',
    jewelrySlot: 'necklace',
  },
  25158: {
    tier: '45_49',
    weapon: 'heavyDoomAxe',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'ringOfAges',
    jewelrySlot: 'ring',
  },
  25420: {
    tier: '45_49',
    weapon: 'homunkulusSword',
    mainArmor: 'karmianTunic',
    minorArmor: 'karmianGloves',
    jewelry: 'blessedEaring',
    jewelrySlot: 'earring',
  },
  25456: {
    tier: '45_49',
    weapon: 'heathensBook',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsBots',
    jewelry: 'necklaceOfProtection',
    jewelrySlot: 'necklace',
  },
  25047: {
    tier: '45_49',
    weapon: 'darkScreamer',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    jewelry: 'nassensEaring',
    jewelrySlot: 'earring',
  },
  25026: {
    tier: '45_49',
    weapon: 'orcishPoleaxe',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherBoots',
    shield: 'compositeShield',
  },
  // —— 50 lvl ——
  25119: {
    tier: '50_51',
    weapon: 'akatLongBow',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'necklaceOfMermaid',
    jewelrySlot: 'necklace',
  },
  25273: {
    tier: '50_51',
    weapon: 'heavyDoomHammer',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherHelmet',
    shield: 'fullPlateShield',
  },
  25131: {
    tier: '50_51',
    weapon: 'widowMaker',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'earingOfProtection',
    jewelrySlot: 'earring',
  },
  25277: {
    tier: '50_51',
    weapon: 'demonsStaff',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsGloves',
    jewelry: 'blessedNecklace',
    jewelrySlot: 'necklace',
  },
  25013: {
    tier: '50_51',
    weapon: 'battleAxe',
    mainArmor: 'platedLeatherGaiters',
    minorArmor: 'platedLeatherGloves',
    jewelry: 'ringOfProtection',
    jewelrySlot: 'ring',
  },
  25217: {
    tier: '50_51',
    weapon: 'homunkulusSword',
    mainArmor: 'karmianTunic',
    minorArmor: 'karmianHelmet',
    jewelry: 'necklaceOfBinding',
    jewelrySlot: 'necklace',
  },
  25484: {
    tier: '50_51',
    weapon: 'heavyDoomAxe',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherHelmet',
    shield: 'fullPlateShield',
  },
  // —— 51 lvl ——
  25050: {
    tier: '50_51',
    weapon: 'eminenceBow',
    mainArmor: 'platedLeatherArmor',
    minorArmor: 'platedLeatherBoots',
    jewelry: 'nassensEaring',
    jewelrySlot: 'earring',
    jewelry2: 'ringOfAges',
    jewelry2Slot: 'ring',
  },
  25460: {
    tier: '50_51',
    weapon: 'yaksaMace',
    mainArmor: 'demonsTunic',
    minorArmor: 'demonsHelmet',
    jewelry: 'necklaceOfProtection',
    jewelrySlot: 'necklace',
    jewelry2: 'earingOfProtection',
    jewelry2Slot: 'earring',
  },
};

function buildRb40_51DropBags(): Readonly<Record<number, NpcDropBag>> {
  const out: Record<number, NpcDropBag> = {};
  for (const [npcIdRaw, row] of Object.entries(RB_40_51_DROP_ROWS)) {
    const npcId = Number(npcIdRaw);
    const { tier, ...pick } = row;
    out[npcId] = buildRbDropBagC(npcId, TIER_BY_KEY[tier], pick);
  }
  return out;
}

export const RB_40_51_DROP_BAG_BY_NPC_ID = buildRb40_51DropBags();

export const RB_40_51_NPC_IDS = Object.keys(RB_40_51_DROP_ROWS).map(Number);

export const RB_40_51_BOSS_COUNT = RB_40_51_NPC_IDS.length;
