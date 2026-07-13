import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from './battleTypes.js';

/** Без урону по босу — гравець випадає з валідних цілей. */
export const WORLD_BOSS_DAMAGE_TTL_MS = 30_000;
/** Offline / без battle-presence — grace 30 с. */
export const WORLD_BOSS_PRESENCE_GRACE_MS = 30_000;

/** Фоновий tick: лише перевірка due-сесій (без lock усіх босів). */
export const WORLD_BOSS_TICK_MS = 1_000;

/** Звичайний РБ — базовий інтервал автоатаки. */
export const RAID_BOSS_AUTO_ATTACK_MS = 3_000;
/** Epic — трохи швидше (MVP без окремих скілів). */
export const EPIC_BOSS_AUTO_ATTACK_MS = 2_800;
/** Мінімально допустимий інтервал (нижче — спам у текстовій грі). */
export const MIN_BOSS_AUTO_ATTACK_MS = 2_200;

/** Перший удар після aggro — raid. */
export const RAID_BOSS_FIRST_AGGRO_DELAY_MS = 1_500;
/** Перший удар після aggro — epic. */
export const EPIC_BOSS_FIRST_AGGRO_DELAY_MS = 1_500;

/** @deprecated Використовуй RAID/EPIC_BOSS_AUTO_ATTACK_MS */
export const WORLD_BOSS_AUTO_ATTACK_MS = RAID_BOSS_AUTO_ATTACK_MS;

/** Немає цілі — не потрапляє в due-фільтр SQL. */
export const WORLD_BOSS_NO_ATTACK_SCHEDULED = 9_007_199_254_740_991;

export function isSharedWorldBossKind(kind: MapSpawnKind): boolean {
  return kind === 'raid' || kind === 'epic';
}

export function resolveWorldBossAttackTiming(input: {
  kind: MapSpawnKind;
  autoAttackIntervalMs?: number;
  firstAggroDelayMs?: number;
}): { autoAttackIntervalMs: number; firstAggroDelayMs: number } {
  const defaultInterval =
    input.kind === 'epic' ? EPIC_BOSS_AUTO_ATTACK_MS : RAID_BOSS_AUTO_ATTACK_MS;
  const defaultFirst =
    input.kind === 'epic'
      ? EPIC_BOSS_FIRST_AGGRO_DELAY_MS
      : RAID_BOSS_FIRST_AGGRO_DELAY_MS;
  let interval = Number(input.autoAttackIntervalMs);
  if (!Number.isFinite(interval) || interval < MIN_BOSS_AUTO_ATTACK_MS) {
    interval = defaultInterval;
  } else {
    interval = Math.floor(interval);
  }
  let first = Number(input.firstAggroDelayMs);
  if (!Number.isFinite(first) || first <= 0) {
    first = defaultFirst;
  } else {
    first = Math.floor(first);
  }
  return { autoAttackIntervalMs: interval, firstAggroDelayMs: first };
}

export function scheduleFirstAggroWorldBossAttack(
  session: WorldBossSessionState,
  nowMs: number
): void {
  session.nextMobAutoAttackAtMs = nowMs + session.firstAggroDelayMs;
}

export function scheduleNextWorldBossAutoAttack(
  session: WorldBossSessionState,
  nowMs: number
): void {
  session.nextMobAutoAttackAtMs = nowMs + session.autoAttackIntervalMs;
}

export function isWorldBossAutoAttackDue(
  session: WorldBossSessionState,
  nowMs: number
): boolean {
  if (session.mobHp <= 0) return false;
  if (!session.currentTargetCharacterId) return false;
  return nowMs >= session.nextMobAutoAttackAtMs;
}

/** @deprecated Використовуй isWorldBossAutoAttackDue */
export function shouldWorldBossAutoAttack(
  session: WorldBossSessionState,
  nowMs: number
): boolean {
  return isWorldBossAutoAttackDue(session, nowMs);
}

export interface WorldBossPendingMobHit {
  damage: number;
  logLine: string;
}

export interface WorldBossParticipant {
  characterId: string;
  lastDamageAtMs: number;
  lastPresenceAtMs: number;
  /** Сумарний урон по босу за поточний бій (для розподілу луту). */
  totalDamageDealt: number;
  /** Час першого урону — tie-break при рівному totalDamageDealt. */
  firstDamageAtMs: number;
  /** Накопичені удари боса — застосовуються при GET /battle/action (не пишемо Character кожен tick). */
  pendingMobHits?: WorldBossPendingMobHit[];
}

export interface WorldBossSessionState {
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  mobPAtk: number;
  mobPDef: number;
  mobMAtk: number;
  mobMDef: number;
  mobEvasion: number;
  spawnWorldX: number;
  spawnWorldY: number;
  spawnName: string;
  spawnLevel: number;
  spawnKind: MapSpawnKind;
  currentTargetCharacterId: string | null;
  participants: Record<string, WorldBossParticipant>;
  autoAttackIntervalMs: number;
  firstAggroDelayMs: number;
  /** Час наступної автоатаки (nowMs >= next → due). */
  nextMobAutoAttackAtMs: number;
}

export interface WorldBossParticipantContext {
  characterId: string;
  worldX: number;
  worldY: number;
  inBattleOnSpawn: boolean;
  playerHp: number;
  onlineLastSeenMs: number | null;
}

export function createWorldBossSessionState(args: {
  spawnId: string;
  mobHp: number;
  mobMaxHp: number;
  mobPAtk: number;
  mobPDef: number;
  mobMAtk: number;
  mobMDef: number;
  mobEvasion: number;
  spawnWorldX: number;
  spawnWorldY: number;
  spawnName: string;
  spawnLevel: number;
  spawnKind: MapSpawnKind;
  nowMs: number;
  autoAttackIntervalMs?: number;
  firstAggroDelayMs?: number;
}): WorldBossSessionState {
  const timing = resolveWorldBossAttackTiming({
    kind: args.spawnKind,
    autoAttackIntervalMs: args.autoAttackIntervalMs,
    firstAggroDelayMs: args.firstAggroDelayMs,
  });
  return {
    spawnId: args.spawnId,
    mobHp: args.mobHp,
    mobMaxHp: args.mobMaxHp,
    mobPAtk: args.mobPAtk,
    mobPDef: args.mobPDef,
    mobMAtk: args.mobMAtk,
    mobMDef: args.mobMDef,
    mobEvasion: args.mobEvasion,
    spawnWorldX: args.spawnWorldX,
    spawnWorldY: args.spawnWorldY,
    spawnName: args.spawnName,
    spawnLevel: args.spawnLevel,
    spawnKind: args.spawnKind,
    currentTargetCharacterId: null,
    participants: {},
    autoAttackIntervalMs: timing.autoAttackIntervalMs,
    firstAggroDelayMs: timing.firstAggroDelayMs,
    nextMobAutoAttackAtMs: WORLD_BOSS_NO_ATTACK_SCHEDULED,
  };
}

export function parseWorldBossSessionState(raw: unknown): WorldBossSessionState | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const spawnId = String(o.spawnId ?? '').trim();
  if (!spawnId) return null;
  const mobHp = Number(o.mobHp);
  const mobMaxHp = Number(o.mobMaxHp);
  if (!Number.isFinite(mobHp) || !Number.isFinite(mobMaxHp) || mobMaxHp <= 0) {
    return null;
  }
  const participantsRaw = o.participants;
  const participants: Record<string, WorldBossParticipant> = {};
  if (participantsRaw != null && typeof participantsRaw === 'object' && !Array.isArray(participantsRaw)) {
    for (const [key, val] of Object.entries(participantsRaw as Record<string, unknown>)) {
      if (val == null || typeof val !== 'object' || Array.isArray(val)) continue;
      const p = val as Record<string, unknown>;
      const characterId = String(p.characterId ?? key).trim();
      if (!characterId) continue;
      const pendingRaw = p.pendingMobHits;
      const pendingMobHits: WorldBossPendingMobHit[] = [];
      if (Array.isArray(pendingRaw)) {
        for (const hit of pendingRaw) {
          if (hit == null || typeof hit !== 'object' || Array.isArray(hit)) continue;
          const h = hit as Record<string, unknown>;
          const logLine = typeof h.logLine === 'string' ? h.logLine.trim() : '';
          if (!logLine) continue;
          pendingMobHits.push({
            damage: Math.max(0, Math.floor(Number(h.damage) || 0)),
            logLine,
          });
        }
      }
      participants[characterId] = {
        characterId,
        lastDamageAtMs: Number(p.lastDamageAtMs) || 0,
        lastPresenceAtMs: Number(p.lastPresenceAtMs) || 0,
        totalDamageDealt: Math.max(0, Math.floor(Number(p.totalDamageDealt) || 0)),
        firstDamageAtMs: Number(p.firstDamageAtMs) || 0,
        ...(pendingMobHits.length > 0 ? { pendingMobHits } : {}),
      };
    }
  }
  const spawnKind = String(o.spawnKind ?? 'raid') as MapSpawnKind;
  const timing = resolveWorldBossAttackTiming({
    kind: spawnKind,
    autoAttackIntervalMs:
      o.autoAttackIntervalMs != null ? Number(o.autoAttackIntervalMs) : undefined,
    firstAggroDelayMs:
      o.firstAggroDelayMs != null ? Number(o.firstAggroDelayMs) : undefined,
  });
  let nextMobAutoAttackAtMs = Number(o.nextMobAutoAttackAtMs);
  if (!Number.isFinite(nextMobAutoAttackAtMs) || nextMobAutoAttackAtMs <= 0) {
    const legacyLast = Number(o.lastMobAutoAttackAtMs) || 0;
    if (legacyLast > 0) {
      nextMobAutoAttackAtMs = legacyLast + timing.autoAttackIntervalMs;
    } else {
      nextMobAutoAttackAtMs = WORLD_BOSS_NO_ATTACK_SCHEDULED;
    }
  }
  const currentTargetCharacterId =
    o.currentTargetCharacterId != null
      ? String(o.currentTargetCharacterId).trim() || null
      : null;
  if (!currentTargetCharacterId) {
    nextMobAutoAttackAtMs = WORLD_BOSS_NO_ATTACK_SCHEDULED;
  }
  return {
    spawnId,
    mobHp: Math.max(0, Math.floor(mobHp)),
    mobMaxHp: Math.max(1, Math.floor(mobMaxHp)),
    mobPAtk: Math.max(1, Math.floor(Number(o.mobPAtk) || 1)),
    mobPDef: Math.max(0, Number(o.mobPDef) || 0),
    mobMAtk: Math.max(0, Number(o.mobMAtk) || 0),
    mobMDef: Math.max(0, Number(o.mobMDef) || 0),
    mobEvasion: Math.max(0, Math.floor(Number(o.mobEvasion) || 0)),
    spawnWorldX: Number(o.spawnWorldX) || 0,
    spawnWorldY: Number(o.spawnWorldY) || 0,
    spawnName: String(o.spawnName ?? 'Boss'),
    spawnLevel: Math.max(1, Math.floor(Number(o.spawnLevel) || 1)),
    spawnKind,
    currentTargetCharacterId,
    participants,
    autoAttackIntervalMs: timing.autoAttackIntervalMs,
    firstAggroDelayMs: timing.firstAggroDelayMs,
    nextMobAutoAttackAtMs,
  };
}

function participantPresenceMs(
  participant: WorldBossParticipant,
  onlineLastSeenMs: number | null
): number {
  const local = participant.lastPresenceAtMs;
  if (onlineLastSeenMs != null && onlineLastSeenMs > local) {
    return onlineLastSeenMs;
  }
  return local;
}

export function isWorldBossParticipantValid(
  participant: WorldBossParticipant,
  ctx: WorldBossParticipantContext,
  session: WorldBossSessionState,
  nowMs: number
): boolean {
  if (!ctx.inBattleOnSpawn) return false;
  if (ctx.playerHp <= 0) return false;
  const dist = Math.hypot(
    ctx.worldX - session.spawnWorldX,
    ctx.worldY - session.spawnWorldY
  );
  if (dist > BATTLE_RANGE) return false;
  if (nowMs - participant.lastDamageAtMs > WORLD_BOSS_DAMAGE_TTL_MS) return false;
  const presenceMs = participantPresenceMs(participant, ctx.onlineLastSeenMs);
  if (nowMs - presenceMs > WORLD_BOSS_PRESENCE_GRACE_MS) return false;
  return true;
}

export function listValidWorldBossParticipantIds(
  session: WorldBossSessionState,
  contexts: WorldBossParticipantContext[],
  nowMs: number
): string[] {
  const byId = new Map(contexts.map((c) => [c.characterId, c]));
  const out: string[] = [];
  for (const participant of Object.values(session.participants)) {
    const ctx = byId.get(participant.characterId);
    if (!ctx) continue;
    if (!isWorldBossParticipantValid(participant, ctx, session, nowMs)) continue;
    out.push(participant.characterId);
  }
  return out;
}

export function touchWorldBossParticipant(
  session: WorldBossSessionState,
  characterId: string,
  nowMs: number,
  opts?: { damagingHit?: boolean }
): void {
  const id = String(characterId || '').trim();
  if (!id) return;
  const prev = session.participants[id];
  session.participants[id] = {
    characterId: id,
    lastPresenceAtMs: nowMs,
    lastDamageAtMs: opts?.damagingHit ? nowMs : (prev?.lastDamageAtMs ?? 0),
    totalDamageDealt: prev?.totalDamageDealt ?? 0,
    firstDamageAtMs: prev?.firstDamageAtMs ?? 0,
    pendingMobHits: prev?.pendingMobHits,
  };
}

export function registerWorldBossDamagingHit(
  session: WorldBossSessionState,
  characterId: string,
  damage: number,
  nowMs: number
): void {
  const id = String(characterId || '').trim();
  if (!id) return;
  const dmg = Math.max(0, Math.floor(Number(damage) || 0));
  const prev = session.participants[id];
  if (prev) {
    prev.lastPresenceAtMs = nowMs;
    if (dmg > 0) {
      prev.lastDamageAtMs = nowMs;
      prev.totalDamageDealt += dmg;
      if (!prev.firstDamageAtMs) prev.firstDamageAtMs = nowMs;
    }
  } else {
    session.participants[id] = {
      characterId: id,
      lastPresenceAtMs: nowMs,
      lastDamageAtMs: dmg > 0 ? nowMs : 0,
      totalDamageDealt: dmg,
      firstDamageAtMs: dmg > 0 ? nowMs : 0,
    };
  }
  if (!session.currentTargetCharacterId && dmg > 0) {
    session.currentTargetCharacterId = id;
    scheduleFirstAggroWorldBossAttack(session, nowMs);
  }
}

/** Хто наніс найбільше урону — отримує дроп/EXP/SP/adena. */
export function pickWorldBossTopDamageDealer(
  session: WorldBossSessionState
): string | null {
  let bestId: string | null = null;
  let bestDmg = 0;
  let bestFirst = Number.POSITIVE_INFINITY;
  for (const participant of Object.values(session.participants)) {
    const dmg = participant.totalDamageDealt ?? 0;
    if (dmg <= 0) continue;
    const first = participant.firstDamageAtMs || 0;
    if (
      dmg > bestDmg ||
      (dmg === bestDmg && first > 0 && first < bestFirst)
    ) {
      bestDmg = dmg;
      bestFirst = first;
      bestId = participant.characterId;
    }
  }
  return bestId;
}

export function pickRandomWorldBossTarget(
  validIds: readonly string[],
  excludeId?: string | null
): string | null {
  const pool = validIds.filter((id) => id && id !== excludeId);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

/** Оновлює currentTargetCharacterId; повертає true якщо ціль змінилась. */
export function reconcileWorldBossTarget(
  session: WorldBossSessionState,
  validIds: readonly string[],
  nowMs: number
): boolean {
  const cur = session.currentTargetCharacterId;
  if (cur && validIds.includes(cur)) {
    return false;
  }
  const next = pickRandomWorldBossTarget(validIds, cur);
  session.currentTargetCharacterId = next;
  if (next && next !== cur) {
    scheduleFirstAggroWorldBossAttack(session, nowMs);
  } else if (!next) {
    session.nextMobAutoAttackAtMs = WORLD_BOSS_NO_ATTACK_SCHEDULED;
  }
  return next !== cur;
}
