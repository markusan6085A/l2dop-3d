/**
 * Реалізація 27 «gap» скілів HF (див. audit:hf-battle-catalog-gap).
 */
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  backstabDamageAtk,
  backstabMpPowerAtRank,
  backstabSkillLineUk,
  isDaggerWeaponKind,
  isMobBackExposedForBackstab,
} from '../../data/backstabTables.js';
import {
  deadlyBlowDamageAtk,
  deadlyBlowMpPowerAtRank,
  deadlyBlowSkillLineUk,
  DEADLY_BLOW_CRIT_RATE_BONUS,
} from '../../data/deadlyBlowTables.js';
import {
  bluffMpAtRank,
  bluffSkillLineUk,
  bluffStunDurationMs,
  BLUFF_BASE_STUN_CHANCE_PCT,
  BLUFF_L2_SKILL_ID,
  BLUFF_STUN_DURATION_SEC,
  rollBluffLoseTarget,
} from '../../data/bluffTables.js';
import {
  focusChanceMpAtRank,
  focusChanceSkillLineUk,
  FOCUS_CHANCE_DURATION_SEC,
  FOCUS_CHANCE_L2_SKILL_ID,
} from '../../data/focusChanceTables.js';
import {
  focusPowerMpAtRank,
  focusPowerSkillLineUk,
  FOCUS_POWER_DURATION_SEC,
  FOCUS_POWER_L2_SKILL_ID,
} from '../../data/focusPowerTables.js';
import { spawnBlocksHammerCrushStun } from '../../data/hammerCrushTables.js';
import {
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import type { BattleBattleMods } from '../battleTypes.js';
import {
  lethalBlowDamageAtk,
  lethalBlowMpPowerAtRank,
  lethalBlowSkillLineUk,
  LETHAL_BLOW_CRIT_RATE_BONUS,
  rollLethalBlowProc,
} from '../../data/lethalBlowTables.js';
import {
  corpsePlagueMpAndPower,
  hamstringDaMpAndPower,
  holyStrikeMpAndPower,
  lureMp,
  switchMp,
  unlockMp,
} from '../../data/l2dopHfGapSkillsBattle.js';
import {
  aggressionMpAtRank,
  aggressionSkillLineUk,
} from '../../data/aggressionTables.js';
import {
  hateAuraMpAtRank,
  hateAuraSkillLineUk,
} from '../../data/hateAuraTables.js';
import {
  divineHealMpAtRank,
  divineHealPowerAtRank,
  divineHealSkillLineUk,
} from '../../data/divineHealTables.js';
import {
  holyBlessingMpAtRank,
  holyBlessingPowerAtRank,
  holyBlessingSkillLineUk,
} from '../../data/holyBlessingTables.js';
import {
  sacrificeHpCostAtRank,
  sacrificePowerAtRank,
  sacrificeSkillLineUk,
} from '../../data/sacrificeTables.js';
import {
  shieldFortressMpAtRank,
  shieldFortressSkillLineOffUk,
  shieldFortressSkillLineUk,
} from '../../data/shieldFortressTables.js';
import {
  fortitudeMpAtRank,
  fortitudeSkillLineOffUk,
  fortitudeSkillLineUk,
} from '../../data/fortitudeTables.js';
import {
  focusSkillMasteryMpAtRank,
  focusSkillMasterySkillLineOffUk,
  focusSkillMasterySkillLineUk,
} from '../../data/focusSkillMasteryTables.js';
import { resolvePhysicalMirrorTurn } from './physicalMirrorTurn.js';
import { resolveTouchOfLifeTurn } from './touchOfLifeTurn.js';
import { resolveTouchOfDeathTurn } from './touchOfDeathTurn.js';
import { resolveVengeanceTurn } from './vengeanceTurn.js';
import {
  ironWillMpAtRank,
  ironWillSkillLineUk,
} from '../../data/ironWillTables.js';
import {
  reflectDamageMpAtRank,
  reflectDamageReflectRatioAtRank,
  reflectDamageSkillLineUk,
} from '../../data/reflectDamageTables.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import {
  DRAIN_HEALTH_ABSORB_PCT,
  drainHealthMpAndPowerAtRank,
} from '../../data/drainHealthTables.js';
import { resolveMagicBoltHit } from '../../data/l2dopHitResolution.js';
import {
  battleActionNamedFromL2IfMapped,
  canonicalBattleIdForAction,
  catalogEntryVisibleForProfession,
  humanFighterCatalogEntry,
} from '../../data/humanFighterSkillCatalog.js';
import type { HumanFighterSkillCatalogEntry } from '../../data/humanFighterSkillCatalog.js';
import { jsonBoolLike, jsonFiniteNum } from '../battle.js';
import type { BattleActionId } from '../battle.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  PhysicalRollFn,
} from './types.js';
import {
  assertPlayerCanMove,
  assertSkillCooldownReady,
  isCooldownBlocked,
  scaledSkillCooldownSec,
} from './humanFighterTurnHelpers.js';

function reqEntry(
  action: BattleActionId,
  l2Profession: string
): HumanFighterSkillCatalogEntry {
  const canon = canonicalBattleIdForAction(action);
  if (!canon) throw new Error('battle_skill_not_allowed');
  const entry = humanFighterCatalogEntry(canon);
  if (!entry) throw new Error('battle_skill_not_allowed');
  if (!catalogEntryVisibleForProfession(entry, l2Profession)) {
    throw new Error('battle_skill_not_allowed');
  }
  return entry;
}


function swordOrBlunt(wk: string | undefined): boolean {
  return (
    wk === 'sword' ||
    wk === 'blunt' ||
    wk === 'bigsword' ||
    wk === 'bigblunt'
  );
}

function rank(ctx: BattleSkillResolveContext): number {
  const m = ctx.learnedSkillLevelByBattleId;
  const canon =
    canonicalBattleIdForAction(battleActionNamedFromL2IfMapped(ctx.action)) ??
    String(ctx.action);
  if (!m) return 1;
  const v = m[canon];
  return typeof v === 'number' && v >= 1 ? v : 1;
}

function cooldownPatchForSkill(
  skillId: number,
  ctx: BattleSkillResolveContext
): Record<string, number> | undefined {
  const catalogEntry = humanFighterCatalogEntry('l2_' + skillId);
  const rawCd = cooldownSecForSkillId(skillId);
  const cdSec = scaledSkillCooldownSec(ctx, rawCd, catalogEntry);
  if (cdSec <= 0) return undefined;
  return { ['l2_' + skillId]: Date.now() + Math.floor(cdSec * 1000) };
}

function expiresPatchForSkill(
  skillId: number,
  durationSec: number
): Record<string, number> {
  return { [String(skillId)]: Date.now() + Math.floor(durationSec * 1000) };
}

export function resolveHumanFighterGapSkillsTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn
): BattleSkillTurnResult | null {
  const action = battleActionNamedFromL2IfMapped(ctx.action);
  const { combat, preLevel, l2Profession } = ctx;
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);
  const rk = rank(ctx);
  const wk = ctx.weaponKind;

  if (action === 'backstab') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const row = backstabMpPowerAtRank(rk);
    if (!row) throw new Error('battle_skill_not_allowed');
    const fromBehind = isMobBackExposedForBackstab(ctx);
    if (!fromBehind) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: backstabSkillLineUk(false, row.power),
        physOutcome: null,
        magicOutcome: null,
        skipStandardCooldown: true,
      };
    }
    const atk = backstabDamageAtk(combat.pAtk, row.power, profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: backstabSkillLineUk(true, row.power),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'deadly_blow_dagger') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const row = deadlyBlowMpPowerAtRank(rk);
    if (!row) throw new Error('battle_skill_not_allowed');
    const atk = deadlyBlowDamageAtk(combat.pAtk, row.power, profM);
    const r = rollPhys(atk, { critRateBonus: DEADLY_BLOW_CRIT_RATE_BONUS });
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: deadlyBlowSkillLineUk(r.outcome, row.power),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'switch_target') {
    reqEntry(action, String(l2Profession));
    const SWITCH_PDEF = 0.88;
    const mtd = jsonFiniteNum(ctx.st.battleMods?.mobTargetPDefMul);
    if (mtd !== undefined && Math.abs(mtd - SWITCH_PDEF) < 1e-6) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Підміна цілі (Switch) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { mobTargetPDefMul: 1 },
      };
    }
    const mp = switchMp(rk);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Підміна цілі (12, Switch): ціль ослаблена (нижчий захист).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobTargetPDefMul: SWITCH_PDEF },
    };
  }

  if (action === 'unlock') {
    reqEntry(action, String(l2Profession));
    return {
      mpCost: unlockMp(rk),
      pDmg: 0,
      skillLine: 'Відмикання (27): у бою без дверей — лише витрата MP.',
      physOutcome: null,
      magicOutcome: null,
    };
  }

  if (action === 'lure') {
    reqEntry(action, String(l2Profession));
    const LURE_DEBUFF = 0.94;
    const md = jsonFiniteNum(ctx.st.battleMods?.mobPatkDebuffMul);
    if (md !== undefined && Math.abs(md - LURE_DEBUFF) < 1e-6) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Приманка (Lure) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { mobPatkDebuffMul: 1 },
      };
    }
    return {
      mpCost: lureMp(),
      pDmg: 0,
      skillLine: 'Приманка (51, Lure): моб слабший до атаки.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: LURE_DEBUFF },
    };
  }

  if (action === 'fake_death') {
    reqEntry(action, String(l2Profession));
    const on = jsonBoolLike(ctx.st.battleMods?.fakeDeathActive);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Удавана смерть (60) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { fakeDeathActive: false },
      };
    }
    return {
      mpCost: 35,
      pDmg: 0,
      skillLine:
        'Удавана смерть (60, Fake Death): моб частіше промахується.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { fakeDeathActive: true },
    };
  }

  if (action === 'ultimate_evasion') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_111'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const UE_DURATION_SEC = buffDurationSecForSkillId(111) ?? 30;
    const cdPatch = cooldownPatchForSkill(111, ctx);
    return {
      mpCost: 50,
      pDmg: 0,
      skillLine:
        'Абсолютне ухилення (111): значно вище ухилення.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        ultimateEvasionActive: true,
        ultimateEvasionEvasionFlat: 28 + Math.min(12, rk),
      },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(111, UE_DURATION_SEC),
    };
  }

  if (action === 'silent_move') {
    reqEntry(action, String(l2Profession));
    assertPlayerCanMove(ctx);
    const on = jsonBoolLike(ctx.st.battleMods?.silentMoveActive);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Безшумний рух (221) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { silentMoveActive: false },
      };
    }
    return {
      mpCost: 7,
      pDmg: 0,
      skillLine:
        'Безшумний рух (221, Silent Move): швидше біг, трохи ухилення.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        silentMoveActive: true,
        silentMoveRunFlat: 8,
        silentMoveEvasionFlat: 12,
      },
    };
  }

  if (action === 'lethal_blow_adv') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const row = lethalBlowMpPowerAtRank(rk);
    if (!row) throw new Error('battle_skill_not_allowed');
    const atk = lethalBlowDamageAtk(combat.pAtk, row.power, profM);
    const r = rollPhys(atk, { critRateBonus: LETHAL_BLOW_CRIT_RATE_BONUS });
    const lethalProc =
      r.outcome !== 'miss' && r.outcome != null && rollLethalBlowProc();
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: lethalBlowSkillLineUk(r.outcome, lethalProc),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(lethalProc ? { lethalShotProc: true } : {}),
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'focus_chance') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const mp = focusChanceMpAtRank(rk);
    if (mp == null) throw new Error('battle_skill_not_allowed');
    const cd = ctx.st.mysticSkillCdUntil?.['l2_356'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const cdPatch = cooldownPatchForSkill(FOCUS_CHANCE_L2_SKILL_ID, ctx);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine: focusChanceSkillLineUk(),
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusChanceActive: true },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(
        FOCUS_CHANCE_L2_SKILL_ID,
        FOCUS_CHANCE_DURATION_SEC
      ),
    };
  }

  if (action === 'focus_power') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const mp = focusPowerMpAtRank(rk);
    if (mp == null) throw new Error('battle_skill_not_allowed');
    const cd = ctx.st.mysticSkillCdUntil?.['l2_357'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const cdPatch = cooldownPatchForSkill(FOCUS_POWER_L2_SKILL_ID, ctx);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine: focusPowerSkillLineUk(),
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusPowerActive: true },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(
        FOCUS_POWER_L2_SKILL_ID,
        FOCUS_POWER_DURATION_SEC
      ),
    };
  }

  if (action === 'bluff') {
    reqEntry(action, String(l2Profession));
    if (!isDaggerWeaponKind(wk)) throw new Error('battle_skill_not_allowed');
    const mp = bluffMpAtRank(rk);
    if (mp == null) throw new Error('battle_skill_not_allowed');
    const cd = ctx.st.mysticSkillCdUntil?.['l2_358'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const nowMs = Date.now();
    const until = nowMs + bluffStunDurationMs();
    const existingStun = jsonFiniteNum(ctx.st.battleMods?.mobStunUntilMs);
    const alreadyStunned =
      existingStun !== undefined && existingStun > nowMs;
    const stunBlocked = spawnBlocksHammerCrushStun(ctx.spawnKind);
    const effStunPct = scaleLandChancePercentAfterResist(
      BLUFF_BASE_STUN_CHANCE_PCT,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedStun =
      !stunBlocked &&
      !alreadyStunned &&
      Math.random() * 100 < effStunPct;
    const loseTarget = rollBluffLoseTarget();
    const battleModsPatch: Partial<BattleBattleMods> = {
      mobBackExposedUntilMs: until,
      mobBackExposedIconSkillId: BLUFF_L2_SKILL_ID,
    };
    if (appliedStun) {
      battleModsPatch.mobStunUntilMs = until;
      battleModsPatch.mobStunIconSkillId = BLUFF_L2_SKILL_ID;
    }
    const cdPatch = cooldownPatchForSkill(BLUFF_L2_SKILL_ID, ctx);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine: bluffSkillLineUk(
        appliedStun,
        alreadyStunned,
        loseTarget,
        effStunPct,
        stunBlocked
      ),
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch,
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(
        BLUFF_L2_SKILL_ID,
        BLUFF_STUN_DURATION_SEC
      ),
      ...((appliedStun || loseTarget) && {
        skipMobCounterAttackOnce: true,
        mobRetaliationDelayHits: appliedStun ? 2 : 3,
      }),
    };
  }

  if (action === 'aggression') {
    const learnedRank = ctx.learnedSkillLevelByBattleId?.['l2_28'] ?? 0;
    if (learnedRank < 1) throw new Error('battle_skill_not_allowed');
    const entry = humanFighterCatalogEntry('l2_28');
    if (!entry || !catalogEntryVisibleForProfession(entry, String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!ctx.hasEquippedShield) {
      throw new Error('battle_skill_not_allowed');
    }
    const cd = ctx.st.mysticSkillCdUntil?.['l2_28'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const rank = learnedRank;
    const mpCost = aggressionMpAtRank(rank) ?? 20;
    const cdPatch = cooldownPatchForSkill(28, ctx);
    return {
      mpCost,
      pDmg: 0,
      skillLine: aggressionSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      worldBossTaunt: true,
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'hate_aura') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_18'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const mpCost = hateAuraMpAtRank(rk) ?? 50;
    const cdPatch = cooldownPatchForSkill(18, ctx);
    return {
      mpCost,
      pDmg: 0,
      skillLine: hateAuraSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      worldBossTaunt: true,
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'divine_heal') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_45'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const mpCost = divineHealMpAtRank(rk) ?? 75;
    const heal = divineHealPowerAtRank(rk);
    const cdPatch = cooldownPatchForSkill(45, ctx);
    return {
      mpCost,
      pDmg: 0,
      skillLine: divineHealSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      playerHeal: Math.max(1, heal),
      playerHealSourceUk: 'Божественне зцілення',
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'holy_blessing') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_262'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const mpCost = holyBlessingMpAtRank(rk) ?? 115;
    const heal = holyBlessingPowerAtRank(rk);
    const cdPatch = cooldownPatchForSkill(262, ctx);
    return {
      mpCost,
      pDmg: 0,
      skillLine: holyBlessingSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      playerHeal: Math.max(1, heal),
      playerHealSourceUk: 'Святе благословення',
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'sacrifice') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_69'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const hpCost = sacrificeHpCostAtRank(rk);
    if (ctx.playerHpInBattle <= hpCost) {
      throw new Error('battle_skill_not_allowed');
    }
    const heal = sacrificePowerAtRank(rk);
    const cdPatch = cooldownPatchForSkill(69, ctx);
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine: sacrificeSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      playerHeal: Math.max(1, heal),
      playerHealSourceUk: 'Жертва',
      playerHpCost: hpCost,
      playerHpCostSourceUk: 'Жертва',
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'iron_will') {
    reqEntry(action, String(l2Profession));
    const alreadyOn = (ctx.activeBuffs ?? []).some(
      (b) => Math.floor(Number(b.skillId)) === 72
    );
    if (alreadyOn) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Залізна воля (72, Iron Will) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        activeBuffPatch: { skillId: 72, level: rk, action: 'remove' },
      };
    }
    const cd = ctx.st.mysticSkillCdUntil?.['l2_72'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const mpCost = ironWillMpAtRank(rk) ?? 38;
    const cdPatch = cooldownPatchForSkill(72, ctx);
    return {
      mpCost,
      pDmg: 0,
      skillLine: ironWillSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 72, level: rk, action: 'add' },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'remedy') {
    reqEntry(action, String(l2Profession));
    return {
      mpCost: 22,
      pDmg: 0,
      skillLine: 'Протиотрута (44, Remedy): очищення (у PvE — символічно).',
      physOutcome: null,
      magicOutcome: null,
    };
  }

  if (action === 'holy_strike') {
    reqEntry(action, String(l2Profession));
    if (!swordOrBlunt(wk)) throw new Error('battle_skill_not_allowed');
    const row = holyStrikeMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.12 + row.power / 500) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Святий удар (49, Holy Strike).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'drain_health') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_70'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const row = drainHealthMpAndPowerAtRank(rk);
    if (!row) throw new Error('battle_skill_not_allowed');
    const mMul = jsonFiniteNum(ctx.st.battleMods?.mysticMatkBuffMul) ?? 1;
    const mAtkEff = Math.max(1, Math.floor(combat.mAtk * (mMul > 1 ? mMul : 1)));
    const mobEva =
      typeof ctx.st.mobEvasion === 'number' && Number.isFinite(ctx.st.mobEvasion)
        ? Math.max(0, Math.floor(ctx.st.mobEvasion))
        : Math.floor(Math.sqrt(combat.dex) * 6 + preLevel);
    const r = resolveMagicBoltHit({
      mAtk: mAtkEff,
      mobMDef: ctx.st.mobMDef,
      playerInt: combat.int,
      playerWit: combat.wit,
      playerMen: combat.men,
      playerLevel: preLevel,
      mobEvasion: mobEva,
      skillPower: row.power,
      bonusSps: 1,
      mCritPct: combat.mCritPct,
      magicCritDmgMul: combat.magicCritDmgMul,
      allowMiss: true,
      allowMagicCrit: true,
    });
    const heal =
      r.damage > 0
        ? Math.max(1, Math.floor((r.damage * DRAIN_HEALTH_ABSORB_PCT) / 100))
        : 0;
    const cdPatch = cooldownPatchForSkill(70, ctx);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine:
        'Витягування життя (70, Drain Health): темний урон; +' +
        DRAIN_HEALTH_ABSORB_PCT +
        '% урону як HP.',
      physOutcome: null,
      magicOutcome: r.outcome,
      ...(heal > 0
        ? { playerHeal: heal, playerHealSourceUk: 'Drain Health' }
        : {}),
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'sanctuary') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_97'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const SAN_MUL = 0.82;
    const SAN_DURATION_SEC = buffDurationSecForSkillId(97) ?? 30;
    const cdPatch = cooldownPatchForSkill(97, ctx);
    return {
      mpCost: 38,
      pDmg: 0,
      skillLine: 'Святилище (97, Sanctuary): менший вхідний фіз. урон.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { sanctuaryIncomingPhysMul: SAN_MUL },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(97, SAN_DURATION_SEC),
    };
  }

  if (action === 'aegis_stance') {
    reqEntry(action, String(l2Profession));
    const on = jsonBoolLike(ctx.st.battleMods?.aegisStanceActive);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Стійка егіда (318) вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { aegisStanceActive: false },
      };
    }
    return {
      mpCost: 45,
      pDmg: 0,
      skillLine:
        'Стійка егіда (318, Aegis Stance): вищий P.Def / M.Def.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        aegisStanceActive: true,
        aegisPDefMul: 1.18,
        aegisMDefMul: 1.18,
      },
    };
  }

  if (action === 'horror') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_65'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const HOR_DEBUFF = 0.82;
    const HOR_DURATION_SEC = buffDurationSecForSkillId(65) ?? 20;
    const cdPatch = cooldownPatchForSkill(65, ctx);
    return {
      mpCost: 35,
      pDmg: 0,
      skillLine: 'Жах (65, Horror): моб слабше б’є.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: HOR_DEBUFF },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(65, HOR_DURATION_SEC),
    };
  }

  if (action === 'reflect_damage') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_86'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const ratio = reflectDamageReflectRatioAtRank(rk);
    const REFL_DURATION_SEC = buffDurationSecForSkillId(86) ?? 1200;
    const cdPatch = cooldownPatchForSkill(86, ctx);
    return {
      mpCost: reflectDamageMpAtRank(rk) ?? 35,
      pDmg: 0,
      skillLine: reflectDamageSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { reflectDamageReturnRatio: ratio },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(86, REFL_DURATION_SEC),
    };
  }

  if (action === 'corpse_plague') {
    reqEntry(action, String(l2Profession));
    const row = corpsePlagueMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.05 + row.power / 550) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Чума трупа (103, Corpse Plague).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'hamstring_slash') {
    reqEntry(action, String(l2Profession));
    if (!swordOrBlunt(wk)) throw new Error('battle_skill_not_allowed');
    const row = hamstringDaMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.1 + row.power / 480) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Підріз сухожилля (127, Hamstring).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'summon_dark_panther') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_283'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const PANTHER_THRILL = 1.06;
    const PANTHER_DURATION_SEC = buffDurationSecForSkillId(283) ?? 60;
    const cdPatch = cooldownPatchForSkill(283, ctx);
    return {
      mpCost: 70,
      pDmg: 0,
      skillLine:
        'Темна пантера (283): бонус до атаки в цьому бою.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { thrillFightPatkMul: PANTHER_THRILL },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(283, PANTHER_DURATION_SEC),
    };
  }

  if (action === 'shield_fortress') {
    reqEntry(action, String(l2Profession));
    const alreadyOn = (ctx.activeBuffs ?? []).some(
      (b) => Math.floor(Number(b.skillId)) === 322
    );
    if (alreadyOn) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: shieldFortressSkillLineOffUk(),
        physOutcome: null,
        magicOutcome: null,
        activeBuffPatch: { skillId: 322, level: rk, action: 'remove' },
      };
    }
    if (ctx.hasEquippedShield !== true) {
      throw new Error('battle_skill_not_allowed');
    }
    const mpCost = shieldFortressMpAtRank(rk) ?? 12;
    return {
      mpCost,
      pDmg: 0,
      skillLine: shieldFortressSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 322, level: rk, action: 'add' },
    };
  }

  if (action === 'fortitude') {
    reqEntry(action, String(l2Profession));
    const alreadyOn = (ctx.activeBuffs ?? []).some(
      (b) => Math.floor(Number(b.skillId)) === 335
    );
    if (alreadyOn) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: fortitudeSkillLineOffUk(),
        physOutcome: null,
        magicOutcome: null,
        activeBuffPatch: { skillId: 335, level: rk, action: 'remove' },
      };
    }
    const mpCost = fortitudeMpAtRank(rk) ?? 35;
    return {
      mpCost,
      pDmg: 0,
      skillLine: fortitudeSkillLineUk(rk),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 335, level: rk, action: 'add' },
    };
  }

  if (action === 'focus_skill_mastery') {
    reqEntry(action, String(l2Profession));
    const alreadyOn = (ctx.activeBuffs ?? []).some(
      (b) => Math.floor(Number(b.skillId)) === 334
    );
    if (alreadyOn) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: focusSkillMasterySkillLineOffUk(),
        physOutcome: null,
        magicOutcome: null,
        activeBuffPatch: { skillId: 334, level: rk, action: 'remove' },
      };
    }
    const mpCost = focusSkillMasteryMpAtRank(rk) ?? 36;
    return {
      mpCost,
      pDmg: 0,
      skillLine: focusSkillMasterySkillLineUk(),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 334, level: rk, action: 'add' },
    };
  }

  if (action === 'touch_of_life') {
    return resolveTouchOfLifeTurn(ctx);
  }

  if (action === 'touch_of_death') {
    return resolveTouchOfDeathTurn(ctx);
  }

  if (action === 'physical_mirror') {
    return resolvePhysicalMirrorTurn(ctx);
  }

  if (action === 'vengeance') {
    return resolveVengeanceTurn(ctx);
  }

  return null;
}
