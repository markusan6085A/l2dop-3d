import type { BattleJsonState } from '../domain/battle.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import type { CharacterRow } from './charTypes.js';

const GLOBAL_CD_KEYS = ['attack', 'bolt'] as const;

/** Кулдауни для sync/action delta: in-battle map + skillCooldownsJson. */
export function battleCooldownsForSync(
  row: CharacterRow,
  st: BattleJsonState,
  nowMs: number
): Record<string, number> | undefined {
  const merged: Record<string, number> = {};
  const mystic = st.mysticSkillCdUntil;
  if (mystic) {
    for (const [key, readyAt] of Object.entries(mystic)) {
      if (
        typeof readyAt === 'number' &&
        Number.isFinite(readyAt) &&
        readyAt > nowMs
      ) {
        merged[key] = readyAt;
      }
    }
  }
  const rows = parseSkillCooldowns(row.skillCooldownsJson, nowMs);
  for (const cd of rows) {
    if (cd.readyAt > nowMs) {
      merged['l2_' + String(cd.skillId)] = cd.readyAt;
    }
  }
  return Object.keys(merged).length > 0 ? merged : undefined;
}

/** Найпізніший GCD (attack/bolt) для UI. */
export function extractGlobalCooldownUntilMs(
  skillCooldowns: Record<string, number> | undefined,
  nowMs: number
): number | undefined {
  if (!skillCooldowns) return undefined;
  let max = 0;
  for (const key of GLOBAL_CD_KEYS) {
    const v = skillCooldowns[key];
    if (typeof v === 'number' && Number.isFinite(v) && v > nowMs) {
      max = Math.max(max, Math.floor(v));
    }
  }
  return max > nowMs ? max : undefined;
}

export type BattleCooldownFields = {
  serverNowMs: number;
  /** Активні cooldownUntilMs (Unix ms). */
  skillCooldowns?: Record<string, number>;
  /** Alias для сумісності зі старим клієнтом. */
  mysticSkillCdUntil?: Record<string, number>;
  globalCooldownUntilMs?: number;
};

export function buildBattleCooldownFields(
  row: CharacterRow,
  st: BattleJsonState,
  nowMs: number = Date.now()
): BattleCooldownFields {
  const skillCooldowns = battleCooldownsForSync(row, st, nowMs);
  return {
    serverNowMs: nowMs,
    ...(skillCooldowns ? { skillCooldowns, mysticSkillCdUntil: skillCooldowns } : {}),
    globalCooldownUntilMs: extractGlobalCooldownUntilMs(skillCooldowns, nowMs),
  };
}

export function logSkillCooldownApplied(args: {
  characterId: string;
  skillId: string;
  nowMs: number;
  cooldownUntilMs: number;
  battleVersion: number;
}): void {
  const remainingMs = Math.max(0, args.cooldownUntilMs - args.nowMs);
  console.log('[skill-cooldown-server]', {
    characterId: args.characterId,
    skillId: args.skillId,
    nowMs: args.nowMs,
    cooldownUntilMs: args.cooldownUntilMs,
    remainingMs,
    battleVersion: args.battleVersion,
  });
}
