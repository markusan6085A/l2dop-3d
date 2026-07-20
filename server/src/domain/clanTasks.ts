/** Кланові завдання — єдиний серверний конфіг. */

export type ClanTaskProgressType =
  | 'ADENA_EARNED_FROM_PVE'
  | 'MONSTER_KILLS'
  | 'SP_EARNED_FROM_MONSTERS'
  | 'RAID_BOSS_KILLS'
  | 'SIEGE_WALL_DAMAGE';

export type ClanTaskId =
  | 'earn_adena'
  | 'kill_monsters'
  | 'earn_sp_from_monsters'
  | 'kill_raid_boss'
  | 'damage_siege_wall';

export type ClanTaskPersonalReward = {
  exp: number;
  adena: number;
  coinOfLuck: number;
};

export type ClanTaskDefinition = {
  id: ClanTaskId;
  nameUk: string;
  descriptionUk: string;
  progressType: ClanTaskProgressType;
  target: number;
  progressLabel: string;
  personalReward: ClanTaskPersonalReward;
  clanRewardDiamonds: number;
};

export const CLAN_TASK_ORDER: readonly ClanTaskId[] = [
  'earn_adena',
  'kill_monsters',
  'earn_sp_from_monsters',
  'kill_raid_boss',
  'damage_siege_wall',
] as const;

export const CLAN_TASK_DEFINITIONS: Record<ClanTaskId, ClanTaskDefinition> = {
  earn_adena: {
    id: 'earn_adena',
    nameUk: 'Постачання скарбниці',
    descriptionUk: 'Заробіть 150 000 адени під час полювання.',
    progressType: 'ADENA_EARNED_FROM_PVE',
    target: 150_000,
    progressLabel: 'адени',
    personalReward: { exp: 50_000, adena: 0, coinOfLuck: 0 },
    clanRewardDiamonds: 3,
  },
  kill_monsters: {
    id: 'kill_monsters',
    nameUk: 'Велике полювання',
    descriptionUk: 'Знищіть 500 звичайних монстрів.',
    progressType: 'MONSTER_KILLS',
    target: 500,
    progressLabel: 'монстрів',
    personalReward: { exp: 0, adena: 0, coinOfLuck: 1 },
    clanRewardDiamonds: 4,
  },
  earn_sp_from_monsters: {
    id: 'earn_sp_from_monsters',
    nameUk: 'Сила духу',
    descriptionUk: 'Заробіть 100 000 SP у боях зі звичайними монстрами.',
    progressType: 'SP_EARNED_FROM_MONSTERS',
    target: 100_000,
    progressLabel: 'SP',
    personalReward: { exp: 0, adena: 100_000, coinOfLuck: 0 },
    clanRewardDiamonds: 5,
  },
  kill_raid_boss: {
    id: 'kill_raid_boss',
    nameUk: 'Виклик рейдового боса',
    descriptionUk:
      'Візьміть участь у перемозі над одним рейдовим босом відповідного рівня.',
    progressType: 'RAID_BOSS_KILLS',
    target: 1,
    progressLabel: 'рейдовий бос',
    personalReward: { exp: 140_000, adena: 0, coinOfLuck: 0 },
    clanRewardDiamonds: 7,
  },
  damage_siege_wall: {
    id: 'damage_siege_wall',
    nameUk: 'Штурм міської стіни',
    descriptionUk: 'Завдайте разом 50 000 урону стіні під час кланової облоги.',
    progressType: 'SIEGE_WALL_DAMAGE',
    target: 50_000,
    progressLabel: 'урону стіні',
    personalReward: { exp: 200_000, adena: 0, coinOfLuck: 2 },
    clanRewardDiamonds: 10,
  },
};

import { MAX_RAID_BOSS_OVERLEVEL } from './raidBossLevelRestriction.js';

/** Макс. перевищення рівня гравця над РБ для kill_raid_boss (канон = обмеження атаки). */
export const CLAN_TASK_RAID_BOSS_LEVEL_TOLERANCE = MAX_RAID_BOSS_OVERLEVEL;

export function parseClanTaskId(raw: string | undefined | null): ClanTaskId | null {
  if (!raw) return null;
  return raw in CLAN_TASK_DEFINITIONS ? (raw as ClanTaskId) : null;
}

export function getClanTaskDefinition(taskType: ClanTaskId): ClanTaskDefinition {
  return CLAN_TASK_DEFINITIONS[taskType];
}

export function clanTaskProgressTypeForId(taskType: ClanTaskId): ClanTaskProgressType {
  return CLAN_TASK_DEFINITIONS[taskType].progressType;
}
