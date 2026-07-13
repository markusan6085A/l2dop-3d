import { Prisma } from '@prisma/client';
import type { MapWorldSpawn } from '../data/mapWorldSpawns.js';
import {
  computeCombatStats,
  effectiveMaxHpWithJewelFlat,
  effectiveMaxMpWithJewelFlat,
} from '../data/l2dopCombatFormulas.js';
import { computeVitals } from '../data/l2dopVitals.js';
import { levelFromTotalExp } from '../data/l2dopExpgain.js';
import { parseInventory } from '../data/inventory.js';
import { MAX_BATTLE_LOG } from '../domain/battle.js';
import { resolveBattleSpawnMeta } from '../domain/battlePvpContext.js';
import {
  createWorldBossSessionState,
  isSharedWorldBossKind,
  listValidWorldBossParticipantIds,
  parseWorldBossSessionState,
  reconcileWorldBossTarget,
  registerWorldBossDamagingHit,
  shouldWorldBossAutoAttack,
  type WorldBossParticipantContext,
  type WorldBossSessionState,
} from '../domain/worldBossSession.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import { prisma } from '../lib/prisma.js';
import { applyMobCounterDamage } from './battleServicePerformBattleAction.mobRetaliation.js';
import { persistBattleDefeatInTx } from './battleServiceBattleOutcomeTx.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import {
  combatOptsFromRow,
  type CharacterRow,
} from './charService.js';
import { persistCharacterFieldsInTx } from './charInternalPersist.js';
import { getCharacterLastSeenMs } from './onlinePresenceService.js';
import { mobCombatFromSpawn } from '../domain/battleMobSpawn.js';

export { isSharedWorldBossKind };

type Tx = Prisma.TransactionClient;

function serializeSession(state: WorldBossSessionState): Prisma.InputJsonValue {
  return state as unknown as Prisma.InputJsonValue;
}

async function lockSessionRow(tx: Tx, spawnId: string): Promise<WorldBossSessionState | null> {
  const rows = await tx.$queryRaw<Array<{ stateJson: unknown }>>`
    SELECT "stateJson" FROM "WorldBossSession" WHERE "spawnId" = ${spawnId} FOR UPDATE
  `;
  if (!rows.length) return null;
  return parseWorldBossSessionState(rows[0]!.stateJson);
}

export async function lockWorldBossSessionInTx(
  tx: Tx,
  spawnId: string
): Promise<WorldBossSessionState | null> {
  return lockSessionRow(tx, spawnId);
}

async function saveSession(tx: Tx, state: WorldBossSessionState): Promise<void> {
  await tx.worldBossSession.upsert({
    where: { spawnId: state.spawnId },
    create: {
      spawnId: state.spawnId,
      stateJson: serializeSession(state),
    },
    update: {
      stateJson: serializeSession(state),
    },
  });
}

export async function deleteWorldBossSession(
  tx: Tx,
  spawnId: string
): Promise<void> {
  await tx.worldBossSession.deleteMany({ where: { spawnId } });
}

export async function ensureWorldBossSessionInTx(
  tx: Tx,
  spawn: MapWorldSpawn,
  mobHp: number,
  nowMs: number
): Promise<WorldBossSessionState> {
  const mc = mobCombatFromSpawn(spawn);
  let session = await lockSessionRow(tx, spawn.id);
  if (!session) {
    session = createWorldBossSessionState({
      spawnId: spawn.id,
      mobHp,
      mobMaxHp: mc.maxHp,
      mobPAtk: mc.pAtk,
      mobPDef: mc.pDef,
      mobMAtk: mc.mAtk,
      mobMDef: mc.mDef,
      mobEvasion: mc.evasion,
      spawnWorldX: spawn.worldX,
      spawnWorldY: spawn.worldY,
      spawnName: spawn.name,
      spawnLevel: spawn.level,
      spawnKind: spawn.kind,
      nowMs,
    });
    await saveSession(tx, session);
    return session;
  }
  session.mobHp = Math.max(0, Math.min(session.mobMaxHp, mobHp));
  return session;
}

export async function loadWorldBossSessionMobHp(
  tx: Tx,
  spawnId: string
): Promise<number | null> {
  const row = await tx.worldBossSession.findUnique({ where: { spawnId } });
  if (!row) return null;
  const session = parseWorldBossSessionState(row.stateJson);
  return session?.mobHp ?? null;
}

async function loadParticipantContexts(
  tx: Tx,
  session: WorldBossSessionState
): Promise<WorldBossParticipantContext[]> {
  const ids = Object.keys(session.participants);
  if (ids.length === 0) return [];
  const rows = await tx.character.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      worldX: true,
      worldY: true,
      hp: true,
      battleJson: true,
    },
  });
  return rows.map((row) => {
    const bj = parseBattleJson(row.battleJson);
    return {
      characterId: row.id,
      worldX: row.worldX,
      worldY: row.worldY,
      inBattleOnSpawn: bj?.spawnId === session.spawnId,
      playerHp: row.hp,
      onlineLastSeenMs: getCharacterLastSeenMs(row.id),
    };
  });
}

async function syncParticipantMobHpInTx(
  tx: Tx,
  session: WorldBossSessionState
): Promise<void> {
  const ids = Object.keys(session.participants);
  if (ids.length === 0) return;
  const rows = await tx.character.findMany({
    where: { id: { in: ids } },
  });
  for (const row of rows) {
    const bj = parseBattleJson(row.battleJson);
    if (!bj || bj.spawnId !== session.spawnId) continue;
    if (bj.mobHp === session.mobHp && bj.mobMaxHp === session.mobMaxHp) continue;
    bj.mobHp = session.mobHp;
    bj.mobMaxHp = session.mobMaxHp;
    await persistCharacterFieldsInTx(tx, row.id, {
      battleJson: serializeBattleJsonForDb(bj),
    });
  }
}

async function applyWorldBossAutoAttackInTx(
  tx: Tx,
  session: WorldBossSessionState,
  targetCharacterId: string,
  nowMs: number
): Promise<{ targetDefeated: boolean }> {
  const target = await tx.character.findUnique({ where: { id: targetCharacterId } });
  if (!target) return { targetDefeated: false };
  const bj = parseBattleJson(target.battleJson);
  if (!bj || bj.spawnId !== session.spawnId) return { targetDefeated: false };

  const spawn = resolveBattleSpawnMeta(bj);
  if (!spawn) return { targetDefeated: false };

  const cr = target as CharacterRow;
  const inv = parseInventory(cr.inventoryJson);
  const effLv = levelFromTotalExp(cr.exp);
  const combat = computeCombatStats(
    effLv,
    cr.race,
    cr.classBranch,
    inv,
    combatOptsFromRow(cr)
  );
  const vit = computeVitals(effLv, cr.race, cr.classBranch, combat.con, combat.men);
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);
  const wTick = tickWorldCombatState(
    parseWorldCombatState(cr.worldCombatStateJson),
    maxMp,
    nowMs,
    combat.regenMp
  );

  let playerHp = Math.max(0, Math.min(maxHpEff, cr.hp));
  let mobHp = session.mobHp;
  const log = [...(bj.log ?? [])];
  const countered = applyMobCounterDamage({
    st: bj,
    spawn,
    combat,
    worldBattleMods: wTick?.battleMods,
    maxHpEffAfter: maxHpEff,
    playerHp,
    mobHp,
    log,
  });
  playerHp = countered.playerHp;
  mobHp = countered.mobHp;
  bj.log = log.slice(-MAX_BATTLE_LOG);
  bj.mobHp = mobHp;
  session.mobHp = mobHp;
  session.lastMobAutoAttackAtMs = nowMs;

  if (playerHp <= 0) {
    bj.log = log.slice(-MAX_BATTLE_LOG);
    const freshTarget = await tx.character.findUnique({
      where: { id: targetCharacterId },
    });
    if (!freshTarget) return { targetDefeated: false };
    await persistBattleDefeatInTx(tx, {
      userId: freshTarget.userId,
      expectedRevision: null,
      char: freshTarget as CharacterRow,
      bj,
      spawn,
      maxHpEff,
      maxMpEff: maxMp,
      st: bj,
      log,
    });
    return { targetDefeated: true };
  }

  await persistCharacterFieldsInTx(tx, target.id, {
    hp: playerHp,
    battleJson: serializeBattleJsonForDb(bj),
  });
  return { targetDefeated: false };
}

export async function runWorldBossCombatTickInTx(
  tx: Tx,
  spawnId: string,
  nowMs: number
): Promise<WorldBossSessionState | null> {
  const session = await lockSessionRow(tx, spawnId);
  if (!session || session.mobHp <= 0) return session;

  const contexts = await loadParticipantContexts(tx, session);
  for (const ctx of contexts) {
    const p = session.participants[ctx.characterId];
    if (p) {
      p.lastPresenceAtMs = Math.max(
        p.lastPresenceAtMs,
        ctx.onlineLastSeenMs ?? 0
      );
    }
  }

  const validIds = listValidWorldBossParticipantIds(session, contexts, nowMs);
  reconcileWorldBossTarget(session, validIds, nowMs);

  if (shouldWorldBossAutoAttack(session, nowMs) && session.currentTargetCharacterId) {
    const targetId = session.currentTargetCharacterId;
    const defeated = await applyWorldBossAutoAttackInTx(
      tx,
      session,
      targetId,
      nowMs
    );
    if (defeated.targetDefeated) {
      const contextsAfter = await loadParticipantContexts(tx, session);
      const validAfter = listValidWorldBossParticipantIds(
        session,
        contextsAfter,
        nowMs
      );
      reconcileWorldBossTarget(session, validAfter, nowMs);
    }
  }

  await syncParticipantMobHpInTx(tx, session);
  await saveSession(tx, session);
  return session;
}

export async function recordWorldBossBattlePresenceInTx(
  tx: Tx,
  spawnId: string,
  characterId: string,
  nowMs: number
): Promise<void> {
  const session = await lockSessionRow(tx, spawnId);
  if (!session) return;
  const id = String(characterId || '').trim();
  const existing = session.participants[id];
  if (existing) {
    existing.lastPresenceAtMs = nowMs;
    await saveSession(tx, session);
  }
}

export async function recordWorldBossDamagingHitInTx(
  tx: Tx,
  spawnId: string,
  characterId: string,
  mobHp: number,
  damageDealt: number,
  nowMs: number
): Promise<WorldBossSessionState | null> {
  let session = await lockSessionRow(tx, spawnId);
  if (!session) return null;
  session.mobHp = Math.max(0, Math.min(session.mobMaxHp, mobHp));
  registerWorldBossDamagingHit(session, characterId, damageDealt, nowMs);
  await saveSession(tx, session);
  return runWorldBossCombatTickInTx(tx, spawnId, nowMs);
}

export async function runAllWorldBossCombatTicks(nowMs: number): Promise<void> {
  const rows = await prisma.worldBossSession.findMany({
    select: { spawnId: true },
  });
  for (const row of rows) {
    try {
      await prisma.$transaction(async (tx) => {
        await runWorldBossCombatTickInTx(tx, row.spawnId, nowMs);
      });
    } catch {
      /* ignore tick errors per spawn */
    }
  }
}
