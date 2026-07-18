import { Prisma } from '@prisma/client';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { addItemToBag, parseInventory } from '../data/inventory.js';
import { rollKillLoot, type KillLootResult } from '../domain/killLoot.js';
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
import { resolveL2dopNpcIdByMobName } from './spawnCatalogService.js';
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
  forceWorldBossSessionMobHpZeroInTx,
  deleteWorldBossSession,
} from './worldBossSessionService.js';
import { creditDailyQuestRaidBossParticipationInTx } from './dailyQuestProgressService.js';
import { creditRaidBossKillInTx } from './ratingsStatsService.js';

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
    inventoryJson?: Prisma.InputJsonValue;
  }
): Promise<CharacterSnapshot> {
  const { char, expectedRevision, st, playerHp, currentMp, log, side, inventoryJson } =
    args;
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
        ...(inventoryJson !== undefined ? { inventoryJson } : {}),
        ...(extras.activeBuffsJson !== undefined
          ? { activeBuffsJson: extras.activeBuffsJson }
          : {}),
        ...(extras.skillCooldownsJson !== undefined
          ? { skillCooldownsJson: extras.skillCooldownsJson }
          : {}),
        ...(extras.inventoryJson !== undefined && inventoryJson === undefined
          ? { inventoryJson: extras.inventoryJson }
          : {}),
      },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return toSnapshot(result.character as CharacterRow);
}

async function resolveCharacterNameInTx(
  tx: Tx,
  characterId: string | null | undefined
): Promise<string | null> {
  if (!characterId) return null;
  const row = await tx.character.findUnique({
    where: { id: characterId },
    select: { name: true },
  });
  return row?.name ?? null;
}

function itemLogLinesFromLoot(loot: KillLootResult): string[] {
  return loot.logLines.filter((line) => !/EXP|\bSP\b|аден/i.test(line));
}

/** Предметний дроп РБ — гравцю з max totalDamageDealt (може бути не добившим). */
async function grantWorldBossItemLootToCharacterInTx(
  tx: Tx,
  args: {
    char: CharacterRow;
    spawnId: string;
    spawnName: string;
    killerName: string;
    loot: KillLootResult;
  }
): Promise<boolean> {
  if (args.loot.items.length === 0) return false;

  let nextInv = parseInventory(args.char.inventoryJson);
  for (const it of args.loot.items) {
    nextInv = addItemToBag(nextInv, it.l2ItemId, it.qty);
  }
  const invJson = nextInv as unknown as Prisma.InputJsonValue;

  const bj = parseBattleJson(args.char.battleJson);
  const inRbBattle = bj?.spawnId === args.spawnId;
  const itemLines = itemLogLinesFromLoot(args.loot);
  const tailLog = [
    'Дроп РБ (' + args.spawnName + '):',
    ...itemLines,
    'Добив: ' + args.killerName + '.',
  ];

  if (inRbBattle && bj) {
    const log = [...(bj.log ?? []), ...tailLog];
    await persistWorldBossBattleEndInTx(tx, {
      char: args.char,
      expectedRevision: args.char.revision,
      st: bj,
      playerHp: args.char.hp,
      currentMp: bj.playerMp ?? 0,
      log,
      inventoryJson: invJson,
    });
    return true;
  }

  const result = await mutateCharacterWithRevision(
    tx,
    args.char.id,
    args.char.revision,
    () => ({
      changed: true,
      data: { inventoryJson: invJson },
    })
  );
  if (!result.ok) throw gameConflictFromMutation(result);
  return false;
}

async function endWorldBossParticipantInTx(
  tx: Tx,
  characterId: string,
  spawnId: string,
  summaryLine: string
): Promise<void> {
  const row = await tx.character.findUnique({ where: { id: characterId } });
  if (!row) return;
  const bj = parseBattleJson(row.battleJson);
  if (!bj || bj.spawnId !== spawnId) return;
  const spawn = resolveBattleSpawnMeta(bj);
  if (!spawn) return;
  const log = [...(bj.log ?? []), summaryLine];
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
  itemRecipientName: string | null
): Promise<{
  character: CharacterSnapshot;
  battle: null;
}> {
  await deleteWorldBossSession(tx, args.bj.spawnId);
  const msg = itemRecipientName
    ? 'Бос уже переможений! Дроп (речі): ' + itemRecipientName + '.'
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

function rollWorldBossKillLoot(args: WorldBossVictoryArgs): KillLootResult {
  const npcId = resolveL2dopNpcIdByMobName(args.spawn.name) ?? null;
  return rollKillLoot(
    npcId,
    args.spawn.level,
    args.inv,
    {
      race: args.char.race,
      l2Profession: args.char.l2Profession,
      skillsLearnedJson: args.char.skillsLearnedJson,
    },
    {
      spawnKind: args.spawn.kind,
      mobName: args.spawn.name,
      spawnId: args.bj.spawnId,
    }
  );
}

/**
 * РБ/епік: EXP/SP/adena — гравцю з killing blow; предмети — max totalDamageDealt.
 */
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
    const itemRecipientName = await resolveCharacterNameInTx(
      tx,
      session?.lootRecipientCharacterId
    );
    return finishWorldBossVictoryIdempotentInTx(tx, args, itemRecipientName);
  }

  if (args.mobHp <= 0 && session.mobHp > 0) {
    await forceWorldBossSessionMobHpZeroInTx(tx, args.bj.spawnId);
    session.mobHp = 0;
  }

  if (session.mobHp > 0) {
    return finishWorldBossVictoryIdempotentInTx(tx, args, null);
  }

  const killerId = args.char.id;
  const killerName = args.char.name;
  const topDealerId =
    pickWorldBossTopDamageDealer(session) ?? killerId;
  const topDealerRow = await tx.character.findUnique({
    where: { id: topDealerId },
  });
  const itemRecipientId = topDealerRow ? topDealerId : killerId;
  const itemRecipientName =
    (topDealerRow?.name ?? killerName) || killerName;
  const splitItems = killerId !== itemRecipientId;

  const claimed = await tryClaimWorldBossLootInTx(
    tx,
    session,
    itemRecipientId,
    nowMs
  );
  if (!claimed) {
    const recipientName = await resolveCharacterNameInTx(
      tx,
      session.lootRecipientCharacterId
    );
    return finishWorldBossVictoryIdempotentInTx(tx, args, recipientName);
  }

  const participantIds = Object.keys(session.participants);
  for (const pid of participantIds) {
    const participant = session.participants[pid];
    if (participant && participant.totalDamageDealt > 0) {
      await creditDailyQuestRaidBossParticipationInTx(tx, pid, nowMs);
      await creditRaidBossKillInTx(tx, pid);
    }
  }

  const rolledLoot = rollWorldBossKillLoot(args);
  const extras = battleTurnJsonExtras(args.side);
  const killerLog = [...args.log];
  if (splitItems && rolledLoot.items.length > 0) {
    killerLog.push('Дроп (речі): ' + itemRecipientName + '.');
  }

  const killerVictory = await persistBattleVictoryInTx(tx, {
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
    log: killerLog,
    preRolledLoot: rolledLoot,
    rewardMode: splitItems ? 'economyOnly' : 'full',
    ...extras,
  });

  let itemRecipientBattleEnded = false;
  if (splitItems && topDealerRow) {
    itemRecipientBattleEnded = await grantWorldBossItemLootToCharacterInTx(tx, {
      char: topDealerRow as CharacterRow,
      spawnId: args.bj.spawnId,
      spawnName: args.spawn.name,
      killerName,
      loot: rolledLoot,
    });
  }

  const observerLine =
    'Бос переможений! EXP/адена: ' +
    killerName +
    (splitItems && rolledLoot.items.length > 0
      ? '; дроп: ' + itemRecipientName + '.'
      : '.');

  for (const pid of participantIds) {
    if (pid === killerId) continue;
    if (splitItems && pid === itemRecipientId && itemRecipientBattleEnded) {
      continue;
    }
    await endWorldBossParticipantInTx(tx, pid, args.bj.spawnId, observerLine);
  }

  return { ...killerVictory, battle: null };
}
