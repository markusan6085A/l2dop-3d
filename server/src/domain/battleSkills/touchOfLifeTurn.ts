/**
 * Touch of Life (341) — Phoenix Knight / Eva's Templar.
 */
import {
  TOUCH_OF_LIFE_BATTLE_ID,
  TOUCH_OF_LIFE_DURATION_SEC,
  TOUCH_OF_LIFE_L2_SKILL_ID,
  touchOfLifeHpCostAtRank,
  touchOfLifeInstantHealAmount,
  touchOfLifeSkillLineUk,
} from '../../data/touchOfLifeTables.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import { humanFighterCatalogEntry } from '../../data/humanFighterSkillCatalog.lookup.js';
import { raceFighterCatalogEntryVisibleForProfession } from '../../data/raceFighterSkillCatalog.professionRules.js';
import type { BattleSkillResolveContext, BattleSkillTurnResult } from './types.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  isCooldownBlocked,
  scaledSkillCooldownSec,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';

function touchOfLifeRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[TOUCH_OF_LIFE_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

function touchOfLifeAllowed(ctx: BattleSkillResolveContext): boolean {
  const prof = String(ctx.l2Profession || '').trim();
  if (
    catalogAllowsFighterAction('touch_of_life', prof, ctx.race, ctx.classBranch)
  ) {
    return true;
  }
  const rf = fighterCatalogEntryForRace(
    ctx.race,
    ctx.classBranch,
    TOUCH_OF_LIFE_BATTLE_ID
  );
  if (!rf) return false;
  return raceFighterCatalogEntryVisibleForProfession(rf, prof);
}

function touchOfLifeCooldownPatch(
  ctx: BattleSkillResolveContext
): Record<string, number> | undefined {
  const humanEnt = humanFighterCatalogEntry(TOUCH_OF_LIFE_BATTLE_ID);
  const raceEnt = fighterCatalogEntryForRace(
    ctx.race,
    ctx.classBranch,
    TOUCH_OF_LIFE_BATTLE_ID
  );
  const rawCd =
    humanEnt?.cooldownSec ??
    raceEnt?.cooldownSec ??
    cooldownSecForSkillId(TOUCH_OF_LIFE_L2_SKILL_ID);
  const cdSec = scaledSkillCooldownSec(
    ctx,
    rawCd,
    humanEnt ?? raceEnt ?? undefined
  );
  if (cdSec <= 0) return undefined;
  return {
    ['l2_' + TOUCH_OF_LIFE_L2_SKILL_ID]: Date.now() + Math.floor(cdSec * 1000),
  };
}

export function resolveTouchOfLifeTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  if (!touchOfLifeAllowed(ctx)) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = touchOfLifeRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const hpCost = touchOfLifeHpCostAtRank(rank);
  if (ctx.playerHpInBattle <= hpCost) {
    throw new Error('battle_skill_not_allowed');
  }

  const cd = ctx.st.mysticSkillCdUntil?.['l2_341'];
  if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
    assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
  }

  const cdPatch = touchOfLifeCooldownPatch(ctx);
  const until = Date.now() + TOUCH_OF_LIFE_DURATION_SEC * 1000;
  const heal = touchOfLifeInstantHealAmount(ctx.playerMaxHpInBattle);

  return {
    mpCost: 0,
    pDmg: 0,
    skillLine: touchOfLifeSkillLineUk(rank),
    physOutcome: null,
    magicOutcome: null,
    playerHeal: heal,
    playerHealSourceUk: 'Дотик життя',
    playerHpCost: hpCost,
    playerHpCostSourceUk: 'Дотик життя',
    playerHpCostBeforeHeal: true,
    startTouchOfLifeHoT: true,
    activeBuffPatch: {
      skillId: TOUCH_OF_LIFE_L2_SKILL_ID,
      level: rank,
      action: 'add',
    },
    ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    battleModsExpiresPatch: { [String(TOUCH_OF_LIFE_L2_SKILL_ID)]: until },
  };
}
