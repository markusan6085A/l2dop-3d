import type { Prisma } from '@prisma/client';
import type { ActiveBuffEntry } from '../data/l2dopActiveBuffs.js';
import type { InventoryState } from '../data/inventory.js';
import type { SkillCooldownEntry } from '../data/skillCooldowns.js';
import type { BattleJsonState } from '../domain/battle.js';
import type { BattleSpawnMeta } from '../domain/battlePvpContext.js';
import { isPvpBattleJson } from '../domain/battlePvpContext.js';
import {
  persistBattleContinueTurnInTx,
  persistBattleVictoryInTx,
} from './battleServiceBattleOutcomeTx.js';
import { persistPvpVictoryInTx } from './battleServicePvpVictory.js';
import type { CharacterRow, CharacterSnapshot } from './charService.js';
import type {
  BattleDefeatSummary,
  BattleVictorySummary,
  BattleView,
} from './battleServiceTypes.js';

type Tx = Prisma.TransactionClient;

export type BattleTurnPersistSide = {
  activeBuffsChanged: boolean;
  nextActiveBuffs: ActiveBuffEntry[];
  cooldownsChanged: boolean;
  nextCooldowns: SkillCooldownEntry[];
  inventoryDirty?: boolean;
  inv?: InventoryState;
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
  side: BattleTurnPersistSide
): Promise<{ character: CharacterSnapshot; battle: BattleView }> {
  return persistBattleContinueTurnInTx(tx, {
    ...base,
    ...battleTurnJsonExtras(side),
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
): Promise<{
  character: CharacterSnapshot;
  victory: BattleVictorySummary;
  battle: null;
} | null> {
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
    return { ...v, battle: null };
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
  });
  return { ...v, battle: null };
}

export type BattleTurnEndResult = {
  character: CharacterSnapshot;
  battle: BattleView | null;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
};
