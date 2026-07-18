export type BattleSkillNotAllowedReason =
  | 'cooldown'
  | 'not_enough_mp'
  | 'not_in_battle'
  | 'target_dead'
  | 'target_too_far'
  | 'skill_not_learned'
  | 'wrong_weapon'
  | 'invalid_state';

export class BattleSkillNotAllowedError extends Error {
  readonly code = 'battle_skill_not_allowed';
  readonly reason: BattleSkillNotAllowedReason;
  readonly skillId?: string;
  readonly remainingCooldownMs?: number;
  readonly serverNowMs?: number;
  readonly cooldownReadyAtMs?: number;

  constructor(args: {
    reason: BattleSkillNotAllowedReason;
    skillId?: string;
    remainingCooldownMs?: number;
    serverNowMs?: number;
    cooldownReadyAtMs?: number;
  }) {
    super('battle_skill_not_allowed');
    this.name = 'BattleSkillNotAllowedError';
    this.reason = args.reason;
    this.skillId = args.skillId;
    this.remainingCooldownMs = args.remainingCooldownMs;
    this.serverNowMs = args.serverNowMs;
    this.cooldownReadyAtMs = args.cooldownReadyAtMs;
  }
}

