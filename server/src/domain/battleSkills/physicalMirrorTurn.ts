/**
 * Physical Mirror (350) — Phoenix / Hell Knight.
 */
import {
  PHYSICAL_MIRROR_BATTLE_ID,
  PHYSICAL_MIRROR_DURATION_SEC,
  PHYSICAL_MIRROR_L2_SKILL_ID,
  physicalMirrorMpAtRank,
  physicalMirrorSkillLineUk,
} from '../../data/physicalMirrorTables.js';
import { physicalMirrorBattleModsPatch } from '../physicalMirrorReflect.js';
import type { BattleSkillResolveContext, BattleSkillTurnResult } from './types.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  isCooldownBlocked,
  requireCatalogEntryForAction,
  scaledSkillCooldownSec,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';
import { humanFighterCatalogEntry } from '../../data/humanFighterSkillCatalog.lookup.js';
import { cooldownSecForSkillId, skillCooldownReadyAtMs } from '../../data/skillCooldowns.js';

function physicalMirrorRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[PHYSICAL_MIRROR_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

function physicalMirrorCooldownPatch(
  ctx: BattleSkillResolveContext
): Record<string, number> | undefined {
  const entry = humanFighterCatalogEntry(PHYSICAL_MIRROR_BATTLE_ID);
  const rawCd = entry?.cooldownSec ?? cooldownSecForSkillId(PHYSICAL_MIRROR_L2_SKILL_ID);
  const cdSec = scaledSkillCooldownSec(ctx, rawCd, entry ?? undefined);
  if (cdSec <= 0) return undefined;
  return {
    ['l2_' + PHYSICAL_MIRROR_L2_SKILL_ID]: skillCooldownReadyAtMs(Date.now(), cdSec),
  };
}

export function resolvePhysicalMirrorTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  const prof = String(ctx.l2Profession || '').trim();
  if (!catalogAllowsFighterAction('physical_mirror', prof, ctx.race, ctx.classBranch)) {
    throw new Error('battle_skill_not_allowed');
  }
  requireCatalogEntryForAction('physical_mirror', prof);

  if (!ctx.hasEquippedShield) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = physicalMirrorRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const mp = physicalMirrorMpAtRank(rank);
  if (mp == null) throw new Error('battle_skill_not_allowed');

  const cd = ctx.st.mysticSkillCdUntil?.['l2_350'];
  if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
    assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
  }

  const cdPatch = physicalMirrorCooldownPatch(ctx);
  const until = Date.now() + PHYSICAL_MIRROR_DURATION_SEC * 1000;

  return {
    mpCost: mp,
    pDmg: 0,
    skillLine: physicalMirrorSkillLineUk(rank),
    physOutcome: null,
    magicOutcome: null,
    battleModsPatch: physicalMirrorBattleModsPatch(),
    ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    battleModsExpiresPatch: { [String(PHYSICAL_MIRROR_L2_SKILL_ID)]: until },
  };
}
