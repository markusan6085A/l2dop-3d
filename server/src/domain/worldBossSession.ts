import type { MapSpawnKind } from '../data/mapWorldSpawns.js';
import { BATTLE_RANGE } from './battleTypes.js';

/** Без урону по босу — гравець випадає з валідних цілей. */
export const WORLD_BOSS_DAMAGE_TTL_MS = 30_000;
/** Offline / без battle-presence — grace 30 с. */
export const WORLD_BOSS_PRESENCE_GRACE_MS = 30_000;
/** Інтервал автоатаки РБ/епіка (серверний tick). */
export const WORLD_BOSS_AUTO_ATTACK_MS = 2_800;

export function isSharedWorldBossKind(kind: MapSpawnKind): boolean {
  return kind === 'raid' || kind === 'epic';
}

export interface WorldBossParticipant {
  characterId: string;
  lastDamageAtMs: number;
  lastPresenceAtMs: number;
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
  lastMobAutoAttackAtMs: number;
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
}): WorldBossSessionState {
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
    lastMobAutoAttackAtMs: args.nowMs,
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
      participants[characterId] = {
        characterId,
        lastDamageAtMs: Number(p.lastDamageAtMs) || 0,
        lastPresenceAtMs: Number(p.lastPresenceAtMs) || 0,
      };
    }
  }
  const spawnKind = String(o.spawnKind ?? 'raid') as MapSpawnKind;
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
    currentTargetCharacterId:
      o.currentTargetCharacterId != null
        ? String(o.currentTargetCharacterId).trim() || null
        : null,
    participants,
    lastMobAutoAttackAtMs: Number(o.lastMobAutoAttackAtMs) || 0,
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
  };
}

export function registerWorldBossDamagingHit(
  session: WorldBossSessionState,
  characterId: string,
  nowMs: number
): void {
  touchWorldBossParticipant(session, characterId, nowMs, { damagingHit: true });
  if (!session.currentTargetCharacterId) {
    session.currentTargetCharacterId = characterId;
  }
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
    session.lastMobAutoAttackAtMs = nowMs;
  }
  return next !== cur;
}

export function shouldWorldBossAutoAttack(
  session: WorldBossSessionState,
  nowMs: number
): boolean {
  if (session.mobHp <= 0) return false;
  if (!session.currentTargetCharacterId) return false;
  return nowMs - session.lastMobAutoAttackAtMs >= WORLD_BOSS_AUTO_ATTACK_MS;
}
