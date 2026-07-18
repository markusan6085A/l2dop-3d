import type { BattleBattleMods } from '../domain/battle.js';
import type { BattleDefeatSummary, BattleVictorySummary } from './battleServiceTypes.js';

export type BattleOutcomeKind = 'DEFEAT' | 'VICTORY' | null;

/** Легкий payload для poll і POST continue. */
export interface BattleDeltaPayload {
  changed: boolean;
  revision: number;
  battleVersion: number;
  /** Epoch ms сервера — для клієнтського serverTimeOffsetMs. */
  serverNowMs?: number;
  characterHp?: number;
  characterMp?: number;
  characterMaxHp?: number;
  characterMaxMp?: number;
  characterCp?: number;
  characterMaxCp?: number;
  mobHp?: number;
  mobMaxHp?: number;
  mobDead?: boolean;
  characterDead?: boolean;
  battleEnded?: boolean;
  outcome?: BattleOutcomeKind;
  /** Активні skillId → cooldownUntilMs (Unix ms). */
  skillCooldowns?: Record<string, number>;
  /** @deprecated Alias — те саме, що skillCooldowns. */
  mysticSkillCdUntil?: Record<string, number>;
  /** attack/bolt GCD until (Unix ms). */
  globalCooldownUntilMs?: number;
  logTail?: string[];
  logSeq?: number;
  /** true — клієнт має оновити хотбар (інвентар/бафи поза cooldown delta). */
  hotbarStale?: boolean;
  /** Поточні battleMods (null — немає активних модів у бою). */
  battleMods?: BattleBattleMods | null;
  /** Іконки дебафів на цілі (стун, −P.Def тощо) — під HP-баром моба / PvP-цілі. */
  mobDebuffIcons?: import('./battleServiceTypes.js').BattleBuffIcon[];
}

export interface BattleSyncResponse extends BattleDeltaPayload {
  inBattle: boolean;
  partyBattle?: import('./party/partyBattleSyncService.js').PartyBattleSyncDto;
}

export interface BattleActionDeltaResponse {
  kind: 'delta';
  revision: number;
  characterId: string;
  serverNowMs?: number;
  delta: BattleDeltaPayload;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
}

/** Stage C: killer-only DTO для party reward split (Stage D UI). */
export interface PartyBattleRewardSummary {
  partyBattleId: string;
  recipientCount: number;
  expGain: string;
  spGain: number;
  adenaGain: string;
  shared: true;
}

export interface BattleActionFullResponse {
  kind: 'full';
  character: import('./charService.js').CharacterSnapshot;
  battle: import('./battleServiceTypes.js').BattleView | null;
  victory?: BattleVictorySummary;
  defeat?: BattleDefeatSummary;
  /** Party battle Stage C — killer share metadata. */
  partyReward?: PartyBattleRewardSummary;
  /** Lethal / RB kill: однозначні поля для клієнта (очистити HP-бар). */
  lethalMeta?: Pick<
    BattleDeltaPayload,
    | 'battleEnded'
    | 'mobDead'
    | 'mobHp'
    | 'mobMaxHp'
    | 'outcome'
    | 'battleVersion'
  >;
}

export type BattleActionResponse =
  | BattleActionDeltaResponse
  | BattleActionFullResponse;
