/** Підземелля драконів — конфіг босів (pure). */
export type DragonBossId = 'green' | 'blue' | 'red';

export type DragonBossConfig = {
  id: DragonBossId;
  nameUk: string;
  nameEn: string;
  titleEn: string;
  imageUrl: string;
  unlockCostDiamonds: number;
};

export const DRAGON_DUNGEON_BOSSES: Record<DragonBossId, DragonBossConfig> = {
  green: {
    id: 'green',
    nameUk: 'Зелений дракон',
    nameEn: 'Green Dragon',
    titleEn: 'Dragon of Venom',
    imageUrl: '/assets/Green_Dragon.jpg',
    unlockCostDiamonds: 35,
  },
  blue: {
    id: 'blue',
    nameUk: 'Синій дракон',
    nameEn: 'Blue Dragon',
    titleEn: 'Dragon of Storms',
    imageUrl: '/assets/Blue_Dragon.jpg',
    unlockCostDiamonds: 75,
  },
  red: {
    id: 'red',
    nameUk: 'Червоний дракон',
    nameEn: 'Red Dragon',
    titleEn: 'Dragon of Flame',
    imageUrl: '/assets/Red_Dragon.jpg',
    unlockCostDiamonds: 120,
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

export type DragonBossView = DragonBossConfig & {
  unlocked: boolean;
  canUnlock: boolean;
  missingDiamonds: number;
};

export function buildDragonBossView(
  boss: DragonBossConfig,
  diamonds: number,
  unlocked: boolean
): DragonBossView {
  const safeDiamonds = Math.max(0, Math.floor(diamonds));
  const cost = boss.unlockCostDiamonds;
  return {
    ...boss,
    unlocked,
    canUnlock: !unlocked && safeDiamonds >= cost,
    missingDiamonds: unlocked ? 0 : Math.max(0, cost - safeDiamonds),
  };
}
