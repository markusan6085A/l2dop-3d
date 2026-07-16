import type { BattleJsonState } from '../domain/battle.js';
import {
  battleLogSeqFromState,
  battleLogTailAfterSeq,
  battleSyncHasChanges,
  battleVersionFromState,
} from '../domain/battleVersion.js';
import { parseSkillCooldowns } from '../data/skillCooldowns.js';
import { battleMobDebuffIconsForUi } from './battleServiceBattleBuffs.js';
import type { CharacterRow } from './charService.js';
import type {
  BattleDeltaPayload,
  BattleOutcomeKind,
  BattleSyncResponse,
} from './battleServiceDeltaTypes.js';

function battleVitalsPayload(args: {
  row: CharacterRow;
  st: BattleJsonState;
  maxHpEff: number;
  maxMpEff: number;
  playerMp: number;
}): Pick<
  BattleDeltaPayload,
  | 'characterHp'
  | 'characterMp'
  | 'characterMaxHp'
  | 'characterMaxMp'
  | 'mobHp'
  | 'mobMaxHp'
  | 'mobDead'
  | 'characterDead'
> {
  const { row, st, maxHpEff, maxMpEff, playerMp } = args;
  return {
    characterHp: Math.max(0, Math.min(maxHpEff, row.hp)),
    characterMp: Math.max(0, Math.min(maxMpEff, playerMp)),
    characterMaxHp: maxHpEff,
    characterMaxMp: maxMpEff,
    mobHp: Math.max(0, st.mobHp),
    mobMaxHp: st.mobMaxHp,
    mobDead: st.mobHp <= 0,
    characterDead: row.hp <= 0,
  };
}

/** Легкий poll: changed лише за battleVersion/logSeq; logTail порожній коли changed=false. */
export function buildBattleSyncResponse(args: {
  row: CharacterRow;
  st: BattleJsonState;
  maxHpEff: number;
  maxMpEff: number;
  playerMp: number;
  clientBattleVersion?: number;
  clientLastLogSeq?: number;
  mysticSkillCdUntil?: Record<string, number>;
}): BattleSyncResponse {
  const revision = args.row.revision;
  const battleVersion = battleVersionFromState(args.st);
  const logSeq = battleLogSeqFromState(args.st);
  const clientLogSeq = Math.max(0, Math.floor(args.clientLastLogSeq ?? 0));
  const changed = battleSyncHasChanges({
    clientBattleVersion: args.clientBattleVersion,
    clientLastLogSeq: clientLogSeq,
    serverBattleVersion: battleVersion,
    serverLogSeq: logSeq,
  });

  if (!changed) {
    return {
      changed: false,
      revision,
      battleVersion,
      logSeq,
      logTail: [],
      inBattle: true,
      outcome: null,
      battleEnded: false,
      mysticSkillCdUntil: args.mysticSkillCdUntil,
    };
  }

  const logTail = battleLogTailAfterSeq(args.st, clientLogSeq).tail;
  const mysticSkillCdUntil =
    args.mysticSkillCdUntil ??
    (args.st.mysticSkillCdUntil &&
    Object.keys(args.st.mysticSkillCdUntil).length > 0
      ? { ...args.st.mysticSkillCdUntil }
      : undefined);
  const mobDebuffIcons = battleMobDebuffIconsForUi(args.st);
  const battleMods =
    args.st.battleMods && Object.keys(args.st.battleMods).length > 0
      ? { ...args.st.battleMods }
      : undefined;

  return {
    changed: true,
    revision,
    battleVersion,
    logSeq,
    logTail,
    inBattle: true,
    outcome: null,
    battleEnded: false,
    mysticSkillCdUntil,
    mobDebuffIcons,
    ...(battleMods ? { battleMods } : {}),
    ...battleVitalsPayload({
      row: args.row,
      st: args.st,
      maxHpEff: args.maxHpEff,
      maxMpEff: args.maxMpEff,
      playerMp: args.playerMp,
    }),
  };
}

/** Delta після POST /battle/action (continue). */
export function buildBattleDeltaPayload(args: {
  row: CharacterRow;
  st: BattleJsonState | null;
  maxHpEff: number;
  maxMpEff: number;
  playerMp: number;
  logLinesAdded?: number;
  logTailOverride?: string[];
  outcome?: BattleOutcomeKind;
  battleEnded?: boolean;
  hotbarStale?: boolean;
}): BattleDeltaPayload {
  const revision = args.row.revision;
  const st = args.st;

  if (!st) {
    return {
      changed: true,
      revision,
      battleVersion: 0,
      characterHp: Math.max(0, args.row.hp),
      characterMp: args.playerMp,
      characterMaxHp: args.maxHpEff,
      characterMaxMp: args.maxMpEff,
      outcome: args.outcome ?? null,
      battleEnded: args.battleEnded ?? true,
      logTail: [],
      logSeq: 0,
    };
  }

  const battleVersion = battleVersionFromState(st);
  const logSeq = battleLogSeqFromState(st);
  let logTail: string[] = [];

  if (args.logTailOverride) {
    logTail = args.logTailOverride;
  } else if (typeof args.logLinesAdded === 'number' && args.logLinesAdded > 0) {
    logTail = battleLogTailAfterSeq(
      st,
      Math.max(0, logSeq - args.logLinesAdded)
    ).tail;
  }

  const mysticSkillCdUntil = battleCooldownsForSync(
    args.row,
    st,
    Date.now()
  );

  const battleMods =
    st.battleMods && Object.keys(st.battleMods).length > 0
      ? { ...st.battleMods }
      : null;
  const mobDebuffIcons = battleMobDebuffIconsForUi(st);

  return {
    changed: true,
    revision,
    battleVersion,
    logSeq,
    ...(logTail.length > 0 ? { logTail } : { logTail: [] }),
    outcome: args.outcome ?? null,
    battleEnded: args.battleEnded ?? false,
    mysticSkillCdUntil,
    battleMods,
    mobDebuffIcons,
    ...(args.hotbarStale ? { hotbarStale: true } : {}),
    ...battleVitalsPayload({
      row: args.row,
      st,
      maxHpEff: args.maxHpEff,
      maxMpEff: args.maxMpEff,
      playerMp: args.playerMp,
    }),
  };
}

/** Кулдауни для sync: mystic CD + skillCooldownsJson (read-only parse). */
export function battleCooldownsForSync(
  row: CharacterRow,
  st: BattleJsonState,
  nowMs: number
): Record<string, number> | undefined {
  const merged: Record<string, number> = {};
  const mystic = st.mysticSkillCdUntil;
  if (mystic) {
    for (const [key, readyAt] of Object.entries(mystic)) {
      if (typeof readyAt === 'number' && Number.isFinite(readyAt) && readyAt > nowMs) {
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
