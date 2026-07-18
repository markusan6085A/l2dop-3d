import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { resolveBattleSpawnMeta } from '../domain/battlePvpContext.js';
import { isSharedWorldBossKind } from '../domain/worldBossSession.js';
import { findCharacterForUser } from './charResolveForUser.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import type { BattleJsonState } from '../domain/battle.js';
import {
  readWorldBossSessionState,
  clampSharedWorldBossMobHp,
} from './worldBossSessionService.js';
import {
  battleCooldownsForSync,
  buildBattleSyncResponse,
} from './battleServiceDelta.js';
import { isPartyBattleSyncStale } from './party/partyBattleSyncService.js';
import { isPartyBattleEngineEnabled } from '../domain/partyBattleFlags.js';
import { isPartyBattleSyncContext } from './party/partyBattleSyncGuard.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusForCharacter,
} from './characterClanHallVitals.js';
import type { BattleSyncResponse } from './battleServiceDeltaTypes.js';
import { prisma } from '../lib/prisma.js';
import type { CharacterRow } from './charTypes.js';
async function battleJsonWithSharedMobHp(
  bj: BattleJsonState
): Promise<BattleJsonState> {
  const spawnMeta = resolveBattleSpawnMeta(bj);
  if (!spawnMeta || !isSharedWorldBossKind(spawnMeta.kind)) return bj;
  const session = await readWorldBossSessionState(bj.spawnId);
  if (!session) {
    return {
      ...bj,
      mobHp: 0,
    };
  }
  const clientGen =
    bj.worldBossSpawnGeneration != null
      ? Math.floor(Number(bj.worldBossSpawnGeneration))
      : null;
  const sessionGen = Math.max(1, Math.floor(Number(session.spawnGeneration) || 1));
  const staleGeneration =
    clientGen != null && Number.isFinite(clientGen) && clientGen !== sessionGen;
  return {
    ...bj,
    mobHp: clampSharedWorldBossMobHp(bj.mobMaxHp, session.mobHp),
    worldBossSpawnGeneration: sessionGen,
    ...(staleGeneration ? { worldBossSpawnStale: true } : {}),
  };
}

export type BattleSyncQuery = {
  battleVersion?: number;
  lastLogSeq?: number;
  characterId?: string | null;
  battleSpawnId?: string | null;
};

/**
 * Строго read-only sync: без flush, tick, presence, FOR UPDATE, snapshot.
 */
export async function getBattleSyncForUser(
  userId: string,
  query: BattleSyncQuery
): Promise<BattleSyncResponse | null> {
  const row = await findCharacterForUser(userId, {
    characterId: query.characterId,
    battleSpawnId: query.battleSpawnId,
    include: {
      clan: { select: { hallBlessingAt: true, level: true } },
    },
  });
  if (!row) return null;

  const cr = row as CharacterRow;
  const revision = cr.revision;
  const clientBv = query.battleVersion;
  const clientLogSeq = query.lastLogSeq ?? 0;
  const clanHallBonus = await resolveClanHallBonusForCharacter(cr);

  if (parsePvePendingDefeat(cr.pvePendingDefeatJson)) {
    const vitals = computeCharacterVitalsBundle({
      row: cr,
      clanHallBonus,
    });
    return {
      changed: true,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      characterHp: vitals.displayHp,
      characterMp: vitals.maxMp,
      characterMaxHp: vitals.maxHpChain.maxHpWithClanHall,
      characterMaxMp: vitals.maxMp,
      outcome: 'DEFEAT',
      battleEnded: true,
    };
  }

  const bjRaw = parseBattleJson(cr.battleJson);
  if (!bjRaw) {
    const hadClientState =
      clientBv != null && clientBv > 0;
    return {
      changed: hadClientState,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      outcome: null,
      battleEnded: false,
    };
  }

  const bj = await battleJsonWithSharedMobHp(bjRaw);
  const spawnMeta = resolveBattleSpawnMeta(bjRaw);
  const sharedBoss = spawnMeta != null && isSharedWorldBossKind(spawnMeta.kind);

  if (
    sharedBoss &&
    (bj as BattleJsonState & { worldBossSpawnStale?: boolean }).worldBossSpawnStale ===
      true
  ) {
    return {
      changed: true,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      outcome: null,
      battleEnded: true,
      mobHp: bj.mobHp,
      mobMaxHp: bj.mobMaxHp,
      mobDead: bj.mobHp <= 0,
    };
  }

  const sessionGone =
    sharedBoss &&
    bj.mobHp <= 0 &&
    (await readWorldBossSessionState(bjRaw.spawnId)) == null;
  if (sessionGone) {
    return {
      changed: true,
      revision,
      battleVersion: 0,
      logSeq: 0,
      logTail: [],
      inBattle: false,
      outcome: 'VICTORY',
      battleEnded: true,
      mobHp: 0,
      mobMaxHp: bj.mobMaxHp,
      mobDead: true,
    };
  }

  const vitals = computeCharacterVitalsBundle({
    row: cr,
    clanHallBonus,
    battleMods: bj.battleMods,
  });
  const maxHpEff = vitals.maxHpChain.maxHpWithClanHall;
  const maxMpEff = vitals.maxMp;
  const playerMp =
    typeof bj.playerMp === 'number' && Number.isFinite(bj.playerMp)
      ? Math.max(0, Math.min(maxMpEff, Math.floor(bj.playerMp)))
      : maxMpEff;

  const nowMs = Date.now();
  const mysticSkillCdUntil = battleCooldownsForSync(cr, bj, nowMs);

  let partyBattle: BattleSyncResponse['partyBattle'];
  if (isPartyBattleEngineEnabled() && isPartyBattleSyncContext(bjRaw)) {
    const partySessionId = bjRaw.partyBattleId!.trim();
    const sessionRow = await prisma.partyBattleSession.findUnique({
      where: { id: partySessionId },
    });
    if (sessionRow && !isPartyBattleSyncStale(bjRaw, sessionRow)) {
      partyBattle = {
        partyBattleId: sessionRow.id,
        battleVersion: sessionRow.battleVersion,
        spawnId: sessionRow.spawnId,
        mobHp: sessionRow.mobHp,
        mobMaxHp: sessionRow.mobMaxHp,
        state: sessionRow.state,
        participantCount: await prisma.partyBattleParticipant.count({
          where: { partyBattleId: sessionRow.id, active: true },
        }),
      };
      bj.mobHp = sessionRow.mobHp;
      bj.battleVersion = sessionRow.battleVersion;
    } else if (!sessionRow || isPartyBattleSyncStale(bjRaw, sessionRow)) {
      return {
        changed: true,
        revision,
        battleVersion: 0,
        logSeq: 0,
        logTail: [],
        inBattle: false,
        battleEnded: true,
        outcome: null,
        mobHp: 0,
        mobMaxHp: bj.mobMaxHp,
        mobDead: true,
      };
    }
  }

  const syncResponse = buildBattleSyncResponse({
    row: cr,
    st: bj,
    maxHpEff,
    maxHpNoClan: vitals.maxHpChain.maxHpWithoutClanHall,
    clanHallBonus: vitals.clanHallBonus,
    maxMpEff,
    playerMp,
    clientBattleVersion: clientBv,
    clientLastLogSeq: clientLogSeq,
    mysticSkillCdUntil,
  });
  if (partyBattle) {
    syncResponse.partyBattle = partyBattle;
  }
  return syncResponse;
}
