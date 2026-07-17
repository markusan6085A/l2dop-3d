import type { DropEntry } from '../types/combatDrop.js';
import type { NpcDropBag } from './npcDropsResolved.js';
import { sealStoneDropEntriesForDungeonMob } from './sevenSignsSealStoneItems.js';
import { SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON } from './sevenSignsDungeonMobCatalog.js';
import { getDungeonMobSpawnById } from './sevenSignsDungeonMobSpawns.js';

export interface SevenSignsDungeonMobRewardSpec {
  exp: number;
  sp: number;
  adenaMin: number;
  adenaMax: number;
  adenaChance: number;
}

interface DungeonAdenaReward {
  adenaMin: number;
  adenaMax: number;
  adenaChance: number;
}

const DUNGEON_ADENA_BY_ID: Readonly<Record<string, DungeonAdenaReward>> = {
  necropolis_of_sacrifice: {
    adenaMin: 248,
    adenaMax: 896,
    adenaChance: 0.7,
  },
  pilgrims_necropolis: {
    adenaMin: 485,
    adenaMax: 1152,
    adenaChance: 0.7,
  },
  necropolis_of_worship: {
    adenaMin: 789,
    adenaMax: 1752,
    adenaChance: 0.7,
  },
  patriots_necropolis: {
    adenaMin: 1240,
    adenaMax: 1980,
    adenaChance: 0.7,
  },
  necropolis_of_devotion: {
    adenaMin: 1852,
    adenaMax: 2874,
    adenaChance: 0.7,
  },
  necropolis_of_martyrdom: {
    adenaMin: 2589,
    adenaMax: 3156,
    adenaChance: 0.7,
  },
  saints_necropolis: {
    adenaMin: 4582,
    adenaMax: 6589,
    adenaChance: 0.7,
  },
  disciples_necropolis: {
    adenaMin: 5896,
    adenaMax: 7893,
    adenaChance: 0.7,
  },
  catacomb_of_the_heretic: {
    adenaMin: 1456,
    adenaMax: 2322,
    adenaChance: 0.7,
  },
  catacomb_of_the_branded: {
    adenaMin: 2145,
    adenaMax: 2988,
    adenaChance: 0.7,
  },
  catacomb_of_the_apostate: {
    adenaMin: 2896,
    adenaMax: 3589,
    adenaChance: 0.7,
  },
  catacomb_of_the_witch: {
    adenaMin: 3547,
    adenaMax: 4899,
    adenaChance: 0.7,
  },
  catacomb_of_dark_omens: {
    adenaMin: 6841,
    adenaMax: 8562,
    adenaChance: 0.7,
  },
  catacomb_of_the_forbidden_path: {
    adenaMin: 7825,
    adenaMax: 9850,
    adenaChance: 0.7,
  },
};

const DEFAULT_ADENA: DungeonAdenaReward = {
  adenaMin: 248,
  adenaMax: 896,
  adenaChance: 0.7,
};

function dungeonNpcKey(dungeonId: string, npcId: number): string {
  return `${dungeonId}:${npcId}`;
}

function spFromExp(exp: number): number {
  return Math.max(1, Math.floor(exp / 22));
}

function adenaDropEntry(
  npcId: number,
  adena: DungeonAdenaReward
): DropEntry {
  return {
    id: `sdms${npcId}_adena`,
    kind: 'adena',
    chance: adena.adenaChance,
    min: adena.adenaMin,
    max: adena.adenaMax,
    l2ItemId: 57,
    displayName: 'Adena',
  };
}

function buildRewardTables(): {
  rewardByDungeonNpc: Record<string, SevenSignsDungeonMobRewardSpec>;
  dropBagByDungeonNpc: Record<string, NpcDropBag>;
  dungeonNpcIds: Set<number>;
} {
  const rewardByDungeonNpc: Record<string, SevenSignsDungeonMobRewardSpec> = {};
  const dropBagByDungeonNpc: Record<string, NpcDropBag> = {};
  const dungeonNpcIds = new Set<number>();

  for (const [dungeonId, mobs] of Object.entries(
    SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON
  )) {
    const adena = DUNGEON_ADENA_BY_ID[dungeonId] ?? DEFAULT_ADENA;
    for (const mob of mobs) {
      const key = dungeonNpcKey(dungeonId, mob.npcId);
      dungeonNpcIds.add(mob.npcId);
      rewardByDungeonNpc[key] = {
        exp: mob.exp,
        sp: spFromExp(mob.exp),
        adenaMin: adena.adenaMin,
        adenaMax: adena.adenaMax,
        adenaChance: adena.adenaChance,
      };
      dropBagByDungeonNpc[key] = {
        drops: [
          adenaDropEntry(mob.npcId, adena),
          ...sealStoneDropEntriesForDungeonMob(dungeonId, mob.npcId),
        ],
        spoil: [],
      };
    }
  }

  return { rewardByDungeonNpc, dropBagByDungeonNpc, dungeonNpcIds };
}

const {
  rewardByDungeonNpc: REWARD_BY_DUNGEON_NPC,
  dropBagByDungeonNpc: DROP_BAG_BY_DUNGEON_NPC,
  dungeonNpcIds: DUNGEON_MOB_NPC_IDS,
} = buildRewardTables();

function resolveDungeonNpcKey(
  npcId: number,
  spawnId?: string | null
): string | undefined {
  const sid = String(spawnId || '').trim();
  if (sid) {
    const sp = getDungeonMobSpawnById(sid);
    if (sp?.npcId === npcId) {
      return dungeonNpcKey(sp.dungeonId, npcId);
    }
  }
  for (const dungeonId of Object.keys(SEVEN_SIGNS_DUNGEON_MOB_TYPES_BY_DUNGEON)) {
    const key = dungeonNpcKey(dungeonId, npcId);
    if (REWARD_BY_DUNGEON_NPC[key]) return key;
  }
  return undefined;
}

function rewardSpecForNpc(
  npcId: number,
  spawnId?: string | null
): SevenSignsDungeonMobRewardSpec | undefined {
  const key = resolveDungeonNpcKey(npcId, spawnId);
  return key != null ? REWARD_BY_DUNGEON_NPC[key] : undefined;
}

export function isSevenSignsDungeonMobNpcId(npcId: number): boolean {
  return DUNGEON_MOB_NPC_IDS.has(npcId);
}

export function sevenSignsDungeonMobRewardSpec(
  npcId: number,
  spawnId?: string | null
): SevenSignsDungeonMobRewardSpec | undefined {
  return rewardSpecForNpc(npcId, spawnId);
}

export function customSevenSignsDungeonDropBagForMob(
  npcId: number,
  spawnId?: string | null
): NpcDropBag | undefined {
  const key = resolveDungeonNpcKey(npcId, spawnId);
  return key != null ? DROP_BAG_BY_DUNGEON_NPC[key] : undefined;
}

export function hasSevenSignsDungeonDropBag(
  npcId: number | null | undefined,
  spawnId?: string | null
): boolean {
  return (
    npcId != null &&
    customSevenSignsDungeonDropBagForMob(npcId, spawnId) !== undefined
  );
}

export function rollSevenSignsDungeonKillReward(
  npcId: number,
  spawnId?: string | null
): { exp: number; sp: number } | undefined {
  const spec = rewardSpecForNpc(npcId, spawnId);
  if (!spec) return undefined;
  return { exp: spec.exp, sp: spec.sp };
}

export function sevenSignsDungeonMobRewardPreviewForNpcId(
  npcId: number,
  spawnId?: string | null
): { expLabel: string; spLabel: string } | undefined {
  const spec = rewardSpecForNpc(npcId, spawnId);
  if (!spec) return undefined;
  return {
    expLabel: spec.exp.toLocaleString('uk-UA'),
    spLabel: spec.sp.toLocaleString('uk-UA'),
  };
}

export function formatSevenSignsDungeonRewardExp(exp: number): string {
  return exp.toLocaleString('uk-UA');
}
