import type { computeCombatStats } from '../data/l2dopCombatFormulas.js';
import { effectiveMaxHpWithJewelFlat } from '../data/l2dopCombatFormulas.js';
import {
  applyClanHallPassiveFlat,
  type ClanHallBuffRow,
} from './clanHall.js';

/** Бойові стати + flat pAtk/mAtk/pDef/mDef від пасивного бонусу клан-холу. */
export function applyClanHallToCombatStats(
  combat: ReturnType<typeof computeCombatStats>,
  bonus: ClanHallBuffRow | null
): ReturnType<typeof computeCombatStats> {
  if (!bonus) return combat;
  const flat = applyClanHallPassiveFlat(
    {
      pAtk: combat.pAtk,
      mAtk: combat.mAtk,
      pDef: combat.pDef,
      mDef: combat.mDef,
      maxHp: 0,
    },
    bonus
  );
  return {
    ...combat,
    pAtk: flat.pAtk,
    mAtk: flat.mAtk,
    pDef: flat.pDef,
    mDef: flat.mDef,
  };
}

export type MaxHpChainResult = {
  maxHpJewel: number;
  maxHpWithoutClanHall: number;
  maxHpWithClanHall: number;
};

/**
 * Єдиний ланцюжок max HP: jewel → +flat клан-хол → battle roar / battleMods (через callback).
 */
export function computeMaxHpChain(args: {
  vitMaxHp: number;
  combat: Pick<
    ReturnType<typeof computeCombatStats>,
    'buffMaxHpMul' | 'jewelFlatMaxHp'
  >;
  clanHallBonus: ClanHallBuffRow | null;
  applyBattleRoar: (maxHpAfterJewelAndClanFlat: number) => number;
}): MaxHpChainResult {
  const maxHpJewel = effectiveMaxHpWithJewelFlat(args.vitMaxHp, args.combat);
  const flatWithClan = maxHpJewel + (args.clanHallBonus?.maxHp ?? 0);
  return {
    maxHpJewel,
    maxHpWithoutClanHall: args.applyBattleRoar(maxHpJewel),
    maxHpWithClanHall: args.applyBattleRoar(flatWithClan),
  };
}

/**
 * Поточне HP з урахуванням пасивного +maxHp клан-холу:
 * якщо в БД HP було на старому cap — підняти до нового (L2-style permanent max HP buff).
 */
export function resolveHpWithClanHallPassive(args: {
  storedHp: number;
  maxHpWithoutClanHall: number;
  maxHpWithClanHall: number;
  clanHallBonus: ClanHallBuffRow | null;
}): number {
  const stored = Math.max(0, Math.floor(args.storedHp));
  const maxWith = Math.max(1, Math.floor(args.maxHpWithClanHall));
  if (!args.clanHallBonus?.maxHp) {
    return Math.min(stored, maxWith);
  }
  const maxWithout = Math.max(1, Math.floor(args.maxHpWithoutClanHall));
  if (stored >= maxWithout) {
    return maxWith;
  }
  return Math.min(stored, maxWith);
}
