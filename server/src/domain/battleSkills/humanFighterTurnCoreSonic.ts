/**
 * Human fighter turn — Gladiator / Duelist, sonic-заряди (ланцюг з resolveHumanFighterTurnCore).
 */
import {
  effectiveMobStunResistPct,
  scaleLandChancePercentAfterResist,
} from '../controlLandResist.js';
import type { BattleSkillTurnResult } from './types.js';
import { l2dopXmlMpPower } from '../../data/l2dopXmlSkillLevels.lookup.js';
import {
  SONIC_FOCUS_GAIN_PER_CAST,
  SONIC_MAX_CHARGES_DEFAULT,
} from '../sonicCharges.js';

import {
  HAMMER_CRUSH_BASE_STUN_CHANCE_PCT,
  HAMMER_CRUSH_STUN_CHANCE_CAP_PCT,
  HAMMER_CRUSH_STUN_PER_RANK_PCT,
} from './humanFighterTurnConstants.js';
import {
  dualSwordWeapon,
  gladiatorBranchProfession,
  legacyBuffCdAndExpirePatches,
  legacyBuffOnCd,
  requireCatalogEntryForAction,
  requireSonicChargeCost,
  sonicMasteryLifestealHeal,
  stubMpForCanon,
  swordOrBluntOrDualWeapon,
  swordOrBluntWeapon,
  warriorProfOkForSkill,
} from './humanFighterTurnHelpers.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';

export function tryResolveHumanFighterTurnSonic(a: FighterTurnCoreArgs): BattleSkillTurnResult | undefined {
  const { ctx, rollPhys, action, combat, l2Profession, profM, rank } = a;
  /* ============================================================
   * Gladiator / Duelist (гілка дуальних мечів + sonic-заряди).
   *
   * Джерела: l2db Interlude (gladiator) + text-rpg Skill_0001/0005/
   * 0006/0007/0008/0009/0190/0260/0261/0442/0451. Заряди Sonic Focus
   * (max 10, див. `SONIC_MAX_CHARGES_DEFAULT`) зберігаються в
   * `BattleJsonState.sonicCharges` / `WorldCombatState.sonicCharges` (через
   * F5/телепорт/вихід з бою), скидаються на смерть. Витрати — через
   * `SONIC_CHARGE_COST_BY_SKILL_ID`.
   * ============================================================ */

  if (action === 'triple_slash') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(1, rank)?.mp) ?? stubMpForCanon('l2_1', rank);
    const pow =
      (l2dopXmlMpPower(1, rank)?.power) ?? 431;
    const atk = Math.floor(combat.pAtk * (1.10 + pow / 520) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: 'Потрійний удар (1, Triple Slash).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_focus') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Sonic Focus (8): додає +1 заряд до ліміту `SONIC_MAX_CHARGES_DEFAULT`.
     * CD у каталозі = 0 с (миттєве накопичення), тому не блокуємо. Якщо вже
     * досягнуто ліміту — не змінюємо (дозволяємо гравцю перевірити візуально).
     */
    const mp =
      (l2dopXmlMpPower(8, rank)?.mp) ?? stubMpForCanon('l2_8', rank);
    const cur = ctx.st.sonicCharges ?? 0;
    const max =
      typeof ctx.st.maxSonicCharges === 'number' && ctx.st.maxSonicCharges > 0
        ? ctx.st.maxSonicCharges
        : SONIC_MAX_CHARGES_DEFAULT;
    if (cur >= max) {
      throw new Error('battle_sonic_max_charges');
    }
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Концентрація звуку: +' +
        SONIC_FOCUS_GAIN_PER_CAST +
        ' заряд Sonic Focus.',
      physOutcome: null,
      magicOutcome: null,
      sonicChargesPatch: {
        delta: SONIC_FOCUS_GAIN_PER_CAST,
        maxSet: SONIC_MAX_CHARGES_DEFAULT,
      },
    };
  }

  if (action === 'sonic_blaster') {
    if (!warriorProfOkForSkill(ctx)) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 6);
    const mp = (l2dopXmlMpPower(6, rank)?.mp) ?? stubMpForCanon('l2_6', rank);
    const pow = (l2dopXmlMpPower(6, rank)?.power) ?? 300;
    const atk = Math.floor(combat.pAtk * (1.09 + pow / 540) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 6, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звуковий залп (6, Sonic Blaster): −' + cost + ' заряд Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'double_sonic_slash') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 5);
    const mp = (l2dopXmlMpPower(5, rank)?.mp) ?? stubMpForCanon('l2_5', rank);
    const pow = (l2dopXmlMpPower(5, rank)?.power) ?? 450;
    const atk = Math.floor(combat.pAtk * (1.12 + pow / 500) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 5, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Подвійний звуковий удар (5, Double Sonic Slash): −' +
        cost +
        ' заряди.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_buster') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 9);
    const mp = (l2dopXmlMpPower(9, rank)?.mp) ?? stubMpForCanon('l2_9', rank);
    const pow = (l2dopXmlMpPower(9, rank)?.power) ?? 520;
    const atk = Math.floor(combat.pAtk * (1.13 + pow / 500) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 9, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звуковий розрив (9, Sonic Buster): −' + cost + ' заряд Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_storm') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntOrDualWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 7);
    const mp = (l2dopXmlMpPower(7, rank)?.mp) ?? stubMpForCanon('l2_7', rank);
    const pow = (l2dopXmlMpPower(7, rank)?.power) ?? 600;
    const atk = Math.floor(combat.pAtk * (1.15 + pow / 460) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 7, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Звукова буря (7, Sonic Storm): −' + cost + ' заряди Sonic Focus.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'triple_sonic_slash') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const cost = requireSonicChargeCost(ctx, 261);
    const mp =
      (l2dopXmlMpPower(261, rank)?.mp) ?? stubMpForCanon('l2_261', rank);
    const pow =
      (l2dopXmlMpPower(261, rank)?.power) ?? 720;
    const atk = Math.floor(combat.pAtk * (1.16 + pow / 460) * profM);
    const r = rollPhys(atk);
    const heal = sonicMasteryLifestealHeal(ctx, 261, r.damage);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine:
        'Потрійний звуковий удар (261, Triple Sonic Slash): −' +
        cost +
        ' заряди.',
      physOutcome: r.outcome,
      magicOutcome: null,
      sonicChargesPatch: { delta: -cost },
      ...(heal > 0 ? { playerHeal: heal } : {}),
      ...(heal > 0 ? { playerHealSourceUk: 'Sonic Mastery' } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'fatal_strike') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!swordOrBluntWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(190, rank)?.mp) ?? stubMpForCanon('l2_190', rank);
    const pow =
      (l2dopXmlMpPower(190, rank)?.power) ?? 540;
    const atk = Math.floor(combat.pAtk * (1.14 + pow / 460) * profM);
    const r = rollPhys(atk);
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: 'Фатальний удар (190, Fatal Strike).',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'hammer_crush') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'blunt' && ctx.weaponKind !== 'bigblunt') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const mp =
      (l2dopXmlMpPower(260, rank)?.mp) ?? stubMpForCanon('l2_260', rank);
    const pow =
      (l2dopXmlMpPower(260, rank)?.power) ?? 680;
    const atk = Math.floor(combat.pAtk * (1.17 + pow / 440) * profM);
    const r = rollPhys(atk, { forceNoMiss: true });
    const stunChancePct = Math.min(
      HAMMER_CRUSH_STUN_CHANCE_CAP_PCT,
      HAMMER_CRUSH_BASE_STUN_CHANCE_PCT + rank * HAMMER_CRUSH_STUN_PER_RANK_PCT
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
      r.outcome !== 'miss' &&
      r.damage > 0 &&
      Math.random() * 100 < effStunPct;
    return {
      mpCost: mp,
      pDmg: r.damage,
      skillLine: appliedStun
        ? 'Скрушний молот (260, Hammer Crush): ціль оглушено, контрудар пропущено.'
        : 'Скрушний молот (260, Hammer Crush): оглушення не спрацювало.',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(appliedStun ? { skipMobCounterAttackOnce: true } : {}),
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'sonic_move') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    /**
     * Self-buff +speed на 15 с (L2 Interlude). Refresh-on-recast через
     * `legacyBuffCdAndExpirePatches(451)`. CD 30 с блокує повторний каст
     * до закінчення — поведінка як інші self-бафи гілки.
     */
    if (legacyBuffOnCd(ctx, 451)) {
      throw new Error('battle_skill_not_allowed');
    }
    const mp =
      (l2dopXmlMpPower(451, rank)?.mp) ?? stubMpForCanon('l2_451', rank);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine: 'Звуковий ривок: +швидкість пересування (15 с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { dashRunSpeedFlat: 30 },
      ...legacyBuffCdAndExpirePatches(451),
    };
  }

  if (action === 'sonic_guard') {
    if (!gladiatorBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (!dualSwordWeapon(ctx.weaponKind)) {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    if (legacyBuffOnCd(ctx, 442)) {
      throw new Error('battle_skill_not_allowed');
    }
    /**
     * Sonic Guard: потребує 5 зарядів Sonic Focus, дає сильне зниження вхідної
     * фіз. урона на 10 с. Refresh-on-recast, CD 180 с.
     */
    const cost = requireSonicChargeCost(ctx, 442);
    const mp =
      (l2dopXmlMpPower(442, rank)?.mp) ?? stubMpForCanon('l2_442', rank);
    return {
      mpCost: mp,
      pDmg: 0,
      skillLine:
        'Звуковий захист: −30% вхідної фіз. урона (10 с). −' +
        cost +
        ' заряди Sonic Focus.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { sanctuaryIncomingPhysMul: 0.7 },
      sonicChargesPatch: { delta: -cost },
      ...legacyBuffCdAndExpirePatches(442),
    };
  }
  return undefined;
}
