/**
 * Реалізація 27 «gap» скілів HF (див. audit:hf-battle-catalog-gap).
 */
import { humanFighterProfessionAtkMult } from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  backstabMpAndPower,
  corpsePlagueMpAndPower,
  deadlyBlowThMpAndPower,
  hamstringDaMpAndPower,
  holyStrikeMpAndPower,
  lethalBlowAdvMpAndPower,
  lureMp,
  switchMp,
  touchOfDeathMpAndPower,
  touchOfLifeMpAndPower,
  unlockMp,
} from '../../data/l2dopHfGapSkillsBattle.js';
import { cooldownSecForSkillId } from '../../data/skillCooldowns.js';
import { buffDurationSecForSkillId } from '../../data/l2dopBuffDurations.js';
import {
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

function daggerOk(wk: string | undefined): boolean {
  return wk === 'dagger' || wk === 'dual';
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
    canonicalBattleIdForAction(ctx.action) ?? String(ctx.action);
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
  const { action, combat, preLevel, l2Profession } = ctx;
  const profM = humanFighterProfessionAtkMult(preLevel, l2Profession);
  const rk = rank(ctx);
  const wk = ctx.weaponKind;

  if (action === 'backstab') {
    reqEntry(action, String(l2Profession));
    if (!daggerOk(wk)) throw new Error('battle_skill_not_allowed');
    const row = backstabMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.22 + row.power / 380) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Удар у спину (30, Backstab).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'deadly_blow_dagger') {
    reqEntry(action, String(l2Profession));
    if (!daggerOk(wk)) throw new Error('battle_skill_not_allowed');
    const row = deadlyBlowThMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.18 + row.power / 400) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Смертельний удар (263, Deadly Blow).',
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
    if (!daggerOk(wk)) throw new Error('battle_skill_not_allowed');
    const row = lethalBlowAdvMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.35 + row.power / 900) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Смертельний удар (344, Lethal Blow).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'focus_chance') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_356'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const FCC = 35;
    const FC_DURATION_SEC = buffDurationSecForSkillId(356) ?? 300;
    const cdPatch = cooldownPatchForSkill(356, ctx);
    return {
      mpCost: 42,
      pDmg: 0,
      skillLine: 'Фокус шансу (356): вищий шанс криту.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusChanceCritRateAdd: FCC },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(356, FC_DURATION_SEC),
    };
  }

  if (action === 'focus_power') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_357'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const FPM = 1.12;
    const FP_DURATION_SEC = buffDurationSecForSkillId(357) ?? 300;
    const cdPatch = cooldownPatchForSkill(357, ctx);
    return {
      mpCost: 42,
      pDmg: 0,
      skillLine: 'Фокус сили (357): сильніша фізична атака.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusPowerPatkMul: FPM },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(357, FP_DURATION_SEC),
    };
  }

  if (action === 'bluff') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_358'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const BLUFF_PDEF = 0.9;
    const BLUFF_CRIT = 1.25;
    const BLUFF_DURATION_SEC = buffDurationSecForSkillId(358) ?? 8;
    const cdPatch = cooldownPatchForSkill(358, ctx);
    return {
      mpCost: 48,
      pDmg: 0,
      skillLine: 'Блеф (358): нижчий захист цілі; сильніший крит.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        mobTargetPDefMul: BLUFF_PDEF,
        bluffCritDmgMul: BLUFF_CRIT,
      },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(358, BLUFF_DURATION_SEC),
    };
  }

  if (action === 'aggression') {
    reqEntry(action, String(l2Profession));
    if (!swordOrBlunt(wk)) throw new Error('battle_skill_not_allowed');
    const cd = ctx.st.mysticSkillCdUntil?.['l2_18'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const AGG_DEBUFF = 0.92;
    const AGG_DURATION_SEC = buffDurationSecForSkillId(18) ?? 15;
    const cdPatch = cooldownPatchForSkill(18, ctx);
    return {
      mpCost: 28,
      pDmg: 0,
      skillLine: 'Аура ненависті (18, Aggression): моб слабший.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: AGG_DEBUFF },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(18, AGG_DURATION_SEC),
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
    const REFL = 0.18;
    const REFL_DURATION_SEC = buffDurationSecForSkillId(86) ?? 60;
    const cdPatch = cooldownPatchForSkill(86, ctx);
    return {
      mpCost: 40,
      pDmg: 0,
      skillLine:
        'Відбиття шкоди (86, Reflect Damage): частина урону повертається мобу.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { reflectDamageReturnRatio: REFL },
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
    const cd = ctx.st.mysticSkillCdUntil?.['l2_322'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const SHIELD_MUL = 1.14;
    const SHIELD_DURATION_SEC = buffDurationSecForSkillId(322) ?? 30;
    const cdPatch = cooldownPatchForSkill(322, ctx);
    return {
      mpCost: 55,
      pDmg: 0,
      skillLine: 'Фортеця щита (322, Shield Fortress): міцніший захист.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { shieldFortressPDefMul: SHIELD_MUL },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(322, SHIELD_DURATION_SEC),
    };
  }

  if (action === 'touch_of_life') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_341'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const row = touchOfLifeMpAndPower(rk);
    const heal = Math.floor(
      ctx.playerMaxHpInBattle * 0.15 + row.power * 0.08
    );
    const cdPatch = cooldownPatchForSkill(341, ctx);
    return {
      mpCost: row.mp,
      pDmg: 0,
      skillLine: 'Дотик життя (341, Touch of Life).',
      physOutcome: null,
      magicOutcome: null,
      playerHeal: Math.max(1, heal),
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
    };
  }

  if (action === 'touch_of_death') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_342'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    if (!swordOrBlunt(wk)) throw new Error('battle_skill_not_allowed');
    const row = touchOfDeathMpAndPower(rk);
    const atk = Math.floor(combat.pAtk * (1.25 + row.power / 400) * profM);
    const r = rollPhys(atk);
    const cdPatch = cooldownPatchForSkill(342, ctx);
    return {
      mpCost: row.mp,
      pDmg: r.damage,
      skillLine: 'Дотик смерті (342, Touch of Death).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      ...(r.weaknessLogLineUk ? { weaknessLogLineUk: r.weaknessLogLineUk } : {}),
    };
  }

  if (action === 'physical_mirror') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_350'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const MIR = 0.22;
    const MIR_DURATION_SEC = buffDurationSecForSkillId(350) ?? 60;
    const cdPatch = cooldownPatchForSkill(350, ctx);
    return {
      mpCost: 52,
      pDmg: 0,
      skillLine:
        'Фізичне дзеркало (350): відбиває частину ударів у моба.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { physicalMirrorReflectRatio: MIR },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(350, MIR_DURATION_SEC),
    };
  }

  if (action === 'vengeance') {
    reqEntry(action, String(l2Profession));
    const cd = ctx.st.mysticSkillCdUntil?.['l2_368'];
    if (isCooldownBlocked(typeof cd === 'number' ? cd : undefined)) {
      assertSkillCooldownReady(typeof cd === 'number' ? cd : undefined);
    }
    const VIM = 0.88;
    const VRR = 0.12;
    const VENGEANCE_DURATION_SEC = buffDurationSecForSkillId(368) ?? 30;
    const cdPatch = cooldownPatchForSkill(368, ctx);
    return {
      mpCost: 48,
      pDmg: 0,
      skillLine: 'Відплата (368, Vengeance): менший вхідний урон і відбиття.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        vengeanceIncomingPhysMul: VIM,
        vengeanceReflectRatio: VRR,
      },
      ...(cdPatch ? { mysticSkillCdUntilPatch: cdPatch } : {}),
      battleModsExpiresPatch: expiresPatchForSkill(368, VENGEANCE_DURATION_SEC),
    };
  }

  return null;
}
