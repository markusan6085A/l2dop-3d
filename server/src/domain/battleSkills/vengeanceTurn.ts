/**
 * Vengeance (368) — Templar mass-taunt + max defense (shield required).
 */
import {
  VENGEANCE_BATTLE_ID,
  VENGEANCE_DURATION_SEC,
  VENGEANCE_L2_SKILL_ID,
  vengeanceMpAtRank,
  vengeanceSkillLineUk,
} from '../../data/vengeanceTables.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { humanFighterCatalogEntry } from '../../data/humanFighterSkillCatalog.lookup.js';
import { raceFighterCatalogEntryVisibleForProfession } from '../../data/raceFighterSkillCatalog.professionRules.js';
import type { BattleSkillTurnResult } from './types.js';
import type { BattleSkillResolveContext } from './types.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  isCooldownBlocked,
  scaledSkillCooldownSec,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';
import { cooldownSecForSkillId, skillCooldownReadyAtMs } from '../../data/skillCooldowns.js';

function vengeanceRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[VENGEANCE_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

function vengeanceAllowed(ctx: BattleSkillResolveContext): boolean {
  const prof = String(ctx.l2Profession || '').trim();
  if (
    catalogAllowsFighterAction('vengeance', prof, ctx.race, ctx.classBranch)
  ) {
    return true;
  }
  const rf = fighterCatalogEntryForRace(
    ctx.race,
    ctx.classBranch,
    VENGEANCE_BATTLE_ID
  );
  if (!rf) return false;
  return raceFighterCatalogEntryVisibleForProfession(rf, prof);
}

function vengeanceCooldownPatch(
  ctx: BattleSkillResolveContext
): Record<string, number> | undefined {
  const humanEnt = humanFighterCatalogEntry(VENGEANCE_BATTLE_ID);
  const raceEnt = fighterCatalogEntryForRace(
    ctx.race,
    ctx.classBranch,
    VENGEANCE_BATTLE_ID
  );
  const rawCd =
    humanEnt?.cooldownSec ??
    raceEnt?.cooldownSec ??
    cooldownSecForSkillId(VENGEANCE_L2_SKILL_ID);
  const cdSec = scaledSkillCooldownSec(
    ctx,
    rawCd,
    humanEnt ?? raceEnt ?? undefined
  );
  if (cdSec <= 0) return undefined;
  return {
    ['l2_' + VENGEANCE_L2_SKILL_ID]: skillCooldownReadyAtMs(Date.now(), cdSec),
  };
}

export function resolveVengeanceTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  if (!vengeanceAllowed(ctx)) {
    throw new Error('battle_skill_not_allowed');
  }
  if (!ctx.hasEquippedShield) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = vengeanceRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const mp = vengeanceMpAtRank(rank);
  if (mp == null) throw new Error('battle_skill_not_allowed');

  const cd = ctx.st.mysticSkillCdUntil?.['l2_368'];
  if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
    assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
  }

  const cdPatch = vengeanceCooldownPatch(ctx);
  const until = Date.now() + VENGEANCE_DURATION_SEC * 1000;

  return {
    mpCost: mp,
    pDmg: 0,
    skillLine: vengeanceSkillLineUk(rank),
    physOutcome: null,
    magicOutcome: null,
    activeBuffPatch: {
      skillId: VENGEANCE_L2_SKILL_ID,
      level: rank,
      action: 'add',
    },
    battleModsPatch: { vengeanceImmobile: true },
    ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    battleModsExpiresPatch: { [String(VENGEANCE_L2_SKILL_ID)]: until },
    worldBossTaunt: true,
  };
}
