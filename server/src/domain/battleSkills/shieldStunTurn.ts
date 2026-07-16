/**
 * Shield Stun (92) — Knight / Paladin: удар щитом, лише оглушення.
 */
import {
  SHIELD_STUN_BASE_STUN_CHANCE_PCT,
  SHIELD_STUN_L2_SKILL_ID,
  SHIELD_STUN_BATTLE_ID,
  shieldStunDurationMs,
  shieldStunMpAtRank,
  shieldStunSkillLineUk,
  spawnBlocksShieldStun,
} from '../../data/shieldStunTables.js';
import { isPvpBattleJson } from '../battlePvpContext.js';
import { jsonFiniteNum } from '../battle.js';
import {
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import type { BattleBattleMods } from '../battle.js';
import type { BattleSkillResolveContext, BattleSkillTurnResult } from './types.js';
import {
  catalogAllowsFighterAction,
  requireCatalogEntryForAction,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';

function shieldStunRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[SHIELD_STUN_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

export function resolveShieldStunTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  const prof = String(ctx.l2Profession || '').trim();
  if (!catalogAllowsFighterAction('shield_stun', prof, ctx.race, ctx.classBranch)) {
    throw new Error('battle_skill_not_allowed');
  }
  requireCatalogEntryForAction('shield_stun', prof);

  if (!ctx.hasEquippedShield) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = shieldStunRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const mp = shieldStunMpAtRank(rank);
  if (mp == null) throw new Error('battle_skill_not_allowed');

  const nowMs = Date.now();
  const existingStun = jsonFiniteNum(ctx.st.battleMods?.mobStunUntilMs);
  const alreadyStunned =
    existingStun !== undefined && existingStun > nowMs;

  const stunBlocked = spawnBlocksShieldStun(ctx.spawnKind);
  const isPvp = isPvpBattleJson(ctx.st);
  const durationMs = shieldStunDurationMs(isPvp);
  const durationSec = Math.round(durationMs / 1000);

  let appliedStun = false;
  let battleModsPatch: Partial<BattleBattleMods> | undefined;

  if (!stunBlocked && !alreadyStunned) {
    const effStunPct = scaleLandChancePercentAfterResist(
      SHIELD_STUN_BASE_STUN_CHANCE_PCT,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    appliedStun = Math.random() * 100 < effStunPct;
    if (appliedStun) {
      const until = nowMs + durationMs;
      battleModsPatch = {
        mobStunUntilMs: until,
        mobStunIconSkillId: SHIELD_STUN_L2_SKILL_ID,
      };
    }
  }

  return {
    mpCost: mp,
    pDmg: 0,
    skillLine: shieldStunSkillLineUk(
      appliedStun,
      alreadyStunned,
      stunBlocked,
      durationSec
    ),
    physOutcome: null,
    magicOutcome: null,
    ...(battleModsPatch ? { battleModsPatch } : {}),
    ...(appliedStun
      ? { skipMobCounterAttackOnce: true, mobRetaliationDelayHits: 2 }
      : {}),
  };
}
