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
import { pickWorldBossTopDamageDealer } from '../domain/worldBossSession.js';
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
import { lockWorldBossSessionInTx } from './worldBossSessionService.js';

type Tx = Prisma.TransactionClient;

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
    expectedRevision: null,
    st: bj,
    playerHp: row.hp,
    currentMp: bj.playerMp ?? 0,
    log,
  });
}

/** РБ/епік: лут/EXP/SP/adena — гравцю з max totalDamageDealt, не killing blow. */
export async function resolveWorldBossVictoryInTx(
  tx: Tx,
  args: BattleContinueTurnBase & {
    cr: CharacterRow;
    currentMp: number;
    side: BattleTurnPersistSide;
  }
): Promise<{
  character: CharacterSnapshot;
  victory?: BattleVictorySummary;
  battle: null;
}> {
  const session = await lockWorldBossSessionInTx(tx, args.bj.spawnId);
  const topDealerId =
    (session ? pickWorldBossTopDamageDealer(session) : null) ?? args.char.id;
  const participantIds = session
    ? Object.keys(session.participants)
    : [args.char.id];

  if (topDealerId === args.char.id) {
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

  const topDealerRow = await tx.character.findUnique({
    where: { id: topDealerId },
  });
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

  const topDealerName = topDealerRow.name;
  args.log.push(
    'Бос переможений! Найбільше урону: ' +
      topDealerName +
      ' — нагорода йому.'
  );

  const topBj = parseBattleJson(topDealerRow.battleJson);
  const topSt = topBj ?? args.st;
  const topInv = parseInventory(topDealerRow.inventoryJson);
  const topPreLevel = levelFromTotalExp(topDealerRow.exp);

  await persistBattleVictoryInTx(tx, {
    userId: topDealerRow.userId,
    expectedRevision: null,
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
    if (pid === topDealerId || pid === args.char.id) continue;
    await endWorldBossParticipantWithoutLootInTx(
      tx,
      pid,
      args.bj.spawnId,
      topDealerName
    );
  }

  return { character: killerSnap, battle: null };
}
