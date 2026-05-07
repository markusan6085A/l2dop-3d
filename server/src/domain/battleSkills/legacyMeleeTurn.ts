/**
 * Спрощений набір дій для не-людина-воїна (attack / power / bolt / stun).
 */
import type {
  BattleSkillResolveContext,
  BattleSkillTurnResult,
  MagicBoltRollFn,
  PhysicalRollFn,
} from './types.js';

export function resolveLegacyMeleeTurn(
  ctx: BattleSkillResolveContext,
  rollPhys: PhysicalRollFn,
  rollBolt: MagicBoltRollFn
): BattleSkillTurnResult {
  const { action, combat } = ctx;

  if (action === 'attack') {
    const r = rollPhys(combat.pAtk);
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'power') {
    const r = rollPhys(Math.floor(combat.pAtk * 1.14));
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  if (action === 'bolt') {
    const r = rollBolt();
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: null,
      magicOutcome: r.outcome,
    };
  }

  if (action === 'stun') {
    const r = rollPhys(Math.floor(combat.pAtk * 0.95));
    return {
      mpCost: 0,
      pDmg: r.damage,
      skillLine: '',
      physOutcome: r.outcome,
      magicOutcome: null,
      ...(r.weaknessLogLineUk
        ? { weaknessLogLineUk: r.weaknessLogLineUk }
        : {}),
    };
  }

  throw new Error('battle_skill_not_allowed');
}
