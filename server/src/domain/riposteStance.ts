/**
 * Riposte Stance (340) — спільний toggle для Duelist / Grand Khavatari /
 * Fortune Seeker / Maestro. Стан у `battleMods.raceToggleRanks.l2_340`.
 */
import type { L2dopCombatBuffModifiers } from '../data/l2dopCombatBuffModifiers.js';
import type { BattleBattleMods } from './battleTypes.js';
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
} from './battleSkills/types.js';

export const RIPOSTE_STANCE_BATTLE_ID = 'l2_340';
export const RIPOSTE_STANCE_SKILL_ID = 340;
export const RIPOSTE_REFLECT_RATIO = 0.3;
export const RIPOSTE_REFLECT_PCT = 30;
export const RIPOSTE_RUN_SPEED_MUL = 0.9;
export const RIPOSTE_ATK_SPD_MUL = 0.8;
export const RIPOSTE_ACCURACY_FLAT = -4;

export function isRiposteStanceActive(
  mods: BattleBattleMods | undefined
): boolean {
  const r = mods?.raceToggleRanks?.[RIPOSTE_STANCE_BATTLE_ID];
  return typeof r === 'number' && Number.isFinite(r) && r >= 1;
}

export function riposteStanceCombatBuffDelta(): Partial<L2dopCombatBuffModifiers> {
  return {
    buffAspd: RIPOSTE_ATK_SPD_MUL,
    buffSpeed: RIPOSTE_RUN_SPEED_MUL,
    buffAcc: RIPOSTE_ACCURACY_FLAT,
  };
}

export function applyRiposteReflectToBattleMods(
  mods: BattleBattleMods
): void {
  if (isRiposteStanceActive(mods)) {
    mods.reflectDamageReturnRatio = RIPOSTE_REFLECT_RATIO;
  } else if (mods.reflectDamageReturnRatio === RIPOSTE_REFLECT_RATIO) {
    delete mods.reflectDamageReturnRatio;
  }
}

export function buildRiposteStanceToggleTurn(
  ctx: BattleSkillResolveContext,
  rank: number
): BattleSkillTurnResult {
  const prev = ctx.st.battleMods?.raceToggleRanks ?? {};
  const on = prev[RIPOSTE_STANCE_BATTLE_ID] != null;
  const effRank = Math.max(1, Math.floor(rank));
  if (on) {
    const nextRanks = { ...prev };
    delete nextRanks[RIPOSTE_STANCE_BATTLE_ID];
    return {
      mpCost: 0,
      pDmg: 0,
      skillLine: 'Стійка відбиття (Riposte Stance) вимкнена.',
      physOutcome: null,
      magicOutcome: null,
      battleModsPatch: {
        raceToggleRanks:
          Object.keys(nextRanks).length > 0 ? nextRanks : {},
        reflectDamageReturnRatio: 0,
      },
    };
  }
  return {
    mpCost: 0,
    pDmg: 0,
    skillLine:
      'Стійка відбиття: 30% відбиття ближнього урону; −20% швидкості атаки, −10% бігу, −4 точності; витрата MP.',
    physOutcome: null,
    magicOutcome: null,
    battleModsPatch: {
      raceToggleRanks: {
        ...prev,
        [RIPOSTE_STANCE_BATTLE_ID]: effRank,
      },
      reflectDamageReturnRatio: RIPOSTE_REFLECT_RATIO,
    },
  };
}
