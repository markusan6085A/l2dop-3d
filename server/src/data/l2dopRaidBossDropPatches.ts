import type { NpcDropBag } from './npcDropsResolved.js';
import {
  RB_LV20_25_EXP_ONLY_NPC_ID,
  RB_LV20_25_KEY_MATERIAL_DROP_BAG_BY_NPC_ID,
} from './dGradeWeaponKeyMaterialRaidDrops.js';
import { isRaidBossLv20_25NpcId } from './l2dopRaidBossLv20_25Catalog.js';import { RB_21_39_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables21_39.js';
import { RB_40_51_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables40_51.js';
import { RB_52_60_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables52_60.js';
import { RB_61_75_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables61_75.js';
import { RB_76_87_DROP_BAG_BY_NPC_ID } from './l2dopRaidBossDropTables76_87.js';

/** РБ 20–25 без key material (лише EXP/SP). */
const EXP_ONLY_RB_DROP_BAG: NpcDropBag = { drops: [], spoil: [] };

const RB_LV20_25_EXP_ONLY_DROP_BAGS: Readonly<Record<number, NpcDropBag>> = {
  [RB_LV20_25_EXP_ONLY_NPC_ID]: EXP_ONLY_RB_DROP_BAG,
};

const RAID_BOSS_DROP_BAG_BY_NPC_ID: Readonly<Record<number, NpcDropBag>> = {
  ...RB_21_39_DROP_BAG_BY_NPC_ID,
  ...RB_40_51_DROP_BAG_BY_NPC_ID,
  ...RB_52_60_DROP_BAG_BY_NPC_ID,
  ...RB_61_75_DROP_BAG_BY_NPC_ID,
  ...RB_76_87_DROP_BAG_BY_NPC_ID,
  ...RB_LV20_25_EXP_ONLY_DROP_BAGS,
  /** 14 РБ 20–25 з key material drop; Krool — лише EXP. */
  ...RB_LV20_25_KEY_MATERIAL_DROP_BAG_BY_NPC_ID,
};
export function customNpcDropBagForMob(npcId: number): NpcDropBag | undefined {
  return RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId];
}

export function hasCustomNpcDropBag(npcId: number | null | undefined): boolean {
  return npcId != null && RAID_BOSS_DROP_BAG_BY_NPC_ID[npcId] !== undefined;
}

export { isRaidBossLv20_25NpcId };
