/**
 * Human fighter turn — базові удари, лук, War Cry, Dash, Roar, POLE/мечі до Provoke (ланцюг з resolveHumanFighterTurnCore).
 */
import { burstShotMpPowerAtRank } from '../../data/burstShotTables.js';
import {
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  stunAttackMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  whirlwindMpAndPower,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import { doubleShotMpPowerAtRank } from '../../data/doubleShotTables.js';
import {
  hawkEyeMpAtRank,
  hawkEyeSkillLineUk,
} from '../../data/hawkEyeTables.js';
import {
  soulOfSagittariusHpCostAtRank,
  soulOfSagittariusSkillLineUk,
} from '../../data/soulOfSagittariusTables.js';
import {
  snipeMpAtRank,
  snipeSkillLineUk,
} from '../../data/snipeTables.js';
import {
  lethalShotDamageAtk,
  lethalShotMpPowerAtRank,
  lethalShotSkillLineUk,
  rollLethalShotProc,
} from '../../data/lethalShotTables.js';
import {
  HAMSTRING_SHOT_BASE_LAND_CHANCE_PCT,
  HAMSTRING_SHOT_L2_SKILL_ID,
  HAMSTRING_SHOT_RUN_SPEED_MUL,
  hamstringShotDamageAtk,
  hamstringShotMpPowerAtRank,
  hamstringShotSkillLineUk,
  hamstringShotSlowDurationMs,
} from '../../data/hamstringShotTables.js';
import { isPvpBattleJson } from '../battlePvpContext.js';
import {
  provokeDurationSecAtRank,
  provokeMpAtRank,
  provokePoleResistCutPctAtRank,
  spawnAllowsProvokeAggro,
} from '../../data/provokeTables.js';
import {
  dashMpAtRank,
  dashRunSpeedFlatAtRank,
} from '../../data/dashTables.js';
import {
  rapidShotAspdMulAtRank,
  rapidShotAspdPctAtRank,
  rapidShotMpAtRank,
} from '../../data/rapidShotTables.js';
import {
  warCryMpAtRank,
  warCryPatkPercentAtRank,
} from '../../data/warCryTables.js';
import { battleRoarSkillLineUk } from '../../data/battleRoarTables.js';
import {
  majestyMpAtRank,
  majestySkillLineUk,
} from '../../data/majestyTables.js';
import {
  ULTIMATE_DEFENSE_BUFF_DURATION_SEC,
  ultimateDefenseMpAtRank,
  ultimateDefenseSkillLineUk,
} from '../../data/ultimateDefenseTables.js';
import {
  deflectArrowMpAtRank,
  deflectArrowSkillLineUk,
} from '../../data/deflectArrowTables.js';
import {
  STUN_SHOT_BASE_STUN_CHANCE_PCT,
  STUN_SHOT_L2_SKILL_ID,
  stunShotMpPowerAtRank,
  stunShotSkillLineUk,
  stunShotStunDurationMs,
} from '../../data/stunShotTables.js';
import type { BattleBattleMods } from '../battleTypes.js';
import { jsonFiniteNum } from '../battle.js';
import { resolveShieldStunTurn } from './shieldStunTurn.js';
import { resolveShieldSlamTurn } from './shieldSlamTurn.js';
import {
  effectiveMobStunResistPct,
  effectiveMobWitResistPct,
  scaleLandChancePercentAfterResist,
  witResistPctFromStat,
  applyTouchOfDeathResistPenalty,
} from '../controlLandResist.js';
import type { BattleSkillTurnResult } from './types.js';
import {
  l2dopXmlMpPower,
  l2dopXmlSkillRow,
} from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  THUNDER_STORM_BASE_STUN_CHANCE_PCT,
  THUNDER_STORM_STUN_CHANCE_CAP_PCT,
  THUNDER_STORM_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  assertPlayerCanMove,
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  legacyBuffCdAndExpirePatches,
  legacyBuffExpiresPatch,
  legacyBuffOnCd,
  requireCatalogEntryForAction,
  rollAccumulatedWarriorAttack,
  stubMpForCanon,
  swordOrBluntWeapon,
  warlordBranchProfession,
  warriorProfOkForSkill,
} from './humanFighterTurnHelpers.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';

export function tryResolveHumanFighterTurnBasics(a: FighterTurnCoreArgs): BattleSkillTurnResult | undefined {
  const { ctx, rollPhys, action, combat, preLevel, l2Profession, profM, rank } = a;
  if (action === 'attack') {
    const r = rollAccumulatedWarriorAttack(
      rollPhys,
      combat.pAtk,
      combat.pAtkSpd,
      ctx.st.lastPlayerAttackAtMs
    );
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: r.outcome,
      magicOutcome: null,
      playerDamageLogLines: r.linesUk,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_strike') {
    const ps =
      l2dopXmlMpPower(3, rank) ?? powerStrikeMpAndPower(preLevel, rank);
    if (!ps) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + ps.power / 450) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ps.mp,
      pDmg: r.damage,
      skillLine: 'Силовий удар (3, Power Strike).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'mortal_blow') {
    const mb =
      l2dopXmlMpPower(16, rank) ?? mortalBlowMpAndPower(preLevel, rank);
    if (!mb) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.07 + mb.power / 440) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mb.mp,
      pDmg: r.damage,
      skillLine: 'Смертельний удар (16, Mortal Blow).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_shot') {
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const pshot =
      l2dopXmlMpPower(56, rank) ?? powerShotMpAndPower(preLevel, rank);
    if (!pshot) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.07 + pshot.power / 500) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: pshot.mp,
      pDmg: r.damage,
      skillLine: 'Силовий постріл (56, Power Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'double_shot') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ds =
      l2dopXmlMpPower(19, rank) ?? doubleShotMpPowerAtRank(rank);
    if (!ds) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.09 + ds.power / 420) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ds.mp,
      pDmg: r.damage,
      skillLine: 'Подвійний постріл (19, Double Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'burst_shot') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const bs =
      l2dopXmlMpPower(24, rank) ?? burstShotMpPowerAtRank(rank);
    if (!bs) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + bs.power / 480) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: bs.mp,
      pDmg: r.damage,
      skillLine: 'Вибуховий залп (24, Burst Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'war_cry') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Не-тогл self-buff: повторне натискання НЕ вимикає ефект, а лише оновлює
     * тривалість (L2 Interlude). Якщо скіл на КД — кидаємо `battle_skill_not_allowed`,
     * клієнт показує сірий overlay на хотбарі.
     */
    const cdUntil = ctx.st.mysticSkillCdUntil?.['l2_78'];
    assertSkillCooldownReady(cdUntil);
    const wcRow = l2dopXmlSkillRow(78, rank);
    const wcPct = warCryPatkPercentAtRank(rank);
    return {
      mpCost: warCryMpAtRank(rank) ?? wcRow?.m ?? 10,
      pDmg: 0,
      skillLine:
        'Бойовий клич (War Cry): +' +
        wcPct +
        '% до фіз. атаки на 5 хв.',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 78, level: rank, action: 'add' },
    };
  }

  if (action === 'dash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    assertPlayerCanMove(ctx);
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 4)) {
      throw new Error('battle_skill_not_allowed');
    }
    const runFlat = dashRunSpeedFlatAtRank(rank);
    return {
      mpCost: dashMpAtRank(rank),
      pDmg: 0,
      skillLine:
        'Ривок (Dash): +' + runFlat + ' до швидкості пересування на 15 с.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        dashRunSpeedFlat: runFlat,
      },
      ...legacyBuffCdAndExpirePatches(4, ctx),
    };
  }

  if (action === 'rapid_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    if (legacyBuffOnCd(ctx, 99)) {
      throw new Error('battle_skill_not_allowed');
    }
    const aspdPct = rapidShotAspdPctAtRank(rank);
    const RAPID_MP = rapidShotMpAtRank(rank);
    const RAPID_MUL = rapidShotAspdMulAtRank(rank);
    return {
      mpCost: RAPID_MP,
      pDmg: 0,
      skillLine:
        'Швидкий постріл (Rapid Shot): +' +
        aspdPct +
        '% швидкості атаки з луком.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { rapidShotAspdMul: RAPID_MUL },
      ...legacyBuffCdAndExpirePatches(99, ctx),
    };
  }

  if (action === 'hawk_eye') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const heCd = ctx.st.mysticSkillCdUntil?.['l2_131'];
    if (typeof heCd === 'number' && Date.now() < heCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: hawkEyeMpAtRank(rank) ?? stubMpForCanon('l2_131', rank),
      pDmg: 0,
      skillLine: hawkEyeSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 131, level: rank, action: 'add' },
    };
  }

  if (action === 'soul_of_sagittarius') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const sosCd = ctx.st.mysticSkillCdUntil?.['l2_303'];
    if (typeof sosCd === 'number' && Date.now() < sosCd) {
      throw new Error('battle_skill_not_allowed');
    }
    const hpCost = soulOfSagittariusHpCostAtRank(rank);
    if (ctx.playerHpInBattle <= hpCost) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine: soulOfSagittariusSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      playerHpCost: hpCost,
      playerHpCostSourceUk: 'Дух Стрільця',
      activeBuffPatch: { skillId: 303, level: rank, action: 'add' },
    };
  }

  if (action === 'snipe') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const snCd = ctx.st.mysticSkillCdUntil?.['l2_313'];
    if (typeof snCd === 'number' && Date.now() < snCd) {
      throw new Error('battle_skill_not_allowed');
    }
    const expPatch = legacyBuffExpiresPatch(313);
    return {
      mpCost: snipeMpAtRank(rank) ?? stubMpForCanon('l2_313', rank),
      pDmg: 0,
      skillLine: snipeSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 313, level: rank, action: 'add' },
      battleModsPatch: { snipeImmobile: true },
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  if (action === 'stun_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ss = stunShotMpPowerAtRank(rank);
    if (!ss) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.07 + ss.power / 420) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const nowMs = Date.now();
    const existingStun = jsonFiniteNum(ctx.st.battleMods?.mobStunUntilMs);
    const alreadyStunned =
      existingStun !== undefined && existingStun > nowMs;
    const effStunPct = scaleLandChancePercentAfterResist(
      STUN_SHOT_BASE_STUN_CHANCE_PCT,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    let appliedStun = false;
    let battleModsPatch: Partial<BattleBattleMods> | undefined;
    if (
      !alreadyStunned &&
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effStunPct
    ) {
      appliedStun = true;
      battleModsPatch = {
        mobStunUntilMs: nowMs + stunShotStunDurationMs(),
        mobStunIconSkillId: STUN_SHOT_L2_SKILL_ID,
      };
    }
    return {
      mpCost: ss.mp,
      pDmg: r.damage,
      skillLine: stunShotSkillLineUk(appliedStun, alreadyStunned, effStunPct),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(battleModsPatch ? { battleModsPatch } : {}),
      ...(appliedStun
        ? { skipMobCounterAttackOnce: true, mobRetaliationDelayHits: 2 }
        : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'lethal_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ls = lethalShotMpPowerAtRank(rank);
    if (!ls) throw new Error('battle_skill_not_allowed');
    const atk = lethalShotDamageAtk(combat.pAtk, ls.power, profM);
    const r = rollPhys(atk);
    const lethalProc =
      r.outcome !== 'miss' && r.outcome != null && rollLethalShotProc();
    return {
      mpCost: ls.mp,
      pDmg: r.damage,
      skillLine: lethalShotSkillLineUk(lethalProc),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(lethalProc ? { lethalShotProc: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'hamstring_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const hs = hamstringShotMpPowerAtRank(rank);
    if (!hs) throw new Error('battle_skill_not_allowed');
    const atk = hamstringShotDamageAtk(combat.pAtk, hs.power, profM);
    const r = rollPhys(atk);
    const nowMs = Date.now();
    const isPvp = isPvpBattleJson(ctx.st);
    let witResist: number;
    if (isPvp) {
      const lv =
        typeof ctx.st.pvpTargetLevel === 'number' && ctx.st.pvpTargetLevel >= 1
          ? Math.floor(ctx.st.pvpTargetLevel)
          : ctx.spawnLevel;
      witResist = witResistPctFromStat(20 + Math.floor(lv * 0.55));
    } else {
      witResist = effectiveMobWitResistPct({
        level: ctx.spawnLevel,
        debuffResistPct: ctx.spawnDebuffResistPct,
      });
    }
    witResist = applyTouchOfDeathResistPenalty(
      witResist,
      ctx.st.battleMods,
      nowMs
    );
    const effLandPct = scaleLandChancePercentAfterResist(
      HAMSTRING_SHOT_BASE_LAND_CHANCE_PCT,
      witResist
    );
    const landedHit =
      r.damage > 0 && r.outcome !== 'miss' && r.outcome != null;
    const appliedSlow = landedHit && Math.random() * 100 < effLandPct;
    let battleModsPatch: Partial<BattleBattleMods> | undefined;
    let battleModsExpiresPatch: Record<string, number> | undefined;
    if (appliedSlow) {
      const until = nowMs + hamstringShotSlowDurationMs();
      battleModsPatch = {
        mobRunSpeedDebuffMul: HAMSTRING_SHOT_RUN_SPEED_MUL,
        mobRunSpeedDebuffUntilMs: until,
        mobRunSpeedDebuffIconSkillId: HAMSTRING_SHOT_L2_SKILL_ID,
      };
      battleModsExpiresPatch = {
        [String(HAMSTRING_SHOT_L2_SKILL_ID)]: until,
      };
    }
    return {
      mpCost: hs.mp,
      pDmg: r.damage,
      skillLine: hamstringShotSkillLineUk(appliedSlow, effLandPct),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(battleModsPatch ? { battleModsPatch } : {}),
      ...(battleModsExpiresPatch ? { battleModsExpiresPatch } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'battle_roar') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Не-тогл: повторне натискання оновлює тривалість, не знімає. КД блокує refresh.
     */
    const brCd = ctx.st.mysticSkillCdUntil?.['l2_121'];
    if (typeof brCd === 'number' && Date.now() < brCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_121', rank),
      pDmg: 0,
      skillLine: battleRoarSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 121, level: rank, action: 'add' },
    };
  }

  if (action === 'majesty') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const mjCd = ctx.st.mysticSkillCdUntil?.['l2_82'];
    if (typeof mjCd === 'number' && Date.now() < mjCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: majestyMpAtRank(rank) ?? stubMpForCanon('l2_82', rank),
      pDmg: 0,
      skillLine: majestySkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 82, level: rank, action: 'add' },
    };
  }

  if (action === 'ultimate_defense') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const udCd = ctx.st.mysticSkillCdUntil?.['l2_110'];
    if (typeof udCd === 'number' && Date.now() < udCd) {
      throw new Error('battle_skill_not_allowed');
    }
    const udDurationSec = ULTIMATE_DEFENSE_BUFF_DURATION_SEC;
    return {
      mpCost: ultimateDefenseMpAtRank(rank) ?? stubMpForCanon('l2_110', rank),
      pDmg: 0,
      skillLine: ultimateDefenseSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 110, level: rank, action: 'add' },
      battleModsPatch: { ultimateDefenseImmobile: true },
      battleModsExpiresPatch: {
        ['110']: Date.now() + Math.floor(udDurationSec * 1000),
      },
    };
  }

  if (action === 'deflect_arrow') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_skill_not_allowed');
    }
    const daCd = ctx.st.mysticSkillCdUntil?.['l2_112'];
    if (typeof daCd === 'number' && Date.now() < daCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: deflectArrowMpAtRank(rank) ?? stubMpForCanon('l2_112', rank),
      pDmg: 0,
      skillLine: deflectArrowSkillLineUk(rank),
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 112, level: rank, action: 'add' },
    };
  }

  if (action === 'shield_stun') {
    return resolveShieldStunTurn(ctx);
  }

  if (action === 'shield_slam') {
    return resolveShieldSlamTurn(ctx);
  }

  if (action === 'stun_attack') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'blunt' && ctx.weaponKind !== 'bigblunt') {
      throw new Error('battle_skill_not_allowed');
    }
    const sa =
      l2dopXmlMpPower(100, rank) ?? stunAttackMpAndPower(preLevel, rank);
    if (!sa) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.06 + sa.power / 480) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    return {
      mpCost: sa.mp,
      pDmg: r.damage,
      skillLine: 'Приголомшувальний удар (100, Stun Attack).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'wild_sweep') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ws =
      l2dopXmlMpPower(245, rank) ?? wildSweepMpAndPower(preLevel, rank);
    if (!ws) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.1 + ws.power / 700) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ws.mp,
      pDmg: r.damage,
      skillLine: 'Дикий розмах (Wild Sweep): power ' + ws.power + '.',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power_smash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    const sm =
      l2dopXmlMpPower(255, rank) ?? powerSmashMpAndPower(preLevel, rank);
    if (!sm) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.08 + sm.power / 470) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: sm.mp,
      pDmg: r.damage,
      skillLine: 'Розгром (255, Power Smash).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'whirlwind') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ww =
      l2dopXmlMpPower(36, rank) ?? whirlwindMpAndPower(preLevel, rank);
    if (!ww) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.1 + ww.power / 700) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: ww.mp,
      pDmg: r.damage,
      skillLine:
        'Вихор (Whirlwind): power ' + ww.power + '; до 4 цілей (головна + 3 поруч).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'thunder_storm') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    const ts =
      l2dopXmlMpPower(48, rank) ?? thunderStormMpAndPower(preLevel, rank);
    if (!ts) throw new Error('battle_skill_not_allowed');
    const atk = Math.floor(combat.pAtk * (1.12 + ts.power / 250) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const baseStunPct = Math.min(
      THUNDER_STORM_STUN_CHANCE_CAP_PCT,
      THUNDER_STORM_BASE_STUN_CHANCE_PCT +
        Math.max(1, rank) * THUNDER_STORM_STUN_PER_RANK_PCT
    );
    const effStunPct = scaleLandChancePercentAfterResist(
      baseStunPct,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedStun =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effStunPct;
    return {
      mpCost: ts.mp,
      pDmg: r.damage,
      skillLine:
        'Грозова буря (Thunder Storm): power ' +
        ts.power +
        '; до 4 цілей (головна + 3 поруч)' +
        (appliedStun
          ? '; ціль шоковано (~' + Math.round(effStunPct) + '%).'
          : '; шок не спрацював (~' + Math.round(effStunPct) + '%).'),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedStun ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'provoke') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 286)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!spawnAllowsProvokeAggro(ctx.spawnKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    const mp = provokeMpAtRank(rank);
    const poleCut = provokePoleResistCutPctAtRank(rank);
    const durSec = provokeDurationSecAtRank(rank);
    const cdPatches = legacyBuffCdAndExpirePatches(286, ctx);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Провокація (Provoke): агро мобів і РБ у радіусі; епіки не зачіпає.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPoleResistCutPct: poleCut },
      battleModsExpiresPatch: {
        '286': Date.now() + Math.floor(durSec * 1000),
      },
      ...(cdPatches.mysticSkillCdUntilPatch
        ? { mysticSkillCdUntilPatch: cdPatches.mysticSkillCdUntilPatch }
        : {}),
    };
  }
  return undefined;
}
