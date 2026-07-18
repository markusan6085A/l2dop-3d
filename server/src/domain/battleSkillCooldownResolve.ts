import type { BattleActionId, BattleJsonState } from './battle.js';
import { canonicalBattleIdForAction } from '../data/humanFighterSkillCatalog.battleActionMap.js';
import { canonicalBattleSkillId } from '../data/humanFighterSkillCatalog.legacyIds.js';
import {
  basicAttackCooldownKeys,
  isBasicPanelAttackAction,
} from './battleBasicAttackCooldown.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { battleVersionFromState } from './battleVersion.js';
import { BattleSkillNotAllowedError } from './battleSkillNotAllowedError.js';
import {
  COOLDOWN_READY_GRACE_MS,
  isCooldownBlocked,
} from './battleSkills/humanFighterTurnHelpers.js';
import type { CharacterRow } from '../services/charTypes.js';

/** Канонічний ключ у in-battle cooldown map. */
export function canonicalCooldownMapKey(rawKey: string): string | null {
  const key = String(rawKey || '').trim();
  if (!key) return null;
  if (key === 'attack' || key === 'bolt') return key;
  if (/^l2_\d+$/i.test(key)) return key.replace(/^L2_/i, 'l2_');
  /** Legacy: bare numeric `"78"` → `l2_78`. */
  if (/^\d+$/.test(key)) return 'l2_' + key;
  const fromAction = canonicalBattleSkillId(key);
  if (/^l2_\d+$/.test(fromAction)) return fromAction;
  return null;
}

/** Канонічний ключ скіла з action (`war_cry` → `l2_78`). */
export function normalizeBattleSkillId(action: string): string {
  const act = String(action || '').trim();
  if (!act) return act;
  const named = canonicalBattleIdForAction(act as BattleActionId);
  if (named && /^l2_\d+$/.test(named)) {
    return canonicalBattleSkillId(named);
  }
  if (/^l2_\d+$/i.test(act)) {
    return canonicalBattleSkillId(act.replace(/^L2_/i, 'l2_'));
  }
  return canonicalBattleSkillId(act);
}

function putActiveCooldown(
  merged: Record<string, number>,
  key: string,
  until: unknown,
  nowMs: number
): void {
  if (typeof until !== 'number' || !Number.isFinite(until) || until <= nowMs) return;
  const floor = Math.floor(until);
  const prev = merged[key];
  if (prev === undefined || floor > prev) merged[key] = floor;
}

/**
 * Єдине джерело активних cooldown для sync / перевірки / delta.
 * `skillCooldownsJson` + `st.mysticSkillCdUntil`, max на ключ.
 */
export function mergeBattleCooldownMaps(
  row: CharacterRow,
  st: BattleJsonState,
  nowMs: number
): Record<string, number> {
  const merged: Record<string, number> = {};
  const mystic = st.mysticSkillCdUntil;
  if (mystic) {
    for (const [key, until] of Object.entries(mystic)) {
      const canonKey = canonicalCooldownMapKey(key);
      if (!canonKey) continue;
      putActiveCooldown(merged, canonKey, until, nowMs);
    }
  }
  for (const cd of parseSkillCooldowns(row.skillCooldownsJson, nowMs)) {
    putActiveCooldown(merged, 'l2_' + String(cd.skillId), cd.readyAt, nowMs);
  }
  return merged;
}

export type ActionCooldownResolve = {
  requestedAction: string;
  requestedSkillId: string;
  normalizedSkillId: string;
  nowMs: number;
  skillCooldownUntilMs?: number;
  globalCooldownUntilMs?: number;
  readyAtMs?: number;
  skillRemainingMs: number;
  globalRemainingMs: number;
  remainingMs: number;
  blockedBy?: 'skill' | 'global';
  cooldownSource?: string;
  cooldownMapKeys: string[];
  skillCooldownKeys: string[];
  mysticCooldownKeys: string[];
  battleVersion: number;
  skillCooldowns: Record<string, number>;
  mysticSkillCdUntil: Record<string, number>;
};

function lookupKeysForAction(
  action: BattleActionId,
  normalizedSkillId: string
): string[] {
  const keys: string[] = [];
  const push = (k: string) => {
    if (k && !keys.includes(k)) keys.push(k);
  };
  push(normalizedSkillId);
  if (normalizedSkillId !== String(action)) {
    push(String(action));
  }
  if (isBasicPanelAttackAction(action)) {
    for (const k of basicAttackCooldownKeys(action)) push(k);
  }
  return keys;
}

function pickCooldownSource(
  merged: Record<string, number>,
  row: CharacterRow,
  st: BattleJsonState,
  winningKey: string | undefined,
  nowMs: number
): string | undefined {
  if (!winningKey) return undefined;
  const mysticVal = st.mysticSkillCdUntil?.[winningKey];
  const jsonRows = parseSkillCooldowns(row.skillCooldownsJson, nowMs);
  const jsonKey = /^l2_(\d+)$/.exec(winningKey);
  if (jsonKey) {
    const sid = parseInt(jsonKey[1]!, 10);
    const jsonRow = jsonRows.find((r) => r.skillId === sid);
    if (
      jsonRow &&
      typeof mysticVal === 'number' &&
      Math.floor(mysticVal) === Math.floor(jsonRow.readyAt)
    ) {
      return 'skillCooldownsJson+mysticSkillCdUntil';
    }
    if (jsonRow && Math.floor(jsonRow.readyAt) === merged[winningKey]) {
      return 'skillCooldownsJson';
    }
  }
  if (typeof mysticVal === 'number' && Math.floor(mysticVal) === merged[winningKey]) {
    if (winningKey === 'attack' || winningKey === 'bolt') {
      return 'mysticSkillCdUntil:global';
    }
    return 'mysticSkillCdUntil';
  }
  if (winningKey === 'attack' || winningKey === 'bolt') {
    return 'globalCooldownUntilMs';
  }
  return 'merged';
}

/** Розв'язати cooldown для action (read-only). */
export function resolveActionCooldownState(
  row: CharacterRow,
  st: BattleJsonState,
  action: BattleActionId,
  nowMs: number = Date.now()
): ActionCooldownResolve {
  const merged = mergeBattleCooldownMaps(row, st, nowMs);
  const requestedAction = String(action);
  const normalizedSkillId = normalizeBattleSkillId(requestedAction);
  const keys = lookupKeysForAction(action, normalizedSkillId);

  let skillCooldownUntilMs: number | undefined;
  let winningSkillKey: string | undefined;
  for (const key of keys) {
    const v = merged[key];
    if (typeof v !== 'number') continue;
    if (skillCooldownUntilMs === undefined || v > skillCooldownUntilMs) {
      skillCooldownUntilMs = v;
      winningSkillKey = key;
    }
  }

  let globalCooldownUntilMs: number | undefined;
  for (const gKey of ['attack', 'bolt'] as const) {
    const v = merged[gKey];
    if (typeof v !== 'number') continue;
    if (globalCooldownUntilMs === undefined || v > globalCooldownUntilMs) {
      globalCooldownUntilMs = v;
    }
  }

  const readyAtMs =
    skillCooldownUntilMs != null || globalCooldownUntilMs != null
      ? Math.max(skillCooldownUntilMs ?? 0, globalCooldownUntilMs ?? 0)
      : undefined;

  const skillRemainingMs =
    skillCooldownUntilMs != null
      ? Math.max(0, skillCooldownUntilMs - nowMs)
      : 0;
  const globalRemainingMs =
    globalCooldownUntilMs != null
      ? Math.max(0, globalCooldownUntilMs - nowMs)
      : 0;
  const remainingMs = readyAtMs != null ? Math.max(0, readyAtMs - nowMs) : 0;

  let blockedBy: 'skill' | 'global' | undefined;
  if (
    isBasicPanelAttackAction(action) &&
    globalRemainingMs > COOLDOWN_READY_GRACE_MS &&
    globalRemainingMs >= skillRemainingMs
  ) {
    blockedBy = 'global';
  } else if (skillRemainingMs > COOLDOWN_READY_GRACE_MS) {
    blockedBy = 'skill';
  } else if (globalRemainingMs > COOLDOWN_READY_GRACE_MS) {
    blockedBy = 'global';
  }

  return {
    requestedAction,
    requestedSkillId: requestedAction,
    normalizedSkillId,
    nowMs,
    skillCooldownUntilMs,
    globalCooldownUntilMs,
    readyAtMs,
    skillRemainingMs,
    globalRemainingMs,
    remainingMs,
    blockedBy,
    cooldownSource: pickCooldownSource(
      merged,
      row,
      st,
      winningSkillKey,
      nowMs
    ),
    cooldownMapKeys: Object.keys(merged),
    skillCooldownKeys: Object.keys(merged),
    mysticCooldownKeys: Object.keys(st.mysticSkillCdUntil ?? {}),
    battleVersion: battleVersionFromState(st),
    skillCooldowns: merged,
    mysticSkillCdUntil: st.mysticSkillCdUntil ?? {},
  };
}

export function logSkillCooldownCheck(
  characterId: string,
  state: ActionCooldownResolve
): void {
  console.log('[skill-cooldown-check]', {
    characterId,
    action: state.requestedAction,
    requestedSkillId: state.requestedSkillId,
    normalizedSkillId: state.normalizedSkillId,
    nowMs: state.nowMs,
    skillCooldownUntilMs: state.skillCooldownUntilMs,
    globalCooldownUntilMs: state.globalCooldownUntilMs,
    readyAtMs: state.readyAtMs,
    remainingMs: state.remainingMs,
    skillCooldownKeys: state.skillCooldownKeys,
    mysticCooldownKeys: state.mysticCooldownKeys,
    battleVersion: state.battleVersion,
    cooldownSource: state.cooldownSource,
    blockedBy: state.blockedBy,
  });
}

/** Синхронізувати `st.mysticSkillCdUntil` з merged map (лише активні). */
export function syncMysticSkillCdUntilFromMerged(
  st: BattleJsonState,
  merged: Record<string, number>
): void {
  if (Object.keys(merged).length === 0) {
    delete st.mysticSkillCdUntil;
    return;
  }
  st.mysticSkillCdUntil = { ...merged };
}

/**
 * Перевірка cooldown перед turn resolve.
 * Блокує лише якщо merged map (json + mystic) ще активний.
 */
export function assertActionCooldownReady(args: {
  characterId: string;
  row: CharacterRow;
  st: BattleJsonState;
  action: BattleActionId;
  nowMs?: number;
}): void {
  const nowMs = args.nowMs ?? Date.now();
  const state = resolveActionCooldownState(
    args.row,
    args.st,
    args.action,
    nowMs
  );
  logSkillCooldownCheck(args.characterId, state);

  const blockUntil = state.readyAtMs;
  if (!isCooldownBlocked(blockUntil, nowMs)) return;

  throw new BattleSkillNotAllowedError({
    reason: 'cooldown',
    skillId: state.normalizedSkillId,
    remainingCooldownMs: Math.max(1, (blockUntil ?? nowMs) - nowMs),
    serverNowMs: nowMs,
    cooldownReadyAtMs: blockUntil,
    cooldownDiag: state,
  });
}
