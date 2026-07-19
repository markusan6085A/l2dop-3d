/** Підземелля драконів — єдиний серверний конфіг (pure). */
export type DragonBossId = 'green' | 'blue' | 'red';

export type DragonBossReward = {
  adena: number;
  coinOfLuck: number;
  clanReputation: number;
};

export type DragonBossCombatConfig = {
  normalAttackPctMaxHp: number;
  normalAttackMin: number;
  normalAttackMax: number;
  normalAttackIntervalSeconds: number;
  specialIntervalSeconds: number;
  stunChance: number;
  stunDurationSeconds: number;
  cancelChance: number;
  cancelBuffCount: number;
  mobLevel: number;
  mobPDef: number;
  mobMDef: number;
};

export type DragonBossConfig = {
  id: DragonBossId;
  nameUk: string;
  nameEn: string;
  titleEn: string;
  imageUrl: string;
  unlockCostDiamonds: number;
  maxHp: number;
  durationHours: number;
  battleDurationSeconds: number;
  entryCooldownSeconds: number;
  reward: DragonBossReward;
  combat: DragonBossCombatConfig;
};

const SHARED_COMBAT: Omit<DragonBossCombatConfig, 'normalAttackPctMaxHp'> = {
  normalAttackMin: 50,
  normalAttackMax: 5000,
  normalAttackIntervalSeconds: 3,
  specialIntervalSeconds: 6,
  stunChance: 0.35,
  stunDurationSeconds: 3,
  cancelChance: 0.1,
  cancelBuffCount: 1,
  mobLevel: 80,
  mobPDef: 800,
  mobMDef: 600,
};

export const DRAGON_DUNGEON_BOSSES: Record<DragonBossId, DragonBossConfig> = {
  green: {
    id: 'green',
    nameUk: 'Зелений дракон',
    nameEn: 'Green Dragon',
    titleEn: 'Dragon of Venom',
    imageUrl: '/assets/Green_Dragon.jpg',
    unlockCostDiamonds: 35,
    maxHp: 150_000,
    durationHours: 24,
    battleDurationSeconds: 600,
    entryCooldownSeconds: 14_400,
    reward: { adena: 10_000_000, coinOfLuck: 10, clanReputation: 50 },
    combat: { ...SHARED_COMBAT, normalAttackPctMaxHp: 0.02 },
  },
  blue: {
    id: 'blue',
    nameUk: 'Синій дракон',
    nameEn: 'Blue Dragon',
    titleEn: 'Dragon of Storms',
    imageUrl: '/assets/Blue_Dragon.jpg',
    unlockCostDiamonds: 75,
    maxHp: 400_000,
    durationHours: 24,
    battleDurationSeconds: 600,
    entryCooldownSeconds: 14_400,
    reward: { adena: 15_000_000, coinOfLuck: 25, clanReputation: 100 },
    combat: { ...SHARED_COMBAT, normalAttackPctMaxHp: 0.03 },
  },
  red: {
    id: 'red',
    nameUk: 'Червоний дракон',
    nameEn: 'Red Dragon',
    titleEn: 'Dragon of Flame',
    imageUrl: '/assets/Red_Dragon.jpg',
    unlockCostDiamonds: 120,
    maxHp: 800_000,
    durationHours: 24,
    battleDurationSeconds: 600,
    entryCooldownSeconds: 14_400,
    reward: { adena: 20_000_000, coinOfLuck: 40, clanReputation: 150 },
    combat: { ...SHARED_COMBAT, normalAttackPctMaxHp: 0.04 },
  },
};

export const DRAGON_DUNGEON_BOSS_ORDER: DragonBossId[] = ['green', 'blue', 'red'];

export function parseDragonBossId(raw: unknown): DragonBossId | null {
  const id = String(raw ?? '').trim().toLowerCase();
  if (id === 'green' || id === 'blue' || id === 'red') return id;
  return null;
}

export function getDragonBossConfig(id: DragonBossId): DragonBossConfig {
  return DRAGON_DUNGEON_BOSSES[id];
}

export function dragonHpPercent(currentHp: bigint, maxHp: bigint): number {
  if (maxHp <= 0n) return 0;
  const pct = (Number(currentHp) / Number(maxHp)) * 100;
  return Math.max(0, Math.min(100, Math.round(pct * 100) / 100));
}

export function remainingSecondsUntil(target: Date | null, now = new Date()): number {
  if (!target) return 0;
  return Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
}

export type DragonBossListItem = {
  id: DragonBossId;
  nameUk: string;
  nameEn: string;
  titleEn: string;
  imageUrl: string;
  unlockCostDiamonds: number;
  reward: DragonBossReward;
  canUnlock: boolean;
  lockedReason: string | null;
};

export function buildDragonBossListItem(
  boss: DragonBossConfig,
  opts: {
    isLeader: boolean;
    clanDiamonds: number;
    hasActiveDragon: boolean;
    inClan: boolean;
  }
): DragonBossListItem {
  const base = {
    id: boss.id,
    nameUk: boss.nameUk,
    nameEn: boss.nameEn,
    titleEn: boss.titleEn,
    imageUrl: boss.imageUrl,
    unlockCostDiamonds: boss.unlockCostDiamonds,
    reward: boss.reward,
  };
  if (!opts.inClan) {
    return { ...base, canUnlock: false, lockedReason: 'clan_required' };
  }
  if (!opts.isLeader) {
    return { ...base, canUnlock: false, lockedReason: 'clan_leader_required' };
  }
  if (opts.hasActiveDragon) {
    return { ...base, canUnlock: false, lockedReason: 'dragon_already_active' };
  }
  if (opts.clanDiamonds < boss.unlockCostDiamonds) {
    return { ...base, canUnlock: false, lockedReason: 'clan_diamonds_insufficient' };
  }
  return { ...base, canUnlock: true, lockedReason: null };
}
