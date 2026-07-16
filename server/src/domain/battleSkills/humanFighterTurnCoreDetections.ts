/**
 * Human fighter turn — детекти слабкості, Howl, Hammer, Shock Blast (ланцюг з resolveHumanFighterTurnCore).
 */
import { jsonFiniteNum, type BattleBattleMods } from '../battle.js';
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
import {
  EARTHQUAKE_SKILL_POWER,
  earthquakePhysAtkFromPower,
} from '../../data/earthquakeSkillConstants.js';
import { spawnBlocksHammerCrushStun } from '../../data/hammerCrushTables.js';
import { l2dopXmlMpPower } from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  SHOCK_BLAST_BASE_STUN_CHANCE_PCT,
  SHOCK_BLAST_DEF_DEBUFF_MUL,
  SHOCK_BLAST_SKILL_POWER,
  SHOCK_BLAST_STUN_DURATION_MS,
} from '../../data/shockBlastSkillConstants.js';

import {
  HOWL_MOB_PATK_DEBUFF_MUL,
} from '../battleWhirlwindExtras.js';
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
    if (!warlordBranchProfession(String(l2Profession))) {
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
        'Вразливість монстрів: +30% P.Atk проти Monster/Beast (10 хв).',
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
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 88)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: 30,
      pDmg: 0,
      skillLine: 'Вразливість драконів: +30% P.Atk проти Dragon (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'dragon', weaknessPatkMul: 1.3 },
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
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 116)) {
      throw new Error('battle_skill_not_allowed');
    }
    return {
      mpCost: stubMpForCanon('l2_116', rank),
      pDmg: 0,
      skillLine:
        'Звіриний рев (Howl): −23% P.Atk ворогів у радіусі бою на 30 с.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { mobPatkDebuffMul: HOWL_MOB_PATK_DEBUFF_MUL },
      ...legacyBuffCdAndExpirePatches(116, ctx),
    };
  }

  if (action === 'thrill_fight') {
    if (!warlordBranchProfession(String(l2Profession))) {
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
    const tfRank = Math.max(1, Math.min(2, Math.floor(rank)));
    const aspdPct = tfRank >= 2 ? 10 : 5;
    return {
      mpCost: stubMpForCanon('l2_130', tfRank),
      pDmg: 0,
      skillLine:
        'Азарт бою (Thrill Fight): −20% Run Speed; +' +
        aspdPct +
        '% Attack Speed; 5 хв.',
      physOutcome: null,
      magicOutcome: null,
      activeBuffPatch: { skillId: 130, level: tfRank, action: 'add' },
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
        'Око мисливця: +30% P.Atk проти Animal, Plant та Insect (10 хв).',
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
        'Око вбивці (Eye of the Slayer): +30% P.Atk проти Beast, Magic Creature, Giant та Dragon (10 хв).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { weaknessKind: 'eye_slayer', weaknessPatkMul: 1.3 },
      ...legacyBuffCdAndExpirePatches(360, ctx),
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
    const eq =
      l2dopXmlMpPower(347, rank) ?? { mp: 87, power: EARTHQUAKE_SKILL_POWER };
    const atk = earthquakePhysAtkFromPower(combat.pAtk, eq.power, profM);
    const r = rollPhys(atk);
    const landed = r.damage > 0 && r.outcome !== 'miss';
    return {
      mpCost: eq.mp,
      pDmg: r.damage,
      skillLine:
        'Землетрус (Earthquake): сила ' +
        eq.power +
        ', r≈150 навколо себе' +
        (landed ? '; цілі втратили таргет.' : '.'),
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(landed
        ? {
            skipMobCounterAttackOnce: true,
            mobRetaliationDelayHits: 2,
          }
        : {}),
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
    const sb =
      l2dopXmlMpPower(361, rank) ?? {
        mp: 53,
        power: SHOCK_BLAST_SKILL_POWER,
      };
    const atk = earthquakePhysAtkFromPower(combat.pAtk, sb.power, profM);
    const r = rollPhys(atk);
    const landed = r.damage > 0 && r.outcome !== 'miss';
    const stunBlocked = spawnBlocksHammerCrushStun(ctx.spawnKind);
    let appliedStun = false;
    let battleModsPatch: Partial<BattleBattleMods> | undefined;
    let battleModsExpiresPatch: Record<string, number> | undefined;

    if (landed && !stunBlocked) {
      const effStunPct = scaleLandChancePercentAfterResist(
        SHOCK_BLAST_BASE_STUN_CHANCE_PCT,
        effectiveMobStunResistPct({
          level: ctx.spawnLevel,
          stunResistPct: ctx.spawnStunResistPct,
          debuffResistPct: ctx.spawnDebuffResistPct,
        })
      );
      appliedStun = Math.random() * 100 < effStunPct;
      if (appliedStun) {
        const until = Date.now() + SHOCK_BLAST_STUN_DURATION_MS;
        battleModsPatch = {
          mobStunUntilMs: until,
          mobStunIconSkillId: 361,
          mobTargetPDefMul: SHOCK_BLAST_DEF_DEBUFF_MUL,
          mobTargetMDefMul: SHOCK_BLAST_DEF_DEBUFF_MUL,
          mobTargetPDefDebuffIconSkillId: 361,
          mobTargetMDefDebuffIconSkillId: 361,
        };
        battleModsExpiresPatch = { '361': until };
      }
    }

    let skillLine =
      'Ударний імпульс (Shock Blast): сила ' +
      sb.power +
      ', r≈150 навколо цілі';
    if (stunBlocked && landed) {
      skillLine += '; урон завдано, стун не діє на РБ/епіків.';
    } else if (appliedStun) {
      skillLine += '; ціль оглушена ~9 с (−30% P.Def/M.Def, таргет знято).';
    } else if (landed) {
      skillLine += '; стун не спрацював, таргет знято.';
    } else {
      skillLine += '.';
    }

    return {
      mpCost: sb.mp,
      pDmg: r.damage,
      skillLine,
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(battleModsPatch ? { battleModsPatch } : {}),
      ...(battleModsExpiresPatch ? { battleModsExpiresPatch } : {}),
      ...(landed
        ? {
            skipMobCounterAttackOnce: true,
            mobRetaliationDelayHits: 2,
          }
        : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }
  return undefined;
}
