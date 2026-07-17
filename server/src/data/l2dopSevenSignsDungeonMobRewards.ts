import type { DropEntry } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { NECROPOLIS_OF_SACRIFICE_MOBS } from './sevenSignsDungeonMobCatalog.js';

export interface SevenSignsDungeonMobRewardSpec {
  exp: number;
  sp: number;
  adenaMin: number;
  adenaMax: number;
  adenaChance: number;
}

const ADENA_MIN = 248;
const ADENA_MAX = 896;
const ADENA_CHANCE = 0.7;

function spFromExp(exp: number): number {
  return Math.max(1, Math.floor(exp / 22));
}

const REWARD_BY_NPC_ID: Readonly<Record<number, SevenSignsDungeonMobRewardSpec>> =
  Object.fromEntries(
    NECROPOLIS_OF_SACRIFICE_MOBS.map((mob) => [
      mob.npcId,
      {
        exp: mob.exp,
        sp: spFromExp(mob.exp),
        adenaMin: ADENA_MIN,
        adenaMax: ADENA_MAX,
        adenaChance: ADENA_CHANCE,
      },
    ])
  );

function adenaDropEntry(npcId: number): DropEntry {
  const spec = REWARD_BY_NPC_ID[npcId];
  return {
    id: `sdms${npcId}_adena`,
    kind: 'adena',
    chance: spec?.adenaChance ?? ADENA_CHANCE,
    min: spec?.adenaMin ?? ADENA_MIN,
    max: spec?.adenaMax ?? ADENA_MAX,
    l2ItemId: 57,
    displayName: 'Adena',
  };
}

const DROP_BAG_BY_NPC_ID: Readonly<Record<number, NpcDropBag>> = Object.fromEntries(
  NECROPOLIS_OF_SACRIFICE_MOBS.map((mob) => [
    mob.npcId,
    {
      drops: [adenaDropEntry(mob.npcId)],
      spoil: [],
    },
  ])
);

export function isSevenSignsDungeonMobNpcId(npcId: number): boolean {
  return REWARD_BY_NPC_ID[npcId] != null;
}

export function sevenSignsDungeonMobRewardSpec(
  npcId: number
): SevenSignsDungeonMobRewardSpec | undefined {
  return REWARD_BY_NPC_ID[npcId];
}

export function customSevenSignsDungeonDropBagForMob(
  npcId: number
): NpcDropBag | undefined {
  return DROP_BAG_BY_NPC_ID[npcId];
}

export function hasSevenSignsDungeonDropBag(
  npcId: number | null | undefined
): boolean {
  return npcId != null && DROP_BAG_BY_NPC_ID[npcId] !== undefined;
}

export function rollSevenSignsDungeonKillReward(
  npcId: number
): { exp: number; sp: number } | undefined {
  const spec = REWARD_BY_NPC_ID[npcId];
  if (!spec) return undefined;
  return { exp: spec.exp, sp: spec.sp };
}

export function sevenSignsDungeonMobRewardPreviewForNpcId(
  npcId: number
): { expLabel: string; spLabel: string } | undefined {
  const spec = REWARD_BY_NPC_ID[npcId];
  if (!spec) return undefined;
  return {
    expLabel: spec.exp.toLocaleString('uk-UA'),
    spLabel: spec.sp.toLocaleString('uk-UA'),
  };
}

export function formatSevenSignsDungeonRewardExp(exp: number): string {
  return exp.toLocaleString('uk-UA');
}
