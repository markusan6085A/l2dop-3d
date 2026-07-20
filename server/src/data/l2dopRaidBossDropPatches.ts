import type { NpcDropBag } from './npcDropsResolved.js';
import {
  buildRbDropBagFromSpecs,
  RB20_ENCHANT_SCROLL_DROPS,
  RB_DROP_ITEM,
  withChance,
  type RaidBossDropSpec,
} from './l2dopRaidBossDropShared.js';
import { RB_21_39_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables21_39.js';
import { RB_40_51_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables40_51.js';
import { RB_52_60_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables52_60.js';
import { RB_61_75_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables61_75.js';
import { RB_76_87_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables76_87.js';

/** Отверженный Стражник (25372) — нормалізований D-grade набір. */
const RB_25372_DROPS: readonly RaidBossDropSpec[] = [
  withChance(RB_DROP_ITEM.knightsSword, 4),
  withChance(RB_DROP_ITEM.mithrilBreastplate, 7),
  withChance(RB_DROP_ITEM.glovesOfKnowledge, 9),
  withChance(RB_DROP_ITEM.bronzeShield, 6),
  withChance(RB_DROP_ITEM.blackPearlRing, 8),
];

/** Лорд Зомби Фаракелсус (25375) — нормалізований D-grade набір. */
const RB_25375_DROPS: readonly RaidBossDropSpec[] = [
  withChance(RB_DROP_ITEM.atubaHammer, 4),
  withChance(RB_DROP_ITEM.reinforcedLeatherShirt, 7),
  withChance(RB_DROP_ITEM.mithrilHelmet, 9),
  withChance(RB_DROP_ITEM.hoplon, 6),
  withChance(RB_DROP_ITEM.enchantedEaring, 7),
];

/** Зверь Безумия (25378) — нормалізований D-grade набір. */
const RB_25378_DROPS: readonly RaidBossDropSpec[] = [
  withChance(RB_DROP_ITEM.tripleEdgedJamadhr, 4),
  withChance(RB_DROP_ITEM.tunicOfKnowledge, 7),
  withChance(RB_DROP_ITEM.reinforcedHelmet, 9),
  withChance(RB_DROP_ITEM.bronzeShield, 6),
  withChance(RB_DROP_ITEM.necklaceOfDarkness, 6),
];

const RAID_BOSS_DROP_BAG_BY_NPC_ID: Readonly<Record<number, NpcDropBag>> = {
  25372: buildRbDropBagFromSpecs(25372, RB_25372_DROPS, RB20_ENCHANT_SCROLL_DROPS),
  25375: buildRbDropBagFromSpecs(25375, RB_25375_DROPS, RB20_ENCHANT_SCROLL_DROPS),
  25378: buildRbDropBagFromSpecs(25378, RB_25378_DROPS, RB20_ENCHANT_SCROLL_DROPS),
  ...RB_21_39_DROP_BAG_BY_NPC_ID,
  ...RB_40_51_DROP_BAG_BY_NPC_ID,
  ...RB_52_60_DROP_BAG_BY_NPC_ID,
  ...RB_61_75_DROP_BAG_BY_NPC_ID,
  ...RB_76_87_DROP_BAG_BY_NPC_ID,
};

export function customNpcDropBagForMob(npcId: number): NpcDropBag | undefined {
  return RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId];
}

export function hasCustomNpcDropBag(npcId: number | null | undefined): boolean {
  return npcId != null && RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId] !== undefined;
}
