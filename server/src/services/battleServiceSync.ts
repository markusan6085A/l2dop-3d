import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { resolveBattleSpawnMeta } from '../domain/battlePvpContext.js';
import { isSharedWorldBossKind } from '../domain/worldBossSession.js';
import { findCharacterForUser } from './charResolveForUser.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import type { BattleJsonState } from '../domain/battle.js';
import { readWorldBossSessionMobHp } from './worldBossSessionService.js';
import {
  battleCooldownsForSync,
  buildBattleSyncResponse,
} from './battleServiceDelta.js';
import type { BattleSyncResponse } from './battleServiceDeltaTypes.js';
import {
  computeCharacterVitalsBundle,
  resolveClanHallBonusForCharacter,
} from './characterClanHallVitals.js';
import type { CharacterRow } from './charTypes.js';
async function battleJsonWithSharedMobHp(
  bj: BattleJsonState
): Promise<BattleJsonState> {
  const spawnMeta = resolveBattleSpawnMeta(bj);
  if (!spawnMeta || !isSharedWorldBossKind(spawnMeta.kind)) return bj;
  const sharedHp = await readWorldBossSessionMobHp(bj.spawnId);
  if (sharedHp == null) return bj;
  return {
    ...bj,
    mobHp: Math.max(0, Math.min(bj.mobMaxHp, Math.floor(sharedHp))),
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

  return buildBattleSyncResponse({
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
}
