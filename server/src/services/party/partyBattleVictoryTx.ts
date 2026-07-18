import { Prisma, type PartyBattleSession } from '@prisma/client';
import type { InventoryState } from '../../data/inventory.js';
import { applyBattleLogWriteInPlace } from '../../domain/battleVersion.js';
import type { KillLootResult } from '../../domain/killLoot.js';
import { rollKillLoot } from '../../domain/killLoot.js';
import {
  isPartyBattleRewardDistributionReady,
} from '../../domain/partyBattleFlags.js';
import {
  resolvePartyBattleRewardEligibleIds,
  type PartyBattleRewardMemberSnapshot,
} from '../../domain/partyBattleRewardEligibility.js';
import {
  splitEvenly,
  splitEvenlyBigInt,
} from '../../domain/partyBattleReward.js';
import {
  isPartyBattleSessionTerminal,
  PARTY_BATTLE_END_REASON,
  PARTY_BATTLE_SESSION_STATE,
} from '../../domain/partyBattleSessionConstants.js';
import { resolveMapMovement } from '../../domain/mapMovement.js';
import {
  lockCharacterRowsInStableOrderInTx,
  mergeUniqueCharacterIds,
} from './partyBattleCharacterLock.js';
import { applyPartyEconomyRewardInTx } from './partyBattleEconomyReward.js';
import {
  persistPartyBattleSharedHpInTx,
  type PartyBattleTurnPersistArgs,
} from './partyBattleOutcomeTx.js';
import {
  clearPartyBattlePointerForCharacterInTx,
} from './partyBattleSocialSession.js';
import {
  endPartyBattleSessionInTx,
  recordPartyKillRewardInTx,
} from './partyBattleSessionService.js';
import { persistBattleVictoryInTx } from '../battleServiceBattleOutcomeTx.js';
import {
  battleTurnJsonExtras,
  buildLethalVictoryMeta,
  wrapVictoryAsFull,
} from '../battleServicePerformBattleAction.outcome.js';
import type { BattleSpawnMeta } from '../../domain/battlePvpContext.js';
import {
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
} from '../charService.js';
import { ensureClanHallOnRow } from '../charClientSnapshot.js';
import { resolveL2dopNpcIdByMobName } from '../spawnCatalogService.js';
import { isCharacterOnlineNow } from '../onlinePresenceService.js';
import type {
  BattleActionFullResponse,
  PartyBattleRewardSummary,
} from '../battleServiceDeltaTypes.js';

type Tx = Prisma.TransactionClient;

export type PartyBattleVictoryArgs = PartyBattleTurnPersistArgs & {
  userId: string;
  bj: { spawnId: string };
  spawn: BattleSpawnMeta;
  inv: InventoryState;
  preLevel: number;
  currentMp: number;
  cr: CharacterRow;
};

function bigintToSafeInt(value: bigint, label: string): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new Error(`${label}_overflow`);
  }
  return Number(value);
}

function buildKillerLootWithShares(
  rolled: KillLootResult,
  killerShares: {
    expGain: bigint;
    spGain: number;
    adenaGain: bigint;
  }
): KillLootResult {
  const expLine = killerShares.expGain > 0n
    ? `+${killerShares.expGain.toString()} EXP`
    : null;
  const spLine = killerShares.spGain > 0 ? `+${killerShares.spGain} SP` : null;
  const adenaLine =
    killerShares.adenaGain > 0n
      ? `+${killerShares.adenaGain.toString()} аден`
      : null;
  const itemLines = rolled.logLines.filter(
    (line) => !/EXP| SP|аден/i.test(line)
  );
  const logLines = [
    ...itemLines,
    ...(expLine ? [expLine] : []),
    ...(spLine ? [spLine] : []),
    ...(adenaLine ? [adenaLine] : []),
  ];
  return {
    ...rolled,
    expGain: killerShares.expGain,
    spGain: killerShares.spGain,
    adena: killerShares.adenaGain,
    logLines,
  };
}

async function loadIdempotentVictoryResponseInTx(
  tx: Tx,
  args: PartyBattleVictoryArgs,
  session: PartyBattleSession
): Promise<BattleActionFullResponse> {
  const killerReward = await tx.partyKillReward.findUnique({
    where: {
      partyBattleId_characterId: {
        partyBattleId: session.id,
        characterId: args.characterId,
      },
    },
  });
  const row = await tx.character.findUnique({ where: { id: args.characterId } });
  if (!row) throw new Error('character_not_found');
  const snap = toSnapshot(await ensureClanHallOnRow(row as CharacterRow, tx));

  const recipientCount = await tx.partyKillReward.count({
    where: { partyBattleId: session.id },
  });

  const partyReward: PartyBattleRewardSummary | undefined = killerReward
    ? {
        partyBattleId: session.id,
        recipientCount,
        expGain: String(killerReward.expGain),
        spGain: killerReward.spGain,
        adenaGain: killerReward.adenaGain.toString(),
        shared: true,
      }
    : undefined;

  return {
    kind: 'full',
    character: snap,
    battle: null,
    partyReward,
    lethalMeta: buildLethalVictoryMeta({ st: args.st, mobHp: 0 }),
  };
}

async function buildMemberSnapshotsInTx(
  lockedRows: Map<string, CharacterRow>,
  memberIds: readonly string[]
): Promise<PartyBattleRewardMemberSnapshot[]> {
  const out: PartyBattleRewardMemberSnapshot[] = [];
  for (const memberId of memberIds) {
    const row = lockedRows.get(memberId);
    if (!row) continue;
    const resolved = resolveMapMovement(row);
    out.push({
      characterId: memberId,
      hp: row.hp,
      pvePendingDefeatJson: row.pvePendingDefeatJson,
      resolvedPosition: {
        worldX: resolved.worldX,
        worldY: resolved.worldY,
        dungeonStateJson: resolved.dungeonStateJson,
      },
    });
  }
  return out;
}

/** Stage C atomic victory: один loot roll, split EXP/SP/adena, items killer-only. */
export async function resolvePartyBattleVictoryInTx(
  tx: Tx,
  args: PartyBattleVictoryArgs
): Promise<BattleActionFullResponse> {
  if (!isPartyBattleRewardDistributionReady()) {
    throw new Error('party_battle_not_ready');
  }

  const nowMs = Date.now();
  const sessionAfterDamage = await persistPartyBattleSharedHpInTx(tx, {
    sessionId: args.sessionId,
    characterId: args.characterId,
    mobHpBefore: args.mobHpBefore,
    mobHpAfter: 0,
    nowMs,
  });

  if (isPartyBattleSessionTerminal(sessionAfterDamage.state)) {
    return loadIdempotentVictoryResponseInTx(tx, args, sessionAfterDamage);
  }

  const existingRewardCount = await tx.partyKillReward.count({
    where: { partyBattleId: args.sessionId },
  });
  if (existingRewardCount > 0) {
    return loadIdempotentVictoryResponseInTx(tx, args, sessionAfterDamage);
  }

  const partyId = sessionAfterDamage.partyId;
  const partyMembers = partyId
    ? await tx.partyMember.findMany({
        where: { partyId },
        select: { characterId: true },
      })
    : [];
  const partyMemberIds = partyMembers.map((m) => m.characterId);

  const participantRows = await tx.partyBattleParticipant.findMany({
    where: { partyBattleId: args.sessionId },
    select: { characterId: true },
  });
  const participantIds = participantRows.map((p) => p.characterId);

  const lockIds = mergeUniqueCharacterIds(
    partyMemberIds,
    participantIds,
    [args.characterId]
  );
  const lockedRows = await lockCharacterRowsInStableOrderInTx(tx, lockIds);

  const killerRow = lockedRows.get(args.characterId);
  if (!killerRow) throw new Error('character_not_found');
  if (killerRow.revision !== args.expectedRevision) {
    throw gameConflictFromMutation({
      ok: false,
      conflict: true,
      serverRevision: killerRow.revision,
      character: killerRow,
    });
  }

  const killerResolved = resolveMapMovement(killerRow);
  const memberSnapshots = await buildMemberSnapshotsInTx(
    lockedRows,
    partyMemberIds
  );
  const eligibleIds = resolvePartyBattleRewardEligibleIds({
    killerCharacterId: args.characterId,
    killerResolved: {
      worldX: killerResolved.worldX,
      worldY: killerResolved.worldY,
      dungeonStateJson: killerResolved.dungeonStateJson,
    },
    partyMemberIds,
    memberSnapshots,
    isOnline: isCharacterOnlineNow,
  });

  if (eligibleIds.length === 0) {
    throw new Error('party_battle_no_eligible_recipients');
  }

  const npcId = resolveL2dopNpcIdByMobName(args.spawn.name) ?? null;
  const rolled = rollKillLoot(
    npcId,
    args.spawn.level,
    args.inv,
    {
      race: killerRow.race,
      l2Profession: killerRow.l2Profession,
      skillsLearnedJson: killerRow.skillsLearnedJson,
    },
    {
      spawnKind: args.spawn.kind,
      mobName: args.spawn.name,
      spawnId: args.bj.spawnId,
    }
  );

  const expShares = splitEvenlyBigInt(rolled.expGain, eligibleIds, args.characterId);
  const spShares = splitEvenly(rolled.spGain, eligibleIds, args.characterId);
  const adenaShares = splitEvenlyBigInt(rolled.adena, eligibleIds, args.characterId);

  for (const recipientId of eligibleIds) {
    await recordPartyKillRewardInTx(tx, {
      partyBattleId: args.sessionId,
      characterId: recipientId,
      expGain: bigintToSafeInt(expShares.get(recipientId) ?? 0n, 'exp'),
      spGain: spShares.get(recipientId) ?? 0,
      adenaGain: adenaShares.get(recipientId) ?? 0n,
    });
  }

  const killerExp = expShares.get(args.characterId) ?? 0n;
  const killerSp = spShares.get(args.characterId) ?? 0;
  const killerAdena = adenaShares.get(args.characterId) ?? 0n;
  const killerLoot = buildKillerLootWithShares(rolled, {
    expGain: killerExp,
    spGain: killerSp,
    adenaGain: killerAdena,
  });

  args.st.mobHp = 0;
  applyBattleLogWriteInPlace(args.st, args.log, args.logLinesAdded);

  for (const recipientId of eligibleIds) {
    if (recipientId === args.characterId) continue;
    const row = lockedRows.get(recipientId);
    if (!row) continue;
    const updated = await applyPartyEconomyRewardInTx(tx, row as CharacterRow, {
      expGain: expShares.get(recipientId) ?? 0n,
      spGain: spShares.get(recipientId) ?? 0,
      adenaGain: adenaShares.get(recipientId) ?? 0n,
    });
    lockedRows.set(recipientId, updated);
  }

  const extras = battleTurnJsonExtras(args.side);
  const killerVictory = await persistBattleVictoryInTx(tx, {
    userId: args.userId,
    expectedRevision: args.expectedRevision,
    char: killerRow as CharacterRow,
    bj: args.bj,
    spawn: args.spawn,
    inv: args.inv,
    cr: args.cr,
    preLevel: args.preLevel,
    playerHp: args.playerHp,
    currentMp: args.currentMp,
    st: args.st,
    log: args.log,
    preRolledLoot: killerLoot,
    rewardMode: 'full',
    ...extras,
  });

  for (const participantId of participantIds) {
    if (participantId === args.characterId) continue;
    await clearPartyBattlePointerForCharacterInTx(
      tx,
      participantId,
      args.sessionId,
      null
    );
  }

  await endPartyBattleSessionInTx(tx, {
    sessionId: args.sessionId,
    terminalState: PARTY_BATTLE_SESSION_STATE.victory,
    endReason: PARTY_BATTLE_END_REASON.victory,
    nowMs,
  });

  const recipientCount = eligibleIds.length;
  const partyReward: PartyBattleRewardSummary = {
    partyBattleId: args.sessionId,
    recipientCount,
    expGain: String(bigintToSafeInt(killerExp, 'exp')),
    spGain: killerSp,
    adenaGain: killerAdena.toString(),
    shared: true,
  };

  return wrapVictoryAsFull({
    ...killerVictory,
    battle: null,
    lethalMeta: buildLethalVictoryMeta({ st: args.st, mobHp: 0 }),
    partyReward,
  });
}
