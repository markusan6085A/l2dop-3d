/**
 * Human fighter turn — базові удари, лук, War Cry, Dash, Roar, POLE/мечі до Provoke (ланцюг з resolveHumanFighterTurnCore).
 */
import {
  burstShotMpAndPower,
  doubleShotMpAndPower,
  mortalBlowMpAndPower,
  powerShotMpAndPower,
  powerSmashMpAndPower,
  powerStrikeMpAndPower,
  provokeMpAndPower,
  stunAttackMpAndPower,
  stunShotMpAndPower,
  thunderStormMpAndPower,
  wildSweepMpAndPower,
  whirlwindMpAndPower,
} from '../../data/l2dopHumanFighterBattleSkills.js';
import {
  effectiveMobDebuffResistPct,
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import type { BattleSkillTurnResult } from './types.js';
import {
  l2dopXmlMpPower,
  l2dopXmlSkillRow,
} from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  HAMSTRING_SHOT_BASE_CONTROL_CHANCE_PCT,
  HAMSTRING_SHOT_CONTROL_CHANCE_CAP_PCT,
  HAMSTRING_SHOT_CONTROL_PER_RANK_PCT,
  STUN_SHOT_BASE_STUN_CHANCE_PCT,
  STUN_SHOT_STUN_CHANCE_CAP_PCT,
  STUN_SHOT_STUN_PER_RANK_PCT,
  THUNDER_STORM_BASE_STUN_CHANCE_PCT,
  THUNDER_STORM_STUN_CHANCE_CAP_PCT,
  THUNDER_STORM_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  legacyBuffCdAndExpirePatches,
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
      l2dopXmlMpPower(19, rank) ?? doubleShotMpAndPower(preLevel, rank);
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
      l2dopXmlMpPower(24, rank) ?? burstShotMpAndPower(preLevel, rank);
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
    return {
      mpCost: wcRow?.m ?? 10,
      pDmg: 0,
      skillLine:
        'Бойовий клич (War Cry): +фіз. урон (L2 Interlude тривалість).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 78, level: rank, action: 'add' },
    };
  }

  if (action === 'dash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 4)) {
      throw new Error('battle_skill_not_allowed');
    }
    const DASH_MP = [10, 21] as const;
    const DASH_RUN_FLAT = [40, 66] as const;
    const r = Math.min(Math.max(1, rank), DASH_MP.length);
    const idx = r - 1;
    const dashRow = l2dopXmlSkillRow(4, rank);
    return {
      mpCost: dashRow?.m ?? DASH_MP[idx]!,
      pDmg: 0,
      skillLine:
        'Ривок (Dash): бонус до швидкості пересування в цьому бою (+' +
        (dashRow?.s ?? DASH_RUN_FLAT[idx]) +
        ').',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        dashRunSpeedFlat: dashRow?.s ?? DASH_RUN_FLAT[idx]!,
      },
      ...legacyBuffCdAndExpirePatches(4),
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
    const rapidRow = l2dopXmlSkillRow(99, rank);
    const RAPID_MP = rapidRow?.m ?? (rank >= 2 ? 20 : 14);
    const RAPID_MUL = rapidRow?.r ?? (rank >= 2 ? 1.12 : 1.08);
    return {
      mpCost: RAPID_MP,
      pDmg: 0,
      skillLine:
        'Швидкий постріл (Rapid Shot): вища швидкість атаки з луком.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { rapidShotAspdMul: RAPID_MUL },
      ...legacyBuffCdAndExpirePatches(99),
    };
  }

  if (action === 'snipe') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    if (legacyBuffOnCd(ctx, 313)) {
      throw new Error('battle_skill_not_allowed');
    }
    const SNIPE_MP = [28, 29, 30, 31, 32, 33, 34, 34] as const;
    const SNIPE_POW = [124, 134, 145, 155, 166, 177, 188, 199] as const;
    const idx = Math.min(Math.max(1, rank), SNIPE_MP.length) - 1;
    const snipeRow = l2dopXmlSkillRow(313, rank);
    const pow = snipeRow?.a ?? SNIPE_POW[idx]!;
    return {
      mpCost: snipeRow?.m ?? SNIPE_MP[idx]!,
      pDmg: 0,
      skillLine:
        'Точний постріл (Snipe): бонус до точності, P.Atk і криту.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        snipePatkFlat: pow,
        snipeAccuracyFlat: pow,
        snipeCritRateAdd: 20,
      },
      ...legacyBuffCdAndExpirePatches(313),
    };
  }

  if (action === 'stun_shot') {
    requireCatalogEntryForAction(action, String(l2Profession));
    if (ctx.weaponKind !== 'bow') {
      throw new Error('battle_skill_not_allowed');
    }
    const ss =
      l2dopXmlMpPower(101, rank) ?? stunShotMpAndPower(rank);
    const atk = Math.floor(combat.pAtk * (1.07 + ss.power / 420) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const stunChancePct = Math.min(
      STUN_SHOT_STUN_CHANCE_CAP_PCT,
      STUN_SHOT_BASE_STUN_CHANCE_PCT + rank * STUN_SHOT_STUN_PER_RANK_PCT
    );
    const effStunPct = scaleLandChancePercentAfterResist(
      stunChancePct,
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
      mpCost: ss.mp,
      pDmg: r.damage,
      skillLine: appliedStun
        ? 'Оглушливий постріл (101, Stun Shot): ціль оглушено (~' +
          Math.round(effStunPct) +
          '%).'
        : 'Оглушливий постріл (101, Stun Shot): оглушення не спрацювало (~' +
          Math.round(effStunPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedStun ? { skipMobCounterAttackOnce: true } : {}),
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
    const lethalXml = l2dopXmlMpPower(343, rank);
    const LETHAL_MP = lethalXml?.mp ?? 170;
    const LETHAL_POW = lethalXml?.power ?? 5132;
    const atk = Math.floor(
      combat.pAtk * (1.28 + LETHAL_POW / 2200) * profM
    );
    const r = rollPhys(atk);
    return {
      mpCost: LETHAL_MP,
      pDmg: r.damage,
      skillLine: 'Смертельний постріл (343, Lethal Shot).',
      physOutcome: r.outcome,
      magicOutcome: null,
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
    const hamXml = l2dopXmlMpPower(354, rank);
    const HS_MP = hamXml?.mp ?? 86;
    const HS_POW = hamXml?.power ?? 1973;
    const atk = Math.floor(combat.pAtk * (1.12 + HS_POW / 480) * profM);
    const r = rollPhys(atk);
    const controlChancePct = Math.min(
      HAMSTRING_SHOT_CONTROL_CHANCE_CAP_PCT,
      HAMSTRING_SHOT_BASE_CONTROL_CHANCE_PCT +
        rank * HAMSTRING_SHOT_CONTROL_PER_RANK_PCT
    );
    const effControlPct = scaleLandChancePercentAfterResist(
      controlChancePct,
      effectiveMobDebuffResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedControl =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effControlPct;
    return {
      mpCost: HS_MP,
      pDmg: r.damage,
      skillLine: appliedControl
        ? 'Постріл у сухожилля (354, Hamstring Shot): ціль сповільнено (~' +
          Math.round(effControlPct) +
          '%).'
        : 'Постріл у сухожилля (354, Hamstring Shot): сповільнення не спрацювало (~' +
          Math.round(effControlPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedControl ? { skipMobCounterAttackOnce: true } : {}),
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
      skillLine:
        'Бойовий рик (Battle Roar): +Max HP і миттєвий хіл (L2 Interlude).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 121, level: rank, action: 'add' },
    };
  }

  if (action === 'stun_attack') {
    if (!warriorProfOkForSkill(ctx)) {
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
      skillLine: 'Дикий розмах (245, Wild Sweep).',
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
      skillLine: 'Вихор розсік ворогів поруч.',
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
      skillLine: appliedStun
        ? 'Грозова буря (48, Thunder Storm): потужний AoE-вибух, ціль шоковано (~' +
          Math.round(effStunPct) +
          '%).'
        : 'Грозова буря (48, Thunder Storm): потужний AoE-вибух; шок не спрацював (~' +
          Math.round(effStunPct) +
          '%).',
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
    const pr =
      l2dopXmlMpPower(286, rank) ?? provokeMpAndPower(preLevel, rank);
    if (!pr) throw new Error('battle_skill_not_allowed');
    return {
      mpCost: pr.mp,
      pDmg: 0,
      skillLine: 'Масова провокація привернула ворогів поруч.',
      physOutcome: null,
      magicOutcome: null,
    };
  }
  return undefined;
}
