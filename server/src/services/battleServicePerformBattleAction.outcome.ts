import type { Prisma } from '@prisma/client';
import type { ActiveBuffEntry } from '../data/l2dopActiveBuffs.js';
import type { InventoryState } from '../data/inventory.js';
import type { SkillCooldownEntry } from '../data/skillCooldowns.js';
import type { BattleJsonState } from '../domain/battle.js';
import type { BattleSpawnMeta } from '../domain/battlePvpContext.js';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import { isSharedWorldBossKind } from '../domain/worldBossSession.js';
import {
  persistBattleContinueTurnInTx,
  persistBattleVictoryInTx,
} from './battleServiceBattleOutcomeTx.js';
import { resolveWorldBossVictoryInTx } from './battleServiceWorldBossVictory.js';
import { persistPvpVictoryInTx } from './battleServicePvpVictory.js';
import type { CharacterRow, CharacterSnapshot } from './charService.js';
import type {
  BattleDefeatSummary,
  BattleVictorySummary,
} from './battleServiceTypes.js';
import type {
  BattleActionDeltaResponse,
  BattleActionFullResponse,
  BattleActionResponse,
} from './battleServiceDeltaTypes.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';

type Tx = Prisma.TransactionClient;

export type BattleTurnPersistSide = {
  activeBuffsChanged: boolean;
  nextActiveBuffs: ActiveBuffEntry[];
  cooldownsChanged: boolean;
  nextCooldowns: SkillCooldownEntry[];
  inventoryDirty?: boolean;
  inv?: InventoryState;
  /** true — клієнт має зробити повний GET /battle (хотбар/бафи поза delta). */
  hotbarStale?: boolean;
  /** Лут/EXP за додаткові цілі AoE в цьому ж ході (до persist). */
  nearbyExtraEconomy?: import('./battleNearbyExtraMobLoot.js').NearbyExtraMobEconomyPatch;
};

export function battleTurnJsonExtras(
  side: BattleTurnPersistSide
): {
  activeBuffsJson?: Prisma.InputJsonValue;
  skillCooldownsJson?: Prisma.InputJsonValue;
  inventoryJson?: Prisma.InputJsonValue;
} {
  return {
    ...(side.activeBuffsChanged
      ? {
          activeBuffsJson:
            side.nextActiveBuffs as unknown as Prisma.InputJsonValue,
        }
      : {}),
    ...(side.cooldownsChanged
      ? {
          skillCooldownsJson:
            side.nextCooldowns as unknown as Prisma.InputJsonValue,
        }
      : {}),
    ...(side.inventoryDirty && side.inv
      ? { inventoryJson: side.inv as unknown as Prisma.InputJsonValue }
      : {}),
  };
}

export type BattleContinueTurnBase = {
  userId: string;
  expectedRevision: number;
  char: CharacterRow;
  bj: { spawnId: string };
  spawn: BattleSpawnMeta;
  preLevel: number;
  learnedBattle: string[];
  profAct: string;
  inv: InventoryState;
  st: BattleJsonState;
  playerHp: number;
  mobHp: number;
  log: string[];
  maxMpEff: number;
};

export async function persistBattleContinueFromTurn(
  tx: Tx,
  base: BattleContinueTurnBase,
  side: BattleTurnPersistSide,
  logLinesAdded: number
): Promise<BattleActionDeltaResponse> {
  return persistBattleContinueTurnInTx(tx, {
    ...base,
    ...battleTurnJsonExtras(side),
    logLinesAdded,
    hotbarStale: side.hotbarStale,
    nearbyExtraEconomy: side.nearbyExtraEconomy,
  });
}

/** mobHp <= 0: PvE/PvP перемога або null якщо бій триває. */
export async function resolveMobDeadVictoryInTx(
  tx: Tx,
  args: BattleContinueTurnBase & {
    cr: CharacterRow;
    currentMp: number;
    side: BattleTurnPersistSide;
  }
): Promise<BattleActionFullResponse | null> {
  if (args.mobHp > 0) return null;
  const extras = battleTurnJsonExtras(args.side);
  if (isPvpBattleJson(args.st)) {
    const v = await persistPvpVictoryInTx(tx, {
      userId: args.userId,
      expectedRevision: args.expectedRevision,
      char: args.char,
      spawn: args.spawn,
      preLevel: args.preLevel,
      playerHp: args.playerHp,
      currentMp: args.currentMp,
      st: args.st,
      log: args.log,
      ...extras,
    });
    return wrapVictoryAsFull({ ...v, battle: null });
  }
  if (isSharedWorldBossKind(args.spawn.kind)) {
    const wb = await resolveWorldBossVictoryInTx(tx, args);
    return wb ? wrapVictoryAsFull(wb) : null;
  }
  const v = await persistBattleVictoryInTx(tx, {
    userId: args.userId,
    expectedRevision: args.expectedRevision,
    char: args.char,
    bj: args.bj,
    spawn: args.spawn,
    inv: args.inv,
    cr: args.cr,
    preLevel: args.preLevel,
    playerHp: args.playerHp,
    currentMp: args.currentMp,
    st: args.st,
    log: args.log,
    ...extras,
    nearbyExtraEconomy: args.side.nearbyExtraEconomy,
  });
  return wrapVictoryAsFull({ ...v, battle: null });
}

export function wrapVictoryAsFull(v: {
  character: CharacterSnapshot;
  victory?: BattleVictorySummary;
  battle: null;
}): BattleActionFullResponse {
  return {
    kind: 'full',
    character: v.character,
    battle: null,
    victory: v.victory,
  };
}

export function wrapBattleDefeatAsDelta(d: {
  character: CharacterSnapshot;
  defeat: BattleDefeatSummary;
}): BattleActionDeltaResponse {
  const c = d.character;
  const fullLog = d.defeat.fullLog ?? [];
  return {
    kind: 'delta',
    revision: c.revision,
    characterId: c.id,
    delta: {
      changed: true,
      revision: c.revision,
      battleVersion: 0,
      characterHp: c.hp,
      characterMp: c.mp,
      characterMaxHp: c.maxHp,
      characterMaxMp: c.maxMp,
      outcome: 'DEFEAT',
      battleEnded: true,
      logTail: fullLog.slice(-MAX_BATTLE_LOG),
      logSeq: fullLog.length,
    },
    defeat: d.defeat,
  };
}

export type BattleTurnEndResult = BattleActionResponse;
