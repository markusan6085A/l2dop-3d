/**
 * Human fighter turn — детекти слабкості, Howl, Hammer, Shock Blast (ланцюг з resolveHumanFighterTurnCore).
 */
import { jsonFiniteNum } from '../battle.js';
import { ZEALOT_EFFECT_DURATION_MS } from '../battleTypes.js';
import type { BattleSkillTurnResult } from './types.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import {
  mobMaxCpFromMobMaxHp,
  wrathCpDrainPercentForSkillLevel,
} from '../../data/wrathSkillConstants.js';
import {
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';

import { SHOCK_BLAST_PDEF_DEBUFF_MS } from './humanFighterTurnConstants.js';
import {
  EARTHQUAKE_BASE_STUN_CHANCE_PCT,
  EARTHQUAKE_STUN_CHANCE_CAP_PCT,
  EARTHQUAKE_STUN_PER_RANK_PCT,
  SHOCK_STOMP_BASE_STUN_CHANCE_PCT,
  SHOCK_STOMP_STUN_CHANCE_CAP_PCT,
  SHOCK_STOMP_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  assertSkillCooldownReady,
  catalogAllowsFighterAction,
  legacyBuffCdAndExpirePatches,
  legacyBuffOnCd,
  requireCatalogEntryForAction,
  stubMpForCanon,
  warlordBranchProfession,
  warlordOrGladiatorTier2,
  warriorProfOkForSkill,
} from './humanFighterTurnHelpers.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';

export function tryResolveHumanFighterTurnDetections(a: FighterTurnCoreArgs): BattleSkillTurnResult | undefined {
  const { ctx, rollPhys, action, combat, l2Profession, profM, rank } = a;
  if (action === 'detect_insect_weakness') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 75)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_75', rank),
      pDmg: 0,
      skillLine:
        'Вразливість комах: +30% P.Atk проти комах (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'insect', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(75, ctx),
    };
  }

  if (action === 'detect_monster_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 80)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_80', rank),
      pDmg: 0,
      skillLine:
        'Вразливість монстрів: +30% P.Atk проти монстрів (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'monster', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(80, ctx),
    };
  }

  if (action === 'detect_animal_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 87)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_87', rank),
      pDmg: 0,
      skillLine: 'Вразливість звірів: +30% P.Atk проти тварин (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'animal', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(87, ctx),
    };
  }

  if (action === 'detect_dragon_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 88)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_88', rank),
      pDmg: 0,
      skillLine: 'Вразливість драконів: +30% P.Atk проти драконів (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'dragon', weaknessPatkMul: 1.35 },
      ...legacyBuffCdAndExpirePatches(88, ctx),
    };
  }

  if (action === 'detect_plant_weakness') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 104)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_104', rank),
      pDmg: 0,
      skillLine:
        'Вразливість рослин (Plant): +30% P.Atk на 10 хв.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'plant', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(104, ctx),
    };
  }

  if (action === 'howl') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 116)) {
      throw new Error('battle_skill_not_allowed');
    }
    const HOWL_MOB_PATK = 0.77;
    return {
      mpCost: stubMpForCanon('l2_116', rank),
      pDmg: 0,
      skillLine: 'Звіриний рев: слабший удар моба (~−23% його P.Atk), 120 с.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: HOWL_MOB_PATK },
      ...legacyBuffCdAndExpirePatches(116, ctx),
    };
  }

  if (action === 'thrill_fight') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Не-тогл: повторне натискання оновлює тривалість. КД блокує refresh.
     */
    const tfCd = ctx.st.mysticSkillCdUntil?.['l2_130'];
    if (typeof tfCd === 'number' && Date.now() < tfCd) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_130', rank),
      pDmg: 0,
      skillLine:
        'Азарт бою: +ASPD (L2 Interlude тривалість).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 130, level: rank, action: 'add' },
    };
  }

  if (action === 'zealot') {
    if (
      !catalogAllowsFighterAction(
        action,
        String(l2Profession),
        ctx.race,
        ctx.classBranch
      )
    ) {
      throw new Error('battle_zealot_wrong_class');
    }
    const ZEALOT_ASPD = [1.1, 1.2, 1.3] as const;
    const ZEALOT_RUN = [10, 20, 30] as const;
    const ZEALOT_ACC = 6;
    const ZEALOT_CRIT_ADD = [33, 66, 100] as const;
    const ZEALOT_CRIT_DMG = [1.33, 1.66, 2.0] as const;
    const ZEALOT_HP_COST = [159, 183, 204] as const;
    const idx = Math.min(ZEALOT_ASPD.length - 1, Math.max(0, rank - 1));
    const zealCdUntil = jsonFiniteNum(ctx.st.mysticSkillCdUntil?.['l2_420']);
    if (
      zealCdUntil !== undefined &&
      Number.isFinite(zealCdUntil) &&
      Date.now() < zealCdUntil
    ) {
      throw new Error('battle_zealot_cooldown');
    }
    const maxH = Math.max(1, ctx.playerMaxHpInBattle);
    if (ctx.playerHpInBattle > maxH * 0.3 + 1e-6) {
      throw new Error('battle_zealot_need_low_hp');
    }
    const zealEntry = fighterCatalogEntryForRace(
      ctx.race,
      ctx.classBranch,
      'l2_420'
    );
    const zealCdSec =
      typeof zealEntry?.cooldownSec === 'number' && zealEntry.cooldownSec > 0
        ? zealEntry.cooldownSec
        : 900;
    const now = Date.now();
    return {
      mpCost: stubMpForCanon('l2_420', rank),
      pDmg: 0,
      skillLine:
        'Zealot: бойовий стан (~' +
        Math.round(ZEALOT_EFFECT_DURATION_MS / 1000) +
        ' с), HP ≤ 30%, витрата HP.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        zealotAspdMul: ZEALOT_ASPD[idx]!,
        zealotRunSpeedFlat: ZEALOT_RUN[idx]!,
        zealotAccuracyFlat: ZEALOT_ACC,
        zealotCritRateAdd: ZEALOT_CRIT_ADD[idx]!,
        zealotCritDmgMul: ZEALOT_CRIT_DMG[idx]!,
        zealotUntilMs: now + ZEALOT_EFFECT_DURATION_MS,
      },
      playerHpCost: ZEALOT_HP_COST[idx]!,
      mysticSkillCdUntilPatch: { l2_420: now + zealCdSec * 1000 },
    };
  }

  if (action === 'revival') {
    if (!warlordOrGladiatorTier2(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const maxH = Math.max(1, ctx.playerMaxHpInBattle);
    if (ctx.playerHpInBattle > maxH * 0.1) {
      throw new Error('battle_skill_not_allowed');
    }
    const heal = Math.min(
      maxH - ctx.playerHpInBattle,
      Math.max(1, Math.floor(maxH * 0.85))
    );
    return {
      mpCost: stubMpForCanon('l2_181', rank),
      pDmg: 0,
      skillLine: 'Відродження: сильне зцілення.',
      physOutcome: null,
      magicOutcome: null,
      playerHeal: heal,
    };
  }

  if (action === 'lionheart') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cdUntil = ctx.st.mysticSkillCdUntil?.['l2_287'];
    assertSkillCooldownReady(cdUntil);
    return {
      mpCost: stubMpForCanon('l2_287', rank),
      pDmg: 0,
      skillLine:
        'Левине серце (Lionheart): +40% стійкості до шоку, сну, утримання та паралічу (60 с).',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 287, level: rank, action: 'add' },
    };
  }

  if (action === 'eye_hunter') {
    const ep = String(l2Profession).trim();
    if (ep !== 'human_dreadnought' && ep !== 'human_duelist') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 359)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_359', rank),
      pDmg: 0,
      skillLine:
        'Око мисливця: +30% P.Atk проти комах, рослин і тварин (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'eye_hunter', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(359, ctx),
    };
  }

  if (action === 'eye_slayer') {
    const ep = String(l2Profession).trim();
    if (ep !== 'human_dreadnought' && ep !== 'human_duelist') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 360)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_360', rank),
      pDmg: 0,
      skillLine:
        'Око вбивці: +30% P.Atk проти звірів, драконів, гігантів і магічних істот (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'eye_slayer', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(360, ctx),
    };
  }

  if (action === 'focus_attack') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Не-тогл: повторний каст оновлює `expiresAt` у `battleModsExpiresAtMsBySkillId["317"]`.
     * Поки активний CD (L2 Interlude: CD=12 с, duration=30 с) — refresh заблокований:
     * `legacyBuffOnCd` кидає `battle_skill_not_allowed`. `legacyBuffCdAndExpirePatches`
     * повертає одночасно CD і експірацію, CD персистимо через `mysticSkillCdUntilPatch`.
     */
    const cdUntil = ctx.st.mysticSkillCdUntil?.['l2_317'];
    assertSkillCooldownReady(cdUntil);
    return {
      mpCost: stubMpForCanon('l2_317', rank),
      pDmg: 0,
      skillLine: 'Точність древка зросла. Шанс критичного удару підвищено.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusAttackActive: true },
      ...legacyBuffCdAndExpirePatches(317, ctx),
    };
  }

  if (action === 'wrath') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(
      combat.pAtk * (1.12 + Math.min(rank, 10) * 0.015) * profM
    );
    const r = rollPhys(atk);
    const rankEff = Math.min(10, Math.max(1, rank));
    const cpPct = wrathCpDrainPercentForSkillLevel(rankEff);
    const mobMaxCp =
      ctx.st.mobMaxCp ?? mobMaxCpFromMobMaxHp(ctx.st.mobMaxHp);
    const mobCpBefore =
      ctx.st.mobCp !== undefined ? ctx.st.mobCp : mobMaxCp;
    const rawCpDrain = Math.floor(mobMaxCp * (cpPct / 100));
    const mobCpDrain = Math.min(
      Math.max(0, mobCpBefore),
      Math.max(0, rawCpDrain)
    );
    return {
      mpCost: stubMpForCanon('l2_320', rank),
      pDmg: r.damage,
      skillLine:
        'Гнів приголомшив ворогів поруч. ' +
        ctx.spawnMobName +
        ' втратив ' +
        mobCpDrain +
        ' CP.',
      physOutcome: r.outcome,
      magicOutcome: null,
      mobCpDrain,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'earthquake') {
    if (String(l2Profession).trim() !== 'human_dreadnought') {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(combat.pAtk * 1.18 * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const baseShockPct = Math.min(
      EARTHQUAKE_STUN_CHANCE_CAP_PCT,
      EARTHQUAKE_BASE_STUN_CHANCE_PCT +
        Math.max(1, rank) * EARTHQUAKE_STUN_PER_RANK_PCT
    );
    const effShockPct = scaleLandChancePercentAfterResist(
      baseShockPct,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedShock =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effShockPct;
    return {
      mpCost: stubMpForCanon('l2_347', rank),
      pDmg: r.damage,
      skillLine: appliedShock
        ? 'Землетрус (347, Earthquake): AoE-удар по площі, ціль шоковано (~' +
          Math.round(effShockPct) +
          '%).'
        : 'Землетрус (347, Earthquake): AoE-удар по площі; шок не спрацював (~' +
          Math.round(effShockPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedShock ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'shock_blast') {
    if (String(l2Profession).trim() !== 'human_dreadnought') {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const atk = Math.floor(combat.pAtk * 0.92 * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const baseShockPct = Math.min(
      SHOCK_STOMP_STUN_CHANCE_CAP_PCT,
      SHOCK_STOMP_BASE_STUN_CHANCE_PCT +
        Math.max(1, rank) * SHOCK_STOMP_STUN_PER_RANK_PCT
    );
    const effShockPct = scaleLandChancePercentAfterResist(
      baseShockPct,
      effectiveMobStunResistPct({
        level: ctx.spawnLevel,
        stunResistPct: ctx.spawnStunResistPct,
        debuffResistPct: ctx.spawnDebuffResistPct,
      })
    );
    const appliedShock =
      r.damage > 0 &&
      r.outcome !== 'miss' &&
      Math.random() * 100 < effShockPct;
    return {
      mpCost: stubMpForCanon('l2_361', rank),
      pDmg: r.damage,
      skillLine: appliedShock
        ? 'Ударний тупіт (361, Shock Stomp): контрольний AoE-удар, ціль шоковано (~' +
          Math.round(effShockPct) +
          '%).'
        : 'Ударний тупіт (361, Shock Stomp): контрольний AoE-удар; шок не спрацював (~' +
          Math.round(effShockPct) +
          '%).',
      physOutcome: r.outcome,
      magicOutcome: null,
      battleModsPatch: { mobTargetPDefMul: 0.88 },
      battleModsExpiresPatch: {
        '361': Date.now() + SHOCK_BLAST_PDEF_DEBUFF_MS,
      },
      ...(appliedShock ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }
  return undefined;
}
