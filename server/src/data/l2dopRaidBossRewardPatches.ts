import type { DropEntry } from '../types/combatDrop.js';
import {
  RB_LV20_25_BOSSES,
  isRaidBossLv20_25NpcId,
} from './l2dopRaidBossLv20_25Catalog.js';

export interface RaidBossRewardSpec {
  adenaMin: number;
  adenaMax: number;
  expMin: number;
  expMax: number;
  spMin: number;
  spMax: number;
}

function rewardSpecFromExpSp(
  exp: number,
  sp: number,
  adena = 0
): RaidBossRewardSpec {
  return {
    adenaMin: adena,
    adenaMax: adena,
    expMin: exp,
    expMax: exp,
    spMin: sp,
    spMax: sp,
  };
}

const RB_LV20_25_REWARD_BY_NPC_ID: Readonly<Record<number, RaidBossRewardSpec>> =
  Object.fromEntries(
    RB_LV20_25_BOSSES.map((spec) => [
      spec.npcId,
      rewardSpecFromExpSp(spec.exp, spec.sp),
    ])
  );

/** EXP/SP/адена за кілл — окремі діапазони для кастомних РБ поза 20–25 band. */
const RAID_BOSS_REWARD_BY_NPC_ID: Readonly<Record<number, RaidBossRewardSpec>> = {
  ...RB_LV20_25_REWARD_BY_NPC_ID,
  /** Death Lord Shax — The Disciple's Necropolis (L2DOP tuning). */
  25282: {
    adenaMin: 5896,
    adenaMax: 7893,
    expMin: 5_231_148,
    expMax: 5_231_148,
    spMin: 237_779,
    spMax: 237_779,
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

export function raidBossAdenaDropEntry(npcId: number): DropEntry | undefined {
  const spec = RAID_BOSS_REWARD_BY_NPC_ID[npcId];
  if (spec != null && spec.adenaMax <= 0) return undefined;
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

export { isRaidBossLv20_25NpcId };
