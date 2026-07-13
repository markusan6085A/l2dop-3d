import type { DropEntry } from '../types/combatDrop.js';

export interface RaidBossRewardSpec {
  adenaMin: number;
  adenaMax: number;
  expMin: number;
  expMax: number;
  spMin: number;
  spMax: number;
}

/** EXP/SP/адена за кілл — окремі діапазони для кожного з трьох РБ 20 lvl. */
const RAID_BOSS_REWARD_BY_NPC_ID: Readonly<Record<number, RaidBossRewardSpec>> = {
  /** Отверженный Стражник */
  25372: {
    adenaMin: 20_000,
    adenaMax: 50_000,
    expMin: 150_000,
    expMax: 180_000,
    spMin: 45_000,
    spMax: 50_000,
  },
  /** Лорд Зомби Фаракелсус */
  25375: {
    adenaMin: 20_000,
    adenaMax: 50_000,
    expMin: 181_000,
    expMax: 215_000,
    spMin: 51_000,
    spMax: 55_000,
  },
  /** Зверь Безумия */
  25378: {
    adenaMin: 20_000,
    adenaMax: 50_000,
    expMin: 216_000,
    expMax: 250_000,
    spMin: 56_000,
    spMax: 60_000,
  },
};

function rollInt(min: number, max: number): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(lo + Math.random() * (hi - lo + 1));
}

function formatRewardRange(min: number, max: number): string {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  if (lo === hi) return lo.toLocaleString('uk-UA');
  return `${lo.toLocaleString('uk-UA')}–${hi.toLocaleString('uk-UA')}`;
}

export function raidBossRewardSpecForNpcId(
  npcId: number
): RaidBossRewardSpec | undefined {
  return RAID_BOSS_REWARD_BY_NPC_ID[npcId];
}

export function raidBossAdenaDropEntry(npcId: number): DropEntry {
  const spec = RAID_BOSS_REWARD_BY_NPC_ID[npcId];
  const min = spec?.adenaMin ?? 20_000;
  const max = spec?.adenaMax ?? 50_000;
  return {
    id: `rb${npcId}_adena`,
    kind: 'adena',
    chance: 1,
    min,
    max,
    chancePerMillion: 1_000_000,
    l2ItemId: 57,
    displayName: 'Adena',
  };
}

export function rollRaidBossKillReward(
  npcId: number
): { exp: number; sp: number } | undefined {
  const spec = RAID_BOSS_REWARD_BY_NPC_ID[npcId];
  if (!spec) return undefined;
  return {
    exp: rollInt(spec.expMin, spec.expMax),
    sp: rollInt(spec.spMin, spec.spMax),
  };
}

export function raidBossRewardPreviewForNpcId(npcId: number):
  | {
      expLabel: string;
      spLabel: string;
    }
  | undefined {
  const spec = RAID_BOSS_REWARD_BY_NPC_ID[npcId];
  if (!spec) return undefined;
  return {
    expLabel: formatRewardRange(spec.expMin, spec.expMax),
    spLabel: formatRewardRange(spec.spMin, spec.spMax),
  };
}
