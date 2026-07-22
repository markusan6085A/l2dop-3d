import { Prisma } from '@prisma/client';
import { getDungeonMobSpawnById } from '../../data/sevenSignsDungeonMobSpawns.js';
import type { MapSpawnKind } from '../../data/mapWorldSpawns.js';
import type { KillLootResult } from '../../domain/killLoot.js';
import { rollKillLoot } from '../../domain/killLoot.js';
import { isPartyBattleRewardDistributionReady } from '../../domain/partyBattleFlags.js';
import {
  splitEvenly,
  splitEvenlyBigInt,
} from '../../domain/partyBattleReward.js';
import { resolveMapMovement } from '../../domain/mapMovement.js';
import { isSharedWorldBossKind } from '../../domain/worldBossSession.js';
import {
  resolveWorldPartyRewardEligibleIds,
  type WorldPartyRewardMemberSnapshot,
} from '../../domain/worldPartyRewardEligibility.js';
import { buildWorldPartyKillRewardNoticeId } from '../../domain/worldPartyKillRewardKey.js';
import type { BattleJsonState } from '../../domain/battleTypes.js';
import { peekPartyBattleIdFromBattleJson } from './partyBattleActionLock.js';
import {
  lockCharacterRowsInStableOrderInTx,
  mergeUniqueCharacterIds,
} from './partyBattleCharacterLock.js';
import { applyPartyEconomyRewardInTx } from './partyBattleEconomyReward.js';
import {
  hasWorldPartyKillRewardInTx,
  recordWorldPartyKillRewardInTx,
} from './worldPartyKillRewardService.js';
import { logPartyBattleVictoryTrace } from './partyBattleVictoryDebug.js';
import { persistBattleVictoryInTx } from '../battleServiceBattleOutcomeTx.js';
import { battleTurnJsonExtras } from '../battleServicePerformBattleAction.outcome.js';
import type { BattleContinueTurnBase, BattleTurnPersistSide } from '../battleServicePerformBattleAction.outcome.js';
import {
  gameConflictFromMutation,
  toSnapshot,
  type CharacterRow,
} from '../charService.js';
import { ensureClanHallOnRow } from '../charClientSnapshot.js';
import { resolveL2dopNpcIdByMobName } from '../spawnCatalogService.js';
import { isCharacterOnlineNow } from '../onlinePresenceService.js';
import type {
  BattleVictorySummary,
} from '../battleServiceTypes.js';
import type {
  PartyBattleRewardSummary,
} from '../battleServiceDeltaTypes.js';
import type { CharacterSnapshot } from '../charService.js';

type Tx = Prisma.TransactionClient;

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

/** World open-field solo kill з L2 party split (без shared PartyBattleSession). */
export function isWorldOpenFieldPartyKillRewardContext(args: {
  spawnKind: MapSpawnKind;
  spawnId: string;
  st: BattleJsonState;
}): boolean {
  if (!isPartyBattleRewardDistributionReady()) return false;
  if (isSharedWorldBossKind(args.spawnKind)) return false;
  if (args.spawnKind === 'raid' || args.spawnKind === 'epic') return false;
  if (getDungeonMobSpawnById(args.spawnId)) return false;
  if (peekPartyBattleIdFromBattleJson(args.st)) return false;
  return true;
}

async function loadPartyMemberIdsInTx(
  tx: Tx,
  killerCharacterId: string
): Promise<{ partyId: string | null; memberIds: string[] }> {
  const membership = await tx.partyMember.findUnique({
    where: { characterId: killerCharacterId },
    select: { partyId: true },
  });
  const partyId = String(membership?.partyId ?? '').trim() || null;
  if (!partyId) return { partyId: null, memberIds: [] };
  const rows = await tx.partyMember.findMany({
    where: { partyId },
    select: { characterId: true },
  });
  return { partyId, memberIds: rows.map((r) => r.characterId) };
}

function buildMemberSnapshots(
  lockedRows: Map<string, CharacterRow>,
  memberIds: readonly string[]
): WorldPartyRewardMemberSnapshot[] {
  const out: WorldPartyRewardMemberSnapshot[] = [];
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

async function loadIdempotentWorldKillVictoryInTx(
  tx: Tx,
  args: BattleContinueTurnBase & {
    cr: CharacterRow;
    side: BattleTurnPersistSide;
  },
  killKey: {
    killerCharacterId: string;
    spawnId: string;
    killRevision: number;
  }
): Promise<{
  character: CharacterSnapshot;
  victory: BattleVictorySummary;
  partyReward?: PartyBattleRewardSummary;
}> {
  const row = await tx.character.findUnique({ where: { id: args.char.id } });
  if (!row) throw new Error('character_not_found');
  const killerReward = await tx.worldPartyKillReward.findFirst({
    where: {
      ...killKey,
      recipientCharacterId: args.char.id,
    },
  });
  const recipientCount = await tx.worldPartyKillReward.count({ where: killKey });
  const snap = toSnapshot(await ensureClanHallOnRow(row as CharacterRow, tx));
  const noticeId = buildWorldPartyKillRewardNoticeId(killKey);
  return {
    character: snap,
    victory: {
      spawnId: args.bj.spawnId,
      mobName: args.spawn.name,
      mobLevel: args.spawn.level,
      aggressive: args.spawn.aggressive,
      isPvp: false,
      battleType: 'pve',
      fullLog: args.log.map(String),
      adenaGain: killerReward?.adenaGain.toString() ?? '0',
      expGain: String(killerReward?.expGain ?? 0),
      spGain: killerReward?.spGain ?? 0,
      items: [],
      levelUp: null,
      nextHuntSpawnId: null,
      huntSameLevelRemaining: 0,
    },
    ...(killerReward && recipientCount > 1
      ? {
          partyReward: {
            partyBattleId: noticeId,
            recipientCount,
            expGain: String(killerReward.expGain),
            spGain: killerReward.spGain,
            adenaGain: killerReward.adenaGain.toString(),
            shared: true as const,
          },
        }
      : {}),
  };
}

export async function resolveWorldPartyKillVictoryInTx(
  tx: Tx,
  args: BattleContinueTurnBase & {
    cr: CharacterRow;
    currentMp: number;
    side: BattleTurnPersistSide;
  }
): Promise<{
  character: CharacterSnapshot;
  victory: BattleVictorySummary;
  partyReward?: PartyBattleRewardSummary;
}> {
  const killKey = {
    killerCharacterId: args.char.id,
    spawnId: args.bj.spawnId,
    killRevision: args.expectedRevision,
  };

  if (await hasWorldPartyKillRewardInTx(tx, killKey)) {
    return loadIdempotentWorldKillVictoryInTx(tx, args, killKey);
  }

  const { partyId, memberIds } = await loadPartyMemberIdsInTx(tx, args.char.id);  if (!partyId || memberIds.length === 0) {
    const solo = await persistBattleVictoryInTx(tx, {
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
      ...battleTurnJsonExtras(args.side),
      nearbyExtraEconomy: args.side.nearbyExtraEconomy,
    });
    logPartyBattleVictoryTrace({
      characterId: args.char.id,
      partyId: null,
      partyBattleId: null,
      spawnId: args.bj.spawnId,
      victoryPath: 'solo',
      participantIds: [],
      activeParticipantIds: [],
      eligibleIds: [args.char.id],
      totalExp: solo.victory.expGain,
      totalSp: solo.victory.spGain,
      totalAdena: solo.victory.adenaGain,
      rewardRowsCreated: 0,
      economyUpdates: 1,
    });
    return solo;
  }

  const lockIds = mergeUniqueCharacterIds(memberIds, [args.char.id]);
  const lockedRows = await lockCharacterRowsInStableOrderInTx(tx, lockIds);
  const killerRow = lockedRows.get(args.char.id);
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
  const memberSnapshots = buildMemberSnapshots(lockedRows, memberIds);
  const eligibleIds = resolveWorldPartyRewardEligibleIds({
    killerCharacterId: args.char.id,
    killerResolved: {
      worldX: killerResolved.worldX,
      worldY: killerResolved.worldY,
      dungeonStateJson: killerResolved.dungeonStateJson,
    },
    partyMemberIds: memberIds,
    memberSnapshots,
    isOnline: (id) => isCharacterOnlineNow(id),
  });

  const extras = battleTurnJsonExtras(args.side);
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

  if (eligibleIds.length <= 1) {
    const soloInParty = await persistBattleVictoryInTx(tx, {
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
      ...extras,
      preRolledLoot: rolled,
      nearbyExtraEconomy: args.side.nearbyExtraEconomy,
    });
    if (eligibleIds.length === 1) {
      await recordWorldPartyKillRewardInTx(tx, {
        ...killKey,
        recipientCharacterId: args.char.id,
        expGain: bigintToSafeInt(rolled.expGain, 'exp'),
        spGain: rolled.spGain,
        adenaGain: rolled.adena,
        notifiedAt: new Date(),
      });
    }
    logPartyBattleVictoryTrace({
      characterId: args.char.id,
      partyId,
      partyBattleId: null,
      spawnId: args.bj.spawnId,
      victoryPath: 'solo',
      participantIds: memberIds,
      activeParticipantIds: [],
      eligibleIds,
      totalExp: rolled.expGain.toString(),
      totalSp: rolled.spGain,
      totalAdena: rolled.adena.toString(),
      rewardRowsCreated: eligibleIds.length,
      economyUpdates: 1,
    });
    return soloInParty;
  }

  const expShares = splitEvenlyBigInt(rolled.expGain, eligibleIds, args.char.id);
  const spShares = splitEvenly(rolled.spGain, eligibleIds, args.char.id);
  const adenaShares = splitEvenlyBigInt(rolled.adena, eligibleIds, args.char.id);
  const nowMs = Date.now();

  for (const recipientId of eligibleIds) {
    await recordWorldPartyKillRewardInTx(tx, {
      ...killKey,
      recipientCharacterId: recipientId,
      expGain: bigintToSafeInt(expShares.get(recipientId) ?? 0n, 'exp'),
      spGain: spShares.get(recipientId) ?? 0,
      adenaGain: adenaShares.get(recipientId) ?? 0n,
      ...(recipientId === args.char.id ? { notifiedAt: new Date(nowMs) } : {}),
    });
  }

  for (const recipientId of eligibleIds) {
    if (recipientId === args.char.id) continue;
    const row = lockedRows.get(recipientId);
    if (!row) continue;
    const updated = await applyPartyEconomyRewardInTx(tx, row as CharacterRow, {
      expGain: expShares.get(recipientId) ?? 0n,
      spGain: spShares.get(recipientId) ?? 0,
      adenaGain: adenaShares.get(recipientId) ?? 0n,
    });
    lockedRows.set(recipientId, updated);
  }

  const killerExp = expShares.get(args.char.id) ?? 0n;
  const killerSp = spShares.get(args.char.id) ?? 0;
  const killerAdena = adenaShares.get(args.char.id) ?? 0n;
  const killerLoot = buildKillerLootWithShares(rolled, {
    expGain: killerExp,
    spGain: killerSp,
    adenaGain: killerAdena,
  });

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
    ...extras,
    nearbyExtraEconomy: args.side.nearbyExtraEconomy,
  });

  const noticeId = buildWorldPartyKillRewardNoticeId(killKey);
  const partyReward: PartyBattleRewardSummary = {
    partyBattleId: noticeId,
    recipientCount: eligibleIds.length,
    expGain: String(bigintToSafeInt(killerExp, 'exp')),
    spGain: killerSp,
    adenaGain: killerAdena.toString(),
    shared: true,
  };

  logPartyBattleVictoryTrace({
    characterId: args.char.id,
    partyId,
    partyBattleId: null,
    spawnId: args.bj.spawnId,
    victoryPath: 'party' as 'solo' | 'party',
    participantIds: memberIds,
    activeParticipantIds: [],
    eligibleIds,
    totalExp: rolled.expGain.toString(),
    totalSp: rolled.spGain,
    totalAdena: rolled.adena.toString(),
    rewardRowsCreated: eligibleIds.length,
    economyUpdates: eligibleIds.length,
  });

  return { ...killerVictory, partyReward };
}
