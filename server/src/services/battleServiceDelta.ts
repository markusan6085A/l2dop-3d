import type { BattleJsonState } from '../domain/battle.js';
import {
  battleLogSeqFromState,
  battleLogTailAfterSeq,
  battleSyncHasChanges,
  battleVersionFromState,
} from '../domain/battleVersion.js';
import { resolveHpWithClanHallPassive } from '../domain/characterClanHallVitals.js';
import type { ClanHallBuffRow } from '../domain/clanHall.js';
import { battleMobDebuffIconsForUi } from './battleServiceBattleBuffs.js';
import { buildBattleCooldownFields } from './battleServiceCooldown.js';
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
  maxHpNoClan?: number;
  clanHallBonus?: ClanHallBuffRow | null;
  characterHp?: number;
  maxMpEff: number;
  playerMp: number;
}): Pick<
  BattleDeltaPayload,
  | 'characterHp'
  | 'characterMp'
  | 'characterMaxHp'
  | 'characterMaxMp'
  | 'characterCp'
  | 'characterMaxCp'
  | 'mobHp'
  | 'mobMaxHp'
  | 'mobDead'
  | 'characterDead'
> {
  const { row, st, maxHpEff, maxMpEff, playerMp } = args;
  const characterHp =
    args.characterHp ??
    resolveHpWithClanHallPassive({
      storedHp: row.hp,
      maxHpWithoutClanHall: args.maxHpNoClan ?? maxHpEff,
      maxHpWithClanHall: maxHpEff,
      clanHallBonus: args.clanHallBonus ?? null,
    });
  return {
    characterHp: Math.max(0, Math.min(maxHpEff, characterHp)),
    characterMp: Math.max(0, Math.min(maxMpEff, playerMp)),
    characterMaxHp: maxHpEff,
    characterMaxMp: maxMpEff,
    mobHp: Math.max(0, st.mobHp),
    mobMaxHp: st.mobMaxHp,
    mobDead: st.mobHp <= 0,
    characterDead: characterHp <= 0,
    ...(typeof st.playerCp === 'number' && Number.isFinite(st.playerCp)
      ? {
          characterCp: Math.max(0, Math.floor(st.playerCp)),
          characterMaxCp:
            typeof st.playerMaxCp === 'number' && Number.isFinite(st.playerMaxCp)
              ? Math.max(0, Math.floor(st.playerMaxCp))
              : undefined,
        }
      : {}),
  };
}

/** Легкий poll: changed лише за battleVersion/logSeq; logTail порожній коли changed=false. */
export function buildBattleSyncResponse(args: {
  row: CharacterRow;
  st: BattleJsonState;
  maxHpEff: number;
  maxHpNoClan?: number;
  clanHallBonus?: ClanHallBuffRow | null;
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
    const cdFields = buildBattleCooldownFields(args.row, args.st, Date.now());
    return {
      changed: false,
      revision,
      battleVersion,
      logSeq,
      logTail: [],
      inBattle: true,
      outcome: null,
      battleEnded: false,
      ...cdFields,
      ...battleVitalsPayload({
        row: args.row,
        st: args.st,
        maxHpEff: args.maxHpEff,
        maxHpNoClan: args.maxHpNoClan,
        clanHallBonus: args.clanHallBonus,
        maxMpEff: args.maxMpEff,
        playerMp: args.playerMp,
      }),
    };
  }

  const logTail = battleLogTailAfterSeq(args.st, clientLogSeq).tail;
  const cdFields = buildBattleCooldownFields(args.row, args.st, Date.now());
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
    ...cdFields,
    mobDebuffIcons,
    ...(battleMods ? { battleMods } : {}),
    ...battleVitalsPayload({
      row: args.row,
      st: args.st,
      maxHpEff: args.maxHpEff,
      maxHpNoClan: args.maxHpNoClan,
      clanHallBonus: args.clanHallBonus,
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
  maxHpNoClan?: number;
  clanHallBonus?: ClanHallBuffRow | null;
  characterHp?: number;
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

  const cdFields = buildBattleCooldownFields(args.row, st, Date.now());

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
    ...cdFields,
    battleMods,
    mobDebuffIcons,
    ...(args.hotbarStale ? { hotbarStale: true } : {}),
    ...battleVitalsPayload({
      row: args.row,
      st,
      maxHpEff: args.maxHpEff,
      maxHpNoClan: args.maxHpNoClan,
      clanHallBonus: args.clanHallBonus,
      characterHp: args.characterHp,
      maxMpEff: args.maxMpEff,
      playerMp: args.playerMp,
    }),
  };
}

export { battleCooldownsForSync } from './battleServiceCooldown.js';
