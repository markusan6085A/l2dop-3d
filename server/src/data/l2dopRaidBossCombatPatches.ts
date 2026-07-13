/** Пер-npc перевизначення бойових статів РБ (атака/захист), поверх формули mobCombatFromSpawn. */
export interface RaidBossCombatOverride {
  pAtk?: number;
  mAtk?: number;
  pDef?: number;
  mDef?: number;
  maxHp?: number;
}

const RAID_BOSS_COMBAT_BY_NPC_ID: Readonly<Record<number, RaidBossCombatOverride>> = {
  /** Отверженный Стражник — 20 lvl (−30% урон) */
  25372: { pAtk: 1159, mAtk: 336 },
  /** Лорд Зомби Фаракелсус — 20 lvl (−30% урон) */
  25375: { pAtk: 1155, mAtk: 263 },
  /** Зверь Безумия — 20 lvl (−30% урон) */
  25378: { pAtk: 1501, mAtk: 172 },
};

export function raidBossCombatOverrideForNpcId(
  npcId: number
): RaidBossCombatOverride | undefined {
  return RAID_BOSS_COMBAT_BY_NPC_ID[npcId];
}
