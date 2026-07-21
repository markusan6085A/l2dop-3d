import {
  buildRbDropBagB,
  RB_DROP_TIER_52_54,
  RB_DROP_TIER_55_57,
  RB_DROP_TIER_58_60,
  type RbBossDropPickB,
} from './l2dopRaidBossDropSharedB.js';
import type { NpcDropBag } from './npcDropsResolved.js';

type TierKey = '52_54' | '55_57' | '58_60';

interface RbBossDropRowB extends RbBossDropPickB {
  tier: TierKey;
}

const TIER_BY_KEY = {
  '52_54': RB_DROP_TIER_52_54,
  '55_57': RB_DROP_TIER_55_57,
  '58_60': RB_DROP_TIER_58_60,
} as const;

/** Таблиця дропу РБ 52–60: лише B-grade, незалежні rolls. */
const RB_52_60_DROP_ROWS: Readonly<Record<number, RbBossDropRowB>> = {
  // —— 52 lvl ——
  25496: {
    tier: '52_54',
    weapon: 'bowOfPeril',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfBoots',
    jewelry: 'anotherWorldsNecklace',
    jewelrySlot: 'necklace',
  },
  25512: {
    tier: '52_54',
    weapon: 'iceStormHammer',
    leggings: 'blueWolfGaiters',
    minorArmor: 'blueWolfGloves',
    shield: 'doomShield',
  },
  25067: {
    tier: '52_54',
    weapon: 'artOfBattleAxe',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomGloves',
    jewelry: 'ringOfBlackOre',
    jewelrySlot: 'ring',
  },
  25473: {
    tier: '52_54',
    weapon: 'kris',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomBoots',
    jewelry: 'adamantiteRing',
    jewelrySlot: 'ring',
  },
  // —— 53 lvl ——
  25029: {
    tier: '52_54',
    weapon: 'greatSword',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfHelmet',
    jewelry: 'adamantiteNecklace',
    jewelrySlot: 'necklace',
  },
  25481: {
    tier: '52_54',
    weapon: 'spellBreaker',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonGloves',
    jewelry: 'necklaceOfMana',
    jewelrySlot: 'necklace',
  },
  25509: {
    tier: '52_54',
    weapon: 'staffOfEvilSpirits',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonCirclet',
    jewelry: 'necklaceOfHolySpirit',
    jewelrySlot: 'necklace',
  },
  // —— 54 lvl ——
  25159: {
    tier: '52_54',
    weapon: 'wizardsTear',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonBoots',
    jewelry: 'paradiaEaring',
    jewelrySlot: 'earring',
  },
  // —— 55 lvl ——
  25434: {
    tier: '55_57',
    weapon: 'baguettesDualsword',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomHelmet',
    jewelry: 'ringOfGrace',
    jewelrySlot: 'ring',
  },
  25137: {
    tier: '55_57',
    weapon: 'spiritsStaff',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonGloves',
    jewelry: 'sagesNecklace',
    jewelrySlot: 'necklace',
  },
  25241: {
    tier: '55_57',
    weapon: 'guardianSword',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfGloves',
    shield: 'shieldOfPledge',
  },
  25070: {
    tier: '55_57',
    weapon: 'darkElvenLongBow',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomBoots',
    jewelry: 'elementalNecklace',
    jewelrySlot: 'necklace',
  },
  25259: {
    tier: '55_57',
    weapon: 'greatAxe',
    leggings: 'blueWolfGaiters',
    minorArmor: 'blueWolfHelmet',
    jewelry: 'earingOfBlackOre',
    jewelrySlot: 'earring',
  },
  25493: {
    tier: '55_57',
    weapon: 'swordOfValhalla',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonBoots',
    jewelry: 'anotherWorldsEaring',
    jewelrySlot: 'earring',
  },
  25475: {
    tier: '55_57',
    weapon: 'swordOfDamascus',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfHelmet',
    shield: 'doomShield',
  },
  25176: {
    tier: '55_57',
    weapon: 'hellKnife',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomGloves',
    jewelry: 'paradiaRing',
    jewelrySlot: 'ring',
  },
  25103: {
    tier: '55_57',
    weapon: 'kaimVanulsBones',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonCirclet',
    jewelry: 'earingOfHolySpirit',
    jewelrySlot: 'earring',
  },
  25280: {
    tier: '55_57',
    weapon: 'deadmansGlory',
    leggings: 'blueWolfGaiters',
    minorArmor: 'blueWolfBoots',
    jewelry: 'necklaceOfSummons',
    jewelrySlot: 'necklace',
  },
  25010: {
    tier: '55_57',
    weapon: 'arthroNail',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomHelmet',
    jewelry: 'elementalRing',
    jewelrySlot: 'ring',
  },
  // —— 56 lvl ——
  25122: {
    tier: '55_57',
    weapon: 'kris',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomBoots',
    jewelry: 'earingOfAssistance',
    jewelrySlot: 'earring',
  },
  25463: {
    tier: '55_57',
    weapon: 'lance',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfGloves',
    shield: 'shieldOfPledge',
  },
  // —— 57 lvl ——
  25230: {
    tier: '55_57',
    weapon: 'apprenticesSpellbook',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonGloves',
    jewelry: 'necklaceOfSolaEclipse',
    jewelrySlot: 'necklace',
  },
  // —— 58 lvl ——
  25032: {
    tier: '58_60',
    weapon: 'wizardsTear',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonCirclet',
    jewelry: 'paradiaNecklace',
    jewelrySlot: 'necklace',
  },
  // —— 59 lvl ——
  25089: {
    tier: '58_60',
    weapon: 'starBuster',
    leggings: 'blueWolfGaiters',
    minorArmor: 'blueWolfBoots',
    jewelry: 'adamantiteRing',
    jewelrySlot: 'ring',
  },
  25182: {
    tier: '58_60',
    weapon: 'staffOfEvilSpirits',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonGloves',
    jewelry: 'necklaceOfBlackOre',
    jewelrySlot: 'necklace',
  },
  25238: {
    tier: '58_60',
    weapon: 'darkElvenLongBow',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomGloves',
    jewelry: 'anotherWorldsEaring',
    jewelrySlot: 'earring',
  },
  29060: {
    tier: '58_60',
    weapon: 'iceStormHammer',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfHelmet',
    jewelry: 'necklaceOfGrace',
    jewelrySlot: 'necklace',
  },
  // —— 60 lvl ——
  25162: {
    tier: '58_60',
    weapon: 'greatAxe',
    mainArmor: 'blueWolfBreastplate',
    leggings: 'blueWolfGaiters',
    shield: 'shieldOfPledge',
  },
  25234: {
    tier: '58_60',
    weapon: 'bowOfPeril',
    mainArmor: 'leatherArmorOfDoom',
    minorArmor: 'doomHelmet',
    jewelry: 'elementalNecklace',
    jewelrySlot: 'necklace',
  },
  29056: {
    tier: '58_60',
    weapon: 'spiritsStaff',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonBoots',
    jewelry: 'sagesEaring',
    jewelrySlot: 'earring',
    jewelry2: 'sagesRing',
    jewelry2Slot: 'ring',
  },
  25106: {
    tier: '58_60',
    weapon: 'swordOfValhalla',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonCirclet',
    jewelry: 'paradiaNecklace',
    jewelrySlot: 'necklace',
    jewelry2: 'paradiaRing',
    jewelry2Slot: 'ring',
  },
  25407: {
    tier: '58_60',
    weapon: 'swordOfDamascus',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfGloves',
    shield: 'doomShield',
  },
  25256: {
    tier: '58_60',
    weapon: 'kaimVanulsBones',
    mainArmor: 'avadonRobe',
    minorArmor: 'avadonGloves',
    jewelry: 'necklaceOfHolySpirit',
    jewelrySlot: 'necklace',
    jewelry2: 'ringOfHolySpirit',
    jewelry2Slot: 'ring',
  },
  25016: {
    tier: '58_60',
    weapon: 'lance',
    leggings: 'blueWolfGaiters',
    minorArmor: 'blueWolfBoots',
    shield: 'avadonShield',
  },
  25179: {
    tier: '58_60',
    weapon: 'artOfBattleAxe',
    mainArmor: 'blueWolfBreastplate',
    minorArmor: 'blueWolfHelmet',
    shield: 'shieldOfPledge',
    jewelry: 'necklaceOfAssistance',
    jewelrySlot: 'necklace',
  },
};

function buildRb52_60DropBags(): Readonly<Record<number, NpcDropBag>> {
  const out: Record<number, NpcDropBag> = {};
  for (const [npcIdRaw, row] of Object.entries(RB_52_60_DROP_ROWS)) {
    const npcId = Number(npcIdRaw);
    const { tier, ...pick } = row;
    out[npcId] = buildRbDropBagB(npcId, TIER_BY_KEY[tier], pick);
  }
  return out;
}

export const RB_52_60_DROP_BAG_BY_NPC_ID = buildRb52_60DropBags();

export const RB_52_60_NPC_IDS = Object.keys(RB_52_60_DROP_ROWS).map(Number);

export const RB_52_60_BOSS_COUNT = RB_52_60_NPC_IDS.length;
