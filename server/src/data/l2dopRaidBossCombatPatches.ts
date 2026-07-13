/** Пер-npc перевизначення бойових статів РБ (атака/захист), поверх формули mobCombatFromSpawn. */
export interface RaidBossCombatOverride {
  pAtk?: number;
  mAtk?: number;
  pDef?: number;
  mDef?: number;
  maxHp?: number;
}

const RAID_BOSS_COMBAT_BY_NPC_ID: Readonly<Record<number, RaidBossCombatOverride>> = {
  /** Отверженный Стражник — 20 lvl */
  25372: { pAtk: 1655, mAtk: 480 },
  /** Лорд Зомби Фаракелсус — 20 lvl */
  25375: { pAtk: 1650, mAtk: 375 },
  /** Зверь Безумия — 20 lvl */
  25378: { pAtk: 2144, mAtk: 245 },
};

export function raidBossCombatOverrideForNpcId(
  npcId: number
): RaidBossCombatOverride | undefined {
  return RAID_BOSS_COMBAT_BY_NPC_ID[npcId];
}
