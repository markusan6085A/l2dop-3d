/**
 * Human fighter turn — стійки та l2_94 / l2_176 / l2_139 (ланцюг з resolveHumanFighterTurnCore).
 */
import {
  isStanceAccuracyActive,
  isStanceParryActive,
  isStanceViciousActive,
  type BattleBattleMods,
} from '../battle.js';
import type { BattleSkillTurnResult } from './types.js';
import { fighterCatalogEntryForRace } from '../../data/fighterSkillCatalog.byRace.js';
import {
  L2DOP_FRENZY,
  L2DOP_FRENZY2HS,
  L2DOP_FRENZY2HSACC,
  l2dopTableAt,
} from '../../data/l2dopRawdataBuffTables.js';
import { skillCooldownReadyAtMs } from '../../data/skillCooldowns.js';
import { isTwoHandHeavyWeaponType } from '../../data/weaponTypeContract.js';

import {
  catalogAllowsFighterAction,
  legacyBuffExpiresPatch,
  legacyBuffOnCd,
  requireCatalogEntryForAction,
  skillRankForCurrentAction,
  stubMpForCanon,
  warlordBranchProfession,
} from './humanFighterTurnHelpers.js';
import { buildRiposteStanceToggleTurn } from '../riposteStance.js';
import {
  focusAttackAccuracyFlat,
  focusAttackCritDamagePct,
  viciousStanceRankFromLearnedMap,
} from '../../data/l2dopFocusAttack.js';
import { ACCURACY_STANCE_MP_ACTIVATION } from '../../data/accuracyStanceTables.js';
import type { FighterTurnCoreArgs } from './humanFighterTurnCoreArgs.js';

export function tryResolveHumanFighterTurnStances(a: FighterTurnCoreArgs): BattleSkillTurnResult | undefined {
  const { ctx, action, l2Profession } = a;
  if (action === 'accuracy_stance') {
    const on = isStanceAccuracyActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Точність (Accuracy) вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceAccuracy: false },
      };
    }
    return {
      mpCost: ACCURACY_STANCE_MP_ACTIVATION,
      pDmg: 0,
      skillLine:
        'Точність (Accuracy): +3 Accuracy, поки аура увімкнена (~0.2 MP/с).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { stanceAccuracy: true },
    };
  }

  if (action === 'vicious_stance') {
    const on = isStanceViciousActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Жорстка стійка вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceVicious: false },
      };
    }
    const rank = viciousStanceRankFromLearnedMap(ctx.learnedSkillLevelByBattleId);
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Жорстка стійка: крит і сила криту за даними text-rpg (toggle 312).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        stanceVicious: true,
        viciousStanceSkillRank: rank,
      },
    };
  }

  if (action === 'parry_stance') {
    const on = isStanceParryActive(ctx.st.battleMods);
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Стійка парування вимкнена.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { stanceParry: false },
      };
    }
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Стійка парування: P.Def / M.Def, нижча точність і швидкість атаки (toggle 339, text-rpg).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { stanceParry: true },
    };
  }

  if (action === 'riposte_stance') {
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
    return buildRiposteStanceToggleTurn(ctx, skillRankForCurrentAction(ctx));
  }

  if (action === 'focus_attack') {
    if (!warlordBranchProfession(String(l2Profession))) {
      throw new Error('battle_skill_not_allowed');
    }
    if (ctx.weaponKind !== 'pole') {
      throw new Error('battle_skill_not_allowed');
    }
    requireCatalogEntryForAction(action, String(l2Profession));
    const rank = skillRankForCurrentAction(ctx);
    const on = ctx.st.battleMods?.focusAttackActive === true;
    if (on) {
      return {
        mpCost: 0,
        pDmg: 0,
        skillLine: 'Зосереджений удар (Focus Attack) вимкнено.',
        physOutcome: null,
        magicOutcome: null,
        battleModsPatch: { focusAttackActive: false },
      };
    }
    const acc = focusAttackAccuracyFlat(rank);
    const critPct = focusAttackCritDamagePct(rank);
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine:
        'Зосереджений удар: +' +
        acc +
        ' точності, +' +
        critPct +
        '% сила криту (1 ціль, спис/алебарда).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { focusAttackActive: true },
    };
  }

  if (action === 'l2_94') {
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
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_94');
    const row =
      ent?.levels?.find((l: { level: number }) => l.level === rank) ?? ent?.levels?.[0];
    const patkPct = row?.power ?? 55;
    const RAGE_PATK_MUL = 1 + Math.max(0, patkPct) / 100;
    const RAGE_PDEF_MUL = 0.88;
    if (legacyBuffOnCd(ctx, 94)) {
      throw new Error('battle_skill_not_allowed');
    }
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_94', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const expPatch = legacyBuffExpiresPatch(94);
    return {
      mpCost,
      pDmg: 0,
      skillLine: 'Rage: сильніший фіз. удар; захист трохи нижчий.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        rageBattlePatkMul: RAGE_PATK_MUL,
        rageBattlePdefMul: RAGE_PDEF_MUL,
      },
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_94: skillCooldownReadyAtMs(now, cdSec) } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  if (action === 'l2_176') {
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
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_176');
    const row =
      ent?.levels?.find((l: { level: number }) => l.level === rank) ?? ent?.levels?.[0];
    const maxHp = ctx.playerMaxHpInBattle;
    const hp = ctx.playerHpInBattle;
    const prof = String(l2Profession || '').trim();
    /**
     * Запит по геймплею: для Destroyer (2 профа) Frenzy має бути активним
     * без low-HP gate. Для інших професій лишаємо класичний поріг (~30% HP).
     */
    const bypassLowHpGate = prof === 'orc_destroyer';
    if (!bypassLowHpGate && maxHp > 0 && hp / maxHp > 0.3 + 1e-9) {
      throw new Error('battle_frenzy_need_low_hp');
    }
    if (legacyBuffOnCd(ctx, 176)) {
      throw new Error('battle_skill_not_allowed');
    }
    const twoH = isTwoHandHeavyWeaponType(ctx.weaponKind);
    const patkMul = twoH
      ? l2dopTableAt(L2DOP_FRENZY2HS, rank)
      : l2dopTableAt(L2DOP_FRENZY, rank);
    const accFlat = twoH ? l2dopTableAt(L2DOP_FRENZY2HSACC, rank) : 0;
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_176', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const patch: Partial<BattleBattleMods> = { frenzyBattlePatkMul: patkMul };
    if (accFlat > 0) {
      patch.frenzyBattleAccFlat = Math.floor(accFlat);
    }
    const expPatch = legacyBuffExpiresPatch(176);
    return {
      mpCost,
      pDmg: 0,
      skillLine:
        'Frenzy: різко сильніший фіз. удар (як у L2, лише при низькому HP).',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: patch,
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_176: skillCooldownReadyAtMs(now, cdSec) } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }

  if (action === 'l2_139') {
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
    const rank = skillRankForCurrentAction(ctx);
    const ent = fighterCatalogEntryForRace(ctx.race, ctx.classBranch, 'l2_139');
    const row =
      ent?.levels?.find((l: { level: number }) => l.level === rank) ?? ent?.levels?.[0];
    if (legacyBuffOnCd(ctx, 139)) {
      throw new Error('battle_skill_not_allowed');
    }
    const pow = row?.power ?? 2;
    const GUTS_PDEF_MUL = 1 + Math.max(0, pow) / 100;
    const mpCost = row?.mpCost ?? stubMpForCanon('l2_139', rank);
    const cdSec =
      typeof ent?.cooldownSec === 'number' && ent.cooldownSec > 0
        ? ent.cooldownSec
        : undefined;
    const now = Date.now();
    const expPatch = legacyBuffExpiresPatch(139);
    return {
      mpCost,
      pDmg: 0,
      skillLine: 'Guts: міцніший захист.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: { gutsBattlePdefMul: GUTS_PDEF_MUL },
      ...(cdSec != null
        ? { mysticSkillCdUntilPatch: { l2_139: skillCooldownReadyAtMs(now, cdSec) } }
        : {}),
      ...(expPatch ? { battleModsExpiresPatch: expPatch } : {}),
    };
  }
  return undefined;
}
