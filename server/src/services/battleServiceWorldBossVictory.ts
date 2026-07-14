import { Prisma } from '@prisma/client';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { parseInventory } from '../data/inventory.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';
import { resolveBattleSpawnMeta } from '../domain/battlePvpContext.js';
import {
  isWorldBossLootIssued,
  pickWorldBossTopDamageDealer,
} from '../domain/worldBossSession.js';
import { worldCombatStateFromBattleJson } from '../domain/worldCombatState.js';
import { persistBattleVictoryInTx } from './battleServiceBattleOutcomeTx.js';
import {
  battleTurnJsonExtras,
  type BattleContinueTurnBase,
  type BattleTurnPersistSide,
} from './battleServicePerformBattleAction.outcome.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  combatOptsFromRow,
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
  type CharacterSnapshot,
} from './charService.js';
import { mutateCharacterWithRevision } from './characterMutation.js';
import type { BattleVictorySummary } from './battleServiceTypes.js';
import {
  lockWorldBossSessionInTx,
  tryClaimWorldBossLootInTx,
} from './worldBossSessionService.js';

type Tx = Prisma.TransactionClient;

type WorldBossVictoryArgs = BattleContinueTurnBase & {
  cr: CharacterRow;
  currentMp: number;
  side: BattleTurnPersistSide;
};

async function persistWorldBossBattleEndInTx(
  tx: Tx,
  args: {
    char: CharacterRow;
    expectedRevision: number | null;
    st: BattleContinueTurnBase['st'];
    playerHp: number;
    currentMp: number;
    log: string[];
    side?: BattleTurnPersistSide;
  }
): Promise<CharacterSnapshot> {
  const { char, expectedRevision, st, playerHp, currentMp, log, side } = args;
  const effLv = levelFromTotalExp(char.exp);
  const inv = parseInventory(char.inventoryJson);
  const combat = computeCombatStats(
    effLv,
    char.race,
    char.classBranch,
    inv,
    combatOptsFromRow(char)
  );
  const vit = computeVitals(
    effLv,
    char.race,
    char.classBranch,
    combat.con,
    combat.men
  );
  const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const maxMpAfter = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const stWorld = {
    ...st,
    log: log.slice(-MAX_BATTLE_LOG),
    playerMp: Math.min(maxMpAfter, currentMp),
  };
  const worldEnd = worldCombatStateFromBattleJson(
    stWorld,
    maxMpAfter,
    Date.now()
  );
  const extras = side ? battleTurnJsonExtras(side) : {};
  const result = await mutateCharacterWithRevision(
    tx,
    char.id,
    expectedRevision,
    () => ({
      changed: true,
      data: {
        hp: Math.max(1, Math.min(maxHpEff, playerHp)),
        battleJson: Prisma.JsonNull,
        worldCombatStateJson:
          worldEnd != null
            ? (JSON.parse(JSON.stringify(worldEnd)) as Prisma.InputJsonValue)
            : Prisma.JsonNull,
        ...(extras.activeBuffsJson !== undefined
          ? { activeBuffsJson: extras.activeBuffsJson }
          : {}),
        ...(extras.skillCooldownsJson !== undefined
          ? { skillCooldownsJson: extras.skillCooldownsJson }
          : {}),
        ...(extras.inventoryJson !== undefined
          ? { inventoryJson: extras.inventoryJson }
          : {}),
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return toSnapshot(result.character as CharacterRow);
}

async function resolveLootRecipientNameInTx(
  tx: Tx,
  recipientId: string | null | undefined
): Promise<string | null> {
  if (!recipientId) return null;
  const row = await tx.character.findUnique({
    where: { id: recipientId },
    select: { name: true },
  });
  return row?.name ?? null;
}

async function endWorldBossParticipantWithoutLootInTx(
  tx: Tx,
  characterId: string,
  spawnId: string,
  topDealerName: string
): Promise<void> {
  const row = await tx.character.findUnique({ where: { id: characterId } });
  if (!row) return;
  const bj = parseBattleJson(row.battleJson);
  if (!bj || bj.spawnId !== spawnId) return;
  const spawn = resolveBattleSpawnMeta(bj);
  if (!spawn) return;
  const log = [
    ...(bj.log ?? []),
    'Бос переможений! Найбільше урону: ' + topDealerName + '.',
  ];
  await persistWorldBossBattleEndInTx(tx, {
    char: row as CharacterRow,
    expectedRevision: row.revision,
    st: bj,
    playerHp: row.hp,
    currentMp: bj.playerMp ?? 0,
    log,
  });
}

/** Повторний kill / concurrent replay: бій завершується без EXP/луту/adena/mobsKilled. */
async function finishWorldBossVictoryIdempotentInTx(
  tx: Tx,
  args: WorldBossVictoryArgs,
  lootRecipientName: string | null
): Promise<{
  character: CharacterSnapshot;
  battle: null;
}> {
  const msg = lootRecipientName
    ? 'Бос уже переможений! Нагороду отримав: ' + lootRecipientName + '.'
    : 'Бос уже переможений.';
  const log = [...args.log, msg];
  const snap = await persistWorldBossBattleEndInTx(tx, {
    char: args.char,
    expectedRevision: args.expectedRevision,
    st: args.st,
    playerHp: args.playerHp,
    currentMp: args.currentMp,
    log,
    side: args.side,
  });
  return { character: snap, battle: null };
}

/** РБ/епік: лут/EXP/SP/adena — гравцю з max totalDamageDealt, не killing blow. */
export async function resolveWorldBossVictoryInTx(
  tx: Tx,
  args: WorldBossVictoryArgs
): Promise<{
  character: CharacterSnapshot;
  victory?: BattleVictorySummary;
  battle: null;
}> {
  const nowMs = Date.now();
  const session = await lockWorldBossSessionInTx(tx, args.bj.spawnId);

  if (!session || isWorldBossLootIssued(session)) {
    const recipientName = await resolveLootRecipientNameInTx(
      tx,
      session?.lootRecipientCharacterId
    );
    return finishWorldBossVictoryIdempotentInTx(tx, args, recipientName);
  }

  if (session.mobHp > 0) {
    return finishWorldBossVictoryIdempotentInTx(tx, args, null);
  }

  const topDealerId =
    pickWorldBossTopDamageDealer(session) ?? args.char.id;
  const topDealerRow = await tx.character.findUnique({
    where: { id: topDealerId },
  });
  const lootRecipientId = topDealerRow ? topDealerId : args.char.id;

  const claimed = await tryClaimWorldBossLootInTx(
    tx,
    session,
    lootRecipientId,
    nowMs
  );
  if (!claimed) {
    const recipientName = await resolveLootRecipientNameInTx(
      tx,
      session.lootRecipientCharacterId
    );
    return finishWorldBossVictoryIdempotentInTx(tx, args, recipientName);
  }

  const participantIds = Object.keys(session.participants);
  const recipientName =
    (lootRecipientId === topDealerId && topDealerRow
      ? topDealerRow.name
      : args.char.name) ?? args.char.name;

  if (lootRecipientId === args.char.id) {
    const extras = battleTurnJsonExtras(args.side);
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
    for (const pid of participantIds) {
      if (pid === args.char.id) continue;
      await endWorldBossParticipantWithoutLootInTx(
        tx,
        pid,
        args.bj.spawnId,
        args.char.name
      );
    }
    return { ...v, battle: null };
  }

  if (!topDealerRow) {
    const extras = battleTurnJsonExtras(args.side);
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

  args.log.push(
    'Бос переможений! Найбільше урону: ' +
      topDealerRow.name +
      ' — нагорода йому.'
  );

  const topBj = parseBattleJson(topDealerRow.battleJson);
  const topSt = topBj ?? args.st;
  const topInv = parseInventory(topDealerRow.inventoryJson);
  const topPreLevel = levelFromTotalExp(topDealerRow.exp);

  await persistBattleVictoryInTx(tx, {
    userId: topDealerRow.userId,
    expectedRevision: topDealerRow.revision,
    char: topDealerRow as CharacterRow,
    bj: { spawnId: args.bj.spawnId },
    spawn: args.spawn,
    inv: topInv,
    cr: topDealerRow as CharacterRow,
    preLevel: topPreLevel,
    playerHp: topDealerRow.hp,
    currentMp: topSt.playerMp ?? args.currentMp,
    st: topSt,
    log: ['Перемога! Найбільше урону по ' + args.spawn.name + '.'],
  });

  const killerSnap = await persistWorldBossBattleEndInTx(tx, {
    char: args.char,
    expectedRevision: args.expectedRevision,
    st: args.st,
    playerHp: args.playerHp,
    currentMp: args.currentMp,
    log: args.log,
    side: args.side,
  });

  for (const pid of participantIds) {
    if (pid === lootRecipientId || pid === args.char.id) continue;
    await endWorldBossParticipantWithoutLootInTx(
      tx,
      pid,
      args.bj.spawnId,
      recipientName
    );
  }

  return { character: killerSnap, battle: null };
}
