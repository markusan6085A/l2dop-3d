/**
 * Touch of Death (342) — Hell Knight: дебаф по цілі без урону.
 */
import {
  TOUCH_OF_DEATH_BASE_LAND_CHANCE_PCT,
  TOUCH_OF_DEATH_BATTLE_ID,
  TOUCH_OF_DEATH_CANCEL_BUFFS_CHANCE_PCT,
  TOUCH_OF_DEATH_CP_DRAIN_PCT,
  TOUCH_OF_DEATH_DEBUFF_RESIST_PENALTY_PCT,
  TOUCH_OF_DEATH_HEAL_RECEIVED_PENALTY_PCT,
  TOUCH_OF_DEATH_L2_SKILL_ID,
  TOUCH_OF_DEATH_MAX_CP_REDUCE_PCT,
  TOUCH_OF_DEATH_MAX_SELF_HP_RATIO,
  touchOfDeathDurationMs,
  touchOfDeathHpCostAtRank,
  touchOfDeathSkillLineUk,
  spawnBlocksTouchOfDeath,
} from '../../data/touchOfDeathTables.js';
import { humanFighterCatalogEntry } from '../../data/humanFighterSkillCatalog.lookup.js';
import { isPvpBattleJson } from '../battlePvpContext.js';
import {
  effectiveMobConResistPct,
  scaleLandChancePercentAfterResist,
  conResistPctFromStat,
} from '../controlLandResist.js';
import { mobMaxCpFromMobMaxHp } from '../../data/wrathSkillConstants.js';
import type { BattleBattleMods } from '../battle.js';
import type { BattleSkillResolveContext, BattleSkillTurnResult } from './types.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  isCooldownBlocked,
  requireCatalogEntryForAction,
  scaledSkillCooldownSec,
  skillRankForCurrentAction,
} from './humanFighterTurnHelpers.js';
import { cooldownSecForSkillId, skillCooldownReadyAtMs } from '../../data/skillCooldowns.js';

function touchOfDeathRank(ctx: BattleSkillResolveContext): number {
  const fromMap = ctx.learnedSkillLevelByBattleId?.[TOUCH_OF_DEATH_BATTLE_ID];
  if (typeof fromMap === 'number' && fromMap >= 1) return Math.floor(fromMap);
  return skillRankForCurrentAction(ctx);
}

function meleeWeaponOk(weaponKind: string | undefined): boolean {
  const wk = String(weaponKind ?? '').trim().toLowerCase();
  if (!wk) return false;
  return wk !== 'bow';
}

function targetConResistPct(ctx: BattleSkillResolveContext, isPvp: boolean): number {
  if (isPvp) {
    const lv =
      typeof ctx.st.pvpTargetLevel === 'number' && ctx.st.pvpTargetLevel >= 1
        ? Math.floor(ctx.st.pvpTargetLevel)
        : ctx.spawnLevel;
    const estCon = 20 + Math.floor(lv * 0.55);
    return conResistPctFromStat(estCon);
  }
  return effectiveMobConResistPct({
    level: ctx.spawnLevel,
    debuffResistPct: ctx.spawnDebuffResistPct,
  });
}

function touchOfDeathCooldownPatch(
  ctx: BattleSkillResolveContext
): Record<string, number> | undefined {
  const entry = humanFighterCatalogEntry(TOUCH_OF_DEATH_BATTLE_ID);
  const rawCd =
    entry?.cooldownSec ?? cooldownSecForSkillId(TOUCH_OF_DEATH_L2_SKILL_ID);
  const cdSec = scaledSkillCooldownSec(ctx, rawCd, entry ?? undefined);
  if (cdSec <= 0) return undefined;
  return {
    ['l2_' + TOUCH_OF_DEATH_L2_SKILL_ID]: skillCooldownReadyAtMs(Date.now(), cdSec),
  };
}

export function resolveTouchOfDeathTurn(
  ctx: BattleSkillResolveContext
): BattleSkillTurnResult {
  const prof = String(ctx.l2Profession || '').trim();
  if (!catalogAllowsFighterAction('touch_of_death', prof, ctx.race, ctx.classBranch)) {
    throw new Error('battle_skill_not_allowed');
  }
  requireCatalogEntryForAction('touch_of_death', prof);

  if (!meleeWeaponOk(ctx.weaponKind)) {
    throw new Error('battle_skill_not_allowed');
  }

  const rank = touchOfDeathRank(ctx);
  if (rank < 1) throw new Error('battle_skill_not_allowed');

  const maxHp = Math.max(1, ctx.playerMaxHpInBattle);
  const hpRatio = ctx.playerHpInBattle / maxHp;
  if (hpRatio > TOUCH_OF_DEATH_MAX_SELF_HP_RATIO + 1e-9) {
    throw new Error('battle_skill_not_allowed');
  }

  const hpCost = touchOfDeathHpCostAtRank(rank);
  if (ctx.playerHpInBattle <= hpCost) {
    throw new Error('battle_skill_not_allowed');
  }

  const cd = ctx.st.mysticSkillCdUntil?.['l2_342'];
  if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
    assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
  }

  const blocked = spawnBlocksTouchOfDeath(ctx.spawnKind);
  const isPvp = isPvpBattleJson(ctx.st);
  const durationMs = touchOfDeathDurationMs();
  const durationSec = Math.round(durationMs / 1000);
  const nowMs = Date.now();

  let applied = false;
  let cancelBuffsProc = false;
  let battleModsPatch: Partial<BattleBattleMods> | undefined;
  let battleModsExpiresPatch: Record<string, number> | undefined;
  let mobCpDrain: number | undefined;
  let mobMaxCpSet: number | undefined;
  let touchOfDeathStripAllTargetBuffs: boolean | undefined;

  if (!blocked) {
    const effPct = scaleLandChancePercentAfterResist(
      TOUCH_OF_DEATH_BASE_LAND_CHANCE_PCT,
      targetConResistPct(ctx, isPvp)
    );
    applied = Math.random() * 100 < effPct;
    if (applied) {
      const until = nowMs + durationMs;
      const mobMaxCp =
        ctx.st.mobMaxCp ?? mobMaxCpFromMobMaxHp(ctx.st.mobMaxHp);
      const mobCpBefore =
        ctx.st.mobCp !== undefined ? ctx.st.mobCp : mobMaxCp;
      mobCpDrain = Math.min(
        Math.max(0, mobCpBefore),
        Math.floor(mobCpBefore * (TOUCH_OF_DEATH_CP_DRAIN_PCT / 100))
      );
      mobMaxCpSet = Math.max(
        0,
        Math.floor(mobMaxCp * (1 - TOUCH_OF_DEATH_MAX_CP_REDUCE_PCT / 100))
      );
      cancelBuffsProc = Math.random() * 100 < TOUCH_OF_DEATH_CANCEL_BUFFS_CHANCE_PCT;
      if (cancelBuffsProc) {
        touchOfDeathStripAllTargetBuffs = true;
      }
      battleModsPatch = {
        touchOfDeathMobMaxCpBaseline: mobMaxCp,
        mobTouchOfDeathDebuffResistPenaltyPct:
          TOUCH_OF_DEATH_DEBUFF_RESIST_PENALTY_PCT,
        mobTouchOfDeathHealReceivedPenaltyPct:
          TOUCH_OF_DEATH_HEAL_RECEIVED_PENALTY_PCT,
        mobTouchOfDeathUntilMs: until,
        mobTouchOfDeathIconSkillId: TOUCH_OF_DEATH_L2_SKILL_ID,
      };
      battleModsExpiresPatch = {
        [String(TOUCH_OF_DEATH_L2_SKILL_ID)]: until,
      };
    }
  }

  const cdPatch = touchOfDeathCooldownPatch(ctx);

  return {
    mpCost: 0,
    pDmg: 0,
    skillLine: touchOfDeathSkillLineUk(
      applied,
      blocked,
      cancelBuffsProc,
      durationSec
    ),
    physOutcome: null,
    magicOutcome: null,
    playerHpCost: hpCost,
    playerHpCostSourceUk: 'Дотик смерті',
    ...(applied && mobCpDrain !== undefined && mobCpDrain > 0
      ? { mobCpDrain }
      : {}),
    ...(applied && mobMaxCpSet !== undefined ? { mobMaxCpSet } : {}),
    ...(touchOfDeathStripAllTargetBuffs
      ? { touchOfDeathStripAllTargetBuffs: true }
      : {}),
    ...(battleModsPatch ? { battleModsPatch } : {}),
    ...(battleModsExpiresPatch ? { battleModsExpiresPatch } : {}),
    ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    ...(applied ? { skipMobCounterAttackOnce: true } : {}),
  };
}

/** PvE/PvP (вид атакуючого): відновити max CP цілі після expire Touch of Death. */
export function restoreTouchOfDeathMobCp(st: import('../battleTypes.js').BattleJsonState): void {
  const baselineRaw = st.battleMods?.touchOfDeathMobMaxCpBaseline;
  const baseline =
    typeof baselineRaw === 'number' && Number.isFinite(baselineRaw) && baselineRaw > 0
      ? Math.floor(baselineRaw)
      : undefined;
  if (baseline === undefined) return;
  st.mobMaxCp = baseline;
  const cur =
    typeof st.mobCp === 'number' && Number.isFinite(st.mobCp)
      ? Math.max(0, Math.floor(st.mobCp))
      : baseline;
  st.mobCp = Math.min(cur, baseline);
}

/** PvP (вид жертви): відновити max CP після expire Touch of Death. */
export function restoreTouchOfDeathPlayerCp(
  st: import('../battleTypes.js').BattleJsonState
): void {
  const baselineRaw = st.battleMods?.touchOfDeathPlayerMaxCpBaseline;
  const baseline =
    typeof baselineRaw === 'number' && Number.isFinite(baselineRaw) && baselineRaw > 0
      ? Math.floor(baselineRaw)
      : undefined;
  if (baseline === undefined) return;
  st.playerMaxCp = baseline;
  const cur =
    typeof st.playerCp === 'number' && Number.isFinite(st.playerCp)
      ? Math.max(0, Math.floor(st.playerCp))
      : baseline;
  st.playerCp = Math.min(cur, baseline);
}
