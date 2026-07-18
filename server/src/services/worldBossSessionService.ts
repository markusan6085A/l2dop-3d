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
import {
  applyBattleLogWriteInPlace,
  bumpBattleVersionInPlace,
} from '../domain/battleVersion.js';
import { resolveBattleSpawnMeta } from '../domain/battlePvpContext.js';
import {
  createWorldBossSessionState,
  isSharedWorldBossKind,
  listValidWorldBossParticipantIds,
  parseWorldBossSessionState,
  reconcileWorldBossTarget,
  registerWorldBossDamagingHit,
  registerWorldBossAggressionTaunt,
  isWorldBossAutoAttackDue,
  scheduleNextWorldBossAutoAttack,
  RAID_BOSS_AUTO_ATTACK_MS,
  EPIC_BOSS_AUTO_ATTACK_MS,
  type WorldBossParticipantContext,
  type WorldBossSessionState,
} from '../domain/worldBossSession.js';
import {
  parseWorldCombatState,
  tickWorldCombatState,
} from '../domain/worldCombatState.js';
import { parsePvePendingDefeat } from '../domain/pvePendingDefeat.js';
import { prisma } from '../lib/prisma.js';
import { applyMobCounterDamage } from './battleServicePerformBattleAction.mobRetaliation.js';
import { persistBattleDefeatInTx } from './battleServiceBattleOutcomeTx.js';
import { serializeBattleJsonForDb } from './battleServiceBattleBuffs.js';
import { parseBattleJson } from './battleServiceParseBattleJson.js';
import { mobControlResumeAtMs } from '../domain/battleMobControl.js';
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

async function readSessionRow(
  tx: Tx,
  spawnId: string
): Promise<WorldBossSessionState | null> {
  const row = await tx.worldBossSession.findUnique({ where: { spawnId } });
  if (!row) return null;
  return parseWorldBossSessionState(row.stateJson);
}

/** Read-path: чи настав час автоатаки (без FOR UPDATE). */
export async function isWorldBossAutoAttackDueInTx(
  tx: Tx,
  spawnId: string,
  nowMs: number
): Promise<boolean> {
  const session = await readSessionRow(tx, spawnId);
  if (!session) return false;
  return isWorldBossAutoAttackDue(session, nowMs);
}

/** SQL: лише spawnId сесій, у яких настав час автоатаки (без lock / parse повного state). */
export async function listDueWorldBossSpawnIds(nowMs: number): Promise<string[]> {
  const rows = await prisma.$queryRaw<Array<{ spawnId: string }>>`
    SELECT "spawnId" FROM "WorldBossSession"
    WHERE COALESCE(("stateJson"->>'mobHp')::numeric, 0) > 0
      AND COALESCE(NULLIF("stateJson"->>'currentTargetCharacterId', ''), '') <> ''
      AND (
        COALESCE(("stateJson"->>'nextMobAutoAttackAtMs')::bigint, 9223372036854775807) <= ${nowMs}
        OR (
          "stateJson"->>'nextMobAutoAttackAtMs' IS NULL
          AND COALESCE(("stateJson"->>'lastMobAutoAttackAtMs')::bigint, 0) > 0
          AND COALESCE(("stateJson"->>'lastMobAutoAttackAtMs')::bigint, 0) + (
            CASE WHEN "stateJson"->>'spawnKind' = 'epic' THEN ${EPIC_BOSS_AUTO_ATTACK_MS} ELSE ${RAID_BOSS_AUTO_ATTACK_MS} END
          ) <= ${nowMs}
        )
      )
  `;
  return rows.map((r) => r.spawnId);
}

const presenceWriteAtMs = new Map<string, number>();
const PRESENCE_WRITE_MIN_MS = 5_000;

function presenceWriteKey(spawnId: string, characterId: string): string {
  return spawnId + ':' + characterId;
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

/** Сесія вже під FOR UPDATE. Повертає false, якщо lootIssued вже true. */
export async function tryClaimWorldBossLootInTx(
  tx: Tx,
  session: WorldBossSessionState,
  recipientCharacterId: string,
  nowMs: number
): Promise<boolean> {
  if (session.lootIssued) return false;
  const recipient = String(recipientCharacterId || '').trim();
  if (!recipient) return false;
  session.lootIssued = true;
  session.lootIssuedAt = nowMs;
  session.lootRecipientCharacterId = recipient;
  await saveSession(tx, session);
  return true;
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

/** Спільне HP РБ: канонічне значення з сесії (clamp до maxHp бою). */
export function clampSharedWorldBossMobHp(
  mobMaxHp: number,
  sharedHp: number
): number {
  const max = Math.max(1, Math.floor(mobMaxHp));
  return Math.max(0, Math.min(max, Math.floor(sharedHp)));
}

export async function resolveCanonicalWorldBossMobHpInTx(
  tx: Tx,
  spawnId: string,
  mobMaxHp: number,
  localMobHp: number
): Promise<number> {
  const shared = await loadWorldBossSessionMobHp(tx, spawnId);
  if (shared == null) return Math.max(0, Math.min(mobMaxHp, Math.floor(localMobHp)));
  return clampSharedWorldBossMobHp(mobMaxHp, shared);
}

export async function ensureWorldBossSessionInTx(
  tx: Tx,
  spawn: MapWorldSpawn,
  mobHp: number,
  nowMs: number
): Promise<WorldBossSessionState> {
  const mc = mobCombatFromSpawn(spawn);
  const hpHint = Math.max(0, Math.min(mc.maxHp, Math.floor(mobHp)));
  let session = await lockSessionRow(tx, spawn.id);
  if (!session) {
    session = createWorldBossSessionState({
      spawnId: spawn.id,
      mobHp: hpHint,
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
      autoAttackIntervalMs: spawn.autoAttackIntervalMs,
      firstAggroDelayMs: spawn.firstAggroDelayMs,
    });
    await saveSession(tx, session);
    return session;
  }
  /** Не «лікувати» спільного боса персональним mobSpawnHp — лише найменший HP. */
  session.mobHp = Math.max(
    0,
    Math.min(session.mobMaxHp, Math.min(session.mobHp, hpHint))
  );
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

/** Read-path (sync / GET battle): спільне HP РБ/епіка з сесії. */
export async function readWorldBossSessionMobHp(
  spawnId: string
): Promise<number | null> {
  const row = await prisma.worldBossSession.findUnique({ where: { spawnId } });
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
  /* mobHp у battleJson оновлюється під час flush pending hits */
  void tx;
  void session;
}

function ensureParticipant(session: WorldBossSessionState, characterId: string) {
  const id = String(characterId || '').trim();
  if (!id) return null;
  if (!session.participants[id]) {
    session.participants[id] = {
      characterId: id,
      lastDamageAtMs: 0,
      lastPresenceAtMs: 0,
      totalDamageDealt: 0,
      firstDamageAtMs: 0,
      pendingMobHits: [],
    };
  }
  const p = session.participants[id]!;
  if (!p.pendingMobHits) p.pendingMobHits = [];
  return p;
}

/** Застосувати накопичені удари РБ до персонажа (GET /battle, POST /action, смертельний flush). */
export async function flushWorldBossPendingMobHitsForCharacterInTx(
  tx: Tx,
  char: CharacterRow,
  _nowMs: number
): Promise<CharacterRow> {
  const bj = parseBattleJson(char.battleJson);
  if (!bj) return char;
  if (parsePvePendingDefeat(char.pvePendingDefeatJson)) return char;
  const spawn = resolveBattleSpawnMeta(bj);
  if (!spawn || !isSharedWorldBossKind(spawn.kind)) return char;

  const peek = await readSessionRow(tx, spawn.spawnId);
  if (!peek) return char;
  const peekParticipant = peek.participants[char.id];
  const peekPending = peekParticipant?.pendingMobHits ?? [];
  const mobHpDirtyPeek =
    bj.mobHp !== peek.mobHp || bj.mobMaxHp !== peek.mobMaxHp;
  if (peekPending.length === 0 && !mobHpDirtyPeek) return char;

  const session = await lockSessionRow(tx, spawn.spawnId);
  if (!session) return char;
  const participant = session.participants[char.id];
  const pending = participant?.pendingMobHits ?? [];
  const mobHpDirty =
    bj.mobHp !== session.mobHp || bj.mobMaxHp !== session.mobMaxHp;
  if (pending.length === 0 && !mobHpDirty) return char;

  const inv = parseInventory(char.inventoryJson);
  const effLv = levelFromTotalExp(char.exp);
  const combat = computeCombatStats(
    effLv,
    char.race,
    char.classBranch,
    inv,
    combatOptsFromRow(char)
  );
  const vit = computeVitals(effLv, char.race, char.classBranch, combat.con, combat.men);
  const maxMp = effectiveMaxMpWithJewelFlat(vit.maxMp, combat);
  const maxHpEff = effectiveMaxHpWithJewelFlat(vit.maxHp, combat);

  const log = [...(bj.log ?? [])];
  const logBeforeLen = log.length;
  let playerHp = Math.max(0, Math.min(maxHpEff, char.hp));
  if (pending.length > 0 && participant) {
    participant.pendingMobHits = [];
    for (const hit of pending) {
      if (hit.logLine) log.push(hit.logLine);
      if (hit.damage > 0) {
        playerHp = Math.max(0, playerHp - hit.damage);
      }
    }
  }

  const linesAdded = Math.max(0, log.length - logBeforeLen);
  applyBattleLogWriteInPlace(bj, log, linesAdded);
  bj.mobHp = session.mobHp;
  bj.mobMaxHp = session.mobMaxHp;
  if (linesAdded > 0 || mobHpDirty || pending.length > 0) {
    bumpBattleVersionInPlace(bj);
  }
  await saveSession(tx, session);

  if (playerHp <= 0) {
    await persistBattleDefeatInTx(tx, {
      userId: char.userId,
      expectedRevision: null,
      char,
      bj,
      spawn,
      maxHpEff,
      maxMpEff: maxMp,
      st: bj,
      log,
    });
    const fresh = await tx.character.findUnique({ where: { id: char.id } });
    return (fresh as CharacterRow) ?? char;
  }

  if (pending.length === 0 && !mobHpDirty) return char;

  await persistCharacterFieldsInTx(tx, char.id, {
    hp: playerHp,
    battleJson: serializeBattleJsonForDb(bj),
  });
  const fresh = await tx.character.findUnique({ where: { id: char.id } });
  return (fresh as CharacterRow) ?? char;
}

export async function flushWorldBossPendingMobHitsForUserInTx(
  tx: Tx,
  userId: string,
  nowMs: number
): Promise<CharacterRow | null> {
  const char = await tx.character.findFirst({
    where: { userId },
    orderBy: { lastUpdate: 'desc' },
  });
  if (!char) return null;
  return flushWorldBossPendingMobHitsForCharacterInTx(
    tx,
    char as CharacterRow,
    nowMs
  );
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

  const resumeAt = mobControlResumeAtMs(bj, nowMs);
  if (resumeAt !== null) {
    session.nextMobAutoAttackAtMs = Math.max(
      session.nextMobAutoAttackAtMs,
      resumeAt
    );
    await saveSession(tx, session);
    return { targetDefeated: false };
  }

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
  const log: string[] = [];
  const logBefore = 0;
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
  const hitLines = log.slice(logBefore);
  const logLine = hitLines.length ? hitLines[hitLines.length - 1]! : '';
  const hitDamage = Math.max(0, playerHp - countered.playerHp);
  playerHp = countered.playerHp;
  mobHp = countered.mobHp;
  session.mobHp = mobHp;
  scheduleNextWorldBossAutoAttack(session, nowMs);

  const participant = ensureParticipant(session, targetCharacterId);
  if (participant && logLine) {
    participant.pendingMobHits!.push({ damage: hitDamage, logLine });
  }

  const pendingTotal =
    (participant?.pendingMobHits ?? []).reduce(
      (sum, hit) => sum + Math.max(0, hit.damage),
      0
    ) ?? 0;
  if (cr.hp - pendingTotal <= 0) {
    await flushWorldBossPendingMobHitsForCharacterInTx(tx, cr, nowMs);
    return { targetDefeated: true };
  }

  return { targetDefeated: false };
}

export async function runWorldBossCombatTickInTx(
  tx: Tx,
  spawnId: string,
  nowMs: number
): Promise<WorldBossSessionState | null> {
  const session = await lockSessionRow(tx, spawnId);
  if (!session || session.mobHp <= 0) return session;
  if (!isWorldBossAutoAttackDue(session, nowMs)) return session;

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

  if (
    session.currentTargetCharacterId &&
    isWorldBossAutoAttackDue(session, nowMs)
  ) {
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

/** Смертельний удар: примусово 0 HP у спільній сесії (desync guard). */
export async function forceWorldBossSessionMobHpZeroInTx(
  tx: Tx,
  spawnId: string
): Promise<void> {
  const session = await lockSessionRow(tx, spawnId);
  if (!session || session.mobHp <= 0) return;
  session.mobHp = 0;
  await saveSession(tx, session);
}

export async function recordWorldBossBattlePresenceInTx(
  tx: Tx,
  spawnId: string,
  characterId: string,
  nowMs: number
): Promise<void> {
  const id = String(characterId || '').trim();
  if (!id) return;
  const key = presenceWriteKey(spawnId, id);
  const lastWrite = presenceWriteAtMs.get(key) ?? 0;
  if (nowMs - lastWrite < PRESENCE_WRITE_MIN_MS) return;

  const session = await lockSessionRow(tx, spawnId);
  if (!session) return;
  const existing = session.participants[id];
  if (existing) {
    existing.lastPresenceAtMs = nowMs;
    await saveSession(tx, session);
    presenceWriteAtMs.set(key, nowMs);
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
  presenceWriteAtMs.set(presenceWriteKey(spawnId, characterId), nowMs);
  return session;
}

/** Aggression: перемикає currentTargetCharacterId РБ на кастера таунту. */
export async function applyWorldBossAggressionTauntInTx(
  tx: Tx,
  spawnId: string,
  characterId: string,
  nowMs: number
): Promise<boolean> {
  const session = await lockSessionRow(tx, spawnId);
  if (!session || session.mobHp <= 0) return false;
  const switched = registerWorldBossAggressionTaunt(session, characterId, nowMs);
  await saveSession(tx, session);
  presenceWriteAtMs.set(presenceWriteKey(spawnId, characterId), nowMs);
  return switched;
}

export async function runAllWorldBossCombatTicks(nowMs: number): Promise<void> {
  const spawnIds = await listDueWorldBossSpawnIds(nowMs);
  for (const spawnId of spawnIds) {
    try {
      await prisma.$transaction(async (tx) => {
        await runWorldBossCombatTickInTx(tx, spawnId, nowMs);
      });
    } catch {
      /* ignore tick errors per spawn */
    }
  }
}
