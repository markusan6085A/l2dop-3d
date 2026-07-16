/**
 * Shield Slam (353) — Phoenix / Hell Knight: дебаф щитом, блок фізичних скілів.
 */
import {
  SHIELD_SLAM_BASE_LAND_CHANCE_PCT,
  SHIELD_SLAM_L2_SKILL_ID,
  SHIELD_SLAM_BATTLE_ID,
  shieldSlamDurationMs,
  shieldSlamMpAtRank,
  shieldSlamSkillLineUk,
  spawnBlocksShieldSlam,
} from '../../data/shieldSlamTables.js';
import { isPvpBattleJson } from '../battlePvpContext.js';
import { jsonFiniteNum } from '../battle.js';
import {
  effectiveMobWitResistPct,
  scaleLandChancePercentAfterResist,
  witResistPctFromStat,
  applyTouchOfDeathResistPenalty,
} from '../controlLandResist.js';
import type { BattleBattleMods } from '../battle.js';
import type { BattleSkillResolveContext, BattleSkillTurnResult } from './types.js';
import {
  catalogAllowsFighterAction,
  requireCatalogEntryForAction,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';

function shieldSlamRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[SHIELD_SLAM_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

function targetWitResistPct(ctx: BattleSkillResolveContext, isPvp: boolean): number {
  const nowMs = Date.now();
  let base: number;
  if (isPvp) {
    const lv =
      typeof ctx.st.pvpTargetLevel === 'number' && ctx.st.pvpTargetLevel >= 1
        ? Math.floor(ctx.st.pvpTargetLevel)
        : ctx.spawnLevel;
    const estWit = 20 + Math.floor(lv * 0.55);
    base = witResistPctFromStat(estWit);
  } else {
    base = effectiveMobWitResistPct({
      level: ctx.spawnLevel,
      debuffResistPct: ctx.spawnDebuffResistPct,
    });
  }
  return applyTouchOfDeathResistPenalty(base, ctx.st.battleMods, nowMs);
}

export function resolveShieldSlamTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  const prof = String(ctx.l2Profession || '').trim();
  if (!catalogAllowsFighterAction('shield_slam', prof, ctx.race, ctx.classBranch)) {
    throw new Error('battle_skill_not_allowed');
  }
  requireCatalogEntryForAction('shield_slam', prof);

  if (!ctx.hasEquippedShield) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = shieldSlamRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const mp = shieldSlamMpAtRank(rank);
  if (mp == null) throw new Error('battle_skill_not_allowed');

  const nowMs = Date.now();
  const existingBlock = jsonFiniteNum(ctx.st.battleMods?.mobPhysSkillsBlockedUntilMs);
  const alreadyBlocked =
    existingBlock !== undefined && existingBlock > nowMs;

  const slamBlocked = spawnBlocksShieldSlam(ctx.spawnKind);
  const isPvp = isPvpBattleJson(ctx.st);
  const durationMs = shieldSlamDurationMs();
  const durationSec = Math.round(durationMs / 1000);

  let applied = false;
  let battleModsPatch: Partial<BattleBattleMods> | undefined;
  let battleModsExpiresPatch: Record<string, number> | undefined;

  if (!slamBlocked && !alreadyBlocked) {
    const effPct = scaleLandChancePercentAfterResist(
      SHIELD_SLAM_BASE_LAND_CHANCE_PCT,
      targetWitResistPct(ctx, isPvp)
    );
    applied = Math.random() * 100 < effPct;
    if (applied) {
      const until = nowMs + durationMs;
      battleModsPatch = {
        mobPhysSkillsBlockedUntilMs: until,
        mobPhysSkillsBlockedIconSkillId: SHIELD_SLAM_L2_SKILL_ID,
      };
      battleModsExpiresPatch = { [String(SHIELD_SLAM_L2_SKILL_ID)]: until };
    }
  }

  return {
    mpCost: mp,
    pDmg: 0,
    skillLine: shieldSlamSkillLineUk(
      applied,
      alreadyBlocked,
      slamBlocked,
      durationSec
    ),
    physOutcome: null,
    magicOutcome: null,
    ...(battleModsPatch ? { battleModsPatch } : {}),
    ...(battleModsExpiresPatch ? { battleModsExpiresPatch } : {}),
    ...(applied
      ? { skipMobCounterAttackOnce: true, mobRetaliationDelayHits: 3 }
      : {}),
  };
}
