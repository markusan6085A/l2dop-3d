import {
  RB_LV20_25_BOSSES,
  type RaidBossLv20_25Spec,
} from './l2dopRaidBossLv20_25Catalog.js';

/** Пер-npc перевизначення бойових статів РБ (атака/захист/HP), поверх формули mobCombatFromSpawn. */
export interface RaidBossCombatOverride {
  pAtk?: number;
  mAtk?: number;
  pDef?: number;
  mDef?: number;
  maxHp?: number;
}

function combatOverrideFromSpec(
  spec: RaidBossLv20_25Spec
): RaidBossCombatOverride {
  return {
    maxHp: spec.maxHp,
    pAtk: spec.pAtk,
    mAtk: spec.mAtk,
    pDef: spec.pDef,
    mDef: spec.mDef,
  };
}

const RAID_BOSS_COMBAT_BY_NPC_ID: Readonly<Record<number, RaidBossCombatOverride>> =
  Object.fromEntries(
    RB_LV20_25_BOSSES.map((spec) => [
      spec.npcId,
      combatOverrideFromSpec(spec),
    ])
  );

export function raidBossCombatOverrideForNpcId(
  npcId: number
): RaidBossCombatOverride | undefined {
  return RAID_BOSS_COMBAT_BY_NPC_ID[npcId];
}
