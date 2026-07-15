import type { BattleBattleMods } from '../domain/battle.js';
import type { BattleDefeatSummary, BattleVictorySummary } from './battleServiceTypes.js';

export type BattleOutcomeKind = 'DEFEAT' | 'VICTORY' | null;

/** Легкий payload для poll і POST continue. */
export interface BattleDeltaPayload {
  changed: boolean;
  revision: number;
  battleVersion: number;
  characterHp?: number;
  characterMp?: number;
  characterMaxHp?: number;
  characterMaxMp?: number;
  mobHp?: number;
  mobMaxHp?: number;
  mobDead?: boolean;
  characterDead?: boolean;
  battleEnded?: boolean;
  outcome?: BattleOutcomeKind;
  mysticSkillCdUntil?: Record<string, number>;
  logTail?: string[];
  logSeq?: number;
  /** true — клієнт має оновити хотбар (інвентар/бафи/КД поза mysticSkillCdUntil). */
  hotbarStale?: boolean;
  /** Поточні battleMods (null — немає активних модів у бою). */
  battleMods?: BattleBattleMods | null;
}

export interface BattleSyncResponse extends BattleDeltaPayload {
  inBattle: boolean;
}

export interface BattleActionDeltaResponse {
  kind: 'delta';
  revision: number;
  characterId: string;
  delta: BattleDeltaPayload;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
}

export interface BattleActionFullResponse {
  kind: 'full';
  character: import('./charService.js').CharacterSnapshot;
  battle: import('./battleServiceTypes.js').BattleView | null;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
}

export type BattleActionResponse =
  | BattleActionDeltaResponse
  | BattleActionFullResponse;
